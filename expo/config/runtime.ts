const DEFAULT_METAL_PRICE_API_URL = 'https://api.metalpriceapi.com/v1/latest';
const DEFAULT_METAL_PRICE_BASE = 'USD';
const DEFAULT_METAL_PRICE_CURRENCIES = 'XAU';

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getMetalPriceApiKey(): string | null {
  return readEnv('EXPO_PUBLIC_METAL_PRICE_API_KEY') ?? null;
}

export function getMetalPriceApiUrl(): string {
  return readEnv('EXPO_PUBLIC_METAL_PRICE_API_URL') ?? DEFAULT_METAL_PRICE_API_URL;
}

export function buildMetalPriceLatestUrl(): string | null {
  const apiKey = getMetalPriceApiKey();
  if (!apiKey) {
    return null;
  }

  const url = new URL(getMetalPriceApiUrl());
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('base', DEFAULT_METAL_PRICE_BASE);
  url.searchParams.set('currencies', DEFAULT_METAL_PRICE_CURRENCIES);

  return url.toString();
}
