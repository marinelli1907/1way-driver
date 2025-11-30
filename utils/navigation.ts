import { Linking, Platform, Alert } from 'react-native';

export const openMaps = (latitude: number, longitude: number, label?: string) => {
  const options = [
    { name: 'Apple Maps', value: 'apple' },
    { name: 'Google Maps', value: 'google' },
    { name: 'Waze', value: 'waze' },
  ];

  if (Platform.OS === 'web') {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
    return;
  }

  const buttons = options.map(option => ({
    text: option.name,
    onPress: () => {
      let url = '';
      switch (option.value) {
        case 'apple':
          url = `http://maps.apple.com/?daddr=${latitude},${longitude}${label ? `&saddr=${label}` : ''}`;
          break;
        case 'google':
          url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
          break;
        case 'waze':
          url = `https://www.waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
          break;
      }

      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', `Cannot open ${option.name}`);
        }
      });
    },
  }));

  Alert.alert(
    'Open Navigation',
    'Choose your preferred navigation app:',
    [...buttons, { text: 'Cancel', style: 'cancel' }]
  );
};
