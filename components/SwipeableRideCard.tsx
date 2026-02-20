import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Clock, DollarSign, Sparkles, CheckCircle, XCircle } from 'lucide-react-native';
import { Ride } from '@/types';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';

interface SwipeableRideCardProps {
  ride: Ride;
  onAccept: (ride: Ride) => void;
  onBid: (ride: Ride, amount: number) => void;
  onReject: (ride: Ride) => void;
  requiresBid?: boolean;
}

export function SwipeableRideCard({ ride, onAccept, onBid, onReject, requiresBid = false }: SwipeableRideCardProps) {
  const [bidAmount, setBidAmount] = useState(ride.price_offer.toString());
  
  const aiSuggestedBid = calculateAiSuggestedBid(ride);
  
  function calculateAiSuggestedBid(ride: Ride): number {
    if (!ride.distance_miles) return ride.price_offer;
    const baseRate = 1.8;
    const perMileRate = 2.2;
    const suggested = baseRate + (ride.distance_miles * perMileRate);
    return Math.round(suggested * 100) / 100;
  }

  const handleSendBid = () => {
    const amount = parseFloat(bidAmount) || ride.price_offer;
    onBid(ride, amount);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>${ride.price_offer}</Text>
          </View>
          <View style={styles.headerRight}>
            <Clock size={14} color={COLORS.textSecondary} />
            <Text style={styles.timeText}>
              {new Date(ride.pickup_time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {ride.distance_miles && (
              <Text style={styles.distanceText}>• {ride.distance_miles}mi</Text>
            )}
            {requiresBid && (
              <View style={styles.bidBadge}>
                <Text style={styles.bidBadgeText}>BID</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.dot, styles.pickupDot]} />
              <Text style={styles.addressText} numberOfLines={1}>
                {ride.pickup_address}
              </Text>
            </View>
            <View style={styles.timelineLine} />
            <View style={styles.timelineItem}>
              <View style={[styles.dot, styles.dropoffDot]} />
              <Text style={styles.addressText} numberOfLines={1}>
                {ride.dropoff_address}
              </Text>
            </View>
          </View>
        </View>

        {requiresBid ? (
          <View style={styles.bidSection}>
            <View style={styles.bidInputRow}>
              <View style={styles.bidInputWrapper}>
                <DollarSign size={16} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.bidInputSmall}
                  value={bidAmount}
                  onChangeText={setBidAmount}
                  keyboardType="decimal-pad"
                  placeholder={`${aiSuggestedBid}`}
                  placeholderTextColor={COLORS.textTertiary}
                />
                <TouchableOpacity 
                  style={styles.aiButton}
                  onPress={() => setBidAmount(aiSuggestedBid.toString())}
                >
                  <Sparkles size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={handleSendBid}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.denyButton}
                onPress={() => onReject(ride)}
              >
                <XCircle size={18} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={() => onAccept(ride)}
            >
              <CheckCircle size={20} color={COLORS.textLight} />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.denyButtonStandalone}
              onPress={() => onReject(ride)}
            >
              <XCircle size={20} color={COLORS.textLight} />
              <Text style={styles.denyButtonText}>Deny</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bidBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  bidBadgeText: {
    color: COLORS.textLight,
    fontSize: 10,
    fontWeight: '700',
  },
  priceTag: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  priceText: {
    color: COLORS.success,
    fontWeight: '700',
    fontSize: FONT_SIZE.md,
  },
  cardBody: {
  },
  timeText: {
    marginLeft: 4,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.text,
  },
  distanceText: {
    marginLeft: 4,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  timeline: {
    paddingLeft: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  timelineLine: {
    width: 2,
    height: 12,
    backgroundColor: COLORS.border,
    marginLeft: 4,
    marginVertical: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  pickupDot: {
    backgroundColor: COLORS.primary,
  },
  dropoffDot: {
    backgroundColor: COLORS.accent,
  },
  addressText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
  },
  acceptButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  denyButtonStandalone: {
    flex: 1,
    backgroundColor: COLORS.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
  },
  denyButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  bidSection: {
    marginTop: SPACING.sm,
  },
  aiButton: {
    padding: 4,
    marginLeft: SPACING.xs,
  },
  bidInputRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    alignItems: 'center',
  },
  bidInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
  },
  bidInputSmall: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 4,
    padding: 0,
  },
  sendButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  sendButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  denyButton: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
});
