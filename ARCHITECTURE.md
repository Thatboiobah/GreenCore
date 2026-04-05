# 🏗️ Dashboard Architecture - How Everything Works Together

This document explains the architecture and data flow. This is NOT vibecoding—every decision is explained.

---

## 🔄 Complete Data Flow

When a user opens the dashboard, here's exactly what happens:

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: User navigates to /dashboard                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                   Browser calls React Router
                         to load page
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: DashboardPage component mounts                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
          Component extracts JWT token from useAuth()
                              ↓
         useEffect hook triggers (runs on component mount)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Frontend makes TWO API calls                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌────────────────────────────────────────┐
        │                                        │
   CALL 1:                                   CALL 2:
   GET /api/dashboard/metrics              GET /api/dashboard/recent-scans
   (fetch farm stats)                      (fetch scan records)
        │                                        │
        └────────────────────────────────────────┘
                              ↓
            Axios API request includes JWT token
            in Authorization header:
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Backend receives requests                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        Express server routes to dashboardRoutes.js
                              ↓
        authMiddleware verifies JWT token
        (if invalid, returns 401 Unauthorized)
                              ↓
        Token is decoded and user.id extracted
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Controller functions execute                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        getDashboardMetrics() is called:
        1. Gets user_id from JWT
        2. Queries Supabase:
           SELECT * FROM scans WHERE user_id = :user_id
        3. Calculates metrics from results:
           - COUNT total scans
           - COUNT disease scans
           - COUNT healthy scans
           - Farm score = (healthy/total) * 100
           - Trends = 7-day vs 14-day comparison
           - Insights = generated from patterns
        4. Returns JSON response
                              ↓
        getRecentScans() is called:
        1. Gets user_id from JWT
        2. Queries Supabase:
           SELECT * FROM scans 
           WHERE user_id = :user_id
           ORDER BY scan_date DESC
           LIMIT 5
        3. Formats each scan for frontend
        4. Returns JSON array
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Frontend receives responses                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        setState(dashboardData) - metrics saved to state
        setState(recentScans) - scans saved to state
        setLoading(false) - stops showing spinner
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: React re-renders the page                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        Component receives new state
        React updates the DOM with:
        - 4 stat cards with metrics
        - AI insights panel
        - Recent scans table
                              ↓
        User sees dashboard with data!
```

---

## 🔐 Security: Why Each Part Exists

### JWT Token Verification
**Where:** `authMiddleware` on backend
**Why:** Ensures only logged-in users can access dashboard
**How:**
```javascript
// Token in header: "Authorization: Bearer eyJhbGc..."
// Middleware decodes token and extracts user.id
// If token invalid/expired, returns 401 Unauthorized
```

### Row Level Security (RLS) in Supabase
**Where:** Database policies on `scans` table
**Why:** Ensures users can ONLY see their own data
**How:**
```sql
-- SQL Policy: Users can only query their own scans
CREATE POLICY "Users can view own scans" ON scans
  FOR SELECT USING (auth.uid() = user_id);

-- This means: SELECT * FROM scans WHERE auth.uid() = scans.user_id
-- User A (id: 123) cannot see User B (id: 456) scans
```

### No Sensitive Data Exposure
**Where:** All API responses
**Why:** Backend only returns non-sensitive fields
**How:**
```javascript
// Good: Return scan results
{
  crop_type: "tomato",
  disease_detected: true,
  confidence_score: 98
}

// Bad: Would return (never do this)
{
  ...scan,
  user_email: "secret@example.com",  // ❌ NO
  api_key: "sk_test_...",            // ❌ NO
}
```

---

## 📊 Database Schema Explained

### Why Each Table

**scans Table - The Core**
```
Why needed?
- Store every crop scan the user performs
- Track disease detection results
- Build historical record for trends
- Generate insights from patterns

What it tracks?
- WHO scanned (user_id)
- WHAT was scanned (crop_type)
- WHEN it was scanned (scan_date)
- WHAT was found (disease_name, confidence_score)
- WHERE it was (gps_latitude, gps_longitude)
- WHAT TO DO (treatment_recommendation)
```

**Sample flow:**
```
1. User opens Scan page
   ↓
2. User takes photo of crop
   ↓
3. Image sent to backend
   ↓
4. AI analyzes image, detects disease
   ↓
5. Backend creates scan record in Supabase:
   INSERT INTO scans (
     user_id: "auth-user-123",
     crop_type: "tomato",
     disease_detected: true,
     disease_name: "Early Blight",
     confidence_score: 98,
     scan_date: NOW()
   )
   ↓
6. Dashboard queries scans table
   ↓
7. Shows metrics based on accumulated scan data
```

---

## 🎯 Component Interactions

### Sidebar Component
```
Sidebar.jsx provides:
├─ Navigation to all pages
├─ Collapsible menu via useState hook
├─ User info display
├─ Logout functionality
└─ Consistent visual appearance

Navigation flow:
<Link to="/dashboard"> 
  → React Router changes URL
  → DashboardPage component loads
  → Data fetching begins
```

### DashboardPage Component
```
DashboardPage.jsx provides:
├─ Layout with Sidebar on left
├─ useApi() hook for HTTP requests
├─ useAuth() hook for JWT token
├─ useState for loading/error states
├─ StatCard sub-component for metrics
└─ Recent Scans table

Data flow:
1. Component mounts
2. useEffect triggers
3. API calls made (with JWT token)
4. Results saved to state
5. Component re-renders with data
6. User sees dashboard
```

---

## 🔧 How Metrics Are Calculated

### Example Scenario
Let's say a user has these scans:

```
Scan 1: tomato, Early Blight (disease_detected: true)
Scan 2: cassava, Healthy (disease_detected: false)
Scan 3: corn, Healthy (disease_detected: false)
Scan 4: tomato, Powdery Mildew (disease_detected: true)
Scan 5: cassava, Healthy (disease_detected: false)
```

**Calculation:**
```
Total Scans = 5
Diseases Detected = 2 (scans where disease_detected = true)
Healthy Crops = 3 (scans where disease_detected = false)
Farm Health Score = (3 / 5) × 100 = 60%
```

**Trend Calculation (assuming these occurred in order):**
```
Last 7 days: Scans 4 & 5 = 2 scans
Previous 7 days: Scans 1, 2, 3 = 3 scans
Trend = (2 - 3) / 3 × 100 = -33% (decreased activity)
```

---

## 🎨 Styling Strategy

### Why Dark Green + Yellow

1. **Dark Green (#1a3a2a)**
   - Represents agriculture/nature/crops
   - Easy on eyes (dark mode)
   - Professional appearance
   - Used for backgrounds and borders

2. **Yellow (#e4ff00)**
   - High contrast against dark green
   - Draws attention to important info
   - Represents positivity/health
   - Subtle in backgrounds, bold in accents

3. **Gray Text (gray-300, gray-400)**
   - Readable against dark backgrounds
   - Secondary information
   - Not as important as yellow-highlighted data

### Color Usage Rules
```javascript
// Primary backgrounds
bg-[#0f1f18]  (darkest green - deepest backgrounds)
bg-[#1a3a2a]  (dark green - main backgrounds)

// Accents & highlights
text-[#e4ff00]      (yellow text for important data)
border-[#e4ff00]    (yellow borders for focus)
bg-[#e4ff00]/20     (yellow with 20% opacity for subtle backgrounds)

// Status colors
bg-green-500/30     (subtle green for healthy status)
bg-red-500/30       (subtle red for disease status)

// Interactive states
hover:bg-[#e4ff00]/10      (hover effect - yellow background)
hover:text-[#e4ff00]       (hover effect - yellow text)
```

---

## 📈 Frontend State Management

### DashboardPage State
```javascript
// Loading state - shows spinner while fetching
const [loading, setLoading] = useState(true)
// Initially true, set to false when data arrives

// Dashboard metrics - farm stats
const [dashboardData, setDashboardData] = useState(null)
// Stores: {
//   total_scans: 15,
//   diseases_detected: 5,
//   farm_health_score: 67,
//   insights: [...],
//   ... more metrics
// }

// Recent scans - last 5 scans for table
const [recentScans, setRecentScans] = useState([])
// Stores array of scan objects

// Error - API error message if request fails
const [error, setError] = useState(null)
// Stores error message to display to user
```

### Sidebar State
```javascript
// Collapsed/expanded state
const [isSidebarOpen, setIsSidebarOpen] = useState(true)
// true = show full sidebar
// false = show collapsed hamburger-only version
```

---

## 🚨 Error Handling

### Frontend Error Handling
```javascript
try {
  // Attempt to fetch data
  const response = await api.get('/api/dashboard/metrics')
  setDashboardData(response.data)
} catch (err) {
  // If error, display message to user
  const message = err.response?.data?.message 
    || 'Failed to load dashboard'
  setError(message)
} finally {
  // Always stop loading spinner
  setLoading(false)
}
```

### Backend Error Handling
```javascript
try {
  // Execute query
  const { data: scans, error } = await supabase.from('scans')...
  if (error) throw error  // Throw Supabase error
  // Process data...
  return res.json(data)
} catch (error) {
  // Log error for debugging
  console.error('Error fetching metrics:', error)
  // Return HTTP 500 with friendly message
  return res.status(500).json({
    message: 'Failed to fetch metrics',
    error: error.message
  })
}
```

---

## 🔄 Why API Calls Are Needed

**Could we just fetch data directly from frontend?**
No! Here's why:

1. **Security Issues**
   - JWT token exposed in frontend code
   - Supabase credentials visible
   - Users could access other users' data

2. **Data Processing**
   - Backend can safely query database
   - Backend can calculate trends/metrics
   - Backend can generate insights
   - Backend validates data before sending

3. **Performance**
   - Backend can cache data
   - Backend can optimize queries
   - Backend can filter sensitive info before returning

---

## 📚 Key Files Summary

| File | Purpose | Lines |
|------|---------|-------|
| `Sidebar.jsx` | Navigation & toggle menu | ~130 |
| `DashboardPage.jsx` | Main dashboard UI | ~250 |
| `dashboardRoutes.js` | API endpoint definitions | ~30 |
| `dashboardController.js` | Core logic & queries | ~150 |
| `db.js` | Supabase connection | Already exists |
| `server.js` | Route registration | +1 line |

---

## ✅ Verification Points

**Is my JSON response correct?**
```javascript
// Check backend returns proper JSON
GET /api/dashboard/metrics should return:
{
  "total_scans": <number>,
  "diseases_detected": <number>,
  "healthy_crops": <number>,
  "farm_health_score": <number>,
  "insights": <array>,
  ...
}
```

**Is my JWT token being sent?**
```javascript
// Check Network tab in DevTools
// Request headers should include:
Authorization: Bearer eyJhbGc...
```

**Is RLS blocking unauthorized access?**
```javascript
// Try querying with wrong user_id
// Should return empty array or 401 error
```

**Are my colors applied?**
```javascript
// Inspect element in DevTools
// Background should be #0f1f18 or #1a3a2a
// Text should be #e4ff00 or white
```

---

**Now you understand the ENTIRE flow—no vibecoding here! 🎓**

Each component, API call, and database query serves a specific purpose in a secure, scalable architecture.
