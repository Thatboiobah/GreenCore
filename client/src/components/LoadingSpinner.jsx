import React from 'react'

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-[#e4ff00]/20"></div>
        
        {/* Inner spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#e4ff00] border-r-[#e4ff00] animate-spin"></div>
      </div>
      <p className="text-gray-400 text-sm">Loading dashboard...</p>
    </div>
  )
}

export default LoadingSpinner
