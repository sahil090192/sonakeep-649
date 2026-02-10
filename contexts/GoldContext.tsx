import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { GoldItem, AppSettings, GoldPurity } from '@/types/gold';
import { calculatePortfolio } from '@/utils/calculations';
import { getGoldRates } from '@/utils/goldRateService';

const ITEMS_KEY = 'sonakeep_items';
const SETTINGS_KEY = 'sonakeep_settings';

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'USD',
  weightUnit: 'grams',
  privacyMode: false,
  biometricLock: false,
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export const [GoldProvider, useGold] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<GoldItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const itemsQuery = useQuery({
    queryKey: ['gold-items'],
    queryFn: async () => {
      console.log('[GoldContext] Loading items from storage');
      const stored = await AsyncStorage.getItem(ITEMS_KEY);
      const parsed = stored ? JSON.parse(stored) as GoldItem[] : [];
      console.log(`[GoldContext] Loaded ${parsed.length} items`);
      return parsed;
    },
  });

  const settingsQuery = useQuery({
    queryKey: ['gold-settings'],
    queryFn: async () => {
      console.log('[GoldContext] Loading settings from storage');
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      const parsed = stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } as AppSettings : DEFAULT_SETTINGS;
      console.log('[GoldContext] Loaded settings:', parsed);
      return parsed;
    },
  });

  const ratesQuery = useQuery({
    queryKey: ['gold-rates'],
    queryFn: async () => {
      console.log('[GoldContext] Fetching gold rates (1/day)...');
      const result = await getGoldRates();
      console.log(`[GoldContext] Gold rate loaded: $${result.pricePerGramUSD_24K.toFixed(2)}/g, isLive: ${result.isLive}`);
      return result;
    },
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  useEffect(() => {
    if (itemsQuery.data) {
      setItems(itemsQuery.data);
    }
  }, [itemsQuery.data]);

  useEffect(() => {
    if (settingsQuery.data) {
      setSettings(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  const saveItemsMutation = useMutation({
    mutationFn: async (newItems: GoldItem[]) => {
      console.log(`[GoldContext] Saving ${newItems.length} items`);
      await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(newItems));
      return newItems;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['gold-items'], data);
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: AppSettings) => {
      console.log('[GoldContext] Saving settings:', newSettings);
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      return newSettings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['gold-settings'], data);
    },
  });

  const { mutate: saveItems } = saveItemsMutation;
  const { mutate: saveSettingsData } = saveSettingsMutation;

  const liveRates: Record<GoldPurity, number> | undefined = ratesQuery.data?.rates;
  const dailyChangePerGram24K: number = ratesQuery.data?.dailyChange ?? 0;

  const addItem = useCallback((itemData: Omit<GoldItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newItem: GoldItem = {
      ...itemData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newItem, ...items];
    setItems(updated);
    saveItems(updated);
    console.log(`[GoldContext] Added item: ${newItem.name}`);
    return newItem;
  }, [items, saveItems]);

  const updateItem = useCallback((id: string, updates: Partial<GoldItem>) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    );
    setItems(updated);
    saveItems(updated);
    console.log(`[GoldContext] Updated item: ${id}`);
  }, [items, saveItems]);

  const deleteItem = useCallback((id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    saveItems(updated);
    console.log(`[GoldContext] Deleted item: ${id}`);
  }, [items, saveItems]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettingsData(newSettings);
  }, [settings, saveSettingsData]);

  const portfolio = useMemo(
    () => calculatePortfolio(items, settings.currency, settings.weightUnit, liveRates, dailyChangePerGram24K),
    [items, settings.currency, settings.weightUnit, liveRates, dailyChangePerGram24K]
  );

  const isLoading = itemsQuery.isLoading || settingsQuery.isLoading;
  const ratesLoading = ratesQuery.isLoading;
  const rateData = ratesQuery.data ?? null;

  return {
    items,
    settings,
    portfolio,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    updateSettings,
    liveRates,
    dailyChangePerGram24K,
    ratesLoading,
    rateData,
  };
});

export function useActiveItems() {
  const { items } = useGold();
  return useMemo(() => items.filter((i) => i.status === 'active'), [items]);
}

export function useItemById(id: string) {
  const { items } = useGold();
  return useMemo(() => items.find((i) => i.id === id), [items, id]);
}
