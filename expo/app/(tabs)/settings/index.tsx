import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff, Scale, DollarSign, Info, Shield, Fingerprint, Smartphone, Database, BarChart3, Mail } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useGold } from '@/contexts/GoldContext';
import { useBiometric } from '@/contexts/BiometricContext';
import { CURRENCIES, WEIGHT_UNITS } from '@/constants/goldData';
import { Currency, WeightUnit } from '@/types/gold';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, items } = useGold();
  const { isEnabled: biometricEnabled, isAvailable: biometricAvailable, biometricType, toggleBiometric } = useBiometric();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const handleCurrencyChange = (currency: Currency) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    updateSettings({ currency });
  };

  const handleWeightChange = (weightUnit: WeightUnit) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    updateSettings({ weightUnit });
  };

  const togglePrivacy = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSettings({ privacyMode: !settings.privacyMode });
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const success = await toggleBiometric(value);
    if (success) {
      updateSettings({ biometricLock: value });
    }
  };

  return (
    <Animated.View style={[styles.container, { paddingTop: insets.top, opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>SETTINGS</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CURRENCY</Text>
          <View style={styles.optionGroup}>
            {CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c.value}
                style={[styles.optionRow, settings.currency === c.value && styles.optionRowActive]}
                onPress={() => handleCurrencyChange(c.value)}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.optionIcon, settings.currency === c.value && styles.optionIconActive]}>
                    <DollarSign size={16} color={settings.currency === c.value ? Colors.gold : Colors.textTertiary} />
                  </View>
                  <View>
                    <Text style={styles.optionTitle}>{c.label}</Text>
                    <Text style={styles.optionSubtitle}>{c.symbol}</Text>
                  </View>
                </View>
                <View style={[styles.radio, settings.currency === c.value && styles.radioActive]}>
                  {settings.currency === c.value && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WEIGHT UNIT</Text>
          <View style={styles.optionGroup}>
            {WEIGHT_UNITS.map((u) => (
              <TouchableOpacity
                key={u.value}
                style={[styles.optionRow, settings.weightUnit === u.value && styles.optionRowActive]}
                onPress={() => handleWeightChange(u.value)}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.optionIcon, settings.weightUnit === u.value && styles.optionIconActive]}>
                    <Scale size={16} color={settings.weightUnit === u.value ? Colors.gold : Colors.textTertiary} />
                  </View>
                  <View>
                    <Text style={styles.optionTitle}>{u.label}</Text>
                    <Text style={styles.optionSubtitle}>{u.abbr}</Text>
                  </View>
                </View>
                <View style={[styles.radio, settings.weightUnit === u.value && styles.radioActive]}>
                  {settings.weightUnit === u.value && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PRIVACY</Text>
          <View style={styles.optionGroup}>
            <View style={styles.switchRow}>
              <View style={styles.optionLeft}>
                <View style={styles.optionIcon}>
                  {settings.privacyMode ? (
                    <EyeOff size={16} color={Colors.gold} />
                  ) : (
                    <Eye size={16} color={Colors.textTertiary} />
                  )}
                </View>
                <View>
                  <Text style={styles.optionTitle}>Privacy Mode</Text>
                  <Text style={styles.optionSubtitle}>Hide monetary values across the app interface</Text>
                </View>
              </View>
              <Switch
                value={settings.privacyMode}
                onValueChange={togglePrivacy}
                trackColor={{ false: Colors.cardBorder, true: Colors.goldLight }}
                thumbColor={settings.privacyMode ? Colors.gold : Colors.textTertiary}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.optionLeft}>
                <View style={styles.optionIcon}>
                  <Smartphone size={16} color={Colors.textTertiary} />
                </View>
                <View style={styles.infoTextBlock}>
                  <Text style={styles.optionTitle}>Local storage</Text>
                  <Text style={styles.optionSubtitle}>Your holdings and settings are currently stored on this device, not in a cloud account.</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {biometricAvailable && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SECURITY</Text>
            <View style={styles.optionGroup}>
              <View style={styles.switchRow}>
                <View style={styles.optionLeft}>
                  <View style={[styles.optionIcon, biometricEnabled && styles.optionIconActive]}>
                    <Fingerprint size={16} color={biometricEnabled ? Colors.gold : Colors.textTertiary} />
                  </View>
                  <View>
                    <Text style={styles.optionTitle}>{biometricType} Lock</Text>
                    <Text style={styles.optionSubtitle}>Require {biometricType.toLowerCase()} to reopen the app</Text>
                  </View>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ false: Colors.cardBorder, true: Colors.goldLight }}
                  thumbColor={biometricEnabled ? Colors.gold : Colors.textTertiary}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.optionLeft}>
                  <View style={styles.optionIcon}>
                    <Shield size={16} color={Colors.textTertiary} />
                  </View>
                  <View style={styles.infoTextBlock}>
                    <Text style={styles.optionTitle}>Security note</Text>
                    <Text style={styles.optionSubtitle}>Biometric lock protects app access, but it is not a replacement for backing up your device responsibly.</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA AND VALUATION</Text>
          <View style={styles.optionGroup}>
            <View style={styles.infoRow}>
              <View style={styles.optionLeft}>
                <View style={styles.optionIcon}>
                  <BarChart3 size={16} color={Colors.textTertiary} />
                </View>
                <View style={styles.infoTextBlock}>
                  <Text style={styles.optionTitle}>Live gold rates</Text>
                  <Text style={styles.optionSubtitle}>Valuation is based on current 24K spot pricing, with 22K, 18K, and 14K derived from purity factors.</Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.optionLeft}>
                <View style={styles.optionIcon}>
                  <Database size={16} color={Colors.textTertiary} />
                </View>
                <View style={styles.infoTextBlock}>
                  <Text style={styles.optionTitle}>Fallback behavior</Text>
                  <Text style={styles.optionSubtitle}>When live pricing is unavailable, SonaKeep falls back to cached or built-in estimates and labels that state clearly in the Rates screen.</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <View style={styles.optionGroup}>
            <View style={styles.infoRow}>
              <View style={styles.optionLeft}>
                <View style={styles.optionIcon}>
                  <Info size={16} color={Colors.textTertiary} />
                </View>
                <View>
                  <Text style={styles.optionTitle}>Version</Text>
                  <Text style={styles.optionSubtitle}>1.0.0</Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.optionLeft}>
                <View style={styles.optionIcon}>
                  <Shield size={16} color={Colors.textTertiary} />
                </View>
                <View>
                  <Text style={styles.optionTitle}>Items Stored</Text>
                  <Text style={styles.optionSubtitle}>{items.length} items on this device</Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.optionLeft}>
                <View style={styles.optionIcon}>
                  <Mail size={16} color={Colors.textTertiary} />
                </View>
                <View style={styles.infoTextBlock}>
                  <Text style={styles.optionTitle}>Support</Text>
                  <Text style={styles.optionSubtitle}>Support details and privacy policy URLs will be added before public App Store submission.</Text>
                </View>
              </View>
            </View>
          </View>
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
    fontSize: 26,
    fontWeight: '900' as const,
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 24,
    letterSpacing: 2.5,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.textTertiary,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  optionGroup: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  optionRowActive: {
    backgroundColor: Colors.goldSubtle,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  infoTextBlock: {
    flex: 1,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.goldSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconActive: {
    backgroundColor: Colors.goldMuted,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  optionSubtitle: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    marginTop: 1,
    lineHeight: 17,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: Colors.gold,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.gold,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
  },
});
