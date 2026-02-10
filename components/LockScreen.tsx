import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Fingerprint, ShieldCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useBiometric } from '@/contexts/BiometricContext';

export default function LockScreen() {
  const { authenticate, biometricType } = useBiometric();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shieldScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(shieldScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    startPulse();
    handleAutoAuth();
  }, []);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleAutoAuth = async () => {
    await new Promise((r) => setTimeout(r, 500));
    await authenticate();
  };

  const handleUnlock = async () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await authenticate();
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.topSection}>
        <Animated.View style={[styles.shieldContainer, { transform: [{ scale: shieldScale }] }]}>
          <View style={styles.shieldOuter}>
            <View style={styles.shieldInner}>
              <ShieldCheck size={40} color={Colors.gold} />
            </View>
          </View>
        </Animated.View>
        <Text style={styles.appName}>SONAKEEP</Text>
        <Text style={styles.subtitle}>Your gold portfolio is protected</Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.unlockButton}
          onPress={handleUnlock}
          activeOpacity={0.7}
        >
          <Animated.View style={[styles.unlockInner, { transform: [{ scale: pulseAnim }] }]}>
            <Fingerprint size={32} color={Colors.gold} />
          </Animated.View>
        </TouchableOpacity>
        <Text style={styles.unlockLabel}>
          Tap to unlock with {biometricType}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 60,
  },
  shieldContainer: {
    marginBottom: 24,
  },
  shieldOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.goldSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  shieldInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.textPrimary,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  bottomSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  unlockButton: {
    marginBottom: 16,
  },
  unlockInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.gold,
  },
  unlockLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
});
