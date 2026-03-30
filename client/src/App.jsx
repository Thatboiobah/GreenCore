import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ScanPage from './pages/ScanPage'
import ScanResultPage from './pages/ScanResultPage'
import ScanHistoryPage from './pages/ScanHistoryPage'
import ProfilePage from './pages/ProfilePage'
import LandingPage from './pages/LandingPage'

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  return token ? children : <Navigate to="/login" />
}

// Temporary Menu Page
const MenuPage = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">GreenCore - Test Pages</h1>
        
        <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Pages:</h2>
          
          <a href="/login" className="block w-full bg-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#16a34a]">
            📝 Login Page
          </a>
          
          <a href="/register" className="block w-full bg-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#16a34a]">
            ✍️ Register Page
          </a>
          
          <div className="bg-gray-100 p-4 rounded-lg mt-8">
            <p className="text-gray-700 font-semibold mb-4">Protected Pages (Login First):</p>
            <div className="space-y-2">
              <p className="text-gray-600">🏠 /dashboard - Dashboard</p>
              <p className="text-gray-600">📷 /scan - Scan Page</p>
              <p className="text-gray-600">📊 /history - Scan History</p>
              <p className="text-gray-600">👤 /profile - Profile Page</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/scan" 
        element={
          <ProtectedRoute>
            <ScanPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/scan-result/:scanId" 
        element={
          <ProtectedRoute>
            <ScanResultPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/history" 
        element={
          <ProtectedRoute>
            <ScanHistoryPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
