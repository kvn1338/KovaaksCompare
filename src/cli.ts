#!/usr/bin/env node
import { Command } from "commander";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { KovaaksClient } from "./kovaaks-client.js";
import { compareUserScenarios, formatNumber } from "./comparison.js";
import { AppDatabase } from "./database.js";
import { existsSync } from "node:fs";
import {
  CALIBRATION_TEMPLATE,
  appendBenchmarkToConfig,
  buildCalibrationReport,
  calibrationReportToCsv,
  calibrationReportToMarkdown,
  downloadBenchmarkIndex,
  importBenchmarkFromApi,
  loadBenchmarkIndex,
  loadCalibrationMapping,
  loadCalibrationConfig,
  resolvedScenariosForBenchmarks,
  resolveCalibrationConfig,
  suggestMapping,
  validateMapping,
  withMapping,
  type CalibrationConfig,
  type MappingSuggestion,
  type MappingValidationResult,
} from "./calibration.js";

const DEFAULT_INDEX_PATH = "configs/benchmark-index.json";
const DEFAULT_BENCHMARKS_PATH = "configs/benchmarks.json";
import {
  buildLeaderboardCutoffs,
  collectLeaderboards,
  collectResolvedLeaderboards,
  compareStoredLeaderboards,
  type LeaderboardCutoffsOutput,
  type LeaderboardCollectOutput,
  type LeaderboardCompareOutput,
} from "./leaderboard.js";
import type { UserComparisonOutput } from "./comparison.js";

const METRICS_GLOSSARY = [
  "Glossary:",
  "- Overlapping players, overlap %: paired players appearing in both leaderboards. Below ~50 paired players makes the rest shaky.",
  "- Correlation (Pearson): linear strength of paired source vs target scores in [-1, 1]; near 1 means target tracks source closely.",
  "- Log correlation: same metric on log(score). Often higher than raw when scores span a wide range; suggests a multiplicative relationship.",
  "- Linear regression: target ~= a*source + b. Use slope/intercept to project a source score; R^2 is the share of variance explained.",
  "- Trimmed regression: linear fit after dropping the largest residual outliers (--outlier-trim-percent). Less sensitive to weird players.",
  "- Log-log regression: log(target) ~= a*log(source) + b, projected back via exp(...). Better when scores scale multiplicatively across the range.",
  "- Percentile mapping (global): source score at percentile P vs target score at percentile P, computed independently per leaderboard.",
  "- Paired-player quantile mapping: median target score among the ~5% of paired players whose source score sits nearest the queried value.",
  "- Paired-window target score: same paired median anchored at a specific cutoff. n= is the window sample size.",
  "- Monotonic paired target score: paired-window estimates at every 5th percentile, forced non-decreasing. Use for cutoff ladders.",
  "- Confidence: low/medium/high heuristic over overlap count and ratio. Treat 'low' as informational only.",
  "- Top outliers: paired players with the largest signed residual against the linear regression. + over-performers in target, - under-performers.",
  "Workflow tip: prefer paired-window where overlap is dense at the cutoff, fall back to log-log at extreme tails, use monotonic for full rank ladders. Large divergence between estimators signals data sparsity.",
].join("\n");

const program = new Command();

program
  .name("kovaaks-compare")
  .description(
    "Prototype CLI for comparing KovaaK's benchmark scenario scores.",
  )
  .version("0.1.0");

program
  .command("user")
  .description(
    "Compare one player across one source scenario and 1-3 target scenarios.",
  )
  .requiredOption(
    "--player <player>",
    "Steam ID, webapp username, or display username",
  )
  .requiredOption(
    "--source <scenario>",
    "Source scenario name or leaderboard ID",
  )
  .requiredOption(
    "--targets <scenarios>",
    "Comma-separated target scenario names or leaderboard IDs",
  )
  .option(
    "--max-pages <count>",
    "Max leaderboard pages to scan for player fallback lookup",
    parseInteger,
    100,
  )
  .option("--json", "Print JSON instead of terminal text")
  .option("--csv <path>", "Export pair summary as CSV")
  .option("--refresh", "Bypass local API response cache")
  .option("--debug", "Print API requests to stderr")
  .option(
    "--db <path>",
    "Use a previously collected SQLite leaderboard to compute equivalent target scores locally",
  )
  .action(async (options) => {
    const targets = String(options.targets)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (targets.length < 1 || targets.length > 3) {
      throw new Error(
        "--targets must contain 1 to 3 comma-separated scenarios.",
      );
    }

    const client = new KovaaksClient({
      refresh: options.refresh,
      debug: options.debug,
    });
    const db = options.db ? new AppDatabase(options.db) : undefined;
    try {
      const output = await compareUserScenarios(client, {
        player: options.player,
        sourceScenario: options.source,
        targetScenarios: targets,
        scoreMode: { type: "best" },
        maxPages: options.maxPages,
        db,
      });

      if (options.csv) {
        await writeFile(options.csv, toCsv(output));
      }

      if (options.json) {
        console.log(JSON.stringify(output, null, 2));
      } else {
        console.log(formatUserOutput(output));
        if (options.csv) {
          console.log(`\nCSV written to ${options.csv}`);
        }
      }
    } finally {
      db?.close();
    }
  });

const leaderboard = program
  .command("leaderboard")
  .description("Collect and compare leaderboard populations with SQLite.");

leaderboard
  .command("collect")
  .description("Collect scenario leaderboard pages into SQLite.")
  .option(
    "--scenarios <scenarios>",
    "Comma-separated scenario names or leaderboard IDs",
  )
  .option(
    "--source <scenario>",
    "Compatibility alias: source scenario name or leaderboard ID",
  )
  .option(
    "--targets <scenarios>",
    "Compatibility alias: comma-separated target scenario names or leaderboard IDs",
  )
  .option("--db <path>", "SQLite database path", "data/kovaaks-compare.sqlite")
  .option(
    "--max-pages <count>",
    "Optional max pages per leaderboard; omit to collect all pages",
    parseInteger,
  )
  .option(
    "--sample-rate <rate>",
    "Fetch a rank-stratified sample of pages, e.g. 0.2 fetches roughly every 5th page; ignored for leaderboards with 50 pages or fewer",
    parseSampleRate,
  )
  .option(
    "--refresh-db",
    "Refetch pages even when successful page records already exist",
  )
  .option(
    "--max-age-hours <hours>",
    "Refetch successful page records older than this many hours",
    parseNumber,
  )
  .option(
    "--request-delay-ms <ms>",
    "Initial delay between API requests",
    parseInteger,
    750,
  )
  .option(
    "--max-request-delay-ms <ms>",
    "Maximum adaptive delay between API requests",
    parseInteger,
    15000,
  )
  .option(
    "--max-retries <count>",
    "Retry attempts for retryable API errors",
    parseInteger,
    6,
  )
  .option("--json", "Print JSON instead of terminal text")
  .option("--refresh", "Bypass local API response cache")
  .option("--debug", "Print API requests to stderr")
  .action(async (options) => {
    const scenarios = parseCollectScenarios(options);
    const client = new KovaaksClient({
      refresh: options.refresh,
      debug: options.debug,
      requestDelayMs: options.requestDelayMs,
      maxRequestDelayMs: options.maxRequestDelayMs,
      maxRetries: options.maxRetries,
    });
    const db = new AppDatabase(options.db);
    try {
      const output = await collectLeaderboards(client, db, {
        scenarios,
        maxPages: options.maxPages,
        sampleRate: options.sampleRate,
        refreshDb: options.refreshDb,
        maxAgeHours: options.maxAgeHours,
        onProgress: options.json
          ? undefined
          : (progress) => {
              const totalPages =
                progress.totalPages === undefined
                  ? "?"
                  : String(progress.totalPages);
              console.error(
                `[collect] ${progress.scenarioName} (${progress.leaderboardId}) ` +
                  `page ${progress.page + 1}/${totalPages} ${progress.status}, stored ` +
                  `${progress.scoresStored}/${progress.totalAvailable}` +
                  `${progress.error ? `, error: ${progress.error}` : ""}`,
              );
            },
      });
      if (options.json) {
        console.log(JSON.stringify(output, null, 2));
      } else {
        console.log(formatCollectOutput(output, options.db));
      }
    } finally {
      db.close();
    }
  });

leaderboard
  .command("compare")
  .description(
    "Compare previously collected source and target leaderboard populations.",
  )
  .requiredOption("--source <leaderboardId>", "Collected source leaderboard ID")
  .requiredOption(
    "--targets <leaderboardIds>",
    "Comma-separated collected target leaderboard IDs",
  )
  .option("--db <path>", "SQLite database path", "data/kovaaks-compare.sqlite")
  .option(
    "--paired-only",
    "Restrict percentile mapping and compared distributions to overlapping Steam IDs",
  )
  .option(
    "--percentiles <values>",
    "Comma-separated percentile rows to report",
    "50,60,75,88,95",
  )
  .option(
    "--outlier-trim-percent <percent>",
    "Trim this percentage of largest residual outliers for robust regression",
    parseTrimPercent,
    0,
  )
  .option(
    "--outlier-limit <count>",
    "Number of residual outliers to include in output",
    parseNonNegativeInteger,
    10,
  )
  .option("--json", "Print JSON instead of terminal text")
  .option("--csv <path>", "Export comparison summary as CSV")
  .option(
    "--explain",
    "Append a short glossary describing each reported metric",
  )
  .action(async (options) => {
    const targetLeaderboardIds = parseTargets(options.targets);
    const percentiles = parsePercentiles(options.percentiles);
    const db = new AppDatabase(options.db);
    try {
      const output = compareStoredLeaderboards(db, {
        sourceLeaderboardId: String(options.source),
        targetLeaderboardIds,
        pairedOnly: options.pairedOnly,
        percentiles,
        outlierTrimPercent: options.outlierTrimPercent,
        outlierLimit: options.outlierLimit,
      });
      if (options.csv) {
        await writeFile(options.csv, leaderboardCompareToCsv(output));
      }
      if (options.json) {
        console.log(JSON.stringify(output, null, 2));
      } else {
        console.log(formatLeaderboardCompareOutput(output));
        if (options.csv) {
          console.log(`\nCSV written to ${options.csv}`);
        }
        if (options.explain) {
          console.log(`\n${METRICS_GLOSSARY}`);
        }
      }
    } finally {
      db.close();
    }
  });

leaderboard
  .command("cutoffs")
  .description(
    "Map proposed source score cutoffs onto collected target leaderboards.",
  )
  .requiredOption("--source <leaderboardId>", "Collected source leaderboard ID")
  .requiredOption(
    "--targets <leaderboardIds>",
    "Comma-separated collected target leaderboard IDs",
  )
  .requiredOption(
    "--source-cutoffs <scores>",
    "Comma-separated source cutoff scores to map",
  )
  .option("--db <path>", "SQLite database path", "data/kovaaks-compare.sqlite")
  .option(
    "--outlier-trim-percent <percent>",
    "Trim this percentage of largest residual outliers for robust regression",
    parseTrimPercent,
    0,
  )
  .option("--json", "Print JSON instead of terminal text")
  .option("--csv <path>", "Export cutoff rows as CSV")
  .option(
    "--explain",
    "Append a short glossary describing each reported metric",
  )
  .action(async (options) => {
    const targetLeaderboardIds = parseTargets(options.targets);
    const sourceCutoffs = parseScoreList(options.sourceCutoffs);
    const db = new AppDatabase(options.db);
    try {
      const output = buildLeaderboardCutoffs(db, {
        sourceLeaderboardId: String(options.source),
        targetLeaderboardIds,
        sourceCutoffs,
        outlierTrimPercent: options.outlierTrimPercent,
      });
      if (options.csv) {
        await writeFile(options.csv, leaderboardCutoffsToCsv(output));
      }
      if (options.json) {
        console.log(JSON.stringify(output, null, 2));
      } else {
        console.log(formatLeaderboardCutoffsOutput(output));
        if (options.csv) {
          console.log(`\nCSV written to ${options.csv}`);
        }
        if (options.explain) {
          console.log(`\n${METRICS_GLOSSARY}`);
        }
      }
    } finally {
      db.close();
    }
  });

const benchmarks = program
  .command("benchmarks")
  .description("Download benchmark metadata into configs/benchmarks.json.");

benchmarks
  .command("download")
  .description("Download the benchmark name-to-ID index.")
  .option("--out <path>", "Path for benchmark index JSON", DEFAULT_INDEX_PATH)
  .option("--username <username>", "Override username used for the API request cache key", "KovaaksCompare")
  .option("--refresh", "Bypass local API response cache")
  .option("--debug", "Print API requests to stderr")
  .action(async (options) => {
    const client = new KovaaksClient({ refresh: options.refresh, debug: options.debug });
    const index = await downloadBenchmarkIndex(client, options.username);
    await writeTextFile(options.out, `${JSON.stringify(index, null, 2)}\n`);
    console.log(`Benchmark index with ${index.benchmarks.length} benchmark(s) written to ${options.out}`);
  });

benchmarks
  .command("import")
  .description("Import one benchmark's scenarios and cutoff values.")
  .argument("<benchmark>", "Benchmark name or KovaaK benchmark ID")
  .option("--out <path>", "Path for updated benchmark metadata JSON", DEFAULT_BENCHMARKS_PATH)
  .option("--index <path>", "Benchmark index JSON for name lookup; auto-detected by default")
  .option("--key <id>", "Local benchmark ID; defaults to slugified benchmark name")
  .option("--difficulty <label>", "Difficulty label to store in benchmark metadata")
  .option("--steam-id <steamId>", "Override dummy SteamID64 query parameter", "11111111111111111")
  .option("--username <username>", "Override username used for benchmark name lookup", "KovaaksCompare")
  .option("--refresh", "Bypass local API response cache")
  .option("--debug", "Print API requests to stderr")
  .action(async (benchmark: string, options) => {
    const indexPath = options.index ?? (existsSync(DEFAULT_INDEX_PATH) ? DEFAULT_INDEX_PATH : undefined);
    const target = await resolveImportBenchmarkOptions({
      index: indexPath,
      benchmarkId: /^\d+$/.test(benchmark) ? benchmark : undefined,
      benchmarkName: /^\d+$/.test(benchmark) ? undefined : benchmark,
    });
    const client = new KovaaksClient({ refresh: options.refresh, debug: options.debug });
    const imported = await importBenchmarkFromApi(client, {
      username: options.username,
      benchmarkId: target.benchmarkId,
      benchmarkName: target.benchmarkName,
      steamId: options.steamId,
      id: options.key,
      difficulty: options.difficulty,
    });
    const existing = existsSync(options.out) ? await loadCalibrationConfig(options.out) : undefined;
    const updated = appendBenchmarkToConfig(existing, imported);
    await writeTextFile(options.out, `${JSON.stringify(updated, null, 2)}\n`);
    console.log(`Imported ${imported.scenarios.length} scenario(s) from ${imported.name} to ${options.out}`);
  });

const match = program
  .command("match")
  .description("Create editable source-target benchmark matching files.");

match
  .command("create")
  .description("Create configs/<match-id>.json by pairing scenarios sequentially within categories.")
  .argument("<source>", "Source benchmark id, name, or KovaaK benchmarkId")
  .argument("<target>", "Target benchmark id, name, or KovaaK benchmarkId")
  .option("--benchmarks <path>", "Imported benchmark metadata JSON", DEFAULT_BENCHMARKS_PATH)
  .option("--out <path>", "Path to write the match JSON; defaults to configs/<match-id>.json")
  .option("--id <id>", "Override the match id; defaults to source__to__target")
  .option("--name <name>", "Override the match display name")
  .action(async (source: string, target: string, options) => {
    const config = await loadCalibrationConfig(options.benchmarks);
    const suggestion = suggestMapping({
      config,
      sourceBenchmark: source,
      targetBenchmark: target,
      id: options.id,
      name: options.name,
    });
    const outPath = options.out ?? mappingPathForId(suggestion.mapping.id);
    await writeTextFile(outPath, `${JSON.stringify(suggestion.mapping, null, 2)}\n`);
    printMappingSuggestion(config, suggestion, outPath);
  });

match
  .command("validate")
  .description("Validate a standalone match file before collection or reporting.")
  .argument("<match>", "Match ID or match JSON path")
  .option("--benchmarks <path>", "Imported benchmark metadata JSON", DEFAULT_BENCHMARKS_PATH)
  .option("--db <path>", "Optional SQLite database path to check collected score coverage")
  .option(
    "--suspicious-similarity <value>",
    "Name similarity threshold below which pairs are flagged for review",
    parseNumber,
    0.08,
  )
  .option("--json", "Print JSON instead of terminal text")
  .action(async (matchInput: string, options) => {
    const config = await loadCalibrationConfig(options.benchmarks);
    const mapping = await loadCalibrationMapping(mappingPathFromInput(matchInput));
    const db = options.db ? new AppDatabase(options.db) : undefined;
    try {
      const validation = validateMapping({
        config,
        mapping,
        db,
        suspiciousSimilarityThreshold: options.suspiciousSimilarity,
      });
      if (options.json) {
        console.log(JSON.stringify(validation, null, 2));
      } else {
        console.log(formatMappingValidation(validation, Boolean(options.db)));
      }
      if (validation.warnings.length > 0) {
        process.exitCode = 1;
      }
    } finally {
      db?.close();
    }
  });

program
  .command("collect")
  .description("Collect leaderboard scores for both benchmarks in a match file.")
  .requiredOption("--match <id>", "Match ID or match JSON path")
  .option("--benchmarks <path>", "Imported benchmark metadata JSON", DEFAULT_BENCHMARKS_PATH)
  .option("--db <path>", "SQLite database path", "data/kovaaks-compare.sqlite")
  .option("--max-pages <count>", "Optional max pages per leaderboard; omit to collect all pages", parseInteger)
  .option(
    "--sample-rate <rate>",
    "Fetch a rank-stratified sample of pages, e.g. 0.2 fetches roughly every 5th page; ignored for leaderboards with 50 pages or fewer",
    parseSampleRate,
  )
  .option("--refresh-db", "Refetch pages even when successful page records already exist")
  .option("--max-age-hours <hours>", "Refetch successful page records older than this many hours", parseNumber)
  .option("--request-delay-ms <ms>", "Initial delay between API requests", parseInteger, 750)
  .option("--max-request-delay-ms <ms>", "Maximum adaptive delay between API requests", parseInteger, 15000)
  .option("--max-retries <count>", "Retry attempts for retryable API errors", parseInteger, 6)
  .option("--json", "Print JSON instead of terminal text")
  .option("--refresh", "Bypass local API response cache")
  .option("--debug", "Print API requests to stderr")
  .action(async (options) => {
    const benchmarksConfig = await loadCalibrationConfig(options.benchmarks);
    const mapping = await loadCalibrationMapping(mappingPathFromInput(options.match));
    const scenarios = resolvedScenariosForBenchmarks(benchmarksConfig, [
      mapping.sourceBenchmark,
      mapping.targetBenchmark,
    ]);
    const client = new KovaaksClient({
      refresh: options.refresh,
      debug: options.debug,
      requestDelayMs: options.requestDelayMs,
      maxRequestDelayMs: options.maxRequestDelayMs,
      maxRetries: options.maxRetries,
    });
    const db = new AppDatabase(options.db);
    try {
      const output = await collectResolvedLeaderboards(client, db, {
        scenarios,
        maxPages: options.maxPages,
        sampleRate: options.sampleRate,
        refreshDb: options.refreshDb,
        maxAgeHours: options.maxAgeHours,
        onProgress: options.json ? undefined : collectionProgressLogger,
      });
      if (options.json) {
        console.log(JSON.stringify(output, null, 2));
      } else {
        console.log(formatCollectOutput(output, options.db));
      }
    } finally {
      db.close();
    }
  });

program
  .command("report")
  .description("Generate a Markdown/CSV calibration report for a match file.")
  .requiredOption("--match <id>", "Match ID or match JSON path")
  .option("--benchmarks <path>", "Imported benchmark metadata JSON", DEFAULT_BENCHMARKS_PATH)
  .option("--db <path>", "SQLite database path", "data/kovaaks-compare.sqlite")
  .option("--paired-only", "Restrict percentile mapping and compared distributions to overlapping Steam IDs")
  .option("--percentiles <values>", "Comma-separated percentile rows to report", "50,60,75,88,95")
  .option("--outlier-trim-percent <percent>", "Trim this percentage of largest residual outliers for robust regression", parseTrimPercent, 0)
  .option("--outlier-limit <count>", "Number of residual outliers to include in output", parseNonNegativeInteger, 10)
  .option("--markdown <path>", "Write a Markdown report")
  .option("--csv <path>", "Write cutoff-focused CSV rows")
  .option("--json", "Print JSON instead of Markdown text")
  .option("--explain", "Append a short glossary describing each reported metric")
  .action(async (options) => {
    await runReportCommand(options);
  });

const calibration = program
  .command("calibration")
  .description("Work with benchmark calibration configs and mapped reports.");

calibration
  .command("init")
  .description("Write an editable calibration config template.")
  .requiredOption("--out <path>", "Path for the new JSON config")
  .action(async (options) => {
    await writeTextFile(
      options.out,
      `${JSON.stringify(CALIBRATION_TEMPLATE, null, 2)}\n`,
    );
    console.log(`Calibration config template written to ${options.out}`);
  });

calibration
  .command("resolve")
  .description(
    "Resolve scenario names in a calibration config to leaderboard IDs.",
  )
  .requiredOption("--config <path>", "Calibration JSON config")
  .requiredOption("--out <path>", "Path for resolved JSON config")
  .option("--refresh", "Bypass local API response cache")
  .option("--debug", "Print API requests to stderr")
  .action(async (options) => {
    const config = await loadCalibrationConfig(options.config);
    const client = new KovaaksClient({
      refresh: options.refresh,
      debug: options.debug,
    });
    const resolved = await resolveCalibrationConfig(client, config);
    await writeTextFile(options.out, `${JSON.stringify(resolved, null, 2)}\n`);
    console.log(`Resolved calibration config written to ${options.out}`);
  });

calibration
  .command("benchmark-index")
  .description(
    "Download a benchmark name-to-ID index. Username only matters for cache key; benchmark list is the same for any account.",
  )
  .option(
    "--out <path>",
    "Path for benchmark index JSON",
    DEFAULT_INDEX_PATH,
  )
  .option(
    "--username <username>",
    "Override username used for the API request and cache key",
    "KovaaksCompare",
  )
  .option("--refresh", "Bypass local API response cache")
  .option("--debug", "Print API requests to stderr")
  .action(async (options) => {
    const client = new KovaaksClient({
      refresh: options.refresh,
      debug: options.debug,
    });
    const index = await downloadBenchmarkIndex(client, options.username);
    await writeTextFile(options.out, `${JSON.stringify(index, null, 2)}\n`);
    console.log(
      `Benchmark index with ${index.benchmarks.length} benchmark(s) written to ${options.out}`,
    );
  });

calibration
  .command("import-benchmark")
  .description(
    "Import scenarios and rank cutoffs for one benchmark from KovaaK's benchmark API. Benchmark structure is account-independent; defaults are used unless overridden.",
  )
  .option("--out <path>", "Path for updated benchmark metadata JSON", DEFAULT_BENCHMARKS_PATH)
  .option(
    "--steam-id <steamId>",
    "Override the SteamID64 query parameter (any valid 17-digit value works for benchmark structure)",
    "11111111111111111",
  )
  .option(
    "--config <path>",
    "Existing benchmark metadata JSON to update; defaults to --out path if it already exists",
  )
  .option(
    "--index <path>",
    "Benchmark index JSON for name-to-ID lookup; auto-detected if configs/benchmark-index.json exists",
  )
  .option(
    "--username <username>",
    "Override username used for benchmark name lookup",
    "KovaaksCompare",
  )
  .option("--benchmark-id <id>", "Benchmark ID to import")
  .option("--benchmark-name <name>", "Benchmark name to import")
  .option(
    "--benchmark-key <id>",
    "Local config benchmark ID; defaults to slugified benchmark name",
  )
  .option("--difficulty <label>", "Difficulty label to store in config")
  .option("--refresh", "Bypass local API response cache")
  .option("--debug", "Print API requests to stderr")
  .action(async (options) => {
    const indexPath = options.index ?? (existsSync(DEFAULT_INDEX_PATH) ? DEFAULT_INDEX_PATH : undefined);
    const configPath = options.config ?? (existsSync(options.out) ? options.out : undefined);
    const target = await resolveImportBenchmarkOptions({ ...options, index: indexPath });
    const client = new KovaaksClient({
      refresh: options.refresh,
      debug: options.debug,
    });
    const benchmark = await importBenchmarkFromApi(client, {
      username: options.username,
      benchmarkId: target.benchmarkId,
      benchmarkName: target.benchmarkName,
      steamId: options.steamId,
      id: options.benchmarkKey,
      difficulty: options.difficulty,
    });
    const existing = configPath ? await loadCalibrationConfig(configPath) : undefined;
    const updated = appendBenchmarkToConfig(existing, benchmark);
    await writeTextFile(options.out, `${JSON.stringify(updated, null, 2)}\n`);
    console.log(
      `Imported ${benchmark.scenarios.length} scenario(s) from ${benchmark.name} ` +
        `(${benchmark.benchmarkId ?? "unknown benchmark ID"}) to ${options.out}` +
        `${configPath && configPath === options.out ? " (appended)" : ""}`,
    );
  });

const mapping = calibration
  .command("mapping")
  .description("Create or edit calibration mappings between imported benchmarks.");

mapping
  .command("create")
  .description("Auto-pair scenarios between two imported benchmarks and write a standalone mapping file.")
  .requiredOption("--source <benchmark>", "Source benchmark id, name, or KovaaK benchmarkId")
  .requiredOption("--target <benchmark>", "Target benchmark id, name, or KovaaK benchmarkId")
  .option("--benchmarks <path>", "Imported benchmark metadata JSON", DEFAULT_BENCHMARKS_PATH)
  .option("--out <path>", "Path to write the mapping JSON; defaults to configs/<mapping-id>.json")
  .option("--id <id>", "Override the mapping id; defaults to source__to__target")
  .option("--name <name>", "Override the mapping display name")
  .action(async (options) => {
    const config = await loadCalibrationConfig(options.benchmarks);
    const suggestion = suggestMapping({
      config,
      sourceBenchmark: options.source,
      targetBenchmark: options.target,
      id: options.id,
      name: options.name,
    });
    const outPath = options.out ?? mappingPathForId(suggestion.mapping.id);
    await writeTextFile(outPath, `${JSON.stringify(suggestion.mapping, null, 2)}\n`);
    printMappingSuggestion(config, suggestion, outPath);
  });

calibration
  .command("collect")
  .description(
    "Collect all scenarios from selected calibration config benchmarks.",
  )
  .option("--benchmarks <path>", "Imported benchmark metadata JSON", DEFAULT_BENCHMARKS_PATH)
  .option(
    "--benchmark-ids <ids>",
    "Comma-separated benchmark IDs; defaults to all benchmarks",
  )
  .option("--db <path>", "SQLite database path", "data/kovaaks-compare.sqlite")
  .option(
    "--max-pages <count>",
    "Optional max pages per leaderboard; omit to collect all pages",
    parseInteger,
  )
  .option(
    "--sample-rate <rate>",
    "Fetch a rank-stratified sample of pages, e.g. 0.2 fetches roughly every 5th page; ignored for leaderboards with 50 pages or fewer",
    parseSampleRate,
  )
  .option(
    "--refresh-db",
    "Refetch pages even when successful page records already exist",
  )
  .option(
    "--max-age-hours <hours>",
    "Refetch successful page records older than this many hours",
    parseNumber,
  )
  .option(
    "--request-delay-ms <ms>",
    "Initial delay between API requests",
    parseInteger,
    750,
  )
  .option(
    "--max-request-delay-ms <ms>",
    "Maximum adaptive delay between API requests",
    parseInteger,
    15000,
  )
  .option(
    "--max-retries <count>",
    "Retry attempts for retryable API errors",
    parseInteger,
    6,
  )
  .option("--json", "Print JSON instead of terminal text")
  .option("--refresh", "Bypass local API response cache")
  .option("--debug", "Print API requests to stderr")
  .action(async (options) => {
    const config = await loadCalibrationConfig(options.benchmarks);
    const scenarios = resolvedScenariosForBenchmarks(
      config,
      options.benchmarkIds ? parseScenarioList(options.benchmarkIds) : undefined,
    );
    const client = new KovaaksClient({
      refresh: options.refresh,
      debug: options.debug,
      requestDelayMs: options.requestDelayMs,
      maxRequestDelayMs: options.maxRequestDelayMs,
      maxRetries: options.maxRetries,
    });
    const db = new AppDatabase(options.db);
    try {
      const output = await collectResolvedLeaderboards(client, db, {
        scenarios,
        maxPages: options.maxPages,
        sampleRate: options.sampleRate,
        refreshDb: options.refreshDb,
        maxAgeHours: options.maxAgeHours,
        onProgress: options.json ? undefined : collectionProgressLogger,
      });
      if (options.json) {
        console.log(JSON.stringify(output, null, 2));
      } else {
        console.log(formatCollectOutput(output, options.db));
      }
    } finally {
      db.close();
    }
  });

calibration
  .command("report")
  .description(
    "Generate a multi-pair calibration report from configured benchmark mappings.",
  )
  .option("--benchmarks <path>", "Imported benchmark metadata JSON", DEFAULT_BENCHMARKS_PATH)
  .requiredOption("--mapping <id>", "Mapping ID or mapping JSON path")
  .option("--db <path>", "SQLite database path", "data/kovaaks-compare.sqlite")
  .option(
    "--paired-only",
    "Restrict percentile mapping and compared distributions to overlapping Steam IDs",
  )
  .option(
    "--percentiles <values>",
    "Comma-separated percentile rows to report",
    "50,60,75,88,95",
  )
  .option(
    "--outlier-trim-percent <percent>",
    "Trim this percentage of largest residual outliers for robust regression",
    parseTrimPercent,
    0,
  )
  .option(
    "--outlier-limit <count>",
    "Number of residual outliers to include in output",
    parseNonNegativeInteger,
    10,
  )
  .option("--markdown <path>", "Write a Markdown report")
  .option("--csv <path>", "Write cutoff-focused CSV rows")
  .option("--json", "Print JSON instead of Markdown text")
  .option(
    "--explain",
    "Append a short glossary describing each reported metric",
  )
  .action(async (options) => {
    await runReportCommand(options);
  });

program.parseAsync().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

function parseInteger(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new Error(`Expected integer, got ${value}`);
  }
  return parsed;
}

function parseNonNegativeInteger(value: string): number {
  const parsed = parseInteger(value);
  if (parsed < 0) {
    throw new Error(`Expected non-negative integer, got ${value}`);
  }
  return parsed;
}

function parseTargets(value: string): string[] {
  const targets = String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (targets.length < 1 || targets.length > 3) {
    throw new Error("targets must contain 1 to 3 comma-separated values.");
  }
  return targets;
}

function parseCollectScenarios(options: {
  scenarios?: string;
  source?: string;
  targets?: string;
}): string[] {
  if (options.scenarios) {
    return parseScenarioList(options.scenarios);
  }
  if (options.source && options.targets) {
    return [options.source, ...parseScenarioList(options.targets)];
  }
  throw new Error(
    "Provide --scenarios x,y,z, or the compatibility pair --source x --targets y,z.",
  );
}

function parseScenarioList(value: string): string[] {
  const scenarios = String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (scenarios.length < 1) {
    throw new Error("scenario list must contain at least one value.");
  }
  return scenarios;
}

function parseNumber(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Expected number, got ${value}`);
  }
  return parsed;
}

function parseSampleRate(value: string): number {
  const parsed = parseNumber(value);
  if (parsed <= 0 || parsed > 1) {
    throw new Error(`Expected --sample-rate to be > 0 and <= 1, got ${value}`);
  }
  return parsed;
}

function parsePercentiles(value: string): number[] {
  const percentiles = String(value)
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => !Number.isNaN(item));

  if (percentiles.length === 0) {
    throw new Error("--percentiles must contain at least one number.");
  }

  const uniqueSorted = [...new Set(percentiles)].sort((a, b) => a - b);
  for (const percentile of uniqueSorted) {
    if (!Number.isFinite(percentile) || percentile <= 0 || percentile >= 100) {
      throw new Error(
        "--percentiles values must be numbers greater than 0 and less than 100.",
      );
    }
  }
  return uniqueSorted;
}

function parseScoreList(value: string): number[] {
  const scores = String(value)
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => !Number.isNaN(item));

  if (scores.length === 0) {
    throw new Error("--source-cutoffs must contain at least one number.");
  }
  for (const score of scores) {
    if (!Number.isFinite(score) || score <= 0) {
      throw new Error("--source-cutoffs values must be positive numbers.");
    }
  }
  return scores;
}

function parseTrimPercent(value: string): number {
  const parsed = parseNumber(value);
  if (parsed < 0 || parsed >= 50) {
    throw new Error(
      "--outlier-trim-percent must be greater than or equal to 0 and less than 50.",
    );
  }
  return parsed;
}

function collectionProgressLogger(progress: {
  scenarioName: string;
  leaderboardId: string;
  page: number;
  totalPages?: number;
  status: string;
  scoresStored: number;
  totalAvailable: number;
  error?: string;
}): void {
  const totalPages =
    progress.totalPages === undefined ? "?" : String(progress.totalPages);
  console.error(
    `[collect] ${progress.scenarioName} (${progress.leaderboardId}) ` +
      `page ${progress.page + 1}/${totalPages} ${progress.status}, stored ` +
      `${progress.scoresStored}/${progress.totalAvailable}` +
      `${progress.error ? `, error: ${progress.error}` : ""}`,
  );
}

async function writeTextFile(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
}

function printMappingSuggestion(
  config: CalibrationConfig,
  suggestion: MappingSuggestion,
  outPath: string,
): void {
  const sourceBenchmarkConfig = config.benchmarks.find((b) => b.id === suggestion.mapping.sourceBenchmark);
  const targetBenchmarkConfig = config.benchmarks.find((b) => b.id === suggestion.mapping.targetBenchmark);
  const findScenarioName = (benchmarkId: string, scenarioId: string): string => {
    const benchmark = config.benchmarks.find((b) => b.id === benchmarkId);
    return benchmark?.scenarios.find((s) => s.id === scenarioId)?.name ?? scenarioId;
  };

  console.log(
    `Mapping "${suggestion.mapping.id}" written to ${outPath} ` +
      `(${suggestion.mapping.pairs.length} paired scenario(s)).`,
  );
  console.log("Pairs:");
  for (const pair of suggestion.mapping.pairs) {
    console.log(
      `- ${findScenarioName(suggestion.mapping.sourceBenchmark, pair.sourceScenario)} -> ` +
        `${findScenarioName(suggestion.mapping.targetBenchmark, pair.targetScenario)}`,
    );
  }
  if (suggestion.warnings.length > 0) {
    console.log("\nWarnings (verify pairings in the mapping file):");
    for (const warning of suggestion.warnings) {
      console.log(`- ${warning}`);
    }
  }
  if (suggestion.unpairedSources.length > 0) {
    console.log(
      `\nUnpaired source scenarios in ${sourceBenchmarkConfig?.name ?? suggestion.mapping.sourceBenchmark} (edit ${outPath} to pair manually):`,
    );
    for (const scenario of suggestion.unpairedSources) {
      console.log(`- ${scenario.name} (${scenario.id})`);
    }
  }
  if (suggestion.unpairedTargets.length > 0) {
    console.log(
      `\nUnused target scenarios in ${targetBenchmarkConfig?.name ?? suggestion.mapping.targetBenchmark}:`,
    );
    for (const scenario of suggestion.unpairedTargets) {
      console.log(`- ${scenario.name} (${scenario.id})`);
    }
  }
}

function formatMappingValidation(result: MappingValidationResult, checkedDb: boolean): string {
  const lines = [
    `Match: ${result.mappingId}`,
    `Source: ${result.sourceBenchmark.name} (${result.sourceBenchmark.id})`,
    `Target: ${result.targetBenchmark.name} (${result.targetBenchmark.id})`,
    `Pairs: ${result.pairCount}`,
    `Source scenarios: ${result.sourceScenarioCount} (${result.unpairedSources.length} unpaired)`,
    `Target scenarios: ${result.targetScenarioCount} (${result.unpairedTargets.length} unpaired)`,
  ];

  if (result.warnings.length === 0) {
    lines.push("", "Status: OK");
  } else {
    lines.push("", "Warnings:");
    for (const warning of result.warnings) {
      lines.push(`- ${warning}`);
    }
  }

  appendScenarioList(lines, "Duplicate source scenarios", result.duplicateSources);
  appendScenarioList(lines, "Duplicate target scenarios", result.duplicateTargets);

  if (result.missingSourceScenarioIds.length > 0) {
    lines.push("", "Missing source scenario IDs:");
    for (const id of result.missingSourceScenarioIds) lines.push(`- ${id}`);
  }
  if (result.missingTargetScenarioIds.length > 0) {
    lines.push("", "Missing target scenario IDs:");
    for (const id of result.missingTargetScenarioIds) lines.push(`- ${id}`);
  }

  appendScenarioList(lines, "Unpaired source scenarios", result.unpairedSources);
  appendScenarioList(lines, "Unpaired target scenarios", result.unpairedTargets);

  if (result.categoryMismatches.length > 0) {
    lines.push("", "Category/block mismatches:");
    for (const issue of result.categoryMismatches) {
      lines.push(
        `- ${issue.sourceScenario.name} [${formatCategoryBlock(issue.sourceCategory)}] -> ` +
          `${issue.targetScenario.name} [${formatCategoryBlock(issue.targetCategory)}]`,
      );
    }
  }

  if (result.suspiciousPairs.length > 0) {
    lines.push("", "Suspicious low-similarity pairs:");
    for (const issue of result.suspiciousPairs) {
      lines.push(
        `- ${issue.sourceScenario.name} -> ${issue.targetScenario.name} ` +
          `(similarity ${issue.similarity?.toFixed(2) ?? "n/a"})`,
      );
    }
  }

  if (result.missingLeaderboardIds.length > 0) {
    lines.push("", "Scenarios missing leaderboard IDs:");
    for (const item of result.missingLeaderboardIds) {
      lines.push(`- ${item.side}: ${item.scenario.name} (${item.scenario.id})`);
    }
  }

  if (checkedDb) {
    if (result.missingScoreData.length > 0) {
      lines.push("", "Scenarios with no stored scores in DB:");
      for (const item of result.missingScoreData) {
        lines.push(`- ${item.side}: ${item.scenario.name} (${item.leaderboardId})`);
      }
    } else {
      lines.push("", "DB score coverage: OK");
    }
  }

  return lines.join("\n");
}

function appendScenarioList(
  lines: string[],
  title: string,
  scenarios: Array<{ id: string; name: string; category?: string; leaderboardId?: string }>,
): void {
  if (scenarios.length === 0) return;
  lines.push("", `${title}:`);
  for (const scenario of scenarios) {
    lines.push(
      `- ${scenario.name} (${scenario.id})` +
        `${scenario.category ? `, category ${scenario.category}` : ""}` +
        `${scenario.leaderboardId ? `, leaderboard ${scenario.leaderboardId}` : ""}`,
    );
  }
}

function formatCategoryBlock(category: string | undefined): string {
  if (!category) return "unknown";
  const [name, occurrence] = category.split("@@");
  if (name === "__uncategorized__") return "uncategorized";
  return occurrence && occurrence !== "1" ? `${name} block ${occurrence}` : name;
}

async function runReportCommand(options: {
  benchmarks: string;
  match?: string;
  mapping?: string;
  db: string;
  percentiles: string;
  pairedOnly?: boolean;
  outlierTrimPercent?: number;
  outlierLimit?: number;
  markdown?: string;
  csv?: string;
  json?: boolean;
  explain?: boolean;
}): Promise<void> {
  const mappingInput = options.match ?? options.mapping;
  if (!mappingInput) {
    throw new Error("Provide --match or --mapping.");
  }
  const benchmarks = await loadCalibrationConfig(options.benchmarks);
  const mapping = await loadCalibrationMapping(mappingPathFromInput(mappingInput));
  const config = withMapping(benchmarks, mapping);
  const db = new AppDatabase(options.db);
  try {
    const report = buildCalibrationReport(db, config, {
      mappingId: mapping.id,
      percentiles: parsePercentiles(options.percentiles),
      pairedOnly: options.pairedOnly,
      outlierTrimPercent: options.outlierTrimPercent,
      outlierLimit: options.outlierLimit,
    });
    const baseMarkdown = calibrationReportToMarkdown(report);
    const markdown = options.explain
      ? `${baseMarkdown}\n## Glossary\n\n${METRICS_GLOSSARY}\n`
      : baseMarkdown;
    if (options.markdown) {
      await writeTextFile(options.markdown, markdown);
    }
    if (options.csv) {
      await writeTextFile(options.csv, calibrationReportToCsv(report));
    }
    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(markdown);
      if (options.markdown) {
        console.log(`\nMarkdown written to ${options.markdown}`);
      }
      if (options.csv) {
        console.log(`CSV written to ${options.csv}`);
      }
    }
  } finally {
    db.close();
  }
}

function mappingPathForId(id: string): string {
  return `configs/${id}.json`;
}

function mappingPathFromInput(value: string): string {
  return value.endsWith(".json") || value.includes("/") ? value : mappingPathForId(value);
}

async function resolveImportBenchmarkOptions(options: {
  index?: string;
  benchmarkId?: string;
  benchmarkName?: string;
}): Promise<{ benchmarkId?: string; benchmarkName?: string }> {
  if (!options.index) {
    if (!options.benchmarkId && !options.benchmarkName) {
      throw new Error(
        "Provide --benchmark-id, --benchmark-name with --username, or --benchmark-name with --index.",
      );
    }
    return {
      benchmarkId: options.benchmarkId,
      benchmarkName: options.benchmarkName,
    };
  }

  const index = await loadBenchmarkIndex(options.index);
  if (options.benchmarkId) {
    const benchmark = index.benchmarks.find(
      (item) => item.benchmarkId === String(options.benchmarkId),
    );
    return {
      benchmarkId: String(options.benchmarkId),
      benchmarkName: options.benchmarkName ?? benchmark?.benchmarkName,
    };
  }
  if (!options.benchmarkName) {
    throw new Error(
      "Provide --benchmark-name when using --index without --benchmark-id.",
    );
  }
  const exact = index.benchmarks.find(
    (benchmark) =>
      benchmark.benchmarkName.toLowerCase() ===
      options.benchmarkName?.toLowerCase(),
  );
  const fuzzy = index.benchmarks.find((benchmark) =>
    benchmark.benchmarkName
      .toLowerCase()
      .includes(options.benchmarkName?.toLowerCase() ?? ""),
  );
  const chosen = exact ?? fuzzy;
  if (!chosen) {
    throw new Error(
      `No benchmark matching "${options.benchmarkName}" found in ${options.index}.`,
    );
  }
  return chosen;
}

function formatUserOutput(output: UserComparisonOutput): string {
  const lines = [`Player: ${output.player}`, "Score mode: best"];

  for (const comparison of output.comparisons) {
    lines.push("");
    lines.push(
      `${comparison.source.scenarioName} -> ${comparison.target.scenarioName}`,
    );
    lines.push(`Source leaderboard: ${comparison.source.leaderboardId}`);
    lines.push(`Target leaderboard: ${comparison.target.leaderboardId}`);
    lines.push(`Source score: ${formatScore(comparison.sourceScore)}`);
    lines.push(`Target score: ${formatScore(comparison.targetScore)}`);
    if (comparison.equivalentTargetScore !== undefined) {
      lines.push(
        `Equivalent target score: ${formatNumber(comparison.equivalentTargetScore)}`,
      );
    }
    lines.push("Interpretation:");
    for (const item of comparison.interpretation) {
      lines.push(`- ${item}`);
    }
    if (comparison.warnings.length > 0) {
      lines.push("Warnings:");
      for (const warning of [...new Set(comparison.warnings)]) {
        lines.push(`- ${warning}`);
      }
    }
  }

  return lines.join("\n");
}

function formatScore(score: {
  score: number | null;
  rank?: number;
  percentile?: number;
}): string {
  if (score.score === null) {
    return "unavailable";
  }
  const parts = [formatNumber(score.score)];
  if (score.rank !== undefined) {
    parts.push(`rank ${score.rank}`);
  }
  if (score.percentile !== undefined) {
    parts.push(`${score.percentile.toFixed(1)}th percentile`);
  }
  return parts.join(", ");
}

function toCsv(output: UserComparisonOutput): string {
  const header = [
    "player",
    "source_scenario",
    "source_leaderboard_id",
    "target_scenario",
    "target_leaderboard_id",
    "source_score",
    "source_rank",
    "source_percentile",
    "target_score",
    "target_rank",
    "target_percentile",
    "equivalent_target_score",
    "warnings",
  ];
  const rows = output.comparisons.map((comparison) =>
    [
      output.player,
      comparison.source.scenarioName,
      comparison.source.leaderboardId,
      comparison.target.scenarioName,
      comparison.target.leaderboardId,
      comparison.sourceScore.score,
      comparison.sourceScore.rank,
      comparison.sourceScore.percentile,
      comparison.targetScore.score,
      comparison.targetScore.rank,
      comparison.targetScore.percentile,
      comparison.equivalentTargetScore,
      comparison.warnings.join(" | "),
    ]
      .map(csvCell)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

function formatCollectOutput(
  output: LeaderboardCollectOutput,
  dbPath: string,
): string {
  const lines = [`Database: ${dbPath}`, "", "Collected:"];
  for (const item of output.scenarios) {
    lines.push(
      `- ${item.scenario.scenarioName} (${item.scenario.leaderboardId}): ` +
        `${item.scoresStored}/${item.totalAvailable} stored, ` +
        `${item.pagesFetched} fetched, ${item.pagesSkipped} skipped, ${item.pagesFailed} failed` +
        `${item.complete ? "" : " (partial)"}`,
    );
    if (item.scenario.ambiguous) {
      lines.push(
        `  warning: "${item.scenario.input}" was ambiguous; selected first/best match.`,
      );
    }
  }
  return lines.join("\n");
}

function formatLeaderboardCompareOutput(
  output: LeaderboardCompareOutput,
): string {
  const lines = [
    `Source: ${output.source.scenarioName} (${output.source.leaderboardId})`,
    `Source players collected: ${output.source.playersCollected}`,
  ];

  for (const target of output.targets) {
    lines.push("");
    lines.push(
      `Target: ${target.target.scenarioName} (${target.target.leaderboardId})`,
    );
    lines.push(`Target players collected: ${target.targetPlayersCollected}`);
    lines.push(`Comparison population: ${target.comparisonPopulation}`);
    lines.push(`Source players compared: ${target.sourcePlayersCompared}`);
    lines.push(`Target players compared: ${target.targetPlayersCompared}`);
    lines.push(
      `Overlapping players: ${target.overlappingPlayers} (${target.overlapPercentage.toFixed(1)}%)`,
    );
    lines.push(`Correlation: ${formatOptional(target.correlation, 4)}`);
    lines.push(`Log correlation: ${formatOptional(target.logCorrelation, 4)}`);
    if (target.regression) {
      lines.push(
        `Linear regression: target ~= ${target.regression.slope.toFixed(4)} * source + ` +
          `${target.regression.intercept.toFixed(2)} (R^2 ${target.regression.rSquared.toFixed(4)})`,
      );
    }
    if (target.trimmedRegression) {
      lines.push(
        `Trimmed regression: target ~= ${target.trimmedRegression.slope.toFixed(4)} * source + ` +
          `${target.trimmedRegression.intercept.toFixed(2)} ` +
          `(R^2 ${target.trimmedRegression.rSquared.toFixed(4)}, n=${target.trimmedRegression.sampleSize})`,
      );
    }
    if (target.logRegression) {
      lines.push(
        `Log-log regression: log(target) ~= ${target.logRegression.slope.toFixed(4)} * log(source) + ` +
          `${target.logRegression.intercept.toFixed(4)} ` +
          `(R^2 ${target.logRegression.rSquared.toFixed(4)}, n=${target.logRegression.sampleSize})`,
      );
    }
    lines.push("Percentile mapping:");
    for (const row of target.percentileMapping) {
      lines.push(
        `- ${formatNumber(row.sourceScore)} @ ${row.sourcePercentile}% -> ` +
          `${row.equivalentTargetScore === undefined ? "n/a" : formatNumber(row.equivalentTargetScore)} ` +
          `(${row.confidence})`,
      );
    }
    if (target.pairedQuantileMapping.length > 0) {
      lines.push("Paired-player quantile mapping:");
      for (const row of target.pairedQuantileMapping) {
        lines.push(
          `- ${formatNumber(row.sourceScore)} @ ${row.sourcePercentile}% -> ` +
            `${row.equivalentTargetScore === undefined ? "n/a" : formatNumber(row.equivalentTargetScore)} ` +
            `(${row.confidence}, n=${row.sampleSize})`,
        );
      }
    }
    if (target.outliers.length > 0) {
      lines.push("Top outliers:");
      for (const outlier of target.outliers.slice(0, 5)) {
        lines.push(
          `- ${outlier.username ?? outlier.steamId ?? outlier.playerId}: source ${formatNumber(outlier.sourceScore)}, ` +
            `target ${formatNumber(outlier.targetScore)}, residual ${formatOptional(outlier.residual, 2)}`,
        );
      }
    }
    if (target.warnings.length > 0) {
      lines.push("Warnings:");
      for (const warning of target.warnings) {
        lines.push(`- ${warning}`);
      }
    }
  }

  return lines.join("\n");
}

function formatLeaderboardCutoffsOutput(
  output: LeaderboardCutoffsOutput,
): string {
  const lines = [
    `Source: ${output.source.scenarioName} (${output.source.leaderboardId})`,
    `Source players collected: ${output.source.playersCollected}`,
  ];

  for (const target of output.targets) {
    lines.push("");
    lines.push(
      `Target: ${target.target.scenarioName} (${target.target.leaderboardId})`,
    );
    lines.push(`Target players collected: ${target.target.playersCollected}`);
    lines.push(`Overlapping players: ${target.overlappingPlayers}`);
    if (target.regression) {
      lines.push(
        `Linear regression: target ~= ${target.regression.slope.toFixed(4)} * source + ` +
          `${target.regression.intercept.toFixed(2)} (R^2 ${target.regression.rSquared.toFixed(4)})`,
      );
    }
    if (target.trimmedRegression) {
      lines.push(
        `Trimmed regression: target ~= ${target.trimmedRegression.slope.toFixed(4)} * source + ` +
          `${target.trimmedRegression.intercept.toFixed(2)} ` +
          `(R^2 ${target.trimmedRegression.rSquared.toFixed(4)}, n=${target.trimmedRegression.sampleSize})`,
      );
    }
    if (target.logRegression) {
      lines.push(
        `Log-log regression: log(target) ~= ${target.logRegression.slope.toFixed(4)} * log(source) + ` +
          `${target.logRegression.intercept.toFixed(4)} ` +
          `(R^2 ${target.logRegression.rSquared.toFixed(4)}, n=${target.logRegression.sampleSize})`,
      );
    }
    lines.push("Cutoff mapping:");
    for (const row of target.cutoffs) {
      lines.push(
        `- source ${formatNumber(row.sourceScore)} ` +
          `(${formatOptional(row.sourcePercentile, 1)}%) -> ` +
          `global ${formatOptional(row.globalPercentileTargetScore, 0)}, ` +
          `paired ${formatOptional(row.pairedWindowTargetScore, 0)} ` +
          `(n=${row.pairedWindowSampleSize}, ${row.confidence}), ` +
          `monotonic ${formatOptional(row.pairedMonotonicTargetScore, 0)}, ` +
          `linear ${formatOptional(row.linearRegressionTargetScore, 0)}` +
          `${row.trimmedRegressionTargetScore === undefined ? "" : `, trimmed ${formatOptional(row.trimmedRegressionTargetScore, 0)}`}` +
          `${row.logRegressionTargetScore === undefined ? "" : `, log ${formatOptional(row.logRegressionTargetScore, 0)}`}`,
      );
    }
    if (target.warnings.length > 0) {
      lines.push("Warnings:");
      for (const warning of target.warnings) {
        lines.push(`- ${warning}`);
      }
    }
  }

  return lines.join("\n");
}

function leaderboardCompareToCsv(output: LeaderboardCompareOutput): string {
  const header = [
    "source_leaderboard_id",
    "source_scenario",
    "target_leaderboard_id",
    "target_scenario",
    "source_players_collected",
    "target_players_collected",
    "comparison_population",
    "source_players_compared",
    "target_players_compared",
    "overlapping_players",
    "overlap_percentage",
    "correlation",
    "log_correlation",
    "regression_slope",
    "regression_intercept",
    "regression_r_squared",
    "trimmed_regression_slope",
    "trimmed_regression_intercept",
    "trimmed_regression_r_squared",
    "log_regression_slope",
    "log_regression_intercept",
    "log_regression_r_squared",
  ];
  const rows = output.targets.map((target) =>
    [
      output.source.leaderboardId,
      output.source.scenarioName,
      target.target.leaderboardId,
      target.target.scenarioName,
      target.sourcePlayersCollected,
      target.targetPlayersCollected,
      target.comparisonPopulation,
      target.sourcePlayersCompared,
      target.targetPlayersCompared,
      target.overlappingPlayers,
      target.overlapPercentage,
      target.correlation,
      target.logCorrelation,
      target.regression?.slope,
      target.regression?.intercept,
      target.regression?.rSquared,
      target.trimmedRegression?.slope,
      target.trimmedRegression?.intercept,
      target.trimmedRegression?.rSquared,
      target.logRegression?.slope,
      target.logRegression?.intercept,
      target.logRegression?.rSquared,
    ]
      .map(csvCell)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

function leaderboardCutoffsToCsv(output: LeaderboardCutoffsOutput): string {
  const header = [
    "source_leaderboard_id",
    "source_scenario",
    "target_leaderboard_id",
    "target_scenario",
    "overlapping_players",
    "source_score",
    "source_percentile",
    "global_percentile_target_score",
    "paired_window_target_score",
    "paired_monotonic_target_score",
    "paired_window_sample_size",
    "linear_regression_target_score",
    "trimmed_regression_target_score",
    "log_regression_target_score",
    "confidence",
  ];
  const rows = output.targets.flatMap((target) =>
    target.cutoffs.map((row) =>
      [
        output.source.leaderboardId,
        output.source.scenarioName,
        target.target.leaderboardId,
        target.target.scenarioName,
        target.overlappingPlayers,
        row.sourceScore,
        row.sourcePercentile,
        row.globalPercentileTargetScore,
        row.pairedWindowTargetScore,
        row.pairedMonotonicTargetScore,
        row.pairedWindowSampleSize,
        row.linearRegressionTargetScore,
        row.trimmedRegressionTargetScore,
        row.logRegressionTargetScore,
        row.confidence,
      ]
        .map(csvCell)
        .join(","),
    ),
  );
  return [header.join(","), ...rows].join("\n");
}

function formatOptional(value: number | undefined, digits: number): string {
  return value === undefined || !Number.isFinite(value)
    ? "n/a"
    : value.toFixed(digits);
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
