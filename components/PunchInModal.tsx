import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { Clock, AlertCircle } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { usePunchInStore } from '@/store/punchInStore';

interface PunchInModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'in' | 'out';
}

export default function PunchInModal({ visible, onClose, type }: PunchInModalProps) {
  const [odometer, setOdometer] = useState('');
  const { punchIn, punchOut, currentSession } = usePunchInStore();

  const handleSubmit = async () => {
    const value = Number(odometer);
    if (!value || isNaN(value)) {
      Alert.alert('Error', 'Please enter a valid odometer reading');
      return;
    }

    if (type === 'in') {
      await punchIn(value);
      Alert.alert('Punched In', 'Good luck today! Drive safely.');
    } else {
      if (currentSession && value < currentSession.startOdometer) {
        Alert.alert('Error', 'End odometer must be greater than start odometer');
        return;
      }
      await punchOut(value);
      const miles = currentSession ? value - currentSession.startOdometer : 0;
      Alert.alert('Punched Out', `Great work today! You drove ${miles.toFixed(1)} miles.`);
    }

    setOdometer('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Clock size={48} color={COLORS.primary} />
          </View>

          <Text style={styles.title}>
            {type === 'in' ? 'Punch In' : 'Punch Out'}
          </Text>
          
          <Text style={styles.subtitle}>
            {type === 'in' 
              ? 'Enter your current odometer reading to start your shift'
              : 'Enter your current odometer reading to end your shift'}
          </Text>

          {type === 'in' && (
            <View style={styles.tipBox}>
              <AlertCircle size={16} color={COLORS.warning} />
              <Text style={styles.tipText}>
                Drive safely and follow all traffic laws
              </Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Odometer Reading</Text>
            <TextInput
              style={styles.input}
              value={odometer}
              onChangeText={setOdometer}
              placeholder="e.g. 45230"
              keyboardType="numeric"
              placeholderTextColor={COLORS.textTertiary}
            />
            <Text style={styles.helperText}>Enter your current mileage</Text>
          </View>

          <View style={styles.buttons}>
            <Button 
              title="Cancel" 
              variant="outline" 
              onPress={() => {
                setOdometer('');
                onClose();
              }}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button 
              title={type === 'in' ? 'Start Shift' : 'End Shift'}
              onPress={handleSubmit}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  content: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
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
    marginBottom: SPACING.lg,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  tipText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.warning,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  helperText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
  },
});
