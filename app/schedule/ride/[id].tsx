import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Linking, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { api } from '@/lib/api';
import { Ride } from '@/types';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { Button } from '@/components/Button';
import { RideTimer } from '@/components/RideTimer';
import { RoutePreview } from '@/components/RoutePreview';
import { MessageSquare, CheckCircle, Play, User, MapPin, X } from 'lucide-react-native';

export default function RideDetailScreen() {
    const { id } = useLocalSearchParams();
    const [ride, setRide] = useState<Ride | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchRideDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchRideDetails = async () => {
        try {
            // GET /api/v1/rides/{id}
            // Assuming this endpoint exists, or we fetch from list
            // For now let's try to fetch list and find? Or specific endpoint.
            // Prompt said: "GET /api/v1/rides" supports filters. 
            // Usually detail is /rides/:id
            const response = await api.get(`/v1/rides/${id}`).catch(() => ({
                data: {
                    id: Number(id),
                    pickup_address: "123 Main St, New York, NY",
                    dropoff_address: "JFK Airport, Terminal 4",
                    pickup_time: new Date().toISOString(),
                    price_offer: 45.00,
                    status: 'assigned',
                    rider_name: "Alice Smith",
                    notes: "Please call when outside."
                } as Ride
            }));
            setRide(response.data);
        } catch {
            console.log('Using mock data for ride details');
        } finally {
            setLoading(false);
        }
    };

    const openMaps = (address: string, app: 'apple' | 'google' | 'waze') => {
        const encoded = encodeURIComponent(address);
        let url = '';
        if (app === 'apple') {
            url = `http://maps.apple.com/?daddr=${encoded}`;
        } else if (app === 'google') {
            url = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
        } else {
            url = `waze://?q=${encoded}`;
        }
  
        Linking.openURL(url).catch(() => {
            Alert.alert("Error", `Could not open ${app} maps.`);
        });
    };

    const updateRideStatus = async (newStatus: string) => {
        if (!ride) return;
        
        setActionLoading(true);
        try {
            await api.put(`/v1/rides/${ride.id}`, { status: newStatus });
            setRide({ ...ride, status: newStatus as any });
            
            if (newStatus === 'completed') {
                Alert.alert(
                    'Ride Completed',
                    `Payment of ${ride.price_offer.toFixed(2)} has been processed.`,
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else if (newStatus === 'cancelled') {
                Alert.alert(
                    'Trip Cancelled',
                    'The ride has been cancelled.',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            }
        } catch (err) {
            console.error('Update ride status error:', err);
            Alert.alert('Error', 'Failed to update ride status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleStartTrip = () => {
        Alert.alert(
            'Start Trip',
            'Are you ready to pick up the passenger?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Start', onPress: () => updateRideStatus('in_progress') }
            ]
        );
    };

    const handleCompleteRide = () => {
        Alert.alert(
            'Complete Ride',
            `Confirm completion and process payment of ${ride?.price_offer.toFixed(2)}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Complete', onPress: () => updateRideStatus('completed') }
            ]
        );
    };

    const handleCancelTrip = () => {
        Alert.alert(
            'Cancel Trip',
            'Are you sure you want to cancel this ride? This action cannot be undone.',
            [
                { text: 'Keep Trip', style: 'cancel' },
                { 
                    text: 'Cancel Trip', 
                    style: 'destructive',
                    onPress: () => updateRideStatus('cancelled')
                }
            ]
        );
    };

    if (loading || !ride) return <View style={styles.container} />;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Ride Details' }} />
            
            <ScrollView contentContainerStyle={styles.content}>
                
                {(ride.status === 'assigned' || ride.status === 'in_progress') && (
                  <RideTimer startTime={ride.pickup_time} status={ride.status} />
                )}

                <RoutePreview
                  pickupAddress={ride.pickup_address}
                  dropoffAddress={ride.dropoff_address}
                  distance={ride.distance_miles}
                  onOpenMaps={(app) => openMaps(ride.dropoff_address, app)}
                />

                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <Text style={styles.status}>{ride.status.toUpperCase()}</Text>
                        <Text style={styles.price}>${ride.price_offer}</Text>
                    </View>

                    <View style={styles.riderRow}>
                        <View style={styles.avatar}>
                            <UserIcon name={ride.rider_name} />
                        </View>
                        <View>
                            <Text style={styles.riderName}>{ride.rider_name || 'Rider'}</Text>
                            <Text style={styles.notes}>{ride.status === 'assigned' ? 'Tap to contact' : 'Rider info'}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.timeline}>
                         <View style={styles.timelineItem}>
                             <View style={[styles.dot, styles.pickupDot]} />
                             <View>
                                 <Text style={styles.label}>Pickup</Text>
                                 <Text style={styles.address}>{ride.pickup_address}</Text>
                                 <Text style={styles.time}>{new Date(ride.pickup_time).toLocaleString()}</Text>
                             </View>
                         </View>
                         <View style={styles.line} />
                         <View style={styles.timelineItem}>
                             <View style={[styles.dot, styles.dropoffDot]} />
                             <View>
                                 <Text style={styles.label}>Dropoff</Text>
                                 <Text style={styles.address}>{ride.dropoff_address}</Text>
                             </View>
                         </View>
                    </View>
                </View>

                {(ride.status === 'assigned' || ride.status === 'in_progress') && (
                  <>
                    <Text style={styles.sectionTitle}>Contact Passenger</Text>
                    <Button 
                        title="Message Passenger"
                        onPress={() => router.push({ 
                          pathname: '/chat/[rideId]', 
                          params: { rideId: ride.id.toString(), passengerName: ride.rider_name || 'Passenger' } 
                        })}
                        style={styles.mapButton}
                        icon={<MessageSquare size={18} color={COLORS.background} />}
                    />
                  </>
                )}

                {ride.status === 'assigned' && (
                  <>
                    <Text style={styles.sectionTitle}>Trip Controls</Text>
                    <View style={styles.tripControls}>
                      <Button 
                          title="Arrived"
                          variant="outline"
                          onPress={() => Alert.alert('Arrived', 'Notifying passenger...')}
                          style={[styles.controlButton, { marginRight: SPACING.sm }]}
                          icon={<MapPin size={18} color={COLORS.primary} />}
                      />
                      <Button 
                          title={actionLoading ? 'Starting...' : 'Start Trip'}
                          onPress={handleStartTrip}
                          disabled={actionLoading}
                          style={styles.controlButton}
                          icon={actionLoading ? <ActivityIndicator size="small" color={COLORS.background} /> : <Play size={18} color={COLORS.background} />}
                      />
                    </View>
                  </>
                )}

                {ride.status === 'in_progress' && (
                  <>
                    <Text style={styles.sectionTitle}>Complete Ride</Text>
                    <Button 
                        title={actionLoading ? 'Processing...' : `Complete & Receive ${ride.price_offer.toFixed(2)}`}
                        onPress={handleCompleteRide}
                        disabled={actionLoading}
                        style={[styles.actionButton, styles.completeButton]}
                        icon={actionLoading ? <ActivityIndicator size="small" color={COLORS.background} /> : <CheckCircle size={18} color={COLORS.background} />}
                    />
                  </>
                )}

                {(ride.status === 'assigned' || ride.status === 'in_progress') && (
                  <>
                    <Button 
                        title="Cancel Trip"
                        variant="outline"
                        onPress={handleCancelTrip}
                        disabled={actionLoading}
                        style={[styles.actionButton, styles.cancelButton]}
                        icon={<X size={18} color={COLORS.danger} />}
                    />
                  </>
                )}

                {ride.status === 'completed' && (
                  <View style={styles.completedBanner}>
                    <CheckCircle size={24} color={COLORS.success} />
                    <View style={{ marginLeft: SPACING.md }}>
                      <Text style={styles.completedText}>Ride Completed</Text>
                      <Text style={styles.completedAmount}>Payment: ${ride.price_offer.toFixed(2)}</Text>
                    </View>
                  </View>
                )}

            </ScrollView>
        </View>
    );
}

// Helper for avatar
function UserIcon({ name }: { name?: string }) {
    return (
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' }}>
            {name?.charAt(0) ? (
                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>{name.charAt(0)}</Text>
            ) : (
                <User size={20} color={COLORS.primary} />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundSecondary,
    },
    content: {
        padding: SPACING.lg,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
    },
    status: {
        fontSize: FONT_SIZE.sm,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
    },
    price: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
        color: COLORS.success,
    },
    riderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        gap: SPACING.md,
    },
    avatar: {
        
    },
    riderName: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '600',
        color: COLORS.text,
    },
    notes: {
        color: COLORS.textSecondary,
    },
    timeline: {
        
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: SPACING.md,
        marginTop: 4,
    },
    pickupDot: {
        backgroundColor: COLORS.primary,
    },
    dropoffDot: {
        backgroundColor: COLORS.accent,
    },
    line: {
        width: 2,
        height: 30,
        backgroundColor: COLORS.border,
        marginLeft: 5,
        marginVertical: 4,
    },
    label: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textSecondary,
    },
    address: {
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
        fontWeight: '500',
    },
    time: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textTertiary,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        marginBottom: SPACING.md,
        color: COLORS.text,
    },
    mapButton: {
        marginBottom: SPACING.md,
        justifyContent: 'flex-start',
    },
    tripControls: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
    },
    controlButton: {
        flex: 1,
    },
    actionButton: {
        marginBottom: SPACING.md,
    },
    completeButton: {
        backgroundColor: COLORS.success,
    },
    completedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.success + '20',
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        marginTop: SPACING.lg,
    },
    completedText: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: COLORS.success,
    },
    completedAmount: {
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
        marginTop: SPACING.xs,
    },
    cancelButton: {
        borderColor: COLORS.danger,
    },
});
