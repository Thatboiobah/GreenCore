import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'

const ScanHistoryPage = () => {
  const api = useApi()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchScans = async () => {
      try {
        setLoading(true)
        const res = await api.get('/api/scans')
        setScans(res.data?.scans || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching scans:', err)
        setError('Failed to load scan history')
      } finally {
        setLoading(false)
      }
    }

    fetchScans()
  }, [api])

  const filteredScans = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return scans
    return scans.filter((scan) => {
      const crop = scan.crop_type?.toLowerCase() || ''
      const disease = scan.disease?.toLowerCase() || ''
      return crop.includes(term) || disease.includes(term)
    })
  }, [search, scans])

  return (
    <div className="bg-white w-full min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 md:px-8 py-6 md:py-8 border-b border-[#1a3a2a]/5">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a3a2a] mb-1">Scan History</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Review previous crop scans, diagnoses and confidence scores.
          </p>
        </div>
        <Link
          to="/profile"
          className="inline-flex items-center justify-center w-9 h-9 mr-1 md:mr-3 rounded-lg bg-[#e4ff00] text-[#1a3a2a] shadow-md hover:brightness-105 transition-colors"
          aria-label="Open profile"
        >
          <span className="text-sm font-bold">
            {(user?.name || user?.email || 'F')?.charAt(0).toUpperCase()}
          </span>
        </Link>
      </div>

      {/* Content */}
      <div className="px-6 md:px-8 py-6 md:py-8">
        {/* Search & Filters */}
        <div className="bg-white border border-[#1a3a2a]/8 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-6">
          <div className="relative w-full md:max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by crop or disease..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e4ff00] focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-2 rounded-full bg-[#1a3a2a]/5 text-[#1a3a2a] font-semibold border border-[#1a3a2a]/10">
              All Crops
            </span>
            <span className="px-3 py-2 rounded-full bg-white text-gray-500 font-medium border border-slate-200">
              All Diseases
            </span>
            <span className="px-3 py-2 rounded-full bg-white text-gray-500 font-medium border border-slate-200">
              Last 30 Days
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Scan List */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-gray-500">Loading scans...</p>
          ) : filteredScans.length === 0 ? (
            <p className="text-sm text-gray-500">No scans found. Start by scanning a crop.</p>
          ) : (
            filteredScans.map((scan) => (
              <div
                key={scan.id}
                className="bg-white border border-[#1a3a2a]/8 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col md:flex-row gap-4 md:items-center"
              >
                {/* Thumbnail placeholder */}
                <div className="w-full md:w-40 h-28 rounded-xl bg-gradient-to-br from-[#1a3a2a] via-[#0f1f18] to-black flex items-center justify-center text-xs text-gray-300 font-medium">
                  <span>{scan.crop_type || 'Crop'}</span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2.5 py-1 rounded-full bg-[#e4ff00]/20 text-[#1a3a2a] text-[11px] font-bold tracking-wide uppercase">
                      {scan.crop_type || 'Unknown crop'}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {scan.created_at ? new Date(scan.created_at).toLocaleString() : 'Unknown time'}
                    </span>
                  </div>
                  <p className="text-sm md:text-base font-bold text-[#1a3a2a] mb-1">
                    {scan.disease || 'Healthy Plant'}
                  </p>
                  <p className="text-xs text-gray-500 max-w-xl">
                    {scan.severity ? `Severity: ${scan.severity}. ` : ''}
                    {scan.solution || 'No additional notes recorded for this scan.'}
                  </p>
                </div>

                {/* Confidence & Action */}
                <div className="flex flex-col items-end gap-3 md:w-40">
                  <div className="text-right">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Confidence</p>
                    <p className="text-sm font-bold text-emerald-600">
                      {scan.confidence ? `${scan.confidence}%` : '—'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/scan-result/${scan.id}`)}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#22c55e] text-white text-xs font-semibold hover:bg-[#16a34a] transition-colors whitespace-nowrap"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ScanHistoryPage