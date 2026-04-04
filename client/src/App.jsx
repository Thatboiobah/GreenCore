import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import AppLayout from './components/AppLayout'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ScanPage from './pages/ScanPage'
import ScanResultPage from './pages/ScanResultPage'
import ScanHistoryPage from './pages/ScanHistoryPage'
import ProfilePage from './pages/ProfilePage'

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  )
  return token ? children : <Navigate to="/login" />
}

function AppContent() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected app pages — all use AppLayout with sidebar */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><DashboardPage /></AppLayout>
        </ProtectedRoute>
      }/>
      <Route path="/scan" element={
        <ProtectedRoute>
          <AppLayout><ScanPage /></AppLayout>
        </ProtectedRoute>
      }/>
      <Route path="/scan-result/:scanId" element={
        <ProtectedRoute>
          <AppLayout><ScanResultPage /></AppLayout>
        </ProtectedRoute>
      }/>
      <Route path="/history" element={
        <ProtectedRoute>
          <AppLayout><ScanHistoryPage /></AppLayout>
        </ProtectedRoute>
      }/>
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout><ProfilePage /></AppLayout>
        </ProtectedRoute>
      }/>
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
