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
--db data/kovaaks-compare.sqlite
```

If `--db` points at a SQLite database produced by `leaderboard collect` or `calibration collect` and the target leaderboard collection there is marked complete, the equivalent target score is computed locally from stored leaderboard scores instead of paginating the unofficial API.

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
- log-log regression on overlapping players (`log(target) = a * log(source) + b`)
- percentile-equivalent score table
- paired-player quantile mapping from nearby overlapping players
- largest residual outliers

By default, percentile mapping uses all collected source and target scores and reports `50,60,75,88,95`. Use `--percentiles` to choose different rows. With `--paired-only`, percentile mapping and compared population counts are restricted to overlapping players whose Steam IDs/player IDs appear in both leaderboards. Correlation and regression are always computed from overlapping players.

Pass `--explain` on `leaderboard compare`, `leaderboard cutoffs`, or `calibration report` (text or Markdown mode) to append a short glossary describing each metric, the same content as the section below.

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
- log-log regression estimate (`exp(b + a * log(source))`) for non-linear score relationships

Population comparison currently supports best scores only.

## Interpreting the Output

The CLI compares two leaderboards by matching players that appear in both ("overlap" or "paired" players) and projecting source scores onto the target. Each estimator answers the question "what target score corresponds to this source score?" using a different model. They usually disagree — that disagreement is the signal:

- **Overlapping players, overlap percentage** — how many players appear in both leaderboards. Higher is better; below ~50 paired players makes most other numbers shaky.
- **Pearson correlation** — linear relationship strength of paired source vs target scores, in `[-1, 1]`. Values near `1` mean target tracks source closely; near `0` means little linear relationship.
- **Log-score Pearson correlation** — same metric on `log(score)`. Often higher than the raw correlation when scores span a wide dynamic range, indicating the relationship is more multiplicative than additive.
- **Linear regression** — `target ≈ a * source + b`. Use the slope/intercept to project any source score. `R^2` is the share of target variance the line explains; closer to `1` is tighter.
- **Trimmed regression** — same fit after dropping the largest residual outliers from the initial linear model (controlled by `--outlier-trim-percent`). Less sensitive to a few weird players (cheaters, smurfs, broken runs).
- **Log-log regression** — `log(target) ≈ a * log(source) + b`, projected back via `exp(...)`. Better fit when scores scale multiplicatively across the range. Slope `a > 1` means target grows faster than source at the top; `a < 1` means it compresses.
- **Percentile mapping** (global) — for each percentile, the source score at that percentile in the collected source population vs the target score at the same percentile in the collected target population. Treats source and target populations as independent samples, so it ignores who-played-what. Robust when both leaderboards are well collected.
- **Paired-player quantile mapping** — same idea but restricted to overlapping players: median target score among the ~5% of paired players whose source scores sit nearest the queried source score. Smaller, but represents apples-to-apples comparison.
- **Paired-window target score** (in cutoff output) — same paired median but anchored at a specific cutoff value. `n=` is the window sample size that produced it.
- **Monotonic paired target score** — paired-window estimates evaluated at every 5th percentile, then forced non-decreasing in source score. Use this for a cutoff *ladder* where rank thresholds must not invert.
- **Confidence label** — `low|medium|high` heuristic over overlap count and ratio. Treat `low` as informational only.
- **Top outliers** — paired players with the largest residual against the linear regression, signed (`+` over-performers in target, `-` under-performers). Inspect these before trusting the linear fit; if removing them changes the trimmed regression a lot, prefer the trimmed or log-log estimate.

A practical workflow for cutoff calibration: prefer the **paired-window** estimate when overlap is dense at the cutoff value, fall back to **log-log** for extreme cutoffs at the tails, and use the **monotonic** estimate when producing a full rank ladder. Compare them — large divergence signals data sparsity at that cutoff.

## Phase 3 Calibration Configs

For benchmark calibration work, use a JSON config as the editable source of truth for:

- benchmark groups, for example current Viscose Easier and Viscose S2 Easier
- scenarios in each benchmark
- source ranking cutoffs per scenario
- explicit source-to-target scenario mappings

You can still create a manual starter config:

```bash
node dist/cli.js calibration init \
  --out configs/viscose-s2-easier.json
```

Prefer API-backed import when the benchmark exists in KovaaK's benchmark system. First download a static benchmark name-to-ID index. The endpoint is account-independent for the benchmark list itself, so the default username `KovaaksCompare` works; override with `--username` only if you want to scope the cache key:

```bash
node dist/cli.js calibration benchmark-index
```

The default `--out` is `configs/benchmark-index.json`. Use `--refresh` when you explicitly want to redownload. The list paginates automatically (page size 300) until every benchmark is collected.

Import a benchmark's scenarios and `rank_maxes` cutoff values into a calibration config. The default `--out` and `--config` paths both point at `configs/calibration.json` so a second import auto-appends to the same file:

```bash
node dist/cli.js calibration import-benchmark --benchmark-name "Viscose Easier" --difficulty easier
node dist/cli.js calibration import-benchmark --benchmark-name "Viscose Benchmark S2 Easier" --difficulty easier
```

`--index` auto-detects `configs/benchmark-index.json` when present, so the lookup uses it without extra flags. The `--steam-id` query parameter is required by KovaaK's benchmark scenario endpoint, but the scenario list and rank cutoffs appear to be benchmark-level data, so a fixed dummy SteamID (`11111111111111111`) is used by default. Override `--steam-id` or `--username` only when a specific account is needed.

Each imported scenario carries its KovaaK benchmark category (Arm, Wrist, Tracking, Control, etc.), used by the mapping creator below.

### Mapping benchmarks

Auto-generate a benchmark-to-benchmark mapping with category-aware pairing:

```bash
node dist/cli.js calibration mapping create \
  --source viscose-easier \
  --target viscose-benchmark-s2-easier \
  --id viscose-s1-to-s2
```

This appends a new entry to `configs/calibration.json#mappings` and prints the suggested pairs plus warnings. Pairing rules:

- Scenarios are bucketed by their imported `category`. Only scenarios in the same category are paired against each other, so an Arm scenario will never be paired with a Control scenario.
- Within a category, pairs are chosen greedily by Jaccard token similarity on scenario names.
- Pairs above `--similarity-threshold` (default `0.3`) are accepted silently. Pairs below the threshold are still emitted (because category-bucketed pairs are usually intentional 1-to-1 across versions) but flagged as needing review.
- When a category has different scenario counts on each side, all pairs that fit are still created and a warning is printed; leftovers go to the unpaired lists.
- When a category exists only on one side, no pairs are created and the entire bucket is reported as unpaired.

Always review the generated `pairs` block in the config before running a report; the heuristic is intentionally optimistic so the human edit pass is the smallest possible.

If you made a manual config, resolve scenario names to leaderboard IDs:

```bash
node dist/cli.js calibration resolve \
  --config configs/viscose-s2-easier.json \
  --out configs/viscose-s2-easier.resolved.json
```

Collect every scenario from the selected benchmark configs:

```bash
node dist/cli.js calibration collect \
  --config configs/viscose-s2-easier.resolved.json \
  --benchmarks viscose-current-easier,viscose-s2-easier
```

Generate one report for all configured mapped scenario pairs:

```bash
node dist/cli.js calibration report \
  --config configs/viscose-s2-easier.resolved.json \
  --mapping viscose-easier-to-s2-easier \
  --outlier-trim-percent 5 \
  --markdown reports/viscose-s2-easier.md \
  --csv reports/viscose-s2-easier.csv
```

The report uses the source scenario's configured `cutoffs` by default. For each mapped pair it includes overlap, correlation, linear/trimmed/log-log regression, percentile mapping, and cutoff estimates using global percentile, paired-window, monotonic paired, linear regression, trimmed regression, and log-log regression methods.

Config shape:

```json
{
  "name": "Viscose S2 Easier Calibration",
  "benchmarks": [
    {
      "id": "viscose-current-easier",
      "name": "Viscose Benchmark Easier",
      "benchmarkId": "686",
      "difficulty": "easier",
      "scenarios": [
        {
          "id": "smoothsphere-viscose-easier",
          "name": "Smoothsphere Viscose Easier",
          "leaderboardId": "185342",
          "cutoffs": [15000, 16000, 17000],
          "rankCutoffs": {
            "rank_1": 15000,
            "rank_2": 16000,
            "rank_3": 17000
          }
        }
      ]
    }
  ],
  "mappings": [
    {
      "id": "viscose-easier-to-s2-easier",
      "name": "Viscose Easier -> Viscose S2 Easier",
      "sourceBenchmark": "viscose-current-easier",
      "targetBenchmark": "viscose-s2-easier",
      "pairs": [
        {
          "sourceScenario": "smoothsphere-viscose-easier",
          "targetScenario": "whisphere-raw-control-larger-slowed"
        }
      ]
    }
  ]
}
```

## SQLite Schema

Schema is created automatically by `AppDatabase` and mirrored in `migrations/001_init.sql` for reference:

- `scenarios` — scenario name and benchmark metadata keyed by `leaderboard_id`
- `leaderboard_scores` — per-leaderboard player scores keyed by `(leaderboard_id, player_id)`
- `leaderboard_collections` — per-leaderboard collection summary (`pages_fetched`, `scores_stored`, `total_available`, `complete`)
- `leaderboard_collection_pages` — per-page status used to resume partial collections
- `scenario_comparisons` — audit log of comparison runs

## Next TODO

- Validate the cutoff mapping on larger complete leaderboard pulls (full Viscose S2 candidate population).
- Persist comparison and cutoff result snapshots for repeatable calibration reports (table or per-run JSON files).
- Add richer CSV exports for percentile and outlier detail rows.
- Add unit tests for the statistics helpers (`linearRegression`, `logLogRegression`, `scoreAtPercentile`, `buildMonotonicPairedAnchors`, `interpolateMonotonicTarget`, `pairedWindowTargetScore`).
- Make the paired-window size and interpolation grid configurable if the default 5% local window is too coarse.
- Add optional web UI after the CLI data flow stabilizes.
