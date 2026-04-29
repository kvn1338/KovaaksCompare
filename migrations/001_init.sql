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
