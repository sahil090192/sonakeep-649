import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoldPurity } from '@/types/gold';
import { PURITIES, GRAMS_PER_OUNCE } from '@/constants/goldData';
import { buildMetalPriceLatestUrl } from '@/config/runtime';

const RATE_CACHE_KEY = 'sonakeep_gold_rate_cache_v2';
const FETCH_TIMEOUT_MS = 10000;

type GoldRateSource = 'live' | 'cache' | 'fallback';

authoritative export interface CachedGoldRate {
  date: string;
  pricePerOunceUSD: number;
  pricePerGramUSD_24K: number;
  rates: Record<GoldPurity, number>;
  fetchedAt: string;
}

interface RateCacheStore {
  today: CachedGoldRate | null;
  yesterday: CachedGoldRate | null;
}

interface FetchResult {
  pricePerOunceUSD: number;
  fetchedAt: string;
}

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function deriveAllPurityRates(pricePerGram24K: number): Record<GoldPurity, number> {
  const rates: Record<GoldPurity, number> = {} as Record<GoldPurity, number>;
  for (const p of PURITIES) {
    rates[p.value] = pricePerGram24K * (p.factor / 0.999);
  }
  return rates;
}

async function loadCache(): Promise<RateCacheStore> {
  try {
    const raw = await AsyncStorage.getItem(RATE_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RateCacheStore;
      console.log('[GoldRateService] Cache loaded:', parsed.today?.date, parsed.yesterday?.date);
      return parsed;
    }
  } catch (e) {
    console.warn('[GoldRateService] Failed to load cache:', e);
  }
  return { today: null, yesterday: null };
}

async function saveCache(store: RateCacheStore): Promise<void> {
  try {
    await AsyncStorage.setItem(RATE_CACHE_KEY, JSON.stringify(store));
    console.log('[GoldRateService] Cache saved for date:', store.today?.date);
  } catch (e) {
    console.warn('[GoldRateService] Failed to save cache:', e);
  }
}

function isReasonableSpotPrice(pricePerOunceUSD: number): boolean {
  return Number.isFinite(pricePerOunceUSD) && pricePerOunceUSD > 1000 && pricePerOunceUSD < 10000;
}

function parsePricePerOunceUSD(data: unknown): number | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const payload = data as { success?: unknown; rates?: Record<string, unknown> };
  if (payload.success !== true || !payload.rates || typeof payload.rates !== 'object') {
    return null;
  }

  const directRate = payload.rates.USDXAU;
  if (typeof directRate === 'number' && isReasonableSpotPrice(directRate)) {
    return directRate;
  }

  const inverseRate = payload.rates.XAU;
  if (typeof inverseRate === 'number' && inverseRate > 0) {
    const converted = 1 / inverseRate;
    return isReasonableSpotPrice(converted) ? converted : null;
  }

  return null;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFromAPI(): Promise<FetchResult | null> {
  const apiUrl = buildMetalPriceLatestUrl();
  if (!apiUrl) {
    console.warn('[GoldRateService] EXPO_PUBLIC_METAL_PRICE_API_KEY is not configured; skipping live rate fetch.');
    return null;
  }

  try {
    console.log('[GoldRateService] Fetching live gold rate from API...');
    const response = await fetchWithTimeout(apiUrl);

    if (!response.ok) {
      console.warn('[GoldRateService] API returned non-OK status:', response.status);
      return null;
    }

    const data = await response.json();
    const pricePerOunceUSD = parsePricePerOunceUSD(data);
    if (!pricePerOunceUSD) {
      console.warn('[GoldRateService] Unexpected API response structure');
      return null;
    }

    return {
      pricePerOunceUSD,
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.error('[GoldRateService] API fetch failed:', e);
    return null;
  }
}

function buildCachedRate(pricePerOunceUSD: number, date: string, fetchedAt = new Date().toISOString()): CachedGoldRate {
  const pricePerGramUSD_24K = pricePerOunceUSD / GRAMS_PER_OUNCE;
  return {
    date,
    pricePerOunceUSD,
    pricePerGramUSD_24K,
    rates: deriveAllPurityRates(pricePerGramUSD_24K),
    fetchedAt,
  };
}

const FALLBACK_PRICE_PER_OUNCE = 5000.0;

export interface GoldRateResult {
  rates: Record<GoldPurity, number>;
  pricePerOunceUSD: number;
  pricePerGramUSD_24K: number;
  lastUpdated: string;
  dailyChange: number;
  dailyChangePercent: number;
  isLive: boolean;
  isFetching: boolean;
  source: GoldRateSource;
  sourceLabel: string;
}

function buildResult(current: CachedGoldRate, previous: CachedGoldRate | null, source: GoldRateSource): GoldRateResult {
  const change = computeDailyChange(current, previous);
  return {
    rates: current.rates,
    pricePerOunceUSD: current.pricePerOunceUSD,
    pricePerGramUSD_24K: current.pricePerGramUSD_24K,
    lastUpdated: current.fetchedAt,
    dailyChange: change.change,
    dailyChangePercent: change.percent,
    isLive: source === 'live',
    isFetching: false,
    source,
    sourceLabel: source === 'live' ? 'Live data' : source === 'cache' ? 'Cached data' : 'Fallback estimate',
  };
}

export async function getGoldRates(): Promise<GoldRateResult> {
  const todayStr = getTodayDateString();
  const cache = await loadCache();

  const isCacheValid = Boolean(
    cache.today && cache.today.date === todayStr && isReasonableSpotPrice(cache.today.pricePerOunceUSD)
  );

  if (isCacheValid && cache.today) {
    console.log('[GoldRateService] Using cached rate for today:', todayStr, `${cache.today.pricePerOunceUSD}/oz`);
    return buildResult(cache.today, cache.yesterday, 'cache');
  }

  const apiResult = await fetchFromAPI();

  if (apiResult) {
    const newRate = buildCachedRate(apiResult.pricePerOunceUSD, todayStr, apiResult.fetchedAt);
    const yesterday = cache.today && cache.today.date !== todayStr ? cache.today : cache.yesterday;
    const newCache: RateCacheStore = { today: newRate, yesterday };
    await saveCache(newCache);

    console.log(`[GoldRateService] Live rate: $${newRate.pricePerGramUSD_24K.toFixed(2)}/g (24K)`);
    return buildResult(newRate, yesterday, 'live');
  }

  if (cache.today && isReasonableSpotPrice(cache.today.pricePerOunceUSD)) {
    console.log('[GoldRateService] API failed, using last cached rate from:', cache.today.date);
    return buildResult(cache.today, cache.yesterday, 'cache');
  }

  console.log('[GoldRateService] No cache, no API. Using fallback rate.');
  const fallback = buildCachedRate(FALLBACK_PRICE_PER_OUNCE, todayStr, '');
  return buildResult(fallback, null, 'fallback');
}

function computeDailyChange(
  current: CachedGoldRate,
  previous: CachedGoldRate | null
): { change: number; percent: number } {
  if (!previous) {
    return { change: 0, percent: 0 };
  }
  const change = current.pricePerGramUSD_24K - previous.pricePerGramUSD_24K;
  const percent = previous.pricePerGramUSD_24K > 0
    ? (change / previous.pricePerGramUSD_24K) * 100
    : 0;
  return { change, percent };
}
