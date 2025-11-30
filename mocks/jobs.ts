import type { Job } from '@/types';

export const mockJobs: Job[] = [
  {
    id: 'job-1',
    pickupLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '123 Market St, San Francisco, CA 94102',
      name: 'Union Square',
    },
    dropoffLocation: {
      latitude: 37.7849,
      longitude: -122.4094,
      address: '456 Mission St, San Francisco, CA 94105',
      name: 'Moscone Center',
    },
    pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: 'assigned',
    grossFare: 45.00,
    appShare: 22.50,
    driverShare: 22.50,
    distance: 3.2,
    duration: 15,
    passengerName: 'Sarah Johnson',
    passengerPhone: '+1 (555) 234-5678',
    notes: 'Please call when you arrive',
    createdAt: new Date().toISOString(),
    acceptedAt: new Date().toISOString(),
  },
  {
    id: 'job-2',
    pickupLocation: {
      latitude: 37.7649,
      longitude: -122.4294,
      address: '789 Howard St, San Francisco, CA 94103',
      name: 'SoMa District',
    },
    dropoffLocation: {
      latitude: 37.8049,
      longitude: -122.4194,
      address: 'San Francisco International Airport, CA 94128',
      name: 'SFO Airport',
    },
    pickupTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: 'assigned',
    grossFare: 85.00,
    appShare: 42.50,
    driverShare: 42.50,
    distance: 14.5,
    duration: 35,
    passengerName: 'Michael Chen',
    passengerPhone: '+1 (555) 345-6789',
    notes: 'Airport trip - luggage assistance needed',
    createdAt: new Date().toISOString(),
    acceptedAt: new Date().toISOString(),
  },
  {
    id: 'job-3',
    pickupLocation: {
      latitude: 37.7949,
      longitude: -122.3994,
      address: '321 Embarcadero, San Francisco, CA 94111',
      name: 'Ferry Building',
    },
    dropoffLocation: {
      latitude: 37.8199,
      longitude: -122.4783,
      address: 'Golden Gate Bridge, San Francisco, CA 94129',
      name: 'Golden Gate Bridge',
    },
    pickupTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    grossFare: 55.00,
    appShare: 27.50,
    driverShare: 27.50,
    distance: 8.7,
    duration: 25,
    passengerName: 'Emily Rodriguez',
    passengerPhone: '+1 (555) 456-7890',
    createdAt: new Date().toISOString(),
  },
];

export const mockAvailableJobs: Job[] = [
  {
    id: 'job-4',
    pickupLocation: {
      latitude: 37.7549,
      longitude: -122.4394,
      address: '555 Hayes St, San Francisco, CA 94102',
      name: 'Hayes Valley',
    },
    dropoffLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '888 Valencia St, San Francisco, CA 94110',
      name: 'Mission District',
    },
    pickupTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    grossFare: 35.00,
    appShare: 17.50,
    driverShare: 17.50,
    distance: 2.8,
    duration: 12,
    passengerName: 'David Kim',
    passengerPhone: '+1 (555) 567-8901',
    createdAt: new Date().toISOString(),
    requiresBid: true,
  },
  {
    id: 'job-5',
    pickupLocation: {
      latitude: 37.7849,
      longitude: -122.4094,
      address: '999 California St, San Francisco, CA 94108',
      name: 'Nob Hill',
    },
    dropoffLocation: {
      latitude: 37.7449,
      longitude: -122.4494,
      address: '111 Castro St, San Francisco, CA 94114',
      name: 'Castro District',
    },
    pickupTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    grossFare: 40.00,
    appShare: 20.00,
    driverShare: 20.00,
    distance: 3.5,
    duration: 18,
    passengerName: 'Jessica Martinez',
    passengerPhone: '+1 (555) 678-9012',
    notes: 'Quick trip to dinner',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'job-6',
    pickupLocation: {
      latitude: 37.7949,
      longitude: -122.4394,
      address: '222 Fillmore St, San Francisco, CA 94117',
      name: 'Pacific Heights',
    },
    dropoffLocation: {
      latitude: 37.7249,
      longitude: -122.3894,
      address: '333 Third St, San Francisco, CA 94107',
      name: 'Mission Bay',
    },
    pickupTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    grossFare: 50.00,
    appShare: 25.00,
    driverShare: 25.00,
    distance: 5.2,
    duration: 22,
    passengerName: 'Robert Taylor',
    passengerPhone: '+1 (555) 789-0123',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'job-7',
    pickupLocation: {
      latitude: 37.8049,
      longitude: -122.4694,
      address: '444 Lombard St, San Francisco, CA 94133',
      name: 'Russian Hill',
    },
    dropoffLocation: {
      latitude: 37.7549,
      longitude: -122.3994,
      address: '666 Brannan St, San Francisco, CA 94107',
      name: 'South Beach',
    },
    pickupTime: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    grossFare: 48.00,
    appShare: 24.00,
    driverShare: 24.00,
    distance: 4.8,
    duration: 20,
    passengerName: 'Amanda Wilson',
    passengerPhone: '+1 (555) 890-1234',
    notes: 'Heading to dinner reservation',
    createdAt: new Date().toISOString(),
  },
];

export function generateRandomJob(): Job {
  const locations = [
    { name: 'Downtown', address: '100 Main St', lat: 37.7749, lng: -122.4194 },
    { name: 'Airport', address: 'SFO Airport', lat: 37.7749, lng: -122.4194 },
    { name: 'Waterfront', address: '200 Beach St', lat: 37.8049, lng: -122.4194 },
    { name: 'Mission District', address: '300 Valencia St', lat: 37.7649, lng: -122.4194 },
    { name: 'Financial District', address: '400 Market St', lat: 37.7949, lng: -122.4094 },
  ];

  const pickupLoc = locations[Math.floor(Math.random() * locations.length)];
  const dropoffLoc = locations[Math.floor(Math.random() * locations.length)];
  
  const distance = 2 + Math.random() * 28;
  const baseFare = 10 + distance * 2.5 + Math.random() * 15;
  const grossFare = Math.round(baseFare * 100) / 100;
  const appShare = Math.round((grossFare * 0.5) * 100) / 100;
  const driverShare = Math.round((grossFare - appShare) * 100) / 100;
  
  const hoursAhead = 1 + Math.floor(Math.random() * 8);

  return {
    id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    pickupLocation: {
      latitude: pickupLoc.lat,
      longitude: pickupLoc.lng,
      address: pickupLoc.address,
      name: pickupLoc.name,
    },
    dropoffLocation: {
      latitude: dropoffLoc.lat,
      longitude: dropoffLoc.lng,
      address: dropoffLoc.address,
      name: dropoffLoc.name,
    },
    pickupTime: new Date(Date.now() + hoursAhead * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    grossFare,
    appShare,
    driverShare,
    distance: Math.round(distance * 10) / 10,
    duration: Math.round((distance / 30) * 60),
    passengerName: ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey'][Math.floor(Math.random() * 5)] + ' ' + ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)],
    passengerPhone: '+1 (555) ' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(1000 + Math.random() * 9000),
    createdAt: new Date().toISOString(),
  };
}
