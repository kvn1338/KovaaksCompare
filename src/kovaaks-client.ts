import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { z } from "zod";
import type {
  LeaderboardPage,
  PlayerScenarioScore,
  ScenarioSearchResult,
} from "./types.js";

const BASE_URL = "https://kovaaks.com";
const REQUEST_DELAY_MS = 500;
const MAX_RETRIES = 3;

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
      steamId: z.string().optional(),
      score: z.number(),
      rank: z.number().optional(),
      steamAccountName: z.string().optional(),
      webappUsername: z.string().nullable().optional(),
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
    steamId: z.string().optional(),
    username: z.string().nullable().optional(),
    steamAccountName: z.string().optional(),
  }),
);

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
    this.baseUrl = options.baseUrl ?? BASE_URL;
    this.cacheDir = options.cacheDir ?? ".cache/kovaaks";
    this.refresh = options.refresh ?? false;
    this.debug = options.debug ?? false;
    this.minRequestDelayMs = options.requestDelayMs ?? REQUEST_DELAY_MS;
    this.maxRequestDelayMs = options.maxRequestDelayMs ?? 10000;
    this.currentRequestDelayMs = this.minRequestDelayMs;
    this.maxRetries = options.maxRetries ?? MAX_RETRIES;
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
    const max = params.max ?? 100;
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
        playerId: score.steamId ?? score.webappUsername ?? score.steamAccountName ?? "unknown",
        steamId: score.steamId,
        username: score.steamAccountName,
        webappUsername: score.webappUsername,
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
        max: 20,
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

    const maxPages = params.maxPages ?? 20;
    for (let page = 0; page < maxPages; page += 1) {
      const leaderboard = await this.getLeaderboardScores({
        leaderboardId: params.leaderboardId,
        page,
        max: 100,
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

  private async getPlayerBestFromUserScenarioList(params: {
    leaderboardId: string;
    player: string;
    scenarioName?: string;
  }, identity: PlayerIdentity): Promise<PlayerScenarioScore | null> {
    const searchTerms = identity.directUsernames.filter((term) => !isSteamId(term));

    for (const username of searchTerms) {
      for (let page = 0; page < 20; page += 1) {
        const json = await this.getJson(
          "/webapp-backend/user/scenario/total-play",
          { username, page, max: 100, "sort_param[]": "count" },
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
    steamId?: string;
    username?: string | null;
    steamAccountName?: string;
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
      Math.floor(this.currentRequestDelayMs * 0.85),
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
      Math.max(this.currentRequestDelayMs + 500, Math.floor(this.currentRequestDelayMs * 1.8)),
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
    return error.status === 408 || error.status === 429 || error.status >= 500;
  }
  return true;
}

function retryDelayMs(error: unknown, attempt: number, maxDelayMs: number): number {
  if (error instanceof HttpStatusError && error.retryAfterMs !== undefined) {
    return Math.min(maxDelayMs, error.retryAfterMs);
  }
  return Math.min(maxDelayMs, 1500 * 2 ** attempt + Math.floor(Math.random() * 500));
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
