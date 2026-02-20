import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useDriverPreferences } from '@/hooks/useDriverPreferences';
import { useAutomationStore } from '@/store/automationStore';
import { 
  Save, 
  DollarSign, 
  Navigation, 
  Zap, 
  Bot,
  Clock,
  Calendar,
  Target,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { Button } from '@/components/Button';
import type { StrategyMode } from '@/types';

type ScheduleMode = 'asap_only' | 'weekly_schedule' | 'flexible';

export default function ParametersScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const { 
    state, 
    updatePersonalPreferences, 
    isLoading 
  } = useDriverPreferences();

  const { preferences: automationPrefs, updatePreferences: updateAutomation } = useAutomationStore();

  const [minDollarsPerMile, setMinDollarsPerMile] = useState('');
  const [minTripPayout, setMinTripPayout] = useState('');
  const [maxPickupDistance, setMaxPickupDistance] = useState('');
  const [targetHourlyRate, setTargetHourlyRate] = useState('');
  const [maxDailyHours, setMaxDailyHours] = useState('');
  
  const [autoBidEnabled, setAutoBidEnabled] = useState(false);
  const [autoBidMinPayout, setAutoBidMinPayout] = useState('15');
  const [autoBidMaxDistance, setAutoBidMaxDistance] = useState('20');
  const [autoBidPercentAbove, setAutoBidPercentAbove] = useState('10');
  
  const [autoAcceptEnabled, setAutoAcceptEnabled] = useState(false);
  const [autoAcceptMinPayout, setAutoAcceptMinPayout] = useState('20');
  const [autoAcceptMaxDistance, setAutoAcceptMaxDistance] = useState('15');
  const [autoDeclineEnabled, setAutoDeclineEnabled] = useState(false);
  const [autoDeclineBelowPayout, setAutoDeclineBelowPayout] = useState('8');
  const [autoDeclineAboveDistance, setAutoDeclineAboveDistance] = useState('30');
  
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('flexible');
  const [strategyMode, setStrategyMode] = useState<StrategyMode>('balanced');

  const [expandedSection, setExpandedSection] = useState<string | null>('automation');
  
  useEffect(() => {
    if (!isLoading) {
      const prefs = state.personal;
      setMinDollarsPerMile(prefs.min_dollars_per_mile.toString());
      setMinTripPayout(prefs.min_trip_payout.toString());
      setMaxPickupDistance(prefs.max_unpaid_pickup_distance_miles.toString());
      setTargetHourlyRate(prefs.target_hourly_rate.toString());
      setMaxDailyHours(prefs.max_daily_hours.toString());
      setStrategyMode(prefs.strategy_mode);
      
      setAutoBidEnabled(automationPrefs.autoBid);
      setAutoAcceptEnabled(automationPrefs.autoAccept);
      setAutoBidMinPayout(automationPrefs.minPayout.toString());
      setAutoBidMaxDistance(automationPrefs.maxDistance.toString());
      setAutoAcceptMinPayout(automationPrefs.minPayout.toString());
      setAutoAcceptMaxDistance(automationPrefs.maxDistance.toString());
    }
  }, [isLoading, state.personal, automationPrefs]);

  const handleSave = async () => {
    await updatePersonalPreferences({
      min_dollars_per_mile: parseFloat(minDollarsPerMile) || 1.0,
      min_trip_payout: parseFloat(minTripPayout) || 5.0,
      max_unpaid_pickup_distance_miles: parseFloat(maxPickupDistance) || 10,
      target_hourly_rate: parseFloat(targetHourlyRate) || 20,
      max_daily_hours: parseFloat(maxDailyHours) || 12,
      strategy_mode: strategyMode,
    });

    updateAutomation({
      autoBid: autoBidEnabled,
      autoAccept: autoAcceptEnabled,
      minPayout: parseFloat(autoBidMinPayout) || 15,
      maxDistance: parseFloat(autoBidMaxDistance) || 20,
    });

    router.back();
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'AI Driver Settings',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }} 
      />

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.strategyCard}>
          <View style={styles.strategyHeader}>
            <Bot size={24} color={colors.primary} />
            <Text style={styles.strategyTitle}>AI Strategy Mode</Text>
          </View>
          <Text style={styles.strategyDescription}>
            Choose how aggressively the AI should pursue rides
          </Text>
          <View style={styles.strategyButtons}>
            {(['aggressive', 'balanced', 'conservative'] as StrategyMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.strategyButton,
                  strategyMode === mode && styles.strategyButtonActive,
                ]}
                onPress={() => setStrategyMode(mode)}
              >
                <Text style={[
                  styles.strategyButtonText,
                  strategyMode === mode && styles.strategyButtonTextActive,
                ]}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
                <Text style={[
                  styles.strategyButtonSubtext,
                  strategyMode === mode && styles.strategyButtonSubtextActive,
                ]}>
                  {mode === 'aggressive' && 'Max rides, lower standards'}
                  {mode === 'balanced' && 'Smart balance'}
                  {mode === 'conservative' && 'Quality over quantity'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => toggleSection('autoBid')}
        >
          <View style={styles.sectionHeaderLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.success + '20' }]}>
              <DollarSign size={20} color={colors.success} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Auto Bid</Text>
              <Text style={styles.sectionSubtitle}>
                {autoBidEnabled ? 'On' : 'Off'} • Auto-place bids on matching rides
              </Text>
            </View>
          </View>
          {expandedSection === 'autoBid' ? (
            <ChevronUp size={20} color={colors.textSecondary} />
          ) : (
            <ChevronDown size={20} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
        
        {expandedSection === 'autoBid' && (
          <View style={styles.sectionContent}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Enable Auto Bid</Text>
              <Switch
                value={autoBidEnabled}
                onValueChange={setAutoBidEnabled}
                trackColor={{ false: colors.border, true: colors.success }}
              />
            </View>
            
            {autoBidEnabled && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Min Payout to Bid ($)</Text>
                  <TextInput
                    style={styles.input}
                    value={autoBidMinPayout}
                    onChangeText={setAutoBidMinPayout}
                    keyboardType="decimal-pad"
                    placeholder="15"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Max Pickup Distance (miles)</Text>
                  <TextInput
                    style={styles.input}
                    value={autoBidMaxDistance}
                    onChangeText={setAutoBidMaxDistance}
                    keyboardType="decimal-pad"
                    placeholder="20"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bid % Above Offer</Text>
                  <TextInput
                    style={styles.input}
                    value={autoBidPercentAbove}
                    onChangeText={setAutoBidPercentAbove}
                    keyboardType="decimal-pad"
                    placeholder="10"
                    placeholderTextColor={colors.textTertiary}
                  />
                  <Text style={styles.inputHint}>
                    AI will bid {autoBidPercentAbove || '10'}% above the listed offer
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => toggleSection('autoAccept')}
        >
          <View style={styles.sectionHeaderLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.primary + '20' }]}>
              <Zap size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Auto Accept / Deny</Text>
              <Text style={styles.sectionSubtitle}>
                Accept: {autoAcceptEnabled ? 'On' : 'Off'} • Deny: {autoDeclineEnabled ? 'On' : 'Off'}
              </Text>
            </View>
          </View>
          {expandedSection === 'autoAccept' ? (
            <ChevronUp size={20} color={colors.textSecondary} />
          ) : (
            <ChevronDown size={20} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
        
        {expandedSection === 'autoAccept' && (
          <View style={styles.sectionContent}>
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Auto Accept</Text>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Enable Auto Accept</Text>
                <Switch
                  value={autoAcceptEnabled}
                  onValueChange={setAutoAcceptEnabled}
                  trackColor={{ false: colors.border, true: colors.success }}
                />
              </View>
              
              {autoAcceptEnabled && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Min Payout to Accept ($)</Text>
                    <TextInput
                      style={styles.input}
                      value={autoAcceptMinPayout}
                      onChangeText={setAutoAcceptMinPayout}
                      keyboardType="decimal-pad"
                      placeholder="20"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Max Pickup Distance (miles)</Text>
                    <TextInput
                      style={styles.input}
                      value={autoAcceptMaxDistance}
                      onChangeText={setAutoAcceptMaxDistance}
                      keyboardType="decimal-pad"
                      placeholder="15"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                </>
              )}
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Auto Deny</Text>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Enable Auto Deny</Text>
                <Switch
                  value={autoDeclineEnabled}
                  onValueChange={setAutoDeclineEnabled}
                  trackColor={{ false: colors.border, true: colors.danger }}
                />
              </View>
              
              {autoDeclineEnabled && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Deny if Payout Below ($)</Text>
                    <TextInput
                      style={styles.input}
                      value={autoDeclineBelowPayout}
                      onChangeText={setAutoDeclineBelowPayout}
                      keyboardType="decimal-pad"
                      placeholder="8"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Deny if Distance Above (miles)</Text>
                    <TextInput
                      style={styles.input}
                      value={autoDeclineAboveDistance}
                      onChangeText={setAutoDeclineAboveDistance}
                      keyboardType="decimal-pad"
                      placeholder="30"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => toggleSection('schedule')}
        >
          <View style={styles.sectionHeaderLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.warning + '20' }]}>
              <Calendar size={20} color={colors.warning} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Ride Scheduling</Text>
              <Text style={styles.sectionSubtitle}>
                {scheduleMode === 'asap_only' && 'ASAP rides only'}
                {scheduleMode === 'weekly_schedule' && 'Based on weekly schedule'}
                {scheduleMode === 'flexible' && 'Flexible availability'}
              </Text>
            </View>
          </View>
          {expandedSection === 'schedule' ? (
            <ChevronUp size={20} color={colors.textSecondary} />
          ) : (
            <ChevronDown size={20} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
        
        {expandedSection === 'schedule' && (
          <View style={styles.sectionContent}>
            <Text style={styles.inputLabel}>Future Ride Mode</Text>
            <View style={styles.scheduleOptions}>
              <TouchableOpacity
                style={[
                  styles.scheduleOption,
                  scheduleMode === 'asap_only' && styles.scheduleOptionActive,
                ]}
                onPress={() => setScheduleMode('asap_only')}
              >
                <Clock size={20} color={scheduleMode === 'asap_only' ? colors.background : colors.text} />
                <Text style={[
                  styles.scheduleOptionTitle,
                  scheduleMode === 'asap_only' && styles.scheduleOptionTitleActive,
                ]}>ASAP Only</Text>
                <Text style={[
                  styles.scheduleOptionDesc,
                  scheduleMode === 'asap_only' && styles.scheduleOptionDescActive,
                ]}>Only accept immediate rides</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.scheduleOption,
                  scheduleMode === 'weekly_schedule' && styles.scheduleOptionActive,
                ]}
                onPress={() => setScheduleMode('weekly_schedule')}
              >
                <Calendar size={20} color={scheduleMode === 'weekly_schedule' ? colors.background : colors.text} />
                <Text style={[
                  styles.scheduleOptionTitle,
                  scheduleMode === 'weekly_schedule' && styles.scheduleOptionTitleActive,
                ]}>Weekly Schedule</Text>
                <Text style={[
                  styles.scheduleOptionDesc,
                  scheduleMode === 'weekly_schedule' && styles.scheduleOptionDescActive,
                ]}>AI builds schedule from your availability</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.scheduleOption,
                  scheduleMode === 'flexible' && styles.scheduleOptionActive,
                ]}
                onPress={() => setScheduleMode('flexible')}
              >
                <Target size={20} color={scheduleMode === 'flexible' ? colors.background : colors.text} />
                <Text style={[
                  styles.scheduleOptionTitle,
                  scheduleMode === 'flexible' && styles.scheduleOptionTitleActive,
                ]}>Flexible</Text>
                <Text style={[
                  styles.scheduleOptionDesc,
                  scheduleMode === 'flexible' && styles.scheduleOptionDescActive,
                ]}>Mix of ASAP and scheduled rides</Text>
              </TouchableOpacity>
            </View>
            
            {scheduleMode === 'weekly_schedule' && (
              <View style={styles.scheduleNote}>
                <Shield size={16} color={colors.primary} />
                <Text style={styles.scheduleNoteText}>
                  AI will auto-accept future rides that fit your weekly availability windows set in your profile.
                </Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => toggleSection('thresholds')}
        >
          <View style={styles.sectionHeaderLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.accent + '20' }]}>
              <Navigation size={20} color={colors.accent} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Ride Thresholds</Text>
              <Text style={styles.sectionSubtitle}>
                Min $/mi: ${minDollarsPerMile || '0'} • Max hours: {maxDailyHours || '0'}
              </Text>
            </View>
          </View>
          {expandedSection === 'thresholds' ? (
            <ChevronUp size={20} color={colors.textSecondary} />
          ) : (
            <ChevronDown size={20} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
        
        {expandedSection === 'thresholds' && (
          <View style={styles.sectionContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Min Earnings per Mile ($)</Text>
              <TextInput
                style={styles.input}
                value={minDollarsPerMile}
                onChangeText={setMinDollarsPerMile}
                keyboardType="decimal-pad"
                placeholder="1.50"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Min Trip Payout ($)</Text>
              <TextInput
                style={styles.input}
                value={minTripPayout}
                onChangeText={setMinTripPayout}
                keyboardType="decimal-pad"
                placeholder="8.00"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Hourly Rate ($)</Text>
              <TextInput
                style={styles.input}
                value={targetHourlyRate}
                onChangeText={setTargetHourlyRate}
                keyboardType="decimal-pad"
                placeholder="25.00"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Max Unpaid Pickup Distance (miles)</Text>
              <TextInput
                style={styles.input}
                value={maxPickupDistance}
                onChangeText={setMaxPickupDistance}
                keyboardType="decimal-pad"
                placeholder="5"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Max Daily Driving Hours</Text>
              <TextInput
                style={styles.input}
                value={maxDailyHours}
                onChangeText={setMaxDailyHours}
                keyboardType="decimal-pad"
                placeholder="10"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Allow Late Night Rides</Text>
              <Switch
                value={state.personal.allow_late_night}
                onValueChange={(value) => updatePersonalPreferences({ allow_late_night: value })}
                trackColor={{ false: colors.border, true: colors.success }}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Burnout Protection</Text>
              <Switch
                value={state.personal.burnout_protection_enabled}
                onValueChange={(value) => updatePersonalPreferences({ burnout_protection_enabled: value })}
                trackColor={{ false: colors.border, true: colors.success }}
              />
            </View>
          </View>
        )}

        <Button
          title="Save All Settings"
          onPress={handleSave}
          icon={<Save size={20} color={colors.background} />}
          style={styles.saveButton}
        />

      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  strategyCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: colors.primary + '30',
  },
  strategyHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  strategyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700' as const,
    color: colors.text,
  },
  strategyDescription: {
    fontSize: FONT_SIZE.sm,
    color: colors.textSecondary,
    marginBottom: SPACING.md,
  },
  strategyButtons: {
    gap: SPACING.sm,
  },
  strategyButton: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  strategyButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  strategyButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600' as const,
    color: colors.text,
  },
  strategyButtonTextActive: {
    color: colors.background,
  },
  strategyButtonSubtext: {
    fontSize: FONT_SIZE.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  strategyButtonSubtextActive: {
    color: colors.background,
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: colors.card,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xs,
  },
  sectionHeaderLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: SPACING.md,
    flex: 1,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600' as const,
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionContent: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    marginTop: -SPACING.xs,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  subSection: {
    marginBottom: SPACING.sm,
  },
  subSectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: SPACING.md,
  },
  toggleRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: SPACING.sm,
  },
  toggleLabel: {
    fontSize: FONT_SIZE.md,
    color: colors.text,
    flex: 1,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputHint: {
    fontSize: FONT_SIZE.xs,
    color: colors.textTertiary,
    marginTop: SPACING.xs,
  },
  scheduleOptions: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  scheduleOption: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: SPACING.md,
  },
  scheduleOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  scheduleOptionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600' as const,
    color: colors.text,
  },
  scheduleOptionTitleActive: {
    color: colors.background,
  },
  scheduleOptionDesc: {
    fontSize: FONT_SIZE.xs,
    color: colors.textSecondary,
    flex: 1,
  },
  scheduleOptionDescActive: {
    color: colors.background,
    opacity: 0.8,
  },
  scheduleNote: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: SPACING.sm,
    backgroundColor: colors.primaryLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  scheduleNoteText: {
    fontSize: FONT_SIZE.sm,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  saveButton: {
    marginTop: SPACING.lg,
  },
});
