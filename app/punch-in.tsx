import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { useDriverPreferences } from '@/hooks/useDriverPreferences';
import { Calendar, Zap, User } from 'lucide-react-native';

export default function PunchInScreen() {
  const {
    state,
    isLoading,
    setAiAssistEnabledToday,
    setActiveProfile,
  } = useDriverPreferences();

  const [submitting, setSubmitting] = useState<boolean>(false);

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayBlocks = state?.personal?.available_time_blocks?.filter(
    (block) => block.day === todayName
  ) || [];

  const handleAiAssistance = async () => {
    setSubmitting(true);
    try {
      console.log('[PunchInScreen] Enabling AI assistance for today');
      await setAiAssistEnabledToday(true);
      router.replace('/ai-plan-setup');
    } catch (error) {
      console.error('[PunchInScreen] Error enabling AI assistance:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualMode = async () => {
    setSubmitting(true);
    try {
      console.log('[PunchInScreen] Using manual mode');
      await setAiAssistEnabledToday(false);
      await setActiveProfile('personal');
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('[PunchInScreen] Error setting manual mode:', error);
    } finally {
      setSubmitting(false);
    }
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
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Ready to drive today?</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {todayBlocks.length > 0 && (
          <View style={styles.timeBlocksSection}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color={COLORS.textSecondary} />
              <Text style={styles.sectionTitle}>Your Schedule Today</Text>
            </View>
            {todayBlocks.map((block, index) => (
              <View key={index} style={styles.timeBlock}>
                <Text style={styles.timeBlockText}>
                  {block.start} - {block.end}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.questionSection}>
          <Text style={styles.questionText}>
            Do you want AI assistance turned on today?
          </Text>
          <Text style={styles.questionSubtext}>
            Uno can help optimize your rides, earnings, and schedule based on your preferences.
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.aiButton]}
            onPress={handleAiAssistance}
            disabled={submitting}
          >
            <View style={styles.buttonIcon}>
              <Zap size={24} color={COLORS.background} />
            </View>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Yes, use AI assistance</Text>
              <Text style={styles.buttonDescription}>
                Let Uno optimize your day
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.manualButton]}
            onPress={handleManualMode}
            disabled={submitting}
          >
            <View style={styles.buttonIcon}>
              <User size={24} color={COLORS.primary} />
            </View>
            <View style={styles.buttonContent}>
              <Text style={[styles.buttonTitle, styles.manualButtonTitle]}>
                No, manual mode
              </Text>
              <Text style={[styles.buttonDescription, styles.manualButtonDescription]}>
                I&apos;ll manage everything myself
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {submitting && (
          <View style={styles.submittingOverlay}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.submittingText}>Setting up...</Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingTop: 80,
  },
  header: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  greeting: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  timeBlocksSection: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  timeBlock: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  timeBlockText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  questionSection: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  questionText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  questionSubtext: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: SPACING.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiButton: {
    backgroundColor: COLORS.primary,
  },
  manualButton: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  buttonIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.background,
    marginBottom: 4,
  },
  manualButtonTitle: {
    color: COLORS.text,
  },
  buttonDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primaryLight,
  },
  manualButtonDescription: {
    color: COLORS.textSecondary,
  },
  submittingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  submittingText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
});
