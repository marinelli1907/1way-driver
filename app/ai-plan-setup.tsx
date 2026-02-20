import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { useDriverPreferences, generateAiSuggestedPreferences } from '@/hooks/useDriverPreferences';
import { Sparkles, DollarSign, Clock, TrendingUp, ChevronRight } from 'lucide-react-native';
import type { StrategyMode, DriverPreferences } from '@/types';


export default function AiPlanSetupScreen() {
  const {
    state,
    isLoading,
    updateAiTodayPreferences,
    setActiveProfile,
    savePreferencesState,
  } = useDriverPreferences();

  const [goalEarnings, setGoalEarnings] = useState<string>('');
  const [availableHours, setAvailableHours] = useState<string>('');
  const [strategyMode, setStrategyMode] = useState<StrategyMode>('balanced');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [showComparison, setShowComparison] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const aiPrefs = state?.ai_today || state?.personal;
  const personalPrefs = state?.personal;

  const handleGeneratePlan = async () => {
    const earnings = parseFloat(goalEarnings);
    const hours = parseFloat(availableHours);

    if (isNaN(earnings) || earnings <= 0) {
      alert('Please enter a valid earnings goal');
      return;
    }

    if (isNaN(hours) || hours <= 0) {
      alert('Please enter valid hours');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('[AiPlanSetup] Generating AI plan...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      const aiSuggested = generateAiSuggestedPreferences(personalPrefs, {
        today_goal_earnings: earnings,
        today_available_hours: hours,
        strategy_mode: strategyMode,
      });

      await updateAiTodayPreferences(aiSuggested);

      const today = new Date().toISOString().split('T')[0];
      const newState = {
        ...state,
        ai_today: aiSuggested,
        last_ai_plan_date: today,
      };
      await savePreferencesState(newState);

      setHasGenerated(true);
      console.log('[AiPlanSetup] AI plan generated successfully');
    } catch (error) {
      console.error('[AiPlanSetup] Error generating plan:', error);
      alert('Failed to generate AI plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseAiPlan = async () => {
    setSubmitting(true);
    try {
      console.log('[AiPlanSetup] Using AI plan for today');
      await setActiveProfile('ai_today');
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('[AiPlanSetup] Error setting AI plan:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUsePersonal = async () => {
    setSubmitting(true);
    try {
      console.log('[AiPlanSetup] Using personal settings');
      await setActiveProfile('personal');
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('[AiPlanSetup] Error setting personal mode:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAiField = async (field: keyof DriverPreferences, value: any) => {
    try {
      await updateAiTodayPreferences({ [field]: value });
    } catch (error) {
      console.error('[AiPlanSetup] Error updating field:', error);
    }
  };

  if (isLoading || !personalPrefs || !aiPrefs) {
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
          title: 'AI Plan Setup',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Sparkles size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>Let AI Optimize Your Day</Text>
          <Text style={styles.headerSubtitle}>
            Answer a few questions to generate a personalized driving plan
          </Text>
        </View>

        <View style={styles.inputsSection}>
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <DollarSign size={20} color={COLORS.textSecondary} />
              <Text style={styles.inputLabel}>Today&apos;s Earnings Goal</Text>
            </View>
            <TextInput
              style={styles.input}
              value={goalEarnings}
              onChangeText={setGoalEarnings}
              placeholder="e.g., 500"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <Clock size={20} color={COLORS.textSecondary} />
              <Text style={styles.inputLabel}>How Many Hours Can You Drive?</Text>
            </View>
            <TextInput
              style={styles.input}
              value={availableHours}
              onChangeText={setAvailableHours}
              placeholder="e.g., 8"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <TrendingUp size={20} color={COLORS.textSecondary} />
              <Text style={styles.inputLabel}>Strategy Mode</Text>
            </View>
            <View style={styles.strategyContainer}>
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

          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGeneratePlan}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color={COLORS.background} />
            ) : (
              <>
                <Sparkles size={20} color={COLORS.background} />
                <Text style={styles.generateButtonText}>Generate AI Plan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {hasGenerated && (
          <>
            <View style={styles.comparisonSection}>
              <View style={styles.comparisonHeader}>
                <Text style={styles.comparisonTitle}>Compare Settings</Text>
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleLabel}>
                    {showComparison ? 'Personal' : 'AI Plan'}
                  </Text>
                  <Switch
                    value={showComparison}
                    onValueChange={setShowComparison}
                    trackColor={{ false: COLORS.border, true: COLORS.primary }}
                    thumbColor={COLORS.background}
                  />
                </View>
              </View>

              <View style={styles.comparisonCards}>
                {showComparison ? (
                  <View style={styles.comparisonRow}>
                    <View style={[styles.comparisonCard, styles.personalCard]}>
                      <Text style={styles.cardLabel}>Personal</Text>
                      <ComparisonField
                        label="Min $/Mile"
                        value={personalPrefs.min_dollars_per_mile}
                        editable={false}
                      />
                      <ComparisonField
                        label="Min Trip Payout"
                        value={personalPrefs.min_trip_payout}
                        editable={false}
                        prefix="$"
                      />
                      <ComparisonField
                        label="Max Pickup Distance"
                        value={personalPrefs.max_unpaid_pickup_distance_miles}
                        editable={false}
                        suffix=" mi"
                      />
                      <ComparisonField
                        label="Target Hourly Rate"
                        value={personalPrefs.target_hourly_rate}
                        editable={false}
                        prefix="$"
                      />
                    </View>

                    <View style={[styles.comparisonCard, styles.aiCard]}>
                      <Text style={styles.cardLabel}>AI Plan</Text>
                      <ComparisonField
                        label="Min $/Mile"
                        value={aiPrefs.min_dollars_per_mile}
                        editable={true}
                        onEdit={(val) => handleEditAiField('min_dollars_per_mile', parseFloat(val))}
                      />
                      <ComparisonField
                        label="Min Trip Payout"
                        value={aiPrefs.min_trip_payout}
                        editable={true}
                        prefix="$"
                        onEdit={(val) => handleEditAiField('min_trip_payout', parseFloat(val))}
                      />
                      <ComparisonField
                        label="Max Pickup Distance"
                        value={aiPrefs.max_unpaid_pickup_distance_miles}
                        editable={true}
                        suffix=" mi"
                        onEdit={(val) => handleEditAiField('max_unpaid_pickup_distance_miles', parseFloat(val))}
                      />
                      <ComparisonField
                        label="Target Hourly Rate"
                        value={aiPrefs.target_hourly_rate}
                        editable={true}
                        prefix="$"
                        onEdit={(val) => handleEditAiField('target_hourly_rate', parseFloat(val))}
                      />
                    </View>
                  </View>
                ) : (
                  <View style={[styles.comparisonCard, styles.aiCard, styles.fullWidthCard]}>
                    <Text style={styles.cardLabel}>AI Plan Settings (Editable)</Text>
                    <ComparisonField
                      label="Min $/Mile"
                      value={aiPrefs.min_dollars_per_mile}
                      editable={true}
                      onEdit={(val) => handleEditAiField('min_dollars_per_mile', parseFloat(val))}
                    />
                    <ComparisonField
                      label="Min Trip Payout"
                      value={aiPrefs.min_trip_payout}
                      editable={true}
                      prefix="$"
                      onEdit={(val) => handleEditAiField('min_trip_payout', parseFloat(val))}
                    />
                    <ComparisonField
                      label="Max Pickup Distance"
                      value={aiPrefs.max_unpaid_pickup_distance_miles}
                      editable={true}
                      suffix=" mi"
                      onEdit={(val) => handleEditAiField('max_unpaid_pickup_distance_miles', parseFloat(val))}
                    />
                    <ComparisonField
                      label="Target Hourly Rate"
                      value={aiPrefs.target_hourly_rate}
                      editable={true}
                      prefix="$"
                      onEdit={(val) => handleEditAiField('target_hourly_rate', parseFloat(val))}
                    />
                  </View>
                )}
              </View>
            </View>

            <View style={styles.actionsSection}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleUseAiPlan}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={COLORS.background} />
                ) : (
                  <>
                    <Sparkles size={20} color={COLORS.background} />
                    <Text style={styles.primaryButtonText}>Use AI Plan for Today</Text>
                    <ChevronRight size={20} color={COLORS.background} />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleUsePersonal}
                disabled={submitting}
              >
                <Text style={styles.secondaryButtonText}>Use Personal Settings</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ComparisonField({
  label,
  value,
  editable,
  prefix,
  suffix,
  onEdit,
}: {
  label: string;
  value: number;
  editable: boolean;
  prefix?: string;
  suffix?: string;
  onEdit?: (value: string) => void;
}) {
  const [localValue, setLocalValue] = useState<string>(value.toFixed(2));
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleBlur = () => {
    setIsEditing(false);
    if (onEdit && localValue !== value.toFixed(2)) {
      onEdit(localValue);
    }
  };

  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {editable ? (
        <TextInput
          style={styles.fieldInput}
          value={isEditing ? localValue : `${prefix || ''}${value.toFixed(2)}${suffix || ''}`}
          onChangeText={setLocalValue}
          onFocus={() => {
            setIsEditing(true);
            setLocalValue(value.toFixed(2));
          }}
          onBlur={handleBlur}
          keyboardType="numeric"
        />
      ) : (
        <Text style={styles.fieldValue}>
          {prefix || ''}{value.toFixed(2)}{suffix || ''}
        </Text>
      )}
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
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputsSection: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.lg,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  strategyContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  strategyButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 2,
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
    color: COLORS.textSecondary,
  },
  strategyButtonTextActive: {
    color: COLORS.background,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  generateButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.background,
  },
  comparisonSection: {
    marginBottom: SPACING.xl,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  comparisonTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  toggleLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  comparisonCards: {
    gap: SPACING.md,
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  comparisonCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  personalCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.textSecondary,
  },
  aiCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  fullWidthCard: {
    flex: 1,
  },
  cardLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  fieldValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  fieldInput: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.sm,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    minWidth: 80,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionsSection: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.background,
    flex: 1,
    textAlign: 'center',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
});
