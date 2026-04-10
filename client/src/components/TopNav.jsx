import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const TopNav = () => {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/greencore-logo-full.png" alt="GreenCore" className="h-14 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">How it works</a>
          </nav>

          <div className="flex items-center gap-3">
            {token ? (
              <>
                {/* Profile (clear/neutral button) */}
                <Link
                  to="/profile"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-colors"
                >
                  Profile
                </Link>
                {/* Logout (solid red button) */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Login (solid yellow button) */}
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-primary-dark bg-primary shadow-sm hover:bg-[#f3ff4d] transition-colors"
                >
                  Login
                </Link>
                {/* Sign up (outline yellow button) */}
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold border border-primary text-primary-dark hover:bg-primary/10 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopNav
