import { useState, useEffect, useCallback } from 'react';
import { Platform, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import createContextHook from '@nkzw/create-context-hook';

const BIOMETRIC_KEY = 'sonakeep_biometric_lock';

export const [BiometricProvider, useBiometric] = createContextHook(() => {
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [biometricType, setBiometricType] = useState<string>('Biometrics');

  useEffect(() => {
    checkBiometricAvailability();
    loadBiometricSetting();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && isEnabled) {
        console.log('[Biometric] App foregrounded, re-locking');
        setIsLocked(true);
      }
    });
    return () => subscription.remove();
  }, [isEnabled]);

  const checkBiometricAvailability = async () => {
    if (Platform.OS === 'web') {
      console.log('[Biometric] Web platform, biometric not available');
      setIsAvailable(false);
      setIsLocked(false);
      setIsChecking(false);
      return;
    }

    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const available = compatible && enrolled;
      setIsAvailable(available);
      console.log(`[Biometric] Hardware: ${compatible}, Enrolled: ${enrolled}, Available: ${available}`);

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('Face ID');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('Fingerprint');
      }
    } catch (error) {
      console.log('[Biometric] Error checking availability:', error);
      setIsAvailable(false);
    }
  };

  const loadBiometricSetting = async () => {
    try {
      const stored = await AsyncStorage.getItem(BIOMETRIC_KEY);
      const enabled = stored === 'true';
      setIsEnabled(enabled);
      if (!enabled) {
        setIsLocked(false);
      }
      console.log(`[Biometric] Lock enabled: ${enabled}`);
    } catch (error) {
      console.log('[Biometric] Error loading setting:', error);
      setIsLocked(false);
    } finally {
      setIsChecking(false);
    }
  };

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      setIsLocked(false);
      return true;
    }

    try {
      console.log('[Biometric] Authenticating...');
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock SonaKeep',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use Passcode',
      });

      if (result.success) {
        console.log('[Biometric] Authentication successful');
        setIsLocked(false);
        return true;
      }
      console.log('[Biometric] Authentication failed:', result.error);
      return false;
    } catch (error) {
      console.log('[Biometric] Authentication error:', error);
      return false;
    }
  }, []);

  const toggleBiometric = useCallback(async (enable: boolean): Promise<boolean> => {
    if (enable && Platform.OS !== 'web') {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm to enable biometric lock',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
      if (!result.success) {
        console.log('[Biometric] Failed to verify for enable');
        return false;
      }
    }

    await AsyncStorage.setItem(BIOMETRIC_KEY, enable ? 'true' : 'false');
    setIsEnabled(enable);
    if (!enable) {
      setIsLocked(false);
    }
    console.log(`[Biometric] Lock ${enable ? 'enabled' : 'disabled'}`);
    return true;
  }, []);

  return {
    isLocked,
    isEnabled,
    isAvailable,
    isChecking,
    biometricType,
    authenticate,
    toggleBiometric,
  };
});
