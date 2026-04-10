import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'

const ScanResultPage = () => {
  const { scanId } = useParams()
  const api = useApi()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [scan, setScan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchScan = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/api/scans/${scanId}`)
        setScan(res.data?.scan || null)
        setError(null)
      } catch (err) {
        console.error('Error fetching scan:', err)
        setError('Unable to load scan result')
      } finally {
        setLoading(false)
      }
    }

    if (scanId) {
      fetchScan()
    }
  }, [api, scanId])

  const cropType = scan?.crop_type || 'Crop'
  const disease = scan?.disease || 'Healthy Plant'
  const confidence = scan?.confidence
  const severity = scan?.severity || 'Unknown'

  return (
    <div className="bg-white w-full min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 md:px-8 py-6 md:py-8 border-b border-[#1a3a2a]/5">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2 hover:text-[#1a3a2a]"
          >
            <FiArrowLeft size={14} />
            Back to scans
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a3a2a] mb-1">Scan Result</h1>
          <p className="text-gray-600 text-sm md:text-base">
            {cropType} crop health analysis
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
      <div className="px-6 md:px-8 py-6 md:py-8 space-y-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Hero Image / Status */}
        <div className="bg-white border border-[#1a3a2a]/8 rounded-2xl shadow-sm overflow-hidden">
          <div className="h-52 md:h-64 bg-gradient-to-br from-[#1a3a2a] via-[#0f1f18] to-black flex items-center justify-center">
            <p className="text-gray-200 text-sm md:text-base font-medium">
              {cropType} leaf image preview
            </p>
          </div>
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#1a3a2a]/10">
            <div>
              <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide mb-1">Health Status</p>
              <p className="text-sm font-bold text-[#1a3a2a]">Diagnosis: {disease}</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wide">
              Scan Completed
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#1a3a2a]/8 rounded-xl p-4 shadow-sm">
            <p className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wide mb-1">Disease</p>
            <p className="text-sm font-bold text-[#1a3a2a] mb-1">{disease}</p>
            <p className="text-xs text-gray-500">Primary condition detected by the AI model.</p>
          </div>
          <div className="bg-white border border-[#1a3a2a]/8 rounded-xl p-4 shadow-sm">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Crop Type</p>
            <p className="text-sm font-bold text-[#1a3a2a] mb-1">{cropType}</p>
            <p className="text-xs text-gray-500">Based on the crop selected during scanning.</p>
          </div>
          <div className="bg-white border border-[#1a3a2a]/8 rounded-xl p-4 shadow-sm">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1">AI Confidence</p>
            <p className="text-sm font-bold text-emerald-600 mb-1">{confidence ? `${confidence}% Match` : '—'}</p>
            <p className="text-xs text-gray-500">Higher values indicate stronger model confidence.</p>
          </div>
        </div>

        {/* Treatment & Prevention */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#1a3a2a]/8 rounded-2xl p-5 shadow-sm">
            <p className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wide mb-2">Treatment Plan</p>
            <p className="text-sm font-bold text-[#1a3a2a] mb-3">Recommended Actions</p>
            <ul className="space-y-2 text-xs text-gray-600 list-disc pl-4">
              {scan?.solution ? (
                <li>{scan.solution}</li>
              ) : (
                <>
                  <li>Monitor affected leaves over the next 3–5 days.</li>
                  <li>Remove and safely dispose of heavily infected leaves.</li>
                  <li>Consult your local agronomist before applying chemicals.</li>
                </>
              )}
            </ul>
          </div>

          <div className="bg-white border border-[#1a3a2a]/8 rounded-2xl p-5 shadow-sm">
            <p className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wide mb-2">Prevention Tips</p>
            <p className="text-sm font-bold text-[#1a3a2a] mb-3">Protect Future Harvests</p>
            <ul className="space-y-2 text-xs text-gray-600 list-disc pl-4">
              <li>Ensure good air circulation between plants to reduce humidity.</li>
              <li>Avoid overhead watering late in the day.</li>
              <li>Rotate crops and use resistant varieties where possible.</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <button
            type="button"
            className="px-5 py-2.5 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-gray-600 hover:bg-slate-50 transition-colors"
          >
            Save Result to History
          </button>
          <button
            type="button"
            onClick={() => navigate('/scan')}
            className="px-5 py-2.5 rounded-lg bg-[#22c55e] text-white text-sm font-semibold hover:bg-[#16a34a] transition-colors"
          >
            New Scan
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScanResultPage