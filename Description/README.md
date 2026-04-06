# 🌱 GreenCore: AI-Powered Agricultural Assistant

GreenCore is a full-stack, AI-powered agricultural assistant designed to help farmers detect crop diseases, receive intelligent recommendations, and make data-driven decisions using real-time environmental insights.

## 🚀 Overview

GreenCore integrates computer vision, real-time APIs, and intelligent analytics into a single platform that empowers farmers—especially those with limited resources—to manage crop health effectively.

The system combines:
- ✅ AI-powered image analysis
- ✅ Weather and environmental data
- ✅ Farm activity tracking
- ✅ Intelligent insights and recommendations
- ✅ Comprehensive farmer dashboard

**Our goal:** Reduce crop loss, improve yield, and make precision farming accessible through simple, intuitive interfaces.

---

## 🧠 Core Capabilities

### 1. AI Crop Disease Detection
GreenCore uses a trained machine learning model to analyze crop images and detect diseases.

**Process:**
- User uploads or captures a crop image
- Image is sent to backend for processing
- AI model analyzes the image
- Prediction returned with confidence score

**Output:**
- Crop type
- Disease name
- Confidence level (0-100%)
- Severity assessment

### 2. AI-Powered Recommendations
Based on detected diseases, GreenCore generates:
- Immediate treatment steps
- Preventive measures
- Long-term crop management advice

This ensures farmers not only identify problems but solve them effectively.

### 3. Weather Integration 🌦
Real-time environmental insights via weather API:
- Current weather conditions
- Temperature & humidity tracking
- Rainfall predictions
- Disease risk prediction (e.g., fungal diseases in high humidity)
- Irrigation strategy recommendations

### 4. Location-Based Services 📍
Using geolocation capabilities:
- Detect farmer's location
- Provide localized weather data
- Enable regional disease tracking

### 5. Farmer Dashboard
A centralized interface displaying:
- **Total Scans:** Cumulative number of crop analyses performed
- **Diseases Detected:** Count of positive disease identifications
- **Healthy Crops:** Count of healthy crop scans
- **Farm Health Score:** Percentage of healthy crops
- **AI Insights:** Auto-generated recommendations and observations
- **Recent Scans:** Latest 5 scans with crop type, diagnosis, date, confidence

### 6. Scan History (Digital Farm Record)
Stores comprehensive scan data:
- Original crop image
- Disease detected
- Confidence score (0-100%)
- Treatment recommendations
- Timestamp

Helps farmers track disease patterns and trends over time.

### 7. Authentication System
- Secure JWT-based authentication
- User registration and login
- Personalized user dashboards
- Session management

---

## 🧰 Tech Stack

### Frontend
- **Framework:** React 19.2.4
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Routing:** React Router
- **Icons:** React Icons (fiduciary)
- **Build Tool:** Vite

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** JavaScript

### Database
- **Provider:** Supabase (PostgreSQL)
- **Authentication:** Row Level Security (RLS)
- **ORM:** Direct SQL queries

### AI / Machine Learning
- **Model Type:** Convolutional Neural Network (CNN)
- **Training Data:** Plant disease datasets
- **Input Size:** 224x224 images
- **Output:** Multi-class disease classification

### External APIs
- **Weather:** OpenWeatherMap API
- **Geolocation:** Browser Geolocation API or IP-based

### Deployment
- **Frontend:** Vercel
- **Backend:** Render or Vercel serverless functions

---

## 🏗 System Architecture

```
User (Mobile/Web Browser)
    ↓
React Frontend (Vite)
    ↓
Backend API (Node.js / Express)
    ↓
-----------------------------------
| AI Model Service               |
| Weather API Integration        |
| Geolocation Services          |
-----------------------------------
    ↓
Supabase Database (PostgreSQL)
```

### Component Overview

**Frontend Components:**
- `DashboardPage.jsx` - Main dashboard with metrics and insights
- `Sidebar.jsx` - Collapsible navigation with user profile
- `LoginPage.jsx` - Authentication entry point
- `ScanPage.jsx` - Image upload and analysis
- `ScanHistoryPage.jsx` - Historical scan records
- `ProfilePage.jsx` - User profile management

**Backend Controllers:**
- `dashboardController.js` - Metrics calculation and insights generation
- `authController.js` - User authentication
- `scanController.js` - Disease detection and scan management
- `insightsController.js` - AI insights generation

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register       - Create new user account
POST   /api/auth/login          - User login (returns JWT)
GET    /api/auth/me             - Get current user info
```

### Dashboard
```
GET    /api/dashboard/metrics         - Get farm metrics (total scans, diseases, health score)
GET    /api/dashboard/recent-scans    - Get last 5 scans
```

### Scanning
```
POST   /api/scan/upload         - Upload crop image for analysis
GET    /api/scan/history        - Get all user scans
GET    /api/scan/:id            - Get specific scan details
DELETE /api/scan/:id            - Delete a scan record
```

### Insights
```
GET    /api/insights            - Get AI-generated farm insights
```

### Weather & Location
```
GET    /api/weather             - Get current weather
GET    /api/location            - Get user location
```

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Scans Table
```sql
CREATE TABLE scans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  crop_type VARCHAR(100),
  disease VARCHAR(255),
  confidence DECIMAL(5,2),
  severity VARCHAR(50),
  solution TEXT,
  image_url VARCHAR(500),
  gps_latitude DECIMAL(10,8),
  gps_longitude DECIMAL(11,8),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Row Level Security (RLS)
- Users can only view their own scans
- Authenticated access required for all operations
- JWT validation on backend

---

## 🎨 UI/UX Design

### Color Theme (GreenCore Branding)
- **Primary Green:** `#1a3a2a` (dark green, backgrounds)
- **Secondary Green:** `#0f1f18` (darker green accents)
- **Accent Yellow:** `#e4ff00` (highlights, CTAs)
- **Background:** White with subtle green borders
- **Text:** Dark green for headings, gray for body

### Dashboard Layout
- **Responsive Grid:** 1 column (mobile) → 2 columns (tablet) → 4 columns (desktop)
- **Fixed Sidebar:** Collapsible navigation with hamburger menu
- **Stat Cards:** Icon + metric + trend indicator
- **AI Insights Panel:** Auto-generated recommendations
- **Recent Scans Table:** Quick access to latest analyses

### Key UI Components
- `StatCard` - Reusable metric display component
- `Sidebar` - Navigation with user profile avatar
- `LoadingSpinner` - Yellow spinning animation
- `ProtectedRoute` - JWT-protected pages
- Error and success alerts

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Git

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret_key
WEATHER_API_KEY=your_openweathermap_key
EOF

# Start development server
npm run dev
```

**Environment Variables Required:**
- `PORT` - Server port (default: 5000)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase API key
- `JWT_SECRET` - Secret key for JWT tokens
- `WEATHER_API_KEY` - OpenWeatherMap API key

### Frontend Setup

```bash
# Navigate to frontend directory
cd client

# Install dependencies
npm install

# Create .env file (if needed)
# Update API base URL in hooks/useApi.js to http://localhost:5000

# Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:5173`

### Database Setup (Supabase)

1. **Create Supabase Project**
   - Sign up at https://supabase.com
   - Create new project
   - Get Project URL and API Key

2. **Create Tables** using SQL:
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scans table
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  crop_type VARCHAR(100),
  disease VARCHAR(255),
  confidence DECIMAL(5,2),
  severity VARCHAR(50),
  solution TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own scans
CREATE POLICY "Users can view own scans" ON scans
  FOR SELECT USING (auth.uid() = user_id);
```

3. **Enable Authentication**
   - In Supabase dashboard, go to Authentication
   - Enable Email/Password provider
   - Configure redirect URLs

---

## 🔄 Application Workflow

1. **User Authentication**
   - User signs up or logs in
   - JWT token generated and stored in localStorage

2. **Crop Scanning**
   - User navigates to Scan Crop page
   - Captures or uploads crop image
   - Image compressed and sent to backend

3. **AI Analysis**
   - Backend receives image
   - AI model processes image (local or cloud)
   - Disease detected with confidence score

4. **Data Enrichment**
   - Weather data fetched for user's location
   - Treatment recommendations generated
   - Data stored in database

5. **Dashboard Update**
   - Metrics recalculated (total scans, diseases, health score)
   - Insights regenerated
   - Recent scans table updated
   - Dashboard reflects real-time data

6. **Historical Tracking**
   - All scans stored in database
   - User can view scan history
   - Patterns and trends identified

---

## 📈 Dashboard Implementation Details

### Dashboard Metrics

**Total Scans**
- Counts all scans for authenticated user
- Calculates 7-day trend

**Diseases Detected**
- Counts scans where `disease != 'Healthy'`
- Shows trend compared to previous week

**Healthy Crops**
- Counts scans where `disease = 'Healthy'`
- Indicates percentage of disease-free crops

**Farm Health Score**
- Formula: `(healthy_crops / total_scans) * 100`
- Expressed as percentage
- Shows overall farm health

### AI Insights Generation

GreenCore auto-generates three insights:

1. **Most Common Disease**: Top disease affecting crops
2. **Scan Activity**: Analysis of scanning frequency
3. **Scan Quality**: Average confidence of recent scans

### Recent Scans Table

Displays last 5 scans with:
- Crop type with thumbnail
- Disease diagnosis (color-coded: red for disease, green for healthy)
- Scan date
- Confidence percentage (0-100%)
- Action menu

---

## 🔒 Security Features

### Authentication
- JWT-based token authentication
- Tokens stored securely in browser localStorage
- Automatic logout on token expiration
- Protected routes using `ProtectedRoute` component

### Database Security
- Row Level Security (RLS) enabled
- Users can only access their own data
- SQL injection prevention via parameterized queries
- Sensitive data never exposed in API responses

### API Security
- CORS enabled for localhost
- JWT validation on every protected endpoint
- Validation of user ownership before data access

---

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

### Manual Testing with API
```bash
# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get dashboard metrics (requires token)
curl -X GET http://localhost:5000/api/dashboard/metrics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📌 Future Enhancements

- 🌍 Real-time disease outbreak map
- 📡 Offline mode for rural areas
- 🌐 Multi-language support (Spanish, Swahili, Hindi)
- 🤖 Improved AI accuracy with larger datasets
- 📊 Advanced analytics dashboard with charts
- 📱 Native mobile app (React Native)
- 🔔 Push notifications for disease alerts
- 🤝 Farmer community features
- 🌱 Crop rotation recommendations
- 📡 Integration with agricultural extension services

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request with clear descriptions

---

## 📋 Project Status

🚧 **MVP - Actively being developed**

**Completed:**
- ✅ User authentication system
- ✅ Dashboard with metrics and insights
- ✅ Recent scans history
- ✅ Responsive UI design
- ✅ Backend API structure

**In Progress:**
- 🔄 AI model integration
- 🔄 Weather API integration
- 🔄 Image upload and processing
- 🔄 Treatment recommendations

**Coming Soon:**
- ⏳ Disease detection endpoint
- ⏳ Advanced analytics
- ⏳ Mobile app
- ⏳ Cloud deployment

---

## 💡 Vision

GreenCore aims to redefine agriculture by combining AI, real-time data, and intuitive design to empower farmers with tools that are:

- **Affordable** - Low-cost solutions for resource-limited farmers
- **Accessible** - Simple interfaces requiring minimal training
- **Intelligent** - AI-powered insights and recommendations
- **Scalable** - Ready for global deployment and impact

---

## 🏆 Why GreenCore Matters

✅ **Solves Real Agricultural Problems** - Farmers face significant crop losses due to late disease detection

✅ **Designed for Low-Resource Farmers** - Works on basic smartphones with minimal connectivity

✅ **Combines AI + Real-World Data** - Uses actual farm conditions and weather for recommendations

✅ **Scalable to Global Use** - Architecture supports millions of users and regional adaptations

---

## 📞 Support & Contact

For questions, issues, or feature requests, please:
- Open an issue on GitHub
- Contact the development team
- Visit project documentation

---

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

## 🙏 Acknowledgments

- Farm community for insights and feedback
- Open-source communities for libraries and tools
- Agricultural experts for domain knowledge
- All contributors to GreenCore

---

**🌍 Together, we're growing stronger farms, healthier crops, and a better future.**
