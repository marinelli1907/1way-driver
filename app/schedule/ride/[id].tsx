import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Linking, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Job } from '@/types';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { Button } from '@/components/Button';
import { RideTimer } from '@/components/RideTimer';
import { RoutePreview } from '@/components/RoutePreview';
import { MessageSquare, CheckCircle, Play, User, MapPin, X } from 'lucide-react-native';
import { useJobsStore } from '@/store/jobsStore';

export default function RideDetailScreen() {
    const { id } = useLocalSearchParams();
    const { myJobs, startTrip, completeTrip, cancelJob } = useJobsStore();
    const [ride, setRide] = useState<Job | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const job = myJobs.find(j => j.id === id);
        if (job) {
            setRide(job);
        }
    }, [id, myJobs]);

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
        if (!ride) {
            console.log('[RideDetail] No ride found');
            return;
        }
        
        console.log(`[RideDetail] Updating ride ${ride.id} to status: ${newStatus}`);
        setActionLoading(true);
        try {
            if (newStatus === 'en-route') {
                console.log('[RideDetail] Starting trip...');
                await startTrip(ride.id);
                console.log('[RideDetail] Trip started successfully');
            } else if (newStatus === 'completed') {
                console.log('[RideDetail] Completing trip...');
                await completeTrip(ride.id, {});
                console.log('[RideDetail] Trip completed successfully');
                Alert.alert(
                    'Ride Completed',
                    `Payment of ${ride.driverShare.toFixed(2)} has been processed.`,
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else if (newStatus === 'cancelled') {
                console.log('[RideDetail] Cancelling trip...');
                await cancelJob(ride.id, 'Driver cancelled');
                console.log('[RideDetail] Trip cancelled successfully');
                Alert.alert(
                    'Trip Cancelled',
                    'The ride has been cancelled.',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            }
        } catch (err: any) {
            console.error('[RideDetail] Update ride status error:', {
                message: err?.message,
                name: err?.name,
                stack: err?.stack,
                fullError: err
            });
            const errorMessage = err?.message || 'An unexpected error occurred';
            Alert.alert('Error', `Failed to update ride status: ${errorMessage}`);
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
                { text: 'Start', onPress: () => updateRideStatus('en-route') }
            ]
        );
    };

    const handleCompleteRide = () => {
        Alert.alert(
            'Complete Ride',
            `Confirm completion and process payment of ${ride?.driverShare.toFixed(2)}?`,
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

    if (!ride) return <View style={styles.container}><Text style={{ color: COLORS.text, textAlign: 'center', marginTop: 50 }}>Ride not found</Text></View>;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Ride Details' }} />
            
            <ScrollView contentContainerStyle={styles.content}>
                
                {(ride.status === 'assigned' || ride.status === 'en-route') && (
                  <RideTimer startTime={ride.pickupTime} status={ride.status === 'en-route' ? 'in_progress' : ride.status} />
                )}

                <RoutePreview
                  pickupAddress={ride.pickupLocation.address}
                  dropoffAddress={ride.dropoffLocation.address}
                  distance={ride.distance}
                  onOpenMaps={(app) => openMaps(ride.dropoffLocation.address, app)}
                />

                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <Text style={styles.status}>{ride.status.toUpperCase()}</Text>
                        <Text style={styles.price}>${ride.driverShare.toFixed(2)}</Text>
                    </View>

                    <View style={styles.riderRow}>
                        <View style={styles.avatar}>
                            <UserIcon name={ride.passengerName} />
                        </View>
                        <View>
                            <Text style={styles.riderName}>{ride.passengerName || 'Rider'}</Text>
                            <Text style={styles.notes}>{ride.status === 'assigned' ? 'Tap to contact' : 'Rider info'}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.timeline}>
                         <View style={styles.timelineItem}>
                             <View style={[styles.dot, styles.pickupDot]} />
                             <View>
                                 <Text style={styles.label}>Pickup</Text>
                                 <Text style={styles.address}>{ride.pickupLocation.address}</Text>
                                 <Text style={styles.time}>{new Date(ride.pickupTime).toLocaleString()}</Text>
                             </View>
                         </View>
                         <View style={styles.line} />
                         <View style={styles.timelineItem}>
                             <View style={[styles.dot, styles.dropoffDot]} />
                             <View>
                                 <Text style={styles.label}>Dropoff</Text>
                                 <Text style={styles.address}>{ride.dropoffLocation.address}</Text>
                             </View>
                         </View>
                    </View>
                </View>

                {(ride.status === 'assigned' || ride.status === 'en-route') && (
                  <>
                    <Text style={styles.sectionTitle}>Contact Passenger</Text>
                    <Button 
                        title="Message Passenger"
                        onPress={() => router.push({ 
                          pathname: '/chat/[rideId]', 
                          params: { rideId: ride.id.toString(), passengerName: ride.passengerName || 'Passenger' } 
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

                {ride.status === 'en-route' && (
                  <>
                    <Text style={styles.sectionTitle}>Complete Ride</Text>
                    <Button 
                        title={actionLoading ? 'Processing...' : `Complete & Receive ${ride.driverShare.toFixed(2)}`}
                        onPress={handleCompleteRide}
                        disabled={actionLoading}
                        style={[styles.actionButton, styles.completeButton]}
                        icon={actionLoading ? <ActivityIndicator size="small" color={COLORS.background} /> : <CheckCircle size={18} color={COLORS.background} />}
                    />
                  </>
                )}

                {(ride.status === 'assigned' || ride.status === 'en-route') && (
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
                      <Text style={styles.completedAmount}>Payment: ${ride.driverShare.toFixed(2)}</Text>
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
