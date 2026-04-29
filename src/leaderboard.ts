import type { KovaaksClient } from "./kovaaks-client.js";
import { resolveScenario } from "./comparison.js";
import { AppDatabase, type StoredLeaderboardScore } from "./database.js";
import type { ResolvedScenario } from "./types.js";

export interface LeaderboardCollectInput {
  scenarios: string[];
  maxPages?: number;
  sampleRate?: number;
  refreshDb?: boolean;
  maxAgeHours?: number;
  onProgress?: (progress: CollectionProgress) => void;
}

export interface ResolvedLeaderboardCollectInput {
  scenarios: ResolvedScenario[];
  maxPages?: number;
  sampleRate?: number;
  refreshDb?: boolean;
  maxAgeHours?: number;
  onProgress?: (progress: CollectionProgress) => void;
}

export interface CollectionProgress {
  scenarioName: string;
  leaderboardId: string;
  page: number;
  pagesFetched: number;
  totalPages?: number;
  scoresStored: number;
  totalAvailable: number;
  status: "fetched" | "skipped" | "failed";
  error?: string;
}

export interface LeaderboardCollectOutput {
  scenarios: CollectedScenario[];
}

export interface CollectedScenario {
  scenario: ResolvedScenario;
  pagesFetched: number;
  pagesSkipped: number;
  pagesFailed: number;
  scoresStored: number;
  totalAvailable: number;
  complete: boolean;
}

export interface LeaderboardCompareInput {
  sourceLeaderboardId: string;
  targetLeaderboardIds: string[];
  pairedOnly?: boolean;
  percentiles?: number[];
  outlierTrimPercent?: number;
  outlierLimit?: number;
}

export interface LeaderboardCompareOutput {
  source: { leaderboardId: string; scenarioName: string; playersCollected: number };
  targets: TargetComparison[];
}

export interface LeaderboardCutoffsInput {
  sourceLeaderboardId: string;
  targetLeaderboardIds: string[];
  sourceCutoffs: number[];
  outlierTrimPercent?: number;
}

export interface LeaderboardCutoffsOutput {
  source: { leaderboardId: string; scenarioName: string; playersCollected: number };
  targets: TargetCutoffComparison[];
}

export interface TargetCutoffComparison {
  target: { leaderboardId: string; scenarioName: string; playersCollected: number };
  overlappingPlayers: number;
  regression?: LinearRegression;
  trimmedRegression?: LinearRegression;
  logRegression?: LinearRegression;
  cutoffs: CutoffMappingRow[];
  warnings: string[];
}

export interface TargetComparison {
  target: { leaderboardId: string; scenarioName: string; playersCollected: number };
  comparisonPopulation: "all_collected" | "paired_only";
  sourcePlayersCollected: number;
  targetPlayersCollected: number;
  sourcePlayersCompared: number;
  targetPlayersCompared: number;
  overlappingPlayers: number;
  overlapPercentage: number;
  correlation?: number;
  logCorrelation?: number;
  regression?: LinearRegression;
  trimmedRegression?: LinearRegression;
  logRegression?: LinearRegression;
  percentileMapping: PercentileMappingRow[];
  pairedQuantileMapping: PairedQuantileMappingRow[];
  outliers: Outlier[];
  warnings: string[];
}

export interface LinearRegression {
  slope: number;
  intercept: number;
  rSquared: number;
  sampleSize: number;
}

export interface PercentileMappingRow {
  sourceScore: number;
  sourcePercentile: number;
  equivalentTargetScore?: number;
  confidence: "low" | "medium" | "high";
}

export interface PairedQuantileMappingRow extends PercentileMappingRow {
  sampleSize: number;
}

export interface CutoffMappingRow {
  sourceScore: number;
  sourcePercentile?: number;
  globalPercentileTargetScore?: number;
  pairedWindowTargetScore?: number;
  pairedMonotonicTargetScore?: number;
  pairedWindowSampleSize: number;
  linearRegressionTargetScore?: number;
  trimmedRegressionTargetScore?: number;
  logRegressionTargetScore?: number;
  confidence: "low" | "medium" | "high";
}

export interface Outlier {
  playerId: string;
  steamId?: string;
  username?: string;
  sourceScore: number;
  targetScore: number;
  predictedTargetScore?: number;
  residual?: number;
}

interface PairedScore {
  playerId: string;
  steamId?: string;
  username?: string;
  sourceScore: number;
  targetScore: number;
}

const DEFAULT_PERCENTILES = [50, 60, 75, 88, 95];
const DEFAULT_OUTLIER_LIMIT = 10;

export async function collectLeaderboards(
  client: KovaaksClient,
  db: AppDatabase,
  input: LeaderboardCollectInput,
): Promise<LeaderboardCollectOutput> {
  const scenarios = await Promise.all(input.scenarios.map((scenario) => resolveScenario(client, scenario)));
  return collectResolvedLeaderboards(client, db, {
    ...input,
    scenarios,
  });
}

export async function collectResolvedLeaderboards(
  client: KovaaksClient,
  db: AppDatabase,
  input: ResolvedLeaderboardCollectInput,
): Promise<LeaderboardCollectOutput> {
  const collected: CollectedScenario[] = [];
  for (const scenario of input.scenarios) {
    collected.push(await collectOne(client, db, scenario, {
      maxPages: input.maxPages,
      sampleRate: input.sampleRate,
      refreshDb: input.refreshDb ?? false,
      maxAgeHours: input.maxAgeHours,
      onProgress: input.onProgress,
    }));
  }

  return { scenarios: collected };
}

export function compareStoredLeaderboards(
  db: AppDatabase,
  input: LeaderboardCompareInput,
): LeaderboardCompareOutput {
  const sourceScores = db.getScores(input.sourceLeaderboardId);
  const source = {
    leaderboardId: input.sourceLeaderboardId,
    scenarioName: db.getScenarioName(input.sourceLeaderboardId),
    playersCollected: sourceScores.length,
  };

  const targets = input.targetLeaderboardIds.map((targetLeaderboardId) => {
    const targetScores = db.getScores(targetLeaderboardId);
    return compareTarget(db, {
      sourceScores,
      targetScores,
      sourceLeaderboardId: input.sourceLeaderboardId,
      targetLeaderboardId,
      pairedOnly: input.pairedOnly ?? false,
      percentiles: input.percentiles ?? DEFAULT_PERCENTILES,
      outlierTrimPercent: input.outlierTrimPercent ?? 0,
      outlierLimit: input.outlierLimit ?? DEFAULT_OUTLIER_LIMIT,
    });
  });

  return { source, targets };
}

export function buildLeaderboardCutoffs(
  db: AppDatabase,
  input: LeaderboardCutoffsInput,
): LeaderboardCutoffsOutput {
  const sourceScores = db.getScores(input.sourceLeaderboardId);
  const source = {
    leaderboardId: input.sourceLeaderboardId,
    scenarioName: db.getScenarioName(input.sourceLeaderboardId),
    playersCollected: sourceScores.length,
  };

  const targets = input.targetLeaderboardIds.map((targetLeaderboardId) => {
    const targetScores = db.getScores(targetLeaderboardId);
    return buildTargetCutoffs(db, {
      sourceScores,
      targetScores,
      sourceLeaderboardId: input.sourceLeaderboardId,
      targetLeaderboardId,
      sourceCutoffs: input.sourceCutoffs,
      outlierTrimPercent: input.outlierTrimPercent ?? 0,
    });
  });

  return { source, targets };
}

function compareTarget(
  db: AppDatabase,
  params: {
    sourceScores: StoredLeaderboardScore[];
    targetScores: StoredLeaderboardScore[];
    sourceLeaderboardId: string;
    targetLeaderboardId: string;
    pairedOnly: boolean;
    percentiles: number[];
    outlierTrimPercent: number;
    outlierLimit: number;
  },
): TargetComparison {
  const pairs = buildPairs(params.sourceScores, params.targetScores);

  const regression = linearRegression(pairs);
  const trimmedPairs = trimPairsByRegressionResidual(pairs, params.outlierTrimPercent);
  const trimmedRegression =
    params.outlierTrimPercent > 0 && trimmedPairs.length < pairs.length
      ? linearRegression(trimmedPairs)
      : undefined;
  const logRegression = logLogRegression(pairs);
  const correlation = pearson(
    pairs.map((pair) => pair.sourceScore),
    pairs.map((pair) => pair.targetScore),
  );
  const logCorrelation = pearson(
    pairs.map((pair) => Math.log(pair.sourceScore)).filter(Number.isFinite),
    pairs.map((pair) => Math.log(pair.targetScore)).filter(Number.isFinite),
  );

  const overlapPercentage =
    params.sourceScores.length > 0 ? (pairs.length / params.sourceScores.length) * 100 : 0;
  const sourceComparisonScores = params.pairedOnly
    ? pairs.map((pair) => pair.sourceScore)
    : params.sourceScores.map((score) => score.score);
  const targetComparisonScores = params.pairedOnly
    ? pairs.map((pair) => pair.targetScore)
    : params.targetScores.map((score) => score.score);
  const warnings: string[] = [];
  const sourceMetadata = db.getCollectionMetadata(params.sourceLeaderboardId);
  const targetMetadata = db.getCollectionMetadata(params.targetLeaderboardId);
  if (sourceMetadata && !sourceMetadata.complete) {
    warnings.push(
      `Source leaderboard collection is partial: ${sourceMetadata.scoresStored}/${sourceMetadata.totalAvailable} scores stored.`,
    );
  }
  if (targetMetadata && !targetMetadata.complete) {
    warnings.push(
      `Target leaderboard collection is partial: ${targetMetadata.scoresStored}/${targetMetadata.totalAvailable} scores stored.`,
    );
  }
  if (pairs.length < 30) {
    warnings.push("Overlap sample is small; regression and outlier results may be unstable.");
  }
  if (params.pairedOnly) {
    warnings.push("Percentile mapping is restricted to overlapping players only.");
  }
  if (params.outlierTrimPercent > 0) {
    warnings.push(
      `Trimmed regression excludes the largest ${params.outlierTrimPercent}% residual outliers from the initial linear model.`,
    );
  }

  const target: TargetComparison = {
    target: {
      leaderboardId: params.targetLeaderboardId,
      scenarioName: db.getScenarioName(params.targetLeaderboardId),
      playersCollected: params.targetScores.length,
    },
    comparisonPopulation: params.pairedOnly ? "paired_only" : "all_collected",
    sourcePlayersCollected: params.sourceScores.length,
    targetPlayersCollected: params.targetScores.length,
    sourcePlayersCompared: sourceComparisonScores.length,
    targetPlayersCompared: targetComparisonScores.length,
    overlappingPlayers: pairs.length,
    overlapPercentage,
    correlation,
    logCorrelation,
    regression,
    trimmedRegression,
    logRegression,
    percentileMapping: buildPercentileMapping(
      sourceComparisonScores,
      targetComparisonScores,
      pairs.length,
      params.percentiles,
    ),
    pairedQuantileMapping: buildPairedQuantileMapping(pairs, params.percentiles),
    outliers: buildOutliers(pairs, regression, params.outlierLimit),
    warnings,
  };

  db.createScenarioComparison({
    sourceLeaderboardId: params.sourceLeaderboardId,
    targetLeaderboardId: params.targetLeaderboardId,
    scoreMode: "best",
  });

  return target;
}

function buildTargetCutoffs(
  db: AppDatabase,
  params: {
    sourceScores: StoredLeaderboardScore[];
    targetScores: StoredLeaderboardScore[];
    sourceLeaderboardId: string;
    targetLeaderboardId: string;
    sourceCutoffs: number[];
    outlierTrimPercent: number;
  },
): TargetCutoffComparison {
  const pairs = buildPairs(params.sourceScores, params.targetScores);
  const regression = linearRegression(pairs);
  const trimmedPairs = trimPairsByRegressionResidual(pairs, params.outlierTrimPercent);
  const trimmedRegression =
    params.outlierTrimPercent > 0 && trimmedPairs.length < pairs.length
      ? linearRegression(trimmedPairs)
      : undefined;
  const logRegression = logLogRegression(pairs);
  const monotonicAnchors = buildMonotonicPairedAnchors(pairs);
  const sourceSorted = params.sourceScores.map((score) => score.score).sort((a, b) => b - a);
  const targetSorted = params.targetScores.map((score) => score.score).sort((a, b) => b - a);
  const warnings: string[] = [];
  const sourceMetadata = db.getCollectionMetadata(params.sourceLeaderboardId);
  const targetMetadata = db.getCollectionMetadata(params.targetLeaderboardId);

  if (sourceMetadata && !sourceMetadata.complete) {
    warnings.push(
      `Source leaderboard collection is partial: ${sourceMetadata.scoresStored}/${sourceMetadata.totalAvailable} scores stored.`,
    );
  }
  if (targetMetadata && !targetMetadata.complete) {
    warnings.push(
      `Target leaderboard collection is partial: ${targetMetadata.scoresStored}/${targetMetadata.totalAvailable} scores stored.`,
    );
  }
  if (pairs.length < 30) {
    warnings.push("Overlap sample is small; paired cutoff mapping may be unstable.");
  }
  if (params.outlierTrimPercent > 0) {
    warnings.push(
      `Trimmed regression excludes the largest ${params.outlierTrimPercent}% residual outliers from the initial linear model.`,
    );
  }

  return {
    target: {
      leaderboardId: params.targetLeaderboardId,
      scenarioName: db.getScenarioName(params.targetLeaderboardId),
      playersCollected: params.targetScores.length,
    },
    overlappingPlayers: pairs.length,
    regression,
    trimmedRegression,
    logRegression,
    cutoffs: params.sourceCutoffs.map((sourceScore) => {
      const sourcePercentile = percentileForScore(sourceSorted, sourceScore);
      const pairedWindow = pairedWindowTargetScore(pairs, sourceScore);
      return {
        sourceScore,
        sourcePercentile,
        globalPercentileTargetScore:
          sourcePercentile === undefined ? undefined : scoreAtPercentile(targetSorted, sourcePercentile),
        pairedWindowTargetScore: pairedWindow.targetScore,
        pairedMonotonicTargetScore: interpolateMonotonicTarget(monotonicAnchors, sourceScore),
        pairedWindowSampleSize: pairedWindow.sampleSize,
        linearRegressionTargetScore: regression
          ? regression.intercept + regression.slope * sourceScore
          : undefined,
        trimmedRegressionTargetScore: trimmedRegression
          ? trimmedRegression.intercept + trimmedRegression.slope * sourceScore
          : undefined,
        logRegressionTargetScore:
          logRegression && sourceScore > 0
            ? Math.exp(logRegression.intercept + logRegression.slope * Math.log(sourceScore))
            : undefined,
        confidence: pairedWindowConfidence(pairedWindow.sampleSize, pairs.length),
      };
    }),
    warnings,
  };
}

function buildPairs(
  sourceScores: StoredLeaderboardScore[],
  targetScores: StoredLeaderboardScore[],
): PairedScore[] {
  const sourceByPlayer = new Map(sourceScores.map((score) => [score.playerId, score]));
  const pairs: PairedScore[] = [];
  for (const target of targetScores) {
    const source = sourceByPlayer.get(target.playerId);
    if (!source) continue;
    pairs.push({
      playerId: target.playerId,
      steamId: target.steamId ?? source.steamId,
      username: target.username ?? source.username,
      sourceScore: source.score,
      targetScore: target.score,
    });
  }
  return pairs;
}

async function collectOne(
  client: KovaaksClient,
  db: AppDatabase,
  scenario: ResolvedScenario,
  options: {
    maxPages: number | undefined;
    sampleRate: number | undefined;
    refreshDb: boolean;
    maxAgeHours: number | undefined;
    onProgress: ((progress: CollectionProgress) => void) | undefined;
  },
): Promise<CollectedScenario> {
  db.upsertScenario(scenario);
  let pagesFetched = 0;
  let pagesSkipped = 0;
  let pagesFailed = 0;
  let totalAvailable = 0;

  let page = 0;
  let totalPages: number | undefined;
  let stride = 1;
  let lastPlannedPage: number | undefined;

  while (options.maxPages === undefined || page < options.maxPages) {
    const existingPage = db.getCollectionPage(scenario.leaderboardId, page);
    if (
      existingPage?.status === "success" &&
      !options.refreshDb &&
      isFresh(existingPage.fetchedAt, options.maxAgeHours)
    ) {
      pagesSkipped += 1;
      totalAvailable = existingPage.totalAvailable;
      totalPages = totalAvailable > 0 ? Math.ceil(totalAvailable / 100) : undefined;
      stride = collectionPageStride(options.sampleRate, totalPages);
      lastPlannedPage = plannedLastPage(totalPages, options.maxPages);
      options.onProgress?.({
        scenarioName: scenario.scenarioName,
        leaderboardId: scenario.leaderboardId,
        page,
        pagesFetched,
        totalPages,
        scoresStored: db.getScoreCount(scenario.leaderboardId),
        totalAvailable,
        status: "skipped",
      });
      if (lastPlannedPage !== undefined && page >= lastPlannedPage) {
        break;
      }
      page = nextCollectionPage(page, stride, lastPlannedPage);
      continue;
    }

    const fetchedAt = new Date().toISOString();
    try {
      const leaderboard = await client.getLeaderboardScores({
        leaderboardId: scenario.leaderboardId,
        page,
        max: 100,
      });
      pagesFetched += 1;
      totalAvailable = leaderboard.total;
      totalPages = leaderboard.max > 0 ? Math.ceil(leaderboard.total / leaderboard.max) : undefined;
      stride = collectionPageStride(options.sampleRate, totalPages);
      lastPlannedPage = plannedLastPage(totalPages, options.maxPages);
      db.upsertLeaderboardScores(scenario.leaderboardId, leaderboard.scores, fetchedAt);
      const scoresStored = db.getScoreCount(scenario.leaderboardId);
      db.upsertCollectionPage({
        leaderboardId: scenario.leaderboardId,
        page,
        status: "success",
        scoresStored: leaderboard.scores.length,
        totalAvailable,
        fetchedAt,
      });
      options.onProgress?.({
        scenarioName: scenario.scenarioName,
        leaderboardId: scenario.leaderboardId,
        page,
        pagesFetched,
        totalPages,
        scoresStored,
        totalAvailable,
        status: "fetched",
      });
      if (lastPlannedPage !== undefined && page >= lastPlannedPage) {
        break;
      }
      page = nextCollectionPage(page, stride, lastPlannedPage);
    } catch (error) {
      pagesFailed += 1;
      db.upsertCollectionPage({
        leaderboardId: scenario.leaderboardId,
        page,
        status: "failed",
        scoresStored: 0,
        totalAvailable,
        fetchedAt,
        error: error instanceof Error ? error.message : String(error),
      });
      options.onProgress?.({
        scenarioName: scenario.scenarioName,
        leaderboardId: scenario.leaderboardId,
        page,
        pagesFetched,
        totalPages: totalAvailable > 0 ? Math.ceil(totalAvailable / 100) : undefined,
        scoresStored: db.getScoreCount(scenario.leaderboardId),
        totalAvailable,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
      break;
    }
  }

  const scoresStored = db.getScoreCount(scenario.leaderboardId);
  const pageStats = db.getCollectionPageStats(scenario.leaderboardId);
  const finalTotalPages = totalAvailable > 0 ? Math.ceil(totalAvailable / 100) : 0;
  const complete = finalTotalPages > 0 && pageStats.successfulPages >= finalTotalPages;
  db.upsertCollectionMetadata({
    leaderboardId: scenario.leaderboardId,
    pagesFetched: pageStats.successfulPages,
    scoresStored,
    totalAvailable,
    complete,
    fetchedAt: pageStats.latestFetchedAt ?? new Date().toISOString(),
  });

  return {
    scenario,
    pagesFetched,
    pagesSkipped,
    pagesFailed,
    scoresStored,
    totalAvailable,
    complete,
  };
}

function collectionPageStride(sampleRate: number | undefined, totalPages: number | undefined): number {
  if (sampleRate === undefined || sampleRate >= 1 || totalPages === undefined || totalPages <= 50) {
    return 1;
  }
  return Math.max(1, Math.floor(1 / sampleRate));
}

function plannedLastPage(totalPages: number | undefined, maxPages: number | undefined): number | undefined {
  if (totalPages === undefined || totalPages <= 0) {
    return undefined;
  }
  const pageLimit = maxPages === undefined ? totalPages : Math.min(totalPages, maxPages);
  return pageLimit > 0 ? pageLimit - 1 : undefined;
}

function nextCollectionPage(currentPage: number, stride: number, lastPlannedPage: number | undefined): number {
  const nextPage = currentPage + stride;
  if (lastPlannedPage === undefined || stride <= 1 || nextPage <= lastPlannedPage) {
    return nextPage;
  }
  return lastPlannedPage;
}

function isFresh(fetchedAt: string, maxAgeHours: number | undefined): boolean {
  if (maxAgeHours === undefined) {
    return true;
  }
  return Date.now() - Date.parse(fetchedAt) <= maxAgeHours * 60 * 60 * 1000;
}

function buildPercentileMapping(
  sourceScores: number[],
  targetScores: number[],
  overlapCount: number,
  percentiles: number[],
): PercentileMappingRow[] {
  const sourceSorted = [...sourceScores].sort((a, b) => b - a);
  const targetSorted = [...targetScores].sort((a, b) => b - a);

  const rows: PercentileMappingRow[] = [];
  for (const percentile of percentiles) {
    const sourceScore = scoreAtPercentile(sourceSorted, percentile);
    if (sourceScore === undefined) continue;
    const row: PercentileMappingRow = {
      sourceScore,
      sourcePercentile: percentile,
      equivalentTargetScore: scoreAtPercentile(targetSorted, percentile),
      confidence: confidenceFor(overlapCount, sourceScores.length, targetScores.length),
    };
    rows.push(row);
  }
  return rows;
}

function buildPairedQuantileMapping(
  pairs: PairedScore[],
  percentiles: number[],
): PairedQuantileMappingRow[] {
  const rows: PairedQuantileMappingRow[] = [];
  const sorted = [...pairs].sort((a, b) => b.sourceScore - a.sourceScore);
  for (const percentile of percentiles) {
    const sourceScore = pairedSourceScoreAtPercentile(sorted, percentile);
    if (sourceScore === undefined) continue;
    const pairedWindow = pairedWindowTargetScore(sorted, sourceScore);
    rows.push({
      sourceScore,
      sourcePercentile: percentile,
      equivalentTargetScore: pairedWindow.targetScore,
      sampleSize: pairedWindow.sampleSize,
      confidence: pairedWindowConfidence(pairedWindow.sampleSize, pairs.length),
    });
  }
  return rows;
}

export function scoreAtPercentile(scores: number[], percentile: number): number | undefined {
  if (scores.length === 0) return undefined;
  const rank = Math.max(1, Math.ceil((1 - percentile / 100) * scores.length));
  return scores[Math.min(scores.length - 1, rank - 1)];
}

function pairedSourceScoreAtPercentile(sortedPairs: PairedScore[], percentile: number): number | undefined {
  if (sortedPairs.length === 0) return undefined;
  const rank = Math.max(1, Math.ceil((1 - percentile / 100) * sortedPairs.length));
  return sortedPairs[Math.min(sortedPairs.length - 1, rank - 1)]?.sourceScore;
}

function percentileForScore(sortedScores: number[], score: number): number | undefined {
  if (sortedScores.length === 0) return undefined;
  const betterCount = sortedScores.filter((entry) => entry > score).length;
  return ((sortedScores.length - betterCount) / sortedScores.length) * 100;
}

function pairedWindowTargetScore(
  pairs: PairedScore[],
  sourceScore: number,
): { targetScore?: number; sampleSize: number } {
  if (pairs.length === 0) return { sampleSize: 0 };
  const windowSize = Math.min(pairs.length, Math.max(15, Math.ceil(pairs.length * 0.05)));
  const nearest = [...pairs]
    .sort((a, b) => Math.abs(a.sourceScore - sourceScore) - Math.abs(b.sourceScore - sourceScore))
    .slice(0, windowSize);
  return {
    targetScore: median(nearest.map((pair) => pair.targetScore)),
    sampleSize: nearest.length,
  };
}

function buildMonotonicPairedAnchors(pairs: PairedScore[]): Array<{ sourceScore: number; targetScore: number }> {
  const anchors: Array<{ sourceScore: number; targetScore: number }> = [];
  const sorted = [...pairs].sort((a, b) => b.sourceScore - a.sourceScore);
  for (let percentile = 5; percentile <= 95; percentile += 5) {
    const sourceScore = pairedSourceScoreAtPercentile(sorted, percentile);
    if (sourceScore === undefined) continue;
    const targetScore = pairedWindowTargetScore(sorted, sourceScore).targetScore;
    if (targetScore === undefined) continue;
    anchors.push({ sourceScore, targetScore });
  }

  const ascending = anchors
    .sort((a, b) => a.sourceScore - b.sourceScore)
    .filter((anchor, index, array) => index === 0 || anchor.sourceScore !== array[index - 1].sourceScore);

  let floor = -Infinity;
  return ascending.map((anchor) => {
    floor = Math.max(floor, anchor.targetScore);
    return { sourceScore: anchor.sourceScore, targetScore: floor };
  });
}

function interpolateMonotonicTarget(
  anchors: Array<{ sourceScore: number; targetScore: number }>,
  sourceScore: number,
): number | undefined {
  if (anchors.length === 0) return undefined;
  if (sourceScore <= anchors[0].sourceScore) return anchors[0].targetScore;
  const last = anchors[anchors.length - 1];
  if (sourceScore >= last.sourceScore) return last.targetScore;

  for (let index = 1; index < anchors.length; index += 1) {
    const left = anchors[index - 1];
    const right = anchors[index];
    if (sourceScore <= right.sourceScore) {
      const span = right.sourceScore - left.sourceScore;
      if (span === 0) return right.targetScore;
      const t = (sourceScore - left.sourceScore) / span;
      return left.targetScore + t * (right.targetScore - left.targetScore);
    }
  }
  return last.targetScore;
}

function confidenceFor(overlapCount: number, sourceCount: number, targetCount: number): "low" | "medium" | "high" {
  const overlapRatio = sourceCount > 0 ? overlapCount / sourceCount : 0;
  const minCount = Math.min(sourceCount, targetCount);
  if (overlapCount >= 200 && overlapRatio >= 0.2 && minCount >= 500) return "high";
  if (overlapCount >= 50 && overlapRatio >= 0.05) return "medium";
  return "low";
}

function pairedWindowConfidence(sampleSize: number, overlapCount: number): "low" | "medium" | "high" {
  if (sampleSize >= 40 && overlapCount >= 200) return "high";
  if (sampleSize >= 15 && overlapCount >= 50) return "medium";
  return "low";
}

function linearRegression(pairs: PairedScore[]): LinearRegression | undefined {
  if (pairs.length < 2) return undefined;
  const xs = pairs.map((pair) => pair.sourceScore);
  const ys = pairs.map((pair) => pair.targetScore);
  const xMean = mean(xs);
  const yMean = mean(ys);
  let numerator = 0;
  let denominator = 0;
  for (const pair of pairs) {
    numerator += (pair.sourceScore - xMean) * (pair.targetScore - yMean);
    denominator += (pair.sourceScore - xMean) ** 2;
  }
  if (denominator === 0) return undefined;
  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;
  const predicted = pairs.map((pair) => intercept + slope * pair.sourceScore);
  const ssResidual = pairs.reduce((sum, pair, index) => sum + (pair.targetScore - predicted[index]) ** 2, 0);
  const ssTotal = ys.reduce((sum, y) => sum + (y - yMean) ** 2, 0);
  return {
    slope,
    intercept,
    rSquared: ssTotal === 0 ? 0 : 1 - ssResidual / ssTotal,
    sampleSize: pairs.length,
  };
}

function logLogRegression(pairs: PairedScore[]): LinearRegression | undefined {
  const positive = pairs.filter((pair) => pair.sourceScore > 0 && pair.targetScore > 0);
  if (positive.length < 2) return undefined;
  const transformed: PairedScore[] = positive.map((pair) => ({
    playerId: pair.playerId,
    steamId: pair.steamId,
    username: pair.username,
    sourceScore: Math.log(pair.sourceScore),
    targetScore: Math.log(pair.targetScore),
  }));
  return linearRegression(transformed);
}

function trimPairsByRegressionResidual(pairs: PairedScore[], trimPercent: number): PairedScore[] {
  if (pairs.length < 3 || trimPercent <= 0) return pairs;
  const regression = linearRegression(pairs);
  if (!regression) return pairs;
  const trimCount = Math.floor(pairs.length * (trimPercent / 100));
  if (trimCount <= 0 || trimCount >= pairs.length - 2) return pairs;
  return pairs
    .map((pair) => ({
      pair,
      absResidual: Math.abs(pair.targetScore - (regression.intercept + regression.slope * pair.sourceScore)),
    }))
    .sort((a, b) => a.absResidual - b.absResidual)
    .slice(0, pairs.length - trimCount)
    .map((entry) => entry.pair);
}

function buildOutliers(
  pairs: PairedScore[],
  regression: LinearRegression | undefined,
  limit: number,
): Outlier[] {
  if (!regression) return [];
  return pairs
    .map((pair) => {
      const predictedTargetScore = regression.intercept + regression.slope * pair.sourceScore;
      return {
        ...pair,
        predictedTargetScore,
        residual: pair.targetScore - predictedTargetScore,
      };
    })
    .sort((a, b) => Math.abs(b.residual ?? 0) - Math.abs(a.residual ?? 0))
    .slice(0, Math.max(0, limit));
}

function pearson(xs: number[], ys: number[]): number | undefined {
  if (xs.length !== ys.length || xs.length < 2) return undefined;
  const finitePairs = xs
    .map((x, index) => ({ x, y: ys[index] }))
    .filter((pair) => Number.isFinite(pair.x) && Number.isFinite(pair.y));
  if (finitePairs.length < 2) return undefined;
  const xMean = mean(finitePairs.map((pair) => pair.x));
  const yMean = mean(finitePairs.map((pair) => pair.y));
  let numerator = 0;
  let xDenominator = 0;
  let yDenominator = 0;
  for (const pair of finitePairs) {
    numerator += (pair.x - xMean) * (pair.y - yMean);
    xDenominator += (pair.x - xMean) ** 2;
    yDenominator += (pair.y - yMean) ** 2;
  }
  const denominator = Math.sqrt(xDenominator * yDenominator);
  return denominator === 0 ? undefined : numerator / denominator;
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}
