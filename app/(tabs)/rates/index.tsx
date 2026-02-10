import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, BarChart3, Clock, Wifi, WifiOff } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useGold } from '@/contexts/GoldContext';
import { PURITIES, CURRENCY_RATES, GRAMS_PER_OUNCE } from '@/constants/goldData';
import { GoldPurity } from '@/types/gold';

export default function RatesScreen() {
  const insets = useSafeAreaInsets();
  const { settings, liveRates, rateData, ratesLoading, dailyChangePerGram24K } = useGold();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const currencyRate = CURRENCY_RATES[settings.currency];
  const currencySymbol = settings.currency === 'USD' ? '$' : settings.currency === 'INR' ? '₹' : 'د.إ';

  const getRateDisplay = (purity: GoldPurity) => {
    const baseRate = liveRates ? liveRates[purity] : 0;
    if (settings.weightUnit === 'grams') {
      return baseRate * currencyRate;
    }
    return baseRate * GRAMS_PER_OUNCE * currencyRate;
  };

  const getChangeForPurity = (purity: GoldPurity) => {
    const factor = (PURITIES.find((p) => p.value === purity)?.factor ?? 0.999) / 0.999;
    const changePerGram = dailyChangePerGram24K * factor;
    if (settings.weightUnit === 'grams') {
      return { change: changePerGram * currencyRate, percent: rateData?.dailyChangePercent ?? 0 };
    }
    return { change: changePerGram * GRAMS_PER_OUNCE * currencyRate, percent: rateData?.dailyChangePercent ?? 0 };
  };

  const unitLabel = settings.weightUnit === 'grams' ? 'g' : 'oz';

  const formatLastUpdated = () => {
    if (!rateData?.lastUpdated) return 'Not yet fetched';
    try {
      const d = new Date(rateData.lastUpdated);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return `Today at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
        ` at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Unknown';
    }
  };

  const spotChange = getChangeForPurity('24K');
  const spotIsPositive = spotChange.change >= 0;

  return (
    <Animated.View style={[styles.container, { paddingTop: insets.top, opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Gold Rates</Text>
        <View style={styles.lastUpdated}>
          <Clock size={12} color={Colors.textTertiary} />
          <Text style={styles.lastUpdatedText}>{formatLastUpdated()}</Text>
          {rateData?.isLive ? (
            <Wifi size={12} color={Colors.green} />
          ) : rateData ? (
            <WifiOff size={12} color={Colors.textTertiary} />
          ) : null}
          {ratesLoading && <ActivityIndicator size="small" color={Colors.gold} />}
        </View>

        <View style={styles.spotCard}>
          <Text style={styles.spotLabel}>24K Spot Price</Text>
          <Text style={styles.spotValue}>
            {currencySymbol}{getRateDisplay('24K').toFixed(2)}/{unitLabel}
          </Text>
          {spotChange.change !== 0 && (
            <View style={styles.spotChangeRow}>
              {spotIsPositive ? (
                <TrendingUp size={14} color={Colors.green} />
              ) : (
                <TrendingDown size={14} color={Colors.red} />
              )}
              <Text style={[styles.spotChange, !spotIsPositive && { color: Colors.red }]}>
                {spotIsPositive ? '+' : ''}{spotChange.change.toFixed(2)} ({spotChange.percent.toFixed(2)}%)
              </Text>
            </View>
          )}
          {spotChange.change === 0 && (
            <View style={styles.spotChangeRow}>
              <Text style={styles.noChangeText}>Daily change available after 2 days of data</Text>
            </View>
          )}

          {rateData && (
            <View style={styles.perOunceRow}>
              <Text style={styles.perOunceLabel}>Per troy ounce</Text>
              <Text style={styles.perOunceValue}>
                {currencySymbol}{(rateData.pricePerOunceUSD * currencyRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BarChart3 size={16} color={Colors.gold} />
            <Text style={styles.sectionTitle}>All Purities</Text>
          </View>

          {PURITIES.map((p) => {
            const rate = getRateDisplay(p.value);
            const ch = getChangeForPurity(p.value);
            const isPositive = ch.change >= 0;

            return (
              <View key={p.value} style={styles.rateCard}>
                <View style={styles.rateLeft}>
                  <View style={styles.purityBadge}>
                    <Text style={styles.purityBadgeText}>{p.value}</Text>
                  </View>
                  <View>
                    <Text style={styles.purityName}>{p.label}</Text>
                    <Text style={styles.purityFactor}>{(p.factor * 100).toFixed(1)}% pure</Text>
                  </View>
                </View>
                <View style={styles.rateRight}>
                  <Text style={styles.rateValue}>
                    {currencySymbol}{rate.toFixed(2)}/{unitLabel}
                  </Text>
                  {ch.change !== 0 && (
                    <View style={[styles.rateBadge, isPositive ? styles.rateBadgeGreen : styles.rateBadgeRed]}>
                      {isPositive ? (
                        <TrendingUp size={10} color={Colors.green} />
                      ) : (
                        <TrendingDown size={10} color={Colors.red} />
                      )}
                      <Text style={[styles.rateChange, isPositive ? styles.rateChangeGreen : styles.rateChangeRed]}>
                        {isPositive ? '+' : ''}{ch.percent.toFixed(2)}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Rates update once daily on first app open. Prices for 22K, 18K, and 14K are derived from the 24K spot price using purity factors.
          </Text>
        </View>
      </ScrollView>
    </Animated.View>
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
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 12,
    letterSpacing: -0.5,
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 24,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  spotCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.2)',
  },
  spotLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  spotValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.goldLight,
    marginTop: 6,
    letterSpacing: -0.5,
  },
  spotChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  spotChange: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.green,
  },
  noChangeText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontStyle: 'italic' as const,
  },
  perOunceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  perOunceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  perOunceValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  rateCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  rateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  purityBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.goldSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purityBadgeText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  purityName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  purityFactor: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rateRight: {
    alignItems: 'flex-end',
  },
  rateValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  rateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },
  rateBadgeGreen: {
    backgroundColor: Colors.greenMuted,
  },
  rateBadgeRed: {
    backgroundColor: Colors.redMuted,
  },
  rateChange: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  rateChangeGreen: {
    color: Colors.green,
  },
  rateChangeRed: {
    color: Colors.red,
  },
  disclaimer: {
    paddingVertical: 16,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
