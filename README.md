# Kovaaks Compare

Prototype CLI for comparing KovaaK's benchmark scenario leaderboards and generating calibration reports.

The main workflow is benchmark-to-benchmark calibration: import benchmark scenario metadata and cutoff values, create an editable match file, collect leaderboard scores for all scenarios in the matched benchmarks, then generate Markdown/CSV reports.

KovaaK's webapp API is unofficial and unstable. API calls are isolated behind `KovaaksClient`, cached locally, retried conservatively, and collected into SQLite so repeated analysis can run locally.

## Setup

```bash
npm install
npm run build
```

Run commands through Node:

```bash
node dist/cli.js --help
```

During development, use:

```bash
npm run dev -- --help
```

## Recommended Workflow

### 1. Download the benchmark index

This creates `configs/benchmark-index.json`, a local name-to-ID lookup for KovaaK's benchmark list.

```bash
node dist/cli.js benchmarks download
```

Use `--refresh` to redownload it.

### 2. Import the benchmarks you want to compare

This stores benchmark scenarios, leaderboard IDs, categories, and rank cutoff values in `configs/benchmarks.json`.

```bash
node dist/cli.js benchmarks import "Viscose Easier"
node dist/cli.js benchmarks import "Viscose Benchmark S2 Easier"
```

You can also import by numeric benchmark ID:

```bash
node dist/cli.js benchmarks import 686
```

The benchmark scenario endpoint requires a SteamID query parameter, but the returned scenario list and `rank_maxes` appear to be benchmark-level data. The CLI uses a fixed dummy SteamID by default.

### 3. Create an editable match file

This creates `configs/<match-id>.json`.

```bash
node dist/cli.js match create \
  viscose-easier \
  viscose-benchmark-s2-easier \
  --id viscose-easier-s1-to-s2
```

The matcher groups scenarios by imported benchmark category block, then pairs them sequentially inside each block. Repeated category labels are kept separate by occurrence order, so an early `Speed` block and a later `Speed` block do not get merged. Review the generated file before collecting/reporting, because this assumes both benchmarks keep the same category order.

### 4. Collect leaderboard scores for the matched benchmarks

This collects every scenario from both benchmarks referenced by the match file into SQLite.

```bash
node dist/cli.js collect --match viscose-easier-s1-to-s2
```

By default this stores data in `data/kovaaks-compare.sqlite` and collects all pages. For a test run:

```bash
node dist/cli.js collect \
  --match viscose-easier-s1-to-s2 \
  --max-pages 1 \
  --db /tmp/kovaaks-smoke.sqlite
```

Collection is resumable. Successful pages are skipped on later runs unless you pass `--refresh-db` or `--max-age-hours`.

For faster exploratory reports on large leaderboards, collect a rank-stratified page sample:

```bash
node dist/cli.js collect \
  --match viscose-easier-s1-to-s2 \
  --sample-rate 0.2
```

`--sample-rate 0.2` fetches roughly every 5th page, `0.1` roughly every 10th page, and so on. The page stride is rounded down from `1 / sampleRate`, page 0 is always fetched first, and the final page is included when sampling across the full leaderboard. Sampling is ignored for leaderboards with 50 pages or fewer.

Sampled collections are useful for fast global percentile and cutoff exploration, but they are not a substitute for final full pulls. Paired-player estimates can become noisier because sampling may reduce overlap between scenarios.

### 5. Generate a calibration report

```bash
node dist/cli.js report \
  --match viscose-easier-s1-to-s2 \
  --outlier-trim-percent 5 \
  --markdown reports/viscose-easier-s1-to-s2.md \
  --csv reports/viscose-easier-s1-to-s2.csv
```

Useful report flags:

```bash
--paired-only
--percentiles 50,60,75,88,95
--outlier-trim-percent 5
--outlier-limit 20
--explain
--json
```

`--paired-only` restricts percentile mapping and compared source/target distributions to players who appear in both matched leaderboards. Correlation and regression are already based on overlapping players, so this flag mainly changes the percentile-equivalent rows and cutoff estimates that would otherwise use each full collected leaderboard independently.

The report uses source benchmark cutoff values from `configs/benchmarks.json` and maps them to the target scenario using multiple estimators.

## Config Files

`configs/benchmarks.json` contains imported benchmark metadata:

```json
{
  "name": "KovaaK's benchmark calibration",
  "benchmarks": [
    {
      "id": "viscose-easier",
      "name": "Viscose Easier",
      "benchmarkId": "686",
      "difficulty": "easier",
      "scenarios": [
        {
          "id": "smoothsphere-viscose-easier",
          "name": "Smoothsphere Viscose Easier",
          "leaderboardId": "185342",
          "category": "Tracking",
          "cutoffs": [15000, 16000, 17000],
          "rankCutoffs": {
            "rank_1": 15000,
            "rank_2": 16000,
            "rank_3": 17000
          }
        }
      ]
    }
  ]
}
```

`configs/<match-id>.json` contains one editable benchmark mapping:

```json
{
  "id": "viscose-easier-s1-to-s2",
  "name": "Viscose Easier -> Viscose Benchmark S2 Easier",
  "sourceBenchmark": "viscose-easier",
  "targetBenchmark": "viscose-benchmark-s2-easier",
  "pairs": [
    {
      "sourceScenario": "smoothsphere-viscose-easier",
      "targetScenario": "whisphere-raw-control-larger-slowed"
    }
  ]
}
```

## What the Report Includes

For each matched scenario pair, the report includes:

- source and target leaderboard population counts
- overlapping players matched by stable ID/SteamID where available
- overlap percentage
- Pearson correlation
- log-score correlation
- linear regression
- optional trimmed regression
- log-log regression
- percentile-equivalent score rows
- source cutoff mapping estimates
- largest regression outliers

The most useful cutoff estimates are usually:

- **paired-window**: median target score among nearby overlapping players
- **monotonic paired**: paired estimates forced into a non-decreasing cutoff ladder
- **log-log regression**: useful when score scaling is multiplicative or tail-heavy
- **global percentile**: simple population percentile mapping, useful when both leaderboards are fully collected

Large disagreement between estimators usually means the data is sparse, the scenarios measure different skills, or outliers are affecting the fit.

## Data Collection Safety

Leaderboard collection is intentionally conservative:

- API responses are cached under `.cache/kovaaks`
- SQLite page records make collection resumable
- retryable `429` and `5xx` responses use exponential/adaptive backoff
- request delay increases after API errors and gradually relaxes after successful requests
- default collection concurrency is sequential

Useful collection flags:

```bash
--max-pages 10
--sample-rate 0.2
--refresh-db
--max-age-hours 24
--request-delay-ms 750
--max-request-delay-ms 15000
--max-retries 6
--refresh
--debug
```

## Single-User Comparison

The original single-player comparison command is still available:

```bash
node dist/cli.js user \
  --player "SomeUsernameOrSteamVanityOrSteamId" \
  --source "WhisphereRawControl" \
  --targets "VT Raw Control Intermediate S5,WhisphereRawControl Larger + Slowed"
```

Only best-score comparison is supported.

Player lookup behavior:

- 17-digit SteamID64 values are used directly
- Steam vanity names and `steamcommunity.com/id/...` URLs are resolved through Steam's XML profile endpoint
- KovaaK leaderboard usernames can be resolved through `/leaderboard/global/search/account-names`
- direct score lookup by KovaaK webapp username is available through `/user/scenario/total-play`, but it does not accept SteamID64

## Advanced Commands

The lower-level leaderboard commands remain useful for ad hoc scenario analysis without benchmark configs.

Collect arbitrary scenarios:

```bash
node dist/cli.js leaderboard collect \
  --scenarios "Smoothsphere Viscose Easier,WhisphereRawControl Larger + Slowed"
```

Compare collected leaderboards:

```bash
node dist/cli.js leaderboard compare \
  --source 185342 \
  --targets 128696 \
  --paired-only \
  --percentiles 50,60,75,88,95 \
  --outlier-trim-percent 5 \
  --csv comparison.csv
```

Map manual cutoff values:

```bash
node dist/cli.js leaderboard cutoffs \
  --source 185342 \
  --targets 128696 \
  --source-cutoffs 9000,10000,11000 \
  --outlier-trim-percent 5 \
  --csv cutoffs.csv
```

The `calibration ...` command group is kept for lower-level config operations, but the preferred workflow is now `benchmarks`, `match`, `collect`, and `report`.

## SQLite

The default database is `data/kovaaks-compare.sqlite`. Schema is created automatically by `AppDatabase` and mirrored in `migrations/001_init.sql`.

Main tables:

- `scenarios`
- `leaderboard_scores`
- `leaderboard_collections`
- `leaderboard_collection_pages`
- `scenario_comparisons`

## Current Limitations

- KovaaK's API is unofficial and may change without warning.
- Population comparison currently uses best leaderboard scores only.
- Benchmark imports depend on the benchmark endpoints continuing to expose scenario `rank_maxes`.
- Match creation is intentionally simple and still needs human review.
- There is no web UI yet.

## Next TODO

- Validate reports on complete Viscose S1/S2 leaderboard pulls.
- Add tests for statistics and report generation helpers.
- Add richer CSV exports for percentile rows, cutoff rows, and outlier rows.
- Add saved report snapshots for repeatability.
- Add optional knobs for paired-window size and interpolation grid.
- Consider a minimal web UI after the CLI workflow stabilizes.
