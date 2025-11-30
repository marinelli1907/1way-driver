import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Stack } from 'expo-router';

import { DriverCar, GasStation, EVCharger } from '@/types';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Car, Sparkles, MapPin, Zap, Fuel, Navigation } from 'lucide-react-native';
import ENV from '@/config/env';

export default function CarScreen() {

  // In a real app, car would be in user object or fetched from /api/driver/car
  // For now, local state
  const [car, setCar] = useState<DriverCar>({
      make: 'Toyota',
      model: 'Camry',
      year: '2020',
      color: 'Silver',
      license_plate: 'ABC-1234',
      ai_image_url: undefined
  });
  const [loading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [stationType, setStationType] = useState<'gas' | 'ev'>('gas');
  const [gasStations] = useState<GasStation[]>([
    {
      id: '1',
      name: 'Shell Station',
      address: '123 Main St',
      distance: 0.5,
      latitude: 40.7128,
      longitude: -74.0060,
      regularPrice: 3.45,
      midgradePrice: 3.75,
      premiumPrice: 4.05,
    },
    {
      id: '2',
      name: 'BP Gas',
      address: '456 Oak Ave',
      distance: 1.2,
      latitude: 40.7138,
      longitude: -74.0070,
      regularPrice: 3.39,
      midgradePrice: 3.69,
      premiumPrice: 3.99,
      dieselPrice: 3.89,
    },
    {
      id: '3',
      name: 'Chevron',
      address: '789 Park Blvd',
      distance: 2.1,
      latitude: 40.7148,
      longitude: -74.0080,
      regularPrice: 3.49,
      premiumPrice: 4.09,
    },
  ]);
  const [evChargers] = useState<EVCharger[]>([
    {
      id: '1',
      name: 'Tesla Supercharger',
      address: '321 Electric Ave',
      distance: 0.8,
      latitude: 40.7158,
      longitude: -74.0090,
      network: 'Tesla',
      level: 'DC Fast Charge',
      available: true,
      pricePerKwh: 0.28,
    },
    {
      id: '2',
      name: 'ChargePoint Station',
      address: '654 Green St',
      distance: 1.5,
      latitude: 40.7168,
      longitude: -74.0100,
      network: 'ChargePoint',
      level: 'Level 2',
      available: true,
      pricePerKwh: 0.22,
    },
    {
      id: '3',
      name: 'EVgo Fast Charging',
      address: '987 Future Rd',
      distance: 2.3,
      latitude: 40.7178,
      longitude: -74.0110,
      network: 'EVgo',
      level: 'DC Fast Charge',
      available: false,
      pricePerKwh: 0.35,
    },
  ]);

  const handleSave = async () => {
      // API call to save car profile
      Alert.alert("Success", "Car profile saved");
  };

  const generateAIPhoto = async () => {
      setGenerating(true);
      // Simulate API call
      setTimeout(() => {
          setCar(prev => ({
              ...prev,
              ai_image_url: ENV.AI_CAR_IMAGE_URL || 'https://via.placeholder.com/400x300.png?text=AI+Car+Design' 
          }));
          setGenerating(false);
          Alert.alert("Success", "AI Style Photo Generated!");
      }, 2000);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Car Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* AI Photo Card */}
        <View style={styles.photoCard}>
            {car.ai_image_url ? (
                <Image source={{ uri: car.ai_image_url }} style={styles.carImage} resizeMode="cover" />
            ) : (
                <View style={styles.placeholderImage}>
                    <Car size={48} color={COLORS.textTertiary} />
                    <Text style={styles.placeholderText}>No AI Photo Yet</Text>
                </View>
            )}
            
            <Button 
                title={generating ? "Generating..." : "Generate AI Style Photo"}
                onPress={generateAIPhoto}
                variant="primary"
                loading={generating}
                style={styles.generateButton}
                icon={!generating && <Sparkles size={16} color={COLORS.background} />}
            />
        </View>

        <View style={styles.form}>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Make</Text>
                <TextInput 
                    style={styles.input} 
                    value={car.make} 
                    onChangeText={t => setCar({...car, make: t})} 
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Model</Text>
                <TextInput 
                    style={styles.input} 
                    value={car.model} 
                    onChangeText={t => setCar({...car, model: t})} 
                />
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Year</Text>
                    <TextInput 
                        style={styles.input} 
                        value={car.year} 
                        onChangeText={t => setCar({...car, year: t})} 
                        keyboardType="numeric"
                    />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Color</Text>
                    <TextInput 
                        style={styles.input} 
                        value={car.color} 
                        onChangeText={t => setCar({...car, color: t})} 
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>License Plate</Text>
                <TextInput 
                    style={styles.input} 
                    value={car.license_plate} 
                    onChangeText={t => setCar({...car, license_plate: t})} 
                />
            </View>

            <Button 
                title="Save Profile" 
                onPress={handleSave} 
                loading={loading}
                style={styles.saveButton}
            />
        </View>

        {/* Gas Stations & EV Chargers */}
        <View style={styles.stationsCard}>
          <View style={styles.stationsHeader}>
            <Text style={styles.stationsTitle}>Nearby Stations</Text>
            <View style={styles.stationTypeToggle}>
              <Button
                title="Gas"
                variant={stationType === 'gas' ? 'primary' : 'outline'}
                size="small"
                onPress={() => setStationType('gas')}
                icon={<Fuel size={16} color={stationType === 'gas' ? COLORS.background : COLORS.primary} />}
                style={styles.typeButton}
              />
              <Button
                title="EV"
                variant={stationType === 'ev' ? 'primary' : 'outline'}
                size="small"
                onPress={() => setStationType('ev')}
                icon={<Zap size={16} color={stationType === 'ev' ? COLORS.background : COLORS.primary} />}
                style={styles.typeButton}
              />
            </View>
          </View>

          {stationType === 'gas' ? (
            gasStations.map(station => (
              <View key={station.id} style={styles.stationItem}>
                <View style={styles.stationIconContainer}>
                  <Fuel size={24} color={COLORS.primary} />
                </View>
                <View style={styles.stationInfo}>
                  <Text style={styles.stationName}>{station.name}</Text>
                  <View style={styles.stationDetail}>
                    <MapPin size={12} color={COLORS.textSecondary} />
                    <Text style={styles.stationAddress}>
                      {station.address} • {station.distance}mi
                    </Text>
                  </View>
                  <View style={styles.pricesContainer}>
                    {station.regularPrice && (
                      <Text style={styles.priceText}>Regular: ${station.regularPrice}</Text>
                    )}
                    {station.premiumPrice && (
                      <Text style={styles.priceText}>Premium: ${station.premiumPrice}</Text>
                    )}
                  </View>
                </View>
                <Button
                  title="Navigate"
                  variant="outline"
                  size="small"
                  onPress={() => Alert.alert('Navigate', `Opening maps to ${station.name}`)}
                  icon={<Navigation size={14} color={COLORS.primary} />}
                />
              </View>
            ))
          ) : (
            evChargers.map(charger => (
              <View key={charger.id} style={styles.stationItem}>
                <View style={styles.stationIconContainer}>
                  <Zap size={24} color={COLORS.success} />
                </View>
                <View style={styles.stationInfo}>
                  <Text style={styles.stationName}>{charger.name}</Text>
                  <View style={styles.stationDetail}>
                    <MapPin size={12} color={COLORS.textSecondary} />
                    <Text style={styles.stationAddress}>
                      {charger.address} • {charger.distance}mi
                    </Text>
                  </View>
                  <View style={styles.chargerDetails}>
                    <Text style={styles.chargerLevel}>{charger.level}</Text>
                    {charger.network && (
                      <Text style={styles.chargerNetwork}>• {charger.network}</Text>
                    )}
                    {charger.pricePerKwh && (
                      <Text style={styles.chargerPrice}>• ${charger.pricePerKwh}/kWh</Text>
                    )}
                  </View>
                  <View style={styles.availabilityBadge}>
                    <View style={[styles.availabilityDot, { backgroundColor: charger.available ? COLORS.success : COLORS.danger }]} />
                    <Text style={[styles.availabilityText, { color: charger.available ? COLORS.success : COLORS.danger }]}>
                      {charger.available ? 'Available' : 'In Use'}
                    </Text>
                  </View>
                </View>
                <Button
                  title="Navigate"
                  variant="outline"
                  size="small"
                  onPress={() => Alert.alert('Navigate', `Opening maps to ${charger.name}`)}
                  icon={<Navigation size={14} color={COLORS.primary} />}
                />
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    padding: SPACING.lg,
  },
  photoCard: {
      backgroundColor: COLORS.card,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.lg,
      alignItems: 'center',
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
  },
  carImage: {
      width: '100%',
      height: 200,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.md,
  },
  placeholderImage: {
      width: '100%',
      height: 200,
      backgroundColor: COLORS.backgroundSecondary,
      borderRadius: RADIUS.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.md,
  },
  placeholderText: {
      marginTop: SPACING.sm,
      color: COLORS.textSecondary,
  },
  generateButton: {
      width: '100%',
  },
  form: {
      backgroundColor: COLORS.card,
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
  },
  inputGroup: {
      marginBottom: SPACING.md,
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
      borderWidth: 1,
      borderColor: COLORS.border,
  },
  row: {
      flexDirection: 'row',
  },
  saveButton: {
      marginTop: SPACING.md,
  },
  stationsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  stationsTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  stationTypeToggle: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  typeButton: {
    minWidth: 80,
  },
  stationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  stationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  stationInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  stationName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  stationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  stationAddress: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  pricesContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  priceText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  chargerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.xs,
    flexWrap: 'wrap',
  },
  chargerLevel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  chargerNetwork: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  chargerPrice: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
});
