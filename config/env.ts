import { Platform } from 'react-native';
import Constants from 'expo-constants';

const HOSTNAME_REGEX = /(localhost|127\.0\.0\.1|YOUR_SERVER_IP)/i;

const parseHostFromManifest = (): string | undefined => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    return undefined;
  }
  try {
    const normalizedUri = hostUri.startsWith('http') ? hostUri : `http://${hostUri}`;
    const parsed = new URL(normalizedUri);
    return parsed.hostname;
  } catch (error) {
    console.warn('Failed to parse Expo hostUri', error);
    return undefined;
  }
};

const sanitizeBaseUrl = (url: string | undefined): string => {
  if (!url) {
    return '';
  }
  const trimmed = url.trim().replace(/\/$/, '');
  if (Platform.OS === 'web') {
    return trimmed;
  }
  if (!HOSTNAME_REGEX.test(trimmed)) {
    return trimmed;
  }
  const manifestHost = parseHostFromManifest();
  if (!manifestHost) {
    console.warn(
      'Unable to resolve API base URL automatically. Please update EXPO_PUBLIC_API_BASE_URL to use your LAN IP.'
    );
    return trimmed;
  }
  console.log(`Remapping API host to ${manifestHost} for device testing`);
  return trimmed.replace(HOSTNAME_REGEX, manifestHost);
};

const rawApiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  Constants.expoConfig?.extra?.apiBaseUrl ||
  'http://YOUR_SERVER_IP:8000/api';

const rawSocketUrl =
  process.env.EXPO_PUBLIC_SOCKET_URL ||
  Constants.expoConfig?.extra?.socketUrl ||
  'ws://localhost:3000';

const rawAiCarImageUrl =
  process.env.EXPO_PUBLIC_AI_CAR_IMAGE_URL ||
  Constants.expoConfig?.extra?.aiCarImageUrl ||
  'https://example.com/api/ai/generate-car-image';

const ENV = {
  API_BASE_URL: sanitizeBaseUrl(rawApiBaseUrl),
  SOCKET_URL: sanitizeBaseUrl(rawSocketUrl),
  AI_CAR_IMAGE_URL: rawAiCarImageUrl,
};

export default ENV;
