#!/usr/bin/env node
import { Command } from "commander";
import { writeFile } from "node:fs/promises";
import { KovaaksClient } from "./kovaaks-client.js";
import { compareUserScenarios, formatNumber } from "./comparison.js";
import { AppDatabase } from "./database.js";
import {
  buildLeaderboardCutoffs,
  collectLeaderboards,
  compareStoredLeaderboards,
  type LeaderboardCutoffsOutput,
  type LeaderboardCollectOutput,
  type LeaderboardCompareOutput,
} from "./leaderboard.js";
import type { UserComparisonOutput } from "./comparison.js";

const program = new Command();

program
  .name("kovaaks-compare")
  .description("Prototype CLI for comparing KovaaK's benchmark scenario scores.")
  .version("0.1.0");

program
  .command("user")
  .description("Compare one player across one source scenario and 1-3 target scenarios.")
  .requiredOption("--player <player>", "Steam ID, webapp username, or display username")
  .requiredOption("--source <scenario>", "Source scenario name or leaderboard ID")
  .requiredOption("--targets <scenarios>", "Comma-separated target scenario names or leaderboard IDs")
  .option("--max-pages <count>", "Max leaderboard pages to scan for player fallback lookup", parseInteger, 100)
  .option("--json", "Print JSON instead of terminal text")
  .option("--csv <path>", "Export pair summary as CSV")
  .option("--refresh", "Bypass local API response cache")
  .option("--debug", "Print API requests to stderr")
  .action(async (options) => {
    const targets = String(options.targets)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (targets.length < 1 || targets.length > 3) {
      throw new Error("--targets must contain 1 to 3 comma-separated scenarios.");
    }

    const client = new KovaaksClient({ refresh: options.refresh, debug: options.debug });
    const output = await compareUserScenarios(client, {
      player: options.player,
      sourceScenario: options.source,
      targetScenarios: targets,
      scoreMode: { type: "best" },
      maxPages: options.maxPages,
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
  });

const leaderboard = program
  .command("leaderboard")
  .description("Collect and compare leaderboard populations with SQLite.");

leaderboard
  .command("collect")
  .description("Collect scenario leaderboard pages into SQLite.")
  .option("--scenarios <scenarios>", "Comma-separated scenario names or leaderboard IDs")
  .option("--source <scenario>", "Compatibility alias: source scenario name or leaderboard ID")
  .option("--targets <scenarios>", "Compatibility alias: comma-separated target scenario names or leaderboard IDs")
  .option("--db <path>", "SQLite database path", "data/kovaaks-compare.sqlite")
  .option("--max-pages <count>", "Optional max pages per leaderboard; omit to collect all pages", parseInteger)
  .option("--refresh-db", "Refetch pages even when successful page records already exist")
  .option("--max-age-hours <hours>", "Refetch successful page records older than this many hours", parseNumber)
  .option("--request-delay-ms <ms>", "Initial delay between API requests", parseInteger, 750)
  .option("--max-request-delay-ms <ms>", "Maximum adaptive delay between API requests", parseInteger, 15000)
  .option("--max-retries <count>", "Retry attempts for retryable API errors", parseInteger, 6)
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
        refreshDb: options.refreshDb,
        maxAgeHours: options.maxAgeHours,
        onProgress: options.json
          ? undefined
          : (progress) => {
              const totalPages = progress.totalPages === undefined ? "?" : String(progress.totalPages);
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
  .description("Compare previously collected source and target leaderboard populations.")
  .requiredOption("--source <leaderboardId>", "Collected source leaderboard ID")
  .requiredOption("--targets <leaderboardIds>", "Comma-separated collected target leaderboard IDs")
  .option("--db <path>", "SQLite database path", "data/kovaaks-compare.sqlite")
  .option("--paired-only", "Restrict percentile mapping and compared distributions to overlapping Steam IDs")
  .option("--percentiles <values>", "Comma-separated percentile rows to report", "50,60,75,88,95")
  .option("--outlier-trim-percent <percent>", "Trim this percentage of largest residual outliers for robust regression", parseTrimPercent, 0)
  .option("--outlier-limit <count>", "Number of residual outliers to include in output", parseNonNegativeInteger, 10)
  .option("--json", "Print JSON instead of terminal text")
  .option("--csv <path>", "Export comparison summary as CSV")
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
      }
    } finally {
      db.close();
    }
  });

leaderboard
  .command("cutoffs")
  .description("Map proposed source score cutoffs onto collected target leaderboards.")
  .requiredOption("--source <leaderboardId>", "Collected source leaderboard ID")
  .requiredOption("--targets <leaderboardIds>", "Comma-separated collected target leaderboard IDs")
  .requiredOption("--source-cutoffs <scores>", "Comma-separated source cutoff scores to map")
  .option("--db <path>", "SQLite database path", "data/kovaaks-compare.sqlite")
  .option("--outlier-trim-percent <percent>", "Trim this percentage of largest residual outliers for robust regression", parseTrimPercent, 0)
  .option("--json", "Print JSON instead of terminal text")
  .option("--csv <path>", "Export cutoff rows as CSV")
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
      }
    } finally {
      db.close();
    }
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

function parseCollectScenarios(options: { scenarios?: string; source?: string; targets?: string }): string[] {
  if (options.scenarios) {
    return parseScenarioList(options.scenarios);
  }
  if (options.source && options.targets) {
    return [options.source, ...parseScenarioList(options.targets)];
  }
  throw new Error("Provide --scenarios x,y,z, or the compatibility pair --source x --targets y,z.");
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
      throw new Error("--percentiles values must be numbers greater than 0 and less than 100.");
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
    throw new Error("--outlier-trim-percent must be greater than or equal to 0 and less than 50.");
  }
  return parsed;
}

function formatUserOutput(output: UserComparisonOutput): string {
  const lines = [`Player: ${output.player}`, "Score mode: best"];

  for (const comparison of output.comparisons) {
    lines.push("");
    lines.push(`${comparison.source.scenarioName} -> ${comparison.target.scenarioName}`);
    lines.push(`Source leaderboard: ${comparison.source.leaderboardId}`);
    lines.push(`Target leaderboard: ${comparison.target.leaderboardId}`);
    lines.push(`Source score: ${formatScore(comparison.sourceScore)}`);
    lines.push(`Target score: ${formatScore(comparison.targetScore)}`);
    if (comparison.equivalentTargetScore !== undefined) {
      lines.push(`Equivalent target score: ${formatNumber(comparison.equivalentTargetScore)}`);
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

function formatScore(score: { score: number | null; rank?: number; percentile?: number }): string {
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
    ].map(csvCell).join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

function formatCollectOutput(output: LeaderboardCollectOutput, dbPath: string): string {
  const lines = [`Database: ${dbPath}`, "", "Collected:"];
  for (const item of output.scenarios) {
    lines.push(
      `- ${item.scenario.scenarioName} (${item.scenario.leaderboardId}): ` +
        `${item.scoresStored}/${item.totalAvailable} stored, ` +
        `${item.pagesFetched} fetched, ${item.pagesSkipped} skipped, ${item.pagesFailed} failed` +
        `${item.complete ? "" : " (partial)"}`,
    );
    if (item.scenario.ambiguous) {
      lines.push(`  warning: "${item.scenario.input}" was ambiguous; selected first/best match.`);
    }
  }
  return lines.join("\n");
}

function formatLeaderboardCompareOutput(output: LeaderboardCompareOutput): string {
  const lines = [
    `Source: ${output.source.scenarioName} (${output.source.leaderboardId})`,
    `Source players collected: ${output.source.playersCollected}`,
  ];

  for (const target of output.targets) {
    lines.push("");
    lines.push(`Target: ${target.target.scenarioName} (${target.target.leaderboardId})`);
    lines.push(`Target players collected: ${target.targetPlayersCollected}`);
    lines.push(`Comparison population: ${target.comparisonPopulation}`);
    lines.push(`Source players compared: ${target.sourcePlayersCompared}`);
    lines.push(`Target players compared: ${target.targetPlayersCompared}`);
    lines.push(`Overlapping players: ${target.overlappingPlayers} (${target.overlapPercentage.toFixed(1)}%)`);
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

function formatLeaderboardCutoffsOutput(output: LeaderboardCutoffsOutput): string {
  const lines = [
    `Source: ${output.source.scenarioName} (${output.source.leaderboardId})`,
    `Source players collected: ${output.source.playersCollected}`,
  ];

  for (const target of output.targets) {
    lines.push("");
    lines.push(`Target: ${target.target.scenarioName} (${target.target.leaderboardId})`);
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
          `${row.trimmedRegressionTargetScore === undefined ? "" : `, trimmed ${formatOptional(row.trimmedRegressionTargetScore, 0)}`}`,
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
    ].map(csvCell).join(","),
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
        row.confidence,
      ].map(csvCell).join(","),
    ),
  );
  return [header.join(","), ...rows].join("\n");
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
