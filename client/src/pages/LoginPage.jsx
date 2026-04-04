import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ErrorAlert from '../components/ErrorAlert'
import SuccessAlert from '../components/SuccessAlert'
import api from '../services/api'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await api.post('/auth/login', form)
      setSuccess('Login successful! Redirecting...')
      login(res.data.user, res.data.token)
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} onClose={() => setSuccess('')} />
      
      <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-[#166534] flex-col justify-between p-12">
        <div>
          <img src="/assets/greencore-logo-full.png" alt="GreenCore" className="h-20 w-auto" />
        </div>
        <div>
          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Detect crop diseases instantly with AI
          </h2>
          <p className="text-green-300 text-base leading-relaxed">
            Upload a photo of your crop leaf and get an instant diagnosis with treatment recommendations.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#14532d] rounded-xl p-4 flex-1">
            <p className="text-green-400 text-2xl font-bold">10k+</p>
            <p className="text-green-300 text-sm mt-1">Scans completed</p>
          </div>
          <div className="bg-[#14532d] rounded-xl p-4 flex-1">
            <p className="text-green-400 text-2xl font-bold">94%</p>
            <p className="text-green-300 text-sm mt-1">Detection accuracy</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <img src="/assets/greencore-logo-full.png" alt="GreenCore" className="h-20 w-auto" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to your GreenCore account</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email address</label>
              <input
                name="email"
                type="email"
                placeholder="farmer@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-xs text-[#22c55e] font-medium hover:underline">Forgot password?</a>
              </div>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              />
            </div>

            <div className="flex items-center gap-2 mt-1">
              <input type="checkbox" id="remember" className="accent-green-500" />
              <label htmlFor="remember" className="text-sm text-gray-500">Remember me for 30 days</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl py-3 text-sm font-semibold transition disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing in...' : 'Login to Account →'}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#22c55e] font-semibold hover:underline">
              Sign up for free
            </Link>
          </p>

          <p className="text-xs text-gray-400 text-center mt-8">
            Privacy Policy · Terms of Service · Help Center
          </p>
        </div>
      </div>
    </div>
    </>
  )
}

export default LoginPage