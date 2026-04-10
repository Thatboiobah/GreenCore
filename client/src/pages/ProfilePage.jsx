import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useApi } from '../hooks/useApi'

const ProfilePage = () => {
  const { user, token, login } = useAuth()
  const api = useApi()

  const [profile, setProfile] = useState(user || null)
  const [metrics, setMetrics] = useState(null)
  const [recentScans, setRecentScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  const [form, setForm] = useState({
    name: user?.name || '',
    location: user?.location || '',
    farm_size: user?.farm_size || '',
    crop_type: user?.crop_type || '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Refresh profile with backend data (includes created_at, crop_type)
        const [meRes, metricsRes, scansRes] = await Promise.all([
          api.get('/api/auth/me').catch(() => null),
          api.get('/api/dashboard/metrics').catch(() => null),
          api.get('/api/scans').catch(() => null)
        ])

        if (meRes?.data?.user) {
          setProfile(meRes.data.user)
          setForm({
            name: meRes.data.user.name || '',
            location: meRes.data.user.location || '',
            farm_size: meRes.data.user.farm_size || '',
            crop_type: meRes.data.user.crop_type || '',
          })
          // Keep auth context in sync
          if (token) {
            login(
              {
                id: meRes.data.user.id,
                name: meRes.data.user.name,
                email: meRes.data.user.email,
                location: meRes.data.user.location,
                farm_size: meRes.data.user.farm_size,
                crop_type: meRes.data.user.crop_type,
              },
              token
            )
          }
        }

        if (metricsRes?.data) {
          setMetrics(metricsRes.data)
        }

        if (scansRes?.data?.scans) {
          setRecentScans(scansRes.data.scans.slice(0, 5))
        }

        setError(null)
      } catch (err) {
        console.error('Error loading profile page:', err)
        setError('Failed to load profile. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [api, login, token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)

      const payload = {
        name: form.name || undefined,
        location: form.location || undefined,
        farm_size: form.farm_size || undefined,
        crop_type: form.crop_type || undefined,
      }

      const res = await api.put('/api/auth/profile', payload)

      if (res.data?.user) {
        setProfile(res.data.user)
        // Sync auth context with updated user
        if (token) {
          login(res.data.user, token)
        }
        setSuccessMessage('Profile updated successfully')
        setIsEditing(false)
      }
    } catch (err) {
      console.error('Profile update error:', err)
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const displayName = profile?.name || user?.name || 'Farmer'
  const displayEmail = profile?.email || user?.email || 'user@farm.local'
  const displayLocation = profile?.location || 'Location not set'
  const displayFarmSize = profile?.farm_size ? `${profile.farm_size}` : 'Not specified'
  const displayCrops = profile?.crop_type || 'Add your main crops'

  const totalScans = metrics?.total_scans || recentScans.length || 0
  const diseasesDetected = metrics?.diseases_detected || 0
  const healthyCrops = metrics?.healthy_crops || 0

  return (
    <div className="bg-white w-full min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 md:px-8 py-6 md:py-8 border-b border-[#1a3a2a]/5">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a3a2a] mb-1">Farmer Profile</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Manage your farm details and review your recent plant scans.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end text-right">
            <p className="text-sm font-semibold text-[#1a3a2a]">{displayName}</p>
            <p className="text-xs text-gray-500 max-w-[180px] truncate">{displayEmail}</p>
          </div>
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#e4ff00] text-[#1a3a2a] shadow-md">
            <span className="text-sm font-bold">
              {(displayName || displayEmail).charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6 md:py-8 h-full">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
            {successMessage}
          </div>
        )}

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Farmer card + farm details */}
          <div className="space-y-4">
            <div className="bg-white border border-[#1a3a2a]/8 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-24 h-24 rounded-full bg-[#e4ff00]/40 flex items-center justify-center mb-3 border-4 border-white shadow-md">
                  <span className="text-3xl font-bold text-[#1a3a2a]">
                    {(displayName || displayEmail).charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-lg font-bold text-[#1a3a2a]">{displayName}</p>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mt-1">
                  Master Cultivator
                </p>
                <p className="text-[11px] text-gray-500 mt-2 max-w-[220px]">
                  {displayLocation}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditing((v) => !v)}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#22c55e] text-white text-sm font-semibold hover:bg-[#16a34a] transition-colors"
              >
                {isEditing ? 'Cancel editing' : 'Edit Profile'}
              </button>

              {/* Farm quick stats */}
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between text-gray-700">
                  <span className="text-xs text-gray-500">Farm Size</span>
                  <span className="font-semibold">{displayFarmSize}</span>
                </div>
                <div className="flex items-center justify-between text-gray-700">
                  <span className="text-xs text-gray-500">Main Crops</span>
                  <span className="font-semibold text-right max-w-[160px] truncate">{displayCrops}</span>
                </div>
                <div className="flex items-center justify-between text-gray-700">
                  <span className="text-xs text-gray-500">Joined</span>
                  <span className="font-semibold">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit form card */}
            {isEditing && (
              <div className="bg-white border border-[#1a3a2a]/8 rounded-2xl p-6 shadow-sm">
                <p className="text-sm font-bold text-[#1a3a2a] mb-4">Edit farm details</p>
                <form onSubmit={handleSave} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e4ff00]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e4ff00]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Farm Size (hectares)</label>
                      <input
                        type="text"
                        name="farm_size"
                        value={form.farm_size}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e4ff00]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Main Crops</label>
                      <input
                        type="text"
                        name="crop_type"
                        value={form.crop_type}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e4ff00]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full mt-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#e4ff00] text-[#1a3a2a] text-sm font-semibold hover:bg-[#d4ef00] transition-colors disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right: Metrics and recent scans */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-[#1a3a2a]/8 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total Scans</p>
                <p className="text-2xl md:text-3xl font-bold text-[#1a3a2a] mb-1">{totalScans}</p>
                <p className="text-[11px] text-emerald-600 font-semibold">+ Keep scanning to grow insights</p>
              </div>
              <div className="bg-white border border-[#1a3a2a]/8 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Diseases</p>
                <p className="text-2xl md:text-3xl font-bold text-red-500 mb-1">{diseasesDetected}</p>
                <p className="text-[11px] text-red-500/80 font-semibold">Detected across all your scans</p>
              </div>
              <div className="bg-white border border-[#1a3a2a]/8 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Healthy Crops</p>
                <p className="text-2xl md:text-3xl font-bold text-emerald-600 mb-1">{healthyCrops}%</p>
                <p className="text-[11px] text-emerald-600 font-semibold">Overall health score of your farm</p>
              </div>
            </div>

            {/* Recent Plant Scans */}
            <div className="bg-white border border-[#1a3a2a]/8 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-[#1a3a2a]">Recent Plant Scans</p>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#1a3a2a] hover:text-[#0f1f18]"
                  onClick={() => window.location.assign('/history')}
                >
                  View all →
                </button>
              </div>

              {loading ? (
                <p className="text-xs text-gray-500 py-6">Loading your scans...</p>
              ) : recentScans.length === 0 ? (
                <p className="text-xs text-gray-500 py-6">No scans yet. Start by scanning your first crop.</p>
              ) : (
                <div className="space-y-3">
                  {recentScans.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-[#e4ff00]/60 hover:shadow-sm transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-lime-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1a3a2a] truncate">
                          {scan.crop_type || 'Crop'}{' '}
                          {scan.disease ? `(${scan.disease})` : '(Healthy)'}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                          Scan #{scan.id?.slice?.(0, 8) || '—'} •{' '}
                          {scan.scan_date ? new Date(scan.scan_date).toLocaleDateString() : 'Date unknown'}
                        </p>
                        {scan.solution && (
                          <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-700">
                            Treatment: {scan.solution}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            scan.severity === 'High'
                              ? 'bg-red-100 text-red-700'
                              : scan.severity === 'Moderate'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {scan.severity || 'Healthy'}
                        </span>
                        {typeof scan.confidence === 'number' && (
                          <span className="text-[10px] text-gray-500">
                            {scan.confidence}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
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