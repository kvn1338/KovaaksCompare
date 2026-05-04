import { KOVAAKS_API_CONFIG } from "./config.js";
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
import { enrichBenchmarkWithEvxlCategories, type EvxlBenchmarkCatalog } from "./evxl-catalog.js";

const ScenarioConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  leaderboardId: z.string().min(1).optional(),
  cutoffs: z.array(z.number().positive()).default([]),
  rankCutoffs: z.record(z.string(), z.number().positive()).optional(),
  category: z.string().min(1).optional(),
  subcategory: z.string().min(1).optional(),
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
  evxlCatalog?: EvxlBenchmarkCatalog;
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
    max: KOVAAKS_API_CONFIG.leaderboardPageSize,
  });

  const imported = {
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

  return enrichBenchmarkWithEvxlCategories(imported, input.evxlCatalog).benchmark;
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

export interface MappingValidationResult {
  mappingId: string;
  sourceBenchmark: BenchmarkConfig;
  targetBenchmark: BenchmarkConfig;
  pairCount: number;
  sourceScenarioCount: number;
  targetScenarioCount: number;
  duplicateSources: ScenarioConfig[];
  duplicateTargets: ScenarioConfig[];
  unpairedSources: ScenarioConfig[];
  unpairedTargets: ScenarioConfig[];
  missingSourceScenarioIds: string[];
  missingTargetScenarioIds: string[];
  categoryMismatches: MappingValidationPairIssue[];
  subcategoryMismatches: MappingValidationPairIssue[];
  inferredParentRenames: MappingValidationPairIssue[];
  suspiciousPairs: MappingValidationPairIssue[];
  missingLeaderboardIds: Array<{ side: "source" | "target"; scenario: ScenarioConfig }>;
  missingScoreData: Array<{ side: "source" | "target"; scenario: ScenarioConfig; leaderboardId: string }>;
  warnings: string[];
}

export interface MappingValidationPairIssue {
  sourceScenario: ScenarioConfig;
  targetScenario: ScenarioConfig;
  sourceCategory?: string;
  targetCategory?: string;
  similarity?: number;
  reason: string;
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
  const sourceParentBlocks = scenarioParentCategoryBlockMap(sourceBenchmark.scenarios);
  const targetParentBlocks = scenarioParentCategoryBlockMap(targetBenchmark.scenarios);

  const pairs: Array<{ sourceScenario: string; targetScenario: string }> = [];
  const unpairedSources: ScenarioConfig[] = [];
  const unpairedTargets: ScenarioConfig[] = [];
  const warnings: string[] = [];
  const renameCandidateSourcesByParent = new Map<string, ScenarioConfig[]>();
  const renameCandidateTargetsByParent = new Map<string, ScenarioConfig[]>();
  const unmatchedSourceParents = new Map<string, ScenarioConfig[]>();
  const unmatchedTargetParents = new Map<string, ScenarioConfig[]>();
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
      addLeftovers(renameCandidateTargetsByParent, targets, targetParentBlocks);
      continue;
    }
    if (targets.length === 0) {
      addLeftovers(renameCandidateSourcesByParent, sources, sourceParentBlocks);
      continue;
    }
    if (sources.length !== targets.length) {
      warnings.push(
        `Category ${label} has ${sources.length} source vs ${targets.length} target scenario(s); pairing best-effort, please verify.`,
      );
    }

    const paired = pairScenariosByNameThenOrder(sources, targets);
    pairs.push(...paired.pairs);
    unpairedSources.push(...paired.unpairedSources);
    unpairedTargets.push(...paired.unpairedTargets);
  }

  const parentOrder = orderedParentCategories(sourceBenchmark.scenarios, targetBenchmark.scenarios);
  for (const parent of parentOrder) {
    const sources = renameCandidateSourcesByParent.get(parent) ?? [];
    const targets = renameCandidateTargetsByParent.get(parent) ?? [];
    if (sources.length === 0 && targets.length === 0) continue;

    if (sources.length === 0) {
      unmatchedTargetParents.set(parent, targets);
      continue;
    }
    if (targets.length === 0) {
      unmatchedSourceParents.set(parent, sources);
      continue;
    }

    warnings.push(
      `Parent category ${categoryLabel(parent)} has source-only and target-only subcategory block(s); paired those blocks by order assuming a subcategory rename or restructure. Please verify.`,
    );
    if (sources.length !== targets.length) {
      warnings.push(
        `Parent category ${categoryLabel(parent)} has ${sources.length} leftover source vs ${targets.length} leftover target scenario(s); pairing best-effort.`,
      );
    }

    const paired = pairScenariosByNameThenOrder(sources, targets);
    pairs.push(...paired.pairs);
    unpairedSources.push(...paired.unpairedSources);
    unpairedTargets.push(...paired.unpairedTargets);
  }

  const parentRenamePairs = suggestParentRenamePairs(parentOrder, unmatchedSourceParents, unmatchedTargetParents);
  const remappedSourceParents = new Set<string>();
  const remappedTargetParents = new Set<string>();
  for (const item of parentRenamePairs) {
    remappedSourceParents.add(item.sourceParent);
    remappedTargetParents.add(item.targetParent);
    warnings.push(
      `Parent category ${categoryLabel(item.sourceParent)} may have been renamed to ${categoryLabel(item.targetParent)} ` +
        `(similarity ${item.similarity.toFixed(2)}); paired by order. Please verify.`,
    );
    const paired = pairScenariosByNameThenOrder(item.sources, item.targets);
    pairs.push(...paired.pairs);
    unpairedSources.push(...paired.unpairedSources);
    unpairedTargets.push(...paired.unpairedTargets);
  }

  for (const [parent, sources] of unmatchedSourceParents) {
    if (remappedSourceParents.has(parent)) continue;
    unpairedSources.push(...sources);
    warnings.push(
      `Parent category ${categoryLabel(parent)} has ${sources.length} source-only scenario(s); no pairs created.`,
    );
  }
  for (const [parent, targets] of unmatchedTargetParents) {
    if (remappedTargetParents.has(parent)) continue;
    unpairedTargets.push(...targets);
    warnings.push(
      `Parent category ${categoryLabel(parent)} has ${targets.length} target-only scenario(s); no pairs created.`,
    );
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

export function validateMapping(input: {
  config: CalibrationConfig;
  mapping: CalibrationMapping;
  db?: AppDatabase;
  suspiciousSimilarityThreshold?: number;
}): MappingValidationResult {
  const sourceBenchmark = getBenchmark(input.config, input.mapping.sourceBenchmark);
  const targetBenchmark = getBenchmark(input.config, input.mapping.targetBenchmark);
  const sourceById = new Map(sourceBenchmark.scenarios.map((scenario) => [scenario.id, scenario]));
  const targetById = new Map(targetBenchmark.scenarios.map((scenario) => [scenario.id, scenario]));
  const sourceUsage = countScenarioUsage(input.mapping.pairs.map((pair) => pair.sourceScenario));
  const targetUsage = countScenarioUsage(input.mapping.pairs.map((pair) => pair.targetScenario));
  const sourceBlocks = scenarioCategoryBlockMap(sourceBenchmark.scenarios);
  const targetBlocks = scenarioCategoryBlockMap(targetBenchmark.scenarios);
  const sourceParentBlocks = scenarioParentCategoryBlockMap(sourceBenchmark.scenarios);
  const targetParentBlocks = scenarioParentCategoryBlockMap(targetBenchmark.scenarios);
  const inferredParentRenames = inferredParentRenameMap(sourceBenchmark.scenarios, targetBenchmark.scenarios);
  const similarityThreshold = input.suspiciousSimilarityThreshold ?? 0.08;

  const duplicateSources = [...sourceUsage.entries()]
    .filter(([, count]) => count > 1)
    .map(([id]) => sourceById.get(id))
    .filter((scenario): scenario is ScenarioConfig => Boolean(scenario));
  const duplicateTargets = [...targetUsage.entries()]
    .filter(([, count]) => count > 1)
    .map(([id]) => targetById.get(id))
    .filter((scenario): scenario is ScenarioConfig => Boolean(scenario));

  const missingSourceScenarioIds = [...sourceUsage.keys()].filter((id) => !sourceById.has(id));
  const missingTargetScenarioIds = [...targetUsage.keys()].filter((id) => !targetById.has(id));
  const pairedSourceIds = new Set([...sourceUsage.keys()].filter((id) => sourceById.has(id)));
  const pairedTargetIds = new Set([...targetUsage.keys()].filter((id) => targetById.has(id)));
  const unpairedSources = sourceBenchmark.scenarios.filter((scenario) => !pairedSourceIds.has(scenario.id));
  const unpairedTargets = targetBenchmark.scenarios.filter((scenario) => !pairedTargetIds.has(scenario.id));
  const categoryMismatches: MappingValidationPairIssue[] = [];
  const subcategoryMismatches: MappingValidationPairIssue[] = [];
  const inferredParentRenameIssues: MappingValidationPairIssue[] = [];
  const suspiciousPairs: MappingValidationPairIssue[] = [];
  const missingLeaderboardIds: Array<{ side: "source" | "target"; scenario: ScenarioConfig }> = [];
  const missingScoreData: Array<{ side: "source" | "target"; scenario: ScenarioConfig; leaderboardId: string }> = [];

  for (const scenario of sourceBenchmark.scenarios) {
    if (!scenario.leaderboardId) missingLeaderboardIds.push({ side: "source", scenario });
  }
  for (const scenario of targetBenchmark.scenarios) {
    if (!scenario.leaderboardId) missingLeaderboardIds.push({ side: "target", scenario });
  }

  for (const pair of input.mapping.pairs) {
    const sourceScenario = sourceById.get(pair.sourceScenario);
    const targetScenario = targetById.get(pair.targetScenario);
    if (!sourceScenario || !targetScenario) continue;
    const sourceCategory = sourceBlocks.get(sourceScenario.id);
    const targetCategory = targetBlocks.get(targetScenario.id);
    const sourceParentCategory = sourceParentBlocks.get(sourceScenario.id);
    const targetParentCategory = targetParentBlocks.get(targetScenario.id);
    if (sourceParentCategory !== targetParentCategory) {
      const inferredTarget = sourceParentCategory ? inferredParentRenames.get(sourceParentCategory) : undefined;
      if (inferredTarget === targetParentCategory) {
        inferredParentRenameIssues.push({
          sourceScenario,
          targetScenario,
          sourceCategory: sourceParentCategory,
          targetCategory: targetParentCategory,
          reason: "Paired scenarios cross parent categories that look like an inferred rename.",
        });
      } else {
        categoryMismatches.push({
          sourceScenario,
          targetScenario,
          sourceCategory: sourceParentCategory,
          targetCategory: targetParentCategory,
          reason: "Paired scenarios are in different parent category blocks.",
        });
      }
    } else if (sourceCategory !== targetCategory) {
      subcategoryMismatches.push({
        sourceScenario,
        targetScenario,
        sourceCategory,
        targetCategory,
        reason: "Paired scenarios are in different subcategory blocks within the same parent category.",
      });
    }
    const similarity = jaccard(tokenize(sourceScenario.name), tokenize(targetScenario.name));
    if (similarity < similarityThreshold) {
      suspiciousPairs.push({
        sourceScenario,
        targetScenario,
        sourceCategory,
        targetCategory,
        similarity,
        reason: `Name token similarity is below ${similarityThreshold}.`,
      });
    }
  }

  if (input.db) {
    for (const scenario of sourceBenchmark.scenarios) {
      if (!scenario.leaderboardId) continue;
      if (input.db.getScoreCount(scenario.leaderboardId) === 0) {
        missingScoreData.push({ side: "source", scenario, leaderboardId: scenario.leaderboardId });
      }
    }
    for (const scenario of targetBenchmark.scenarios) {
      if (!scenario.leaderboardId) continue;
      if (input.db.getScoreCount(scenario.leaderboardId) === 0) {
        missingScoreData.push({ side: "target", scenario, leaderboardId: scenario.leaderboardId });
      }
    }
  }

  const warnings: string[] = [];
  if (duplicateSources.length > 0) warnings.push(`${duplicateSources.length} source scenario(s) are mapped more than once.`);
  if (duplicateTargets.length > 0) warnings.push(`${duplicateTargets.length} target scenario(s) are mapped more than once.`);
  if (missingSourceScenarioIds.length > 0) warnings.push(`${missingSourceScenarioIds.length} source scenario ID(s) do not exist in the source benchmark.`);
  if (missingTargetScenarioIds.length > 0) warnings.push(`${missingTargetScenarioIds.length} target scenario ID(s) do not exist in the target benchmark.`);
  if (categoryMismatches.length > 0) warnings.push(`${categoryMismatches.length} pair(s) cross parent category blocks.`);
  if (inferredParentRenameIssues.length > 0) warnings.push(`${inferredParentRenameIssues.length} pair(s) cross inferred renamed parent categories.`);
  if (subcategoryMismatches.length > 0) warnings.push(`${subcategoryMismatches.length} pair(s) cross subcategory blocks within the same parent category.`);
  if (suspiciousPairs.length > 0) warnings.push(`${suspiciousPairs.length} pair(s) have low name similarity and should be reviewed.`);
  if (missingLeaderboardIds.length > 0) warnings.push(`${missingLeaderboardIds.length} scenario(s) are missing leaderboard IDs.`);
  if (missingScoreData.length > 0) warnings.push(`${missingScoreData.length} scenario(s) have no scores stored in the provided database.`);

  return {
    mappingId: input.mapping.id,
    sourceBenchmark,
    targetBenchmark,
    pairCount: input.mapping.pairs.length,
    sourceScenarioCount: sourceBenchmark.scenarios.length,
    targetScenarioCount: targetBenchmark.scenarios.length,
    duplicateSources,
    duplicateTargets,
    unpairedSources,
    unpairedTargets,
    missingSourceScenarioIds,
    missingTargetScenarioIds,
    categoryMismatches,
    subcategoryMismatches,
    inferredParentRenames: inferredParentRenameIssues,
    suspiciousPairs,
    missingLeaderboardIds,
    missingScoreData,
    warnings,
  };
}

function groupByMatchingCategory(scenarios: ScenarioConfig[]): Map<string, ScenarioConfig[]> {
  const groups = new Map<string, ScenarioConfig[]>();
  const occurrences = new Map<string, number>();
  let previousBaseKey: string | undefined;
  let currentKey: string | undefined;

  for (const scenario of scenarios) {
    const baseKey = normalizedCategoryKey(scenario);
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

function scenarioCategoryBlockMap(scenarios: ScenarioConfig[]): Map<string, string> {
  const output = new Map<string, string>();
  for (const [category, categoryScenarios] of groupByMatchingCategory(scenarios)) {
    for (const scenario of categoryScenarios) {
      output.set(scenario.id, category);
    }
  }
  return output;
}

function scenarioParentCategoryBlockMap(scenarios: ScenarioConfig[]): Map<string, string> {
  const output = new Map<string, string>();
  for (const [category, categoryScenarios] of groupByParentCategory(scenarios)) {
    for (const scenario of categoryScenarios) {
      output.set(scenario.id, category);
    }
  }
  return output;
}

function groupByParentCategory(scenarios: ScenarioConfig[]): Map<string, ScenarioConfig[]> {
  const groups = new Map<string, ScenarioConfig[]>();
  const occurrences = new Map<string, number>();
  let previousBaseKey: string | undefined;
  let currentKey: string | undefined;

  for (const scenario of scenarios) {
    const baseKey = normalizedParentCategoryKey(scenario);
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

function addLeftovers(
  target: Map<string, ScenarioConfig[]>,
  scenarios: ScenarioConfig[],
  parentBlocks: Map<string, string>,
): void {
  for (const scenario of scenarios) {
    const parent = parentBlocks.get(scenario.id) ?? categoryBucketKey(UNCATEGORIZED, 1);
    const bucket = target.get(parent);
    if (bucket) {
      bucket.push(scenario);
    } else {
      target.set(parent, [scenario]);
    }
  }
}

function pairScenariosByNameThenOrder(
  sources: ScenarioConfig[],
  targets: ScenarioConfig[],
): {
  pairs: Array<{ sourceScenario: string; targetScenario: string }>;
  unpairedSources: ScenarioConfig[];
  unpairedTargets: ScenarioConfig[];
} {
  const pairs: Array<{ sourceScenario: string; targetScenario: string }> = [];
  const usedSourceIndexes = new Set<number>();
  const usedTargetIndexes = new Set<number>();
  const targetsByName = new Map<string, number[]>();

  targets.forEach((target, index) => {
    const key = normalizedScenarioName(target.name);
    const bucket = targetsByName.get(key);
    if (bucket) {
      bucket.push(index);
    } else {
      targetsByName.set(key, [index]);
    }
  });

  sources.forEach((source, sourceIndex) => {
    const targetIndexes = targetsByName.get(normalizedScenarioName(source.name)) ?? [];
    const targetIndex = targetIndexes.find((index) => !usedTargetIndexes.has(index));
    if (targetIndex === undefined) return;
    usedSourceIndexes.add(sourceIndex);
    usedTargetIndexes.add(targetIndex);
    pairs.push({
      sourceScenario: source.id,
      targetScenario: targets[targetIndex].id,
    });
  });

  const remainingSources = sources
    .map((source, index) => ({ source, index }))
    .filter((item) => !usedSourceIndexes.has(item.index));
  const remainingTargets = targets
    .map((target, index) => ({ target, index }))
    .filter((item) => !usedTargetIndexes.has(item.index));
  const orderedPairCount = Math.min(remainingSources.length, remainingTargets.length);

  for (let index = 0; index < orderedPairCount; index += 1) {
    pairs.push({
      sourceScenario: remainingSources[index].source.id,
      targetScenario: remainingTargets[index].target.id,
    });
    usedSourceIndexes.add(remainingSources[index].index);
    usedTargetIndexes.add(remainingTargets[index].index);
  }

  return {
    pairs,
    unpairedSources: sources.filter((_, index) => !usedSourceIndexes.has(index)),
    unpairedTargets: targets.filter((_, index) => !usedTargetIndexes.has(index)),
  };
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

function orderedParentCategories(
  sourceScenarios: ScenarioConfig[],
  targetScenarios: ScenarioConfig[],
): string[] {
  const ordered: string[] = [];
  for (const category of [
    ...groupByParentCategory(sourceScenarios).keys(),
    ...groupByParentCategory(targetScenarios).keys(),
  ]) {
    if (!ordered.includes(category)) ordered.push(category);
  }
  return ordered;
}

function suggestParentRenamePairs(
  parentOrder: string[],
  sourceParents: Map<string, ScenarioConfig[]>,
  targetParents: Map<string, ScenarioConfig[]>,
): Array<{
  sourceParent: string;
  targetParent: string;
  sources: ScenarioConfig[];
  targets: ScenarioConfig[];
  similarity: number;
}> {
  const output: Array<{
    sourceParent: string;
    targetParent: string;
    sources: ScenarioConfig[];
    targets: ScenarioConfig[];
    similarity: number;
  }> = [];
  const usedTargets = new Set<string>();
  const targetKeys = [...targetParents.keys()];

  for (const sourceParent of sourceParents.keys()) {
    const sources = sourceParents.get(sourceParent) ?? [];
    const sourceIndex = parentOrder.indexOf(sourceParent);
    const candidates = targetKeys
      .filter((targetParent) => !usedTargets.has(targetParent))
      .map((targetParent) => {
        const targets = targetParents.get(targetParent) ?? [];
        return {
          sourceParent,
          targetParent,
          sources,
          targets,
          similarity: parentCategorySimilarity(sourceParent, targetParent),
          distance: Math.abs(sourceIndex - parentOrder.indexOf(targetParent)),
        };
      })
      .filter((item) =>
        item.sources.length === item.targets.length &&
        item.sources.length > 0 &&
        item.distance <= 1 &&
        item.similarity >= 0.2,
      )
      .sort((a, b) => b.similarity - a.similarity || a.distance - b.distance);

    const best = candidates[0];
    if (!best) continue;
    usedTargets.add(best.targetParent);
    output.push(best);
  }

  return output;
}

function inferredParentRenameMap(
  sourceScenarios: ScenarioConfig[],
  targetScenarios: ScenarioConfig[],
): Map<string, string> {
  const sourceParents = groupByParentCategory(sourceScenarios);
  const targetParents = groupByParentCategory(targetScenarios);
  const sourceOnly = new Map([...sourceParents].filter(([key]) => !targetParents.has(key)));
  const targetOnly = new Map([...targetParents].filter(([key]) => !sourceParents.has(key)));
  const parentOrder = orderedParentCategories(sourceScenarios, targetScenarios);
  const output = new Map<string, string>();
  for (const item of suggestParentRenamePairs(parentOrder, sourceOnly, targetOnly)) {
    output.set(item.sourceParent, item.targetParent);
  }
  return output;
}

function parentCategorySimilarity(sourceParent: string, targetParent: string): number {
  const sourceName = parentCategoryName(sourceParent);
  const targetName = parentCategoryName(targetParent);
  const lexical = jaccard(tokenize(sourceName), tokenize(targetName));
  const sourceKeywords = categorySemanticTokens(sourceName);
  const targetKeywords = categorySemanticTokens(targetName);
  const semantic = jaccard(sourceKeywords, targetKeywords);
  return Math.max(lexical, semantic);
}

function parentCategoryName(key: string): string {
  return key.split(CATEGORY_OCCURRENCE_SEPARATOR)[0] ?? key;
}

function categorySemanticTokens(name: string): Set<string> {
  const tokens = tokenize(name);
  const expanded = new Set(tokens);
  if (tokens.has("dynamic")) expanded.add("timing");
  if (tokens.has("clicking")) expanded.add("click");
  if (tokens.has("click")) expanded.add("clicking");
  if (tokens.has("timing")) expanded.add("dynamic");
  if (tokens.has("switching")) expanded.add("switch");
  if (tokens.has("switch")) expanded.add("switching");
  return expanded;
}

function normalizedScenarioName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizedCategoryKey(scenario: ScenarioConfig): string {
  const parts = scenarioCategoryParts(scenario);
  if (!parts.category) return UNCATEGORIZED;
  return [parts.category, parts.subcategory].filter(Boolean).join(" / ");
}

function normalizedParentCategoryKey(scenario: ScenarioConfig): string {
  const parts = scenarioCategoryParts(scenario);
  return parts.category ?? UNCATEGORIZED;
}

function categoryBucketKey(baseKey: string, occurrence: number): string {
  return `${baseKey}${CATEGORY_OCCURRENCE_SEPARATOR}${occurrence}`;
}

function categoryLabel(key: string): string {
  const [baseKey, occurrence] = key.split(CATEGORY_OCCURRENCE_SEPARATOR);
  if (baseKey === UNCATEGORIZED) return "(uncategorized)";
  return occurrence && occurrence !== "1" ? `"${baseKey}" block ${occurrence}` : `"${baseKey}"`;
}

function scenarioCategoryParts(scenario: ScenarioConfig): { category?: string; subcategory?: string } {
  const category = scenario.category?.trim();
  const subcategory = scenario.subcategory?.trim();
  if (category?.includes(" / ") && !subcategory) {
    const [parent, ...rest] = category.split(" / ");
    return {
      category: parent.trim() || undefined,
      subcategory: rest.join(" / ").trim() || undefined,
    };
  }
  return {
    category: category || undefined,
    subcategory: subcategory || undefined,
  };
}

function countScenarioUsage(ids: string[]): Map<string, number> {
  const output = new Map<string, number>();
  for (const id of ids) {
    output.set(id, (output.get(id) ?? 0) + 1);
  }
  return output;
}

function tokenize(name: string): Set<string> {
  return new Set(
    name
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 1),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
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
    lines.push(`- Source leaderboard: ${pair.sourceScenario.leaderboardId ?? "unresolved"}`);
    lines.push(`- Target leaderboard: ${pair.targetScenario.leaderboardId ?? "unresolved"}`);
    lines.push(`- Overlapping players: ${pair.comparison.overlappingPlayers} (${pair.comparison.overlapPercentage.toFixed(1)}%)`);
    lines.push(`- Correlation: ${formatOptional(pair.comparison.correlation, 4)}`);
    lines.push(`- Log correlation: ${formatOptional(pair.comparison.logCorrelation, 4)}`);
    if (pair.comparison.regression) {
      lines.push(
        `- Linear regression: target ~= ${pair.comparison.regression.slope.toFixed(4)} * source + ` +
          `${pair.comparison.regression.intercept.toFixed(2)} (R^2 ${pair.comparison.regression.rSquared.toFixed(4)})`,
      );
    }
    if (pair.comparison.trimmedRegression) {
      lines.push(
        `- Trimmed regression: target ~= ${pair.comparison.trimmedRegression.slope.toFixed(4)} * source + ` +
          `${pair.comparison.trimmedRegression.intercept.toFixed(2)} ` +
          `(R^2 ${pair.comparison.trimmedRegression.rSquared.toFixed(4)}, n=${pair.comparison.trimmedRegression.sampleSize})`,
      );
    }
    if (pair.comparison.logRegression) {
      lines.push(
        `- Log-log regression: log(target) ~= ${pair.comparison.logRegression.slope.toFixed(4)} * log(source) + ` +
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
