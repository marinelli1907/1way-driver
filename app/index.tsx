import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useDriverPreferences } from '@/hooks/useDriverPreferences';
import { useAuthStore } from '@/store/authStore';
import { COLORS } from '@/constants/theme';

export default function Index() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { state, isLoading: prefsLoading } = useDriverPreferences();
  const [shouldShowPunchIn, setShouldShowPunchIn] = useState<boolean>(false);

  useEffect(() => {
    if (!prefsLoading && state && isAuthenticated) {
      const today = new Date().toISOString().split('T')[0];
      const needsPunchIn =
        state.ai_assist_enabled_today === undefined ||
        state.last_ai_plan_date !== today;
      
      console.log('[Index] Checking punch-in:', {
        ai_assist_enabled_today: state.ai_assist_enabled_today,
        last_ai_plan_date: state.last_ai_plan_date,
        today,
        needsPunchIn,
      });
      
      setShouldShowPunchIn(needsPunchIn);
    }
  }, [prefsLoading, state, isAuthenticated]);

  if (authLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // if (!isAuthenticated) {
  //   return <Redirect href="/auth/login" />;
  // }

  if (prefsLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (shouldShowPunchIn) {
    return <Redirect href="/punch-in" />;
  }

  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
  },
});
