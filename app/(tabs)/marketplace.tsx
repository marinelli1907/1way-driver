import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { Store, Tag, ShoppingBag } from 'lucide-react-native';
import type { MarketplaceDiscount, MarketplaceMerch } from '@/types';

const MOCK_DISCOUNTS: MarketplaceDiscount[] = [
  {
    id: '1',
    title: '10% Off Shell Gas',
    description: 'Save on every fill-up at participating Shell stations',
    provider: 'Shell',
    discountPercent: 10,
    code: 'SHELL1WAY',
    category: 'fuel',
    expiresAt: '2025-12-31',
  },
  {
    id: '2',
    title: '$15 Off Oil Change',
    description: 'Professional oil change service at Jiffy Lube',
    provider: 'Jiffy Lube',
    discountAmount: 15,
    code: 'JLUBE1WAY',
    category: 'maintenance',
    expiresAt: '2025-12-31',
  },
  {
    id: '3',
    title: '15% Off Car Insurance',
    description: 'Special rate for 1Way drivers with Geico',
    provider: 'Geico',
    discountPercent: 15,
    code: 'GEICO1WAY',
    category: 'insurance',
  },
  {
    id: '4',
    title: '$5 Off Car Wash',
    description: 'Premium car wash at Mister Car Wash',
    provider: 'Mister Car Wash',
    discountAmount: 5,
    code: 'WASH1WAY',
    category: 'other',
    expiresAt: '2025-06-30',
  },
];

const MOCK_MERCH: MarketplaceMerch[] = [
  {
    id: '1',
    name: '1Way Driver T-Shirt',
    description: 'Comfortable cotton t-shirt with 1Way logo',
    price: 24.99,
    category: 'apparel',
    inStock: true,
  },
  {
    id: '2',
    name: '1Way Car Decal',
    description: 'Professional vinyl decal for your vehicle',
    price: 9.99,
    category: 'accessories',
    inStock: true,
  },
  {
    id: '3',
    name: 'Phone Mount',
    description: 'Magnetic phone mount for easy navigation',
    price: 19.99,
    category: 'equipment',
    inStock: true,
  },
  {
    id: '4',
    name: '1Way Driver Hoodie',
    description: 'Warm hoodie with embroidered logo',
    price: 44.99,
    category: 'apparel',
    inStock: true,
  },
  {
    id: '5',
    name: 'Car Cleaning Kit',
    description: 'Complete kit to keep your car spotless',
    price: 34.99,
    category: 'equipment',
    inStock: false,
  },
];

export default function MarketplaceScreen() {
  const [activeTab, setActiveTab] = useState<'discounts' | 'merch'>('discounts');

  const renderDiscountCard = (discount: MarketplaceDiscount) => (
    <View key={discount.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Tag size={20} color={COLORS.primary} />
        <Text style={styles.providerText}>{discount.provider}</Text>
      </View>
      <Text style={styles.cardTitle}>{discount.title}</Text>
      <Text style={styles.cardDescription}>{discount.description}</Text>
      
      <View style={styles.discountBadge}>
        <Text style={styles.discountBadgeText}>
          {discount.discountPercent ? `${discount.discountPercent}% OFF` : `$${discount.discountAmount} OFF`}
        </Text>
      </View>

      {discount.code && (
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Code:</Text>
          <Text style={styles.codeText}>{discount.code}</Text>
        </View>
      )}

      {discount.expiresAt && (
        <Text style={styles.expiresText}>
          Expires: {new Date(discount.expiresAt).toLocaleDateString()}
        </Text>
      )}
    </View>
  );

  const renderMerchCard = (merch: MarketplaceMerch) => (
    <View key={merch.id} style={styles.merchCard}>
      <View style={styles.merchImagePlaceholder}>
        <ShoppingBag size={40} color={COLORS.textSecondary} />
      </View>
      <View style={styles.merchInfo}>
        <Text style={styles.merchName}>{merch.name}</Text>
        <Text style={styles.merchDescription} numberOfLines={2}>
          {merch.description}
        </Text>
        <View style={styles.merchFooter}>
          <Text style={styles.merchPrice}>${merch.price.toFixed(2)}</Text>
          {!merch.inStock && (
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.addButton, !merch.inStock && styles.addButtonDisabled]}
        disabled={!merch.inStock}
      >
        <Text style={styles.addButtonText}>
          {merch.inStock ? 'Add to Cart' : 'Unavailable'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'discounts' && styles.tabActive]}
            onPress={() => setActiveTab('discounts')}
          >
            <Tag size={18} color={activeTab === 'discounts' ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'discounts' && styles.tabTextActive]}>
              Discounts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'merch' && styles.tabActive]}
            onPress={() => setActiveTab('merch')}
          >
            <Store size={18} color={activeTab === 'merch' ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'merch' && styles.tabTextActive]}>
              Store
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'discounts' ? (
          <>
            <Text style={styles.sectionTitle}>Exclusive Discounts for 1Way Drivers</Text>
            {MOCK_DISCOUNTS.map(renderDiscountCard)}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>1Way Merchandise</Text>
            {MOCK_MERCH.map(renderMerchCard)}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  tabs: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
  },
  tabActive: {
    backgroundColor: COLORS.primary + '20',
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  content: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  providerText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  discountBadge: {
    backgroundColor: COLORS.success + '20',
    alignSelf: 'flex-start',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  discountBadgeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.success,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
  },
  codeLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  codeText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  expiresText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  },
  merchCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  merchImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  merchInfo: {
    marginBottom: SPACING.sm,
  },
  merchName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  merchDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  merchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  merchPrice: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  outOfStockText: {
    fontSize: FONT_SIZE.sm,
    color: '#ef4444',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: COLORS.textTertiary,
  },
  addButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.background,
  },
});
