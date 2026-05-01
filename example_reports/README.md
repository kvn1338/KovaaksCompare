# Example Reports

This directory contains example calibration reports generated from the
`viscose-easier-s1-to-s2` match:

- `viscose-easier-s1-to-s2.md`
- `viscose-easier-s1-to-s2.csv`
- `viscose-easier-s1-to-s2-pairs.md`
- `viscose-easier-s1-to-s2-pairs.csv`

The reports compare scenario score distributions from **Viscose Easier** to
**Viscose Benchmark S2 Easier**. Each source scenario is paired with a target
scenario from the match config, and the report estimates what the existing
source cutoffs might look like in the target scenario.

## How These Reports Were Generated

The normal workflow is:

```bash
node dist/cli.js collect --match viscose-easier-s1-to-s2

node dist/cli.js report \
  --match viscose-easier-s1-to-s2 \
  --markdown example_reports/viscose-easier-s1-to-s2.md \
  --csv example_reports/viscose-easier-s1-to-s2.csv

node dist/cli.js report \
  --match viscose-easier-s1-to-s2 \
  --paired-only \
  --markdown example_reports/viscose-easier-s1-to-s2-pairs.md \
  --csv example_reports/viscose-easier-s1-to-s2-pairs.csv
```

The exact numbers depend on the locally collected SQLite data at generation
time. KovaaK leaderboard totals can change, so regenerated reports may not be
byte-for-byte identical.

## Markdown vs CSV

The Markdown files are meant for human review. They include one section per
scenario pair, explanatory model summaries, cutoff tables, and warnings.

The CSV files contain the cutoff table data in a spreadsheet-friendly format.
Use the CSV when you want to filter, sort, make charts, compare model outputs,
or import the projected cutoffs into another tool.

## Standard Report vs Paired Report

`viscose-easier-s1-to-s2.md` is the standard report. Its **Percentile Mapping**
section compares the full collected source leaderboard to the full collected
target leaderboard. For example, the 75th percentile source score is matched to
the 75th percentile target score.

`viscose-easier-s1-to-s2-pairs.md` was generated with `--paired-only`. In that
mode, the **Percentile Mapping** section is restricted to players who appear in
both the source and target leaderboards. This is often more useful for benchmark
calibration because it compares the same players across scenarios, but it can
also skew high if only strong or highly involved players have played the newer
target scenarios.

The **Configured Cutoffs** table is included in both reports and contains
multiple projection methods side by side. Do not treat any single column as the
answer without checking the warnings and overlap.

## Scenario Pair Sections

Each scenario pair starts with metadata like:

```text
## WhisphereRawControl Larger + Slowed -> Smoothsphere Viscose Easier

Source leaderboard: 128696
Target leaderboard: 185342
Overlapping players: 1764 (2.7%)
Correlation: 0.8332
```

The heading shows the source and target scenario names from the match config.
The leaderboard IDs are KovaaK leaderboard IDs used for the collected score
data.

`Overlapping players` counts players with matching stable identity in both
leaderboards. The percentage is relative to the collected source leaderboard.
A low overlap percentage is common when one scenario is much newer than the
other.

## Model Summary Metrics

Each scenario pair includes several metrics:

- `Correlation`: Pearson correlation between paired source and target scores.
  Higher values mean players who score well in the source also tend to score
  well in the target.
- `Log correlation`: Pearson correlation after applying `log(score)`. This can
  be useful when score relationships are more multiplicative than additive.
- `Linear regression`: A simple model of `target ~= slope * source + intercept`
  fitted on overlapping players.
- `Trimmed regression`: The same linear model after removing the largest
  residual outliers. This is less sensitive to unusual players or bad matches.
- `Log-log regression`: A model fitted on `log(source)` and `log(target)`, then
  projected back to score space.

High correlation does not prove the target scenario is a perfect replacement.
It only says the paired players preserve a similar ordering between the two
scenarios.

## Percentile Mapping

The **Percentile Mapping** table answers:

> At a given source percentile, what target score is at the same percentile?

Example columns:

- `Source score`: The source score at that percentile.
- `Source percentile`: The percentile row requested in the report command.
- `Equivalent target score`: The target score at the same percentile.
- `Confidence`: A rough sample-size confidence indicator.

In the standard report, this uses all collected source and target scores. In the
paired report, this table uses only overlapping players.

This table is useful for quickly seeing how the general score scales compare,
but it is not enough by itself for final benchmark cutoffs. Population skew can
matter a lot, especially for new S2 scenarios that may have been played mostly
by testers or highly involved players.

## Configured Cutoffs

The **Configured Cutoffs** table is the main calibration table. It starts from
the imported source benchmark cutoff scores and projects each cutoff into the
target scenario using several methods.

Columns:

- `Source cutoff`: Existing cutoff score from the source benchmark config.
- `Source percentile`: Where that source cutoff sits in the collected source
  leaderboard.
- `Global target`: Target score at the same percentile in the full collected
  target leaderboard.
- `Paired target`: Target score among nearby paired players around that source
  cutoff.
- `Monotonic target`: A paired-player interpolation that is constrained to move
  consistently with source score.
- `Linear target`: Projection from the simple linear regression.
- `Trimmed target`: Projection from the trimmed regression.
- `Log target`: Projection from the log-log regression.
- `Confidence`: Rough confidence for the paired-window estimate. This is based
  on local paired sample size and total overlap.

For benchmark calibration, compare the columns instead of blindly picking one.
If `Global target` is much higher than `Paired target`, the target leaderboard
may be inflated by a stronger-than-average population. If regression columns are
far away from percentile columns, the relationship may not be linear or the
scenario pair may not be a clean match.

## Warnings

Warnings are important and should be read before using a row.

Common warnings:

- `Percentile mapping is restricted to overlapping players only.` This appears
  in paired reports and reminds you that the percentile table is not using the
  full leaderboard population.
- `Trimmed regression excludes the largest 5% residual outliers...` This is
  informational when trimmed regression is enabled.
- `Global percentile cutoff estimates differ from paired-window estimates...`
  This is a calibration risk signal. It means full-leaderboard percentile
  mapping and paired-player mapping disagree enough to warrant manual review.
- Partial collection warnings mean the local database does not contain the full
  leaderboard and percentile estimates may be biased.

Rows with warnings are not automatically invalid. They are places where a
human should inspect the scenario pair, overlap, and projected cutoffs more
carefully.

## CSV Columns

The CSV files contain one row per source cutoff per scenario pair.

Important columns:

- `mapping_id`: Match config that produced the row.
- `source_benchmark`, `target_benchmark`: Compared benchmarks.
- `source_scenario`, `target_scenario`: Scenario names.
- `source_leaderboard_id`, `target_leaderboard_id`: KovaaK leaderboard IDs.
- `overlapping_players`: Number of paired players used for paired models.
- `correlation`: Pearson correlation for paired players.
- `source_cutoff`: Existing source cutoff being projected.
- `source_percentile`: Percentile of the source cutoff in the source
  leaderboard.
- `global_percentile_target_score`: Same as Markdown `Global target`.
- `paired_window_target_score`: Same as Markdown `Paired target`.
- `paired_monotonic_target_score`: Same as Markdown `Monotonic target`.
- `linear_regression_target_score`: Same as Markdown `Linear target`.
- `trimmed_regression_target_score`: Same as Markdown `Trimmed target`.
- `log_regression_target_score`: Same as Markdown `Log target`.
- `confidence`: Rough confidence for the paired-window estimate.

Suggested spreadsheet workflow:

1. Filter to one source/target scenario pair.
2. Compare `global_percentile_target_score` against
   `paired_window_target_score`.
3. Check whether regression estimates agree with the percentile estimates.
4. Flag rows where the methods diverge heavily or confidence is low.
5. Use the Markdown warnings to understand why a pair may need manual review.

## How To Interpret The Data

Use these reports as calibration evidence, not as automatic final cutoff output.
The safest rows are usually the ones where:

- overlap is reasonably large,
- correlation is high,
- `Global target`, `Paired target`, and `Monotonic target` are close,
- regression estimates are not extreme outliers,
- confidence is medium or high,
- warnings are informational rather than data-quality problems.

Be especially careful with:

- very low overlap percentages,
- new target scenarios with small or unusually strong populations,
- source cutoffs outside the collected score range,
- scenario pairs that are only loosely related,
- duplicated or many-to-one scenario mappings,
- large disagreements between global and paired estimates.

For Viscose S2 calibration specifically, the paired report is usually the more
relevant starting point because it compares the same players across S1 and S2.
The standard report is still valuable because it shows how the full leaderboard
populations compare and can reveal population skew.
