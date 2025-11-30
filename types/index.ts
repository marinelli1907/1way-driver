export type UserRole = 'rider' | 'driver' | 'both';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isOnline?: boolean;
  photoUri?: string;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  documentsSubmitted?: boolean;
}

export interface Driver extends User {
  licenseNumber?: string;
  availability?: DriverAvailability[];
  car?: DriverCar;
  earningsSummary?: DriverEarningsSummary;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  notes?: string;
  needs_ride: boolean;
  ride_status: 'none' | 'searching' | 'matched' | 'completed';
}

export type RideStatus = 'open' | 'bid_sent' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface Ride {
  id: number;
  event_id?: number;
  rider_name?: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_time: string;
  price_offer: number;
  distance_miles?: number;
  status: RideStatus;
  bid_id?: number;
  my_bid_amount?: number;
  requiresBid?: boolean;
}

export interface RideBid {
  id: number;
  ride_id: number;
  driver_id: number;
  bid_amount: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export type JobStatus = 'pending' | 'assigned' | 'en-route' | 'in_progress' | 'completed' | 'cancelled' | 'open';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address: string;
  name?: string;
}

export interface Job {
  id: string;
  pickupLocation: GeoLocation;
  dropoffLocation: GeoLocation;
  pickupTime: string;
  status: JobStatus;
  grossFare: number;
  appShare: number;
  driverShare: number;
  distance: number;
  duration: number;
  passengerName?: string;
  passengerPhone?: string;
  notes?: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  requiresBid?: boolean;
}

export interface DriverExpense {
  id: number;
  driver_id: number;
  date: string;
  category: 'fuel' | 'tolls' | 'maintenance' | 'car_wash' | 'parking' | 'insurance' | 'registration' | 'repairs' | 'tires' | 'oil_change' | 'car_payment' | 'cleaning_supplies' | 'phone_bill' | 'snacks_drinks' | 'other' | string;
  amount: number;
  miles?: number;
  notes?: string;
  isCustomCategory?: boolean;
}

export type ExpenseCategory = 'fuel' | 'tolls' | 'maintenance' | 'car_wash' | 'parking' | 'insurance' | 'registration' | 'repairs' | 'tires' | 'oil_change' | 'car_payment' | 'cleaning_supplies' | 'phone_bill' | 'snacks_drinks' | 'other' | string;

export interface Expense {
  id: string;
  driver_id?: number;
  date: string;
  category: ExpenseCategory;
  amount: number;
  miles?: number;
  notes?: string;
  jobId?: string;
  createdAt: string;
  isCustomCategory?: boolean;
}

export interface MileageEntry {
  id: string;
  jobId?: string;
  distance: number;
  date: string;
  purpose?: string;
  isJobRelated: boolean;
  createdAt: string;
}

export interface DriverCar {
  make: string;
  model: string;
  year: string;
  color: string;
  license_plate: string;
  ai_image_url?: string;
}

export interface DriverEarningsSummary {
  gross_earnings: number;
  app_share: number;
  driver_share: number;
  expenses_total: number;
  miles_total: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  phone: string;
  password_confirmation: string;
  license_number?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: string;
  vehicle_color?: string;
  license_plate?: string;
  verification_status?: 'pending' | 'approved' | 'rejected';
}

export interface AutoBidSettings {
  enabled: boolean;
  minPayout: number;
  minDollarsPerMile: number;
  maxPickupDistance: number;
  preferredStartTime: string;
  preferredEndTime: string;
}

export interface DriverAvailability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

export interface DayOffPreference {
  id: string;
  date: string;
  reason?: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'ride' | 'break' | 'personal' | 'maintenance';
  location?: string;
  notes?: string;
  jobId?: string;
}

export interface PreferredTimeWindow {
  startHour: number;
  endHour: number;
  days: number[];
}

export interface WorkingHourPreference {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

export interface ZonePreference {
  id: string;
  name: string;
  description?: string;
  color: string;
  enabled: boolean;
}

export interface AutomationPreferences {
  enabled: boolean;
  minPayout: number;
  maxPayout?: number;
  maxDistance: number;
  preferredTimeWindows: PreferredTimeWindow[];
  maxDailyHours: number;
  preferredTripTypes: string[];
  autoBid: boolean;
  autoAccept: boolean;
  daysOff: DayOffPreference[];
  workingHours: WorkingHourPreference[];
  zones: ZonePreference[];
}

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface PunchInSession {
  id: string;
  driverId: string;
  startTime: string;
  endTime?: string;
  startOdometer: number;
  endOdometer?: number;
  totalMiles?: number;
  totalDuration?: number;
  isPunchedIn: boolean;
}

export interface DriverAnalytics {
  totalHoursWorked: number;
  totalMinutesWorked: number;
  totalSecondsWorked: number;
  totalRides: number;
  totalTips: number;
  averageRating: number;
  totalReviews: number;
  memberSince: string;
  currentMonthEarnings: number;
  currentMonthMiles: number;
  lifetimeEarnings: number;
  lifetimeMiles: number;
}

export interface ChatMessage {
  id: string;
  rideId: string;
  senderId: string;
  senderType: 'driver' | 'passenger';
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ChatThread {
  id: string;
  rideId: string;
  passengerId: string;
  passengerName: string;
  driverId: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface MarketplaceDiscount {
  id: string;
  title: string;
  description: string;
  provider: string;
  discountPercent?: number;
  discountAmount?: number;
  code?: string;
  category: 'fuel' | 'maintenance' | 'insurance' | 'food' | 'entertainment' | 'health' | 'other';
  expiresAt?: string;
  imageUrl?: string;
}

export interface MarketplaceMerch {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: 'apparel' | 'accessories' | 'equipment' | 'other';
  inStock: boolean;
}

export interface GasStation {
  id: string;
  name: string;
  address: string;
  distance: number;
  latitude: number;
  longitude: number;
  regularPrice?: number;
  midgradePrice?: number;
  premiumPrice?: number;
  dieselPrice?: number;
}

export interface EVCharger {
  id: string;
  name: string;
  address: string;
  distance: number;
  latitude: number;
  longitude: number;
  network?: string;
  level: 'Level 1' | 'Level 2' | 'DC Fast Charge';
  available: boolean;
  pricePerKwh?: number;
}

export interface RideHistory {
  id: string;
  passengerId: string;
  passengerName: string;
  pickupAddress: string;
  dropoffAddress: string;
  date: string;
  earnings: number;
  tip: number;
  rating?: number;
  distance: number;
  duration: number;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  rating: number;
  totalRides: number;
  averageTip: number;
  lastRideDate?: string;
}

export interface DailyGoal {
  id: string;
  date: string;
  targetEarnings: number;
  targetHours: number;
  targetRides: number;
  endTime?: string;
  actualEarnings?: number;
  actualHours?: number;
  actualRides?: number;
  status: 'active' | 'completed' | 'missed';
}

export type StrategyMode = 'aggressive' | 'balanced' | 'conservative';
export type PreferenceProfileType = 'personal' | 'ai_today';

export interface DriverPreferences {
  strategy_mode: StrategyMode;
  min_dollars_per_mile: number;
  min_trip_payout: number;
  max_unpaid_pickup_distance_miles: number;
  target_hourly_rate: number;
  available_time_blocks: { day: string; start: string; end: string }[];
  max_daily_hours: number;
  max_continuous_hours_before_break: number;
  buffer_minutes_between_rides: number;
  preferred_end_time: string;
  home_base_zip: string;
  preferred_zones: string[];
  avoid_zones: string[];
  max_dropoff_distance_from_home_miles: number;
  favorite_ride_length: 'short' | 'medium' | 'long' | 'mixed';
  allow_late_night: boolean;
  late_night_start?: string;
  late_night_end?: string;
  burnout_protection_enabled: boolean;
  stick_to_plan_vs_flex: number;
}

export interface DriverPreferenceState {
  personal: DriverPreferences;
  ai_today?: DriverPreferences;
  active_profile: PreferenceProfileType;
  ai_assist_enabled_today: boolean;
  last_ai_plan_date?: string;
}
