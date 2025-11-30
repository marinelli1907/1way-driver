import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { Clock, Star, DollarSign } from 'lucide-react-native';
import type { RideHistory } from '@/types';

const MOCK_RIDE_HISTORY: RideHistory[] = [
  {
    id: '1',
    passengerId: 'p1',
    passengerName: 'John Smith',
    pickupAddress: '123 Main St, New York, NY',
    dropoffAddress: 'JFK Airport, Terminal 4',
    date: '2024-01-15T14:30:00Z',
    earnings: 45.00,
    tip: 8.00,
    rating: 5,
    distance: 15.2,
    duration: 35,
  },
  {
    id: '2',
    passengerId: 'p2',
    passengerName: 'Sarah Johnson',
    pickupAddress: '456 Park Ave, New York, NY',
    dropoffAddress: '789 Broadway, New York, NY',
    date: '2024-01-14T10:15:00Z',
    earnings: 18.50,
    tip: 3.50,
    rating: 5,
    distance: 3.8,
    duration: 12,
  },
  {
    id: '3',
    passengerId: 'p3',
    passengerName: 'Michael Chen',
    pickupAddress: '321 5th Ave, New York, NY',
    dropoffAddress: 'Penn Station, New York, NY',
    date: '2024-01-14T09:00:00Z',
    earnings: 22.00,
    tip: 5.00,
    rating: 4,
    distance: 5.5,
    duration: 18,
  },
  {
    id: '4',
    passengerId: 'p1',
    passengerName: 'John Smith',
    pickupAddress: 'JFK Airport, Terminal 1',
    dropoffAddress: '123 Main St, New York, NY',
    date: '2024-01-10T18:45:00Z',
    earnings: 50.00,
    tip: 10.00,
    rating: 5,
    distance: 15.8,
    duration: 40,
  },
];

export default function RideHistoryScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  const filterRides = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (selectedPeriod === 'week') {
      return MOCK_RIDE_HISTORY.filter(ride => new Date(ride.date) >= weekAgo);
    } else if (selectedPeriod === 'month') {
      return MOCK_RIDE_HISTORY.filter(ride => new Date(ride.date) >= monthAgo);
    }
    return MOCK_RIDE_HISTORY;
  };

  const rides = filterRides();
  const totalEarnings = rides.reduce((sum, ride) => sum + ride.earnings + ride.tip, 0);
  const totalRides = rides.length;
  const avgRating = rides.reduce((sum, ride) => sum + (ride.rating || 0), 0) / rides.length;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true,
        title: 'Ride History',
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
      }} />

      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('week')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'week' && styles.periodTextActive]}>
            This Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('month')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'month' && styles.periodTextActive]}>
            This Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'all' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('all')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'all' && styles.periodTextActive]}>
            All Time
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalRides}</Text>
          <Text style={styles.statLabel}>Total Rides</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${totalEarnings.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Earnings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{avgRating.toFixed(1)} ⭐</Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {rides.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No rides in this period</Text>
          </View>
        ) : (
          rides.map(ride => (
            <TouchableOpacity
              key={ride.id}
              style={styles.rideCard}
              onPress={() => router.push({ pathname: '/history/customers', params: { id: ride.passengerId } })}
            >
              <View style={styles.rideHeader}>
                <Text style={styles.passengerName}>{ride.passengerName}</Text>
                <View style={styles.rideRating}>
                  <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
                  <Text style={styles.ratingText}>{ride.rating}</Text>
                </View>
              </View>

              <View style={styles.rideDetail}>
                <Clock size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>
                  {new Date(ride.date).toLocaleString()}
                </Text>
              </View>

              <View style={styles.addressContainer}>
                <View style={styles.addressRow}>
                  <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
                  <Text style={styles.addressText} numberOfLines={1}>
                    {ride.pickupAddress}
                  </Text>
                </View>
                <View style={styles.line} />
                <View style={styles.addressRow}>
                  <View style={[styles.dot, { backgroundColor: COLORS.accent }]} />
                  <Text style={styles.addressText} numberOfLines={1}>
                    {ride.dropoffAddress}
                  </Text>
                </View>
              </View>

              <View style={styles.rideFooter}>
                <View style={styles.earningsContainer}>
                  <DollarSign size={16} color={COLORS.success} />
                  <Text style={styles.earningsText}>
                    ${ride.earnings.toFixed(2)}
                  </Text>
                  {ride.tip > 0 && (
                    <Text style={styles.tipText}>
                      + ${ride.tip.toFixed(2)} tip
                    </Text>
                  )}
                </View>
                <Text style={styles.distanceText}>
                  {ride.distance}mi • {ride.duration}min
                </Text>
              </View>
            </TouchableOpacity>
          ))
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
  periodSelector: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  periodButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  periodTextActive: {
    color: COLORS.background,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.sm,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  content: {
    padding: SPACING.lg,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  rideCard: {
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
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  passengerName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  rideRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  rideDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  detailText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  addressContainer: {
    marginBottom: SPACING.md,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  line: {
    width: 2,
    height: 10,
    backgroundColor: COLORS.border,
    marginLeft: 4,
    marginVertical: 2,
  },
  addressText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  earningsText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.success,
  },
  tipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  distanceText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
});
