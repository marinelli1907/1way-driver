import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { Clock, MapPin, Navigation } from 'lucide-react-native';

interface RideTimerProps {
  startTime: string;
  status: 'assigned' | 'in_progress' | 'completed';
}

export function RideTimer({ startTime, status }: RideTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (status === 'in_progress') {
      const interval = setInterval(() => {
        const start = new Date(startTime).getTime();
        const now = new Date().getTime();
        const diff = Math.floor((now - start) / 1000);
        setElapsedTime(diff);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startTime, status]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'assigned':
        return <MapPin size={20} color={COLORS.primary} />;
      case 'in_progress':
        return <Navigation size={20} color={COLORS.success} />;
      case 'completed':
        return <Clock size={20} color={COLORS.textSecondary} />;
      default:
        return <Clock size={20} color={COLORS.textSecondary} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'assigned':
        return 'Waiting to start';
      case 'in_progress':
        return 'Trip in progress';
      case 'completed':
        return 'Completed';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'assigned':
        return COLORS.primaryLight;
      case 'in_progress':
        return COLORS.successLight;
      case 'completed':
        return COLORS.backgroundSecondary;
      default:
        return COLORS.backgroundSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      <View style={styles.content}>
        {getStatusIcon()}
        <View style={styles.textContainer}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          {status === 'in_progress' && (
            <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
          )}
        </View>
      </View>
      
      {status === 'in_progress' && (
        <View style={styles.pulseContainer}>
          <View style={styles.pulse} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  statusText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  timerText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.success,
  },
  pulseContainer: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  pulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
  },
});
