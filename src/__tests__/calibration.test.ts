import assert from "node:assert/strict";
import test from "node:test";
import {
  type CalibrationConfig,
  type CalibrationMapping,
  suggestMapping,
  validateMapping,
} from "../calibration.js";

test("suggestMapping prefers exact scenario names before order fallback inside a category", () => {
  const config = calibrationConfig({
    sourceScenarios: [
      scenario("source-reload", "1w3ts reload Larger", "Flick Tech", "Speed"),
      scenario("source-vox", "voxTargetSwitch 2 Large", "Flick Tech", "Speed"),
      scenario("source-switch", "Legacy Switching", "Flick Tech", "Speed"),
    ],
    targetScenarios: [
      scenario("target-wide", "ww5t Voltaic Slightly Larger", "Flick Tech", "Speed"),
      scenario("target-vox", "voxTargetSwitch 2 Large", "Flick Tech", "Speed"),
      scenario("target-aimerz", "aimerz+ Static Switching 6 Bot Slightly Larger", "Flick Tech", "Speed"),
    ],
  });

  const suggestion = suggestMapping({
    config,
    sourceBenchmark: "source",
    targetBenchmark: "target",
  });

  assert.deepEqual(suggestion.mapping.pairs, [
    { sourceScenario: "source-vox", targetScenario: "target-vox" },
    { sourceScenario: "source-reload", targetScenario: "target-wide" },
    { sourceScenario: "source-switch", targetScenario: "target-aimerz" },
  ]);
  assert.equal(suggestion.unpairedSources.length, 0);
  assert.equal(suggestion.unpairedTargets.length, 0);
});

test("suggestMapping keeps repeated subcategory names scoped to their parent category", () => {
  const config = calibrationConfig({
    sourceScenarios: [
      scenario("source-reactive-speed", "Reactive Speed Source", "Reactive Tracking", "Speed"),
      scenario("source-flick-speed", "Flick Speed Source", "Flick Tech", "Speed"),
    ],
    targetScenarios: [
      scenario("target-reactive-speed", "Reactive Speed Target", "Reactive Tracking", "Speed"),
      scenario("target-flick-speed", "Flick Speed Target", "Flick Tech", "Speed"),
    ],
  });

  const suggestion = suggestMapping({
    config,
    sourceBenchmark: "source",
    targetBenchmark: "target",
  });

  assert.deepEqual(suggestion.mapping.pairs, [
    { sourceScenario: "source-reactive-speed", targetScenario: "target-reactive-speed" },
    { sourceScenario: "source-flick-speed", targetScenario: "target-flick-speed" },
  ]);
});

test("validateMapping warns about duplicate usage, missing IDs, and category mismatches", () => {
  const config = calibrationConfig({
    sourceScenarios: [
      scenario("source-control", "Control Scenario", "Control Tracking", "Arm"),
      scenario("source-click", "Click Scenario", "Click Timing", "Reading"),
    ],
    targetScenarios: [
      scenario("target-control", "Control Target", "Control Tracking", "Arm"),
      scenario("target-click", "Click Target", "Click Timing", "Reading"),
    ],
  });
  const mapping: CalibrationMapping = {
    id: "bad-map",
    name: "Bad Map",
    sourceBenchmark: "source",
    targetBenchmark: "target",
    pairs: [
      { sourceScenario: "source-control", targetScenario: "target-click" },
      { sourceScenario: "source-control", targetScenario: "missing-target" },
      { sourceScenario: "missing-source", targetScenario: "target-control" },
    ],
  };

  const result = validateMapping({ config, mapping });

  assert.deepEqual(
    result.duplicateSources.map((item) => item.id),
    ["source-control"],
  );
  assert.deepEqual(result.missingSourceScenarioIds, ["missing-source"]);
  assert.deepEqual(result.missingTargetScenarioIds, ["missing-target"]);
  assert.deepEqual(
    result.unpairedSources.map((item) => item.id),
    ["source-click"],
  );
  assert.equal(result.categoryMismatches.length, 1);
  assert.ok(result.warnings.some((warning) => warning.includes("mapped more than once")));
  assert.ok(result.warnings.some((warning) => warning.includes("cross parent category")));
});

test("validateMapping treats close parent-category rename matches separately from hard mismatches", () => {
  const config = calibrationConfig({
    sourceScenarios: [
      scenario("source-click", "Dynamic Click Source", "Dynamic Clicking", "Reading"),
    ],
    targetScenarios: [
      scenario("target-click", "Click Timing Target", "Click Timing", "Reading"),
    ],
  });
  const mapping: CalibrationMapping = {
    id: "rename-map",
    name: "Rename Map",
    sourceBenchmark: "source",
    targetBenchmark: "target",
    pairs: [{ sourceScenario: "source-click", targetScenario: "target-click" }],
  };

  const result = validateMapping({ config, mapping });

  assert.equal(result.categoryMismatches.length, 0);
  assert.equal(result.inferredParentRenames.length, 1);
  assert.ok(
    result.warnings.some((warning) =>
      warning.includes("inferred renamed parent categories"),
    ),
  );
});

function calibrationConfig(input: {
  sourceScenarios: CalibrationConfig["benchmarks"][number]["scenarios"];
  targetScenarios: CalibrationConfig["benchmarks"][number]["scenarios"];
}): CalibrationConfig {
  return {
    name: "Test Calibration",
    benchmarks: [
      {
        id: "source",
        name: "Source Benchmark",
        scenarios: input.sourceScenarios,
      },
      {
        id: "target",
        name: "Target Benchmark",
        scenarios: input.targetScenarios,
      },
    ],
  };
}

function scenario(
  id: string,
  name: string,
  category: string,
  subcategory: string,
): CalibrationConfig["benchmarks"][number]["scenarios"][number] {
  return {
    id,
    name,
    leaderboardId: `${id}-leaderboard`,
    cutoffs: [1000, 2000],
    category,
    subcategory,
  };
}
