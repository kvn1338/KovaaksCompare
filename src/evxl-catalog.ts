import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { z } from "zod";
import type { BenchmarkConfig } from "./calibration.js";

const EVXL_BENCHMARKS_URL = "https://evxl.app/data/benchmarks";
const DEFAULT_EVXL_CACHE_PATH = "data/evxl-benchmarks.json";
const DEFAULT_MAX_AGE_HOURS = 48;

const EvxlSubcategorySchema = z.object({
  subcategoryName: z.string(),
  scenarioCount: z.number().int().nonnegative(),
  color: z.string().optional(),
});

const EvxlCategorySchema = z.object({
  categoryName: z.string(),
  color: z.string().optional(),
  subcategories: z.array(EvxlSubcategorySchema),
});

const EvxlDifficultySchema = z.object({
  difficultyName: z.string(),
  kovaaksBenchmarkId: z.union([z.number(), z.string()]).transform(String),
  categories: z.array(EvxlCategorySchema),
}).passthrough();

const EvxlBenchmarkSchema = z.object({
  benchmarkName: z.string(),
  difficulties: z.array(EvxlDifficultySchema),
}).passthrough();

const EvxlBenchmarkArraySchema = z.array(EvxlBenchmarkSchema);

const EvxlCatalogCacheSchema = z.object({
  fetchedAt: z.string(),
  sourceUrl: z.string(),
  benchmarks: EvxlBenchmarkArraySchema,
});

export type EvxlBenchmarkCatalog = z.infer<typeof EvxlCatalogCacheSchema>;
type EvxlDifficulty = z.infer<typeof EvxlDifficultySchema>;

export interface LoadEvxlBenchmarkCatalogOptions {
  path?: string;
  refresh?: boolean;
  maxAgeHours?: number;
}

export async function loadEvxlBenchmarkCatalog(
  options: LoadEvxlBenchmarkCatalogOptions = {},
): Promise<EvxlBenchmarkCatalog> {
  const path = options.path ?? DEFAULT_EVXL_CACHE_PATH;
  const maxAgeHours = options.maxAgeHours ?? DEFAULT_MAX_AGE_HOURS;

  if (!options.refresh && await isFresh(path, maxAgeHours)) {
    return readEvxlBenchmarkCatalog(path);
  }

  const response = await fetch(EVXL_BENCHMARKS_URL, {
    headers: { "user-agent": "KovaaksCompare/0.1" },
  });
  if (!response.ok) {
    throw new Error(`EVXL benchmark catalog returned HTTP ${response.status}.`);
  }

  const json = await response.json();
  const benchmarks = EvxlBenchmarkArraySchema.parse(json);
  const catalog: EvxlBenchmarkCatalog = {
    fetchedAt: new Date().toISOString(),
    sourceUrl: EVXL_BENCHMARKS_URL,
    benchmarks,
  };

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  return catalog;
}

export async function readEvxlBenchmarkCatalog(path = DEFAULT_EVXL_CACHE_PATH): Promise<EvxlBenchmarkCatalog> {
  const raw = await readFile(path, "utf8");
  return EvxlCatalogCacheSchema.parse(JSON.parse(raw));
}

export function enrichBenchmarkWithEvxlCategories(
  benchmark: BenchmarkConfig,
  catalog: EvxlBenchmarkCatalog | undefined,
): { benchmark: BenchmarkConfig; enriched: boolean; warning?: string } {
  if (!catalog || !benchmark.benchmarkId) {
    return { benchmark, enriched: false };
  }

  const difficulty = findEvxlDifficulty(catalog, benchmark.benchmarkId);
  if (!difficulty) {
    return {
      benchmark,
      enriched: false,
      warning: `No EVXL metadata found for benchmark ID ${benchmark.benchmarkId}; using KovaaK category labels.`,
    };
  }

  const groups = flattenCategoryGroups(difficulty);
  if (groups.length !== benchmark.scenarios.length) {
    return {
      benchmark,
      enriched: false,
      warning:
        `EVXL metadata for benchmark ID ${benchmark.benchmarkId} describes ${groups.length} scenario slot(s), ` +
        `but KovaaK returned ${benchmark.scenarios.length}; using KovaaK category labels.`,
    };
  }

  return {
    benchmark: {
      ...benchmark,
      scenarios: benchmark.scenarios.map((scenario, index) => ({
        ...scenario,
        category: groups[index]?.category ?? scenario.category,
        subcategory: groups[index]?.subcategory,
      })),
    },
    enriched: true,
  };
}

function findEvxlDifficulty(catalog: EvxlBenchmarkCatalog, benchmarkId: string): EvxlDifficulty | undefined {
  for (const benchmark of catalog.benchmarks) {
    const difficulty = benchmark.difficulties.find((item) => item.kovaaksBenchmarkId === benchmarkId);
    if (difficulty) return difficulty;
  }
  return undefined;
}

function flattenCategoryGroups(difficulty: EvxlDifficulty): Array<{ category: string; subcategory?: string }> {
  const groups: Array<{ category: string; subcategory?: string }> = [];
  for (const category of difficulty.categories) {
    for (const subcategory of category.subcategories) {
      const parent = category.categoryName.trim();
      const child = subcategory.subcategoryName.trim();
      for (let index = 0; index < subcategory.scenarioCount; index += 1) {
        groups.push({
          category: parent,
          subcategory: child || undefined,
        });
      }
    }
  }
  return groups;
}

async function isFresh(path: string, maxAgeHours: number): Promise<boolean> {
  try {
    const catalog = await readEvxlBenchmarkCatalog(path);
    const fetchedAt = Date.parse(catalog.fetchedAt);
    if (!Number.isFinite(fetchedAt)) return false;
    const ageMs = Date.now() - fetchedAt;
    return ageMs <= maxAgeHours * 60 * 60 * 1000;
  } catch {
    return false;
  }
}
