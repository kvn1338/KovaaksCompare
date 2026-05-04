# Viscose Easier Calibration

Mapping: Viscose Easier -> Viscose Benchmark S2 Easier

Source benchmark: Viscose Easier
Target benchmark: Viscose Benchmark S2 Easier

## WhisphereRawControl Larger + Slowed -> Smoothsphere Viscose Easier

- Source leaderboard: 128696
- Target leaderboard: 185342
- Overlapping players: 1764 (2.7%)
- Correlation: 0.8332
- Log correlation: 0.8187
- Linear regression: target ~= 0.7649 * source + 3786.44 (R^2 0.6942)
- Trimmed regression: target ~= 0.7783 * source + 3669.73 (R^2 0.7689, n=1676)
- Log-log regression: log(target) ~= 0.6409 * log(source) + 3.4484 (R^2 0.6703, n=1764)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 7002 | 25% | 11277 | low |
| 9369 | 50% | 12738 | low |
| 10200 | 60% | 13263 | low |
| 11454 | 75% | 14103 | low |
| 12648 | 88% | 15036 | low |
| 13239 | 95% | 15846 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 5500 | 12.7% | 10026 | 8883 | 9876 | 7993 | 7951 | 7849 | high |
| 6700 | 22.2% | 11097 | 9540 | 9876 | 8911 | 8885 | 8907 | high |
| 7800 | 32.7% | 11760 | 9879 | 10187 | 9753 | 9741 | 9818 | high |
| 8700 | 42.1% | 12327 | 10887 | 10908 | 10441 | 10441 | 10530 | high |
| 9600 | 52.6% | 12876 | 11139 | 11208 | 11129 | 11142 | 11216 | high |
| 10500 | 63.2% | 13455 | 11763 | 11740 | 11818 | 11842 | 11879 | high |
| 11400 | 74.4% | 14064 | 12336 | 12376 | 12506 | 12543 | 12522 | high |
| 12500 | 84.5% | 14775 | 13617 | 13590 | 13347 | 13399 | 13283 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 3 cutoff row(s); largest difference is 19% above paired-window at source cutoff 7800. This may indicate target leaderboard population skew or sparse paired data.

## Whisphere 80% -> VT Controlsphere Viscose Easier

- Source leaderboard: 55382
- Target leaderboard: 184157
- Overlapping players: 1605 (2.5%)
- Correlation: 0.8801
- Log correlation: 0.8785
- Linear regression: target ~= 0.2390 * source + 356.35 (R^2 0.7745)
- Trimmed regression: target ~= 0.2409 * source + 334.36 (R^2 0.8295, n=1525)
- Log-log regression: log(target) ~= 0.9024 * log(source) + -0.4023 (R^2 0.7718, n=1605)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 8920 | 25% | 3186 | low |
| 11451 | 50% | 3800 | low |
| 12370 | 60% | 3997 | low |
| 13900 | 75% | 4314 | low |
| 15180 | 88% | 4687 | low |
| 16480 | 95% | 4988 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 6300 | 7.3% | 2376 | 2256 | 2559 | 1862 | 1852 | 1795 | high |
| 7700 | 15.5% | 2846 | 2363 | 2559 | 2196 | 2190 | 2151 | high |
| 9000 | 25.8% | 3206 | 2490 | 2559 | 2507 | 2503 | 2476 | high |
| 10000 | 35.0% | 3449 | 2732 | 2759 | 2746 | 2744 | 2723 | high |
| 11000 | 44.9% | 3690 | 2949 | 2965 | 2985 | 2985 | 2968 | high |
| 12000 | 55.6% | 3902 | 3276 | 3161 | 3224 | 3226 | 3210 | high |
| 13000 | 66.5% | 4130 | 3427 | 3423 | 3463 | 3467 | 3451 | high |
| 14500 | 79.2% | 4423 | 3793 | 3784 | 3822 | 3828 | 3808 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 7 cutoff row(s); largest difference is 29% above paired-window at source cutoff 9000. This may indicate target leaderboard population skew or sparse paired data.

## SmoothBot Invincible Goated 75% -> SmoothBot Perfected Easier

- Source leaderboard: 75962
- Target leaderboard: 184652
- Overlapping players: 1560 (2.7%)
- Correlation: 0.8589
- Log correlation: 0.8422
- Linear regression: target ~= 1.0827 * source + 806.78 (R^2 0.7378)
- Trimmed regression: target ~= 1.1162 * source + 694.93 (R^2 0.8068, n=1482)
- Log-log regression: log(target) ~= 0.7776 * log(source) + 2.0873 (R^2 0.7094, n=1560)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 2352 | 25% | 4093 | low |
| 2940 | 50% | 4719 | low |
| 3156 | 60% | 4936 | low |
| 3486 | 75% | 5225 | low |
| 3882 | 88% | 5556 | low |
| 4092 | 95% | 5833 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 1800 | 8.4% | 3354 | 3250 | 3602 | 2756 | 2704 | 2740 | high |
| 2250 | 21.2% | 3958 | 3380 | 3602 | 3243 | 3206 | 3259 | high |
| 2650 | 36.9% | 4405 | 3774 | 3795 | 3676 | 3653 | 3701 | high |
| 2900 | 48.0% | 4679 | 3900 | 3977 | 3947 | 3932 | 3970 | high |
| 3150 | 59.7% | 4930 | 4216 | 4127 | 4217 | 4211 | 4233 | high |
| 3400 | 70.5% | 5129 | 4520 | 4505 | 4488 | 4490 | 4492 | high |
| 3650 | 81.2% | 5373 | 4751 | 4711 | 4759 | 4769 | 4747 | high |
| 4000 | 90.1% | 5631 | 5276 | 5284 | 5138 | 5160 | 5097 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 4 cutoff row(s); largest difference is 20% above paired-window at source cutoff 2900. This may indicate target leaderboard population skew or sparse paired data.

## Leaptrack Goated 60% Larger -> Leapstrafes Control wobin Easier

- Source leaderboard: 128691
- Target leaderboard: 185344
- Overlapping players: 1375 (2.4%)
- Correlation: 0.8203
- Log correlation: 0.8190
- Linear regression: target ~= 1.6176 * source + -811.45 (R^2 0.6729)
- Trimmed regression: target ~= 1.6528 * source + -899.40 (R^2 0.7470, n=1307)
- Log-log regression: log(target) ~= 1.2251 * log(source) + -1.5137 (R^2 0.6707, n=1375)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 1942 | 25% | 2739 | low |
| 2250 | 50% | 3213 | low |
| 2355 | 60% | 3410 | low |
| 2496 | 75% | 3663 | low |
| 2616 | 88% | 4053 | low |
| 2756 | 95% | 4327 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 850 | 0.4% | 1251 | 2075 | 2325 | 564 | 505 | 854 | high |
| 1200 | 2.0% | 1652 | 2075 | 2325 | 1130 | 1084 | 1302 | high |
| 1500 | 6.5% | 2085 | 2075 | 2325 | 1615 | 1580 | 1712 | high |
| 1700 | 12.7% | 2364 | 2183 | 2325 | 1939 | 1910 | 1996 | high |
| 1900 | 22.4% | 2685 | 2325 | 2340 | 2262 | 2241 | 2287 | high |
| 2100 | 36.3% | 2942 | 2671 | 2671 | 2586 | 2572 | 2585 | high |
| 2250 | 50.0% | 3213 | 2782 | 2774 | 2828 | 2819 | 2813 | high |
| 2450 | 68.0% | 3539 | 3139 | 3070 | 3152 | 3150 | 3122 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 4 cutoff row(s); largest difference is 40% below paired-window at source cutoff 850. This may indicate target leaderboard population skew or sparse paired data.

## Controlsphere rAim Easy 90% -> Controlsphere SuperbAim Viscose Easier

- Source leaderboard: 83485
- Target leaderboard: 185345
- Overlapping players: 1306 (2.3%)
- Correlation: 0.8870
- Log correlation: 0.8876
- Linear regression: target ~= 1.0054 * source + -197.34 (R^2 0.7868)
- Trimmed regression: target ~= 1.0248 * source + -421.38 (R^2 0.8437, n=1241)
- Log-log regression: log(target) ~= 1.0025 * log(source) + -0.0408 (R^2 0.7879, n=1306)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 7338 | 25% | 9258 | low |
| 9282 | 50% | 11100 | low |
| 9942 | 60% | 11664 | low |
| 10959 | 75% | 12546 | low |
| 11841 | 88% | 13668 | low |
| 12525 | 95% | 14493 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 6100 | 13.1% | 7881 | 6699 | 7725 | 5936 | 5830 | 5984 | high |
| 6950 | 20.8% | 8889 | 7082 | 7725 | 6790 | 6701 | 6820 | high |
| 7700 | 28.9% | 9558 | 7725 | 7865 | 7544 | 7469 | 7558 | high |
| 8400 | 37.5% | 10257 | 8364 | 8310 | 8248 | 8187 | 8246 | high |
| 9100 | 47.1% | 10938 | 8606 | 8876 | 8952 | 8904 | 8935 | high |
| 9800 | 57.4% | 11505 | 9621 | 9577 | 9655 | 9621 | 9624 | high |
| 10500 | 68.5% | 12132 | 10092 | 10135 | 10359 | 10339 | 10314 | high |
| 11500 | 80.3% | 12918 | 11522 | 11460 | 11365 | 11364 | 11298 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 7 cutoff row(s); largest difference is 27% above paired-window at source cutoff 9100. This may indicate target leaderboard population skew or sparse paired data.

## VT Controlsphere Intermediate S5 80% -> Whisphere Viscose Easier

- Source leaderboard: 107281
- Target leaderboard: 185346
- Overlapping players: 1214 (2.2%)
- Correlation: 0.8523
- Log correlation: 0.8444
- Linear regression: target ~= 4.8643 * source + -1682.38 (R^2 0.7263)
- Trimmed regression: target ~= 5.0221 * source + -2265.90 (R^2 0.7940, n=1154)
- Log-log regression: log(target) ~= 1.0191 * log(source) + 1.3220 (R^2 0.7131, n=1214)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 2641 | 25% | 14270 | low |
| 3314 | 50% | 17350 | low |
| 3553 | 60% | 18500 | low |
| 3897 | 75% | 20090 | low |
| 4193 | 88% | 21890 | low |
| 4399 | 95% | 23430 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 1850 | 6.4% | 10420 | 10550 | 11660 | 7316 | 7025 | 8013 | high |
| 2300 | 15.4% | 12700 | 10940 | 11660 | 9505 | 9285 | 10004 | high |
| 2700 | 26.8% | 14500 | 11660 | 12100 | 11451 | 11294 | 11780 | high |
| 3000 | 37.1% | 15710 | 13220 | 13357 | 12910 | 12800 | 13115 | high |
| 3300 | 49.3% | 17280 | 13760 | 13859 | 14370 | 14307 | 14453 | high |
| 3600 | 61.8% | 18672 | 14940 | 14940 | 15829 | 15814 | 15793 | high |
| 3850 | 72.9% | 19780 | 16590 | 16150 | 17045 | 17069 | 16912 | high |
| 4100 | 81.5% | 20900 | 18910 | 18610 | 18261 | 18325 | 18031 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 6 cutoff row(s); largest difference is 26% above paired-window at source cutoff 3300. This may indicate target leaderboard population skew or sparse paired data.

## Air Angelic 4 Voltaic Easy 80% (Good Version) -> Air Angelic 4 Voltaic Easy 70%

- Source leaderboard: 13681
- Target leaderboard: 14155
- Overlapping players: 2307 (3.1%)
- Correlation: 0.8769
- Log correlation: 0.8671
- Linear regression: target ~= 0.9724 * source + 1429.39 (R^2 0.7689)
- Trimmed regression: target ~= 0.9753 * source + 1449.89 (R^2 0.8628, n=2192)
- Log-log regression: log(target) ~= 0.6640 * log(source) + 3.0644 (R^2 0.7518, n=2307)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 2772 | 25% | 4300 | low |
| 3165 | 50% | 4788 | low |
| 3307 | 60% | 4927 | low |
| 3528 | 75% | 5154 | low |
| 3715 | 88% | 5369 | low |
| 3886 | 95% | 5510 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 1050 | 0.3% | 2095 | 3379 | 3726 | 2450 | 2474 | 2172 | high |
| 1600 | 1.0% | 2671 | 3396 | 3726 | 2985 | 3010 | 2873 | high |
| 2000 | 3.4% | 3282 | 3498 | 3726 | 3374 | 3400 | 3332 | high |
| 2400 | 10.2% | 3809 | 3814 | 3819 | 3763 | 3791 | 3761 | high |
| 2700 | 21.3% | 4205 | 4123 | 4150 | 4055 | 4083 | 4067 | high |
| 3000 | 37.9% | 4564 | 4362 | 4357 | 4347 | 4376 | 4362 | high |
| 3300 | 59.6% | 4920 | 4713 | 4688 | 4638 | 4668 | 4647 | high |
| 3600 | 78.6% | 5218 | 5014 | 5014 | 4930 | 4961 | 4923 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 2 cutoff row(s); largest difference is 38% below paired-window at source cutoff 1050. This may indicate target leaderboard population skew or sparse paired data.

## cloverRawControl Easy 80% Speed -> cloverRawControl Viscose Easier 50cm

- Source leaderboard: 98867
- Target leaderboard: 185349
- Overlapping players: 1109 (2.0%)
- Correlation: 0.8480
- Log correlation: 0.8459
- Linear regression: target ~= 1.2110 * source + 1571.84 (R^2 0.7192)
- Trimmed regression: target ~= 1.2289 * source + 1430.63 (R^2 0.7966, n=1054)
- Log-log regression: log(target) ~= 0.8539 * log(source) + 1.6501 (R^2 0.7155, n=1109)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 4785 | 25% | 9096 | low |
| 6261 | 50% | 10887 | low |
| 6777 | 60% | 11589 | low |
| 7560 | 75% | 12474 | low |
| 8160 | 88% | 13515 | low |
| 8829 | 95% | 14319 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 3900 | 13.1% | 7716 | 6732 | 7326 | 6295 | 6223 | 6070 | high |
| 4550 | 21.7% | 8685 | 7053 | 7326 | 7082 | 7022 | 6924 | high |
| 5200 | 31.2% | 9717 | 7478 | 7657 | 7869 | 7821 | 7760 | high |
| 5700 | 39.6% | 10311 | 8381 | 8223 | 8475 | 8435 | 8393 | high |
| 6200 | 48.7% | 10800 | 8696 | 8766 | 9080 | 9050 | 9017 | high |
| 6700 | 58.2% | 11415 | 9300 | 9418 | 9686 | 9664 | 9635 | high |
| 7200 | 68.6% | 12087 | 10385 | 10194 | 10291 | 10279 | 10246 | high |
| 7700 | 76.9% | 12597 | 11171 | 10955 | 10897 | 10893 | 10850 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 6 cutoff row(s); largest difference is 30% above paired-window at source cutoff 5200. This may indicate target leaderboard population skew or sparse paired data.

## Controlsphere Far, Far Larger 90% -> Flower Easier 50cm

- Source leaderboard: 128692
- Target leaderboard: 185354
- Overlapping players: 1044 (2.0%)
- Correlation: 0.7698
- Log correlation: 0.7628
- Linear regression: target ~= 0.3830 * source + -1247.61 (R^2 0.5925)
- Trimmed regression: target ~= 0.3997 * source + -1424.39 (R^2 0.6747, n=992)
- Log-log regression: log(target) ~= 1.3102 * log(source) + -4.2230 (R^2 0.5819, n=1044)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 7794 | 25% | 2288 | low |
| 9540 | 50% | 2919 | low |
| 10125 | 60% | 3137 | low |
| 10953 | 75% | 3508 | low |
| 11694 | 88% | 3961 | low |
| 12096 | 95% | 4333 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 7600 | 22.6% | 2249 | 1774 | 1774 | 1663 | 1613 | 1781 | high |
| 8150 | 29.5% | 2407 | 1775 | 1922 | 1874 | 1833 | 1951 | high |
| 8700 | 37.0% | 2593 | 2219 | 2131 | 2084 | 2053 | 2126 | high |
| 9200 | 44.3% | 2765 | 2097 | 2194 | 2276 | 2253 | 2287 | high |
| 9800 | 54.0% | 3011 | 2234 | 2236 | 2506 | 2492 | 2484 | high |
| 10200 | 61.2% | 3158 | 2426 | 2406 | 2659 | 2652 | 2618 | high |
| 10900 | 74.1% | 3492 | 2683 | 2761 | 2927 | 2932 | 2856 | high |
| 11500 | 82.0% | 3732 | 3259 | 3204 | 3157 | 3172 | 3064 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 7 cutoff row(s); largest difference is 36% above paired-window at source cutoff 8150. This may indicate target leaderboard population skew or sparse paired data.

## PGTI Voltaic Easy 80% -> PGTI Voltaic Easy Smoother

- Source leaderboard: 2107
- Target leaderboard: 184878
- Overlapping players: 967 (2.0%)
- Correlation: 0.8979
- Log correlation: 0.8992
- Linear regression: target ~= 1.1361 * source + 62.22 (R^2 0.8061)
- Trimmed regression: target ~= 1.1430 * source + 50.51 (R^2 0.8601, n=919)
- Log-log regression: log(target) ~= 0.9454 * log(source) + 0.5607 (R^2 0.8085, n=967)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 993 | 25% | 1715 | low |
| 1385 | 50% | 2230 | low |
| 1555 | 60% | 2420 | low |
| 1816 | 75% | 2765 | low |
| 2235 | 88% | 3116 | low |
| 2403 | 95% | 3459 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 350 | 1.1% | 566 | 1039 | 1177 | 460 | 451 | 445 | high |
| 550 | 5.0% | 977 | 1039 | 1177 | 687 | 679 | 683 | high |
| 850 | 16.9% | 1498 | 1099 | 1177 | 1028 | 1022 | 1030 | high |
| 1100 | 31.4% | 1847 | 1322 | 1318 | 1312 | 1308 | 1314 | high |
| 1350 | 47.6% | 2183 | 1595 | 1556 | 1596 | 1594 | 1595 | high |
| 1600 | 62.3% | 2468 | 1835 | 1827 | 1880 | 1879 | 1873 | high |
| 1900 | 78.1% | 2836 | 2201 | 2174 | 2221 | 2222 | 2203 | high |
| 2250 | 88.3% | 3125 | 2542 | 2539 | 2618 | 2622 | 2585 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 7 cutoff row(s); largest difference is 46% below paired-window at source cutoff 350. This may indicate target leaderboard population skew or sparse paired data.

## Air CELESTIAL No UFO Easy Slowed -> Air CELESTIAL No UFO Easier

- Source leaderboard: 131872
- Target leaderboard: 185640
- Overlapping players: 906 (2.0%)
- Correlation: 0.8657
- Log correlation: 0.8615
- Linear regression: target ~= 1.2012 * source + -184.19 (R^2 0.7495)
- Trimmed regression: target ~= 1.1726 * source + -157.78 (R^2 0.8411, n=861)
- Log-log regression: log(target) ~= 1.2135 * log(source) + -1.4561 (R^2 0.7421, n=906)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 863.06 | 25% | 874 | low |
| 880.75 | 50% | 891 | low |
| 885.89 | 60% | 895 | low |
| 892.27 | 75% | 902 | low |
| 897.72 | 88% | 908 | low |
| 903.50 | 95% | 913 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 820 | 5.1% | 837 | 838 | 854 | 801 | 804 | 801 | high |
| 835 | 8.6% | 850 | 841 | 854 | 819 | 821 | 819 | high |
| 850 | 15.2% | 862 | 844 | 854 | 837 | 839 | 837 | high |
| 861 | 22.9% | 871 | 853 | 854 | 850 | 852 | 850 | high |
| 870 | 32.8% | 880 | 858 | 858 | 861 | 862 | 861 | high |
| 878 | 44.7% | 888 | 873 | 872 | 870 | 872 | 870 | high |
| 884 | 56.1% | 894 | 876 | 878 | 878 | 879 | 878 | high |
| 890 | 67.8% | 898 | 883 | 888 | 885 | 886 | 885 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## Whisphere Small & Slow 55% -> RawControlSphere Easier

- Source leaderboard: 128693
- Target leaderboard: 185356
- Overlapping players: 935 (1.9%)
- Correlation: 0.8491
- Log correlation: 0.8539
- Linear regression: target ~= 1.3175 * source + -5482.62 (R^2 0.7209)
- Trimmed regression: target ~= 1.3507 * source + -5879.59 (R^2 0.7888, n=889)
- Log-log regression: log(target) ~= 1.5034 * log(source) + -4.8909 (R^2 0.7292, n=935)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 10340 | 25% | 10083 | low |
| 11870 | 50% | 11958 | low |
| 12390 | 60% | 12663 | low |
| 13250 | 75% | 13512 | low |
| 13830 | 88% | 14481 | low |
| 14280 | 95% | 15402 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 6000 | 1.2% | 4857 | 7290 | 8163 | 2423 | 2225 | 3597 | high |
| 7500 | 4.2% | 6585 | 7290 | 8163 | 4399 | 4251 | 5031 | high |
| 9000 | 11.6% | 8355 | 7413 | 8163 | 6375 | 6277 | 6618 | high |
| 10000 | 20.9% | 9558 | 7902 | 8163 | 7693 | 7628 | 7754 | high |
| 10750 | 30.5% | 10533 | 8631 | 8607 | 8681 | 8641 | 8644 | high |
| 11500 | 42.5% | 11499 | 9591 | 9615 | 9669 | 9654 | 9567 | high |
| 12250 | 57.3% | 12471 | 10743 | 10576 | 10657 | 10667 | 10520 | high |
| 13500 | 78.5% | 13731 | 12618 | 12507 | 12304 | 12355 | 12175 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 5 cutoff row(s); largest difference is 33% below paired-window at source cutoff 6000. This may indicate target leaderboard population skew or sparse paired data.

## Air Voltaic Invincible 7 Easy 80% -> Ground Plaza Sparky v3 Easy

- Source leaderboard: 128694
- Target leaderboard: 134502
- Overlapping players: 1196 (2.5%)
- Correlation: 0.8160
- Log correlation: n/a
- Linear regression: target ~= 0.0403 * source + 761.02 (R^2 0.6659)
- Trimmed regression: target ~= 0.0385 * source + 767.35 (R^2 0.7597, n=1137)
- Log-log regression: log(target) ~= 0.1364 * log(source) + 5.6910 (R^2 0.7155, n=1195)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 2274 | 25% | 870 | low |
| 2611 | 50% | 887 | low |
| 2734 | 60% | 891 | low |
| 2940 | 75% | 899 | low |
| 3212 | 88% | 904 | low |
| 3309 | 95% | 908 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 750 | 0.1% | 719 | 835 | 853 | 791 | 796 | 731 | high |
| 1200 | 0.5% | 759 | 835 | 853 | 809 | 814 | 779 | high |
| 1600 | 2.7% | 810 | 835 | 853 | 826 | 829 | 810 | high |
| 1900 | 8.1% | 842 | 842 | 853 | 838 | 841 | 830 | high |
| 2200 | 20.4% | 865 | 852 | 853 | 850 | 852 | 846 | high |
| 2500 | 40.3% | 881 | 862 | 861 | 862 | 864 | 861 | high |
| 2800 | 64.9% | 894 | 878 | 877 | 874 | 875 | 875 | high |
| 3200 | 86.5% | 903 | 892 | 892 | 890 | 891 | 891 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## Controlsphere OW Long Strafes 90% -> Air Spectral Easy 85%

- Source leaderboard: 128697
- Target leaderboard: 185693
- Overlapping players: 779 (1.7%)
- Correlation: 0.7192
- Log correlation: 0.7209
- Linear regression: target ~= 0.0055 * source + 879.90 (R^2 0.5173)
- Trimmed regression: target ~= 0.0047 * source + 887.36 (R^2 0.6020, n=741)
- Log-log regression: log(target) ~= 0.0460 * log(source) + 6.4153 (R^2 0.5197, n=779)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 6177 | 25% | 922 | low |
| 7647 | 50% | 929 | low |
| 8079 | 60% | 931 | low |
| 8709 | 75% | 934 | low |
| 9144 | 88% | 936 | low |
| 9642 | 95% | 939 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 5400 | 15.6% | 917 | 915 | 917 | 909 | 913 | 908 | medium |
| 6100 | 23.9% | 922 | 917 | 917 | 913 | 916 | 913 | medium |
| 6700 | 32.5% | 925 | 919 | 917 | 916 | 919 | 917 | medium |
| 7200 | 40.8% | 927 | 919 | 919 | 919 | 921 | 920 | medium |
| 7600 | 48.8% | 929 | 921 | 921 | 921 | 923 | 922 | medium |
| 8000 | 57.7% | 931 | 923 | 924 | 924 | 925 | 924 | medium |
| 8300 | 65.8% | 932 | 924 | 927 | 925 | 926 | 926 | medium |
| 8700 | 74.7% | 934 | 929 | 930 | 927 | 928 | 928 | medium |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## Flicker Plaza rAim Easy Less Blinks -> VT Aether Novice S5 Bot 1

- Source leaderboard: 128774
- Target leaderboard: 108042
- Overlapping players: 2133 (4.9%)
- Correlation: 0.5751
- Log correlation: 0.5576
- Linear regression: target ~= 34.1294 * source + -28419.40 (R^2 0.3307)
- Trimmed regression: target ~= 38.2751 * source + -32208.79 (R^2 0.4118, n=2027)
- Log-log regression: log(target) ~= 12.1166 * log(source) + -74.7131 (R^2 0.3109, n=2133)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 898.73 | 25% | 2065 | low |
| 907.91 | 50% | 2415 | low |
| 910.40 | 60% | 2549 | low |
| 913.71 | 75% | 2827 | low |
| 917.50 | 88% | 3258 | low |
| 921.01 | 95% | 3715 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 858 | 1.3% | 1069 | 1854 | 2040 | 864 | 631 | 1248 | high |
| 871 | 3.1% | 1300 | 1862 | 2040 | 1307 | 1129 | 1498 | high |
| 883 | 7.3% | 1600 | 1932 | 2040 | 1717 | 1588 | 1768 | high |
| 890 | 12.3% | 1770 | 2031 | 2040 | 1956 | 1856 | 1945 | high |
| 895 | 18.4% | 1934 | 2141 | 2155 | 2126 | 2047 | 2082 | high |
| 900 | 27.6% | 2102 | 2192 | 2203 | 2297 | 2239 | 2227 | high |
| 904 | 37.8% | 2254 | 2234 | 2244 | 2434 | 2392 | 2350 | high |
| 909 | 53.3% | 2458 | 2451 | 2412 | 2604 | 2583 | 2513 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 3 cutoff row(s); largest difference is 42% below paired-window at source cutoff 858. This may indicate target leaderboard population skew or sparse paired data.

## Polarized Hell Easy 40% Slower -> Plink Palace Easy Less Blinks

- Source leaderboard: 128775
- Target leaderboard: 184534
- Overlapping players: 734 (1.6%)
- Correlation: 0.7739
- Log correlation: 0.7795
- Linear regression: target ~= 1.1494 * source + 123.12 (R^2 0.5990)
- Trimmed regression: target ~= 1.1676 * source + 81.98 (R^2 0.6799, n=698)
- Log-log regression: log(target) ~= 0.9282 * log(source) + 0.7362 (R^2 0.6077, n=734)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 1792 | 25% | 2532 | low |
| 2121 | 50% | 2925 | low |
| 2228 | 60% | 3052 | low |
| 2411 | 75% | 3244 | low |
| 2564 | 88% | 3429 | low |
| 2660 | 95% | 3641 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 750 | 0.2% | 1036 | 2066 | 2292 | 985 | 958 | 974 | medium |
| 1100 | 2.0% | 1560 | 2066 | 2292 | 1387 | 1366 | 1389 | medium |
| 1400 | 8.0% | 2097 | 2066 | 2292 | 1732 | 1717 | 1738 | medium |
| 1600 | 15.1% | 2310 | 2159 | 2292 | 1962 | 1950 | 1967 | medium |
| 1800 | 25.5% | 2540 | 2210 | 2302 | 2192 | 2184 | 2194 | medium |
| 2000 | 39.4% | 2775 | 2431 | 2408 | 2422 | 2417 | 2419 | medium |
| 2150 | 52.4% | 2956 | 2650 | 2628 | 2594 | 2592 | 2587 | medium |
| 2500 | 80.2% | 3304 | 3007 | 3007 | 2997 | 3001 | 2976 | medium |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 2 cutoff row(s); largest difference is 50% below paired-window at source cutoff 750. This may indicate target leaderboard population skew or sparse paired data.

## Air Pure Intermediate Slower No UFO -> Air Pure Easier No UFO

- Source leaderboard: 128776
- Target leaderboard: 185405
- Overlapping players: 746 (1.8%)
- Correlation: 0.8574
- Log correlation: 0.8574
- Linear regression: target ~= 0.7279 * source + 269.00 (R^2 0.7351)
- Trimmed regression: target ~= 0.7346 * source + 263.29 (R^2 0.8056, n=709)
- Log-log regression: log(target) ~= 0.7088 * log(source) + 2.0075 (R^2 0.7351, n=746)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 895.09 | 25% | 929 | low |
| 908.03 | 50% | 937 | low |
| 911.64 | 60% | 940 | low |
| 916.87 | 75% | 943 | low |
| 920.62 | 88% | 946 | low |
| 924.77 | 95% | 949 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 860 | 3.6% | 907 | 912 | 922 | 895 | 895 | 895 | medium |
| 874 | 7.7% | 916 | 913 | 922 | 905 | 905 | 905 | medium |
| 886 | 14.8% | 923 | 920 | 922 | 914 | 914 | 914 | medium |
| 893 | 22.0% | 928 | 922 | 922 | 919 | 919 | 919 | medium |
| 901 | 34.3% | 933 | 924 | 923 | 925 | 925 | 925 | medium |
| 907 | 47.0% | 936 | 928 | 928 | 929 | 930 | 929 | medium |
| 911 | 58.0% | 939 | 931 | 932 | 932 | 932 | 932 | medium |
| 916 | 71.1% | 942 | 937 | 937 | 936 | 936 | 936 | medium |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## Air Voltaic Easy Invincible 4 80% -> Air Voltaic Invincible 4 Easier

- Source leaderboard: 128781
- Target leaderboard: 185406
- Overlapping players: 730 (1.7%)
- Correlation: 0.8581
- Log correlation: 0.8557
- Linear regression: target ~= 1.2133 * source + -215.58 (R^2 0.7363)
- Trimmed regression: target ~= 1.2629 * source + -373.65 (R^2 0.8160, n=694)
- Log-log regression: log(target) ~= 1.0428 * log(source) + -0.2123 (R^2 0.7322, n=730)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 2698 | 25% | 3513 | low |
| 3081 | 50% | 4038 | low |
| 3212 | 60% | 4226 | low |
| 3430 | 75% | 4487 | low |
| 3760 | 88% | 4721 | low |
| 3863 | 95% | 4994 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 1100 | 0.1% | 1575 | 2666 | 3132 | 1119 | 1015 | 1200 | medium |
| 1600 | 0.7% | 2006 | 2666 | 3132 | 1726 | 1647 | 1774 | medium |
| 2100 | 4.5% | 2680 | 2666 | 3132 | 2332 | 2278 | 2356 | medium |
| 2450 | 13.3% | 3187 | 3055 | 3132 | 2757 | 2720 | 2767 | medium |
| 2800 | 30.7% | 3663 | 3200 | 3257 | 3182 | 3162 | 3180 | medium |
| 3150 | 54.4% | 4128 | 3653 | 3625 | 3606 | 3604 | 3596 | medium |
| 3400 | 72.8% | 4455 | 3935 | 3947 | 3910 | 3920 | 3894 | medium |
| 3800 | 89.0% | 4741 | 4464 | 4517 | 4395 | 4425 | 4373 | medium |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 2 cutoff row(s); largest difference is 41% below paired-window at source cutoff 1100. This may indicate target leaderboard population skew or sparse paired data.

## voxTargetSwitch 2 Large -> voxTargetSwitch 2 Large

- Source leaderboard: 84880
- Target leaderboard: 84880
- Overlapping players: 47704 (100.0%)
- Correlation: 1.0000
- Log correlation: 1.0000
- Linear regression: target ~= 1.0000 * source + 0.00 (R^2 1.0000)
- Trimmed regression: target ~= 1.0000 * source + 0.00 (R^2 1.0000, n=45319)
- Log-log regression: log(target) ~= 1.0000 * log(source) + 0.0000 (R^2 1.0000, n=47702)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 93 | 25% | 93 | high |
| 105 | 50% | 105 | high |
| 109.75 | 60% | 110 | high |
| 116 | 75% | 116 | high |
| 123.10 | 88% | 123 | high |
| 126.14 | 95% | 126 | high |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 67 | 1.6% | 67 | 71 | 76 | 67 | 67 | 67 | high |
| 78 | 6.9% | 78 | 79 | 78 | 78 | 78 | 78 | high |
| 87 | 16.1% | 87 | 87 | 87 | 87 | 87 | 87 | high |
| 95 | 28.5% | 95 | 95 | 95 | 95 | 95 | 95 | high |
| 103 | 45.4% | 103 | 103 | 103 | 103 | 103 | 103 | high |
| 110 | 62.0% | 110 | 110 | 110 | 110 | 110 | 110 | high |
| 117 | 77.7% | 117 | 117 | 117 | 117 | 117 | 117 | high |
| 123 | 87.8% | 123 | 123 | 124 | 123 | 123 | 123 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## Pokeball Frenzy Auto TE Wide -> ww5t Voltaic Slightly Larger

- Source leaderboard: 783
- Target leaderboard: 185378
- Overlapping players: 902 (1.2%)
- Correlation: 0.8294
- Log correlation: 0.8101
- Linear regression: target ~= 0.0330 * source + 22.39 (R^2 0.6878)
- Trimmed regression: target ~= 0.0332 * source + 21.42 (R^2 0.7686, n=857)
- Log-log regression: log(target) ~= 0.7602 * log(source) + -1.2907 (R^2 0.6563, n=902)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 2190 | 25% | 106 | low |
| 2610 | 50% | 118 | low |
| 2730 | 60% | 123 | low |
| 2940 | 75% | 131 | low |
| 3180 | 88% | 142 | low |
| 3450 | 95% | 153 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 650 | 0.1% | 52 | 92 | 93 | 44 | 43 | 38 | high |
| 950 | 0.1% | 54 | 92 | 93 | 54 | 53 | 50 | high |
| 1250 | 0.5% | 66 | 92 | 93 | 64 | 63 | 62 | high |
| 1500 | 2.3% | 80 | 92 | 93 | 72 | 71 | 71 | high |
| 1750 | 7.2% | 91 | 92 | 93 | 80 | 79 | 80 | high |
| 2000 | 15.6% | 100 | 92 | 93 | 88 | 88 | 89 | high |
| 2300 | 30.8% | 109 | 104 | 102 | 98 | 98 | 99 | high |
| 2700 | 58.3% | 123 | 113 | 112 | 111 | 111 | 112 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 3 cutoff row(s); largest difference is 43% below paired-window at source cutoff 650. This may indicate target leaderboard population skew or sparse paired data.

## 1w3ts reload Larger -> aimerz+ Static Switching 6 Bot Slightly Larger

- Source leaderboard: 128795
- Target leaderboard: 185407
- Overlapping players: 787 (1.7%)
- Correlation: 0.8463
- Log correlation: 0.8456
- Linear regression: target ~= 0.9601 * source + 26.26 (R^2 0.7163)
- Trimmed regression: target ~= 0.9583 * source + 26.32 (R^2 0.7878, n=748)
- Log-log regression: log(target) ~= 0.7923 * log(source) + 1.1566 (R^2 0.7151, n=787)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 83 | 25% | 113 | low |
| 93 | 50% | 124 | low |
| 97 | 60% | 128 | low |
| 103 | 75% | 134 | low |
| 108 | 88% | 143 | low |
| 115 | 95% | 152 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 36 | 0.1% | 52 | 97 | 101 | 61 | 61 | 54 | high |
| 50 | 0.4% | 70 | 97 | 101 | 74 | 74 | 71 | high |
| 54 | 0.6% | 72 | 97 | 101 | 78 | 78 | 75 | high |
| 58 | 1.2% | 81 | 97 | 101 | 82 | 82 | 79 | high |
| 70 | 6.7% | 97 | 98 | 101 | 93 | 93 | 92 | high |
| 82 | 24.4% | 113 | 109 | 106 | 105 | 105 | 104 | high |
| 92 | 49.0% | 123 | 115 | 115 | 115 | 114 | 114 | high |
| 102 | 73.3% | 133 | 124 | 125 | 124 | 124 | 124 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 4 cutoff row(s); largest difference is 46% below paired-window at source cutoff 36. This may indicate target leaderboard population skew or sparse paired data.

## beanTS Larger -> beanTS Larger

- Source leaderboard: 129353
- Target leaderboard: 129353
- Overlapping players: 47565 (100.0%)
- Correlation: 1.0000
- Log correlation: 1.0000
- Linear regression: target ~= 1.0000 * source + 0.00 (R^2 1.0000)
- Trimmed regression: target ~= 1.0000 * source + 0.00 (R^2 1.0000, n=45187)
- Log-log regression: log(target) ~= 1.0000 * log(source) + 0.0000 (R^2 1.0000, n=47563)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 102 | 25% | 102 | high |
| 116.30 | 50% | 116 | high |
| 121.39 | 60% | 121 | high |
| 129.95 | 75% | 130 | high |
| 141 | 88% | 141 | high |
| 144.50 | 95% | 145 | high |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 65 | 0.7% | 65 | 75 | 82 | 65 | 65 | 65 | high |
| 78 | 3.7% | 78 | 80 | 82 | 78 | 78 | 78 | high |
| 90 | 11.3% | 90 | 90 | 91 | 90 | 90 | 90 | high |
| 100 | 22.2% | 100 | 100 | 100 | 100 | 100 | 100 | high |
| 110 | 38.4% | 110 | 110 | 110 | 110 | 110 | 110 | high |
| 120 | 57.0% | 120 | 120 | 120 | 120 | 120 | 120 | high |
| 130 | 76.0% | 130 | 130 | 130 | 130 | 130 | 130 | high |
| 142 | 90.0% | 142 | 142 | 142 | 142 | 142 | 142 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## FloatTS Angelic Easy Larger -> 1w6ts reload v2 20% bigger

- Source leaderboard: 135509
- Target leaderboard: 21620
- Overlapping players: 768 (1.8%)
- Correlation: 0.7623
- Log correlation: n/a
- Linear regression: target ~= 1.1521 * source + -14.06 (R^2 0.5811)
- Trimmed regression: target ~= 1.1885 * source + -18.57 (R^2 0.7148, n=730)
- Log-log regression: log(target) ~= 1.0654 * log(source) + -0.2900 (R^2 0.5896, n=767)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 87.60 | 25% | 97 | low |
| 97.85 | 50% | 108 | low |
| 101.50 | 60% | 112 | low |
| 107 | 75% | 120 | low |
| 112.10 | 88% | 131 | low |
| 115.90 | 95% | 145 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 65 | 1.9% | 72 | 83 | 87 | 61 | 59 | 64 | medium |
| 74 | 6.9% | 83 | 84 | 87 | 71 | 69 | 73 | medium |
| 81 | 14.6% | 90 | 85 | 87 | 79 | 78 | 81 | medium |
| 88 | 26.5% | 97 | 88 | 88 | 87 | 86 | 88 | medium |
| 95 | 43.3% | 105 | 92 | 92 | 95 | 94 | 96 | medium |
| 101 | 59.1% | 112 | 102 | 102 | 102 | 101 | 102 | medium |
| 106 | 73.1% | 119 | 106 | 106 | 108 | 107 | 108 | medium |
| 111 | 83.8% | 127 | 112 | 113 | 114 | 113 | 113 | medium |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## FloatTS Angelic Easy Larger -> StaticSwitchingVox

- Source leaderboard: 135509
- Target leaderboard: 15659
- Overlapping players: 2226 (5.2%)
- Correlation: 0.8087
- Log correlation: 0.7799
- Linear regression: target ~= 1.0183 * source + 12.63 (R^2 0.6539)
- Trimmed regression: target ~= 1.0458 * source + 10.73 (R^2 0.7617, n=2115)
- Log-log regression: log(target) ~= 0.8373 * log(source) + 0.8815 (R^2 0.6083, n=2226)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 87.60 | 25% | 96 | medium |
| 97.85 | 50% | 107 | medium |
| 101.50 | 60% | 112 | medium |
| 107 | 75% | 120 | medium |
| 112.10 | 88% | 131 | medium |
| 115.90 | 95% | 141 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 65 | 1.9% | 72 | 91 | 97 | 79 | 79 | 80 | high |
| 74 | 6.9% | 82 | 95 | 97 | 88 | 88 | 89 | high |
| 81 | 14.6% | 90 | 98 | 99 | 95 | 95 | 96 | high |
| 88 | 26.5% | 97 | 101 | 102 | 102 | 103 | 103 | high |
| 95 | 43.3% | 104 | 110 | 108 | 109 | 110 | 109 | high |
| 101 | 59.1% | 111 | 116 | 116 | 115 | 116 | 115 | high |
| 106 | 73.1% | 119 | 120 | 120 | 121 | 122 | 120 | high |
| 111 | 83.8% | 127 | 127 | 127 | 126 | 127 | 125 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 1 cutoff row(s); largest difference is 21% below paired-window at source cutoff 65. This may indicate target leaderboard population skew or sparse paired data.

## waldoTS Novice -> waldoTS Novice

- Source leaderboard: 113019
- Target leaderboard: 113019
- Overlapping players: 48151 (100.0%)
- Correlation: 1.0000
- Log correlation: 1.0000
- Linear regression: target ~= 1.0000 * source + 0.00 (R^2 1.0000)
- Trimmed regression: target ~= 1.0000 * source + 0.00 (R^2 1.0000, n=45744)
- Log-log regression: log(target) ~= 1.0000 * log(source) + 0.0000 (R^2 1.0000, n=48151)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 111.14 | 25% | 111 | high |
| 124.80 | 50% | 125 | high |
| 129.89 | 60% | 130 | high |
| 139 | 75% | 139 | high |
| 145.14 | 88% | 145 | high |
| 151.89 | 95% | 152 | high |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 65 | 0.3% | 65 | 83 | 91 | 65 | 65 | 65 | high |
| 78 | 1.5% | 78 | 84 | 91 | 78 | 78 | 78 | high |
| 90 | 5.3% | 90 | 91 | 91 | 90 | 90 | 90 | high |
| 100 | 12.0% | 100 | 100 | 100 | 100 | 100 | 100 | high |
| 110 | 23.3% | 110 | 110 | 110 | 110 | 110 | 110 | high |
| 120 | 41.0% | 120 | 120 | 120 | 120 | 120 | 120 | high |
| 130 | 60.1% | 130 | 130 | 130 | 130 | 130 | 130 | high |
| 140 | 76.4% | 140 | 140 | 140 | 140 | 140 | 140 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 1 cutoff row(s); largest difference is 22% below paired-window at source cutoff 65. This may indicate target leaderboard population skew or sparse paired data.

## devTS Goated NR Static 5Bot -> eth Pasu Micro Easier

- Source leaderboard: 125002
- Target leaderboard: 185394
- Overlapping players: 634 (1.2%)
- Correlation: 0.7810
- Log correlation: 0.7702
- Linear regression: target ~= 1.9163 * source + -258.69 (R^2 0.6100)
- Trimmed regression: target ~= 1.9317 * source + -274.22 (R^2 0.6953, n=603)
- Log-log regression: log(target) ~= 1.1840 * log(source) + -0.7744 (R^2 0.5932, n=634)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 623 | 25% | 1010 | low |
| 689 | 50% | 1148 | low |
| 708 | 60% | 1198 | low |
| 745 | 75% | 1288 | low |
| 791 | 88% | 1398 | low |
| 832 | 95% | 1522 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 350 | 0.1% | 428 | 882 | 917 | 412 | 402 | 474 | medium |
| 400 | 0.3% | 532 | 882 | 917 | 508 | 498 | 555 | medium |
| 450 | 0.9% | 648 | 882 | 917 | 604 | 595 | 639 | medium |
| 500 | 3.1% | 768 | 882 | 917 | 699 | 692 | 723 | medium |
| 550 | 8.0% | 868 | 902 | 917 | 795 | 788 | 810 | medium |
| 600 | 18.6% | 974 | 917 | 917 | 891 | 885 | 898 | medium |
| 640 | 30.8% | 1048 | 998 | 996 | 968 | 962 | 969 | medium |
| 680 | 46.1% | 1134 | 1068 | 1060 | 1044 | 1039 | 1041 | medium |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 3 cutoff row(s); largest difference is 51% below paired-window at source cutoff 350. This may indicate target leaderboard population skew or sparse paired data.

## waldoTS Novice -> 1w2ts reload smallflicks larger

- Source leaderboard: 113019
- Target leaderboard: 185518
- Overlapping players: 746 (1.5%)
- Correlation: 0.8153
- Log correlation: 0.7891
- Linear regression: target ~= 0.7991 * source + 14.60 (R^2 0.6647)
- Trimmed regression: target ~= 0.8183 * source + 11.53 (R^2 0.7444, n=709)
- Log-log regression: log(target) ~= 0.8100 * log(source) + 0.8333 (R^2 0.6227, n=746)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 111.14 | 25% | 113 | low |
| 124.80 | 50% | 124 | low |
| 129.89 | 60% | 128 | low |
| 139 | 75% | 137 | low |
| 145.14 | 88% | 147 | low |
| 151.89 | 95% | 159 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 65 | 0.3% | 73 | 94 | 100 | 67 | 65 | 68 | medium |
| 78 | 1.5% | 85 | 94 | 100 | 77 | 75 | 78 | medium |
| 90 | 5.3% | 95 | 96 | 100 | 87 | 85 | 88 | medium |
| 100 | 12.0% | 102 | 99 | 100 | 95 | 93 | 96 | medium |
| 110 | 23.3% | 111 | 100 | 100 | 103 | 102 | 104 | medium |
| 120 | 41.0% | 120 | 108 | 109 | 110 | 110 | 111 | medium |
| 130 | 60.1% | 129 | 115 | 116 | 118 | 118 | 119 | medium |
| 140 | 76.4% | 138 | 124 | 124 | 126 | 126 | 126 | medium |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 1 cutoff row(s); largest difference is 22% below paired-window at source cutoff 65. This may indicate target leaderboard population skew or sparse paired data.

## domiSwitch Easy Slower -> domiSwitch Easier

- Source leaderboard: 128818
- Target leaderboard: 185428
- Overlapping players: 600 (1.4%)
- Correlation: 0.8607
- Log correlation: 0.8632
- Linear regression: target ~= 0.8950 * source + 1555.60 (R^2 0.7408)
- Trimmed regression: target ~= 0.9049 * source + 1479.69 (R^2 0.8096, n=570)
- Log-log regression: log(target) ~= 0.7514 * log(source) + 2.3067 (R^2 0.7451, n=600)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 4868.79 | 25% | 6436 | low |
| 5570.40 | 50% | 7104 | low |
| 5824.80 | 60% | 7297 | low |
| 6298.40 | 75% | 7718 | low |
| 6567.20 | 88% | 8260 | low |
| 6899.20 | 95% | 8867 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 3200 | 2.4% | 4872 | 5340 | 5806 | 4419 | 4375 | 4322 | medium |
| 3700 | 5.1% | 5309 | 5387 | 5806 | 4867 | 4828 | 4820 | medium |
| 4200 | 10.5% | 5787 | 5719 | 5806 | 5314 | 5280 | 5301 | medium |
| 4600 | 18.0% | 6195 | 5806 | 5806 | 5672 | 5642 | 5676 | medium |
| 5000 | 28.7% | 6560 | 5925 | 6027 | 6030 | 6004 | 6043 | medium |
| 5400 | 42.8% | 6957 | 6354 | 6334 | 6388 | 6366 | 6403 | medium |
| 5800 | 58.9% | 7270 | 6567 | 6557 | 6746 | 6728 | 6757 | medium |
| 6300 | 75.1% | 7726 | 7377 | 7342 | 7194 | 7181 | 7190 | medium |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## tamTargetSwitch Smooth Easy -> kinTS Voltaic Easy 85%

- Source leaderboard: 42505
- Target leaderboard: 185408
- Overlapping players: 627 (1.1%)
- Correlation: 0.8211
- Log correlation: 0.7936
- Linear regression: target ~= 1.1605 * source + 32.86 (R^2 0.6742)
- Trimmed regression: target ~= 1.1608 * source + 32.59 (R^2 0.7252, n=596)
- Log-log regression: log(target) ~= 0.4126 * log(source) + 2.8151 (R^2 0.6297, n=627)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 19 | 25% | 61 | low |
| 25 | 50% | 67 | low |
| 27 | 60% | 69 | low |
| 30 | 75% | 74 | low |
| 34 | 88% | 78 | low |
| 36 | 95% | 84 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 7 | 3.4% | 48 | 52 | 56 | 41 | 41 | 37 | medium |
| 11 | 7.9% | 52 | 52 | 56 | 46 | 45 | 45 | medium |
| 15 | 15.0% | 57 | 52 | 56 | 50 | 50 | 51 | medium |
| 18 | 22.8% | 60 | 56 | 56 | 54 | 53 | 55 | medium |
| 21 | 33.1% | 63 | 61 | 60 | 57 | 57 | 59 | medium |
| 24 | 46.1% | 66 | 63 | 61 | 61 | 60 | 62 | medium |
| 26 | 55.7% | 68 | 65 | 65 | 63 | 63 | 64 | medium |
| 28 | 66.2% | 71 | 67 | 67 | 65 | 65 | 66 | medium |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## domiSwitch Easy Slower -> B180T Voltaic Easy Slower

- Source leaderboard: 128818
- Target leaderboard: 185571
- Overlapping players: 578 (1.3%)
- Correlation: 0.8020
- Log correlation: 0.8066
- Linear regression: target ~= 0.0109 * source + -5.05 (R^2 0.6431)
- Trimmed regression: target ~= 0.0110 * source + -5.84 (R^2 0.7201, n=550)
- Log-log regression: log(target) ~= 1.0456 * log(source) + -4.9990 (R^2 0.6506, n=578)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 4868.79 | 25% | 54 | low |
| 5570.40 | 50% | 62 | low |
| 5824.80 | 60% | 66 | low |
| 6298.40 | 75% | 71 | low |
| 6567.20 | 88% | 77 | low |
| 6899.20 | 95% | 85 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 3200 | 2.4% | 36 | 42 | 47 | 30 | 29 | 31 | medium |
| 3700 | 5.1% | 41 | 43 | 47 | 35 | 35 | 36 | medium |
| 4200 | 10.5% | 46 | 44 | 47 | 41 | 40 | 41 | medium |
| 4600 | 18.0% | 50 | 47 | 47 | 45 | 45 | 46 | medium |
| 5000 | 28.7% | 55 | 48 | 49 | 50 | 49 | 50 | medium |
| 5400 | 42.8% | 60 | 52 | 52 | 54 | 54 | 54 | medium |
| 5800 | 58.9% | 66 | 56 | 55 | 58 | 58 | 58 | medium |
| 6300 | 75.1% | 71 | 64 | 64 | 64 | 63 | 63 | medium |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 3 cutoff row(s); largest difference is 17% above paired-window at source cutoff 5800. This may indicate target leaderboard population skew or sparse paired data.

## 1w3ts Pasu Perfected Micro Goated Larger 80% -> 1w3ts Pasu Perfected Micro Goated Larger 80%

- Source leaderboard: 128920
- Target leaderboard: 128920
- Overlapping players: 42782 (100.0%)
- Correlation: 1.0000
- Log correlation: 1.0000
- Linear regression: target ~= 1.0000 * source + 0.00 (R^2 1.0000)
- Trimmed regression: target ~= 1.0000 * source + 0.00 (R^2 1.0000, n=40643)
- Log-log regression: log(target) ~= 1.0000 * log(source) + 0.0000 (R^2 1.0000, n=42777)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 932 | 25% | 932 | high |
| 1080 | 50% | 1080 | high |
| 1130 | 60% | 1130 | high |
| 1222 | 75% | 1222 | high |
| 1322 | 88% | 1322 | high |
| 1386 | 95% | 1386 | high |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 600 | 1.4% | 602 | 666 | 728 | 600 | 600 | 600 | high |
| 700 | 4.1% | 702 | 714 | 728 | 700 | 700 | 700 | high |
| 800 | 10.2% | 802 | 804 | 805 | 800 | 800 | 800 | high |
| 900 | 20.5% | 902 | 902 | 904 | 900 | 900 | 900 | high |
| 1000 | 35.7% | 1002 | 1002 | 1002 | 1000 | 1000 | 1000 | high |
| 1100 | 53.5% | 1102 | 1102 | 1100 | 1100 | 1100 | 1100 | high |
| 1200 | 71.5% | 1202 | 1202 | 1200 | 1200 | 1200 | 1200 | high |
| 1300 | 83.4% | 1300 | 1304 | 1300 | 1300 | 1300 | 1300 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## 1wall5targets_pasu slow -> Pasu Voltaic Reload Easier

- Source leaderboard: 544
- Target leaderboard: 185636
- Overlapping players: 601 (0.5%)
- Correlation: 0.8223
- Log correlation: 0.7086
- Linear regression: target ~= 0.7012 * source + -11.25 (R^2 0.6763)
- Trimmed regression: target ~= 0.7309 * source + -15.65 (R^2 0.7813, n=571)
- Log-log regression: log(target) ~= 1.0871 * log(source) + -0.9203 (R^2 0.5022, n=601)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 93 | 25% | 73 | low |
| 110 | 50% | 86 | low |
| 117 | 60% | 91 | low |
| 127 | 75% | 98 | low |
| 139 | 88% | 108 | low |
| 151 | 95% | 117 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 76 | 9.7% | 61 | 54 | 63 | 42 | 40 | 44 | medium |
| 88 | 19.7% | 70 | 55 | 63 | 50 | 49 | 52 | medium |
| 100 | 34.8% | 79 | 61 | 63 | 59 | 57 | 60 | medium |
| 110 | 50.2% | 86 | 66 | 65 | 66 | 65 | 66 | medium |
| 120 | 66.0% | 93 | 73 | 73 | 73 | 72 | 73 | medium |
| 130 | 79.3% | 101 | 78 | 80 | 80 | 79 | 79 | medium |
| 140 | 88.9% | 109 | 86 | 83 | 87 | 87 | 86 | medium |
| 150 | 94.4% | 115 | 96 | 96 | 94 | 94 | 92 | medium |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 7 cutoff row(s); largest difference is 30% above paired-window at source cutoff 110. This may indicate target leaderboard population skew or sparse paired data.

## B180 Voltaic Easy 92% -> VT Bounceshot Viscose Easier

- Source leaderboard: 12018
- Target leaderboard: 185392
- Overlapping players: 566 (1.3%)
- Correlation: 0.8708
- Log correlation: 0.8787
- Linear regression: target ~= 9.8960 * source + -4.96 (R^2 0.7582)
- Trimmed regression: target ~= 9.7868 * source + -1.09 (R^2 0.8029, n=538)
- Log-log regression: log(target) ~= 0.9535 * log(source) + 2.4827 (R^2 0.7721, n=566)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 54 | 25% | 640 | low |
| 67 | 50% | 780 | low |
| 72 | 60% | 830 | low |
| 80 | 75% | 910 | low |
| 88 | 88% | 1020 | low |
| 93 | 95% | 1130 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 26 | 1.4% | 330 | 440 | 530 | 252 | 253 | 268 | medium |
| 38 | 6.9% | 470 | 440 | 530 | 371 | 371 | 384 | medium |
| 50 | 19.9% | 600 | 530 | 530 | 490 | 488 | 499 | medium |
| 58 | 32.6% | 690 | 590 | 590 | 569 | 567 | 575 | medium |
| 65 | 46.2% | 760 | 630 | 610 | 638 | 635 | 641 | medium |
| 72 | 60.5% | 830 | 710 | 710 | 708 | 704 | 707 | medium |
| 78 | 72.7% | 900 | 770 | 740 | 767 | 762 | 763 | medium |
| 87 | 86.1% | 990 | 910 | 910 | 856 | 850 | 846 | medium |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 5 cutoff row(s); largest difference is 25% below paired-window at source cutoff 26. This may indicate target leaderboard population skew or sparse paired data.

## Controlsphere Click Easy -> CatClick Easier

- Source leaderboard: 89547
- Target leaderboard: 184866
- Overlapping players: 545 (1.3%)
- Correlation: 0.8093
- Log correlation: 0.8001
- Linear regression: target ~= 1.2474 * source + 2.96 (R^2 0.6550)
- Trimmed regression: target ~= 1.2663 * source + 1.36 (R^2 0.7332, n=518)
- Log-log regression: log(target) ~= 0.8795 * log(source) + 0.7362 (R^2 0.6402, n=545)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 38 | 25% | 58 | low |
| 47 | 50% | 70 | low |
| 51 | 60% | 75 | low |
| 56 | 75% | 82 | low |
| 60 | 88% | 93 | low |
| 66 | 95% | 106 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 15 | 0.9% | 30 | 41 | 52 | 22 | 20 | 23 | medium |
| 21 | 3.1% | 37 | 41 | 52 | 29 | 28 | 30 | medium |
| 27 | 7.4% | 44 | 43 | 52 | 37 | 36 | 38 | medium |
| 33 | 15.5% | 51 | 45 | 52 | 44 | 43 | 45 | medium |
| 39 | 27.8% | 59 | 53 | 53 | 52 | 51 | 52 | medium |
| 45 | 43.8% | 67 | 60 | 60 | 59 | 58 | 59 | medium |
| 50 | 59.2% | 74 | 63 | 63 | 65 | 65 | 65 | medium |
| 55 | 73.3% | 82 | 75 | 75 | 72 | 71 | 71 | medium |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 2 cutoff row(s); largest difference is 27% below paired-window at source cutoff 15. This may indicate target leaderboard population skew or sparse paired data.

## Popcorn MV Novice -> Popcorn MV Easier

- Source leaderboard: 76965
- Target leaderboard: 185398
- Overlapping players: 508 (1.2%)
- Correlation: 0.8026
- Log correlation: 0.8000
- Linear regression: target ~= 0.9850 * source + 63.61 (R^2 0.6441)
- Trimmed regression: target ~= 1.0114 * source + 52.49 (R^2 0.7246, n=483)
- Log-log regression: log(target) ~= 0.7707 * log(source) + 1.4839 (R^2 0.6400, n=508)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 190 | 25% | 310 | low |
| 270 | 50% | 380 | low |
| 290 | 60% | 410 | low |
| 330 | 75% | 470 | low |
| 370 | 88% | 520 | low |
| 410 | 95% | 580 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 50 | 0.9% | 100 | 180 | 260 | 113 | 103 | 90 | medium |
| 100 | 4.9% | 200 | 180 | 260 | 162 | 154 | 153 | medium |
| 150 | 14.2% | 260 | 225 | 260 | 211 | 204 | 210 | medium |
| 190 | 25.1% | 310 | 270 | 265 | 251 | 245 | 252 | medium |
| 230 | 38.9% | 350 | 290 | 283 | 290 | 285 | 292 | medium |
| 270 | 53.5% | 390 | 340 | 340 | 330 | 326 | 330 | medium |
| 300 | 64.7% | 430 | 360 | 350 | 359 | 356 | 358 | medium |
| 330 | 76.0% | 470 | 430 | 430 | 389 | 386 | 385 | medium |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 4 cutoff row(s); largest difference is 44% below paired-window at source cutoff 50. This may indicate target leaderboard population skew or sparse paired data.

## Pasu Angelic 20% Larger 80% Speed -> skyClick Goated Easier

- Source leaderboard: 129352
- Target leaderboard: 185490
- Overlapping players: 538 (1.3%)
- Correlation: 0.8372
- Log correlation: 0.8377
- Linear regression: target ~= 1.0105 * source + 19.60 (R^2 0.7008)
- Trimmed regression: target ~= 1.0010 * source + 19.72 (R^2 0.7669, n=512)
- Log-log regression: log(target) ~= 0.7712 * log(source) + 1.2337 (R^2 0.7018, n=538)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 66 | 25% | 97 | low |
| 79 | 50% | 110 | low |
| 84 | 60% | 114 | low |
| 91 | 75% | 123 | low |
| 98 | 88% | 135 | low |
| 103 | 95% | 148 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 51 | 6.8% | 78 | 79 | 84 | 71 | 71 | 71 | medium |
| 58 | 13.5% | 87 | 84 | 84 | 78 | 78 | 79 | medium |
| 65 | 23.5% | 96 | 90 | 86 | 85 | 85 | 86 | medium |
| 72 | 36.2% | 103 | 92 | 93 | 92 | 92 | 93 | medium |
| 78 | 49.1% | 110 | 97 | 99 | 98 | 98 | 99 | medium |
| 84 | 62.3% | 115 | 106 | 102 | 104 | 104 | 105 | medium |
| 90 | 74.9% | 123 | 113 | 109 | 111 | 110 | 110 | medium |
| 97 | 85.6% | 131 | 124 | 124 | 118 | 117 | 117 | medium |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## 1w2ts Pasu Perfected Easy -> psalmTS Viscose Click Easier

- Source leaderboard: 57757
- Target leaderboard: 185609
- Overlapping players: 503 (1.0%)
- Correlation: 0.8102
- Log correlation: 0.8093
- Linear regression: target ~= 0.9695 * source + -26.92 (R^2 0.6565)
- Trimmed regression: target ~= 0.9847 * source + -28.35 (R^2 0.7312, n=478)
- Log-log regression: log(target) ~= 1.3829 * log(source) + -2.1334 (R^2 0.6550, n=503)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 83 | 25% | 62 | low |
| 94 | 50% | 72 | low |
| 98 | 60% | 77 | low |
| 104 | 75% | 83 | low |
| 111 | 88% | 94 | low |
| 115 | 95% | 104 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 58 | 1.3% | 30 | 47 | 55 | 29 | 29 | 33 | medium |
| 69 | 5.8% | 46 | 48 | 55 | 40 | 40 | 41 | medium |
| 80 | 19.4% | 58 | 55 | 55 | 51 | 50 | 51 | medium |
| 87 | 34.0% | 66 | 57 | 57 | 57 | 57 | 57 | medium |
| 93 | 49.3% | 72 | 64 | 64 | 63 | 63 | 62 | medium |
| 99 | 64.6% | 79 | 70 | 70 | 69 | 69 | 68 | medium |
| 105 | 78.1% | 86 | 74 | 73 | 75 | 75 | 74 | medium |
| 110 | 87.0% | 93 | 86 | 88 | 80 | 80 | 79 | medium |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 3 cutoff row(s); largest difference is 35% below paired-window at source cutoff 58. This may indicate target leaderboard population skew or sparse paired data.

## Floating Heads Timing 400% Larger -> VT Floating Heads Viscose Easier

- Source leaderboard: 1607
- Target leaderboard: 185409
- Overlapping players: 543 (1.1%)
- Correlation: 0.8512
- Log correlation: 0.8470
- Linear regression: target ~= 0.2778 * source + -73.92 (R^2 0.7245)
- Trimmed regression: target ~= 0.2775 * source + -74.63 (R^2 0.7815, n=516)
- Log-log regression: log(target) ~= 1.0791 * log(source) + -2.0152 (R^2 0.7174, n=543)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 2520 | 25% | 686 | low |
| 2880 | 50% | 790 | low |
| 2988 | 60% | 838 | low |
| 3204 | 75% | 921 | low |
| 3528 | 88% | 1040 | low |
| 3816 | 95% | 1161 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 400 | 0.0% | 256 | 464 | 621 | 37 | 36 | 86 | medium |
| 700 | 0.0% | 256 | 464 | 621 | 121 | 120 | 157 | medium |
| 1000 | 0.0% | 256 | 464 | 621 | 204 | 203 | 230 | medium |
| 1350 | 0.2% | 302 | 464 | 621 | 301 | 300 | 318 | medium |
| 1700 | 1.4% | 396 | 464 | 621 | 398 | 397 | 408 | medium |
| 2050 | 5.6% | 500 | 478 | 621 | 496 | 494 | 499 | medium |
| 2400 | 18.2% | 637 | 622 | 621 | 593 | 591 | 592 | medium |
| 2750 | 40.2% | 751 | 733 | 747 | 690 | 688 | 686 | medium |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 4 cutoff row(s); largest difference is 45% below paired-window at source cutoff 400. This may indicate target leaderboard population skew or sparse paired data.

## voxTargetSwitch Click -> VoxTS Click Easier

- Source leaderboard: 653
- Target leaderboard: 136076
- Overlapping players: 549 (0.7%)
- Correlation: 0.8552
- Log correlation: 0.8601
- Linear regression: target ~= 1.0843 * source + -2.48 (R^2 0.7313)
- Trimmed regression: target ~= 1.0870 * source + -3.20 (R^2 0.7842, n=522)
- Log-log regression: log(target) ~= 0.9954 * log(source) + 0.0717 (R^2 0.7398, n=549)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 67 | 25% | 84 | low |
| 78 | 50% | 97 | low |
| 82 | 60% | 101 | low |
| 89 | 75% | 107 | low |
| 96 | 88% | 117 | low |
| 102 | 95% | 130 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 49 | 4.3% | 62 | 64 | 77 | 51 | 50 | 52 | medium |
| 59 | 12.8% | 75 | 66 | 77 | 61 | 61 | 62 | medium |
| 67 | 26.1% | 85 | 77 | 77 | 70 | 70 | 71 | medium |
| 74 | 41.7% | 92 | 78 | 79 | 78 | 77 | 78 | medium |
| 81 | 59.3% | 100 | 87 | 87 | 85 | 85 | 85 | medium |
| 88 | 75.0% | 107 | 95 | 94 | 93 | 92 | 93 | medium |
| 94 | 85.5% | 115 | 99 | 99 | 99 | 99 | 99 | medium |
| 100 | 92.5% | 126 | 111 | 111 | 106 | 105 | 105 | medium |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 3 cutoff row(s); largest difference is 18% above paired-window at source cutoff 74. This may indicate target leaderboard population skew or sparse paired data.
