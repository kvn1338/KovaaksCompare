export const KOVAAKS_API_CONFIG = {
  baseUrl: "https://kovaaks.com",
  requestDelayMs: 500,
  maxRequestDelayMs: 15000,
  maxRetries: 6,
  leaderboardPageSize: 100,
  userScenarioPageSize: 100,
  accountSearchPageSize: 20,
  playerScanMaxPages: 20,
  retryBaseDelayMs: 1500,
  retryJitterMs: 500,
  retryableStatusCodes: [408, 429] as readonly number[],
  adaptiveDelayIncreaseStepMs: 500,
  adaptiveDelayIncreaseMultiplier: 1.8,
  adaptiveDelayRelaxMultiplier: 0.85,
} as const;

export const COLLECTION_CONFIG = {
  requestDelayMs: 750,
  sampleRateMinPages: 50,
} as const;

export const REPORT_CONFIG = {
  leaderboardComparePercentiles: "25,50,60,75,88,95",
  calibrationReportPercentiles: "25,50,60,75,88,95",
  legacyCalibrationReportPercentiles: "50,60,75,88,95",
} as const;

export const PATH_CONFIG = {
  benchmarkIndex: "configs/benchmark-index.json",
  benchmarks: "configs/benchmarks.json",
  evxlBenchmarks: "data/evxl-benchmarks.json",
  database: "data/kovaaks-compare.sqlite",
} as const;

export const EVXL_CATALOG_CONFIG = {
  sourceUrl: "https://evxl.app/data/benchmarks",
  cachePath: PATH_CONFIG.evxlBenchmarks,
  maxAgeHours: 48,
} as const;
