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
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { useDriverPreferences, generateAiSuggestedPreferences } from '@/hooks/useDriverPreferences';
import { Save, DollarSign, Navigation, Zap, Sparkles, RefreshCw } from 'lucide-react-native';
import { Button } from '@/components/Button';
import type { StrategyMode, DriverPreferences } from '@/types';

export default function ParametersScreen() {
  const { 
    state, 
    updatePersonalPreferences, 
    isLoading 
  } = useDriverPreferences();

  // Local state for form inputs to avoid stuttering while typing
  const [minDollarsPerMile, setMinDollarsPerMile] = useState('');
  const [minTripPayout, setMinTripPayout] = useState('');
  const [maxPickupDistance, setMaxPickupDistance] = useState('');
  const [targetHourlyRate, setTargetHourlyRate] = useState('');
  const [maxDailyHours, setMaxDailyHours] = useState('');
  
  const [aiSuggestions, setAiSuggestions] = useState<DriverPreferences | null>(null);
  const [showAiComparison, setShowAiComparison] = useState(false);
  const [todayGoal, setTodayGoal] = useState('150');
  const [todayHours, setTodayHours] = useState('8');
  const [strategyMode, setStrategyMode] = useState<StrategyMode>('balanced');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Load values when state is ready
  useEffect(() => {
    if (!isLoading) {
      const prefs = state.personal;
      setMinDollarsPerMile(prefs.min_dollars_per_mile.toString());
      setMinTripPayout(prefs.min_trip_payout.toString());
      setMaxPickupDistance(prefs.max_unpaid_pickup_distance_miles.toString());
      setTargetHourlyRate(prefs.target_hourly_rate.toString());
      setMaxDailyHours(prefs.max_daily_hours.toString());
    }
  }, [isLoading, state.personal]);

  const handleSave = async () => {
    await updatePersonalPreferences({
      min_dollars_per_mile: parseFloat(minDollarsPerMile) || 1.0,
      min_trip_payout: parseFloat(minTripPayout) || 5.0,
      max_unpaid_pickup_distance_miles: parseFloat(maxPickupDistance) || 10,
      target_hourly_rate: parseFloat(targetHourlyRate) || 20,
      max_daily_hours: parseFloat(maxDailyHours) || 12,
    });
    router.back();
  };

  const handleGenerateAiSuggestions = () => {
    setIsGenerating(true);
    const goal = parseFloat(todayGoal) || 150;
    const hours = parseFloat(todayHours) || 8;
    
    const suggestions = generateAiSuggestedPreferences(state.personal, {
      today_goal_earnings: goal,
      today_available_hours: hours,
      strategy_mode: strategyMode,
    });
    
    setAiSuggestions(suggestions);
    setShowAiComparison(true);
    setTimeout(() => setIsGenerating(false), 500);
  };

  const handleApplyAiSuggestions = async () => {
    if (!aiSuggestions) return;
    
    await updatePersonalPreferences({
      min_dollars_per_mile: aiSuggestions.min_dollars_per_mile,
      min_trip_payout: aiSuggestions.min_trip_payout,
      max_unpaid_pickup_distance_miles: aiSuggestions.max_unpaid_pickup_distance_miles,
      target_hourly_rate: aiSuggestions.target_hourly_rate,
      max_daily_hours: aiSuggestions.max_daily_hours,
    });
    
    setMinDollarsPerMile(aiSuggestions.min_dollars_per_mile.toFixed(2));
    setMinTripPayout(aiSuggestions.min_trip_payout.toFixed(2));
    setMaxPickupDistance(aiSuggestions.max_unpaid_pickup_distance_miles.toFixed(1));
    setTargetHourlyRate(aiSuggestions.target_hourly_rate.toFixed(2));
    setMaxDailyHours(aiSuggestions.max_daily_hours.toFixed(1));
    
    setShowAiComparison(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Driver Parameters',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
        }} 
      />

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Header Info */}
        <View style={styles.headerInfo}>
          <Text style={styles.headerDescription}>
            These are your baseline personal preferences. AI suggestions will be based on these settings.
          </Text>
        </View>

        {/* AI Fill Section */}
        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <Sparkles size={24} color={COLORS.primary} />
            <Text style={styles.aiTitle}>AI Recommendations</Text>
          </View>
          <Text style={styles.aiDescription}>
            Let AI suggest optimal parameters based on your goals.
          </Text>

          <View style={styles.aiInputs}>
            <View style={styles.aiInputRow}>
              <View style={styles.aiInputGroup}>
                <Text style={styles.aiInputLabel}>Target Earnings ($)</Text>
                <TextInput
                  style={styles.aiInput}
                  value={todayGoal}
                  onChangeText={setTodayGoal}
                  keyboardType="decimal-pad"
                  placeholder="150"
                  placeholderTextColor={COLORS.textTertiary}
                />
              </View>

              <View style={styles.aiInputGroup}>
                <Text style={styles.aiInputLabel}>Available Hours</Text>
                <TextInput
                  style={styles.aiInput}
                  value={todayHours}
                  onChangeText={setTodayHours}
                  keyboardType="decimal-pad"
                  placeholder="8"
                  placeholderTextColor={COLORS.textTertiary}
                />
              </View>
            </View>

            <View style={styles.strategySelector}>
              <Text style={styles.strategyLabel}>Strategy Mode</Text>
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
                    <Text
                      style={[
                        styles.strategyButtonText,
                        strategyMode === mode && styles.strategyButtonTextActive,
                      ]}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Button
              title={isGenerating ? "Generating..." : "Generate AI Suggestions"}
              onPress={handleGenerateAiSuggestions}
              icon={<Sparkles size={20} color={COLORS.background} />}
              style={styles.generateButton}
              disabled={isGenerating}
            />
          </View>

          {showAiComparison && aiSuggestions && (
            <View style={styles.comparisonSection}>
              <View style={styles.comparisonHeader}>
                <Text style={styles.comparisonTitle}>AI vs Your Settings</Text>
                <TouchableOpacity 
                  style={styles.resetButton}
                  onPress={() => setShowAiComparison(false)}
                >
                  <Text style={styles.resetButtonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.comparisonRow}>
                <View style={styles.comparisonCell}>
                  <Text style={styles.comparisonLabel}>Min $/Mile</Text>
                  <Text style={styles.comparisonValueCurrent}>${state.personal.min_dollars_per_mile.toFixed(2)}</Text>
                </View>
                <View style={styles.comparisonArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
                <View style={styles.comparisonCell}>
                  <Text style={styles.comparisonLabel}>AI Suggests</Text>
                  <Text style={styles.comparisonValueAi}>${aiSuggestions.min_dollars_per_mile.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.comparisonRow}>
                <View style={styles.comparisonCell}>
                  <Text style={styles.comparisonLabel}>Min Trip Payout</Text>
                  <Text style={styles.comparisonValueCurrent}>${state.personal.min_trip_payout.toFixed(2)}</Text>
                </View>
                <View style={styles.comparisonArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
                <View style={styles.comparisonCell}>
                  <Text style={styles.comparisonLabel}>AI Suggests</Text>
                  <Text style={styles.comparisonValueAi}>${aiSuggestions.min_trip_payout.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.comparisonRow}>
                <View style={styles.comparisonCell}>
                  <Text style={styles.comparisonLabel}>Max Pickup Distance</Text>
                  <Text style={styles.comparisonValueCurrent}>{state.personal.max_unpaid_pickup_distance_miles.toFixed(1)} mi</Text>
                </View>
                <View style={styles.comparisonArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
                <View style={styles.comparisonCell}>
                  <Text style={styles.comparisonLabel}>AI Suggests</Text>
                  <Text style={styles.comparisonValueAi}>{aiSuggestions.max_unpaid_pickup_distance_miles.toFixed(1)} mi</Text>
                </View>
              </View>

              <View style={styles.comparisonRow}>
                <View style={styles.comparisonCell}>
                  <Text style={styles.comparisonLabel}>Target $/Hour</Text>
                  <Text style={styles.comparisonValueCurrent}>${state.personal.target_hourly_rate.toFixed(2)}</Text>
                </View>
                <View style={styles.comparisonArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
                <View style={styles.comparisonCell}>
                  <Text style={styles.comparisonLabel}>AI Suggests</Text>
                  <Text style={styles.comparisonValueAi}>${aiSuggestions.target_hourly_rate.toFixed(2)}</Text>
                </View>
              </View>

              <Button
                title="Apply AI Suggestions to Personal Settings"
                onPress={handleApplyAiSuggestions}
                icon={<RefreshCw size={20} color={COLORS.background} />}
                style={styles.applyButton}
              />
            </View>
          )}
        </View>

        {/* Financial Parameters */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Financial Goals</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Minimum Earnings per Mile ($)</Text>
            <TextInput
              style={styles.input}
              value={minDollarsPerMile}
              onChangeText={setMinDollarsPerMile}
              keyboardType="decimal-pad"
              placeholder="1.50"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Minimum Trip Payout ($)</Text>
            <TextInput
              style={styles.input}
              value={minTripPayout}
              onChangeText={setMinTripPayout}
              keyboardType="decimal-pad"
              placeholder="8.00"
              placeholderTextColor={COLORS.textTertiary}
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
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>
        </View>

        {/* Distance & Time Parameters */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Navigation size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Distance & Time</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Max Unpaid Pickup Distance (miles)</Text>
            <TextInput
              style={styles.input}
              value={maxPickupDistance}
              onChangeText={setMaxPickupDistance}
              keyboardType="decimal-pad"
              placeholder="5"
              placeholderTextColor={COLORS.textTertiary}
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
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>
        </View>

        {/* Other Toggles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Zap size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Allow Late Night Rides</Text>
            <Switch
              value={state.personal.allow_late_night}
              onValueChange={(value) => updatePersonalPreferences({ allow_late_night: value })}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Burnout Protection</Text>
            <Switch
              value={state.personal.burnout_protection_enabled}
              onValueChange={(value) => updatePersonalPreferences({ burnout_protection_enabled: value })}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
            />
          </View>
        </View>

        <Button
          title="Save Personal Preferences"
          onPress={handleSave}
          icon={<Save size={20} color={COLORS.background} />}
          style={styles.saveButton}
        />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    padding: SPACING.lg,
  },
  headerInfo: {
    marginBottom: SPACING.lg,
  },
  headerDescription: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  rowLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveButton: {
    marginBottom: SPACING.xl,
  },
  aiSection: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: COLORS.primary + '20',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  aiTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  aiDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  aiInputs: {
    gap: SPACING.md,
  },
  aiInputRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  aiInputGroup: {
    flex: 1,
  },
  aiInputLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  aiInput: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  strategySelector: {
    gap: SPACING.xs,
  },
  strategyLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  strategyButtons: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  strategyButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  strategyButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  strategyButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  strategyButtonTextActive: {
    color: COLORS.background,
  },
  generateButton: {
    marginTop: SPACING.xs,
  },
  comparisonSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  comparisonTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  resetButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  resetButtonText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  comparisonCell: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  comparisonArrow: {
    paddingHorizontal: SPACING.xs,
  },
  arrowText: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.primary,
    fontWeight: '700',
  },
  comparisonLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
    fontWeight: '600',
  },
  comparisonValueCurrent: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  comparisonValueAi: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  applyButton: {
    marginTop: SPACING.md,
  },
});
