export type GoldCategory = 'jewelry' | 'coin' | 'bar' | 'heirloom';
export type GoldPurity = '24K' | '22K' | '18K' | '14K';
export type ItemStatus = 'active' | 'sold' | 'gifted';
export type WeightUnit = 'grams' | 'ounces';
export type Currency = 'USD' | 'INR' | 'AED';

export interface GoldItem {
  id: string;
  name: string;
  category: GoldCategory;
  weight: number;
  weightUnit: WeightUnit;
  purity: GoldPurity;
  purchasePrice: number;
  purchaseDate: string;
  location: string;
  photos: string[];
  notes: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GoldRate {
  purity: GoldPurity;
  pricePerGram: number;
  pricePerOunce: number;
  change24h: number;
  changePercent24h: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalWeight: number;
  itemCount: number;
  averagePurity: string;
  dailyChange: number;
  dailyChangePercent: number;
}

export interface AppSettings {
  currency: Currency;
  weightUnit: WeightUnit;
  privacyMode: boolean;
}
