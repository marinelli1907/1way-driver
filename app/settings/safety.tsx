import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafety } from '@/hooks/useSafety';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { AlertTriangle, Camera, Shield } from 'lucide-react-native';
import { Button } from '@/components/Button';

export default function SafetySettingsScreen() {
  const { safetyState, updateSafetySettings, isLoaded } = useSafety();
  
  const [maxDrivingHoursPerDay, setMaxDrivingHoursPerDay] = useState('11');
  const [maxOnDutyHoursPerDay, setMaxOnDutyHoursPerDay] = useState('14');
  const [maxDrivingHoursPer7Days, setMaxDrivingHoursPer7Days] = useState('60');
  const [requiredBreakMinutes, setRequiredBreakMinutes] = useState('30');
  
  const [inCabCamera, setInCabCamera] = useState(false);
  const [outwardCamera, setOutwardCamera] = useState(false);
  
  const [fatigueCheckEnabled, setFatigueCheckEnabled] = useState(true);
  const [allowAiBlock, setAllowAiBlock] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      const { settings } = safetyState;
      setMaxDrivingHoursPerDay(settings.max_driving_hours_per_day.toString());
      setMaxOnDutyHoursPerDay(settings.max_on_duty_hours_per_day.toString());
      setMaxDrivingHoursPer7Days(settings.max_driving_hours_per_7days.toString());
      setRequiredBreakMinutes(settings.required_break_minutes_after_hours.toString());
      setInCabCamera(settings.in_cab_camera_installed);
      setOutwardCamera(settings.outward_camera_installed);
      setFatigueCheckEnabled(settings.fatigue_check_enabled);
      setAllowAiBlock(settings.allow_ai_to_block_jobs_when_over_hours);
    }
  }, [isLoaded, safetyState]);

  const handleSave = async () => {
    await updateSafetySettings({
      max_driving_hours_per_day: parseFloat(maxDrivingHoursPerDay) || 11,
      max_on_duty_hours_per_day: parseFloat(maxOnDutyHoursPerDay) || 14,
      max_driving_hours_per_7days: parseFloat(maxDrivingHoursPer7Days) || 60,
      required_break_minutes_after_hours: parseFloat(requiredBreakMinutes) || 30,
      in_cab_camera_installed: inCabCamera,
      outward_camera_installed: outwardCamera,
      fatigue_check_enabled: fatigueCheckEnabled,
      allow_ai_to_block_jobs_when_over_hours: allowAiBlock,
    });
    
    Alert.alert('Success', 'Safety settings saved successfully', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const camerasCompliant = inCabCamera && outwardCamera;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Safety & DOT Settings',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <AlertTriangle size={20} color={COLORS.warning} />
          <Text style={styles.disclaimerText}>
            These are general safety limits, not legal advice. For actual DOT compliance, follow local regulations.
          </Text>
        </View>

        {/* Hours of Service */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Hours of Service Limits</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max Driving Hours Per Day</Text>
            <TextInput
              style={styles.input}
              value={maxDrivingHoursPerDay}
              onChangeText={setMaxDrivingHoursPerDay}
              keyboardType="numeric"
              placeholder="11"
            />
            <Text style={styles.hint}>Recommended: 11 hours (DOT standard)</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max On-Duty Hours Per Day</Text>
            <TextInput
              style={styles.input}
              value={maxOnDutyHoursPerDay}
              onChangeText={setMaxOnDutyHoursPerDay}
              keyboardType="numeric"
              placeholder="14"
            />
            <Text style={styles.hint}>Recommended: 14 hours (DOT standard)</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max Driving Hours Per 7 Days</Text>
            <TextInput
              style={styles.input}
              value={maxDrivingHoursPer7Days}
              onChangeText={setMaxDrivingHoursPer7Days}
              keyboardType="numeric"
              placeholder="60"
            />
            <Text style={styles.hint}>Recommended: 60 hours (simplified DOT)</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Required Break After (Minutes)</Text>
            <TextInput
              style={styles.input}
              value={requiredBreakMinutes}
              onChangeText={setRequiredBreakMinutes}
              keyboardType="numeric"
              placeholder="30"
            />
            <Text style={styles.hint}>Break needed after 8 hours of driving</Text>
          </View>
        </View>

        {/* Camera Compliance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Camera size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Camera Equipment</Text>
          </View>

          {!camerasCompliant && (
            <View style={styles.warning}>
              <AlertTriangle size={18} color={COLORS.warning} />
              <Text style={styles.warningText}>
                1Way strongly recommends both cameras for safety and liability protection.
              </Text>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.rowLabel}>In-cab camera installed</Text>
            <Switch
              value={inCabCamera}
              onValueChange={setInCabCamera}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Outward-facing camera installed</Text>
            <Switch
              value={outwardCamera}
              onValueChange={setOutwardCamera}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
            />
          </View>
        </View>

        {/* Safety Logic */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Features</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Fatigue check enabled</Text>
            <Switch
              value={fatigueCheckEnabled}
              onValueChange={setFatigueCheckEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Allow AI to block jobs when over hours</Text>
            <Switch
              value={allowAiBlock}
              onValueChange={setAllowAiBlock}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
            />
          </View>
          <Text style={styles.hint}>
            When enabled, AI will stop auto-accepting jobs when you exceed your safety limits
          </Text>
        </View>

        {/* Save Button */}
        <Button 
          title="Save Settings" 
          onPress={handleSave}
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
  content: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: COLORS.warningLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.warning,
    lineHeight: 20,
  },
  section: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  hint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  warning: {
    flexDirection: 'row',
    backgroundColor: COLORS.warningLight,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    color: COLORS.warning,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  saveButton: {
    marginTop: SPACING.md,
  },
});
