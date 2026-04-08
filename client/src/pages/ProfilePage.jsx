import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useApi } from '../hooks/useApi'
import { useNavigate } from 'react-router-dom'
import { FiEdit2, FiMapPin, FiCalendar, FiTrendingUp } from 'react-icons/fi'

const ProfilePage = () => {
  const { user } = useAuth()
  const api = useApi()
  const navigate = useNavigate()
  const [profileData, setProfileData] = useState(null)
  const [recentScans, setRecentScans] = useState([])
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    farm_size: '',
    cropType: ''
  })

  useEffect(() => {
    // Set initial form data from auth context user immediately
    if (user) {
      setProfileData(user)
      setFormData({
        name: user.name || '',
        location: user.location || '',
        farm_size: user.farm_size || '',
        cropType: user.crop_type || ''
      })
    }
  }, [user])

  useEffect(() => {
    const fetchRecentScans = async () => {
      try {
        const scansResponse = await api.get('/api/scans')
        setRecentScans(scansResponse.data?.scans || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching scans:', err)
      }
    }

    if (user) {
      fetchRecentScans()
    }
  }, [user, api])

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      // Call backend to update user
      const response = await api.put('/api/auth/profile', {
        name: formData.name,
        location: formData.location,
        farm_size: formData.farm_size,
        crop_type: formData.cropType
      })
      
      setProfileData(response.data.user)
      setIsEditing(false)
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('Failed to save profile changes')
    }
  }

  const cropTypes = profileData?.cropType ? profileData.cropType.split(',').map(c => c.trim()) : []
  const totalScans = recentScans.length
  const healthyScans = recentScans.filter(s => !s.disease_detected).length
  const diseaseScans = totalScans - healthyScans

  return (
    <div className="bg-white w-full min-h-screen">
      {/* Header Section */}
      <div className="px-6 md:px-8 py-6 md:py-8 border-b border-[#1a3a2a]/5">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1a3a2a]">Farmer Profile</h1>
      </div>

      <div className="px-6 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#1a3a2a]/8 rounded-xl p-6 shadow-sm">
              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-white">
                    {profileData?.name?.charAt(0) || '👨'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-[#1a3a2a] text-center">{profileData?.name || 'Farmer'}</h2>
                <p className="text-[#22c55e] font-semibold text-sm mt-1">MASTER CULTIVATOR</p>
              </div>

              {/* Profile Location */}
              {profileData?.location && (
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-6 justify-center">
                  <FiMapPin size={16} className="text-[#22c55e]" />
                  <span>{profileData.location}</span>
                </div>
              )}

              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-lg py-2.5 font-semibold text-sm transition-colors flex items-center justify-center gap-2 mb-6"
              >
                <FiEdit2 size={16} />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>

              {/* Farm Stats */}
              <div className="space-y-4">
                <div className="bg-[#1a3a2a]/3 rounded-lg p-4">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Farm Size</p>
                  <p className="text-lg font-bold text-[#1a3a2a]">{profileData?.farm_size || 'Not specified'}</p>
                </div>
                <div className="bg-[#1a3a2a]/3 rounded-lg p-4">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Main Crops</p>
                  <p className="text-sm font-semibold text-[#1a3a2a]">
                    {cropTypes.length > 0 ? cropTypes.join(', ') : 'Not specified'}
                  </p>
                </div>
                {profileData?.created_at && (
                  <div className="bg-[#1a3a2a]/3 rounded-lg p-4 flex items-center gap-3">
                    <FiCalendar size={16} className="text-[#22c55e]" />
                    <div>
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Joined</p>
                      <p className="text-sm font-semibold text-[#1a3a2a]">
                        {new Date(profileData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Farm Location Map Placeholder */}
            <div className="bg-white border border-[#1a3a2a]/8 rounded-xl p-6 shadow-sm mt-6">
              <h3 className="text-lg font-bold text-[#1a3a2a] mb-4">Farm Location</h3>
              <div className="w-full h-48 bg-gradient-to-br from-[#bbf7d0]/30 to-[#dcfce7]/30 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FiMapPin size={32} className="text-[#22c55e] mx-auto mb-2" />
                  <p className="text-sm text-gray-500">{profileData?.location || 'Location not set'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Stats & Scans */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Form */}
            {isEditing && (
              <form onSubmit={handleSaveProfile} className="bg-white border border-[#1a3a2a]/8 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#1a3a2a] mb-4">Edit Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleEditChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleEditChange}
                      placeholder="City, Country"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Farm Size</label>
                    <input
                      type="text"
                      name="farm_size"
                      value={formData.farm_size}
                      onChange={handleEditChange}
                      placeholder="e.g. 45 Hectares"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-lg py-2.5 font-semibold text-sm transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-[#1a3a2a]/8 rounded-xl p-6 shadow-sm">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">Total Scans</p>
                <p className="text-4xl font-bold text-[#1a3a2a]">{totalScans}</p>
                <p className="text-xs text-gray-400 mt-2">crop analyses</p>
              </div>
              <div className="bg-white border border-[#1a3a2a]/8 rounded-xl p-6 shadow-sm">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">Diseases Detected</p>
                <p className="text-4xl font-bold text-red-500">{diseaseScans}</p>
                <p className="text-xs text-gray-400 mt-2">cases found</p>
              </div>
              <div className="bg-white border border-[#1a3a2a]/8 rounded-xl p-6 shadow-sm">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">Healthy Crops</p>
                <p className="text-4xl font-bold text-[#22c55e]">{healthyScans}</p>
                <p className="text-xs text-gray-400 mt-2">scans clean</p>
              </div>
            </div>

            {/* Recent Scans */}
            <div className="bg-white border border-[#1a3a2a]/8 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#1a3a2a]">Recent Plant Scans</h3>
                {recentScans.length > 5 && (
                  <button onClick={() => navigate('/history')} className="text-[#22c55e] text-sm font-semibold hover:text-[#16a34a] transition-colors">
                    View all →
                  </button>
                )}
              </div>

              {recentScans.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#1a3a2a]/10">
                        <th className="text-left py-3 px-4 text-gray-700 font-semibold text-xs uppercase tracking-wide">Crop Type</th>
                        <th className="text-left py-3 px-4 text-gray-700 font-semibold text-xs uppercase tracking-wide">Status</th>
                        <th className="text-left py-3 px-4 text-gray-700 font-semibold text-xs uppercase tracking-wide">Diagnosis</th>
                        <th className="text-left py-3 px-4 text-gray-700 font-semibold text-xs uppercase tracking-wide">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentScans.slice(0, 5).map((scan, idx) => (
                        <tr key={idx} className="border-b border-[#1a3a2a]/5 hover:bg-[#1a3a2a]/3 transition-colors">
                          <td className="py-4 px-4 font-semibold text-[#1a3a2a]">{scan.crop_type || 'Unknown'}</td>
                          <td className="py-4 px-4">
                            <span className={`text-xs font-bold px-2.5 py-1.5 rounded-full ${
                              scan.disease_detected ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {scan.disease_detected ? 'ISSUE DETECTED' : 'HEALTHY'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{scan.disease || 'Healthy'}</td>
                          <td className="py-4 px-4 text-gray-500 text-xs">
                            {new Date(scan.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiTrendingUp size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No scans yet. Start by scanning a crop!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage