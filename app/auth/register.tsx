import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { Info } from 'lucide-react-native';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    licensePlate: '',
  });
  const [loading, setLoading] = useState(false);
  const [showVerificationNote, setShowVerificationNote] = useState(false);

  const register = useAuthStore(state => state.register);

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        license_number: formData.licenseNumber,
        vehicle_make: formData.vehicleMake,
        vehicle_model: formData.vehicleModel,
        vehicle_year: formData.vehicleYear,
        vehicle_color: formData.vehicleColor,
        license_plate: formData.licensePlate,
        verification_status: 'approved',
      });
      
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.log('Register error:', error);
      Alert.alert('Registration Failed', error.response?.data?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Create Account' }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/lqmu2qokf7liob4ngwpo1' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="John Doe"
              autoComplete="name"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={text => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={text => setFormData(prev => ({ ...prev, phone: text }))}
              placeholder="+1 (555) 000-0000"
              keyboardType="phone-pad"
              autoComplete="tel"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={text => setFormData(prev => ({ ...prev, password: text }))}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password-new"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={text => setFormData(prev => ({ ...prev, confirmPassword: text }))}
              placeholder="••••••••"
              secureTextEntry
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <TouchableOpacity 
            style={styles.verificationNote}
            onPress={() => setShowVerificationNote(!showVerificationNote)}
          >
            <Info size={20} color={COLORS.primary} />
            <Text style={styles.verificationNoteText}>Driver Verification (Currently Disabled)</Text>
          </TouchableOpacity>

          {showVerificationNote && (
            <View style={styles.verificationDetails}>
              <Text style={styles.verificationDetailsText}>
                Driver verification is currently turned off. In production, you would need to submit:
              </Text>
              <Text style={styles.verificationBullet}>• Valid driver&apos;s license</Text>
              <Text style={styles.verificationBullet}>• Vehicle registration</Text>
              <Text style={styles.verificationBullet}>• Insurance proof</Text>
              <Text style={styles.verificationBullet}>• Background check</Text>
              <Text style={[styles.verificationDetailsText, { marginTop: SPACING.sm }]}>
                Once approved, you&apos;ll have full access to the app.
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Vehicle Information (Optional)</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>License Number</Text>
            <TextInput
              style={styles.input}
              value={formData.licenseNumber}
              onChangeText={text => setFormData(prev => ({ ...prev, licenseNumber: text }))}
              placeholder="DL123456"
              autoCapitalize="characters"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Make</Text>
            <TextInput
              style={styles.input}
              value={formData.vehicleMake}
              onChangeText={text => setFormData(prev => ({ ...prev, vehicleMake: text }))}
              placeholder="Toyota, Honda, etc."
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Model</Text>
            <TextInput
              style={styles.input}
              value={formData.vehicleModel}
              onChangeText={text => setFormData(prev => ({ ...prev, vehicleModel: text }))}
              placeholder="Camry, Accord, etc."
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Year</Text>
              <TextInput
                style={styles.input}
                value={formData.vehicleYear}
                onChangeText={text => setFormData(prev => ({ ...prev, vehicleYear: text }))}
                placeholder="2020"
                keyboardType="number-pad"
                maxLength={4}
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.input}
                value={formData.vehicleColor}
                onChangeText={text => setFormData(prev => ({ ...prev, vehicleColor: text }))}
                placeholder="Black"
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>License Plate</Text>
            <TextInput
              style={styles.input}
              value={formData.licensePlate}
              onChangeText={text => setFormData(prev => ({ ...prev, licensePlate: text }))}
              placeholder="ABC-1234"
              autoCapitalize="characters"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            style={styles.button}
          />

          <Button
            title="Already have an account?"
            onPress={() => router.back()}
            variant="outline"
            fullWidth
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  logo: {
    width: 450,
    height: 250,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  verificationNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  verificationNoteText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SPACING.sm,
    flex: 1,
  },
  verificationDetails: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  verificationDetailsText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  verificationBullet: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    marginTop: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
});
