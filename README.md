# Kovaaks Compare

Prototype CLI for comparing KovaaK's benchmark scenario scores across scenarios.

## Technical Plan

1. Keep unofficial KovaaK's webapp calls behind `KovaaksClient`.
2. Resolve scenario names to leaderboard IDs without assuming names are unique.
3. Implement Phase 1 user comparison first: best score, rank, percentile, and percentile-equivalent target score.
4. Cache API responses under `.cache/kovaaks`, add conservative delay and retry behavior, and keep output exportable as JSON or CSV.
5. Add Phase 2 collection later with SQLite-backed leaderboard pages and local joins.

## Setup

```bash
npm install
npm run build
```

Run during development:

```bash
npm run dev -- user \
  --player "SomeUsername" \
  --source "WhisphereRawControl" \
  --targets "VT Raw Control Intermediate S5,WhisphereRawControl Larger + Slowed"
```

After building:

```bash
node dist/cli.js user \
  --player "SomeUsernameOrSteamVanityOrSteamId" \
  --source "WhisphereRawControl" \
  --targets "VT Raw Control Intermediate S5,WhisphereRawControl Larger + Slowed"
```

Useful flags:

```bash
--json
--csv output.csv
--max-pages 10
--refresh
--debug
```

## Example Output

```text
Player: SomeUsername
Score mode: best

WhisphereRawControl -> VT Raw Control Intermediate S5
Source leaderboard: 12345
Target leaderboard: 98048
Source score: 3120, rank 420, 82.1th percentile
Target score: 3374, rank 3438, 91.2th percentile
Equivalent target score: 3011
Interpretation:
- Player's WhisphereRawControl score is around the 82.1th percentile.
- The equivalent percentile score in VT Raw Control Intermediate S5 is approximately 3011.
- Player performs relatively better in target than source.
Warnings:
- source scenario "WhisphereRawControl" was ambiguous; using WhisphereRawControl (12345).
```

The IDs and scores above are illustrative. The CLI does not fake data; live output depends on the unofficial API.

## Endpoint Notes

The implementation uses community-discovered webapp backend endpoints:

- `GET /webapp-backend/scenario/popular?scenarioNameSearch=...`
- `GET /webapp-backend/leaderboard/scores/global?leaderboardId=...`
- `GET /webapp-backend/leaderboard/global/search/account-names?username=...`
- `GET /webapp-backend/user/scenario/total-play?username=...`

Only best-score comparison is supported. The unofficial web API does not appear to expose reliable per-player run history for arbitrary Steam identities. Tools such as Refleks appear to derive richer run history from local KovaaK's files, so the CLI avoids pretending that `average_last_x` is available through the API.

Player identity handling:

- A 17-digit SteamID64 is used directly for leaderboard matching.
- A Steam vanity name or Steam profile URL, for example `xerone` or `https://steamcommunity.com/id/xerone`, is resolved through Steam's XML profile endpoint and matched by SteamID64 in leaderboard pages.
- KovaaK's `leaderboard/global/search/account-names` can resolve KovaaK leaderboard usernames such as `a1mlezz` to Steam IDs and Steam account names.
- KovaaK's leaderboard `usernameSearch` parameter works for account-name searches, but results are fuzzy and must be verified by SteamID when available.
- KovaaK's `user/scenario/total-play` can retrieve scores directly by KovaaK webapp username, but it does not accept SteamID64.

## Phase 2 CLI

Collect scenario leaderboard pages into SQLite:

```bash
node dist/cli.js leaderboard collect \
  --scenarios "Smoothsphere Viscose Easier,WhisphereRawControl Larger + Slowed"
```

Omit `--max-pages` to collect every page. Add `--max-pages 100` when you want a bounded partial scrape.
Collection resumes automatically by skipping successful page records already stored in SQLite. Use `--refresh-db` to force refetching stored pages, or `--max-age-hours 24` to refetch stale pages.

Compare collected leaderboards locally:

```bash
node dist/cli.js leaderboard compare \
  --source 185342 \
  --targets 128696 \
  --percentiles 50,60,75,88,95 \
  --outlier-trim-percent 5 \
  --csv comparison.csv
```

Restrict comparison distributions to players present in both leaderboards:

```bash
node dist/cli.js leaderboard compare \
  --source 185342 \
  --targets 128696 \
  --paired-only
```

Optional flags:

```bash
--db data/kovaaks-compare.sqlite
--json
--refresh
--debug
--request-delay-ms 750
--max-request-delay-ms 15000
--max-retries 6
--max-pages 100
--refresh-db
--max-age-hours 24
--paired-only
--percentiles 50,75,90,95
--outlier-trim-percent 5
--outlier-limit 20
```

Collection is sequential, resumable, and uses adaptive request delay. Retryable API errors such as `429` and `5xx` increase the delay up to `--max-request-delay-ms`; successful requests gradually relax it back toward `--request-delay-ms`. Progress is printed to stderr during text-mode collection.

The `leaderboard compare` command currently computes:

- source players collected
- target players collected
- overlapping players and overlap percentage
- Pearson correlation
- log-score Pearson correlation
- simple linear regression
- optional trimmed regression after removing the largest residual outliers
- percentile-equivalent score table
- paired-player quantile mapping from nearby overlapping players
- largest residual outliers

By default, percentile mapping uses all collected source and target scores and reports `50,60,75,88,95`. Use `--percentiles` to choose different rows. With `--paired-only`, percentile mapping and compared population counts are restricted to overlapping players whose Steam IDs/player IDs appear in both leaderboards. Correlation and regression are always computed from overlapping players.

Map proposed benchmark cutoffs from one collected source leaderboard to 1-3 collected target leaderboards:

```bash
node dist/cli.js leaderboard cutoffs \
  --source 185342 \
  --targets 128696 \
  --source-cutoffs 9000,10000,11000 \
  --outlier-trim-percent 5 \
  --csv cutoffs.csv
```

The cutoff command reports:

- source cutoff percentile in the collected source population
- target score at the same global percentile
- paired-window target estimate using nearby overlapping players
- monotonic paired estimate for cutoff ladders
- linear and optional trimmed-regression estimates

Population comparison currently supports best scores only.

## Phase 2 TODO

- Validate the cutoff mapping on larger complete leaderboard pulls.
- Add configurable paired-window size and interpolation grid if the default 5% local window is too coarse.
- Add persisted comparison/cutoff result snapshots for repeatable calibration reports.
- Add richer CSV exports for percentile and outlier detail rows.
- Add optional web UI after the CLI data flow stabilizes.

Suggested initial schema:

```sql
CREATE TABLE scenarios (
  leaderboard_id TEXT PRIMARY KEY,
  scenario_name TEXT NOT NULL,
  benchmark_group TEXT,
  benchmark_season TEXT,
  difficulty_label TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leaderboard_scores (
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

CREATE TABLE scenario_comparisons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_leaderboard_id TEXT NOT NULL,
  target_leaderboard_id TEXT NOT NULL,
  score_mode TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```
