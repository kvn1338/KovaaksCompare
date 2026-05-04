import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import { AppDatabase } from "../database.js";
import {
  buildLeaderboardCutoffs,
  collectResolvedLeaderboards,
  compareStoredLeaderboards,
  scoreAtPercentile,
} from "../leaderboard.js";
import type { KovaaksClient } from "../kovaaks-client.js";
import type { LeaderboardPage, LeaderboardScore, ResolvedScenario } from "../types.js";

test("scoreAtPercentile maps leaderboard percentile to ranked score", () => {
  const scores = Array.from({ length: 100 }, (_, index) => 100 - index);

  assert.equal(scoreAtPercentile(scores, 95), 95);
  assert.equal(scoreAtPercentile(scores, 75), 76);
  assert.equal(scoreAtPercentile(scores, 50), 51);
  assert.equal(scoreAtPercentile([], 50), undefined);
});

test("compareStoredLeaderboards can restrict percentile distributions to paired players", async () => {
  const { db, cleanup } = await createTestDb();
  try {
    db.upsertScenario(scenario("source", "Source"));
    db.upsertScenario(scenario("target", "Target"));
    db.upsertLeaderboardScores(
      "source",
      [
        ...scores("shared", [100, 90, 80, 70, 60]),
        ...scores("source-only", [50, 40, 30, 20, 10]),
      ],
      "2026-01-01T00:00:00.000Z",
    );
    db.upsertLeaderboardScores(
      "target",
      [
        ...scores("target-only", [1000, 900, 800, 700, 600]),
        ...scores("shared", [50, 40, 30, 20, 10]),
      ],
      "2026-01-01T00:00:00.000Z",
    );

    const all = compareStoredLeaderboards(db, {
      sourceLeaderboardId: "source",
      targetLeaderboardIds: ["target"],
      percentiles: [50],
    }).targets[0];
    const paired = compareStoredLeaderboards(db, {
      sourceLeaderboardId: "source",
      targetLeaderboardIds: ["target"],
      pairedOnly: true,
      percentiles: [50],
    }).targets[0];

    assert.equal(all.comparisonPopulation, "all_collected");
    assert.equal(all.sourcePlayersCompared, 10);
    assert.equal(all.targetPlayersCompared, 10);
    assert.equal(all.percentileMapping[0]?.sourceScore, 60);
    assert.equal(all.percentileMapping[0]?.equivalentTargetScore, 600);

    assert.equal(paired.comparisonPopulation, "paired_only");
    assert.equal(paired.sourcePlayersCompared, 5);
    assert.equal(paired.targetPlayersCompared, 5);
    assert.equal(paired.percentileMapping[0]?.sourceScore, 80);
    assert.equal(paired.percentileMapping[0]?.equivalentTargetScore, 30);
    assert.ok(
      paired.warnings.some((warning) =>
        warning.includes("restricted to overlapping players"),
      ),
    );
  } finally {
    db.close();
    await cleanup();
  }
});

test("buildLeaderboardCutoffs keeps exact linear regression estimates stable", async () => {
  const { db, cleanup } = await createTestDb();
  try {
    db.upsertScenario(scenario("source", "Source"));
    db.upsertScenario(scenario("target", "Target"));
    const sourceScores: LeaderboardScore[] = [];
    const targetScores: LeaderboardScore[] = [];
    for (let index = 1; index <= 40; index += 1) {
      const sourceScore = index * 100;
      sourceScores.push(score(`p${index}`, sourceScore, 41 - index));
      targetScores.push(score(`p${index}`, sourceScore * 2 + 10, 41 - index));
    }
    db.upsertLeaderboardScores("source", sourceScores, "2026-01-01T00:00:00.000Z");
    db.upsertLeaderboardScores("target", targetScores, "2026-01-01T00:00:00.000Z");

    const output = buildLeaderboardCutoffs(db, {
      sourceLeaderboardId: "source",
      targetLeaderboardIds: ["target"],
      sourceCutoffs: [500, 2000, 3500],
    }).targets[0];

    assert.equal(output.overlappingPlayers, 40);
    assert.equal(output.regression?.sampleSize, 40);
    assert.ok(output.regression);
    assert.equal(Math.round(output.regression.slope * 1000) / 1000, 2);
    assert.equal(Math.round(output.regression.intercept), 10);
    assert.deepEqual(
      output.cutoffs.map((row) => Math.round(row.linearRegressionTargetScore ?? NaN)),
      [1010, 4010, 7010],
    );
  } finally {
    db.close();
    await cleanup();
  }
});

test("collectResolvedLeaderboards samples large leaderboards and reuses fresh cached pages", async () => {
  const { db, cleanup } = await createTestDb();
  const client = new FakeKovaaksClient(5100);
  const inputScenario = scenario("sampled", "Sampled Scenario");

  try {
    const first = await collectResolvedLeaderboards(client as unknown as KovaaksClient, db, {
      scenarios: [inputScenario],
      sampleRate: 0.2,
    });

    assert.equal(client.calls.length, 11);
    assert.deepEqual(client.calls, [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
    assert.equal(first.scenarios[0]?.pagesFetched, 11);
    assert.equal(first.scenarios[0]?.pagesSkipped, 0);
    assert.equal(first.scenarios[0]?.pagesTotal, 51);
    assert.equal(first.scenarios[0]?.uniquePlayersStored, 1100);
    assert.equal(first.scenarios[0]?.complete, false);

    const second = await collectResolvedLeaderboards(client as unknown as KovaaksClient, db, {
      scenarios: [inputScenario],
      sampleRate: 0.2,
    });

    assert.equal(client.calls.length, 11);
    assert.equal(second.scenarios[0]?.pagesFetched, 0);
    assert.equal(second.scenarios[0]?.pagesSkipped, 11);
  } finally {
    db.close();
    await cleanup();
  }
});

class FakeKovaaksClient {
  readonly calls: number[] = [];

  constructor(private readonly total: number) {}

  async getLeaderboardScores(params: {
    leaderboardId: string;
    page?: number;
    max?: number;
  }): Promise<LeaderboardPage> {
    const page = params.page ?? 0;
    const max = params.max ?? 100;
    this.calls.push(page);
    const start = page * max;
    const count = Math.max(0, Math.min(max, this.total - start));
    return {
      leaderboardId: params.leaderboardId,
      page,
      max,
      total: this.total,
      scores: Array.from({ length: count }, (_, index) =>
        score(`p${start + index}`, this.total - start - index, start + index + 1),
      ),
    };
  }
}

async function createTestDb(): Promise<{ db: AppDatabase; cleanup: () => Promise<void> }> {
  const dir = await mkdtemp(join(tmpdir(), "kovaaks-compare-test-"));
  return {
    db: new AppDatabase(join(dir, "test.sqlite")),
    cleanup: () => rm(dir, { recursive: true, force: true }),
  };
}

function scenario(leaderboardId: string, scenarioName: string): ResolvedScenario {
  return {
    input: scenarioName,
    leaderboardId,
    scenarioName,
    ambiguous: false,
    alternatives: [],
  };
}

function scores(prefix: string, values: number[]): LeaderboardScore[] {
  return values.map((value, index) => score(`${prefix}-${index}`, value, index + 1));
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
