import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Platform,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, TrendingUp, TrendingDown, Weight, Layers, ChartNoAxesCombined, Gem, CircleDollarSign, RectangleHorizontal, Crown, LockKeyhole, Smartphone, BarChart3 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useGold, useActiveItems } from '@/contexts/GoldContext';
import { formatCurrency, formatWeight, getItemCurrentValue, getItemDailyChange } from '@/utils/calculations';
import { CATEGORIES, CURRENCY_RATES } from '@/constants/goldData';
import { GoldItem } from '@/types/gold';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  gem: Gem,
  'circle-dollar-sign': CircleDollarSign,
  'rectangle-horizontal': RectangleHorizontal,
  crown: Crown,
};

const CATEGORY_COLORS: Record<string, string> = {
  jewelry: Colors.gold,
  coin: Colors.textPrimary,
  bar: Colors.textTertiary,
  heirloom: Colors.goldDark,
};

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { portfolio, settings, rateData, liveRates } = useGold();
  const activeItems = useActiveItems();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleAddItem = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/add-item');
  };

  const isPositive = portfolio.dailyChange >= 0;

  const getCategoryCount = (category: string) =>
    activeItems.filter((i) => i.category === category).length;

  const totalPurchaseBasis = activeItems.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
  const totalGainLoss = portfolio.totalValue - totalPurchaseBasis;
  const gainLossIsPositive = totalGainLoss >= 0;
  const hasCostBasis = totalPurchaseBasis > 0;
  const ratePerGram24K = rateData
    ? rateData.pricePerGramUSD_24K * CURRENCY_RATES[settings.currency]
    : null;
  const categoryMix = CATEGORIES.map((cat) => {
    const amount = activeItems
      .filter((item) => item.category === cat.value)
      .reduce((sum, item) => sum + getItemCurrentValue(item, settings.currency, liveRates), 0);
    return {
      category: cat.value,
      label: cat.value === 'bar' ? 'Bullion' : cat.label,
      amount,
      count: getCategoryCount(cat.value),
      color: CATEGORY_COLORS[cat.value],
    };
  }).filter((cat) => cat.amount > 0 || cat.count > 0);

  const recentItems = activeItems.slice(0, 3);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />
        }
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.header}>
            <View>
              <Text style={styles.subtitle}>Local-first gold keeping</Text>
              <Text style={styles.greeting}>SonaKeep</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddItem}
              activeOpacity={0.7}
              testID="add-item-button"
            >
              <Plus size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.portfolioCard}>
            <View style={styles.portfolioAccent} />
            <Text style={styles.portfolioLabel}>TOTAL PORTFOLIO VALUE</Text>
            <Text style={styles.portfolioValue}>
              {settings.privacyMode ? '••••••' : formatCurrency(portfolio.totalValue, settings.currency)}
            </Text>
            <View style={styles.changeRow}>
              <View style={[styles.changeBadge, isPositive ? styles.changeBadgeGreen : styles.changeBadgeRed]}>
                {isPositive ? (
                  <TrendingUp size={12} color={Colors.green} />
                ) : (
                  <TrendingDown size={12} color={Colors.red} />
                )}
                <Text style={[styles.changeText, isPositive ? styles.changeTextGreen : styles.changeTextRed]}>
                  {isPositive ? '+' : ''}{formatCurrency(Math.abs(portfolio.dailyChange), settings.currency)} ({portfolio.dailyChangePercent.toFixed(2)}%)
                </Text>
              </View>
              <Text style={styles.changePeriod}>
                {rateData?.sourceLabel ?? 'awaiting rates'}
              </Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <View style={styles.metricIconWrap}>
                <Weight size={14} color={Colors.gold} />
              </View>
              <Text style={styles.metricValue}>
                {settings.privacyMode ? '••' : formatWeight(portfolio.totalWeight, settings.weightUnit)}
              </Text>
              <Text style={styles.metricLabel}>WEIGHT</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={styles.metricIconWrap}>
                <Layers size={14} color={Colors.gold} />
              </View>
              <Text style={styles.metricValue}>{portfolio.itemCount}</Text>
              <Text style={styles.metricLabel}>ITEMS</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={styles.metricIconWrap}>
                <ChartNoAxesCombined size={14} color={Colors.gold} />
              </View>
              <Text
                style={[styles.metricValue, styles.metricValueCompact, !gainLossIsPositive && styles.metricValueLoss]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {settings.privacyMode ? '••' : hasCostBasis ? `${gainLossIsPositive ? '+' : '-'}${formatCurrency(Math.abs(totalGainLoss), settings.currency)}` : '--'}
              </Text>
              <Text style={styles.metricLabel}>GAIN / LOSS</Text>
            </View>
          </View>

          {(activeItems.length > 0 || ratePerGram24K !== null) && (
            <View style={styles.insightRow}>
              {activeItems.length > 0 && (
                <AssetMixChart
                  categoryMix={categoryMix}
                  totalValue={portfolio.totalValue}
                />
              )}
              <GoldRateMiniCard
                ratePerGram24K={ratePerGram24K}
                sourceLabel={rateData?.sourceLabel}
                currency={settings.currency}
                privacyMode={settings.privacyMode}
              />
            </View>
          )}

          {recentItems.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>RECENT ITEMS</Text>
                <TouchableOpacity onPress={() => router.push('/holdings')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              {recentItems.map((item) => (
                <RecentItemRow
                  key={item.id}
                  item={item}
                  currency={settings.currency}
                  privacyMode={settings.privacyMode}
                  onPress={() => router.push(`/item-detail?id=${item.id}`)}
                />
              ))}
            </View>
          )}

          {activeItems.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Gem size={40} color={Colors.goldDark} />
              </View>
              <Text style={styles.emptyTitle}>Start Your Collection</Text>
              <Text style={styles.emptySubtitle}>
                Add your first gold item to begin tracking your portfolio, current value, and purity mix in one place.
              </Text>

              <View style={styles.trustGrid}>
                <View style={styles.trustCard}>
                  <View style={styles.trustIconWrap}>
                    <Smartphone size={18} color={Colors.gold} />
                  </View>
                  <Text style={styles.trustTitle}>Local first</Text>
                  <Text style={styles.trustCopy}>Your holdings stay on this device unless you choose to move them later.</Text>
                </View>
                <View style={styles.trustCard}>
                  <View style={styles.trustIconWrap}>
                    <LockKeyhole size={18} color={Colors.gold} />
                  </View>
                  <Text style={styles.trustTitle}>Private by design</Text>
                  <Text style={styles.trustCopy}>Use Privacy Mode and biometric lock to keep values away from casual eyes.</Text>
                </View>
                <View style={styles.trustCard}>
                  <View style={styles.trustIconWrap}>
                    <BarChart3 size={18} color={Colors.gold} />
                  </View>
                  <Text style={styles.trustTitle}>Live valuation</Text>
                  <Text style={styles.trustCopy}>Gold prices refresh automatically and fall back gracefully when live data is unavailable.</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.emptyButton} onPress={handleAddItem}>
                <Plus size={18} color={Colors.white} />
                <Text style={styles.emptyButtonText}>Add First Item</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function AssetMixChart({
  categoryMix,
  totalValue,
}: {
  categoryMix: { category: string; label: string; amount: number; count: number; color: string }[];
  totalValue: number;
}) {
  const size = 82;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return (
    <View style={styles.insightCard}>
      <Text style={styles.insightTitle}>ASSET MIX</Text>
      <Text style={styles.insightSubtitle}>By type</Text>

      <View style={styles.assetMixBody}>
        <View style={styles.chartWrap}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={Colors.cardBorder}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {categoryMix.map((cat) => {
              const portion = totalValue > 0 ? cat.amount / totalValue : 0;
              const dash = Math.max(portion * circumference - 2, 0);
              const gap = circumference - dash;
              const offset = -accumulated * circumference;
              accumulated += portion;

              return (
                <Circle
                  key={cat.category}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={cat.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  fill="none"
                  rotation="-90"
                  originX={size / 2}
                  originY={size / 2}
                />
              );
            })}
          </Svg>
        </View>

        <View style={styles.mixLegend}>
          {categoryMix.map((cat) => {
            const percent = totalValue > 0 ? (cat.amount / totalValue) * 100 : 0;
            return (
              <View key={cat.category} style={styles.mixLegendRow}>
                <View style={[styles.mixLegendDot, { backgroundColor: cat.color }]} />
                <Text style={styles.mixLegendLabel}>{cat.label}</Text>
                <Text style={styles.mixLegendValue}>{percent.toFixed(0)}%</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function GoldRateMiniCard({
  ratePerGram24K,
  sourceLabel,
  currency,
  privacyMode,
}: {
  ratePerGram24K: number | null;
  sourceLabel?: string;
  currency: import('@/types/gold').Currency;
  privacyMode: boolean;
}) {
  return (
    <View style={styles.insightCard}>
      <Text style={styles.insightTitle}>24K GOLD</Text>
      <Text style={styles.insightSubtitle}>Price per gram</Text>
      <View style={styles.rateMiniBody}>
        <Text
          style={styles.rateMiniValue}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.72}
        >
          {privacyMode ? '••••' : ratePerGram24K === null ? '--' : formatCurrency(ratePerGram24K, currency)}
        </Text>
        <Text style={styles.rateMiniSource}>{sourceLabel ?? 'Awaiting rate'}</Text>
      </View>
    </View>
  );
}

function RecentItemRow({
  item,
  currency,
  privacyMode,
  onPress,
}: {
  item: GoldItem;
  currency: import('@/types/gold').Currency;
  privacyMode: boolean;
  onPress: () => void;
}) {
  const { liveRates: rates, dailyChangePerGram24K: changePerGram } = useGold();
  const value = getItemCurrentValue(item, currency, rates);
  const change = getItemDailyChange(item, currency, changePerGram);
  const isPositive = change >= 0;
  const catInfo = CATEGORIES.find((c) => c.value === item.category);
  const IconComp = catInfo ? CATEGORY_ICONS[catInfo.icon] : null;

  return (
    <TouchableOpacity style={styles.recentItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.recentItemIcon}>
        {IconComp && <IconComp size={18} color={Colors.gold} />}
      </View>
      <View style={styles.recentItemInfo}>
        <Text style={styles.recentItemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.recentItemMeta}>
          {item.weight}{item.weightUnit === 'grams' ? 'g' : 'oz'} · {item.purity}
        </Text>
      </View>
      <View style={styles.recentItemValue}>
        <Text style={styles.recentItemPrice}>
          {privacyMode ? '••••' : formatCurrency(value, currency)}
        </Text>
        <Text style={[styles.recentItemChange, isPositive ? styles.changeTextGreen : styles.changeTextRed]}>
          {isPositive ? '+' : ''}{change.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 28,
  },
  greeting: {
    fontFamily: Colors.fontDisplay,
    fontSize: 42,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.gold,
    marginBottom: 2,
    letterSpacing: 1.9,
    textTransform: 'uppercase' as const,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: Colors.radiusMd,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portfolioCard: {
    borderRadius: Colors.radiusLg,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 24,
    position: 'relative',
  },
  portfolioAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.gold,
  },
  portfolioLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.textTertiary,
    letterSpacing: 1.9,
  },
  portfolioValue: {
    fontFamily: Colors.fontDisplay,
    fontSize: 44,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
    marginTop: 8,
    letterSpacing: 0,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Colors.radiusMd,
    gap: 4,
  },
  changeBadgeGreen: {
    backgroundColor: Colors.greenMuted,
  },
  changeBadgeRed: {
    backgroundColor: Colors.redMuted,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  changeTextGreen: {
    color: Colors.green,
  },
  changeTextRed: {
    color: Colors.red,
  },
  changePeriod: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Colors.radiusLg,
    minHeight: 112,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: 'space-between',
  },
  metricIconWrap: {
    width: 28,
    height: 28,
    borderRadius: Colors.radiusMd,
    backgroundColor: Colors.goldSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontFamily: Colors.fontDisplay,
    fontSize: 18,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  metricValueCompact: {
    fontSize: 16,
    lineHeight: 20,
  },
  metricValueLoss: {
    color: Colors.red,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '500' as const,
    color: Colors.textTertiary,
    marginTop: 5,
    letterSpacing: 1.3,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    marginBottom: 14,
    letterSpacing: 1.5,
  },
  insightRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 26,
  },
  insightCard: {
    flex: 1,
    minHeight: 184,
    backgroundColor: Colors.card,
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
  },
  insightTitle: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
  },
  insightSubtitle: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  assetMixBody: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingTop: 10,
  },
  chartWrap: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mixLegend: {
    width: '100%',
    gap: 5,
  },
  mixLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mixLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mixLegendLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  mixLegendValue: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  rateMiniBody: {
    flex: 1,
    justifyContent: 'center',
  },
  rateMiniValue: {
    fontFamily: Colors.fontDisplay,
    fontSize: 32,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
    lineHeight: 36,
  },
  rateMiniSource: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.textTertiary,
    marginTop: 10,
  },
  seeAll: {
    fontSize: 13,
    color: Colors.gold,
    fontWeight: '700' as const,
    marginBottom: 14,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '48%' as any,
    backgroundColor: Colors.card,
    borderRadius: Colors.radiusLg,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flexGrow: 1,
    flexBasis: '45%' as any,
  },
  categoryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Colors.radiusMd,
    backgroundColor: Colors.goldSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontFamily: Colors.fontDisplay,
    fontSize: 17,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Colors.radiusLg,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  recentItemIcon: {
    width: 40,
    height: 40,
    borderRadius: Colors.radiusMd,
    backgroundColor: Colors.goldSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recentItemName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  recentItemMeta: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  recentItemValue: {
    alignItems: 'flex-end',
  },
  recentItemPrice: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  recentItemChange: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: Colors.radiusLg,
    backgroundColor: Colors.goldSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  emptyTitle: {
    fontFamily: Colors.fontDisplay,
    fontSize: 26,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
    marginBottom: 24,
  },
  trustGrid: {
    width: '100%',
    gap: 10,
    marginBottom: 22,
  },
  trustCard: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    width: '100%',
  },
  trustIconWrap: {
    width: 34,
    height: 34,
    borderRadius: Colors.radiusMd,
    backgroundColor: Colors.goldSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  trustTitle: {
    fontFamily: Colors.fontDisplay,
    fontSize: 18,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  trustCopy: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: Colors.radiusMd,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
    letterSpacing: 0.3,
  },
});
