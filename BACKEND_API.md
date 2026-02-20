# 🚗 1Way Driver App - Backend Integration Guide

This document lists **all** backend endpoints your API must implement for the driver app to work.

---

## 🔐 Authentication

### POST `/api/auth/login`
Login driver with email and password.

**Request:**
```json
{
  "email": "driver@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "driver_123",
    "email": "driver@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "driver",
    "isOnline": false,
    "rating": 4.8,
    "totalTrips": 156,
    "earnings": {
      "today": 120.50,
      "week": 650.00,
      "month": 2400.00,
      "total": 15000.00,
      "pendingPayout": 450.00
    }
  }
}
```

---

### POST `/api/auth/register`
Register new driver account.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "driver@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "driver"
}
```

**Response:** Same as login

---

### POST `/api/auth/refresh`
Refresh expired JWT token.

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "token": "new_jwt_token_here"
}
```

---

### GET `/api/auth/me`
Get current authenticated user.

**Headers:** `Authorization: Bearer TOKEN`

**Response:** User object (same as login)

---

### POST `/api/auth/logout`
Logout and invalidate tokens.

**Headers:** `Authorization: Bearer TOKEN`

**Response:** `204 No Content`

---

## 🚕 Jobs/Rides

### GET `/api/jobs/available`
List available rides that driver can accept.

**Headers:** `Authorization: Bearer TOKEN`

**Query Params:**
- `maxDistance` (optional): Maximum distance in meters
- `minPayout` (optional): Minimum payout in dollars
- `startTime` (optional): ISO 8601 timestamp
- `endTime` (optional): ISO 8601 timestamp

**Response:**
```json
[
  {
    "id": "job_456",
    "pickupLocation": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "address": "123 Market St, San Francisco, CA",
      "name": "San Francisco Station"
    },
    "dropoffLocation": {
      "latitude": 37.8044,
      "longitude": -122.2712,
      "address": "456 Broadway, Oakland, CA"
    },
    "pickupTime": "2025-01-25T14:30:00Z",
    "status": "pending",
    "grossFare": 45.00,
    "appShare": 22.50,
    "driverShare": 22.50,
    "distance": 15000,
    "duration": 25,
    "passengerName": "Jane Smith",
    "passengerPhone": "+1987654321",
    "notes": "Please call when arriving",
    "createdAt": "2025-01-25T10:00:00Z"
  }
]
```

---

### GET `/api/jobs/my`
List driver's assigned/completed jobs.

**Headers:** `Authorization: Bearer TOKEN`

**Query Params:**
- `status` (optional): Filter by status

**Response:** Array of Job objects (same structure as available)

---

### GET `/api/jobs/:id`
Get single job details.

**Headers:** `Authorization: Bearer TOKEN`

**Response:** Job object

---

### POST `/api/jobs/:id/accept`
Accept an available job.

**Headers:** `Authorization: Bearer TOKEN`

**Response:** Updated Job object with `status: "assigned"`

---

### POST `/api/jobs/:id/start`
Start the trip (driver en route to pickup).

**Headers:** `Authorization: Bearer TOKEN`

**Response:** Updated Job object with `status: "en-route"`

---

### POST `/api/jobs/:id/pickup`
Mark passenger as picked up.

**Headers:** `Authorization: Bearer TOKEN`

**Response:** Updated Job object with `status: "picked-up"`

---

### POST `/api/jobs/:id/complete`
Complete the trip.

**Headers:** `Authorization: Bearer TOKEN`

**Request:**
```json
{
  "actualDistance": 15200,
  "actualDuration": 27
}
```

**Response:** Updated Job object with `status: "completed"` and `completedAt`

---

### POST `/api/jobs/:id/cancel`
Cancel a job.

**Headers:** `Authorization: Bearer TOKEN`

**Request:**
```json
{
  "reason": "Passenger no-show"
}
```

**Response:** Updated Job object with `status: "cancelled"`

---

## 💰 Expenses & Mileage

### GET `/api/driver/expenses`
List driver's expenses.

**Headers:** `Authorization: Bearer TOKEN`

**Query Params:**
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `category` (optional): Filter by category

**Response:**
```json
[
  {
    "id": "expense_789",
    "amount": 45.50,
    "category": "fuel",
    "date": "2025-01-25",
    "notes": "Gas at Shell station",
    "receipt": "https://cdn.example.com/receipts/abc123.jpg",
    "createdAt": "2025-01-25T15:00:00Z"
  }
]
```

**Categories:**
- `fuel`
- `maintenance`
- `car_wash`
- `parking`
- `tolls`
- `insurance`
- `phone`
- `supplies`
- `other`

---

### POST `/api/driver/expenses`
Create new expense.

**Headers:** `Authorization: Bearer TOKEN`

**Request:**
```json
{
  "amount": 45.50,
  "category": "fuel",
  "date": "2025-01-25",
  "notes": "Gas at Shell station",
  "receipt": "data:image/jpeg;base64,..."
}
```

**Response:** Created Expense object

---

### PUT `/api/driver/expenses/:id`
Update existing expense.

**Headers:** `Authorization: Bearer TOKEN`

**Request:** Partial Expense object

**Response:** Updated Expense object

---

### DELETE `/api/driver/expenses/:id`
Delete expense.

**Headers:** `Authorization: Bearer TOKEN`

**Response:** `204 No Content`

---

### GET `/api/driver/mileage`
List mileage entries.

**Headers:** `Authorization: Bearer TOKEN`

**Query Params:**
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD

**Response:**
```json
[
  {
    "id": "mileage_101",
    "jobId": "job_456",
    "distance": 15.2,
    "date": "2025-01-25",
    "purpose": "Ride from SF to Oakland",
    "isJobRelated": true,
    "createdAt": "2025-01-25T16:00:00Z"
  }
]
```

---

### POST `/api/driver/mileage`
Create manual mileage entry.

**Headers:** `Authorization: Bearer TOKEN`

**Request:**
```json
{
  "distance": 5.5,
  "date": "2025-01-25",
  "purpose": "Drive to car wash",
  "isJobRelated": true
}
```

**Response:** Created MileageEntry object

---

### GET `/api/driver/expenses/export/:format`
Export expenses as CSV or PDF.

**Headers:** `Authorization: Bearer TOKEN`

**Params:**
- `format`: `csv` or `pdf`

**Query Params:**
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD

**Response:** File download (blob)

---

## 💡 Revenue Share Calculation

**CRITICAL BUSINESS LOGIC:**

The app share is calculated **per driver, per calendar month**:

1. **First $500 of app earnings:** App takes **50%**, driver gets **50%**
2. **After app earns $500:** App takes **10%**, driver gets **90%**
3. **Reset:** On the 1st of each month, counters reset to zero

**Example:**

```typescript
// Month starts
monthlyAppShare = 0;

// Job 1: $100 gross
if (monthlyAppShare < 500) {
  appShare = $100 * 0.5 = $50
  driverShare = $100 - $50 = $50
  monthlyAppShare = $50
}

// Jobs 2-10: Each $100 gross
// Same logic until monthlyAppShare reaches $500

// Job 11: $100 gross
if (monthlyAppShare >= 500) {
  appShare = $100 * 0.1 = $10
  driverShare = $100 * 0.9 = $90
}

// All subsequent jobs: 10/90 split
```

**Implementation:**
```javascript
function calculateJobShares(driverId, grossFare, currentMonth) {
  const monthlyAppShare = getMonthlyAppShareTotal(driverId, currentMonth);
  const THRESHOLD = 500;

  if (monthlyAppShare >= THRESHOLD) {
    return {
      appShare: grossFare * 0.1,
      driverShare: grossFare * 0.9
    };
  }

  const remaining = THRESHOLD - monthlyAppShare;
  const fiftyPercent = grossFare * 0.5;

  if (fiftyPercent <= remaining) {
    return {
      appShare: fiftyPercent,
      driverShare: grossFare - fiftyPercent
    };
  }

  return {
    appShare: remaining,
    driverShare: grossFare - remaining
  };
}
```

---

## ⏳ TODO: Not Yet Implemented

These features have UI in the app but need backend:

### Messages/Chat
```
GET /api/messages/conversations
GET /api/messages/:conversationId
POST /api/messages
WebSocket: Real-time delivery
```

### Schedule/Events
```
GET /api/schedule/events
POST /api/schedule/events
DELETE /api/schedule/events/:id
```

### Car Details
```
GET /api/driver/car
PUT /api/driver/car
POST /api/driver/car/photos
```

### Documents
```
GET /api/driver/documents
POST /api/driver/documents (upload)
PUT /api/driver/documents/:id
```

### AI Car Avatar
```
POST /api/ai/generate-car-image
Body: { make, model, year, color }
Response: { imageUrl: string }
```

---

## 🔒 Security Notes

1. **JWT Auth:** All endpoints except login/register require `Authorization: Bearer TOKEN`
2. **Token Refresh:** Implement automatic refresh when token expires (401)
3. **Rate Limiting:** Add rate limits to prevent abuse
4. **Input Validation:** Validate all inputs server-side
5. **CORS:** Configure CORS for mobile app domain

---

## 🧪 Testing Endpoints

Use these test cases:

1. **Happy Path:** Register → Login → Get Jobs → Accept → Start → Complete
2. **Revenue Share:** Create jobs totaling >$500, verify share switches to 10%
3. **Token Refresh:** Wait for token expiry, verify auto-refresh works
4. **Error Cases:** Invalid credentials, expired token, job already accepted

---

**Questions?** Check `SETUP.md` for full documentation.
