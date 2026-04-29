import { dirname } from "node:path";
import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import type { LeaderboardScore, ResolvedScenario } from "./types.js";

export interface StoredLeaderboardScore extends LeaderboardScore {
  leaderboardId: string;
  fetchedAt: string;
}

export interface CollectionPageRecord {
  leaderboardId: string;
  page: number;
  status: "success" | "failed";
  scoresStored: number;
  totalAvailable: number;
  error?: string;
  fetchedAt: string;
}

export class AppDatabase {
  private readonly db: DatabaseSync;

  constructor(path = "data/kovaaks-compare.sqlite") {
    mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec("PRAGMA journal_mode = WAL");
    this.db.exec("PRAGMA foreign_keys = ON");
    this.migrate();
  }

  close(): void {
    this.db.close();
  }

  upsertScenario(scenario: ResolvedScenario): void {
    this.db
      .prepare(
        `INSERT INTO scenarios (leaderboard_id, scenario_name)
         VALUES (?, ?)
         ON CONFLICT(leaderboard_id) DO UPDATE SET scenario_name = excluded.scenario_name`,
      )
      .run(scenario.leaderboardId, scenario.scenarioName);
  }

  upsertLeaderboardScores(leaderboardId: string, scores: LeaderboardScore[], fetchedAt: string): void {
    const insert = this.db.prepare(
      `INSERT INTO leaderboard_scores (
        leaderboard_id, player_id, steam_id, username, webapp_username, score, rank, fetched_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(leaderboard_id, player_id) DO UPDATE SET
        steam_id = excluded.steam_id,
        username = excluded.username,
        webapp_username = excluded.webapp_username,
        score = excluded.score,
        rank = excluded.rank,
        fetched_at = excluded.fetched_at`,
    );

    this.db.exec("BEGIN");
    try {
      for (const score of scores) {
        const playerId = stablePlayerId(score);
        if (!playerId || !Number.isFinite(score.score)) {
          continue;
        }
        insert.run(
          leaderboardId,
          playerId,
          score.steamId ?? null,
          score.username ?? null,
          score.webappUsername ?? null,
          score.score,
          score.rank ?? null,
          fetchedAt,
        );
      }
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  upsertCollectionMetadata(params: {
    leaderboardId: string;
    pagesFetched: number;
    scoresStored: number;
    totalAvailable: number;
    complete: boolean;
    fetchedAt: string;
  }): void {
    this.db
      .prepare(
        `INSERT INTO leaderboard_collections (
          leaderboard_id, pages_fetched, scores_stored, total_available, complete, fetched_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(leaderboard_id) DO UPDATE SET
          pages_fetched = excluded.pages_fetched,
          scores_stored = excluded.scores_stored,
          total_available = excluded.total_available,
          complete = excluded.complete,
          fetched_at = excluded.fetched_at`,
      )
      .run(
        params.leaderboardId,
        params.pagesFetched,
        params.scoresStored,
        params.totalAvailable,
        params.complete ? 1 : 0,
        params.fetchedAt,
      );
  }

  upsertCollectionPage(params: CollectionPageRecord): void {
    this.db
      .prepare(
        `INSERT INTO leaderboard_collection_pages (
          leaderboard_id, page, status, scores_stored, total_available, error, fetched_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(leaderboard_id, page) DO UPDATE SET
          status = excluded.status,
          scores_stored = excluded.scores_stored,
          total_available = excluded.total_available,
          error = excluded.error,
          fetched_at = excluded.fetched_at`,
      )
      .run(
        params.leaderboardId,
        params.page,
        params.status,
        params.scoresStored,
        params.totalAvailable,
        params.error ?? null,
        params.fetchedAt,
      );
  }

  getCollectionPage(leaderboardId: string, page: number): CollectionPageRecord | undefined {
    const row = this.db
      .prepare(
        `SELECT leaderboard_id, page, status, scores_stored, total_available, error, fetched_at
         FROM leaderboard_collection_pages
         WHERE leaderboard_id = ? AND page = ?`,
      )
      .get(leaderboardId, page) as
      | {
          leaderboard_id: string;
          page: number;
          status: "success" | "failed";
          scores_stored: number;
          total_available: number;
          error: string | null;
          fetched_at: string;
        }
      | undefined;
    if (!row) return undefined;
    return {
      leaderboardId: row.leaderboard_id,
      page: row.page,
      status: row.status,
      scoresStored: row.scores_stored,
      totalAvailable: row.total_available,
      error: row.error ?? undefined,
      fetchedAt: row.fetched_at,
    };
  }

  getCollectionPageStats(leaderboardId: string): {
    successfulPages: number;
    failedPages: number;
    latestFetchedAt?: string;
  } {
    const row = this.db
      .prepare(
        `SELECT
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) AS successful_pages,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_pages,
          MAX(fetched_at) AS latest_fetched_at
         FROM leaderboard_collection_pages
         WHERE leaderboard_id = ?`,
      )
      .get(leaderboardId) as {
      successful_pages: number | null;
      failed_pages: number | null;
      latest_fetched_at: string | null;
    };
    return {
      successfulPages: row.successful_pages ?? 0,
      failedPages: row.failed_pages ?? 0,
      latestFetchedAt: row.latest_fetched_at ?? undefined,
    };
  }

  createScenarioComparison(params: {
    sourceLeaderboardId: string;
    targetLeaderboardId: string;
    scoreMode: string;
      }): void {
    this.db
      .prepare(
        `INSERT INTO scenario_comparisons (
          source_leaderboard_id, target_leaderboard_id, score_mode
        )
        VALUES (?, ?, ?)`,
      )
      .run(
        params.sourceLeaderboardId,
        params.targetLeaderboardId,
        params.scoreMode,
      );
  }

  getScenarioName(leaderboardId: string): string {
    const row = this.db
      .prepare("SELECT scenario_name FROM scenarios WHERE leaderboard_id = ?")
      .get(leaderboardId) as { scenario_name?: string } | undefined;
    return row?.scenario_name ?? `leaderboard ${leaderboardId}`;
  }

  getScores(leaderboardId: string): StoredLeaderboardScore[] {
    const rows = this.db
      .prepare(
        `SELECT leaderboard_id, player_id, steam_id, username, webapp_username, score, rank, fetched_at
         FROM leaderboard_scores
         WHERE leaderboard_id = ?
         ORDER BY rank ASC`,
      )
      .all(leaderboardId) as Array<{
        leaderboard_id: string;
        player_id: string;
        steam_id: string | null;
        username: string | null;
        webapp_username: string | null;
        score: number;
        rank: number | null;
        fetched_at: string;
      }>;

    return rows.map((row) => ({
      leaderboardId: row.leaderboard_id,
      playerId: row.player_id,
      steamId: row.steam_id ?? undefined,
      username: row.username ?? undefined,
      webappUsername: row.webapp_username,
      score: row.score,
      rank: row.rank ?? undefined,
      fetchedAt: row.fetched_at,
    }));
  }

  getScoreCount(leaderboardId: string): number {
    const row = this.db
      .prepare("SELECT COUNT(*) AS count FROM leaderboard_scores WHERE leaderboard_id = ?")
      .get(leaderboardId) as { count: number };
    return row.count;
  }

  getCollectionMetadata(leaderboardId: string): {
    pagesFetched: number;
    scoresStored: number;
    totalAvailable: number;
    complete: boolean;
    fetchedAt: string;
  } | undefined {
    const row = this.db
      .prepare(
        `SELECT pages_fetched, scores_stored, total_available, complete, fetched_at
         FROM leaderboard_collections
         WHERE leaderboard_id = ?`,
      )
      .get(leaderboardId) as
      | {
          pages_fetched: number;
          scores_stored: number;
          total_available: number;
          complete: number;
          fetched_at: string;
        }
      | undefined;
    if (!row) return undefined;
    return {
      pagesFetched: row.pages_fetched,
      scoresStored: row.scores_stored,
      totalAvailable: row.total_available,
      complete: row.complete === 1,
      fetchedAt: row.fetched_at,
    };
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS scenarios (
        leaderboard_id TEXT PRIMARY KEY,
        scenario_name TEXT NOT NULL,
        benchmark_group TEXT,
        benchmark_season TEXT,
        difficulty_label TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS leaderboard_scores (
        leaderboard_id TEXT NOT NULL,
        player_id TEXT NOT NULL,
        steam_id TEXT,
        username TEXT,
        webapp_username TEXT,
        score REAL NOT NULL,
        rank INTEGER,
        fetched_at TEXT NOT NULL,
        PRIMARY KEY (leaderboard_id, player_id)
      );

      CREATE INDEX IF NOT EXISTS idx_leaderboard_scores_steam_id
        ON leaderboard_scores (steam_id);

      CREATE INDEX IF NOT EXISTS idx_leaderboard_scores_rank
        ON leaderboard_scores (leaderboard_id, rank);

      CREATE TABLE IF NOT EXISTS scenario_comparisons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_leaderboard_id TEXT NOT NULL,
        target_leaderboard_id TEXT NOT NULL,
        score_mode TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS leaderboard_collections (
        leaderboard_id TEXT PRIMARY KEY,
        pages_fetched INTEGER NOT NULL,
        scores_stored INTEGER NOT NULL,
        total_available INTEGER NOT NULL,
        complete INTEGER NOT NULL,
        fetched_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS leaderboard_collection_pages (
        leaderboard_id TEXT NOT NULL,
        page INTEGER NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('success', 'failed')),
        scores_stored INTEGER NOT NULL,
        total_available INTEGER NOT NULL,
        error TEXT,
        fetched_at TEXT NOT NULL,
        PRIMARY KEY (leaderboard_id, page)
      );

      CREATE INDEX IF NOT EXISTS idx_leaderboard_collection_pages_status
        ON leaderboard_collection_pages (leaderboard_id, status);
    `);
  }
}

function stablePlayerId(score: LeaderboardScore): string | undefined {
  return score.steamId ?? score.webappUsername ?? score.username ?? score.playerId;
}
