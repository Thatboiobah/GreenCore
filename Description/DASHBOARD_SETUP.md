# 🗄️ GreenCore Dashboard - Database Setup Guide

> **NOTE:** If you already have a scans table in Supabase, skip to "Existing Schema Mapping" below!

---

## 📚 Overview

The dashboard displays farm overview metrics by reading from your `scans` table in Supabase.

---

## � Existing Schema Mapping

If you already have a scans table, the dashboard maps your fields automatically:

**Your Schema → Dashboard Display:**
```
disease (TEXT)                  → disease_name (shown in table)
confidence (DECIMAL)            → confidence_score (shown as %)
solution (TEXT)                 → treatment_recommendation (shown in details)
severity (TEXT, optional)       → severity (displayed in scan details)
created_at (TIMESTAMP)          → scan_date (used for sorting)
crop_type (TEXT)                → crop (shown in table)
```

**For Healthy Crops Calculation:**
The dashboard counts a crop as "Healthy" if:
```
disease value = "Healthy" OR "None"
```

If you use different values for healthy crops (e.g., "No Disease", "Good", etc.):
1. Edit `backend/controllers/dashboardController.js`
2. Find the line with `scan.disease.toLowerCase() === 'healthy'`
3. Add your custom values: `['healthy', 'none', 'no disease'].includes(scan.disease.toLowerCase())`

---

## 🆕 New Schema Setup (If You Don't Have a Scans Table)

### Why?
When a user uploads a crop image for disease detection, we need to store:
- What crop was scanned
- Whether disease was detected
- The confidence score of the diagnosis
- Recommendations for treatment
- Location data (GPS coordinates)

### How to Create in Supabase UI:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your GreenCore project
3. Click **SQL Editor** (or create table from UI)
4. Run this SQL:

```sql
-- Create scans table to store crop scan results
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Crop information
  crop_type TEXT NOT NULL, -- e.g., "tomato", "cassava", "corn"
  image_url TEXT, -- URL to the uploaded crop image
  
  -- Disease detection results
  disease_detected BOOLEAN DEFAULT false,
  disease_name TEXT, -- e.g., "Early Blight", "Healthy", "Powdery Mildew"
  confidence_score INTEGER, -- 0-100 percentage
  
  -- Recommendations
  treatment_recommendation TEXT, -- e.g., "Apply fungicide, increase spacing"
  
  -- Location
  gps_latitude DECIMAL(10, 8),
  gps_longitude DECIMAL(11, 8),
  
  -- Timestamps
  scan_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX idx_scans_user_id ON scans(user_id);

-- Create index on scan_date for sorting/filtering by date
CREATE INDEX idx_scans_date ON scans(scan_date DESC);

-- Enable Row Level Security (RLS) for security
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own scans
CREATE POLICY "Users can view own scans" ON scans
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own scans
CREATE POLICY "Users can insert own scans" ON scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own scans
CREATE POLICY "Users can update own scans" ON scans
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own scans
CREATE POLICY "Users can delete own scans" ON scans
  FOR DELETE USING (auth.uid() = user_id);
```

### What Each Column Does:

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Unique identifier for this scan |
| `user_id` | UUID | Links to the user who performed the scan |
| `crop_type` | TEXT | Type of crop scanned (tomato, cassava, corn, etc.) |
| `image_url` | TEXT | URL to the storage location of the scan image |
| `disease_detected` | BOOLEAN | true if disease found, false if healthy |
| `disease_name` | TEXT | Name of the disease or "Healthy" |
| `confidence_score` | INTEGER | How sure the AI is (0-100%) |
| `treatment_recommendation` | TEXT | What to do about the disease |
| `gps_latitude` | DECIMAL | Location latitude (optional) |
| `gps_longitude` | DECIMAL | Location longitude (optional) |
| `scan_date` | TIMESTAMP | When the scan was performed |
| `created_at` | TIMESTAMP | When record was created in DB |
| `updated_at` | TIMESTAMP | When record was last updated |

---

## 🚀 Step 2: Sample Data (Optional)

To test your dashboard, insert sample scan data:

```sql
-- Insert sample scans for testing
INSERT INTO scans (
  user_id, 
  crop_type, 
  image_url, 
  disease_detected, 
  disease_name, 
  confidence_score, 
  treatment_recommendation,
  scan_date
) VALUES 
  (
    (SELECT id FROM auth.users LIMIT 1), -- Replace with actual user ID
    'tomato',
    '/public/sample-tomato.jpg',
    true,
    'Early Blight',
    98,
    'Apply fungicide spray, improve air circulation',
    NOW() - INTERVAL '1 day'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'cassava',
    '/public/sample-cassava.jpg',
    false,
    'Healthy',
    95,
    'Continue current care routine',
    NOW() - INTERVAL '2 days'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'corn',
    '/public/sample-corn.jpg',
    true,
    'Powdery Mildew',
    87,
    'Increase soil moisture, apply sulfur treatment',
    NOW() - INTERVAL '3 days'
  );
```

---

## 📊 Step 3: How the Dashboard Uses This Data

### Dashboard Metrics Calculation:

The backend `dashboardController.js` queries the `scans` table and calculates:

**Total Scans** = COUNT of all scans for user
```
SELECT COUNT(*) FROM scans WHERE user_id = :user_id
```

**Diseases Detected** = COUNT of scans where disease_detected = true
```
SELECT COUNT(*) FROM scans WHERE user_id = :user_id AND disease_detected = true
```

**Healthy Crops** = COUNT of scans where disease_detected = false
```
SELECT COUNT(*) FROM scans WHERE user_id = :user_id AND disease_detected = false
```

**Farm Health Score** = (healthy_crops / total_scans) * 100
```
Formula: (Healthy Crops / Total Scans) × 100 = Health %
Example: (10 healthy / 15 total) × 100 = 67% health score
```

**Trends** = Compare metrics from last 7 days vs previous 7 days
```
Recent (7 days): 5 scans
Previous (7 days): 3 scans
Trend: (5-3)/3 * 100 = +67% increase
```

---

## 🔄 Step 4: Flow Diagram

```
User opens Dashboard
    ↓
Frontend calls: GET /api/dashboard/metrics
    ↓
Backend queries Supabase:
  SELECT * FROM scans WHERE user_id = 'current_user'
    ↓
Backend calculates:
  - Total scans
  - Diseases detected count
  - Healthy crops count
  - Farm health score
  - Trends from last 14 days
  - AI insights from patterns
    ↓
Backend returns JSON to frontend
    ↓
Frontend displays:
  - 4 stat cards with metrics
  - AI insights panel
  - Recent scans table
```

---

## ✅ Verification Checklist

After setting up, verify everything works:

- [ ] Can log in to the app
- [ ] Navigate to /dashboard
- [ ] See sidebar with hamburger menu toggle
- [ ] See Farm Overview stats cards
- [ ] See AI Insights section
- [ ] See Recent Scans table populated
- [ ] Hamburger menu toggles sidebar on mobile
- [ ] Colors match dark green + yellow theme

---

## 🐛 Troubleshooting

### Dashboard shows "No scans yet"
- ✅ This is normal for a new account
- ✅ You need to create scan records in the scans table
- ✅ Use the sample data INSERT statement above to test

### Stats display as 0
- ✅ Check that user_id in scans matches logged-in user
- ✅ Verify RLS policies are correctly set
- ✅ Check browser console for API errors

### "Failed to fetch metrics" error
- ✅ Verify backend is running on port 5000
- ✅ Check CORS origin in server.js matches frontend URL
- ✅ Verify Supabase credentials in backend/config/db.js

---

## 📱 Next Steps

1. **Upload Scan Functionality** - Create endpoint to accept crop images and save to Supabase Storage
2. **AI Disease Detection** - Integrate ML model to analyze images and detect diseases
3. **Notifications** - Alert users when diseases are detected
4. **Export Reports** - Allow users to download farm health reports
5. **Multi-Farm Support** - Allow users to manage multiple farms

---

## 📞 Questions?

Review the code in:
- Frontend: `client/src/pages/DashboardPage.jsx`
- Frontend: `client/src/components/Sidebar.jsx`
- Backend: `backend/controllers/dashboardController.js`
- Backend: `backend/routes/dashboardRoutes.js`

Each section has detailed comments explaining the logic!
