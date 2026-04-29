import { readFile } from "node:fs/promises";
import { z } from "zod";
import { resolveScenario } from "./comparison.js";
import type { KovaaksClient } from "./kovaaks-client.js";
import { AppDatabase } from "./database.js";
import {
  buildLeaderboardCutoffs,
  compareStoredLeaderboards,
  type LeaderboardCompareInput,
  type LeaderboardCutoffsInput,
  type LeaderboardCutoffsOutput,
} from "./leaderboard.js";
import type { ResolvedScenario } from "./types.js";

const ScenarioConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  leaderboardId: z.string().min(1).optional(),
  cutoffs: z.array(z.number().positive()).default([]),
  rankCutoffs: z.record(z.string(), z.number().positive()).optional(),
  category: z.string().min(1).optional(),
  notes: z.string().optional(),
});

const BenchmarkConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  benchmarkId: z.string().min(1).optional(),
  difficulty: z.string().optional(),
  scenarios: z.array(ScenarioConfigSchema).min(1),
});

const BenchmarkIndexSchema = z.object({
  benchmarks: z.array(z.object({
    benchmarkId: z.string().min(1),
    benchmarkName: z.string().min(1),
  })),
});

const ScenarioMappingSchema = z.object({
  sourceScenario: z.string().min(1),
  targetScenario: z.string().min(1),
});

const CalibrationMappingSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sourceBenchmark: z.string().min(1),
  targetBenchmark: z.string().min(1),
  pairs: z.array(ScenarioMappingSchema).min(1),
});

const CalibrationConfigSchema = z.object({
  name: z.string().min(1),
  benchmarks: z.array(BenchmarkConfigSchema).min(1),
});

export type CalibrationConfig = z.infer<typeof CalibrationConfigSchema>;
export type BenchmarkConfig = z.infer<typeof BenchmarkConfigSchema>;
export type ScenarioConfig = z.infer<typeof ScenarioConfigSchema>;
export type CalibrationMapping = z.infer<typeof CalibrationMappingSchema>;
type CalibrationReportConfig = CalibrationConfig & { mappings: CalibrationMapping[] };
export type BenchmarkIndex = z.infer<typeof BenchmarkIndexSchema>;

export interface ImportBenchmarkInput {
  username?: string;
  benchmarkId?: string;
  benchmarkName?: string;
  steamId?: string;
  id?: string;
  difficulty?: string;
}

const DEFAULT_BENCHMARK_USERNAME = "KovaaksCompare";
const DEFAULT_BENCHMARK_STEAM_ID = "11111111111111111";

export interface CalibrationReportInput {
  mappingId: string;
  percentiles?: number[];
  pairedOnly?: boolean;
  outlierTrimPercent?: number;
  outlierLimit?: number;
}

export interface CalibrationReport {
  configName: string;
  mapping: CalibrationMapping;
  sourceBenchmark: BenchmarkConfig;
  targetBenchmark: BenchmarkConfig;
  pairs: CalibrationPairReport[];
  warnings: string[];
}

export interface CalibrationPairReport {
  sourceScenario: ScenarioConfig;
  targetScenario: ScenarioConfig;
  comparison: ReturnType<typeof compareStoredLeaderboards>["targets"][number];
  cutoffs?: LeaderboardCutoffsOutput["targets"][number];
  warnings: string[];
}

export async function loadCalibrationConfig(path: string): Promise<CalibrationConfig> {
  const raw = await readFile(path, "utf8");
  return CalibrationConfigSchema.parse(JSON.parse(raw));
}

export async function loadCalibrationMapping(path: string): Promise<CalibrationMapping> {
  const raw = await readFile(path, "utf8");
  return CalibrationMappingSchema.parse(JSON.parse(raw));
}

export function withMapping(config: CalibrationConfig, mapping: CalibrationMapping): CalibrationReportConfig {
  return {
    ...config,
    mappings: [mapping],
  };
}

export async function loadBenchmarkIndex(path: string): Promise<BenchmarkIndex> {
  const raw = await readFile(path, "utf8");
  return BenchmarkIndexSchema.parse(JSON.parse(raw));
}

export async function downloadBenchmarkIndex(
  client: KovaaksClient,
  username: string = DEFAULT_BENCHMARK_USERNAME,
): Promise<BenchmarkIndex> {
  return {
    benchmarks: await client.getBenchmarkSummariesForPlayer({ username }),
  };
}

export async function importBenchmarkFromApi(
  client: KovaaksClient,
  input: ImportBenchmarkInput,
): Promise<BenchmarkConfig> {
  const benchmark = await resolveBenchmarkImportTarget(client, input);
  const scenarios = await client.getBenchmarkScenarios({
    benchmarkId: benchmark.benchmarkId,
    steamId: input.steamId ?? DEFAULT_BENCHMARK_STEAM_ID,
    max: 100,
  });

  return {
    id: input.id ?? slugify(benchmark.benchmarkName),
    name: benchmark.benchmarkName,
    benchmarkId: benchmark.benchmarkId,
    difficulty: input.difficulty,
    scenarios: scenarios.map((scenario) => ({
      id: slugify(scenario.scenarioName),
      name: scenario.scenarioName,
      leaderboardId: scenario.leaderboardId,
      cutoffs: rankMaxesToCutoffs(scenario.rankMaxes),
      rankCutoffs: scenario.rankMaxes,
      category: scenario.category,
    })),
  };
}

export function appendBenchmarkToConfig(
  config: CalibrationConfig | undefined,
  benchmark: BenchmarkConfig,
): CalibrationConfig {
  if (!config) {
    return {
      name: `${benchmark.name} Calibration`,
      benchmarks: [benchmark],
    };
  }
  const benchmarks = config.benchmarks.filter((item) => item.id !== benchmark.id);
  benchmarks.push(benchmark);
  return { ...config, benchmarks };
}

export interface MappingSuggestion {
  mapping: CalibrationMapping;
  unpairedSources: ScenarioConfig[];
  unpairedTargets: ScenarioConfig[];
  warnings: string[];
}

const UNCATEGORIZED = "__uncategorized__";
const CATEGORY_OCCURRENCE_SEPARATOR = "@@";

export function suggestMapping(input: {
  config: CalibrationConfig;
  sourceBenchmark: string;
  targetBenchmark: string;
  id?: string;
  name?: string;
}): MappingSuggestion {
  const sourceBenchmark = findBenchmark(input.config, input.sourceBenchmark);
  const targetBenchmark = findBenchmark(input.config, input.targetBenchmark);
  if (sourceBenchmark.id === targetBenchmark.id) {
    throw new Error("Source and target benchmarks must differ.");
  }

  const sourceByCategory = groupByMatchingCategory(sourceBenchmark.scenarios);
  const targetByCategory = groupByMatchingCategory(targetBenchmark.scenarios);
  const allCategories = new Set([...sourceByCategory.keys(), ...targetByCategory.keys()]);

  const pairs: Array<{ sourceScenario: string; targetScenario: string }> = [];
  const unpairedSources: ScenarioConfig[] = [];
  const unpairedTargets: ScenarioConfig[] = [];
  const warnings: string[] = [];
  const categoryOrder = orderedCategories(sourceBenchmark.scenarios, targetBenchmark.scenarios, allCategories);
  const hasUncategorized = categoryOrder.some((category) => category.startsWith(UNCATEGORIZED));
  if (hasUncategorized) {
    warnings.push(
      "Some scenarios have no category metadata; pairing them across the full benchmark instead of by category. Re-run calibration import-benchmark to populate categories.",
    );
  }

  for (const category of categoryOrder) {
    const sources = sourceByCategory.get(category) ?? [];
    const targets = targetByCategory.get(category) ?? [];
    const label = categoryLabel(category);

    if (sources.length === 0) {
      unpairedTargets.push(...targets);
      warnings.push(
        `Category ${label} present only in target (${targets.length} scenario(s)); no pairs created.`,
      );
      continue;
    }
    if (targets.length === 0) {
      unpairedSources.push(...sources);
      warnings.push(
        `Category ${label} present only in source (${sources.length} scenario(s)); no pairs created.`,
      );
      continue;
    }
    if (sources.length !== targets.length) {
      warnings.push(
        `Category ${label} has ${sources.length} source vs ${targets.length} target scenario(s); pairing best-effort, please verify.`,
      );
    }

    const pairCount = Math.min(sources.length, targets.length);
    for (let index = 0; index < pairCount; index += 1) {
      pairs.push({
        sourceScenario: sources[index].id,
        targetScenario: targets[index].id,
      });
    }
    if (sources.length > pairCount) {
      unpairedSources.push(...sources.slice(pairCount));
    }
    if (targets.length > pairCount) {
      unpairedTargets.push(...targets.slice(pairCount));
    }
  }

  if (pairs.length === 0) {
    throw new Error(
      "No scenario pairs could be created. Check that benchmarks share categories or pair manually.",
    );
  }

  const id = input.id ?? `${sourceBenchmark.id}__to__${targetBenchmark.id}`;
  const name = input.name ?? `${sourceBenchmark.name} -> ${targetBenchmark.name}`;

  return {
    mapping: {
      id,
      name,
      sourceBenchmark: sourceBenchmark.id,
      targetBenchmark: targetBenchmark.id,
      pairs,
    },
    unpairedSources,
    unpairedTargets,
    warnings,
  };
}

function groupByMatchingCategory(scenarios: ScenarioConfig[]): Map<string, ScenarioConfig[]> {
  const groups = new Map<string, ScenarioConfig[]>();
  const occurrences = new Map<string, number>();
  let previousBaseKey: string | undefined;
  let currentKey: string | undefined;

  for (const scenario of scenarios) {
    const baseKey = normalizedCategoryKey(scenario.category);
    if (baseKey !== previousBaseKey) {
      const nextOccurrence = (occurrences.get(baseKey) ?? 0) + 1;
      occurrences.set(baseKey, nextOccurrence);
      currentKey = categoryBucketKey(baseKey, nextOccurrence);
      previousBaseKey = baseKey;
    }
    const key = currentKey ?? categoryBucketKey(baseKey, 1);
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(scenario);
    } else {
      groups.set(key, [scenario]);
    }
  }
  return groups;
}

function orderedCategories(
  sourceScenarios: ScenarioConfig[],
  targetScenarios: ScenarioConfig[],
  allCategories: Set<string>,
): string[] {
  const ordered: string[] = [];
  for (const category of [
    ...groupByMatchingCategory(sourceScenarios).keys(),
    ...groupByMatchingCategory(targetScenarios).keys(),
  ]) {
    if (!ordered.includes(category)) ordered.push(category);
  }
  for (const category of allCategories) {
    if (!ordered.includes(category)) {
      ordered.push(category);
    }
  }
  return ordered;
}

function normalizedCategoryKey(category: string | undefined): string {
  const trimmed = category?.trim();
  if (!trimmed) return UNCATEGORIZED;
  return trimmed.replace(/\s+track$/i, "");
}

function categoryBucketKey(baseKey: string, occurrence: number): string {
  return `${baseKey}${CATEGORY_OCCURRENCE_SEPARATOR}${occurrence}`;
}

function categoryLabel(key: string): string {
  const [baseKey, occurrence] = key.split(CATEGORY_OCCURRENCE_SEPARATOR);
  if (baseKey === UNCATEGORIZED) return "(uncategorized)";
  return occurrence && occurrence !== "1" ? `"${baseKey}" block ${occurrence}` : `"${baseKey}"`;
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

export async function resolveCalibrationConfig(
  client: KovaaksClient,
  config: CalibrationConfig,
): Promise<CalibrationConfig> {
  const benchmarks: BenchmarkConfig[] = [];

  for (const benchmark of config.benchmarks) {
    const scenarios: ScenarioConfig[] = [];
    for (const scenario of benchmark.scenarios) {
      if (scenario.leaderboardId) {
        scenarios.push(scenario);
        continue;
      }
      const resolved = await resolveScenario(client, scenario.name);
      scenarios.push({
        ...scenario,
        name: resolved.scenarioName,
        leaderboardId: resolved.leaderboardId,
      });
    }
    benchmarks.push({ ...benchmark, scenarios });
  }

  return { ...config, benchmarks };
}

export function scenarioInputsForBenchmarks(config: CalibrationConfig, benchmarkIds?: string[]): string[] {
  const selected = new Set(benchmarkIds ?? config.benchmarks.map((benchmark) => benchmark.id));
  const scenarios = config.benchmarks
    .filter((benchmark) => selected.has(benchmark.id))
    .flatMap((benchmark) => benchmark.scenarios);
  if (scenarios.length === 0) {
    throw new Error(`No scenarios matched selected benchmark IDs: ${[...selected].join(", ")}`);
  }

  return unique(scenarios.map((scenario) => scenario.leaderboardId ?? scenario.name));
}

export function resolvedScenariosForBenchmarks(
  config: CalibrationConfig,
  benchmarkIds?: string[],
): ResolvedScenario[] {
  const selected = new Set(benchmarkIds ?? config.benchmarks.map((benchmark) => benchmark.id));
  const scenarios = config.benchmarks
    .filter((benchmark) => selected.has(benchmark.id))
    .flatMap((benchmark) => benchmark.scenarios);
  if (scenarios.length === 0) {
    throw new Error(`No scenarios matched selected benchmark IDs: ${[...selected].join(", ")}`);
  }

  const resolved = scenarios.map((scenario) => {
    if (!scenario.leaderboardId) {
      throw new Error(`Scenario "${scenario.id}" is missing leaderboardId. Run calibration resolve first.`);
    }
    return {
      input: scenario.name,
      leaderboardId: scenario.leaderboardId,
      scenarioName: scenario.name,
      ambiguous: false,
      alternatives: [],
    };
  });

  return uniqueBy(resolved, (scenario) => scenario.leaderboardId);
}

export function buildCalibrationReport(
  db: AppDatabase,
  config: CalibrationReportConfig,
  input: CalibrationReportInput,
): CalibrationReport {
  const mapping = config.mappings.find((item) => item.id === input.mappingId);
  if (!mapping) {
    throw new Error(`No calibration mapping "${input.mappingId}" found in config.`);
  }

  const sourceBenchmark = getBenchmark(config, mapping.sourceBenchmark);
  const targetBenchmark = getBenchmark(config, mapping.targetBenchmark);
  const warnings: string[] = [];
  const pairs: CalibrationPairReport[] = mapping.pairs.map((pair) => {
    const sourceScenario = getScenario(sourceBenchmark, pair.sourceScenario);
    const targetScenario = getScenario(targetBenchmark, pair.targetScenario);
    if (!sourceScenario.leaderboardId || !targetScenario.leaderboardId) {
      throw new Error(
        `Mapping ${sourceScenario.id} -> ${targetScenario.id} needs resolved leaderboard IDs. Run calibration resolve first.`,
      );
    }

    const compareInput: LeaderboardCompareInput = {
      sourceLeaderboardId: sourceScenario.leaderboardId,
      targetLeaderboardIds: [targetScenario.leaderboardId],
      pairedOnly: input.pairedOnly,
      percentiles: input.percentiles,
      outlierTrimPercent: input.outlierTrimPercent,
      outlierLimit: input.outlierLimit,
    };
    const comparison = compareStoredLeaderboards(db, compareInput).targets[0];
    const pairWarnings: string[] = [];

    let cutoffs: LeaderboardCutoffsOutput["targets"][number] | undefined;
    if (sourceScenario.cutoffs.length > 0) {
      const cutoffInput: LeaderboardCutoffsInput = {
        sourceLeaderboardId: sourceScenario.leaderboardId,
        targetLeaderboardIds: [targetScenario.leaderboardId],
        sourceCutoffs: sourceScenario.cutoffs,
        outlierTrimPercent: input.outlierTrimPercent,
      };
      cutoffs = buildLeaderboardCutoffs(db, cutoffInput).targets[0];
    } else {
      pairWarnings.push(`Source scenario ${sourceScenario.id} has no cutoffs configured; cutoff mapping skipped.`);
    }

    return {
      sourceScenario,
      targetScenario,
      comparison,
      cutoffs,
      warnings: pairWarnings,
    };
  });

  return {
    configName: config.name,
    mapping,
    sourceBenchmark,
    targetBenchmark,
    pairs,
    warnings,
  };
}

export function calibrationReportToMarkdown(report: CalibrationReport): string {
  const lines = [
    `# ${report.configName}`,
    "",
    `Mapping: ${report.mapping.name}`,
    "",
    `Source benchmark: ${report.sourceBenchmark.name}`,
    `Target benchmark: ${report.targetBenchmark.name}`,
    "",
  ];

  for (const pair of report.pairs) {
    lines.push(`## ${pair.sourceScenario.name} -> ${pair.targetScenario.name}`);
    lines.push("");
    lines.push(`Source leaderboard: ${pair.sourceScenario.leaderboardId ?? "unresolved"}`);
    lines.push(`Target leaderboard: ${pair.targetScenario.leaderboardId ?? "unresolved"}`);
    lines.push(`Overlapping players: ${pair.comparison.overlappingPlayers} (${pair.comparison.overlapPercentage.toFixed(1)}%)`);
    lines.push(`Correlation: ${formatOptional(pair.comparison.correlation, 4)}`);
    lines.push(`Log correlation: ${formatOptional(pair.comparison.logCorrelation, 4)}`);
    if (pair.comparison.regression) {
      lines.push(
        `Linear regression: target ~= ${pair.comparison.regression.slope.toFixed(4)} * source + ` +
          `${pair.comparison.regression.intercept.toFixed(2)} (R^2 ${pair.comparison.regression.rSquared.toFixed(4)})`,
      );
    }
    if (pair.comparison.trimmedRegression) {
      lines.push(
        `Trimmed regression: target ~= ${pair.comparison.trimmedRegression.slope.toFixed(4)} * source + ` +
          `${pair.comparison.trimmedRegression.intercept.toFixed(2)} ` +
          `(R^2 ${pair.comparison.trimmedRegression.rSquared.toFixed(4)}, n=${pair.comparison.trimmedRegression.sampleSize})`,
      );
    }
    if (pair.comparison.logRegression) {
      lines.push(
        `Log-log regression: log(target) ~= ${pair.comparison.logRegression.slope.toFixed(4)} * log(source) + ` +
          `${pair.comparison.logRegression.intercept.toFixed(4)} ` +
          `(R^2 ${pair.comparison.logRegression.rSquared.toFixed(4)}, n=${pair.comparison.logRegression.sampleSize})`,
      );
    }
    lines.push("");
    lines.push("### Percentile Mapping");
    lines.push("");
    lines.push("| Source score | Source percentile | Equivalent target score | Confidence |");
    lines.push("| ---: | ---: | ---: | :--- |");
    for (const row of pair.comparison.percentileMapping) {
      lines.push(
        `| ${formatNumber(row.sourceScore)} | ${row.sourcePercentile}% | ` +
          `${formatOptional(row.equivalentTargetScore, 0)} | ${row.confidence} |`,
      );
    }

    if (pair.cutoffs) {
      lines.push("");
      lines.push("### Configured Cutoffs");
      lines.push("");
      lines.push(
        "| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |",
      );
      lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |");
      for (const row of pair.cutoffs.cutoffs) {
        lines.push(
          `| ${formatNumber(row.sourceScore)} | ${formatOptional(row.sourcePercentile, 1)}% | ` +
            `${formatOptional(row.globalPercentileTargetScore, 0)} | ` +
            `${formatOptional(row.pairedWindowTargetScore, 0)} | ` +
            `${formatOptional(row.pairedMonotonicTargetScore, 0)} | ` +
            `${formatOptional(row.linearRegressionTargetScore, 0)} | ` +
            `${formatOptional(row.trimmedRegressionTargetScore, 0)} | ` +
            `${formatOptional(row.logRegressionTargetScore, 0)} | ${row.confidence} |`,
        );
      }
    }

    const warnings = [...pair.comparison.warnings, ...(pair.cutoffs?.warnings ?? []), ...pair.warnings];
    if (warnings.length > 0) {
      lines.push("");
      lines.push("### Warnings");
      lines.push("");
      for (const warning of unique(warnings)) {
        lines.push(`- ${warning}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function calibrationReportToCsv(report: CalibrationReport): string {
  const header = [
    "mapping_id",
    "source_benchmark",
    "target_benchmark",
    "source_scenario_id",
    "source_scenario",
    "source_leaderboard_id",
    "target_scenario_id",
    "target_scenario",
    "target_leaderboard_id",
    "overlapping_players",
    "correlation",
    "source_cutoff",
    "source_percentile",
    "global_percentile_target_score",
    "paired_window_target_score",
    "paired_monotonic_target_score",
    "linear_regression_target_score",
    "trimmed_regression_target_score",
    "log_regression_target_score",
    "confidence",
  ];
  const rows = report.pairs.flatMap((pair) => {
    const cutoffRows = pair.cutoffs?.cutoffs ?? [];
    if (cutoffRows.length === 0) {
      return [
        reportRow(report, pair, {
          sourceScore: undefined,
          sourcePercentile: undefined,
          globalPercentileTargetScore: undefined,
          pairedWindowTargetScore: undefined,
          pairedMonotonicTargetScore: undefined,
          linearRegressionTargetScore: undefined,
          trimmedRegressionTargetScore: undefined,
          logRegressionTargetScore: undefined,
          confidence: undefined,
        }),
      ];
    }
    return cutoffRows.map((row) => reportRow(report, pair, row));
  });
  return [header.join(","), ...rows].join("\n");
}

export const CALIBRATION_TEMPLATE = {
  name: "Viscose S2 Easier Calibration",
  benchmarks: [
    {
      id: "viscose-current-easier",
      name: "Viscose Benchmark Easier",
      difficulty: "easier",
      scenarios: [
        {
          id: "smoothsphere-viscose-easier",
          name: "Smoothsphere Viscose Easier",
          cutoffs: [],
          rankCutoffs: {},
          notes: "Fill in current benchmark rank cutoffs if this scenario is used as a source.",
        },
      ],
    },
    {
      id: "viscose-s2-easier",
      name: "Viscose S2 Easier",
      difficulty: "easier",
      scenarios: [
        {
          id: "whisphere-raw-control-larger-slowed",
          name: "WhisphereRawControl Larger + Slowed",
          cutoffs: [],
          rankCutoffs: {},
          notes: "Fill in proposed S2 rank cutoffs if this scenario is used as a source.",
        },
      ],
    },
  ],
};

async function resolveBenchmarkImportTarget(
  client: KovaaksClient,
  input: ImportBenchmarkInput,
): Promise<{ benchmarkId: string; benchmarkName: string }> {
  if (input.benchmarkId && input.benchmarkName) {
    return { benchmarkId: input.benchmarkId, benchmarkName: input.benchmarkName };
  }
  if (input.benchmarkId) {
    return { benchmarkId: input.benchmarkId, benchmarkName: `benchmark ${input.benchmarkId}` };
  }
  if (!input.benchmarkName) {
    throw new Error("Provide --benchmark-name or --benchmark-id.");
  }

  const benchmarks = await client.getBenchmarkSummariesForPlayer({
    username: input.username ?? DEFAULT_BENCHMARK_USERNAME,
  });
  const exact = benchmarks.find(
    (benchmark) => benchmark.benchmarkName.toLowerCase() === input.benchmarkName?.toLowerCase(),
  );
  const fuzzy = benchmarks.find(
    (benchmark) => benchmark.benchmarkName.toLowerCase().includes(input.benchmarkName?.toLowerCase() ?? ""),
  );
  const chosen = exact ?? fuzzy;
  if (!chosen) {
    throw new Error(`No benchmark matching "${input.benchmarkName}" found.`);
  }
  return chosen;
}

function rankMaxesToCutoffs(rankMaxes: Record<string, number>): number[] {
  return [...new Set(Object.values(rankMaxes).filter((value) => Number.isFinite(value) && value > 0))]
    .sort((a, b) => a - b);
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function getBenchmark(config: CalibrationConfig, id: string): BenchmarkConfig {
  const benchmark = config.benchmarks.find((item) => item.id === id);
  if (!benchmark) throw new Error(`No benchmark "${id}" found in config.`);
  return benchmark;
}

function getScenario(benchmark: BenchmarkConfig, id: string): ScenarioConfig {
  const scenario = benchmark.scenarios.find((item) => item.id === id);
  if (!scenario) throw new Error(`No scenario "${id}" found in benchmark "${benchmark.id}".`);
  return scenario;
}

function reportRow(
  report: CalibrationReport,
  pair: CalibrationPairReport,
  row: {
    sourceScore?: number;
    sourcePercentile?: number;
    globalPercentileTargetScore?: number;
    pairedWindowTargetScore?: number;
    pairedMonotonicTargetScore?: number;
    linearRegressionTargetScore?: number;
    trimmedRegressionTargetScore?: number;
    logRegressionTargetScore?: number;
    confidence?: string;
  },
): string {
  return [
    report.mapping.id,
    report.sourceBenchmark.name,
    report.targetBenchmark.name,
    pair.sourceScenario.id,
    pair.sourceScenario.name,
    pair.sourceScenario.leaderboardId,
    pair.targetScenario.id,
    pair.targetScenario.name,
    pair.targetScenario.leaderboardId,
    pair.comparison.overlappingPlayers,
    pair.comparison.correlation,
    row.sourceScore,
    row.sourcePercentile,
    row.globalPercentileTargetScore,
    row.pairedWindowTargetScore,
    row.pairedMonotonicTargetScore,
    row.linearRegressionTargetScore,
    row.trimmedRegressionTargetScore,
    row.logRegressionTargetScore,
    row.confidence,
  ].map(csvCell).join(",");
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function uniqueBy<T>(values: T[], key: (value: T) => string): T[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const itemKey = key(value);
    if (seen.has(itemKey)) return false;
    seen.add(itemKey);
    return true;
  });
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function formatOptional(value: number | undefined, digits: number): string {
  return value === undefined || !Number.isFinite(value) ? "n/a" : value.toFixed(digits);
}

function csvCell(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  const text = String(value);
  if (/["\n,]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}
