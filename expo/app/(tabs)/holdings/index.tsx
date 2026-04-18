import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal, Plus, Gem, CircleDollarSign, RectangleHorizontal, Crown, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useGold, useActiveItems } from '@/contexts/GoldContext';
import { formatCurrency, getItemCurrentValue } from '@/utils/calculations';
import { CATEGORIES } from '@/constants/goldData';
import { GoldItem, GoldCategory } from '@/types/gold';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  gem: Gem,
  'circle-dollar-sign': CircleDollarSign,
  'rectangle-horizontal': RectangleHorizontal,
  crown: Crown,
};

type SortOption = 'date' | 'value' | 'weight' | 'name';

export default function HoldingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, liveRates } = useGold();
  const activeItems = useActiveItems();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GoldCategory | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [showFilters, setShowFilters] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...activeItems];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || i.category.includes(q) || i.purity.includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter((i) => i.category === selectedCategory);
    }

    switch (sortBy) {
      case 'value':
        result.sort((a, b) => getItemCurrentValue(b, settings.currency, liveRates) - getItemCurrentValue(a, settings.currency, liveRates));
        break;
      case 'weight':
        result.sort((a, b) => b.weight - a.weight);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [activeItems, search, selectedCategory, sortBy, settings.currency, liveRates]);

  const renderItem = ({ item }: { item: GoldItem }) => {
    const catInfo = CATEGORIES.find((c) => c.value === item.category);
    const IconComp = catInfo ? CATEGORY_ICONS[catInfo.icon] : null;
    const value = getItemCurrentValue(item, settings.currency, liveRates);

    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => router.push(`/item-detail?id=${item.id}`)}
        activeOpacity={0.7}
        testID={`holding-card-${item.id}`}
      >
        <View style={styles.itemIcon}>
          {IconComp && <IconComp size={20} color={Colors.gold} />}
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemMeta}>
            {item.weight}{item.weightUnit === 'grams' ? 'g' : 'oz'} · {item.purity} · {catInfo?.label}
          </Text>
        </View>
        <Text style={styles.itemValue}>
          {settings.privacyMode ? '••••' : formatCurrency(value, settings.currency)}
        </Text>
      </TouchableOpacity>
    );
  };

  const SORTS: { value: SortOption; label: string }[] = [
    { value: 'date', label: 'Recent' },
    { value: 'value', label: 'Value' },
    { value: 'weight', label: 'Weight' },
    { value: 'name', label: 'Name' },
  ];

  return (
    <Animated.View style={[styles.container, { paddingTop: insets.top, opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>HOLDINGS</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/add-item');
          }}
          testID="holdings-add-button"
        >
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor={Colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            testID="holdings-search-input"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} testID="holdings-search-clear-button">
              <X size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          onPress={() => setShowFilters(!showFilters)}
          testID="holdings-filter-toggle"
        >
          <SlidersHorizontal size={18} color={showFilters ? Colors.white : Colors.gold} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersSection} testID="holdings-filters-panel">
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>CATEGORY</Text>
            <View style={styles.chipRow}>
              <TouchableOpacity
                style={[styles.chip, !selectedCategory && styles.chipActive]}
                onPress={() => setSelectedCategory(null)}
                testID="holdings-category-all"
              >
                <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>All</Text>
              </TouchableOpacity>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[styles.chip, selectedCategory === cat.value && styles.chipActive]}
                  onPress={() => setSelectedCategory(selectedCategory === cat.value ? null : cat.value)}
                  testID={`holdings-category-${cat.value}`}
                >
                  <Text style={[styles.chipText, selectedCategory === cat.value && styles.chipTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>SORT BY</Text>
            <View style={styles.chipRow}>
              {SORTS.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[styles.chip, sortBy === s.value && styles.chipActive]}
                  onPress={() => setSortBy(s.value)}
                  testID={`holdings-sort-${s.value}`}
                >
                  <Text style={[styles.chipText, sortBy === s.value && styles.chipTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      <View style={styles.countRow}>
        <Text style={styles.countText}>{filteredItems.length} items</Text>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty} testID="holdings-empty-state">
            <Gem size={36} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        }
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '900' as const,
    color: Colors.textPrimary,
    letterSpacing: 2.5,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
    height: 44,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  filterBtnActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  filtersSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.textTertiary,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.gold,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.gold,
    fontWeight: '700' as const,
  },
  countRow: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.goldSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  itemMeta: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  itemValue: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.gold,
    letterSpacing: -0.3,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
  },
});
