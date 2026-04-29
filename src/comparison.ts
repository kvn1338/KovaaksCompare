import type { KovaaksClient } from "./kovaaks-client.js";
import type { AppDatabase } from "./database.js";
import { scoreAtPercentile } from "./leaderboard.js";
import type {
  ResolvedScenario,
  ScenarioPairComparison,
  ScenarioSearchResult,
  ScoreMode,
  ScoreResult,
} from "./types.js";

export interface UserComparisonInput {
  player: string;
  sourceScenario: string;
  targetScenarios: string[];
  scoreMode: ScoreMode;
  maxPages?: number;
  db?: AppDatabase;
}

export interface UserComparisonOutput {
  player: string;
  scoreMode: ScoreMode;
  comparisons: ScenarioPairComparison[];
  warnings: string[];
}

export async function compareUserScenarios(
  client: KovaaksClient,
  input: UserComparisonInput,
): Promise<UserComparisonOutput> {
  const warnings: string[] = [];
  const source = await resolveScenario(client, input.sourceScenario);
  const targets = await Promise.all(input.targetScenarios.map((target) => resolveScenario(client, target)));

  const sourceScore = await getScore(client, {
    scenario: source,
    player: input.player,
    scoreMode: input.scoreMode,
    maxPages: input.maxPages,
  });

  const comparisons: ScenarioPairComparison[] = [];
  for (const target of targets) {
    const targetScore = await getScore(client, {
      scenario: target,
      player: input.player,
      scoreMode: input.scoreMode,
      maxPages: input.maxPages,
    });

    const pairWarnings = [
      ...scenarioWarnings("source", source),
      ...scenarioWarnings("target", target),
      ...sourceScore.warnings,
      ...targetScore.warnings,
    ];

    const equivalentTargetScore = await getEquivalentTargetScore(client, {
      targetLeaderboardId: target.leaderboardId,
      sourcePercentile: sourceScore.percentile,
      db: input.db,
    });

    comparisons.push({
      source,
      target,
      sourceScore,
      targetScore,
      equivalentTargetScore,
      interpretation: buildInterpretation(source, target, sourceScore, targetScore, equivalentTargetScore),
      warnings: pairWarnings,
    });
  }

  return { player: input.player, scoreMode: input.scoreMode, comparisons, warnings };
}

export async function resolveScenario(client: KovaaksClient, input: string): Promise<ResolvedScenario> {
  if (/^\d+$/.test(input.trim())) {
    return {
      input,
      leaderboardId: input.trim(),
      scenarioName: `leaderboard ${input.trim()}`,
      ambiguous: false,
      alternatives: [],
    };
  }

  const results = await client.searchScenarios(input);
  if (results.length === 0) {
    throw new Error(`No scenario matched "${input}". Try passing a leaderboard ID.`);
  }

  const exactMatches = results.filter((result) => result.scenarioName.toLowerCase() === input.toLowerCase());
  const chosen = exactMatches[0] ?? results[0];
  const ambiguous = exactMatches.length > 1 || (exactMatches.length === 0 && results.length > 1);

  return {
    input,
    leaderboardId: chosen.leaderboardId,
    scenarioName: chosen.scenarioName,
    ambiguous,
    alternatives: results,
  };
}

async function getScore(
  client: KovaaksClient,
  params: {
    scenario: ResolvedScenario;
    player: string;
    scoreMode: ScoreMode;
    maxPages?: number;
  },
): Promise<ScoreResult> {
  const warnings: string[] = [];

  const best = await client.getPlayerBestScore({
    leaderboardId: params.scenario.leaderboardId,
    scenarioName: params.scenario.scenarioName,
    player: params.player,
    maxPages: params.maxPages,
  });
  if (!best) {
    return {
      score: null,
      warnings: [
        `No best score found for ${params.player} in ${params.scenario.scenarioName}. ` +
          `The user scenario endpoint returned no usable record, and leaderboard fallback searched ${params.maxPages ?? 20} page(s).`,
      ],
    };
  }
  const total = await getLeaderboardTotal(client, params.scenario.leaderboardId);
  return {
    score: best.score,
    rank: best.rank,
    percentile: percentileFromRank(best.rank, total),
    warnings,
  };
}

async function getEquivalentTargetScore(
  client: KovaaksClient,
  params: { targetLeaderboardId: string; sourcePercentile?: number; db?: AppDatabase },
): Promise<number | undefined> {
  if (params.sourcePercentile === undefined) {
    return undefined;
  }

  if (params.db) {
    const metadata = params.db.getCollectionMetadata(params.targetLeaderboardId);
    if (metadata && metadata.complete) {
      const stored = params.db.getScores(params.targetLeaderboardId);
      const sorted = stored.map((entry) => entry.score).sort((a, b) => b - a);
      return scoreAtPercentile(sorted, params.sourcePercentile);
    }
  }

  const firstPage = await client.getLeaderboardScores({ leaderboardId: params.targetLeaderboardId, page: 0, max: 100 });
  if (firstPage.total <= 0) {
    return undefined;
  }

  const targetRank = Math.max(1, Math.ceil((1 - params.sourcePercentile / 100) * firstPage.total));
  const page = Math.floor((targetRank - 1) / firstPage.max);
  const targetPage = page === 0 ? firstPage : await client.getLeaderboardScores({
    leaderboardId: params.targetLeaderboardId,
    page,
    max: firstPage.max,
  });
  const index = (targetRank - 1) % targetPage.max;
  return targetPage.scores[index]?.score;
}

async function getLeaderboardTotal(client: KovaaksClient, leaderboardId: string): Promise<number | undefined> {
  const page = await client.getLeaderboardScores({ leaderboardId, page: 0, max: 1 });
  return page.total;
}

function percentileFromRank(rank: number | undefined, total: number | undefined): number | undefined {
  if (!rank || !total || total <= 1) {
    return undefined;
  }
  return Math.max(0, Math.min(100, 100 * (1 - (rank - 1) / total)));
}

export function percentileFromLeaderboardRank(rank: number | undefined, total: number | undefined): number | undefined {
  return percentileFromRank(rank, total);
}

function scenarioWarnings(label: string, scenario: ResolvedScenario): string[] {
  if (!scenario.ambiguous) {
    return [];
  }
  return [
    `${label} scenario "${scenario.input}" was ambiguous; using ${scenario.scenarioName} (${scenario.leaderboardId}). ` +
      `Top alternatives: ${formatAlternatives(scenario.alternatives)}.`,
  ];
}

function formatAlternatives(alternatives: ScenarioSearchResult[]): string {
  return alternatives
    .slice(0, 3)
    .map((item) => `${item.scenarioName} (${item.leaderboardId})`)
    .join(", ");
}

function buildInterpretation(
  source: ResolvedScenario,
  target: ResolvedScenario,
  sourceScore: ScoreResult,
  targetScore: ScoreResult,
  equivalentTargetScore: number | undefined,
): string[] {
  const lines: string[] = [];
  if (sourceScore.percentile !== undefined) {
    lines.push(
      `Player's ${source.scenarioName} score is around the ${sourceScore.percentile.toFixed(1)}th percentile.`,
    );
  }
  if (equivalentTargetScore !== undefined) {
    lines.push(
      `The equivalent percentile score in ${target.scenarioName} is approximately ${formatNumber(equivalentTargetScore)}.`,
    );
  }
  if (sourceScore.percentile !== undefined && targetScore.percentile !== undefined) {
    const delta = sourceScore.percentile - targetScore.percentile;
    if (Math.abs(delta) < 2) {
      lines.push("Player performs at a similar percentile in source and target.");
    } else if (delta > 0) {
      lines.push("Player performs relatively better in source than target.");
    } else {
      lines.push("Player performs relatively better in target than source.");
    }
  }
  if (lines.length === 0) {
    lines.push("Insufficient leaderboard percentile data for interpretation.");
  }
  return lines;
}

export function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
