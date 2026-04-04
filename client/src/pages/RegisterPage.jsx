import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ErrorAlert from '../components/ErrorAlert'
import SuccessAlert from '../components/SuccessAlert'
import api from '../services/api'

const CROP_TYPES = [
  'Tomato', 'Maize', 'Rice', 'Cassava', 'Yam',
  'Wheat', 'Sorghum', 'Soybean', 'Groundnut', 'Other'
]

const RegisterPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', location: '',
    farmSize: '', cropType: '', password: '', confirmPassword: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match')
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        location: form.location,
        farmSize: form.farmSize,
        cropType: form.cropType
      })
      setSuccess('Registration successful! Redirecting to dashboard...')
      login(res.data.user, res.data.token)
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} onClose={() => setSuccess('')} />
      
      <div className="min-h-screen bg-[#1a3a2a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-between">
          <img src="/assets/greencore-logo-full.png" alt="GreenCore" className="h-20 w-auto" />
          <div className="flex gap-3 text-sm text-gray-300">
          <a href="#" className="hover:text-gray-200">Log In</a>
            <a href="#" className="hover:text-gray-200">Support</a>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Create Your Account</h1>
          <p className="text-gray-500 text-sm mb-8">Join our community of smart farmers today.</p>

          <form onSubmit={handleSubmit}>
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name</label>
                <input
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="farmer@agromind.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Location</label>
                <input
                  name="location"
                  placeholder="City, Country"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Farm Size</label>
                <input
                  name="farmSize"
                  placeholder="e.g. 50 acres"
                  value={form.farmSize}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Row 3 — crop type */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Primary Crop Type</label>
              <select
                name="cropType"
                value={form.cropType}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-500"
              >
                <option value="">Select crop type</option>
                {CROP_TYPES.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>

            {/* Row 4 — passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl py-3 text-sm font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#22c55e] font-semibold hover:underline">
              Log in here
            </Link>
          </p>
        </div>

        {/* Bottom features strip */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Smart Insights', desc: 'Real-time crop monitoring' },
            { label: 'Weather Alerts', desc: 'Stay ahead of weather risks' },
            { label: 'Community', desc: 'Connect with farmers' }
          ].map(item => (
            <div key={item.label} className="bg-[#0f1f18] border border-[#e4ff00]/20 rounded-xl p-4 text-center">
              <div className="w-8 h-8 bg-[#e4ff00]/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <div className="w-3 h-3 bg-[#e4ff00] rounded-full" />
              </div>
              <p className="text-xs font-semibold text-[#e4ff00]">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}

export default RegisterPage