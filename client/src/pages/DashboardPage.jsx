import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useApi } from '../hooks/useApi'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  FiTrendingUp, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiBarChart2,
  FiCamera
} from 'react-icons/fi'

const DashboardPage = () => {
  // Authentication and data fetching hooks
  const { token } = useAuth()
  const api = useApi()
  const navigate = useNavigate()
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null)
  const [recentScans, setRecentScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch dashboard metrics and recent scans on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Get farm metrics (total scans, diseases detected, etc.)
        const metricsResponse = await api.get('/api/dashboard/metrics')
        setDashboardData(metricsResponse.data)

        // Get recent scans for the table
        const scansResponse = await api.get('/api/dashboard/recent-scans?limit=5')
        setRecentScans(scansResponse.data)

        setError(null)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err.response?.data?.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchDashboardData()
    }
  }, [token, api])

  // Stat card component - displays a single metric
  // Props: icon, label, value, trend, color
  const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <div className="bg-white border border-[#1a3a2a]/8 rounded-xl p-6 hover:border-[#e4ff00]/30 hover:shadow-md transition-all shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend !== undefined && trend !== null && (
          <div className={`text-sm font-bold flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-4xl font-bold text-[#1a3a2a]">{value}</p>
    </div>
  )

  // Loading state - disabled for now
  // if (loading) {
  //   return (
  //     <div className="bg-white min-h-screen">
  //       <div className="flex items-center justify-center h-screen pl-20 md:pl-64">
  //         <LoadingSpinner />
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="bg-white min-h-screen pl-24 md:pl-64">
      {/* Top Header Section with Title and Action Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 md:px-8 py-6 md:py-8 border-b border-[#1a3a2a]/5">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a3a2a] mb-1">
            Farm Overview
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Here's what's happening on your farm today.
          </p>
        </div>
        <button onClick={() => navigate('/scan')} className="bg-[#e4ff00] text-[#1a3a2a] px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#d4ef00] transition-colors whitespace-nowrap flex items-center gap-2 justify-center md:justify-start">
          <FiCamera size={18} />
          + New Scan
        </button>
      </div>

      <div className="px-6 md:px-8 py-6 md:py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={FiTrendingUp}
            label="Total Scans"
            value={dashboardData?.total_scans || 0}
            trend={dashboardData?.scans_trend || 0}
            color="bg-blue-500/30"
          />
          <StatCard
            icon={FiAlertCircle}
            label="Diseases Detected"
            value={dashboardData?.diseases_detected || 0}
            trend={dashboardData?.diseases_trend}
            color="bg-red-500/30"
          />
          <StatCard
            icon={FiCheckCircle}
            label="Healthy Crops"
            value={dashboardData?.healthy_crops || 0}
            trend={dashboardData?.healthy_trend}
            color="bg-green-500/30"
          />
          <StatCard
            icon={FiBarChart2}
            label="Farm Health Score"
            value={`${dashboardData?.farm_health_score || 0}%`}
            trend={dashboardData?.health_trend}
            color="bg-yellow-500/30"
          />
        </div>

        {/* AI Insights and Recent Scans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Insights Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#1a3a2a]/8 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#1a3a2a] mb-4 flex items-center gap-2">
                <span className="text-[#e4ff00] text-xl">⚡</span>
                AI Insights
              </h3>
              <div className="space-y-3">
                {dashboardData?.insights && dashboardData.insights.length > 0 ? (
                  dashboardData.insights.map((insight, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-r from-[#e4ff00]/10 to-transparent rounded-lg border-l-3 border-[#e4ff00]">
                      <p className="text-sm font-bold text-[#1a3a2a] mb-1">{insight.title}</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{insight.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 py-8 text-center">No insights yet. Start scanning!</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Scans Table */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#1a3a2a]/8 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#1a3a2a]">Recent Scans</h3>
                <button onClick={() => navigate('/history')} className="text-[#e4ff00] text-sm font-semibold hover:text-[#d4ef00] transition-colors">View All</button>
              </div>

              {recentScans.length > 0 ? (
                <div className="overflow-x-auto -mx-6 -mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#1a3a2a]/10 bg-[#1a3a2a]/3">
                        <th className="text-left py-3 px-6 text-gray-700 font-semibold text-xs uppercase tracking-wide">Crop</th>
                        <th className="text-left py-3 px-6 text-gray-700 font-semibold text-xs uppercase tracking-wide">Diagnosis</th>
                        <th className="text-left py-3 px-6 text-gray-700 font-semibold text-xs uppercase tracking-wide">Date</th>
                        <th className="text-left py-3 px-6 text-gray-700 font-semibold text-xs uppercase tracking-wide">Confidence</th>
                        <th className="text-left py-3 px-6 text-gray-700 font-semibold text-xs uppercase tracking-wide">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentScans.map((scan, idx) => (
                        <tr key={idx} className="border-b border-[#1a3a2a]/5 hover:bg-[#1a3a2a]/3 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {scan.crop_image && (
                                <img 
                                  src={scan.crop_image} 
                                  alt={scan.crop_type}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              )}
                              <span className="text-[#1a3a2a] font-semibold text-sm">{scan.crop_type}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${scan.disease_detected ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {scan.disease_name || 'Healthy'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-600 text-sm">
                            {new Date(scan.scan_date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-[#e4ff00] font-bold text-sm">
                              {scan.confidence_score}%
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <button className="text-gray-400 hover:text-[#1a3a2a] transition-colors text-xl">
                              ⋯
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-12 text-sm">No scans yet. Start by scanning a crop!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage