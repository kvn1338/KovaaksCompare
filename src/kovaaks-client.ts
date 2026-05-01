import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { z } from "zod";
import type {
  BenchmarkScenario,
  BenchmarkSummary,
  LeaderboardPage,
  PlayerScenarioScore,
  ScenarioSearchResult,
} from "./types.js";
import { KOVAAKS_API_CONFIG } from "./config.js";

const nullableString = z.string().nullable().optional();

const scenarioSearchSchema = z.object({
  page: z.number(),
  max: z.number(),
  total: z.number(),
  data: z.array(
    z.object({
      rank: z.number().optional(),
      leaderboardId: z.union([z.number(), z.string()]),
      scenarioName: z.string(),
      counts: z
        .object({
          plays: z.number().optional(),
          entries: z.number().optional(),
        })
        .optional(),
      topScore: z.object({ score: z.number() }).optional(),
      scenario: z
        .object({
          aimType: z.string().nullable().optional(),
          authors: z.array(z.string()).optional(),
        })
        .optional(),
    }),
  ),
});

const leaderboardPageSchema = z.object({
  page: z.number(),
  max: z.number(),
  total: z.number(),
  data: z.array(
    z.object({
      steamId: nullableString,
      score: z.number(),
      rank: z.number().optional(),
      steamAccountName: nullableString,
      webappUsername: nullableString,
      attributes: z.record(z.string(), z.unknown()).optional(),
    }),
  ),
});

const userScenarioPageSchema = z.object({
  page: z.number(),
  max: z.number(),
  total: z.number(),
  data: z.array(
    z.object({
      leaderboardId: z.union([z.string(), z.number()]),
      scenarioName: z.string(),
      rank: z.number().optional(),
      score: z.number(),
      attributes: z.record(z.string(), z.unknown()).optional(),
    }),
  ),
});

const accountNameSearchSchema = z.array(
  z.object({
    steamId: nullableString,
    username: nullableString,
    steamAccountName: nullableString,
  }),
);

const genericPagedDataSchema = z.object({
  page: z.number().optional(),
  max: z.number().optional(),
  total: z.number().optional(),
  data: z.array(z.record(z.string(), z.unknown())).default([]),
}).passthrough();

interface KovaaksClientOptions {
  baseUrl?: string;
  cacheDir?: string;
  refresh?: boolean;
  debug?: boolean;
  requestDelayMs?: number;
  maxRequestDelayMs?: number;
  maxRetries?: number;
}

interface PlayerIdentity {
  primaryPlayerId: string;
  steamId?: string;
  matchAliases: string[];
  usernameSearchTerms: string[];
  directUsernames: string[];
}

export class KovaaksClient {
  private readonly baseUrl: string;
  private readonly cacheDir: string;
  private readonly refresh: boolean;
  private readonly debug: boolean;
  private readonly minRequestDelayMs: number;
  private readonly maxRequestDelayMs: number;
  private readonly maxRetries: number;
  private currentRequestDelayMs: number;
  private lastRequestAt = 0;
  private readonly playerIdentityCache = new Map<string, PlayerIdentity>();

  constructor(options: KovaaksClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? KOVAAKS_API_CONFIG.baseUrl;
    this.cacheDir = options.cacheDir ?? ".cache/kovaaks";
    this.refresh = options.refresh ?? false;
    this.debug = options.debug ?? false;
    this.minRequestDelayMs = options.requestDelayMs ?? KOVAAKS_API_CONFIG.requestDelayMs;
    this.maxRequestDelayMs = options.maxRequestDelayMs ?? KOVAAKS_API_CONFIG.maxRequestDelayMs;
    this.currentRequestDelayMs = this.minRequestDelayMs;
    this.maxRetries = options.maxRetries ?? KOVAAKS_API_CONFIG.maxRetries;
  }

  async searchScenarios(query: string): Promise<ScenarioSearchResult[]> {
    const json = await this.getJson(
      "/webapp-backend/scenario/popular",
      { scenarioNameSearch: query, page: 0, max: 10 },
      `scenario-search-${query}`,
    );
    if (json === null) {
      throw new Error(`KovaaK's API returned no scenario search data for "${query}".`);
    }
    const parsed = scenarioSearchSchema.parse(json);
    return parsed.data.map((item) => ({
      leaderboardId: String(item.leaderboardId),
      scenarioName: item.scenarioName,
      rank: item.rank,
      plays: item.counts?.plays,
      entries: item.counts?.entries,
      topScore: item.topScore?.score,
      authors: item.scenario?.authors,
      aimType: item.scenario?.aimType,
    }));
  }

  async getLeaderboardScores(params: {
    leaderboardId: string;
    page?: number;
    max?: number;
    usernameSearch?: string;
  }): Promise<LeaderboardPage> {
    const page = params.page ?? 0;
    const max = params.max ?? KOVAAKS_API_CONFIG.leaderboardPageSize;
    const json = await this.getJson(
      "/webapp-backend/leaderboard/scores/global",
      { leaderboardId: params.leaderboardId, page, max, usernameSearch: params.usernameSearch },
      `leaderboard-${params.leaderboardId}-${page}-${max}-${params.usernameSearch ?? "all"}`,
    );
    if (json === null) {
      throw new Error(`KovaaK's API returned no leaderboard data for ${params.leaderboardId}.`);
    }
    const parsed = leaderboardPageSchema.parse(json);
    return {
      leaderboardId: params.leaderboardId,
      page: parsed.page,
      max: parsed.max,
      total: parsed.total,
      scores: parsed.data.map((score) => ({
        playerId: score.steamId ?? score.webappUsername ?? score.steamAccountName ?? "",
        steamId: score.steamId ?? undefined,
        username: score.steamAccountName ?? undefined,
        webappUsername: score.webappUsername ?? undefined,
        score: score.score,
        rank: score.rank,
        runTimestamp: normalizeEpoch(score.attributes?.epoch),
      })),
    };
  }

  async getPlayerBestScore(params: {
    leaderboardId: string;
    player: string;
    maxPages?: number;
    scenarioName?: string;
  }): Promise<PlayerScenarioScore | null> {
    const playerIdentity = await this.resolvePlayerIdentity(params.player);

    for (const searchTerm of playerIdentity.usernameSearchTerms) {
      const leaderboard = await this.getLeaderboardScores({
        leaderboardId: params.leaderboardId,
        page: 0,
        max: KOVAAKS_API_CONFIG.accountSearchPageSize,
        usernameSearch: searchTerm,
      });
      const score = leaderboard.scores.find((entry) => playerMatches(entry, playerIdentity));
      if (score) {
        this.rememberPlayerIdentity(params.player, score);
        return { ...score, leaderboardId: params.leaderboardId };
      }
    }

    const fromUserScenarioList = await this.getPlayerBestFromUserScenarioList(params, playerIdentity);
    if (fromUserScenarioList) {
      this.rememberPlayerIdentity(params.player, fromUserScenarioList);
      return fromUserScenarioList;
    }

    const maxPages = params.maxPages ?? KOVAAKS_API_CONFIG.playerScanMaxPages;
    for (let page = 0; page < maxPages; page += 1) {
      const leaderboard = await this.getLeaderboardScores({
        leaderboardId: params.leaderboardId,
        page,
        max: KOVAAKS_API_CONFIG.leaderboardPageSize,
      });
      const score = leaderboard.scores.find((entry) => playerMatches(entry, playerIdentity));
      if (score) {
        this.rememberPlayerIdentity(params.player, score);
        return { ...score, leaderboardId: params.leaderboardId };
      }
      if ((page + 1) * leaderboard.max >= leaderboard.total) {
        break;
      }
    }

    return null;
  }

  async getBenchmarkSummariesForPlayer(params: {
    username?: string;
    pageSize?: number;
  } = {}): Promise<BenchmarkSummary[]> {
    const username = params.username ?? "KovaaksCompare";
    const max = params.pageSize ?? 300;
    const all: BenchmarkSummary[] = [];
    for (let page = 0; ; page += 1) {
      const json = await this.getJson(
        "/webapp-backend/benchmarks/player-progress-rank",
        { username, page, max },
        `benchmark-progress-rank-${username}-${page}-${max}`,
      );
      if (json === null) {
        throw new Error(`KovaaK's API returned no benchmark list data for ${username}.`);
      }
      const parsed = genericPagedDataSchema.parse(json);
      const summaries = parsed.data
        .map(extractBenchmarkSummary)
        .filter((benchmark): benchmark is BenchmarkSummary => benchmark !== null);
      all.push(...summaries);
      const total = parsed.total ?? 0;
      if (summaries.length === 0 || (page + 1) * max >= total) {
        break;
      }
    }
    return all;
  }

  async getBenchmarkScenarios(params: {
    benchmarkId: string;
    steamId: string;
    page?: number;
    max?: number;
  }): Promise<BenchmarkScenario[]> {
    const page = params.page ?? 0;
    const max = params.max ?? 100;
    const json = await this.getJson(
      "/webapp-backend/benchmarks/player-progress-rank-benchmark",
      { benchmarkId: params.benchmarkId, steamId: params.steamId, page, max },
      `benchmark-scenarios-${params.benchmarkId}-${params.steamId}-${page}-${max}`,
    );
    if (json === null) {
      throw new Error(`KovaaK's API returned no benchmark scenario data for benchmark ${params.benchmarkId}.`);
    }
    const parsed = genericPagedDataSchema.safeParse(json);
    const dataScenarios = parsed.success
      ? parsed.data.data
        .map(extractBenchmarkScenario)
        .filter((scenario): scenario is BenchmarkScenario => scenario !== null)
      : [];
    return uniqueBenchmarkScenarios([
      ...dataScenarios,
      ...extractBenchmarkScenariosFromCategories(json),
    ]);
  }

  private async getPlayerBestFromUserScenarioList(params: {
    leaderboardId: string;
    player: string;
    scenarioName?: string;
  }, identity: PlayerIdentity): Promise<PlayerScenarioScore | null> {
    const searchTerms = identity.directUsernames.filter((term) => !isSteamId(term));

    for (const username of searchTerms) {
      for (let page = 0; page < KOVAAKS_API_CONFIG.playerScanMaxPages; page += 1) {
        const json = await this.getJson(
          "/webapp-backend/user/scenario/total-play",
          { username, page, max: KOVAAKS_API_CONFIG.userScenarioPageSize, "sort_param[]": "count" },
          `user-scenarios-${username}-${page}`,
        );
        if (json === null) {
          break;
        }
        const parsed = userScenarioPageSchema.parse(json);
        const match = parsed.data.find((entry) => String(entry.leaderboardId) === params.leaderboardId);
        if (match) {
          return {
            leaderboardId: params.leaderboardId,
            playerId: identity.primaryPlayerId,
            steamId: identity.steamId,
            username,
            webappUsername: username,
            score: match.score,
            rank: match.rank,
            runTimestamp: normalizeEpoch(match.attributes?.epoch),
          };
        }
        if ((page + 1) * parsed.max >= parsed.total) {
          break;
        }
      }
    }
    return null;
  }

  private async resolvePlayerIdentity(player: string): Promise<PlayerIdentity> {
    const cached = this.playerIdentityCache.get(player);
    if (cached) return cached;

    const matchAliases = new Set([player]);
    const usernameSearchTerms = new Set([player]);
    const directUsernames = new Set<string>();
    if (isSteamId(player)) {
      const identity = {
        primaryPlayerId: player,
        steamId: player,
        matchAliases: [...matchAliases],
        usernameSearchTerms: [] as string[],
        directUsernames: [] as string[],
      };
      this.playerIdentityCache.set(player, identity);
      return identity;
    }

    const steamVanity = steamVanityFromInput(player);
    let resolvedSteamId: string | undefined;
    if (steamVanity) {
      const steamProfile = await this.resolveSteamVanity(steamVanity);
      if (steamProfile?.steamId64) {
        resolvedSteamId = steamProfile.steamId64;
        matchAliases.add(steamProfile.steamId64);
      }
      if (steamProfile?.displayName) {
        usernameSearchTerms.add(steamProfile.displayName);
      }
    }

    const accountMatches = await this.searchAccountNames(player);
    for (const account of accountMatches.slice(0, 5)) {
      const steamMatches = !resolvedSteamId || account.steamId === resolvedSteamId;
      if (account.steamId) matchAliases.add(account.steamId);
      if (account.username) {
        matchAliases.add(account.username);
        usernameSearchTerms.add(account.username);
        if (steamMatches) {
          directUsernames.add(account.username);
        }
      }
      if (account.steamAccountName) {
        matchAliases.add(account.steamAccountName);
        usernameSearchTerms.add(account.steamAccountName);
      }
    }
    if (!resolvedSteamId && accountMatches.length === 0) {
      directUsernames.add(player);
    }

    const identity = {
      primaryPlayerId: [...matchAliases].find(isSteamId) ?? player,
      steamId: [...matchAliases].find(isSteamId),
      matchAliases: [...matchAliases],
      usernameSearchTerms: [...usernameSearchTerms],
      directUsernames: [...directUsernames],
    };
    this.playerIdentityCache.set(player, identity);
    return identity;
  }

  private rememberPlayerIdentity(player: string, score: {
    playerId?: string;
    steamId?: string;
    username?: string;
    webappUsername?: string | null;
  }): void {
    const existing = this.playerIdentityCache.get(player);
    const matchAliases = new Set(existing?.matchAliases ?? [player]);
    const usernameSearchTerms = new Set(existing?.usernameSearchTerms ?? [player]);
    const directUsernames = new Set(existing?.directUsernames ?? []);

    if (score.playerId) matchAliases.add(score.playerId);
    if (score.steamId) matchAliases.add(score.steamId);
    if (score.username) {
      usernameSearchTerms.add(score.username);
    }
    if (score.webappUsername) {
      matchAliases.add(score.webappUsername);
      usernameSearchTerms.add(score.webappUsername);
      directUsernames.add(score.webappUsername);
    }

    this.playerIdentityCache.set(player, {
      primaryPlayerId: score.steamId ?? existing?.primaryPlayerId ?? player,
      steamId: score.steamId ?? existing?.steamId,
      matchAliases: [...matchAliases],
      usernameSearchTerms: [...usernameSearchTerms],
      directUsernames: [...directUsernames],
    });
  }

  private async searchAccountNames(username: string): Promise<Array<{
    steamId?: string | null;
    username?: string | null;
    steamAccountName?: string | null;
  }>> {
    const json = await this.getJson(
      "/webapp-backend/leaderboard/global/search/account-names",
      { username },
      `account-names-${username}`,
    );
    if (json === null) return [];
    return accountNameSearchSchema.parse(json);
  }

  private async resolveSteamVanity(vanity: string): Promise<{ steamId64?: string; displayName?: string } | null> {
    const url = new URL(`https://steamcommunity.com/id/${encodeURIComponent(vanity)}`);
    url.searchParams.set("xml", "1");
    const cachePath = join(this.cacheDir, `${safeCacheKey(`steam-vanity-${vanity}`)}.xml`);

    let xml: string;
    if (!this.refresh) {
      try {
        xml = await readFile(cachePath, "utf8");
      } catch {
        xml = await this.getText(url);
        await mkdir(dirname(cachePath), { recursive: true });
        await writeFile(cachePath, xml);
      }
    } else {
      xml = await this.getText(url);
      await mkdir(dirname(cachePath), { recursive: true });
      await writeFile(cachePath, xml);
    }

    const error = readXmlTag(xml, "error");
    if (error) {
      return null;
    }

    return {
      steamId64: readXmlTag(xml, "steamID64"),
      displayName: readXmlTag(xml, "steamID"),
    };
  }

  private async getJson(
    path: string,
    params: Record<string, string | number | undefined>,
    cacheKey: string,
  ): Promise<unknown> {
    const url = new URL(path, this.baseUrl);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    }

    const cachePath = join(this.cacheDir, `${safeCacheKey(cacheKey)}.json`);
    if (!this.refresh) {
      const cached = await readCached(cachePath);
      if (cached !== undefined) {
        return cached;
      }
    }

    const data = await this.requestWithRetry(url);
    await mkdir(dirname(cachePath), { recursive: true });
    await writeFile(cachePath, JSON.stringify(data, null, 2));
    return data;
  }

  private async requestWithRetry(url: URL): Promise<unknown> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      await this.rateLimit();
      try {
        if (this.debug) {
          console.error(`GET ${url.toString()}`);
        }
        const response = await fetch(url, {
          headers: { accept: "application/json" },
        });
        if (!response.ok) {
          throw new HttpStatusError(
            `KovaaK's API returned HTTP ${response.status} for ${url.pathname}`,
            response.status,
            retryAfterToMs(response.headers.get("retry-after")),
          );
        }
        const data = await response.json();
        this.recordSuccess();
        return data;
      } catch (error) {
        lastError = error;
        if (attempt === this.maxRetries || !shouldRetry(error)) {
          break;
        }
        this.recordRetryableError(error);
        const delayMs = retryDelayMs(error, attempt, this.maxRequestDelayMs);
        if (this.debug) {
          console.error(`Retrying ${url.pathname} in ${delayMs}ms after ${errorMessage(error)}`);
        }
        await sleep(delayMs);
      }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  private async getText(url: URL): Promise<string> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      await this.rateLimit();
      try {
        if (this.debug) {
          console.error(`GET ${url.toString()}`);
        }
        const response = await fetch(url, {
          headers: { accept: "text/xml,text/plain,*/*" },
        });
        if (!response.ok) {
          throw new HttpStatusError(
            `Request returned HTTP ${response.status} for ${url.toString()}`,
            response.status,
            retryAfterToMs(response.headers.get("retry-after")),
          );
        }
        const data = await response.text();
        this.recordSuccess();
        return data;
      } catch (error) {
        lastError = error;
        if (attempt === this.maxRetries || !shouldRetry(error)) {
          break;
        }
        this.recordRetryableError(error);
        const delayMs = retryDelayMs(error, attempt, this.maxRequestDelayMs);
        if (this.debug) {
          console.error(`Retrying ${url.pathname} in ${delayMs}ms after ${errorMessage(error)}`);
        }
        await sleep(delayMs);
      }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  private async rateLimit(): Promise<void> {
    const elapsed = Date.now() - this.lastRequestAt;
    if (elapsed < this.currentRequestDelayMs) {
      await sleep(this.currentRequestDelayMs - elapsed);
    }
    this.lastRequestAt = Date.now();
  }

  private recordSuccess(): void {
    if (this.currentRequestDelayMs <= this.minRequestDelayMs) {
      return;
    }
    this.currentRequestDelayMs = Math.max(
      this.minRequestDelayMs,
      Math.floor(this.currentRequestDelayMs * KOVAAKS_API_CONFIG.adaptiveDelayRelaxMultiplier),
    );
    if (this.debug) {
      console.error(`Adaptive delay relaxed to ${this.currentRequestDelayMs}ms`);
    }
  }

  private recordRetryableError(error: unknown): void {
    if (!shouldRetry(error)) {
      return;
    }
    this.currentRequestDelayMs = Math.min(
      this.maxRequestDelayMs,
      Math.max(
        this.currentRequestDelayMs + KOVAAKS_API_CONFIG.adaptiveDelayIncreaseStepMs,
        Math.floor(this.currentRequestDelayMs * KOVAAKS_API_CONFIG.adaptiveDelayIncreaseMultiplier),
      ),
    );
    if (this.debug) {
      console.error(`Adaptive delay increased to ${this.currentRequestDelayMs}ms`);
    }
  }
}

class HttpStatusError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = "HttpStatusError";
  }
}

function shouldRetry(error: unknown): boolean {
  if (error instanceof HttpStatusError) {
    return KOVAAKS_API_CONFIG.retryableStatusCodes.includes(error.status) || error.status >= 500;
  }
  return true;
}

function retryDelayMs(error: unknown, attempt: number, maxDelayMs: number): number {
  if (error instanceof HttpStatusError && error.retryAfterMs !== undefined) {
    return Math.min(maxDelayMs, error.retryAfterMs);
  }
  return Math.min(
    maxDelayMs,
    KOVAAKS_API_CONFIG.retryBaseDelayMs * 2 ** attempt +
      Math.floor(Math.random() * KOVAAKS_API_CONFIG.retryJitterMs),
  );
}

function retryAfterToMs(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const dateMs = Date.parse(value);
  return Number.isFinite(dateMs) ? Math.max(0, dateMs - Date.now()) : undefined;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function playerMatches(
  entry: { steamId?: string; username?: string; webappUsername?: string | null },
  identity: PlayerIdentity,
): boolean {
  if (identity.steamId) {
    return entry.steamId === identity.steamId;
  }
  const normalizedPlayers = new Set(identity.matchAliases.map((player) => player.toLowerCase()));
  return [entry.steamId, entry.username, entry.webappUsername]
    .filter((value): value is string => Boolean(value))
    .some((value) => normalizedPlayers.has(value.toLowerCase()));
}

function extractBenchmarkSummary(row: Record<string, unknown>): BenchmarkSummary | null {
  const benchmarkRecord = asRecord(row.benchmark);
  const benchmarkId =
    stringValue(row.benchmarkId) ??
    stringValue(row.benchmark_id) ??
    stringValue(row.id) ??
    stringValue(benchmarkRecord?.id) ??
    stringValue(benchmarkRecord?.benchmarkId);
  const benchmarkName =
    stringValue(row.benchmarkName) ??
    stringValue(row.benchmark_name) ??
    stringValue(row.name) ??
    stringValue(row.title) ??
    stringValue(benchmarkRecord?.name) ??
    stringValue(benchmarkRecord?.title);

  if (!benchmarkId || !benchmarkName) {
    return null;
  }
  return { benchmarkId, benchmarkName };
}

function extractBenchmarkScenario(row: Record<string, unknown>): BenchmarkScenario | null {
  const scenarioRecord = asRecord(row.scenario);
  const leaderboardRecord = asRecord(row.leaderboard);
  const scenarioName =
    stringValue(row.scenarioName) ??
    stringValue(row.scenario_name) ??
    stringValue(row.name) ??
    stringValue(scenarioRecord?.scenarioName) ??
    stringValue(scenarioRecord?.name);
  const leaderboardId =
    stringValue(row.leaderboardId) ??
    stringValue(row.leaderboard_id) ??
    stringValue(leaderboardRecord?.id) ??
    stringValue(leaderboardRecord?.leaderboardId) ??
    stringValue(scenarioRecord?.leaderboardId);
  const scenarioId =
    stringValue(row.scenarioId) ??
    stringValue(row.scenario_id) ??
    stringValue(row.id) ??
    stringValue(scenarioRecord?.id) ??
    leaderboardId;

  if (!scenarioName || !leaderboardId || !scenarioId) {
    return null;
  }

  return {
    scenarioId,
    scenarioName,
    leaderboardId,
    rankMaxes: numericRecord(row.rank_maxes ?? row.rankMaxes ?? row.rank_max ?? row.rankMax),
  };
}

function extractBenchmarkScenariosFromCategories(json: unknown): BenchmarkScenario[] {
  const root = asRecord(json);
  const categories = asRecord(root?.categories);
  if (!categories) return [];
  const rankNames = rankNamesFromResponse(root);
  const scenarios: BenchmarkScenario[] = [];

  for (const [categoryKey, category] of Object.entries(categories)) {
    const categoryRecord = asRecord(category);
    const categoryScenarios = asRecord(categoryRecord?.scenarios);
    if (!categoryScenarios) continue;
    const trimmedCategory = categoryKey.trim();
    const categoryName = trimmedCategory.length > 0 ? trimmedCategory : undefined;

    for (const [scenarioName, rawScenario] of Object.entries(categoryScenarios)) {
      const scenario = asRecord(rawScenario);
      const leaderboardId = stringValue(scenario?.leaderboard_id ?? scenario?.leaderboardId);
      if (!leaderboardId) continue;
      scenarios.push({
        scenarioId: stringValue(scenario?.scenario_id ?? scenario?.scenarioId) ?? leaderboardId,
        scenarioName,
        leaderboardId,
        rankMaxes: rankMaxesFromValue(scenario?.rank_maxes ?? scenario?.rankMaxes, rankNames),
        category: categoryName,
      });
    }
  }

  return scenarios;
}

function rankNamesFromResponse(root: Record<string, unknown> | undefined): string[] {
  const ranks = Array.isArray(root?.ranks) ? root.ranks : [];
  return ranks
    .map((rank) => stringValue(asRecord(rank)?.name))
    .filter((name): name is string => Boolean(name));
}

function rankMaxesFromValue(value: unknown, rankNames: string[]): Record<string, number> {
  if (Array.isArray(value)) {
    const output: Record<string, number> = {};
    value.forEach((raw, index) => {
      const number = typeof raw === "number" ? raw : Number(raw);
      if (!Number.isFinite(number)) return;
      output[rankNames[index + 1] ?? `rank_${index + 1}`] = number;
    });
    return output;
  }
  return numericRecord(value);
}

function uniqueBenchmarkScenarios(scenarios: BenchmarkScenario[]): BenchmarkScenario[] {
  const seen = new Set<string>();
  return scenarios.filter((scenario) => {
    if (seen.has(scenario.leaderboardId)) return false;
    seen.add(scenario.leaderboardId);
    return true;
  });
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function stringValue(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function numericRecord(value: unknown): Record<string, number> {
  if (Array.isArray(value)) {
    const output: Record<string, number> = {};
    value.forEach((raw, index) => {
      const number = typeof raw === "number" ? raw : Number(raw);
      if (Number.isFinite(number)) {
        output[`rank_${index + 1}`] = number;
      }
    });
    return output;
  }
  const record = asRecord(value);
  if (!record) return {};
  const output: Record<string, number> = {};
  for (const [key, raw] of Object.entries(record)) {
    const number = typeof raw === "number" ? raw : Number(raw);
    if (Number.isFinite(number)) {
      output[key] = number;
    }
  }
  return output;
}

function isSteamId(value: string): boolean {
  return /^\d{17}$/.test(value);
}

function steamVanityFromInput(value: string): string | null {
  const trimmed = value.trim();
  if (isSteamId(trimmed)) {
    return null;
  }
  const profileMatch = trimmed.match(/^https?:\/\/steamcommunity\.com\/id\/([^/?#]+)/i);
  if (profileMatch?.[1]) {
    return decodeURIComponent(profileMatch[1]);
  }
  if (/^[a-zA-Z0-9_-]{2,64}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

function readXmlTag(xml: string, tag: string): string | undefined {
  const match = xml.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i"));
  return match?.[1]?.trim();
}

function safeCacheKey(value: string): string {
  return value.replace(/[^a-z0-9._-]+/gi, "_").slice(0, 180);
}

async function readCached(path: string): Promise<unknown | undefined> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as unknown;
  } catch {
    return undefined;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeEpoch(epoch: unknown): string | undefined {
  if (epoch === undefined || epoch === null || epoch === "") {
    return undefined;
  }
  const numeric = typeof epoch === "number" ? epoch : Number(epoch);
  if (!Number.isFinite(numeric)) {
    return undefined;
  }
  return new Date(numeric).toISOString();
}
