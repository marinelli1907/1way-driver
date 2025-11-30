# 1Way Driver App - Setup & Documentation

## Quick Start

### 1. Install Dependencies
```bash
bun install
```

### 2. Create Environment File
Copy `.env.example` to `.env` and update with your backend URLs:
```env
EXPO_PUBLIC_API_BASE_URL=http://your-backend.com/api
EXPO_PUBLIC_SOCKET_URL=ws://your-backend.com
EXPO_PUBLIC_AI_CAR_IMAGE_URL=https://your-ai-service.com/generate
```

### 3. Run the App
```bash
bun run start
```

Scan QR code with Expo Go or press `w` for web.

---

## Backend API Requirements

### Authentication Endpoints

```typescript
POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string, refreshToken: string, user: Driver }

POST /api/auth/register  
Body: { firstName, lastName, email, phone, password, role: 'driver' }
Response: { token: string, refreshToken: string, user: Driver }

GET /api/auth/me
Headers: { Authorization: 'Bearer TOKEN' }
Response: Driver

POST /api/auth/refresh
Body: { refreshToken: string }
Response: { token: string }

POST /api/auth/logout
Headers: { Authorization: 'Bearer TOKEN' }
```

### Jobs/Rides Endpoints

```typescript
GET /api/jobs/available
Query: { maxDistance?, minPayout?, startTime?, endTime? }
Response: Job[]

GET /api/jobs/my
Query: { status?: string }
Response: Job[]

GET /api/jobs/:id
Response: Job

POST /api/jobs/:id/accept
Response: Job

POST /api/jobs/:id/start
Response: Job

POST /api/jobs/:id/complete
Body: { actualDistance?: number, actualDuration?: number }
Response: Job

POST /api/jobs/:id/cancel
Body: { reason: string }
Response: Job
```

### Expenses & Mileage Endpoints

```typescript
GET /api/driver/expenses
Query: { startDate?, endDate?, category? }
Response: Expense[]

POST /api/driver/expenses
Body: Expense (without id, createdAt)
Response: Expense

DELETE /api/driver/expenses/:id

GET /api/driver/mileage
Query: { startDate?, endDate? }
Response: MileageEntry[]

POST /api/driver/mileage
Body: MileageEntry (without id, createdAt)
Response: MileageEntry

GET /api/driver/expenses/export/:format
Query: { startDate?, endDate? }
Response: Blob (CSV or PDF)
```

---

## Data Models

### User/Driver Model
```typescript
interface Driver {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'driver';
  isOnline: boolean;
  rating?: number;
  totalTrips?: number;
  earnings: {
    today: number;
    week: number;
    month: number;
    total: number;
    pendingPayout: number;
  };
  carDetails?: CarDetails;
  documents?: DriverDocuments;
}
```

### Job Model
```typescript
interface Job {
  id: string;
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
    name?: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address: string;
    name?: string;
  };
  pickupTime: string;  // ISO 8601
  status: 'pending' | 'assigned' | 'en-route' | 'picked-up' | 'completed' | 'cancelled';
  grossFare: number;
  appShare: number;      // Calculated by revenue share logic
  driverShare: number;   // What driver earns
  distance: number;      // Meters
  duration: number;      // Minutes
  passengerName?: string;
  passengerPhone?: string;
  notes?: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
}
```

### Expense Model
```typescript
interface Expense {
  id: string;
  amount: number;
  category: 'fuel' | 'maintenance' | 'car_wash' | 'parking' | 'tolls' | 'insurance' | 'phone' | 'supplies' | 'other';
  date: string;  // YYYY-MM-DD
  notes?: string;
  receipt?: string;  // URL to uploaded image
  createdAt: string;
}
```

### MileageEntry Model
```typescript
interface MileageEntry {
  id: string;
  jobId?: string;  // If auto-tracked
  distance: number;  // Miles
  date: string;
  purpose: string;
  isJobRelated: boolean;
  createdAt: string;
}
```

---

## Revenue Share Logic

**Key Rule:** 50% → $500 → 90%

```typescript
// Monthly calculation per driver
function calculateShares(job: Job, driverId: string, currentMonth: string) {
  const monthlyAppShare = getMonthlyAppShare(driverId, currentMonth);
  const APP_THRESHOLD = 500;

  if (monthlyAppShare < APP_THRESHOLD) {
    // Still under $500 - take 50%
    const remainingToThreshold = APP_THRESHOLD - monthlyAppShare;
    const appShare = Math.min(job.grossFare * 0.5, remainingToThreshold);
    const driverShare = job.grossFare - appShare;
    return { appShare, driverShare };
  } else {
    // Over $500 - take 10%
    const appShare = job.grossFare * 0.1;
    const driverShare = job.grossFare * 0.9;
    return { appShare, driverShare };
  }
}

// Reset counters on the 1st of each month
```

**Example:**
- Job 1: $100 gross → $50 app, $50 driver (total app: $50)
- Job 2: $100 gross → $50 app, $50 driver (total app: $100)
- ...continues until app reaches $500
- Job 10: $100 gross → $10 app, $90 driver (total app: $500+)
- All subsequent jobs: 10% app, 90% driver

---

## Missing Backend Endpoints (TODO)

### Messages/Chat
```typescript
GET /api/messages/conversations
GET /api/messages/:conversationId
POST /api/messages
WebSocket: Real-time message delivery
```

### Schedule/Events
```typescript
GET /api/schedule/events
POST /api/schedule/events
DELETE /api/schedule/events/:id
```

### Car Details
```typescript
GET /api/driver/car
PUT /api/driver/car
POST /api/driver/car/photos
```

### Documents
```typescript
GET /api/driver/documents
POST /api/driver/documents
PUT /api/driver/documents/:id
```

### AI Car Avatar
External service or internal:
```typescript
POST /api/ai/generate-car-image
Body: { make, model, year, color }
Response: { imageUrl: string }
```

---

## Features Implemented

✅ **Core**
- Auth flow (login, register, auto-login)
- Dashboard with earnings & stats
- Jobs marketplace
- Job detail with navigation links
- Profile & settings
- Online/offline toggle

✅ **Smart Features**
- Expense tracking UI
- Mileage tracking UI
- Revenue split tracker (50%→$500→90%)
- Tax deduction estimates

⏳ **Placeholder/Stub**
- Schedule/calendar (UI only)
- Messages (UI only)
- AI tax assistant (UI + logic, needs backend)
- AI car avatar (stub ready)
- Export expenses (needs backend)

---

## Project Structure

```
app/
├── auth/
│   ├── login.tsx        # Login screen
│   └── register.tsx     # Register screen
├── (tabs)/
│   ├── index.tsx        # Dashboard
│   ├── jobs.tsx         # Jobs marketplace
│   ├── schedule.tsx     # Calendar (placeholder)
│   ├── earnings.tsx     # Earnings & revenue tracker
│   └── profile.tsx      # Profile & settings
├── job/
│   └── [id].tsx         # Job details
└── _layout.tsx          # Root navigation

components/
├── Button.tsx           # Reusable button
├── StatCard.tsx         # Stats display
└── JobCard.tsx          # Job item card

store/
├── authStore.ts         # Auth state (Zustand)
├── jobsStore.ts         # Jobs state
└── expensesStore.ts     # Expenses state

lib/
├── api.ts               # Axios client + interceptors
├── auth.ts              # Auth API functions
├── jobs.ts              # Jobs API functions
└── expenses.ts          # Expenses API functions

types/index.ts           # All TypeScript models
utils/
├── format.ts            # Currency, distance formatters
└── navigation.ts        # Maps app integration
```

---

## Testing

### Before connecting backend:
1. Update `.env` with mock server URL
2. Test navigation flow
3. Verify state management
4. Check UI on iOS, Android, Web

### After connecting backend:
1. Test auth flow (login, register, auto-login)
2. Test job acceptance & completion
3. Test expense tracking & export
4. Test revenue share calculations
5. Load test with 100+ jobs

---

## Design System

### Colors
- Primary: `#0066FF` (Blue)
- Success: `#00C853` (Green)
- Warning: `#FFA000` (Amber)
- Danger: `#D32F2F` (Red)
- Background: `#F5F7FA`
- Text: `#1A1A1A`

### Spacing
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px
- XXL: 48px

### Typography
- XS: 12px
- SM: 14px
- MD: 16px
- LG: 18px
- XL: 24px
- XXL: 32px

---

## Troubleshooting

### API Errors
- Check `.env` file exists and has correct URLs
- Verify backend is running
- Check network inspector for API responses

### TypeScript Errors
- Run `npx tsc --noEmit` to check all files
- Ensure all models match backend responses

### Navigation Issues
- Clear Expo cache: `bun run start --clear`
- Restart dev server

---

## Next Steps

1. **Backend Integration**
   - Implement all required endpoints
   - Test with real data

2. **Real-Time Features**
   - WebSocket for jobs & messages
   - Push notifications

3. **Advanced Features**
   - AI tax assistant integration
   - Car avatar generation
   - Schedule sync with Lifebook

4. **Production Readiness**
   - Add error tracking (Sentry)
   - Analytics (Amplitude, Mixpanel)
   - Performance monitoring
   - Automated testing
