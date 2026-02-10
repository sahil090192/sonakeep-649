import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  Weight,
  ShieldCheck,
  Tag,
  FileText,
  TrendingUp,
  TrendingDown,
  Check,
  X,
  Gem,
  CircleDollarSign,
  RectangleHorizontal,
  Crown,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useGold, useItemById } from '@/contexts/GoldContext';
import { formatCurrency, formatWeight, getItemCurrentValue, getItemDailyChange } from '@/utils/calculations';
import { CATEGORIES, PURITIES } from '@/constants/goldData';
import { GoldPurity, GoldCategory } from '@/types/gold';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  gem: Gem,
  'circle-dollar-sign': CircleDollarSign,
  'rectangle-horizontal': RectangleHorizontal,
  crown: Crown,
};

export default function ItemDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useItemById(id ?? '');
  const { settings, updateItem, deleteItem, liveRates, dailyChangePerGram24K } = useGold();
  const [isEditing, setIsEditing] = useState(false);

  const [editName, setEditName] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editPurity, setEditPurity] = useState<GoldPurity>('22K');
  const [editCategory, setEditCategory] = useState<GoldCategory>('jewelry');
  const [editLocation, setEditLocation] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editPurchasePrice, setEditPurchasePrice] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  React.useEffect(() => {
    if (item) {
      setEditName(item.name);
      setEditWeight(String(item.weight));
      setEditPurity(item.purity);
      setEditCategory(item.category);
      setEditLocation(item.location);
      setEditNotes(item.notes);
      setEditPurchasePrice(String(item.purchasePrice));
    }
  }, [item]);

  if (!item) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Item not found</Text>
        </View>
      </View>
    );
  }

  const currentValue = getItemCurrentValue(item, settings.currency, liveRates);
  const dailyChange = getItemDailyChange(item, settings.currency, dailyChangePerGram24K);
  const isPositive = dailyChange >= 0;
  const catInfo = CATEGORIES.find((c) => c.value === item.category);
  const IconComp = catInfo ? CATEGORY_ICONS[catInfo.icon] : null;
  const gainLoss = currentValue - item.purchasePrice;
  const gainLossPercent = item.purchasePrice > 0 ? (gainLoss / item.purchasePrice) * 100 : 0;

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteItem(item.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      Alert.alert('Required', 'Item name cannot be empty');
      return;
    }
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateItem(item.id, {
      name: editName.trim(),
      weight: Number(editWeight) || item.weight,
      purity: editPurity,
      category: editCategory,
      location: editLocation.trim(),
      notes: editNotes.trim(),
      purchasePrice: Number(editPurchasePrice) || 0,
    });
    setIsEditing(false);
  };

  const handleMarkSold = () => {
    Alert.alert(
      'Mark as Sold',
      `Mark "${item.name}" as sold?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Sold',
          onPress: () => {
            updateItem(item.id, { status: 'sold' });
            router.back();
          },
        },
      ]
    );
  };

  return (
    <Animated.View style={[styles.container, { paddingTop: insets.top, opacity: fadeAnim }]}>
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          {isEditing ? (
            <>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setIsEditing(false)}>
                <X size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={handleSaveEdit}>
                <Check size={18} color={Colors.background} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setIsEditing(true)}>
                <Pencil size={18} color={Colors.gold} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
                <Trash2 size={18} color={Colors.red} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            {IconComp && <IconComp size={32} color={Colors.gold} />}
          </View>
          {isEditing ? (
            <TextInput
              style={styles.heroNameInput}
              value={editName}
              onChangeText={setEditName}
              autoFocus
            />
          ) : (
            <Text style={styles.heroName}>{item.name}</Text>
          )}
          <Text style={styles.heroCat}>{catInfo?.label} · {item.purity}</Text>
        </View>

        <View style={styles.valueCard}>
          <View style={styles.valueRow}>
            <View>
              <Text style={styles.valueLabel}>Current Value</Text>
              <Text style={styles.valueAmount}>
                {settings.privacyMode ? '••••••' : formatCurrency(currentValue, settings.currency)}
              </Text>
            </View>
            <View style={styles.valueRight}>
              <View style={[styles.changeBadge, isPositive ? styles.changeBadgeGreen : styles.changeBadgeRed]}>
                {isPositive ? <TrendingUp size={12} color={Colors.green} /> : <TrendingDown size={12} color={Colors.red} />}
                <Text style={[styles.changeVal, isPositive ? { color: Colors.green } : { color: Colors.red }]}>
                  {isPositive ? '+' : ''}{dailyChange.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.changeSub}>24h change</Text>
            </View>
          </View>
          {item.purchasePrice > 0 && (
            <View style={styles.gainRow}>
              <Text style={styles.gainLabel}>Total P/L from purchase</Text>
              <Text style={[styles.gainValue, gainLoss >= 0 ? { color: Colors.green } : { color: Colors.red }]}>
                {gainLoss >= 0 ? '+' : ''}{formatCurrency(Math.abs(gainLoss), settings.currency)} ({gainLossPercent.toFixed(1)}%)
              </Text>
            </View>
          )}
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.detailsSectionTitle}>Details</Text>

          {isEditing ? (
            <View style={styles.editFields}>
              <View style={styles.editRow}>
                <Text style={styles.editLabel}>Weight</Text>
                <TextInput
                  style={styles.editInput}
                  value={editWeight}
                  onChangeText={setEditWeight}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.editRow}>
                <Text style={styles.editLabel}>Purchase Price</Text>
                <TextInput
                  style={styles.editInput}
                  value={editPurchasePrice}
                  onChangeText={setEditPurchasePrice}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.editRow}>
                <Text style={styles.editLabel}>Location</Text>
                <TextInput
                  style={styles.editInput}
                  value={editLocation}
                  onChangeText={setEditLocation}
                />
              </View>
              <View style={styles.editRow}>
                <Text style={styles.editLabel}>Notes</Text>
                <TextInput
                  style={[styles.editInput, { minHeight: 60 }]}
                  value={editNotes}
                  onChangeText={setEditNotes}
                  multiline
                />
              </View>
            </View>
          ) : (
            <>
              <DetailRow icon={<Weight size={16} color={Colors.gold} />} label="Weight" value={formatWeight(item.weight, item.weightUnit)} />
              <DetailRow icon={<ShieldCheck size={16} color={Colors.gold} />} label="Purity" value={`${item.purity} (${(PURITIES.find(p => p.value === item.purity)?.factor ?? 0) * 100}%)`} />
              <DetailRow icon={<Tag size={16} color={Colors.gold} />} label="Purchase Price" value={item.purchasePrice > 0 ? formatCurrency(item.purchasePrice, settings.currency) : 'Not set'} />
              <DetailRow icon={<Calendar size={16} color={Colors.gold} />} label="Purchase Date" value={item.purchaseDate || 'Not set'} />
              <DetailRow icon={<MapPin size={16} color={Colors.gold} />} label="Location" value={item.location || 'Not set'} />
              {item.notes ? <DetailRow icon={<FileText size={16} color={Colors.gold} />} label="Notes" value={item.notes} /> : null}
            </>
          )}
        </View>

        {!isEditing && item.status === 'active' && (
          <TouchableOpacity style={styles.soldBtn} onPress={handleMarkSold}>
            <Text style={styles.soldBtnText}>Mark as Sold</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </Animated.View>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLeft}>
        <View style={styles.detailIcon}>{icon}</View>
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  saveBtn: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: Colors.goldSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.2)',
  },
  heroName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  heroNameInput: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.gold,
    paddingBottom: 4,
    minWidth: 200,
  },
  heroCat: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  valueCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.15)',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  valueLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  valueAmount: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.goldLight,
    marginTop: 4,
  },
  valueRight: {
    alignItems: 'flex-end',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeBadgeGreen: {
    backgroundColor: Colors.greenMuted,
  },
  changeBadgeRed: {
    backgroundColor: Colors.redMuted,
  },
  changeVal: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  changeSub: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  gainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  gainLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  gainValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.goldSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    maxWidth: '45%' as any,
    textAlign: 'right' as const,
  },
  editFields: {
    gap: 12,
  },
  editRow: {
    gap: 6,
  },
  editLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  editInput: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  soldBtn: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  soldBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
