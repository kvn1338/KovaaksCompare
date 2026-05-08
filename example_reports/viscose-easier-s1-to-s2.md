# Viscose Easier Calibration

Mapping: Viscose Easier -> Viscose Benchmark S2 Easier

Source benchmark: Viscose Easier
Target benchmark: Viscose Benchmark S2 Easier

## WhisphereRawControl Larger + Slowed -> Smoothsphere Viscose Easier

- Source leaderboard: 128696
- Target leaderboard: 185342
- Overlapping players: 4823 (7.1%)
- Correlation: 0.8303
- Log correlation: n/a
- Linear regression: target ~= 0.7308 * source + 4560.02 (R^2 0.6895)
- Trimmed regression: target ~= 0.7485 * source + 4411.40 (R^2 0.7745, n=4582)
- Log-log regression: log(target) ~= 0.5984 * log(source) + 3.8748 (R^2 0.6639, n=4822)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 6969 | 25% | 11214 | medium |
| 9342 | 50% | 12852 | medium |
| 10179 | 60% | 13506 | medium |
| 11442 | 75% | 14301 | medium |
| 12642 | 88% | 14892 | medium |
| 13236 | 95% | 15633 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 5500 | 13.0% | 9873 | 9062 | 9708 | 8580 | 8528 | 8341 | high |
| 6700 | 22.5% | 10962 | 9728 | 9736 | 9456 | 9426 | 9386 | high |
| 7800 | 32.9% | 11829 | 10482 | 10496 | 10260 | 10249 | 10280 | high |
| 8700 | 42.4% | 12429 | 11112 | 11053 | 10918 | 10923 | 10974 | high |
| 9600 | 52.8% | 13038 | 11507 | 11526 | 11576 | 11597 | 11640 | high |
| 10500 | 63.4% | 13734 | 12167 | 12181 | 12234 | 12270 | 12282 | high |
| 11400 | 74.5% | 14289 | 12731 | 12711 | 12891 | 12944 | 12901 | high |
| 12500 | 84.6% | 14682 | 14142 | 14102 | 13695 | 13767 | 13632 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## Whisphere 80% -> VT Controlsphere Viscose Easier

- Source leaderboard: 55382
- Target leaderboard: 184157
- Overlapping players: 4116 (6.3%)
- Correlation: 0.8640
- Log correlation: n/a
- Linear regression: target ~= 0.2294 * source + 597.90 (R^2 0.7465)
- Trimmed regression: target ~= 0.2339 * source + 549.50 (R^2 0.8193, n=3911)
- Log-log regression: log(target) ~= 0.8116 * log(source) + 0.4932 (R^2 0.7223, n=4115)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 8890 | 25% | 3100 | medium |
| 11433 | 50% | 3752 | medium |
| 12350 | 60% | 4018 | medium |
| 13880 | 75% | 4333 | medium |
| 15170 | 88% | 4588 | medium |
| 16460 | 95% | 4904 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 6300 | 7.4% | 2280 | 2333 | 2583 | 2043 | 2023 | 1985 | high |
| 7700 | 15.7% | 2744 | 2428 | 2583 | 2364 | 2351 | 2336 | high |
| 9000 | 26.0% | 3132 | 2635 | 2676 | 2663 | 2655 | 2652 | high |
| 10000 | 35.2% | 3397 | 2895 | 2886 | 2892 | 2889 | 2889 | high |
| 11000 | 45.1% | 3642 | 3093 | 3079 | 3121 | 3123 | 3121 | high |
| 12000 | 55.8% | 3892 | 3348 | 3306 | 3351 | 3356 | 3349 | high |
| 13000 | 66.7% | 4170 | 3569 | 3570 | 3580 | 3590 | 3574 | high |
| 14500 | 79.3% | 4401 | 4107 | 4085 | 3924 | 3941 | 3905 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 5 cutoff row(s); largest difference is 19% above paired-window at source cutoff 9000. This may indicate target leaderboard population skew or sparse paired data.

## SmoothBot Invincible Goated 75% -> SmoothBot Perfected Easier

- Source leaderboard: 75962
- Target leaderboard: 184652
- Overlapping players: 3962 (6.6%)
- Correlation: 0.8539
- Log correlation: 0.8279
- Linear regression: target ~= 1.0321 * source + 1115.31 (R^2 0.7292)
- Trimmed regression: target ~= 1.0509 * source + 1063.93 (R^2 0.8034, n=3764)
- Log-log regression: log(target) ~= 0.7063 * log(source) + 2.6962 (R^2 0.6855, n=3962)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 2346 | 25% | 4033 | medium |
| 2934 | 50% | 4720 | medium |
| 3156 | 60% | 4990 | medium |
| 3480 | 75% | 5268 | medium |
| 3876 | 88% | 5520 | medium |
| 4086 | 95% | 5776 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 1800 | 8.5% | 3288 | 3277 | 3648 | 2973 | 2956 | 2953 | high |
| 2250 | 21.5% | 3921 | 3642 | 3648 | 3438 | 3428 | 3457 | high |
| 2650 | 37.2% | 4405 | 3890 | 3882 | 3850 | 3849 | 3880 | high |
| 2900 | 48.2% | 4674 | 4034 | 4091 | 4109 | 4112 | 4135 | high |
| 3150 | 59.9% | 4989 | 4394 | 4343 | 4367 | 4374 | 4384 | high |
| 3400 | 70.7% | 5211 | 4646 | 4618 | 4625 | 4637 | 4627 | high |
| 3650 | 81.3% | 5367 | 4929 | 4916 | 4883 | 4900 | 4865 | high |
| 4000 | 90.2% | 5589 | 5344 | 5327 | 5244 | 5268 | 5190 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 1 cutoff row(s); largest difference is 16% above paired-window at source cutoff 2900. This may indicate target leaderboard population skew or sparse paired data.

## Leaptrack Goated 60% Larger -> Leapstrafes Control wobin Easier

- Source leaderboard: 128691
- Target leaderboard: 185344
- Overlapping players: 3695 (6.2%)
- Correlation: 0.8148
- Log correlation: n/a
- Linear regression: target ~= 1.5294 * source + -507.20 (R^2 0.6639)
- Trimmed regression: target ~= 1.5710 * source + -604.80 (R^2 0.7438, n=3511)
- Log-log regression: log(target) ~= 1.1103 * log(source) + -0.5904 (R^2 0.6420, n=3694)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 1938 | 25% | 2713 | medium |
| 2248 | 50% | 3221 | medium |
| 2352 | 60% | 3431 | medium |
| 2495 | 75% | 3626 | medium |
| 2615 | 88% | 3918 | medium |
| 2755 | 95% | 4262 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 850 | 0.4% | 1236 | 2188 | 2416 | 793 | 731 | 991 | high |
| 1200 | 2.0% | 1650 | 2195 | 2416 | 1328 | 1280 | 1454 | high |
| 1500 | 6.6% | 2028 | 2227 | 2416 | 1787 | 1752 | 1863 | high |
| 1700 | 12.9% | 2364 | 2310 | 2416 | 2093 | 2066 | 2140 | high |
| 1900 | 22.6% | 2656 | 2417 | 2458 | 2399 | 2380 | 2422 | high |
| 2100 | 36.6% | 2961 | 2679 | 2670 | 2704 | 2694 | 2707 | high |
| 2250 | 50.3% | 3226 | 2852 | 2835 | 2934 | 2930 | 2922 | high |
| 2450 | 68.2% | 3519 | 3261 | 3292 | 3240 | 3244 | 3212 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 2 cutoff row(s); largest difference is 44% below paired-window at source cutoff 850. This may indicate target leaderboard population skew or sparse paired data.

## Controlsphere rAim Easy 90% -> Controlsphere SuperbAim Viscose Easier

- Source leaderboard: 83485
- Target leaderboard: 185345
- Overlapping players: 3589 (6.1%)
- Correlation: 0.8746
- Log correlation: 0.8535
- Linear regression: target ~= 0.9353 * source + 768.22 (R^2 0.7649)
- Trimmed regression: target ~= 0.9532 * source + 592.44 (R^2 0.8331, n=3410)
- Log-log regression: log(target) ~= 0.8701 * log(source) + 1.2089 (R^2 0.7284, n=3589)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 7314 | 25% | 9042 | medium |
| 9273 | 50% | 10944 | medium |
| 9936 | 60% | 11529 | medium |
| 10947 | 75% | 12249 | medium |
| 11838 | 88% | 13182 | medium |
| 12516 | 95% | 14172 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 6100 | 13.3% | 7743 | 7185 | 7691 | 6474 | 6407 | 6588 | high |
| 6950 | 21.1% | 8673 | 7562 | 7691 | 7269 | 7217 | 7380 | high |
| 7700 | 29.2% | 9363 | 8061 | 8101 | 7970 | 7932 | 8068 | high |
| 8400 | 37.7% | 10002 | 8592 | 8540 | 8625 | 8599 | 8703 | high |
| 9100 | 47.3% | 10731 | 9059 | 9014 | 9279 | 9267 | 9330 | high |
| 9800 | 57.6% | 11436 | 9792 | 9801 | 9934 | 9934 | 9952 | high |
| 10500 | 68.7% | 11913 | 10352 | 10442 | 10589 | 10601 | 10568 | high |
| 11500 | 80.4% | 12570 | 11636 | 11608 | 11524 | 11554 | 11438 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 5 cutoff row(s); largest difference is 18% above paired-window at source cutoff 9100. This may indicate target leaderboard population skew or sparse paired data.

## VT Controlsphere Intermediate S5 80% -> Whisphere Viscose Easier

- Source leaderboard: 107281
- Target leaderboard: 185346
- Overlapping players: 3410 (6.1%)
- Correlation: 0.8545
- Log correlation: 0.8433
- Linear regression: target ~= 4.5455 * source + -22.33 (R^2 0.7302)
- Trimmed regression: target ~= 4.6602 * source + -414.80 (R^2 0.8042, n=3240)
- Log-log regression: log(target) ~= 0.9388 * log(source) + 2.0118 (R^2 0.7112, n=3410)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 2632 | 25% | 14170 | medium |
| 3310 | 50% | 17370 | medium |
| 3547 | 60% | 18540 | medium |
| 3895 | 75% | 19650 | medium |
| 4192 | 88% | 21310 | medium |
| 4397 | 95% | 22960 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 1850 | 6.6% | 10480 | 11070 | 12090 | 8387 | 8207 | 8726 | high |
| 2300 | 15.6% | 12680 | 11660 | 12090 | 10432 | 10304 | 10704 | high |
| 2700 | 27.0% | 14420 | 12460 | 12624 | 12251 | 12168 | 12443 | high |
| 3000 | 37.4% | 15710 | 13590 | 13692 | 13614 | 13566 | 13737 | high |
| 3300 | 49.5% | 17310 | 14420 | 14539 | 14978 | 14964 | 15023 | high |
| 3600 | 62.0% | 18680 | 15700 | 15687 | 16341 | 16362 | 16301 | high |
| 3850 | 73.1% | 19500 | 17060 | 17060 | 17478 | 17527 | 17362 | high |
| 4100 | 81.6% | 20320 | 18970 | 18824 | 18614 | 18692 | 18418 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 4 cutoff row(s); largest difference is 20% above paired-window at source cutoff 3300. This may indicate target leaderboard population skew or sparse paired data.

## Air Angelic 4 Voltaic Easy 80% (Good Version) -> Air Angelic 4 Voltaic Easy 70%

- Source leaderboard: 13681
- Target leaderboard: 14155
- Overlapping players: 4511 (6.0%)
- Correlation: 0.8692
- Log correlation: 0.8423
- Linear regression: target ~= 0.9542 * source + 1542.42 (R^2 0.7555)
- Trimmed regression: target ~= 0.9648 * source + 1523.31 (R^2 0.8492, n=4286)
- Log-log regression: log(target) ~= 0.6245 * log(source) + 3.3963 (R^2 0.7095, n=4511)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 2771 | 25% | 4399 | medium |
| 3164 | 50% | 4859 | medium |
| 3305 | 60% | 5014 | medium |
| 3527 | 75% | 5171 | medium |
| 3714 | 88% | 5349 | medium |
| 3885 | 95% | 5506 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 1050 | 0.3% | 2301 | 3584 | 3898 | 2544 | 2536 | 2300 | high |
| 1600 | 1.0% | 2945 | 3590 | 3898 | 3069 | 3067 | 2992 | high |
| 2000 | 3.4% | 3440 | 3625 | 3898 | 3451 | 3453 | 3440 | high |
| 2400 | 10.3% | 3932 | 3859 | 3898 | 3832 | 3839 | 3855 | high |
| 2700 | 21.4% | 4307 | 4163 | 4186 | 4119 | 4128 | 4149 | high |
| 3000 | 38.0% | 4656 | 4411 | 4425 | 4405 | 4418 | 4431 | high |
| 3300 | 59.6% | 5011 | 4718 | 4729 | 4691 | 4707 | 4703 | high |
| 3600 | 78.6% | 5218 | 5048 | 5033 | 4977 | 4997 | 4965 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 2 cutoff row(s); largest difference is 36% below paired-window at source cutoff 1050. This may indicate target leaderboard population skew or sparse paired data.

## cloverRawControl Easy 80% Speed -> cloverRawControl Viscose Easier 50cm

- Source leaderboard: 98867
- Target leaderboard: 185349
- Overlapping players: 3252 (5.7%)
- Correlation: 0.8480
- Log correlation: 0.8317
- Linear regression: target ~= 1.1352 * source + 2343.42 (R^2 0.7191)
- Trimmed regression: target ~= 1.1520 * source + 2228.67 (R^2 0.8014, n=3090)
- Log-log regression: log(target) ~= 0.7524 * log(source) + 2.5766 (R^2 0.6918, n=3252)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 4767 | 25% | 8943 | medium |
| 6255 | 50% | 10815 | medium |
| 6771 | 60% | 11340 | medium |
| 7548 | 75% | 12138 | medium |
| 8154 | 88% | 13065 | medium |
| 8826 | 95% | 14049 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 3900 | 13.3% | 7614 | 7254 | 7641 | 6771 | 6722 | 6623 | high |
| 4550 | 21.9% | 8604 | 7623 | 7641 | 7508 | 7470 | 7438 | high |
| 5200 | 31.5% | 9543 | 8157 | 8070 | 8246 | 8219 | 8224 | high |
| 5700 | 39.8% | 10104 | 8556 | 8545 | 8814 | 8795 | 8812 | high |
| 6200 | 48.8% | 10752 | 9270 | 9295 | 9381 | 9371 | 9388 | high |
| 6700 | 58.4% | 11259 | 9741 | 9800 | 9949 | 9947 | 9952 | high |
| 7200 | 68.8% | 11778 | 10461 | 10434 | 10517 | 10523 | 10506 | high |
| 7700 | 77.0% | 12264 | 11325 | 11272 | 11084 | 11099 | 11050 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 4 cutoff row(s); largest difference is 18% above paired-window at source cutoff 5700. This may indicate target leaderboard population skew or sparse paired data.

## Controlsphere Far, Far Larger 90% -> Flower Easier 50cm

- Source leaderboard: 128692
- Target leaderboard: 185354
- Overlapping players: 3091 (5.9%)
- Correlation: 0.7735
- Log correlation: 0.7562
- Linear regression: target ~= 0.3654 * source + -786.70 (R^2 0.5983)
- Trimmed regression: target ~= 0.3856 * source + -993.94 (R^2 0.6959, n=2937)
- Log-log regression: log(target) ~= 1.1799 * log(source) + -2.9201 (R^2 0.5718, n=3091)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 7773 | 25% | 2422 | medium |
| 9528 | 50% | 3122 | medium |
| 10116 | 60% | 3426 | medium |
| 10944 | 75% | 3709 | medium |
| 11688 | 88% | 3956 | medium |
| 12096 | 95% | 4306 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 7600 | 22.8% | 2363 | 1954 | 1993 | 1990 | 1937 | 2045 | high |
| 8150 | 29.7% | 2551 | 2215 | 2169 | 2191 | 2149 | 2220 | high |
| 8700 | 37.2% | 2771 | 2299 | 2341 | 2392 | 2361 | 2398 | high |
| 9200 | 44.5% | 2967 | 2468 | 2487 | 2575 | 2554 | 2562 | high |
| 9800 | 54.2% | 3236 | 2582 | 2580 | 2794 | 2785 | 2760 | high |
| 10200 | 61.3% | 3457 | 2762 | 2743 | 2940 | 2939 | 2893 | high |
| 10900 | 74.2% | 3698 | 3127 | 3036 | 3196 | 3209 | 3129 | high |
| 11500 | 82.1% | 3815 | 3651 | 3603 | 3415 | 3440 | 3333 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 7 cutoff row(s); largest difference is 25% above paired-window at source cutoff 9800. This may indicate target leaderboard population skew or sparse paired data.

## PGTI Voltaic Easy 80% -> PGTI Voltaic Easy Smoother

- Source leaderboard: 2107
- Target leaderboard: 184878
- Overlapping players: 2883 (5.7%)
- Correlation: 0.8979
- Log correlation: 0.8860
- Linear regression: target ~= 1.0840 * source + 235.99 (R^2 0.8062)
- Trimmed regression: target ~= 1.0928 * source + 216.64 (R^2 0.8628, n=2739)
- Log-log regression: log(target) ~= 0.8747 * log(source) + 1.1291 (R^2 0.7851, n=2883)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 990 | 25% | 1635 | medium |
| 1382 | 50% | 2206 | medium |
| 1551 | 60% | 2448 | medium |
| 1814 | 75% | 2679 | medium |
| 2231 | 88% | 2981 | medium |
| 2402 | 95% | 3344 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 350 | 1.1% | 547 | 1081 | 1228 | 615 | 599 | 520 | high |
| 550 | 5.1% | 928 | 1081 | 1228 | 832 | 818 | 772 | high |
| 850 | 17.1% | 1428 | 1171 | 1228 | 1157 | 1146 | 1129 | high |
| 1100 | 31.6% | 1791 | 1405 | 1417 | 1428 | 1419 | 1415 | high |
| 1350 | 47.9% | 2168 | 1686 | 1716 | 1699 | 1692 | 1693 | high |
| 1600 | 62.5% | 2515 | 1975 | 1979 | 1970 | 1965 | 1964 | high |
| 1900 | 78.2% | 2734 | 2269 | 2288 | 2295 | 2293 | 2282 | high |
| 2250 | 88.3% | 2992 | 2628 | 2628 | 2675 | 2675 | 2646 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 6 cutoff row(s); largest difference is 49% below paired-window at source cutoff 350. This may indicate target leaderboard population skew or sparse paired data.

## Air CELESTIAL No UFO Easy Slowed -> Air CELESTIAL No UFO Easier

- Source leaderboard: 131872
- Target leaderboard: 185640
- Overlapping players: 2801 (6.0%)
- Correlation: 0.8690
- Log correlation: 0.8670
- Linear regression: target ~= 1.0251 * source + -24.73 (R^2 0.7552)
- Trimmed regression: target ~= 1.0213 * source + -20.69 (R^2 0.8255, n=2661)
- Log-log regression: log(target) ~= 1.0239 * log(source) + -0.1649 (R^2 0.7517, n=2801)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 862.93 | 25% | 872 | medium |
| 880.64 | 50% | 889 | medium |
| 885.83 | 60% | 895 | medium |
| 892.23 | 75% | 899 | medium |
| 897.68 | 88% | 906 | medium |
| 903.43 | 95% | 911 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 820 | 5.1% | 836 | 842 | 854 | 816 | 817 | 816 | high |
| 835 | 8.7% | 849 | 844 | 854 | 831 | 832 | 831 | high |
| 850 | 15.3% | 861 | 851 | 854 | 847 | 847 | 847 | high |
| 861 | 23.0% | 870 | 860 | 859 | 858 | 859 | 858 | high |
| 870 | 33.0% | 878 | 867 | 867 | 867 | 868 | 867 | high |
| 878 | 44.9% | 886 | 873 | 874 | 875 | 876 | 875 | high |
| 884 | 56.3% | 893 | 880 | 880 | 881 | 882 | 881 | high |
| 890 | 67.9% | 897 | 891 | 891 | 888 | 888 | 888 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## Whisphere Small & Slow 55% -> RawControlSphere Easier

- Source leaderboard: 128693
- Target leaderboard: 185356
- Overlapping players: 2839 (5.8%)
- Correlation: 0.8343
- Log correlation: 0.8277
- Linear regression: target ~= 1.2245 * source + -3721.55 (R^2 0.6961)
- Trimmed regression: target ~= 1.2585 * source + -4077.18 (R^2 0.7790, n=2698)
- Log-log regression: log(target) ~= 1.3223 * log(source) + -3.1268 (R^2 0.6851, n=2839)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 10320 | 25% | 9960 | medium |
| 11860 | 50% | 12096 | medium |
| 12380 | 60% | 12897 | medium |
| 13240 | 75% | 14013 | medium |
| 13830 | 88% | 14448 | medium |
| 14280 | 95% | 15177 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 6000 | 1.2% | 5148 | 7766 | 8741 | 3625 | 3474 | 4343 | high |
| 7500 | 4.3% | 6609 | 7800 | 8741 | 5462 | 5362 | 5833 | high |
| 9000 | 11.7% | 8220 | 7967 | 8741 | 7299 | 7249 | 7424 | high |
| 10000 | 21.1% | 9546 | 8865 | 8835 | 8523 | 8508 | 8534 | high |
| 10750 | 30.7% | 10443 | 9369 | 9426 | 9442 | 9452 | 9390 | high |
| 11500 | 42.8% | 11514 | 10170 | 10065 | 10360 | 10396 | 10266 | high |
| 12250 | 57.5% | 12711 | 11246 | 11166 | 11279 | 11340 | 11160 | high |
| 13500 | 78.6% | 14106 | 13482 | 13564 | 12809 | 12913 | 12690 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 2 cutoff row(s); largest difference is 34% below paired-window at source cutoff 6000. This may indicate target leaderboard population skew or sparse paired data.

## Air Voltaic Invincible 7 Easy 80% -> Ground Plaza Sparky v3 Easy

- Source leaderboard: 128694
- Target leaderboard: 134502
- Overlapping players: 2903 (5.8%)
- Correlation: 0.8201
- Log correlation: n/a
- Linear regression: target ~= 0.0394 * source + 764.69 (R^2 0.6725)
- Trimmed regression: target ~= 0.0366 * source + 773.85 (R^2 0.7688, n=2758)
- Log-log regression: log(target) ~= 0.1261 * log(source) + 5.7743 (R^2 0.6941, n=2902)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 2271 | 25% | 867 | medium |
| 2608 | 50% | 884 | medium |
| 2731 | 60% | 888 | medium |
| 2938 | 75% | 894 | medium |
| 3212 | 88% | 901 | medium |
| 3309 | 95% | 906 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 750 | 0.1% | 719 | 839 | 849 | 794 | 801 | 742 | high |
| 1200 | 0.5% | 765 | 839 | 849 | 812 | 818 | 787 | high |
| 1600 | 2.7% | 809 | 840 | 849 | 828 | 832 | 816 | high |
| 1900 | 8.2% | 841 | 843 | 849 | 840 | 843 | 834 | high |
| 2200 | 20.6% | 863 | 853 | 854 | 851 | 854 | 850 | high |
| 2500 | 40.6% | 878 | 866 | 866 | 863 | 865 | 864 | high |
| 2800 | 65.1% | 890 | 878 | 878 | 875 | 876 | 876 | high |
| 3200 | 86.6% | 900 | 891 | 891 | 891 | 891 | 891 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## Controlsphere OW Long Strafes 90% -> Air Spectral Easy 85%

- Source leaderboard: 128697
- Target leaderboard: 185693
- Overlapping players: 2552 (5.4%)
- Correlation: 0.7241
- Log correlation: 0.7271
- Linear regression: target ~= 0.0050 * source + 884.56 (R^2 0.5243)
- Trimmed regression: target ~= 0.0046 * source + 889.06 (R^2 0.6230, n=2425)
- Log-log regression: log(target) ~= 0.0402 * log(source) + 6.4691 (R^2 0.5287, n=2552)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 6159 | 25% | 921 | medium |
| 7635 | 50% | 929 | medium |
| 8073 | 60% | 932 | medium |
| 8706 | 75% | 933 | medium |
| 9138 | 88% | 936 | medium |
| 9639 | 95% | 938 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 5400 | 15.8% | 917 | 916 | 917 | 912 | 914 | 911 | high |
| 6100 | 24.2% | 921 | 918 | 918 | 915 | 917 | 916 | high |
| 6700 | 32.8% | 924 | 920 | 920 | 918 | 920 | 919 | high |
| 7200 | 41.1% | 927 | 920 | 921 | 921 | 922 | 922 | high |
| 7600 | 49.1% | 929 | 924 | 924 | 923 | 924 | 924 | high |
| 8000 | 57.9% | 931 | 925 | 924 | 925 | 926 | 926 | high |
| 8300 | 65.9% | 932 | 926 | 926 | 926 | 927 | 927 | high |
| 8700 | 74.8% | 933 | 932 | 932 | 928 | 929 | 929 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## Flicker Plaza rAim Easy Less Blinks -> VT Aether Novice S5 Bot 1

- Source leaderboard: 128774
- Target leaderboard: 108042
- Overlapping players: 2595 (5.8%)
- Correlation: 0.6012
- Log correlation: 0.5942
- Linear regression: target ~= 36.0926 * source + -30191.18 (R^2 0.3614)
- Trimmed regression: target ~= 40.5576 * source + -34269.78 (R^2 0.4469, n=2466)
- Log-log regression: log(target) ~= 13.0456 * log(source) + -81.0385 (R^2 0.3530, n=2595)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 898.66 | 25% | 2062 | medium |
| 907.88 | 50% | 2426 | medium |
| 910.35 | 60% | 2569 | medium |
| 913.67 | 75% | 2869 | medium |
| 917.47 | 88% | 3315 | medium |
| 920.98 | 95% | 3758 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 858 | 1.3% | 1069 | 1756 | 1972 | 776 | 529 | 1187 | high |
| 871 | 3.1% | 1285 | 1799 | 1972 | 1246 | 1056 | 1444 | high |
| 883 | 7.4% | 1583 | 1881 | 1972 | 1679 | 1543 | 1727 | high |
| 890 | 12.4% | 1765 | 1972 | 1972 | 1931 | 1827 | 1914 | high |
| 895 | 18.5% | 1929 | 2097 | 2143 | 2112 | 2029 | 2059 | high |
| 900 | 27.7% | 2102 | 2202 | 2201 | 2292 | 2232 | 2214 | high |
| 904 | 38.0% | 2260 | 2218 | 2266 | 2437 | 2394 | 2346 | high |
| 909 | 53.5% | 2471 | 2448 | 2424 | 2617 | 2597 | 2521 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 3 cutoff row(s); largest difference is 39% below paired-window at source cutoff 858. This may indicate target leaderboard population skew or sparse paired data.

## Polarized Hell Easy 40% Slower -> Plink Palace Easy Less Blinks

- Source leaderboard: 128775
- Target leaderboard: 184534
- Overlapping players: 2460 (5.3%)
- Correlation: 0.7922
- Log correlation: 0.7862
- Linear regression: target ~= 1.0508 * source + 432.20 (R^2 0.6276)
- Trimmed regression: target ~= 1.0699 * source + 395.07 (R^2 0.7043, n=2337)
- Log-log regression: log(target) ~= 0.8070 * log(source) + 1.7057 (R^2 0.6181, n=2460)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 1788 | 25% | 2516 | medium |
| 2117 | 50% | 2919 | medium |
| 2227 | 60% | 3059 | medium |
| 2409 | 75% | 3213 | medium |
| 2564 | 88% | 3387 | medium |
| 2660 | 95% | 3588 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 750 | 0.2% | 1310 | 2069 | 2292 | 1220 | 1197 | 1151 | high |
| 1100 | 2.0% | 1654 | 2069 | 2292 | 1588 | 1572 | 1567 | high |
| 1400 | 8.1% | 2093 | 2118 | 2292 | 1903 | 1893 | 1904 | high |
| 1600 | 15.2% | 2305 | 2246 | 2292 | 2114 | 2107 | 2120 | high |
| 1800 | 25.7% | 2530 | 2342 | 2341 | 2324 | 2321 | 2332 | high |
| 2000 | 39.6% | 2767 | 2484 | 2488 | 2534 | 2535 | 2539 | high |
| 2150 | 52.6% | 2946 | 2690 | 2699 | 2691 | 2695 | 2691 | high |
| 2500 | 80.3% | 3271 | 3117 | 3100 | 3059 | 3070 | 3040 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 2 cutoff row(s); largest difference is 37% below paired-window at source cutoff 750. This may indicate target leaderboard population skew or sparse paired data.

## Air Pure Intermediate Slower No UFO -> Air Pure Easier No UFO

- Source leaderboard: 128776
- Target leaderboard: 185405
- Overlapping players: 2424 (5.6%)
- Correlation: 0.8514
- Log correlation: 0.8487
- Linear regression: target ~= 0.6089 * source + 379.11 (R^2 0.7249)
- Trimmed regression: target ~= 0.6215 * source + 368.02 (R^2 0.7960, n=2303)
- Log-log regression: log(target) ~= 0.5823 * log(source) + 2.8714 (R^2 0.7203, n=2424)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 894.97 | 25% | 928 | medium |
| 908 | 50% | 937 | medium |
| 911.61 | 60% | 939 | medium |
| 916.84 | 75% | 942 | medium |
| 920.59 | 88% | 945 | medium |
| 924.75 | 95% | 948 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 860 | 3.6% | 907 | 913 | 920 | 903 | 903 | 903 | high |
| 874 | 7.8% | 915 | 916 | 920 | 911 | 911 | 912 | high |
| 886 | 15.0% | 923 | 920 | 920 | 919 | 919 | 919 | high |
| 893 | 22.2% | 927 | 923 | 923 | 923 | 923 | 923 | high |
| 901 | 34.5% | 932 | 926 | 926 | 928 | 928 | 928 | high |
| 907 | 47.2% | 936 | 931 | 931 | 931 | 932 | 931 | high |
| 911 | 58.1% | 939 | 933 | 933 | 934 | 934 | 934 | high |
| 916 | 71.3% | 941 | 938 | 938 | 937 | 937 | 937 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## Air Voltaic Easy Invincible 4 80% -> Air Voltaic Invincible 4 Easier

- Source leaderboard: 128781
- Target leaderboard: 185406
- Overlapping players: 2420 (5.3%)
- Correlation: 0.8573
- Log correlation: 0.8446
- Linear regression: target ~= 1.0861 * source + 306.40 (R^2 0.7350)
- Trimmed regression: target ~= 1.1099 * source + 231.23 (R^2 0.8103, n=2299)
- Log-log regression: log(target) ~= 0.8944 * log(source) + 1.0181 (R^2 0.7133, n=2420)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 2694 | 25% | 3501 | medium |
| 3078 | 50% | 4042 | medium |
| 3210 | 60% | 4211 | medium |
| 3428 | 75% | 4407 | medium |
| 3757 | 88% | 4650 | medium |
| 3862 | 95% | 4912 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 1100 | 0.1% | 1646 | 2838 | 3147 | 1501 | 1452 | 1454 | high |
| 1600 | 0.7% | 2111 | 2838 | 3147 | 2044 | 2007 | 2033 | high |
| 2100 | 4.5% | 2727 | 2842 | 3147 | 2587 | 2562 | 2592 | high |
| 2450 | 13.4% | 3169 | 3068 | 3147 | 2967 | 2950 | 2976 | high |
| 2800 | 30.9% | 3634 | 3339 | 3316 | 3348 | 3339 | 3353 | high |
| 3150 | 54.6% | 4140 | 3709 | 3705 | 3728 | 3727 | 3726 | high |
| 3400 | 72.9% | 4377 | 4033 | 4030 | 3999 | 4005 | 3989 | high |
| 3800 | 89.0% | 4680 | 4451 | 4447 | 4434 | 4449 | 4406 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 2 cutoff row(s); largest difference is 42% below paired-window at source cutoff 1100. This may indicate target leaderboard population skew or sparse paired data.

## voxTargetSwitch 2 Large -> voxTargetSwitch 2 Large

- Source leaderboard: 84880
- Target leaderboard: 84880
- Overlapping players: 49629 (100.0%)
- Correlation: 1.0000
- Log correlation: 1.0000
- Linear regression: target ~= 1.0000 * source + 0.00 (R^2 1.0000)
- Trimmed regression: target ~= 1.0000 * source + 0.00 (R^2 1.0000, n=47148)
- Log-log regression: log(target) ~= 1.0000 * log(source) + 0.0000 (R^2 1.0000, n=49627)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 93 | 25% | 93 | high |
| 105 | 50% | 105 | high |
| 109.39 | 60% | 109 | high |
| 115.89 | 75% | 116 | high |
| 123.10 | 88% | 123 | high |
| 126.20 | 95% | 126 | high |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 67 | 1.7% | 67 | 71 | 76 | 67 | 67 | 67 | high |
| 78 | 7.1% | 78 | 79 | 79 | 78 | 78 | 78 | high |
| 87 | 16.3% | 87 | 87 | 87 | 87 | 87 | 87 | high |
| 95 | 28.8% | 95 | 95 | 95 | 95 | 95 | 95 | high |
| 103 | 45.7% | 103 | 103 | 103 | 103 | 103 | 103 | high |
| 110 | 62.3% | 110 | 110 | 110 | 110 | 110 | 110 | high |
| 117 | 77.8% | 117 | 117 | 117 | 117 | 117 | 117 | high |
| 123 | 87.8% | 123 | 123 | 123 | 123 | 123 | 123 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## Pokeball Frenzy Auto TE Wide -> ww5t Voltaic Slightly Larger

- Source leaderboard: 783
- Target leaderboard: 185378
- Overlapping players: 2840 (3.9%)
- Correlation: 0.7976
- Log correlation: n/a
- Linear regression: target ~= 0.0290 * source + 36.26 (R^2 0.6362)
- Trimmed regression: target ~= 0.0289 * source + 36.06 (R^2 0.7283, n=2698)
- Log-log regression: log(target) ~= 0.6397 * log(source) + -0.3108 (R^2 0.5980, n=2839)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 2190 | 25% | 107 | low |
| 2610 | 50% | 120 | low |
| 2730 | 60% | 123 | low |
| 2940 | 75% | 129 | low |
| 3180 | 88% | 139 | low |
| 3450 | 95% | 149 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 650 | 0.1% | 36 | 96 | 99 | 55 | 55 | 46 | high |
| 950 | 0.1% | 54 | 96 | 99 | 64 | 64 | 59 | high |
| 1250 | 0.5% | 68 | 96 | 99 | 72 | 72 | 70 | high |
| 1500 | 2.3% | 81 | 96 | 99 | 80 | 79 | 79 | high |
| 1750 | 7.2% | 92 | 96 | 99 | 87 | 87 | 87 | high |
| 2000 | 15.7% | 101 | 99 | 99 | 94 | 94 | 95 | high |
| 2300 | 30.9% | 110 | 105 | 104 | 103 | 103 | 104 | high |
| 2700 | 58.4% | 123 | 116 | 114 | 114 | 114 | 115 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 4 cutoff row(s); largest difference is 63% below paired-window at source cutoff 650. This may indicate target leaderboard population skew or sparse paired data.

## 1w3ts reload Larger -> aimerz+ Static Switching 6 Bot Slightly Larger

- Source leaderboard: 128795
- Target leaderboard: 185407
- Overlapping players: 2566 (5.4%)
- Correlation: 0.8287
- Log correlation: 0.8186
- Linear regression: target ~= 0.9047 * source + 34.01 (R^2 0.6867)
- Trimmed regression: target ~= 0.9021 * source + 34.52 (R^2 0.7612, n=2438)
- Log-log regression: log(target) ~= 0.7282 * log(source) + 1.4702 (R^2 0.6700, n=2566)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 83 | 25% | 113 | medium |
| 93 | 50% | 125 | medium |
| 97 | 60% | 130 | medium |
| 103 | 75% | 133 | medium |
| 108 | 88% | 140 | medium |
| 115 | 95% | 149 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 36 | 0.1% | 64 | 100 | 105 | 67 | 67 | 59 | high |
| 50 | 0.4% | 71 | 100 | 105 | 79 | 80 | 75 | high |
| 54 | 0.6% | 76 | 100 | 105 | 83 | 83 | 79 | high |
| 58 | 1.2% | 81 | 100 | 105 | 86 | 87 | 84 | high |
| 70 | 6.8% | 98 | 103 | 105 | 97 | 98 | 96 | high |
| 82 | 24.6% | 113 | 110 | 110 | 108 | 108 | 108 | high |
| 92 | 49.2% | 125 | 119 | 119 | 117 | 118 | 117 | high |
| 102 | 73.4% | 133 | 129 | 129 | 126 | 127 | 126 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 4 cutoff row(s); largest difference is 36% below paired-window at source cutoff 36. This may indicate target leaderboard population skew or sparse paired data.

## beanTS Larger -> beanTS Larger

- Source leaderboard: 129353
- Target leaderboard: 129353
- Overlapping players: 49286 (100.0%)
- Correlation: 1.0000
- Log correlation: 1.0000
- Linear regression: target ~= 1.0000 * source + 0.00 (R^2 1.0000)
- Trimmed regression: target ~= 1.0000 * source + 0.00 (R^2 1.0000, n=46822)
- Log-log regression: log(target) ~= 1.0000 * log(source) + 0.0000 (R^2 1.0000, n=49284)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 102 | 25% | 102 | high |
| 116.05 | 50% | 116 | high |
| 121.20 | 60% | 121 | high |
| 129.80 | 75% | 130 | high |
| 141 | 88% | 141 | high |
| 144.50 | 95% | 145 | high |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 65 | 0.7% | 65 | 75 | 82 | 65 | 65 | 65 | high |
| 78 | 3.8% | 78 | 80 | 82 | 78 | 78 | 78 | high |
| 90 | 11.5% | 90 | 90 | 90 | 90 | 90 | 90 | high |
| 100 | 22.5% | 100 | 100 | 100 | 100 | 100 | 100 | high |
| 110 | 38.6% | 110 | 110 | 110 | 110 | 110 | 110 | high |
| 120 | 57.2% | 120 | 120 | 120 | 120 | 120 | 120 | high |
| 130 | 76.1% | 130 | 130 | 130 | 130 | 130 | 130 | high |
| 142 | 90.1% | 142 | 142 | 142 | 142 | 142 | 142 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## FloatTS Angelic Easy Larger -> 1w6ts reload v2 20% bigger

- Source leaderboard: 135509
- Target leaderboard: 21620
- Overlapping players: 2500 (5.6%)
- Correlation: 0.7891
- Log correlation: n/a
- Linear regression: target ~= 1.0990 * source + -6.56 (R^2 0.6226)
- Trimmed regression: target ~= 1.1111 * source + -8.24 (R^2 0.7179, n=2375)
- Log-log regression: log(target) ~= 1.0171 * log(source) + -0.0481 (R^2 0.6123, n=2499)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 87.25 | 25% | 96 | medium |
| 97.65 | 50% | 109 | medium |
| 101.40 | 60% | 114 | medium |
| 107 | 75% | 119 | medium |
| 112.05 | 88% | 128 | medium |
| 115.90 | 95% | 137 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 65 | 2.0% | 73 | 84 | 85 | 65 | 64 | 67 | high |
| 74 | 7.0% | 82 | 85 | 85 | 75 | 74 | 76 | high |
| 81 | 14.9% | 90 | 85 | 85 | 82 | 82 | 83 | high |
| 88 | 26.8% | 97 | 91 | 90 | 90 | 90 | 91 | high |
| 95 | 43.5% | 106 | 95 | 95 | 98 | 97 | 98 | high |
| 101 | 59.3% | 114 | 106 | 105 | 104 | 104 | 104 | high |
| 106 | 73.2% | 118 | 110 | 109 | 110 | 110 | 109 | high |
| 111 | 83.9% | 124 | 116 | 116 | 115 | 115 | 115 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## FloatTS Angelic Easy Larger -> StaticSwitchingVox

- Source leaderboard: 135509
- Target leaderboard: 15659
- Overlapping players: 3819 (8.6%)
- Correlation: 0.8205
- Log correlation: n/a
- Linear regression: target ~= 1.0278 * source + 13.47 (R^2 0.6732)
- Trimmed regression: target ~= 1.0485 * source + 12.03 (R^2 0.7883, n=3629)
- Log-log regression: log(target) ~= 0.8472 * log(source) + 0.8528 (R^2 0.6426, n=3818)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 87.25 | 25% | 99 | medium |
| 97.65 | 50% | 111 | medium |
| 101.40 | 60% | 116 | medium |
| 107 | 75% | 125 | medium |
| 112.05 | 88% | 134 | medium |
| 115.90 | 95% | 142 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 65 | 2.0% | 74 | 93 | 98 | 80 | 80 | 81 | high |
| 74 | 7.0% | 85 | 97 | 98 | 90 | 90 | 90 | high |
| 81 | 14.9% | 93 | 100 | 99 | 97 | 97 | 97 | high |
| 88 | 26.8% | 100 | 103 | 104 | 104 | 104 | 104 | high |
| 95 | 43.5% | 108 | 111 | 111 | 111 | 112 | 111 | high |
| 101 | 59.3% | 116 | 118 | 118 | 117 | 118 | 117 | high |
| 106 | 73.2% | 124 | 123 | 122 | 122 | 123 | 122 | high |
| 111 | 83.9% | 131 | 129 | 129 | 128 | 128 | 127 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 1 cutoff row(s); largest difference is 20% below paired-window at source cutoff 65. This may indicate target leaderboard population skew or sparse paired data.

## waldoTS Novice -> waldoTS Novice

- Source leaderboard: 113019
- Target leaderboard: 113019
- Overlapping players: 49808 (100.0%)
- Correlation: 1.0000
- Log correlation: 1.0000
- Linear regression: target ~= 1.0000 * source + 0.00 (R^2 1.0000)
- Trimmed regression: target ~= 1.0000 * source + 0.00 (R^2 1.0000, n=47318)
- Log-log regression: log(target) ~= 1.0000 * log(source) + 0.0000 (R^2 1.0000, n=49808)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 110.80 | 25% | 111 | high |
| 124.80 | 50% | 125 | high |
| 129.75 | 60% | 130 | high |
| 139 | 75% | 139 | high |
| 145.20 | 88% | 145 | high |
| 152.14 | 95% | 152 | high |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 65 | 0.3% | 65 | 83 | 90 | 65 | 65 | 65 | high |
| 78 | 1.5% | 78 | 84 | 90 | 78 | 78 | 78 | high |
| 90 | 5.4% | 90 | 91 | 91 | 90 | 90 | 90 | high |
| 100 | 12.2% | 100 | 100 | 100 | 100 | 100 | 100 | high |
| 110 | 23.5% | 110 | 110 | 110 | 110 | 110 | 110 | high |
| 120 | 41.2% | 120 | 120 | 120 | 120 | 120 | 120 | high |
| 130 | 60.3% | 130 | 130 | 130 | 130 | 130 | 130 | high |
| 140 | 76.4% | 140 | 140 | 140 | 140 | 140 | 140 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 1 cutoff row(s); largest difference is 21% below paired-window at source cutoff 65. This may indicate target leaderboard population skew or sparse paired data.

## devTS Goated NR Static 5Bot -> eth Pasu Micro Easier

- Source leaderboard: 125002
- Target leaderboard: 185394
- Overlapping players: 2331 (4.2%)
- Correlation: 0.7844
- Log correlation: n/a
- Linear regression: target ~= 1.8949 * source + -219.11 (R^2 0.6153)
- Trimmed regression: target ~= 1.8758 * source + -206.96 (R^2 0.6990, n=2215)
- Log-log regression: log(target) ~= 1.1691 * log(source) + -0.6553 (R^2 0.5891, n=2330)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 622 | 25% | 1012 | low |
| 688 | 50% | 1170 | low |
| 708 | 60% | 1232 | low |
| 744 | 75% | 1286 | low |
| 791 | 88% | 1372 | low |
| 831 | 95% | 1504 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 350 | 0.1% | 398 | 864 | 916 | 444 | 450 | 489 | high |
| 400 | 0.3% | 554 | 864 | 916 | 539 | 543 | 572 | high |
| 450 | 1.0% | 650 | 864 | 916 | 634 | 637 | 657 | high |
| 500 | 3.1% | 764 | 864 | 916 | 728 | 731 | 743 | high |
| 550 | 8.2% | 856 | 876 | 916 | 823 | 825 | 830 | high |
| 600 | 18.9% | 970 | 916 | 941 | 918 | 918 | 919 | high |
| 640 | 31.2% | 1056 | 1008 | 1006 | 994 | 994 | 991 | high |
| 680 | 46.4% | 1150 | 1056 | 1069 | 1069 | 1069 | 1064 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 3 cutoff row(s); largest difference is 54% below paired-window at source cutoff 350. This may indicate target leaderboard population skew or sparse paired data.

## waldoTS Novice -> 1w2ts reload smallflicks larger

- Source leaderboard: 113019
- Target leaderboard: 185518
- Overlapping players: 2861 (5.7%)
- Correlation: 0.8273
- Log correlation: 0.8078
- Linear regression: target ~= 0.7968 * source + 17.11 (R^2 0.6844)
- Trimmed regression: target ~= 0.8040 * source + 15.88 (R^2 0.7633, n=2718)
- Log-log regression: log(target) ~= 0.8193 * log(source) + 0.8049 (R^2 0.6525, n=2861)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 110.80 | 25% | 113 | medium |
| 124.80 | 50% | 126 | medium |
| 129.75 | 60% | 131 | medium |
| 139 | 75% | 136 | medium |
| 145.20 | 88% | 145 | medium |
| 152.14 | 95% | 156 | medium |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 65 | 0.3% | 68 | 94 | 100 | 69 | 68 | 68 | high |
| 78 | 1.5% | 85 | 94 | 100 | 79 | 79 | 79 | high |
| 90 | 5.4% | 94 | 96 | 100 | 89 | 88 | 89 | high |
| 100 | 12.2% | 103 | 100 | 100 | 97 | 96 | 97 | high |
| 110 | 23.5% | 112 | 103 | 104 | 105 | 104 | 105 | high |
| 120 | 41.2% | 122 | 112 | 112 | 113 | 112 | 113 | high |
| 130 | 60.3% | 131 | 120 | 119 | 121 | 120 | 121 | high |
| 140 | 76.4% | 137 | 131 | 130 | 129 | 128 | 128 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 1 cutoff row(s); largest difference is 28% below paired-window at source cutoff 65. This may indicate target leaderboard population skew or sparse paired data.

## domiSwitch Easy Slower -> domiSwitch Easier

- Source leaderboard: 128818
- Target leaderboard: 185428
- Overlapping players: 2165 (4.8%)
- Correlation: 0.8565
- Log correlation: 0.8478
- Linear regression: target ~= 0.8995 * source + 1665.39 (R^2 0.7336)
- Trimmed regression: target ~= 0.9111 * source + 1597.85 (R^2 0.8041, n=2057)
- Log-log regression: log(target) ~= 0.7394 * log(source) + 2.4301 (R^2 0.7188, n=2165)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 4860 | 25% | 6346 | low |
| 5564 | 50% | 7119 | low |
| 5820.80 | 60% | 7429 | low |
| 6291.20 | 75% | 7900 | low |
| 6565.60 | 88% | 8184 | low |
| 6896.80 | 95% | 8581 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 3200 | 2.4% | 4918 | 5474 | 5760 | 4544 | 4514 | 4438 | high |
| 3700 | 5.2% | 5339 | 5492 | 5760 | 4994 | 4969 | 4941 | high |
| 4200 | 10.7% | 5733 | 5617 | 5760 | 5443 | 5425 | 5427 | high |
| 4600 | 18.2% | 6084 | 5894 | 5817 | 5803 | 5789 | 5804 | high |
| 5000 | 28.9% | 6502 | 6148 | 6146 | 6163 | 6154 | 6173 | high |
| 5400 | 43.0% | 6931 | 6354 | 6394 | 6523 | 6518 | 6535 | high |
| 5800 | 59.1% | 7398 | 6586 | 6740 | 6882 | 6883 | 6889 | high |
| 6300 | 75.2% | 7902 | 7544 | 7536 | 7332 | 7338 | 7324 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## tamTargetSwitch Smooth Easy -> kinTS Voltaic Easy 85%

- Source leaderboard: 42505
- Target leaderboard: 185408
- Overlapping players: 2259 (4.0%)
- Correlation: 0.7951
- Log correlation: 0.7466
- Linear regression: target ~= 1.0847 * source + 36.98 (R^2 0.6322)
- Trimmed regression: target ~= 1.0848 * source + 37.03 (R^2 0.7105, n=2147)
- Log-log regression: log(target) ~= 0.3559 * log(source) + 3.0312 (R^2 0.5574, n=2259)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 19 | 25% | 60 | low |
| 25 | 50% | 68 | low |
| 27 | 60% | 71 | low |
| 30 | 75% | 75 | low |
| 34 | 88% | 78 | low |
| 36 | 95% | 82 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 7 | 3.4% | 48 | 53 | 56 | 45 | 45 | 41 | high |
| 11 | 8.0% | 53 | 53 | 56 | 49 | 49 | 49 | high |
| 15 | 15.2% | 57 | 57 | 56 | 53 | 53 | 54 | high |
| 18 | 23.0% | 60 | 60 | 58 | 57 | 57 | 58 | high |
| 21 | 33.4% | 63 | 62 | 61 | 60 | 60 | 61 | high |
| 24 | 46.4% | 67 | 64 | 64 | 63 | 63 | 64 | high |
| 26 | 56.0% | 69 | 64 | 65 | 65 | 65 | 66 | high |
| 28 | 66.4% | 73 | 69 | 69 | 67 | 67 | 68 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## domiSwitch Easy Slower -> B180T Voltaic Easy Slower

- Source leaderboard: 128818
- Target leaderboard: 185571
- Overlapping players: 2110 (4.7%)
- Correlation: 0.7890
- Log correlation: n/a
- Linear regression: target ~= 0.0110 * source + -2.78 (R^2 0.6225)
- Trimmed regression: target ~= 0.0114 * source + -4.60 (R^2 0.7249, n=2005)
- Log-log regression: log(target) ~= 1.0330 * log(source) + -4.8444 (R^2 0.6245, n=2108)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 4860 | 25% | 54 | low |
| 5564 | 50% | 64 | low |
| 5820.80 | 60% | 68 | low |
| 6291.20 | 75% | 75 | low |
| 6565.60 | 88% | 78 | low |
| 6896.80 | 95% | 83 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 3200 | 2.4% | 37 | 43 | 47 | 32 | 32 | 33 | high |
| 3700 | 5.2% | 41 | 44 | 47 | 38 | 37 | 38 | high |
| 4200 | 10.7% | 46 | 45 | 47 | 44 | 43 | 44 | high |
| 4600 | 18.2% | 51 | 48 | 48 | 48 | 48 | 48 | high |
| 5000 | 28.9% | 55 | 52 | 52 | 52 | 52 | 52 | high |
| 5400 | 43.0% | 61 | 56 | 55 | 57 | 57 | 56 | high |
| 5800 | 59.1% | 68 | 57 | 59 | 61 | 61 | 61 | high |
| 6300 | 75.2% | 75 | 68 | 68 | 67 | 67 | 66 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 2 cutoff row(s); largest difference is 18% above paired-window at source cutoff 5800. This may indicate target leaderboard population skew or sparse paired data.

## 1w3ts Pasu Perfected Micro Goated Larger 80% -> 1w3ts Pasu Perfected Micro Goated Larger 80%

- Source leaderboard: 128920
- Target leaderboard: 128920
- Overlapping players: 44413 (100.0%)
- Correlation: 1.0000
- Log correlation: 1.0000
- Linear regression: target ~= 1.0000 * source + 0.00 (R^2 1.0000)
- Trimmed regression: target ~= 1.0000 * source + 0.00 (R^2 1.0000, n=42193)
- Log-log regression: log(target) ~= 1.0000 * log(source) + 0.0000 (R^2 1.0000, n=44408)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 930 | 25% | 930 | high |
| 1078 | 50% | 1078 | high |
| 1130 | 60% | 1130 | high |
| 1222 | 75% | 1222 | high |
| 1322 | 88% | 1322 | high |
| 1386 | 95% | 1386 | high |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 600 | 1.4% | 602 | 664 | 728 | 600 | 600 | 600 | high |
| 700 | 4.1% | 702 | 716 | 728 | 700 | 700 | 700 | high |
| 800 | 10.3% | 802 | 804 | 804 | 800 | 800 | 800 | high |
| 900 | 20.7% | 902 | 902 | 904 | 900 | 900 | 900 | high |
| 1000 | 35.9% | 1002 | 1002 | 1002 | 1000 | 1000 | 1000 | high |
| 1100 | 53.6% | 1102 | 1102 | 1100 | 1100 | 1100 | 1100 | high |
| 1200 | 71.5% | 1202 | 1202 | 1199 | 1200 | 1200 | 1200 | high |
| 1300 | 83.3% | 1300 | 1304 | 1299 | 1300 | 1300 | 1300 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## 1wall5targets_pasu slow -> Pasu Voltaic Reload Easier

- Source leaderboard: 544
- Target leaderboard: 185636
- Overlapping players: 2203 (1.7%)
- Correlation: 0.8324
- Log correlation: 0.7464
- Linear regression: target ~= 0.6702 * source + -4.41 (R^2 0.6929)
- Trimmed regression: target ~= 0.6830 * source + -6.35 (R^2 0.7927, n=2093)
- Log-log regression: log(target) ~= 1.0297 * log(source) + -0.6054 (R^2 0.5571, n=2203)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 93 | 25% | 73 | low |
| 110 | 50% | 87 | low |
| 117 | 60% | 92 | low |
| 127 | 75% | 97 | low |
| 139 | 88% | 106 | low |
| 151 | 95% | 115 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 76 | 9.7% | 60 | 55 | 62 | 47 | 46 | 47 | high |
| 88 | 19.7% | 70 | 58 | 62 | 55 | 54 | 55 | high |
| 100 | 34.8% | 79 | 64 | 64 | 63 | 62 | 63 | high |
| 110 | 50.1% | 87 | 69 | 70 | 69 | 69 | 69 | high |
| 120 | 66.0% | 94 | 79 | 78 | 76 | 76 | 76 | high |
| 130 | 79.2% | 99 | 83 | 84 | 83 | 82 | 82 | high |
| 140 | 88.8% | 107 | 89 | 89 | 89 | 89 | 89 | high |
| 150 | 94.4% | 114 | 96 | 96 | 96 | 96 | 95 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 7 cutoff row(s); largest difference is 26% above paired-window at source cutoff 110. This may indicate target leaderboard population skew or sparse paired data.

## B180 Voltaic Easy 92% -> VT Bounceshot Viscose Easier

- Source leaderboard: 12018
- Target leaderboard: 185392
- Overlapping players: 2040 (4.6%)
- Correlation: 0.8706
- Log correlation: 0.8571
- Linear regression: target ~= 9.7070 * source + 37.66 (R^2 0.7579)
- Trimmed regression: target ~= 9.7492 * source + 33.72 (R^2 0.8144, n=1938)
- Log-log regression: log(target) ~= 0.9107 * log(source) + 2.7051 (R^2 0.7346, n=2040)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 54 | 25% | 650 | low |
| 67 | 50% | 790 | low |
| 72 | 60% | 850 | low |
| 80 | 75% | 910 | low |
| 88 | 88% | 990 | low |
| 93 | 95% | 1090 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 26 | 1.5% | 330 | 480 | 520 | 290 | 287 | 291 | high |
| 38 | 7.0% | 470 | 490 | 520 | 407 | 404 | 411 | high |
| 50 | 20.1% | 610 | 530 | 531 | 523 | 521 | 527 | high |
| 58 | 32.8% | 700 | 625 | 620 | 601 | 599 | 604 | high |
| 65 | 46.5% | 770 | 665 | 665 | 669 | 667 | 669 | high |
| 72 | 60.7% | 860 | 760 | 750 | 737 | 736 | 735 | high |
| 78 | 72.9% | 900 | 805 | 788 | 795 | 794 | 790 | high |
| 87 | 86.3% | 980 | 905 | 905 | 882 | 882 | 873 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 3 cutoff row(s); largest difference is 31% below paired-window at source cutoff 26. This may indicate target leaderboard population skew or sparse paired data.

## Controlsphere Click Easy -> CatClick Easier

- Source leaderboard: 89547
- Target leaderboard: 184866
- Overlapping players: 1981 (4.7%)
- Correlation: 0.7980
- Log correlation: n/a
- Linear regression: target ~= 1.1818 * source + 9.41 (R^2 0.6368)
- Trimmed regression: target ~= 1.1998 * source + 8.55 (R^2 0.7217, n=1882)
- Log-log regression: log(target) ~= 0.8169 * log(source) + 1.0266 (R^2 0.5823, n=1980)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 38 | 25% | 59 | low |
| 47 | 50% | 73 | low |
| 51 | 60% | 78 | low |
| 56 | 75% | 84 | low |
| 60 | 88% | 92 | low |
| 66 | 95% | 102 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 15 | 1.0% | 28 | 45 | 51 | 27 | 27 | 26 | high |
| 21 | 3.1% | 37 | 45 | 51 | 34 | 34 | 34 | high |
| 27 | 7.5% | 44 | 45 | 51 | 41 | 41 | 41 | high |
| 33 | 15.6% | 53 | 50 | 51 | 48 | 48 | 49 | high |
| 39 | 28.1% | 60 | 56 | 55 | 56 | 55 | 56 | high |
| 45 | 44.0% | 70 | 64 | 63 | 63 | 63 | 63 | high |
| 50 | 59.3% | 78 | 70 | 68 | 69 | 69 | 68 | high |
| 55 | 73.5% | 83 | 80 | 80 | 74 | 75 | 74 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 2 cutoff row(s); largest difference is 37% below paired-window at source cutoff 15. This may indicate target leaderboard population skew or sparse paired data.

## Popcorn MV Novice -> Popcorn MV Easier

- Source leaderboard: 76965
- Target leaderboard: 185398
- Overlapping players: 1904 (4.5%)
- Correlation: 0.8177
- Log correlation: 0.7829
- Linear regression: target ~= 0.9856 * source + 78.26 (R^2 0.6686)
- Trimmed regression: target ~= 0.9938 * source + 72.67 (R^2 0.7386, n=1809)
- Log-log regression: log(target) ~= 0.7690 * log(source) + 1.5309 (R^2 0.6129, n=1904)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 190 | 25% | 300 | low |
| 270 | 50% | 390 | low |
| 290 | 60% | 420 | low |
| 330 | 75% | 460 | low |
| 370 | 88% | 520 | low |
| 410 | 95% | 570 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 50 | 0.9% | 120 | 200 | 240 | 128 | 122 | 94 | high |
| 100 | 5.0% | 190 | 200 | 240 | 177 | 172 | 160 | high |
| 150 | 14.3% | 260 | 230 | 240 | 226 | 222 | 218 | high |
| 190 | 25.2% | 310 | 280 | 270 | 266 | 262 | 261 | high |
| 230 | 39.1% | 350 | 305 | 300 | 305 | 301 | 303 | high |
| 270 | 53.6% | 400 | 350 | 350 | 344 | 341 | 343 | high |
| 300 | 64.8% | 430 | 380 | 380 | 374 | 371 | 371 | high |
| 330 | 76.1% | 460 | 450 | 450 | 403 | 401 | 400 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 1 cutoff row(s); largest difference is 40% below paired-window at source cutoff 50. This may indicate target leaderboard population skew or sparse paired data.

## Pasu Angelic 20% Larger 80% Speed -> skyClick Goated Easier

- Source leaderboard: 129352
- Target leaderboard: 185490
- Overlapping players: 1984 (4.6%)
- Correlation: 0.8424
- Log correlation: 0.8295
- Linear regression: target ~= 0.9800 * source + 25.15 (R^2 0.7097)
- Trimmed regression: target ~= 0.9792 * source + 24.86 (R^2 0.7829, n=1885)
- Log-log regression: log(target) ~= 0.7379 * log(source) + 1.4086 (R^2 0.6881, n=1984)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 66 | 25% | 98 | low |
| 79 | 50% | 112 | low |
| 84 | 60% | 117 | low |
| 91 | 75% | 123 | low |
| 98 | 88% | 132 | low |
| 103 | 95% | 143 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 51 | 6.8% | 81 | 81 | 87 | 75 | 75 | 74 | high |
| 58 | 13.6% | 90 | 85 | 87 | 82 | 82 | 82 | high |
| 65 | 23.7% | 97 | 90 | 89 | 89 | 89 | 89 | high |
| 72 | 36.4% | 104 | 99 | 98 | 96 | 95 | 96 | high |
| 78 | 49.3% | 111 | 101 | 102 | 102 | 101 | 102 | high |
| 84 | 62.4% | 118 | 109 | 107 | 107 | 107 | 108 | high |
| 90 | 75.0% | 123 | 115 | 114 | 113 | 113 | 113 | high |
| 97 | 85.7% | 129 | 122 | 122 | 120 | 120 | 120 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.

## 1w2ts Pasu Perfected Easy -> psalmTS Viscose Click Easier

- Source leaderboard: 57757
- Target leaderboard: 185609
- Overlapping players: 1905 (3.7%)
- Correlation: 0.8340
- Log correlation: 0.8195
- Linear regression: target ~= 0.9512 * source + -22.50 (R^2 0.6955)
- Trimmed regression: target ~= 0.9623 * source + -23.40 (R^2 0.7663, n=1810)
- Log-log regression: log(target) ~= 1.3084 * log(source) + -1.7519 (R^2 0.6716, n=1905)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 83 | 25% | 62 | low |
| 94 | 50% | 74 | low |
| 98 | 60% | 79 | low |
| 104 | 75% | 85 | low |
| 111 | 88% | 92 | low |
| 115 | 95% | 100 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 58 | 1.3% | 35 | 51 | 55 | 33 | 32 | 35 | high |
| 69 | 5.8% | 47 | 52 | 55 | 43 | 43 | 44 | high |
| 80 | 19.5% | 59 | 57 | 56 | 54 | 54 | 54 | high |
| 87 | 34.1% | 67 | 61 | 60 | 60 | 60 | 60 | high |
| 93 | 49.4% | 74 | 66 | 65 | 66 | 66 | 65 | high |
| 99 | 64.7% | 82 | 76 | 75 | 72 | 72 | 71 | high |
| 105 | 78.1% | 86 | 78 | 76 | 77 | 78 | 77 | high |
| 110 | 87.0% | 91 | 88 | 88 | 82 | 82 | 81 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 1 cutoff row(s); largest difference is 31% below paired-window at source cutoff 58. This may indicate target leaderboard population skew or sparse paired data.

## Floating Heads Timing 400% Larger -> VT Floating Heads Viscose Easier

- Source leaderboard: 1607
- Target leaderboard: 185409
- Overlapping players: 1182 (2.2%)
- Correlation: 0.7675
- Log correlation: 0.7594
- Linear regression: target ~= 0.2790 * source + 17.49 (R^2 0.5890)
- Trimmed regression: target ~= 0.2856 * source + -2.43 (R^2 0.6545, n=1123)
- Log-log regression: log(target) ~= 1.0072 * log(source) + -1.3265 (R^2 0.5767, n=1182)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 2520 | 25% | 741 | low |
| 2844 | 50% | 879 | low |
| 2988 | 60% | 943 | low |
| 3204 | 75% | 1060 | low |
| 3528 | 88% | 1120 | low |
| 3816 | 95% | 1211 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 400 | 0.0% | 256 | 579 | 684 | 129 | 112 | 111 | high |
| 700 | 0.0% | 256 | 579 | 684 | 213 | 197 | 195 | high |
| 1000 | 0.0% | 256 | 579 | 684 | 296 | 283 | 279 | high |
| 1350 | 0.2% | 320 | 579 | 684 | 394 | 383 | 377 | high |
| 1700 | 1.4% | 428 | 579 | 684 | 492 | 483 | 476 | high |
| 2050 | 5.6% | 550 | 586 | 684 | 589 | 583 | 575 | high |
| 2400 | 18.3% | 696 | 689 | 698 | 687 | 683 | 674 | high |
| 2750 | 40.3% | 823 | 803 | 851 | 785 | 783 | 773 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 5 cutoff row(s); largest difference is 56% below paired-window at source cutoff 400. This may indicate target leaderboard population skew or sparse paired data.

## voxTargetSwitch Click -> VoxTS Click Easier

- Source leaderboard: 653
- Target leaderboard: 136076
- Overlapping players: 2012 (2.4%)
- Correlation: 0.8521
- Log correlation: 0.8406
- Linear regression: target ~= 1.0403 * source + 4.25 (R^2 0.7261)
- Trimmed regression: target ~= 1.0589 * source + 2.57 (R^2 0.7975, n=1912)
- Log-log regression: log(target) ~= 0.9275 * log(source) + 0.4060 (R^2 0.7066, n=2012)

### Percentile Mapping

| Source score | Source percentile | Equivalent target score | Confidence |
| ---: | ---: | ---: | :--- |
| 67 | 25% | 84 | low |
| 78 | 50% | 97 | low |
| 82 | 60% | 103 | low |
| 89 | 75% | 110 | low |
| 96 | 88% | 116 | low |
| 102 | 95% | 125 | low |

### Configured Cutoffs

| Source cutoff | Source percentile | Global target | Paired target | Monotonic target | Linear target | Trimmed target | Log target | Confidence |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 49 | 4.3% | 63 | 69 | 75 | 55 | 54 | 55 | high |
| 59 | 12.9% | 75 | 70 | 75 | 66 | 65 | 66 | high |
| 67 | 26.1% | 84 | 77 | 77 | 74 | 74 | 74 | high |
| 74 | 41.7% | 93 | 83 | 82 | 81 | 81 | 81 | high |
| 81 | 59.3% | 103 | 88 | 89 | 89 | 88 | 88 | high |
| 88 | 75.0% | 110 | 99 | 97 | 96 | 96 | 95 | high |
| 94 | 85.5% | 114 | 106 | 104 | 102 | 102 | 102 | high |
| 100 | 92.5% | 120 | 114 | 114 | 108 | 108 | 107 | high |

### Warnings

- Trimmed regression excludes the largest 5% residual outliers from the initial linear model.
- Global percentile cutoff estimates differ from paired-window estimates by at least 15% on 1 cutoff row(s); largest difference is 17% above paired-window at source cutoff 81. This may indicate target leaderboard population skew or sparse paired data.
