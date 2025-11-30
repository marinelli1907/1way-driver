import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';

export function RideCardSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.skeleton, styles.header, { opacity }]} />
      
      <View style={styles.body}>
        <Animated.View style={[styles.skeleton, styles.timeRow, { opacity }]} />
        <Animated.View style={[styles.skeleton, styles.address, { opacity }]} />
        <View style={styles.spacer} />
        <Animated.View style={[styles.skeleton, styles.address, { opacity }]} />
      </View>

      <View style={styles.footer}>
        <Animated.View style={[styles.skeleton, styles.button, { opacity }]} />
        <Animated.View style={[styles.skeleton, styles.button, { opacity }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  skeleton: {
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.sm,
  },
  header: {
    height: 32,
    width: '40%',
    marginBottom: SPACING.md,
  },
  body: {
    marginBottom: SPACING.md,
  },
  timeRow: {
    height: 20,
    width: '60%',
    marginBottom: SPACING.md,
  },
  address: {
    height: 18,
    width: '100%',
    marginBottom: 4,
  },
  spacer: {
    height: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.md,
  },
});
