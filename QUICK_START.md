# ⚡ Dashboard Quick Start Checklist

Copy-paste guides to get your dashboard running in minutes.

---

## 📋 Pre-Flight Checks

- [ ] Backend running? `node server.js` in `/backend` (should see "Server running on port 5000")
- [ ] Frontend running? `npm run dev` in `/client` (should see "Local: http://localhost:5173")
- [ ] Supabase project created? Check [app.supabase.com](https://app.supabase.com)
- [ ] Logged in to your app? (if not, go to /register then /login)
- [ ] Your `scans` table active? (should already exist in Supabase)

---

## 🔧 ONE-TIME SETUP

### Step 1: Verify Your Scans Table (Already Exists!)

✅ **You already have a scans table with:**
```
- id (UUID)
- user_id (FK to users)
- crop_type (TEXT)
- disease (TEXT) - disease name or "Healthy"
- confidence (DECIMAL) - 0-100
- severity (TEXT, optional)
- solution (TEXT) - treatment/solution
- created_at (TIMESTAMP)
```

**The dashboard will automatically work with this schema!**

No SQL needed - we've configured the backend to map your fields correctly:
- `disease` → shows as disease diagnosis
- `confidence` → shows as scan confidence score
- `solution` → shows as treatment recommendation
- `severity` → displayed in scan details
- `created_at` → used for sorting scans

---

### Step 2: Make Sure You Have Sample Data

✅ **You mentioned you have sample data already!**

The dashboard will display:
- **Total Scans** = count of all your scan records
- **Diseases Detected** = scans where disease ≠ "Healthy" or "None"
- **Healthy Crops** = scans where disease = "Healthy" or "None"  
- **Farm Health Score** = (healthy / total) × 100
- **Recent Scans Table** = your 5 most recent scans

---

## 🎯 TESTING THE DASHBOARD

### Test 1: Verify Backend Endpoint (Terminal)

Copy & paste into your terminal:

```bash
# Make sure you have a token first (log in on frontend)
# Then replace YOUR_TOKEN with your actual JWT token

curl -X GET http://localhost:5000/api/dashboard/metrics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Should return JSON like:
# {
#   "total_scans": 5,
#   "diseases_detected": 2,
#   "healthy_crops": 3,
#   "farm_health_score": 60,
#   "insights": [...]
#   ...
# }
```

---

### Test 2: View Dashboard in Browser

1. Open http://localhost:5173 in browser
2. Log in if needed
3. Click **Dashboard** in sidebar or nav
4. You should see:
   - ✅ Sidebar on left with hamburger menu
   - ✅ "Farm Overview" heading
   - ✅ 4 stat cards:
     - Total Scans: 5
     - Diseases Detected: 2
     - Healthy Crops: 3
     - Farm Health Score: 60%
   - ✅ AI Insights panel
   - ✅ Recent Scans table with your sample data

---

### Test 3: Test Sidebar Toggle

1. Click the **hamburger menu** (≡) in top-left of sidebar
2. Sidebar should **collapse** to narrow icon-only view
3. Click **X** button
4. Sidebar should **expand** back to full view
5. On mobile: overlay should appear when sidebar opens

---

## 🎨 VISUAL VERIFICATION

✅ **Colors Look Right?**
- Background: Dark green (not light gray)
- Sidebar: Dark green
- Accent colors: Yellow/lime green
- Text: White or light gray (not dark)

✅ **Layout Correct?**
- Sidebar on LEFT
- Main content on RIGHT
- Stats in 4-column grid (desktop)
- Table below

✅ **No Console Errors?**
- Open DevTools (F12)
- Click **Console** tab
- Should be clean (no red errors)

---

## 🐛 TROUBLESHOOTING

### "Failed to fetch metrics" Error

**Problem:** Dashboard shows error message

**Check:**
1. Is backend running? `node server.js` in `/backend` terminal
2. Is port 5000 open? Try http://localhost:5000/ in browser (should show JSON)
3. Are you logged in? (check if you have a token)
4. Does your scans table have data? Check Supabase > Table Editor > scans

**Fix:**
- Restart backend: Press Ctrl+C, then `node server.js` again
- Check Supabase connection string in `backend/config/db.js`

---

### "No scans yet" But Dashboard Should Show Data

**Problem:** Dashboard shows 0 scans even though you have data

**Check:**
1. Are you logged in as the user who created the scans?
2. Check your scans table in Supabase:
   ```sql
   SELECT COUNT(*) FROM scans WHERE user_id = (SELECT id FROM auth.users LIMIT 1);
   ```

**Fix:**
- Hard refresh browser: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- Or clear localStorage: Open DevTools > Application > Storage > localStorage > clear

---

### Disease Count Shows Wrong Numbers

**Problem:** Stats show different numbers than expected

**NOTE:** Your dashboard calculates:
- **Healthy Crops** = scans where `disease` = "Healthy" OR "None"
- **Diseases Detected** = scans where `disease` ≠ "Healthy" AND ≠ "None"

**Check:**
- What values do you use in the `disease` field? (e.g., "Healthy", "None", actual disease names?)
- If you use different values, let me know and I'll adjust the calculation

**Fix:**
- Edit backend controller: `backend/controllers/dashboardController.js`
- Find: `scan.disease.toLowerCase() === 'healthy'`
- Update to match your actual "healthy" values

---

## 📱 MOBILE TESTING

1. Open DevTools (F12)
2. Click device toggle (📱 icon)
3. Select "iPhone 12 Pro" or similar
4. Sidebar should:
   - Show as overlay
   - Have backdrop overlay behind it
   - Close when you click backdrop

---

## 🎓 NEXT STEPS AFTER EVERYTHING WORKS

1. **Create Scan Upload Page**
   - Route: `/scan`
   - Allow file upload
   - Show disease detection results

2. **Implement AI Scan Analysis**
   - Integrate ML model (TensorFlow.js or API)
   - Analyze uploaded images
   - Return disease predictions

3. **Add Charts/Graphs**
   - Show disease trends over time
   - Monthly scan count
   - Crop type breakdown

4. **Export Functionality**
   - Generate PDF reports
   - Export scan history as CSV

---

## 📞 FILES TO REVIEW

If something isn't working, check these files (in order):

1. **Database Issue?**
   - File: `DASHBOARD_SETUP.md`
   - Check: SQL syntax, user_id values

2. **Backend Issue?**
   - File: `backend/controllers/dashboardController.js`
   - Check: API responses, error messages

3. **Frontend Issue?**
   - File: `client/src/pages/DashboardPage.jsx`
   - Check: Data binding, component rendering

4. **UI/Styling Issue?**
   - File: `client/src/components/Sidebar.jsx`
   - Check: Tailwind classes, colors

5. **Overall Architecture?**
   - File: `ARCHITECTURE.md`
   - Explains full data flow

---

## ✅ SUCCESS CRITERIA

You'll know everything works when:

- [ ] Dashboard page loads without errors
- [ ] Stat cards show correct numbers from your existing data
- [ ] Recent scans table shows your actual scan records
- [ ] Diseases/Healthy crops calculated correctly based on your data
- [ ] Sidebar hamburger toggle works smoothly
- [ ] Colors are dark green + yellow (not other colors)
- [ ] Mobile view responsive and overlay works
- [ ] Console has no errors (F12 > Console tab)

---

**Ready? Let's go! 🚀**

1. Start your backend: `node server.js` in `/backend`
2. Start your frontend: `npm run dev` in `/client`
3. Open http://localhost:5173 in browser
4. Log in if needed
5. Click Dashboard in the nav
6. You should see your actual scan data displayed!

Questions? Check:
- Setup questions → `DASHBOARD_SETUP.md`
- Architecture questions → `ARCHITECTURE.md`
- Summary questions → `DASHBOARD_SUMMARY.md`
