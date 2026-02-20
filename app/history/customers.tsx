import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { User, Star, DollarSign, Calendar, Phone, Mail } from 'lucide-react-native';
import type { CustomerProfile, RideHistory } from '@/types';

const MOCK_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'p1',
    name: 'John Smith',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@email.com',
    rating: 4.9,
    totalRides: 12,
    averageTip: 8.50,
    lastRideDate: '2024-01-15',
  },
  {
    id: 'p2',
    name: 'Sarah Johnson',
    phone: '+1 (555) 234-5678',
    rating: 5.0,
    totalRides: 5,
    averageTip: 4.00,
    lastRideDate: '2024-01-14',
  },
  {
    id: 'p3',
    name: 'Michael Chen',
    phone: '+1 (555) 345-6789',
    email: 'mchen@email.com',
    rating: 4.7,
    totalRides: 8,
    averageTip: 5.50,
    lastRideDate: '2024-01-14',
  },
];

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

export default function CustomersScreen() {
  const params = useLocalSearchParams();
  const customerId = params.id as string | undefined;
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(
    customerId ? MOCK_CUSTOMERS.find(c => c.id === customerId) || null : null
  );

  if (selectedCustomer) {
    const customerRides = MOCK_RIDE_HISTORY.filter(
      ride => ride.passengerId === selectedCustomer.id
    );

    return (
      <View style={styles.container}>
        <Stack.Screen options={{ 
          headerShown: true,
          title: 'Customer Profile',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
        }} />

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <User size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.customerName}>{selectedCustomer.name}</Text>

            <View style={styles.ratingContainer}>
              <Star size={20} color={COLORS.warning} fill={COLORS.warning} />
              <Text style={styles.ratingValue}>{selectedCustomer.rating.toFixed(1)}</Text>
              <Text style={styles.ratingLabel}>({selectedCustomer.totalRides} rides)</Text>
            </View>

            <View style={styles.contactInfo}>
              {selectedCustomer.phone && (
                <View style={styles.contactRow}>
                  <Phone size={16} color={COLORS.textSecondary} />
                  <Text style={styles.contactText}>{selectedCustomer.phone}</Text>
                </View>
              )}
              {selectedCustomer.email && (
                <View style={styles.contactRow}>
                  <Mail size={16} color={COLORS.textSecondary} />
                  <Text style={styles.contactText}>{selectedCustomer.email}</Text>
                </View>
              )}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{selectedCustomer.totalRides}</Text>
                <Text style={styles.statLabel}>Total Rides</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>${selectedCustomer.averageTip.toFixed(2)}</Text>
                <Text style={styles.statLabel}>Avg Tip</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {new Date(selectedCustomer.lastRideDate || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
                <Text style={styles.statLabel}>Last Ride</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Ride History</Text>
          {customerRides.map(ride => (
            <View key={ride.id} style={styles.rideCard}>
              <View style={styles.rideHeader}>
                <Calendar size={16} color={COLORS.textSecondary} />
                <Text style={styles.rideDate}>
                  {new Date(ride.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric',
                  })}
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
                <View style={styles.rideRating}>
                  <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
                  <Text style={styles.ratingText}>{ride.rating}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true,
        title: 'Customers',
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
      }} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Frequent Customers</Text>
        {MOCK_CUSTOMERS.map(customer => (
          <TouchableOpacity
            key={customer.id}
            style={styles.customerCard}
            onPress={() => setSelectedCustomer(customer)}
          >
            <View style={styles.customerHeader}>
              <View style={styles.avatarSmall}>
                <User size={24} color={COLORS.primary} />
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerNameText}>{customer.name}</Text>
                <View style={styles.customerStats}>
                  <View style={styles.ratingSmall}>
                    <Star size={12} color={COLORS.warning} fill={COLORS.warning} />
                    <Text style={styles.ratingSmallText}>{customer.rating.toFixed(1)}</Text>
                  </View>
                  <Text style={styles.rideCount}>{customer.totalRides} rides</Text>
                </View>
              </View>
              <View style={styles.tipBadge}>
                <Text style={styles.tipBadgeText}>
                  ${customer.averageTip.toFixed(0)} avg tip
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
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
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  customerName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  ratingValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  ratingLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  contactInfo: {
    width: '100%',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  contactText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
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
  customerCard: {
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
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  customerInfo: {
    flex: 1,
  },
  customerNameText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  customerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  ratingSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingSmallText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  rideCount: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  tipBadge: {
    backgroundColor: COLORS.success + '20',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  tipBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.success,
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
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  rideDate: {
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
});
