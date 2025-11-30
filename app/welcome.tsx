import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { Button } from '@/components/Button';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

export default function WelcomeScreen() {
  const { isAuthenticated, isLoading } = useAuthStore();

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/lqmu2qokf7liob4ngwpo1' }}
              style={styles.logo}
              resizeMode="contain"
            />
        </View>

        <View style={styles.textContainer}>
            <Text style={styles.title}>Drive with 1Way</Text>
            <Text style={styles.subtitle}>
                Join the community of drivers and earn on your own schedule.
            </Text>
        </View>

        <View style={styles.buttonContainer}>
            <Button 
                title="Log In" 
                onPress={() => router.push('/auth/login')} 
                style={styles.button}
                fullWidth
            />
            <Button 
                title="Create Account" 
                onPress={() => router.push('/auth/register')} 
                variant="outline" 
                style={styles.button}
                fullWidth
            />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl * 1.5,
  },
  logo: {
    width: 380,
    height: 160,
  },
  textContainer: {
    marginBottom: SPACING.xxl,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  button: {
    marginBottom: SPACING.sm,
  },
});
