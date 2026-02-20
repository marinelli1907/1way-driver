import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useSafety } from '@/hooks/useSafety';
import { mockAvailableJobs } from '@/mocks/jobs';
import { Ride, Job } from '@/types';
import { SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Clock, Sliders, AlertTriangle, Camera, Shield, AlertCircle } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { RideCardSkeleton } from '@/components/RideCardSkeleton';
import { SwipeableRideCard } from '@/components/SwipeableRideCard';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const { getSafetyStatus, safetyState } = useSafety();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filterDistance] = useState(20);
  
  const safetyStatus = getSafetyStatus();
  const styles = createStyles(colors);
  
  const fetchRides = async () => {
    try {
      setError(null);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mappedRides: Ride[] = mockAvailableJobs.map((job: Job) => ({
        id: parseInt(job.id.replace('job-', '')),
        pickup_address: job.pickupLocation.address,
        dropoff_address: job.dropoffLocation.address,
        pickup_time: job.pickupTime,
        status: job.status === 'pending' ? 'open' : 'assigned',
        price_offer: job.driverShare,
        distance_miles: job.distance,
        rider_name: job.passengerName,
        requiresBid: job.requiresBid,
      }));
      
      setRides(mappedRides);
    } catch (error: any) {
      console.error('Error fetching rides:', error);
      setError(error?.message || 'Failed to load rides');
      setRides([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRides();
  };

  const handleBid = (ride: Ride, amount: number) => {
    if (!safetyStatus.can_accept_more_driving && safetyState.settings.allow_ai_to_block_jobs_when_over_hours) {
      Alert.alert(
        "Safety Limit Reached",
        "You've reached your safety limit for today. Please take a break before accepting more jobs.",
        [
          { text: "OK" },
          { text: "Update Settings", onPress: () => router.push('/settings/safety') },
        ]
      );
      return;
    }
    
    submitBid(ride.id, amount);
  };

  const submitBid = async (rideId: number, amount: number) => {
      try {
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log(`Bid placed: Ride ${rideId}, Amount: ${amount}`);
          Alert.alert("Success", `Bid of ${amount} sent!`);
          fetchRides();
      } catch {
          Alert.alert("Error", "Failed to send bid");
      }
  };

  const handleAccept = async (ride: Ride) => {
      if (!safetyStatus.can_accept_more_driving && safetyState.settings.allow_ai_to_block_jobs_when_over_hours) {
        Alert.alert(
          "Safety Limit Reached",
          "You've reached your safety limit for today. Please take a break before accepting more jobs.",
          [
            { text: "OK" },
            { text: "Update Settings", onPress: () => router.push('/settings/safety') },
          ]
        );
        return;
      }

      try {
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log(`Ride accepted: ${ride.id} at ${ride.price_offer}`);
          Alert.alert("Success", "Ride accepted at offer price!");
          fetchRides();
      } catch {
          Alert.alert("Error", "Failed to accept ride");
      }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <View>
            <Text style={styles.greeting}>Hi, {user?.name || 'Driver'}</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>
        <View style={styles.availabilityContainer}>
            <Text style={styles.availabilityText}>{available ? 'Online' : 'Offline'}</Text>
            <Switch 
                value={available} 
                onValueChange={setAvailable} 
                trackColor={{ false: colors.border, true: colors.success }}
            />
        </View>
      </View>

      {!safetyStatus.cameras_compliant && (
        <TouchableOpacity 
          style={[styles.banner, styles.cameraBanner]}
          onPress={() => router.push('/settings/safety')}
        >
          <Camera size={20} color={colors.danger} />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Camera setup incomplete</Text>
            <Text style={styles.bannerText}>
              In-cab and outward-facing cameras are required for full 1Way protection.
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {!safetyStatus.can_accept_more_driving && safetyState.settings.allow_ai_to_block_jobs_when_over_hours && (
        <View style={[styles.banner, styles.limitBanner]}>
          <Shield size={20} color={colors.warning} />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Safety limit reached</Text>
            <Text style={styles.bannerText}>
              You&apos;ve reached your safety limit for today. AI will not auto-accept more jobs.
            </Text>
          </View>
        </View>
      )}

      {safetyStatus.needs_break && (
        <View style={[styles.banner, styles.breakBanner]}>
          <AlertTriangle size={20} color={colors.warning} />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Break recommended</Text>
            <Text style={styles.bannerText}>
              You&apos;ve been driving a long stretch. Consider taking at least a 30-minute break.
            </Text>
          </View>
        </View>
      )}

      <View style={styles.filtersRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            <TouchableOpacity style={styles.filterChip}>
                <Text style={styles.filterText}>Distance: {filterDistance}mi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
                <Text style={styles.filterText}>Min Pay: $15</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
                <Text style={styles.filterText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.filterChip, styles.settingsChip]}
                onPress={() => Alert.alert("Auto-bid", "Settings UI coming soon")}
            >
                <Sliders size={16} color={colors.primary} />
            </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && !refreshing ? (
          <>
            <RideCardSkeleton />
            <RideCardSkeleton />
            <RideCardSkeleton />
          </>
        ) : error ? (
          <View style={styles.errorState}>
            <AlertCircle size={48} color={colors.danger} />
            <Text style={styles.errorTitle}>Unable to load rides</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Button 
              title="Retry" 
              onPress={() => {
                setLoading(true);
                fetchRides();
              }}
              style={{ marginTop: SPACING.lg }}
            />
          </View>
        ) : rides.length === 0 ? (
            <View style={styles.emptyState}>
                <Clock size={48} color={colors.textSecondary} />
                <Text style={styles.emptyTitle}>No rides available</Text>
                <Text style={styles.emptyText}>New rides will appear here when they match your preferences</Text>
            </View>
        ) : (
            rides.map((ride) => (
                <SwipeableRideCard
                  key={ride.id}
                  ride={ride}
                  onAccept={handleAccept}
                  onBid={handleBid}
                  onReject={(ride) => {
                    console.log(`Ride rejected: ${ride.id}`);
                    setRides(rides.filter(r => r.id !== ride.id));
                  }}
                  requiresBid={ride.requiresBid}
                />
            ))
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    backgroundColor: colors.background,
    padding: SPACING.lg,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: colors.text,
  },
  date: {
    fontSize: FONT_SIZE.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  availabilityContainer: {
    alignItems: 'center',
  },
  availabilityText: {
    fontSize: FONT_SIZE.xs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  filtersRow: {
    backgroundColor: colors.background,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsChip: {
      paddingHorizontal: SPACING.sm,
  },
  filterText: {
    fontSize: FONT_SIZE.sm,
    color: colors.text,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  errorState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  errorTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: colors.danger,
    marginTop: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  banner: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'flex-start',
  },
  cameraBanner: {
    backgroundColor: colors.dangerLight,
  },
  limitBanner: {
    backgroundColor: colors.warningLight,
  },
  breakBanner: {
    backgroundColor: colors.warningLight,
  },
  bannerTextContainer: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  bannerTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  bannerText: {
    fontSize: FONT_SIZE.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
