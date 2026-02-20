import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') {
    console.log('Push notifications are not supported on web');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push notification token:', token);

    return token;
  } catch (error) {
    console.error('Error getting push notification token:', error);
    return null;
  }
}

export async function scheduleNewJobNotification(jobData: {
  id: string;
  pickupAddress: string;
  payout: number;
  distance: number;
}) {
  if (Platform.OS === 'web') {
    console.log('🚗 New Ride Request:', `${jobData.payout.toFixed(2)} • ${jobData.distance}mi - ${jobData.pickupAddress}`);
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚗 New Ride Request',
        body: `${jobData.payout.toFixed(2)} • ${jobData.distance}mi\n${jobData.pickupAddress}`,
        data: { jobId: jobData.id, type: 'new_job' },
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

export async function scheduleUnoActionNotification(action: 'accepted' | 'bid' | 'declined', jobData: {
  id: string;
  pickupAddress: string;
  payout: number;
}) {
  const titles = {
    accepted: '✅ Uno Auto-Accepted Job',
    bid: '💰 Uno Placed Bid',
    declined: '❌ Uno Declined Job',
  };

  const bodies = {
    accepted: `Job accepted: ${jobData.payout.toFixed(2)}`,
    bid: `Bid placed: ${jobData.payout.toFixed(2)}`,
    declined: `Job declined: ${jobData.payout.toFixed(2)}`,
  };

  if (Platform.OS === 'web') {
    console.log(titles[action], `${bodies[action]} - ${jobData.pickupAddress}`);
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: titles[action],
        body: `${bodies[action]}\n${jobData.pickupAddress}`,
        data: { jobId: jobData.id, type: 'uno_action', action },
        sound: false,
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error scheduling Uno notification:', error);
  }
}

export async function cancelAllNotifications() {
  if (Platform.OS === 'web') {
    console.log('Cancel notifications not supported on web');
    return;
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
}
