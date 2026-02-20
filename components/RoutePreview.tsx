import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { MapPin, Navigation, Clock, TrendingUp } from 'lucide-react-native';

interface RoutePreviewProps {
  pickupAddress: string;
  dropoffAddress: string;
  distance?: number;
  estimatedTime?: number;
  onOpenMaps?: (app: 'apple' | 'google' | 'waze') => void;
}

export function RoutePreview({
  pickupAddress,
  dropoffAddress,
  distance,
  estimatedTime,
  onOpenMaps,
}: RoutePreviewProps) {
  const openInMaps = (app: 'apple' | 'google' | 'waze') => {
    if (onOpenMaps) {
      onOpenMaps(app);
    } else {
      const encoded = encodeURIComponent(dropoffAddress);
      let url = '';
      
      if (app === 'apple') {
        url = `http://maps.apple.com/?daddr=${encoded}`;
      } else if (app === 'google') {
        url = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
      } else {
        url = `waze://?q=${encoded}`;
      }

      Linking.openURL(url).catch(() => {
        Alert.alert('Error', `Could not open ${app} maps.`);
      });
    }
  };

  const estimatedMinutes = estimatedTime || (distance ? Math.ceil(distance / 0.5) : 15);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Navigation size={20} color={COLORS.primary} />
        <Text style={styles.title}>Route Preview</Text>
      </View>

      <View style={styles.visualRoute}>
        <View style={styles.routeLine}>
          <View style={[styles.pin, styles.pickupPin]}>
            <MapPin size={16} color={COLORS.background} fill={COLORS.primary} />
          </View>
          
          <View style={styles.dottedLine}>
            {[...Array(8)].map((_, i) => (
              <View key={i} style={styles.dot} />
            ))}
          </View>
          
          <View style={[styles.pin, styles.dropoffPin]}>
            <MapPin size={16} color={COLORS.background} fill={COLORS.accent} />
          </View>
        </View>

        <View style={styles.addressesContainer}>
          <View style={styles.addressBlock}>
            <Text style={styles.label}>Pickup</Text>
            <Text style={styles.address} numberOfLines={2}>
              {pickupAddress}
            </Text>
          </View>

          <View style={styles.stats}>
            {distance && (
              <View style={styles.stat}>
                <TrendingUp size={14} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{distance} mi</Text>
              </View>
            )}
            <View style={styles.stat}>
              <Clock size={14} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{estimatedMinutes} min</Text>
            </View>
          </View>

          <View style={styles.addressBlock}>
            <Text style={styles.label}>Dropoff</Text>
            <Text style={styles.address} numberOfLines={2}>
              {dropoffAddress}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.mapButton, styles.primaryButton]}
          onPress={() => openInMaps('apple')}
        >
          <Navigation size={16} color={COLORS.background} />
          <Text style={styles.primaryButtonText}>Apple Maps</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mapButton, styles.secondaryButton]}
          onPress={() => openInMaps('google')}
        >
          <MapPin size={16} color={COLORS.primary} />
          <Text style={styles.secondaryButtonText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mapButton, styles.secondaryButton]}
          onPress={() => openInMaps('waze')}
        >
          <Navigation size={16} color={COLORS.primary} />
          <Text style={styles.secondaryButtonText}>Waze</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  visualRoute: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  routeLine: {
    alignItems: 'center',
    marginRight: SPACING.md,
    paddingTop: 4,
  },
  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupPin: {
    backgroundColor: COLORS.primary,
  },
  dropoffPin: {
    backgroundColor: COLORS.accent,
  },
  dottedLine: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  addressesContainer: {
    flex: 1,
  },
  addressBlock: {
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  address: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    lineHeight: 18,
  },
  stats: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    marginVertical: SPACING.xs,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  mapButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  primaryButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.background,
  },
  secondaryButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
