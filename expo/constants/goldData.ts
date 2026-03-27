import { GoldCategory, GoldPurity, Currency, WeightUnit } from '@/types/gold';

export const CATEGORIES: { value: GoldCategory; label: string; icon: string }[] = [
  { value: 'jewelry', label: 'Jewelry', icon: 'gem' },
  { value: 'coin', label: 'Coin', icon: 'circle-dollar-sign' },
  { value: 'bar', label: 'Bar', icon: 'rectangle-horizontal' },
  { value: 'heirloom', label: 'Heirloom', icon: 'crown' },
];

export const PURITIES: { value: GoldPurity; label: string; factor: number }[] = [
  { value: '24K', label: '24 Karat (99.9%)', factor: 0.999 },
  { value: '22K', label: '22 Karat (91.6%)', factor: 0.916 },
  { value: '18K', label: '18 Karat (75.0%)', factor: 0.750 },
  { value: '14K', label: '14 Karat (58.3%)', factor: 0.583 },
];

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { value: 'AED', label: 'UAE Dirham', symbol: 'د.إ' },
];

export const WEIGHT_UNITS: { value: WeightUnit; label: string; abbr: string }[] = [
  { value: 'grams', label: 'Grams', abbr: 'g' },
  { value: 'ounces', label: 'Troy Ounces', abbr: 'oz' },
];

export const GOLD_RATES_PER_GRAM_USD: Record<GoldPurity, number> = {
  '24K': 92.50,
  '22K': 84.77,
  '18K': 69.38,
  '14K': 53.95,
};

export const GOLD_RATE_CHANGES: Record<GoldPurity, { change: number; percent: number }> = {
  '24K': { change: 1.23, percent: 1.35 },
  '22K': { change: 1.13, percent: 1.35 },
  '18K': { change: 0.92, percent: 1.34 },
  '14K': { change: 0.72, percent: 1.35 },
};

export const CURRENCY_RATES: Record<Currency, number> = {
  USD: 1,
  INR: 83.12,
  AED: 3.67,
};

export const GRAMS_PER_OUNCE = 31.1035;
