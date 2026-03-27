import { GoldItem, GoldPurity, PortfolioSummary, Currency, WeightUnit } from '@/types/gold';
import {
  PURITIES,
  CURRENCY_RATES,
  GRAMS_PER_OUNCE,
} from '@/constants/goldData';

export function convertWeight(weight: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return weight;
  if (from === 'ounces' && to === 'grams') return weight * GRAMS_PER_OUNCE;
  return weight / GRAMS_PER_OUNCE;
}

export function getWeightInGrams(item: GoldItem): number {
  return item.weightUnit === 'ounces' ? item.weight * GRAMS_PER_OUNCE : item.weight;
}

export function getItemCurrentValue(
  item: GoldItem,
  currency: Currency,
  liveRates?: Record<GoldPurity, number>
): number {
  const weightInGrams = getWeightInGrams(item);
  const rateUSD = liveRates ? liveRates[item.purity] : 0;
  const currencyRate = CURRENCY_RATES[currency];
  return weightInGrams * rateUSD * currencyRate;
}

export function getItemDailyChange(
  item: GoldItem,
  currency: Currency,
  dailyChangePerGram24K: number
): number {
  const weightInGrams = getWeightInGrams(item);
  const purityFactor = getPurityFactor(item.purity) / 0.999;
  const changePerGram = dailyChangePerGram24K * purityFactor;
  const currencyRate = CURRENCY_RATES[currency];
  return weightInGrams * changePerGram * currencyRate;
}

export function calculatePortfolio(
  items: GoldItem[],
  currency: Currency,
  weightUnit: WeightUnit,
  liveRates?: Record<GoldPurity, number>,
  dailyChangePerGram24K?: number
): PortfolioSummary {
  const activeItems = items.filter((i) => i.status === 'active');

  if (activeItems.length === 0) {
    return {
      totalValue: 0,
      totalWeight: 0,
      itemCount: 0,
      averagePurity: '-',
      dailyChange: 0,
      dailyChangePercent: 0,
    };
  }

  let totalValue = 0;
  let totalWeightGrams = 0;
  let dailyChange = 0;
  const purityCounts: Record<string, number> = {};
  const changePerGram = dailyChangePerGram24K ?? 0;

  for (const item of activeItems) {
    totalValue += getItemCurrentValue(item, currency, liveRates);
    totalWeightGrams += getWeightInGrams(item);
    dailyChange += getItemDailyChange(item, currency, changePerGram);
    purityCounts[item.purity] = (purityCounts[item.purity] || 0) + 1;
  }

  const mostCommonPurity = Object.entries(purityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';
  const totalWeight = weightUnit === 'ounces' ? totalWeightGrams / GRAMS_PER_OUNCE : totalWeightGrams;
  const prevValue = totalValue - dailyChange;
  const dailyChangePercent = prevValue > 0 ? (dailyChange / prevValue) * 100 : 0;

  return {
    totalValue,
    totalWeight,
    itemCount: activeItems.length,
    averagePurity: mostCommonPurity,
    dailyChange,
    dailyChangePercent,
  };
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbols: Record<Currency, string> = { USD: '$', INR: '₹', AED: 'د.إ' };
  const symbol = symbols[currency];
  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 100000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  }
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatWeight(weight: number, unit: WeightUnit): string {
  const abbr = unit === 'grams' ? 'g' : 'oz';
  return `${weight.toFixed(2)} ${abbr}`;
}

export function getPurityFactor(purity: GoldPurity): number {
  return PURITIES.find((p) => p.value === purity)?.factor ?? 0.999;
}
