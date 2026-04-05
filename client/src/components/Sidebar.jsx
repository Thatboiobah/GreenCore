import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { 
  FiMenu, 
  FiX, 
  FiHome, 
  FiCamera, 
  FiClock, 
  FiUser, 
  FiLogOut 
} from 'react-icons/fi'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome },
  { path: '/scan', label: 'Scan Crop', icon: FiCamera },
  { path: '/history', label: 'Scan History', icon: FiClock },
  { path: '/profile', label: 'Profile', icon: FiUser },
]

const Sidebar = () => {
  const { pathname } = useLocation()
  const { user, setToken } = useAuth()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Handle logout: clear token from auth context and localStorage
  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <>
      {/* Desktop & Mobile Sidebar with Toggle */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen z-40
        bg-gradient-to-b from-[#1a3a2a] to-[#0f1f18]
        border-r border-[#e4ff00]/10
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'w-64' : 'w-24'}
        flex flex-col
      `}>
        {/* Header with Hamburger Toggle */}
        <div className="flex items-center justify-between gap-3 border-b border-[#e4ff00]/10 px-4 py-4">
          {/* Logo and Name - Hidden when sidebar is collapsed */}
          {isSidebarOpen ? (
            <Link to="/dashboard" className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity">
              <img 
                src="/assets/greencore-logo-full.png" 
                alt="GreenCore" 
                className="w-8 h-8 object-contain"
              />
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-white truncate">GreenCore</h1>
                <p className="text-[10px] text-[#e4ff00]/70 truncate">Farm AI</p>
              </div>
            </Link>
          ) : (
            <div className="w-8 h-8 bg-[#e4ff00]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <img 
                src="/assets/greencore-logo-full.png" 
                alt="GreenCore" 
                className="w-5 h-5 object-contain"
              />
            </div>
          )}

          {/* Hamburger / Close Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex-shrink-0 p-1.5 hover:bg-[#e4ff00]/10 rounded-lg transition-colors text-[#e4ff00]"
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isSidebarOpen ? (
              <FiX size={20} />
            ) : (
              <FiMenu size={20} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon
            const active = pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${active 
                    ? 'bg-[#e4ff00]/20 text-[#e4ff00] border-l-2 border-[#e4ff00]' 
                    : 'text-gray-300 hover:bg-[#e4ff00]/10 hover:text-[#e4ff00]'
                  }
                `}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Info + Logout */}
        <div className="p-2 border-t border-[#e4ff00]/10 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            {/* Profile Avatar with First Letter */}
            <div className="w-10 h-10 bg-[#e4ff00] text-[#1a3a2a] rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
              {(user?.name || 'F')?.charAt(0).toUpperCase()}
            </div>
            
            {/* User Info - Hidden when collapsed */}
            {isSidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Farmer'}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email || 'user@farm.local'}</p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-sm font-medium transition-all duration-200
              text-red-400 hover:bg-red-500/20 hover:text-red-300
            `}
            title={!isSidebarOpen ? 'Logout' : undefined}
          >
            <FiLogOut size={20} className="flex-shrink-0" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay - Click to close sidebar */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  )
}

export default Sidebar