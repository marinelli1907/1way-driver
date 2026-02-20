import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { api } from '@/lib/api';
import { Ride } from '@/types';
import { SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Calendar as CalendarIcon, Clock, Navigation, List } from 'lucide-react-native';
import { Button } from '@/components/Button';

// Mock data
const MOCK_SCHEDULE: Ride[] = [
    {
        id: 101,
        pickup_address: "123 Main St, New York, NY",
        dropoff_address: "JFK Airport, Terminal 4",
        pickup_time: new Date().toISOString(),
        price_offer: 45.00,
        status: 'assigned',
    }
];

export default function ScheduleScreen() {
  const { colors } = useTheme();
  const [rides, setRides] = useState<Ride[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const styles = createStyles(colors);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await api.get('/v1/rides', {
          params: { status: ['assigned', 'in_progress'] }
      });
      setRides(response.data);
    } catch {
      console.log('Error fetching schedule, using mock');
      setRides(MOCK_SCHEDULE);
    } finally {
      console.log('[Schedule] Fetch complete');
    }
  };

  const openMaps = (address: string, app: 'apple' | 'google' | 'waze') => {
      const encoded = encodeURIComponent(address);
      let url = '';
      if (app === 'apple') {
          url = `http://maps.apple.com/?daddr=${encoded}`;
      } else if (app === 'google') {
          url = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
      } else {
          url = `waze://?q=${encoded}`;
      }

      Linking.openURL(url).catch(() => {
          Alert.alert("Error", `Could not open ${app} maps.`);
      });
  };

  const showMapOptions = (address: string) => {
      Alert.alert(
          "Open Navigation",
          `Navigate to: ${address}`,
          [
              { text: "Apple Maps", onPress: () => openMaps(address, 'apple') },
              { text: "Google Maps", onPress: () => openMaps(address, 'google') },
              { text: "Waze", onPress: () => openMaps(address, 'waze') },
              { text: "Cancel", style: "cancel" }
          ]
      );
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getRidesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return rides.filter(ride => {
      const rideDate = new Date(ride.pickup_time).toISOString().split('T')[0];
      return rideDate === dateStr;
    });
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Schedule</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <List size={20} color={viewMode === 'list' ? colors.background : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'calendar' && styles.toggleButtonActive]}
            onPress={() => setViewMode('calendar')}
          >
            <CalendarIcon size={20} color={viewMode === 'calendar' ? colors.background : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'list' ? (
        <ScrollView contentContainerStyle={styles.content}>
          {rides.length === 0 ? (
              <View style={styles.emptyState}>
                  <Text>No upcoming rides.</Text>
              </View>
          ) : (
              rides.map(ride => (
                  <TouchableOpacity 
                      key={ride.id} 
                      style={styles.card}
                      activeOpacity={0.9}
                      onPress={() => router.push(`/schedule/ride/${ride.id}`)}
                  >
                      <View style={styles.cardHeader}>
                          <Text style={styles.dateText}>
                              {new Date(ride.pickup_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </Text>
                          <Text style={styles.statusText}>{ride.status.toUpperCase()}</Text>
                      </View>
                      
                      <View style={styles.row}>
                          <Clock size={16} color={colors.textSecondary} />
                          <Text style={styles.timeText}>
                              {new Date(ride.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                      </View>

                      <View style={styles.addressContainer}>
                          <View style={styles.addressRow}>
                              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                              <Text style={styles.addressText}>{ride.pickup_address}</Text>
                          </View>
                          <View style={styles.line} />
                          <View style={styles.addressRow}>
                              <View style={[styles.dot, { backgroundColor: colors.accent }]} />
                              <Text style={styles.addressText}>{ride.dropoff_address}</Text>
                          </View>
                      </View>

                      <View style={styles.actionRow}>
                          <Button 
                              title="Navigate to Pickup"
                              onPress={() => showMapOptions(ride.pickup_address)}
                              icon={<Navigation size={16} color="white" />}
                              style={{ flex: 1 }}
                          />
                      </View>
                  </TouchableOpacity>
              ))
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                onPress={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                style={styles.monthNav}
              >
                <Text style={styles.monthNavText}>{'<'}</Text>
              </TouchableOpacity>
              <Text style={styles.monthText}>
                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                style={styles.monthNav}
              >
                <Text style={styles.monthNavText}>{'>'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysRow}>
              {weekDays.map(day => (
                <View key={day} style={styles.weekDayCell}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {getDaysInMonth(selectedDate).map((day, index) => {
                if (!day) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }
                const dayRides = getRidesForDate(day);
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <TouchableOpacity
                    key={day.toISOString()}
                    style={[styles.dayCell, isToday && styles.todayCell]}
                    onPress={() => {
                      if (dayRides.length > 0) {
                        router.push(`/schedule/ride/${dayRides[0].id}`);
                      }
                    }}
                  >
                    <Text style={[styles.dayText, isToday && styles.todayText]}>
                      {day.getDate()}
                    </Text>
                    {dayRides.length > 0 && (
                      <View style={styles.rideBadge}>
                        <Text style={styles.rideBadgeText}>{dayRides.length}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.selectedDateRides}>
            <Text style={styles.selectedDateTitle}>Rides on selected date</Text>
            {getRidesForDate(selectedDate).length === 0 ? (
              <Text style={styles.noRidesText}>No rides scheduled</Text>
            ) : (
              getRidesForDate(selectedDate).map(ride => (
                <TouchableOpacity
                  key={ride.id}
                  style={styles.miniCard}
                  onPress={() => router.push(`/schedule/ride/${ride.id}`)}
                >
                  <Text style={styles.miniCardTime}>
                    {new Date(ride.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text style={styles.miniCardAddress} numberOfLines={1}>
                    {ride.pickup_address}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700' as const,
    color: colors.text,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: RADIUS.md,
    padding: 4,
  },
  toggleButton: {
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  content: {
    padding: SPACING.lg,
  },
  emptyState: {
      alignItems: 'center' as const,
      marginTop: SPACING.xxl,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: SPACING.sm,
  },
  dateText: {
    fontWeight: '700' as const,
    color: colors.text,
    fontSize: FONT_SIZE.md,
  },
  statusText: {
    fontWeight: '600' as const,
    color: colors.success,
    fontSize: FONT_SIZE.xs,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: SPACING.md,
  },
  timeText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZE.md,
    color: colors.text,
  },
  addressContainer: {
      marginBottom: SPACING.md,
  },
  addressRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
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
      backgroundColor: colors.border,
      marginLeft: 4,
      marginVertical: 2,
  },
  addressText: {
      flex: 1,
      fontSize: FONT_SIZE.sm,
      color: colors.text,
  },
  actionRow: {
      flexDirection: 'row' as const,
  },
  calendarContainer: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  calendarHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: SPACING.md,
  },
  monthNav: {
    padding: SPACING.sm,
  },
  monthNavText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  monthText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700' as const,
    color: colors.text,
  },
  weekDaysRow: {
    flexDirection: 'row' as const,
    marginBottom: SPACING.sm,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center' as const,
    paddingVertical: SPACING.xs,
  },
  weekDayText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  daysGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: SPACING.xs,
    position: 'relative' as const,
  },
  todayCell: {
    backgroundColor: colors.primary + '20',
    borderRadius: RADIUS.sm,
  },
  dayText: {
    fontSize: FONT_SIZE.sm,
    color: colors.text,
  },
  todayText: {
    fontWeight: '700' as const,
    color: colors.primary,
  },
  rideBadge: {
    position: 'absolute' as const,
    bottom: 2,
    backgroundColor: colors.accent,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  rideBadgeText: {
    fontSize: 10,
    color: colors.background,
    fontWeight: '700' as const,
  },
  selectedDateRides: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  selectedDateTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: SPACING.sm,
  },
  noRidesText: {
    fontSize: FONT_SIZE.sm,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    paddingVertical: SPACING.lg,
  },
  miniCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: SPACING.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
  },
  miniCardTime: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600' as const,
    color: colors.text,
    marginRight: SPACING.sm,
  },
  miniCardAddress: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: colors.textSecondary,
  },
});
