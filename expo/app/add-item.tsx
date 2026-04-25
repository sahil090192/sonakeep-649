import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, ChevronDown, Calendar, MapPin, FileText, Gem, CircleDollarSign, RectangleHorizontal, Crown, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useGold } from '@/contexts/GoldContext';
import { CATEGORIES, PURITIES, CURRENCIES } from '@/constants/goldData';
import { GoldCategory, GoldPurity, GoldItem } from '@/types/gold';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  gem: Gem,
  'circle-dollar-sign': CircleDollarSign,
  'rectangle-horizontal': RectangleHorizontal,
  crown: Crown,
};

export default function AddItemScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addItem, settings } = useGold();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<GoldCategory>('jewelry');
  const [weight, setWeight] = useState('');
  const [purity, setPurity] = useState<GoldPurity>('22K');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [showPurityPicker, setShowPurityPicker] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter an item name');
      return;
    }
    if (!weight.trim() || isNaN(Number(weight)) || Number(weight) <= 0) {
      Alert.alert('Required', 'Please enter a valid weight');
      return;
    }

    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const itemData: Omit<GoldItem, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name.trim(),
      category,
      weight: Number(weight),
      weightUnit: settings.weightUnit,
      purity,
      purchasePrice: purchasePrice ? Number(purchasePrice) : 0,
      purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
      location: location.trim(),
      photos: [],
      notes: notes.trim(),
      status: 'active',
    };

    addItem(itemData);
    console.log('[AddItem] Item saved:', itemData.name);
    router.back();
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const currencySymbol = CURRENCIES.find((c) => c.value === settings.currency)?.symbol ?? '$';
  const weightAbbr = settings.weightUnit === 'grams' ? 'g' : 'oz';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <X size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Item</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.label}>CATEGORY</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => {
                const IconComp = CATEGORY_ICONS[cat.icon];
                const isSelected = category === cat.value;
                return (
                  <TouchableOpacity
                    key={cat.value}
                    style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                    onPress={() => {
                      setCategory(cat.value);
                      if (Platform.OS !== 'web') Haptics.selectionAsync();
                    }}
                  >
                    {IconComp && <IconComp size={16} color={isSelected ? Colors.gold : Colors.textTertiary} />}
                    <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>ITEM NAME *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Wedding Necklace, Gold Bar 50g"
              placeholderTextColor={Colors.textTertiary}
              value={name}
              onChangeText={setName}
              testID="item-name-input"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.section, styles.flex]}>
              <Text style={styles.label}>WEIGHT ({weightAbbr}) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={Colors.textTertiary}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                testID="item-weight-input"
              />
            </View>
            <View style={[styles.section, styles.flex]}>
              <Text style={styles.label}>PURITY</Text>
              <TouchableOpacity
                style={styles.pickerBtn}
                onPress={() => setShowPurityPicker(!showPurityPicker)}
              >
                <Text style={styles.pickerText}>{purity}</Text>
                <ChevronDown size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {showPurityPicker && (
            <View style={styles.purityOptions}>
              {PURITIES.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[styles.purityOption, purity === p.value && styles.purityOptionActive]}
                  onPress={() => {
                    setPurity(p.value);
                    setShowPurityPicker(false);
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                  }}
                >
                  <Text style={[styles.purityOptionText, purity === p.value && styles.purityOptionTextActive]}>
                    {p.label}
                  </Text>
                  {purity === p.value && <Check size={16} color={Colors.gold} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>PURCHASE PRICE ({currencySymbol})</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.textTertiary}
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>PURCHASE DATE</Text>
            <View style={styles.inputWithIcon}>
              <Calendar size={16} color={Colors.textTertiary} />
              <TextInput
                style={styles.inputInner}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textTertiary}
                value={purchaseDate}
                onChangeText={setPurchaseDate}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>STORAGE LOCATION</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={16} color={Colors.textTertiary} />
              <TextInput
                style={styles.inputInner}
                placeholder="e.g. Home Safe, Bank Locker"
                placeholderTextColor={Colors.textTertiary}
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>NOTES</Text>
            <View style={styles.inputWithIcon}>
              <FileText size={16} color={Colors.textTertiary} style={{ marginTop: 2 }} />
              <TextInput
                style={[styles.inputInner, styles.textArea]}
                placeholder="Additional details, markings, etc."
                placeholderTextColor={Colors.textTertiary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.9}
              testID="save-item-button"
            >
              <Text style={styles.saveButtonText}>Add to Collection</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: Colors.radiusMd,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  headerTitle: {
    fontFamily: Colors.fontDisplay,
    fontSize: 24,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
    letterSpacing: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: Colors.textTertiary,
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Colors.radiusMd,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  categoryChipActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.gold,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.gold,
    fontWeight: '600' as const,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radiusLg,
    padding: 14,
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Colors.radiusLg,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 10,
  },
  inputInner: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  textArea: {
    minHeight: 70,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: Colors.radiusLg,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  pickerText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  purityOptions: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radiusLg,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  purityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  purityOptionActive: {
    backgroundColor: Colors.goldSubtle,
  },
  purityOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  purityOptionTextActive: {
    color: Colors.gold,
    fontWeight: '600' as const,
  },
  saveButton: {
    backgroundColor: Colors.gold,
    borderRadius: Colors.radiusMd,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
