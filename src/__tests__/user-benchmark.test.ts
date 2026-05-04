import assert from "node:assert/strict";
import test from "node:test";
import type { CalibrationConfig, CalibrationMapping } from "../calibration.js";
import type { KovaaksClient } from "../kovaaks-client.js";
import { compareUserBenchmarks } from "../user-benchmark.js";
import type { BenchmarkPlayerScenarioProgress } from "../types.js";

test("compareUserBenchmarks summarizes Steam user progress against configured cutoffs", async () => {
  const client = new FakeUserBenchmarkClient({
    "101": [
      progress("source-a-lb", "Source A", 1500, 12),
      progress("source-b-lb", "Source B", 2500, 8),
    ],
    "202": [
      progress("target-a-lb", "Target A", 2200, 20),
      progress("target-b-lb", "Target B", undefined, undefined),
    ],
  });

  const output = await compareUserBenchmarks(client as unknown as KovaaksClient, config, {
    steamId: "kyuri",
    benchmarkIds: ["source-benchmark", "target-benchmark"],
  });

  assert.equal(output.steamId, "76561198409458631");
  assert.equal(output.benchmarks.length, 2);
  assert.equal(output.benchmarks[0]?.scenariosWithScores, 2);
  assert.equal(output.benchmarks[0]?.scenarios[0]?.achievedCutoff?.label, "Silver");
  assert.equal(output.benchmarks[0]?.scenarios[0]?.nextCutoff?.label, "Gold");
  assert.equal(output.benchmarks[0]?.scenarios[0]?.nextCutoff?.remaining, 500);
  assert.equal(output.benchmarks[1]?.scenariosWithScores, 1);
  assert.ok(
    output.benchmarks[1]?.scenarios[1]?.warnings.some((warning) =>
      warning.includes("did not include a recognized score field"),
    ),
  );
});

test("compareUserBenchmarks can produce mapped source-target scenario comparisons", async () => {
  const client = new FakeUserBenchmarkClient({
    "101": [progress("source-a-lb", "Source A", 1500, 12)],
    "202": [progress("target-a-lb", "Target A", 2200, 20)],
  });

  const output = await compareUserBenchmarks(client as unknown as KovaaksClient, config, {
    steamId: "76561198409458631",
    benchmarkIds: [],
    mapping,
  });

  assert.equal(output.benchmarks.length, 2);
  assert.equal(output.mappedComparisons.length, 1);
  assert.equal(output.mappedComparisons[0]?.sourceScenario.scenarioName, "Source A");
  assert.equal(output.mappedComparisons[0]?.targetScenario.scenarioName, "Target A");
  assert.equal(output.mappedComparisons[0]?.scoreDelta, 700);
  assert.equal(output.mappedComparisons[0]?.rankLabelChange, "Silver -> Gold");
});

class FakeUserBenchmarkClient {
  constructor(private readonly progressByBenchmarkId: Record<string, BenchmarkPlayerScenarioProgress[]>) {}

  async resolveSteamId(input: string): Promise<string> {
    return input === "kyuri" ? "76561198409458631" : input;
  }

  async getBenchmarkPlayerProgress(params: {
    benchmarkId: string;
  }): Promise<BenchmarkPlayerScenarioProgress[]> {
    return this.progressByBenchmarkId[params.benchmarkId] ?? [];
  }
}

const config: CalibrationConfig = {
  name: "User Benchmark Test",
  benchmarks: [
    {
      id: "source-benchmark",
      name: "Source Benchmark",
      benchmarkId: "101",
      scenarios: [
        scenario("source-a", "Source A", "source-a-lb"),
        scenario("source-b", "Source B", "source-b-lb"),
      ],
    },
    {
      id: "target-benchmark",
      name: "Target Benchmark",
      benchmarkId: "202",
      scenarios: [
        scenario("target-a", "Target A", "target-a-lb"),
        scenario("target-b", "Target B", "target-b-lb"),
      ],
    },
  ],
};

const mapping: CalibrationMapping = {
  id: "source-to-target",
  name: "Source to Target",
  sourceBenchmark: "source-benchmark",
  targetBenchmark: "target-benchmark",
  pairs: [{ sourceScenario: "source-a", targetScenario: "target-a" }],
};

function scenario(id: string, name: string, leaderboardId: string) {
  return {
    id,
    name,
    leaderboardId,
    category: "Tracking",
    subcategory: "Control",
    cutoffs: [],
    rankCutoffs: {
      Bronze: 1000,
      Silver: 1400,
      Gold: 2000,
    },
  };
}

function progress(
  leaderboardId: string,
  scenarioName: string,
  scoreValue: number | undefined,
  rank: number | undefined,
): BenchmarkPlayerScenarioProgress {
  return {
    scenarioId: leaderboardId,
    scenarioName,
    leaderboardId,
    rankMaxes: {},
    score: scoreValue,
    rank,
  };
}
