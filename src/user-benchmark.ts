import type { KovaaksClient } from "./kovaaks-client.js";
import type {
  BenchmarkConfig,
  CalibrationConfig,
  CalibrationMapping,
  ScenarioConfig,
} from "./calibration.js";
import type { BenchmarkPlayerScenarioProgress } from "./types.js";

export interface UserBenchmarkInput {
  steamId: string;
  benchmarkIds: string[];
  mapping?: CalibrationMapping;
}

export interface UserBenchmarkOutput {
  playerInput: string;
  steamId: string;
  benchmarks: UserBenchmarkSummary[];
  mappedComparisons: UserMappedScenarioComparison[];
  warnings: string[];
}

export interface UserBenchmarkSummary {
  benchmarkId: string;
  benchmarkName: string;
  kovaaksBenchmarkId?: string;
  scenarios: UserBenchmarkScenarioResult[];
  scenariosWithScores: number;
  scenarioCount: number;
  averagePercentToNextCutoff?: number;
  warnings: string[];
}

export interface UserBenchmarkScenarioResult {
  scenarioId: string;
  scenarioName: string;
  leaderboardId?: string;
  category?: string;
  subcategory?: string;
  score?: number;
  rank?: number;
  percentile?: number;
  achievedCutoff?: { label: string; score: number };
  nextCutoff?: { label: string; score: number; remaining: number };
  percentToNextCutoff?: number;
  warnings: string[];
}

export interface UserMappedScenarioComparison {
  sourceScenario: UserBenchmarkScenarioResult;
  targetScenario: UserBenchmarkScenarioResult;
  scoreDelta?: number;
  rankLabelChange?: string;
  warnings: string[];
}

export async function compareUserBenchmarks(
  client: KovaaksClient,
  config: CalibrationConfig,
  input: UserBenchmarkInput,
): Promise<UserBenchmarkOutput> {
  const steamId = await client.resolveSteamId(input.steamId);
  const benchmarkIds = input.mapping
    ? [input.mapping.sourceBenchmark, input.mapping.targetBenchmark]
    : input.benchmarkIds;
  const uniqueBenchmarkIds = [...new Set(benchmarkIds)];
  const warnings: string[] = [];

  const benchmarks = [];
  for (const benchmarkId of uniqueBenchmarkIds) {
    const benchmark = findBenchmark(config, benchmarkId);
    benchmarks.push(await loadUserBenchmark(client, benchmark, steamId));
  }

  const byBenchmark = new Map(benchmarks.map((benchmark) => [benchmark.benchmarkId, benchmark]));
  const mappedComparisons = input.mapping
    ? input.mapping.pairs.map((pair) => {
        const sourceBenchmark = byBenchmark.get(input.mapping?.sourceBenchmark ?? "");
        const targetBenchmark = byBenchmark.get(input.mapping?.targetBenchmark ?? "");
        const sourceScenario = sourceBenchmark?.scenarios.find((scenario) => scenario.scenarioId === pair.sourceScenario);
        const targetScenario = targetBenchmark?.scenarios.find((scenario) => scenario.scenarioId === pair.targetScenario);
        if (!sourceScenario || !targetScenario) {
          const missing: UserBenchmarkScenarioResult = {
            scenarioId: pair.sourceScenario,
            scenarioName: pair.sourceScenario,
            warnings: ["Mapped scenario is missing from loaded benchmark summary."],
          };
          return {
            sourceScenario: sourceScenario ?? missing,
            targetScenario: targetScenario ?? { ...missing, scenarioId: pair.targetScenario, scenarioName: pair.targetScenario },
            warnings: ["Mapped scenario is missing from loaded benchmark summary."],
          };
        }
        return compareMappedScenarios(sourceScenario, targetScenario);
      })
    : [];

  if (benchmarks.length === 0) {
    warnings.push("No benchmarks were selected.");
  }

  return {
    playerInput: input.steamId,
    steamId,
    benchmarks,
    mappedComparisons,
    warnings,
  };
}

async function loadUserBenchmark(
  client: KovaaksClient,
  benchmark: BenchmarkConfig,
  steamId: string,
): Promise<UserBenchmarkSummary> {
  const warnings: string[] = [];
  if (!benchmark.benchmarkId) {
    return {
      benchmarkId: benchmark.id,
      benchmarkName: benchmark.name,
      scenarios: benchmark.scenarios.map((scenario) => scenarioResult(scenario, undefined)),
      scenarioCount: benchmark.scenarios.length,
      scenariosWithScores: 0,
      warnings: [`Benchmark "${benchmark.id}" is missing KovaaK benchmarkId; cannot fetch user progress.`],
    };
  }

  const progress = await client.getBenchmarkPlayerProgress({
    benchmarkId: benchmark.benchmarkId,
    steamId,
  });
  const progressByLeaderboard = new Map(progress.map((item) => [item.leaderboardId, item]));
  const progressByName = new Map(progress.map((item) => [normalize(item.scenarioName), item]));
  const scenarios = benchmark.scenarios.map((scenario) => {
    const match =
      (scenario.leaderboardId ? progressByLeaderboard.get(scenario.leaderboardId) : undefined) ??
      progressByName.get(normalize(scenario.name));
    return scenarioResult(scenario, match);
  });
  const scenariosWithScores = scenarios.filter((scenario) => scenario.score !== undefined).length;
  if (progress.length > 0 && scenariosWithScores === 0) {
    warnings.push(
      "KovaaK returned benchmark scenario progress but no score fields matched the imported benchmark scenarios.",
    );
  }
  if (progress.length === 0) {
    warnings.push("KovaaK returned no benchmark progress rows for this player and benchmark.");
  }

  const percentValues = scenarios
    .map((scenario) => scenario.percentToNextCutoff)
    .filter((value): value is number => value !== undefined);

  return {
    benchmarkId: benchmark.id,
    benchmarkName: benchmark.name,
    kovaaksBenchmarkId: benchmark.benchmarkId,
    scenarios,
    scenarioCount: scenarios.length,
    scenariosWithScores,
    averagePercentToNextCutoff:
      percentValues.length > 0
        ? percentValues.reduce((sum, value) => sum + value, 0) / percentValues.length
        : undefined,
    warnings,
  };
}

function scenarioResult(
  scenario: ScenarioConfig,
  progress: BenchmarkPlayerScenarioProgress | undefined,
): UserBenchmarkScenarioResult {
  const score = progress?.score;
  const cutoffProgress = score === undefined
    ? {}
    : cutoffProgressForScore(score, scenario.rankCutoffs ?? cutoffsToRankRecord(scenario.cutoffs));
  const warnings: string[] = [];
  if (progress && score === undefined) {
    warnings.push("Progress row was found, but the API response did not include a recognized score field.");
  }

  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    leaderboardId: scenario.leaderboardId,
    category: scenario.category,
    subcategory: scenario.subcategory,
    score,
    rank: progress?.rank,
    percentile: normalizePercentile(progress?.percentile),
    ...cutoffProgress,
    warnings,
  };
}

function compareMappedScenarios(
  sourceScenario: UserBenchmarkScenarioResult,
  targetScenario: UserBenchmarkScenarioResult,
): UserMappedScenarioComparison {
  const warnings = [...sourceScenario.warnings, ...targetScenario.warnings];
  if (sourceScenario.score === undefined) {
    warnings.push(`No source score for ${sourceScenario.scenarioName}.`);
  }
  if (targetScenario.score === undefined) {
    warnings.push(`No target score for ${targetScenario.scenarioName}.`);
  }
  return {
    sourceScenario,
    targetScenario,
    scoreDelta:
      sourceScenario.score !== undefined && targetScenario.score !== undefined
        ? targetScenario.score - sourceScenario.score
        : undefined,
    rankLabelChange: rankLabelChange(sourceScenario.achievedCutoff?.label, targetScenario.achievedCutoff?.label),
    warnings: [...new Set(warnings)],
  };
}

function cutoffProgressForScore(
  score: number,
  rankCutoffs: Record<string, number>,
): Pick<UserBenchmarkScenarioResult, "achievedCutoff" | "nextCutoff" | "percentToNextCutoff"> {
  const cutoffs = Object.entries(rankCutoffs)
    .map(([label, value]) => ({ label, score: value }))
    .filter((cutoff) => Number.isFinite(cutoff.score) && cutoff.score > 0)
    .sort((a, b) => a.score - b.score);
  if (cutoffs.length === 0) {
    return {};
  }
  const achieved = [...cutoffs].reverse().find((cutoff) => score >= cutoff.score);
  const next = cutoffs.find((cutoff) => score < cutoff.score);
  if (!next) {
    return {
      achievedCutoff: achieved,
      percentToNextCutoff: 100,
    };
  }
  const previousScore = achieved?.score ?? 0;
  const span = next.score - previousScore;
  return {
    achievedCutoff: achieved,
    nextCutoff: {
      ...next,
      remaining: next.score - score,
    },
    percentToNextCutoff:
      span > 0
        ? Math.max(0, Math.min(100, ((score - previousScore) / span) * 100))
        : undefined,
  };
}

function cutoffsToRankRecord(cutoffs: number[]): Record<string, number> {
  return Object.fromEntries(cutoffs.map((cutoff, index) => [`cutoff_${index + 1}`, cutoff]));
}

function rankLabelChange(sourceLabel: string | undefined, targetLabel: string | undefined): string | undefined {
  if (!sourceLabel && !targetLabel) return undefined;
  if (sourceLabel === targetLabel) return sourceLabel ?? targetLabel;
  return `${sourceLabel ?? "unranked"} -> ${targetLabel ?? "unranked"}`;
}

function findBenchmark(config: CalibrationConfig, query: string): BenchmarkConfig {
  const lower = query.toLowerCase();
  const found = config.benchmarks.find(
    (benchmark) =>
      benchmark.id.toLowerCase() === lower ||
      benchmark.benchmarkId === query ||
      benchmark.name.toLowerCase() === lower,
  );
  if (!found) {
    const fuzzy = config.benchmarks.find((benchmark) => benchmark.name.toLowerCase().includes(lower));
    if (fuzzy) return fuzzy;
    throw new Error(`No benchmark matching "${query}" found in config.`);
  }
  return found;
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizePercentile(value: number | undefined): number | undefined {
  if (value === undefined) return undefined;
  return value <= 1 ? value * 100 : value;
}
