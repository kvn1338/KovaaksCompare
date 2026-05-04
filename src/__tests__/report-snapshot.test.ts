import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCalibrationReport,
  calibrationReportToCsv,
  calibrationReportToMarkdown,
  type CalibrationConfig,
  type CalibrationMapping,
  withMapping,
} from "../calibration.js";
import { AppDatabase } from "../database.js";
import type { LeaderboardScore, ResolvedScenario } from "../types.js";

test("calibration report Markdown and CSV stay stable", async () => {
  const { db, cleanup } = await createTestDb();
  try {
    db.upsertScenario(resolvedScenario("source-lb", "Source Scenario"));
    db.upsertScenario(resolvedScenario("target-lb", "Target Scenario"));

    const sourceScores: LeaderboardScore[] = [];
    const targetScores: LeaderboardScore[] = [];
    for (let index = 1; index <= 40; index += 1) {
      const sourceScore = index * 100;
      sourceScores.push(score(`p${index}`, sourceScore, 41 - index));
      targetScores.push(score(`p${index}`, sourceScore * 2 + 10, 41 - index));
    }
    db.upsertLeaderboardScores("source-lb", sourceScores, "2026-01-01T00:00:00.000Z");
    db.upsertLeaderboardScores("target-lb", targetScores, "2026-01-01T00:00:00.000Z");

    const report = buildCalibrationReport(db, withMapping(config, mapping), {
      mappingId: mapping.id,
      percentiles: [50],
      outlierTrimPercent: 5,
      outlierLimit: 3,
    });

    assert.equal(
      calibrationReportToMarkdown(report),
      `# Snapshot Calibration

Mapping: Snapshot Map

Source benchmark: Source Benchmark
Target benchmark: Target Benchmark

## Source Scenario -> Target Scenario

- Source leaderboard: source-lb
- Target leaderboard: target-lb
- Overlapping players: 40 (100.0%)
- Correlation: 1.0000
- Log correlation: 1.0000
- Linear regression: target ~= 2.0000 * source + 10.00 (R^2 1.0000)
- Trimmed regression: target ~= 2.0000 * source + 10.00 (R^2 1.0000, n=38)
- Log-log regression: log(target) ~= 0.9917 * log(source) + 0.7595 (R^2 1.0000, n=40)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 2100 | 50% | 4210 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 500 | 12.5% | 1210 | 1610 | 1610 | 1010 | 1010 | 1015 | low |
| 2000 | 50.0% | 4210 | 4010 | 4010 | 4010 | 4010 | 4013 | low |
| 3500 | 87.5% | 7210 | 6610 | 6610 | 7010 | 7010 | 6991 | low |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 1 cutoff row(s); largest difference is 25% below paired-window at source cutoff 500. This may indicate target leaderboard population skew or sparse paired data.
`,
    );
    assert.equal(
      calibrationReportToCsv(report),
      `mapping_id,source_benchmark,target_benchmark,source_scenario_id,source_scenario,source_leaderboard_id,target_scenario_id,target_scenario,target_leaderboard_id,overlapping_players,correlation,source_cutoff,source_percentile,global_percentile_target_score,paired_window_target_score,paired_monotonic_target_score,linear_regression_target_score,trimmed_regression_target_score,log_regression_target_score,confidence
snapshot-map,Source Benchmark,Target Benchmark,source-scenario,Source Scenario,source-lb,target-scenario,Target Scenario,target-lb,40,1,500,12.5,1210,1610,1610,1010,1010,1014.9348366539734,low
snapshot-map,Source Benchmark,Target Benchmark,source-scenario,Source Scenario,source-lb,target-scenario,Target Scenario,target-lb,40,1,2000,50,4210,4010,4010,4010,4010,4013.3312611098795,low
snapshot-map,Source Benchmark,Target Benchmark,source-scenario,Source Scenario,source-lb,target-scenario,Target Scenario,target-lb,40,1,3500,87.5,7210,6610,6610,7010,7010,6990.809011836171,low`,
    );
  } finally {
    db.close();
    await cleanup();
  }
});

const config: CalibrationConfig = {
  name: "Snapshot Calibration",
  benchmarks: [
    {
      id: "source-benchmark",
      name: "Source Benchmark",
      scenarios: [
        {
          id: "source-scenario",
          name: "Source Scenario",
          leaderboardId: "source-lb",
          cutoffs: [500, 2000, 3500],
          category: "Control Tracking",
          subcategory: "Arm",
        },
      ],
    },
    {
      id: "target-benchmark",
      name: "Target Benchmark",
      scenarios: [
        {
          id: "target-scenario",
          name: "Target Scenario",
          leaderboardId: "target-lb",
          cutoffs: [],
          category: "Control Tracking",
          subcategory: "Arm",
        },
      ],
    },
  ],
};

const mapping: CalibrationMapping = {
  id: "snapshot-map",
  name: "Snapshot Map",
  sourceBenchmark: "source-benchmark",
  targetBenchmark: "target-benchmark",
  pairs: [{ sourceScenario: "source-scenario", targetScenario: "target-scenario" }],
};

async function createTestDb(): Promise<{ db: AppDatabase; cleanup: () => Promise<void> }> {
  const dir = await mkdtemp(join(tmpdir(), "kovaaks-compare-report-test-"));
  return {
    db: new AppDatabase(join(dir, "test.sqlite")),
    cleanup: () => rm(dir, { recursive: true, force: true }),
  };
}

function resolvedScenario(leaderboardId: string, scenarioName: string): ResolvedScenario {
  return {
    input: scenarioName,
    leaderboardId,
    scenarioName,
    ambiguous: false,
    alternatives: [],
  };
}

function score(playerId: string, value: number, rank: number): LeaderboardScore {
  return {
    playerId,
    steamId: playerId,
    username: playerId,
    score: value,
    rank,
  };
}
