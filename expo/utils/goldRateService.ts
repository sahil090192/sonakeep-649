import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoldPurity } from '@/types/gold';
import { PURITIES, GRAMS_PER_OUNCE } from '@/constants/goldData';
import { buildMetalPriceLatestUrl } from '@/config/runtime';

const RATE_CACHE_KEY = 'sonakeep_gold_rate_cache_v2';

export interface CachedGoldRate {
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

async function fetchFromAPI(): Promise<{ pricePerOunceUSD: number } | null> {
  const apiUrl = buildMetalPriceLatestUrl();
  if (!apiUrl) {
    console.warn('[GoldRateService] EXPO_PUBLIC_METAL_PRICE_API_KEY is not configured; skipping live rate fetch.');
    return null;
  }

  try {
    console.log('[GoldRateService] Fetching live gold rate from API...');
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log('[GoldRateService] API response:', JSON.stringify(data));

    if (data.success && data.rates) {
      if (data.rates.USDXAU) {
        return { pricePerOunceUSD: data.rates.USDXAU };
      }
      if (data.rates.XAU) {
        return { pricePerOunceUSD: 1 / data.rates.XAU };
      }
    }
    console.warn('[GoldRateService] Unexpected API response structure');
    return null;
  } catch (e) {
    console.error('[GoldRateService] API fetch failed:', e);
    return null;
  }
}

function buildCachedRate(pricePerOunceUSD: number, date: string): CachedGoldRate {
  const pricePerGramUSD_24K = pricePerOunceUSD / GRAMS_PER_OUNCE;
  return {
    date,
    pricePerOunceUSD,
    pricePerGramUSD_24K,
    rates: deriveAllPurityRates(pricePerGramUSD_24K),
    fetchedAt: new Date().toISOString(),
  };
}

const FALLBACK_PRICE_PER_OUNCE = 5000.00;

export interface GoldRateResult {
  rates: Record<GoldPurity, number>;
  pricePerOunceUSD: number;
  pricePerGramUSD_24K: number;
  lastUpdated: string;
  dailyChange: number;
  dailyChangePercent: number;
  isLive: boolean;
  isFetching: boolean;
}

export async function getGoldRates(): Promise<GoldRateResult> {
  const todayStr = getTodayDateString();
  const cache = await loadCache();

  const isCacheValid = cache.today 
    && cache.today.date === todayStr 
    && cache.today.pricePerOunceUSD > 1000;

  if (isCacheValid && cache.today) {
    console.log('[GoldRateService] Using cached rate for today:', todayStr, `${cache.today.pricePerOunceUSD}/oz`);
    const change = computeDailyChange(cache.today, cache.yesterday);
    return {
      rates: cache.today.rates,
      pricePerOunceUSD: cache.today.pricePerOunceUSD,
      pricePerGramUSD_24K: cache.today.pricePerGramUSD_24K,
      lastUpdated: cache.today.fetchedAt,
      dailyChange: change.change,
      dailyChangePercent: change.percent,
      isLive: true,
      isFetching: false,
    };
  }

  const apiResult = await fetchFromAPI();

  if (apiResult) {
    const newRate = buildCachedRate(apiResult.pricePerOunceUSD, todayStr);
    const yesterday = cache.today && cache.today.date !== todayStr ? cache.today : cache.yesterday;
    const newCache: RateCacheStore = { today: newRate, yesterday };
    await saveCache(newCache);

    const change = computeDailyChange(newRate, yesterday);
    console.log(`[GoldRateService] Live rate: $${newRate.pricePerGramUSD_24K.toFixed(2)}/g (24K)`);
    return {
      rates: newRate.rates,
      pricePerOunceUSD: newRate.pricePerOunceUSD,
      pricePerGramUSD_24K: newRate.pricePerGramUSD_24K,
      lastUpdated: newRate.fetchedAt,
      dailyChange: change.change,
      dailyChangePercent: change.percent,
      isLive: true,
      isFetching: false,
    };
  }

  if (cache.today) {
    console.log('[GoldRateService] API failed, using last cached rate from:', cache.today.date);
    const change = computeDailyChange(cache.today, cache.yesterday);
    return {
      rates: cache.today.rates,
      pricePerOunceUSD: cache.today.pricePerOunceUSD,
      pricePerGramUSD_24K: cache.today.pricePerGramUSD_24K,
      lastUpdated: cache.today.fetchedAt,
      dailyChange: change.change,
      dailyChangePercent: change.percent,
      isLive: false,
      isFetching: false,
    };
  }

  console.log('[GoldRateService] No cache, no API. Using fallback rate.');
  const fallback = buildCachedRate(FALLBACK_PRICE_PER_OUNCE, todayStr);
  return {
    rates: fallback.rates,
    pricePerOunceUSD: fallback.pricePerOunceUSD,
    pricePerGramUSD_24K: fallback.pricePerGramUSD_24K,
    lastUpdated: '',
    dailyChange: 0,
    dailyChangePercent: 0,
    isLive: false,
    isFetching: false,
  };
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
