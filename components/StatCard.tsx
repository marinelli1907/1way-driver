import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZE } from '@/constants/theme';

interface StatCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {icon && <View style={styles.icon}>{icon}</View>}
      </View>
      <Text style={styles.value}>{value}</Text>
      {trend && (
        <Text style={[styles.trend, trend.isPositive ? styles.trendPositive : styles.trendNegative]}>
          {trend.isPositive ? '↑' : '↓'} {trend.value}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '500' as const,
  },
  icon: {
    opacity: 0.6,
  },
  value: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  trend: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600' as const,
  },
  trendPositive: {
    color: COLORS.success,
  },
  trendNegative: {
    color: COLORS.danger,
  },
});
