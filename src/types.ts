export type ScoreMode = { type: "best" };

export interface ScenarioSearchResult {
  leaderboardId: string;
  scenarioName: string;
  rank?: number;
  plays?: number;
  entries?: number;
  topScore?: number;
  authors?: string[];
  aimType?: string | null;
}

export interface LeaderboardScore {
  playerId: string;
  steamId?: string;
  username?: string;
  webappUsername?: string | null;
  score: number;
  rank?: number;
  runTimestamp?: string;
}

export interface LeaderboardPage {
  leaderboardId: string;
  page: number;
  max: number;
  total: number;
  scores: LeaderboardScore[];
}

export interface PlayerScenarioScore extends LeaderboardScore {
  leaderboardId: string;
}

export interface ResolvedScenario {
  input: string;
  leaderboardId: string;
  scenarioName: string;
  ambiguous: boolean;
  alternatives: ScenarioSearchResult[];
}

export interface BenchmarkSummary {
  benchmarkId: string;
  benchmarkName: string;
}

export interface BenchmarkScenario {
  scenarioId: string;
  scenarioName: string;
  leaderboardId: string;
  rankMaxes: Record<string, number>;
  category?: string;
}

export interface BenchmarkPlayerScenarioProgress extends BenchmarkScenario {
  score?: number;
  rank?: number;
  percentile?: number;
}

export interface ScoreResult {
  score: number | null;
  rank?: number;
  percentile?: number;
  warnings: string[];
}

export interface ScenarioPairComparison {
  source: ResolvedScenario;
  target: ResolvedScenario;
  sourceScore: ScoreResult;
  targetScore: ScoreResult;
  equivalentTargetScore?: number;
  interpretation: string[];
  warnings: string[];
}
