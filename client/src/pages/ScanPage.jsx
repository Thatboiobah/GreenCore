import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiCamera, FiUpload, FiSun, FiTarget, FiEye } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'

const ScanPage = () => {
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  const [previewLabel, setPreviewLabel] = useState('Position a clear crop leaf within the frame')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreviewLabel(`Uploading and analyzing: ${file.name}`)
      setError(null)
      analyzeImage(file)
    }
  }

  const analyzeImage = async (file) => {
    try {
      setIsAnalyzing(true)
      const formData = new FormData()
      formData.append('image', file)

      const baseUrl = import.meta.env.VITE_AI_API_URL || 'http://localhost:5000'
      const response = await fetch(`${baseUrl}/api/analyze`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to analyze image. Please try again.')
      }

      const data = await response.json()

      const disease = data.disease || {}
      const pseudoScan = {
        id: 'ai',
        crop_type: data.best_match || data.scientific_name || 'Unknown crop',
        disease: disease.label || disease.disease_name || 'Unknown',
        confidence: typeof disease.confidence === 'number' ? disease.confidence : null,
        confidence_label: typeof disease.confidence === 'string' ? disease.confidence : null,
        severity: disease.is_healthy ? 'Healthy' : 'Affected',
        solution: disease.cure,
        description: disease.description,
        prevention: disease.prevention
      }

      navigate('/scan-result/ai', { state: { scan: pseudoScan, fromAi: true } })
    } catch (err) {
      console.error('AI analyze error:', err)
      setError(err.message || 'Analysis failed. Please try again.')
      setPreviewLabel('Analysis failed. Please try a clearer, well-lit image.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="bg-white w-full min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 md:px-8 py-6 md:py-8 border-b border-[#1a3a2a]/5">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a3a2a] mb-1">Crop Scan</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Identify diseases and pests instantly using our advanced AI model.
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

      {/* Main Content - Dashboard-style layout */}
      <div className="px-6 md:px-8 py-6 md:py-8 h-full">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scan Preview & Controls */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gradient-to-br from-[#1a3a2a] via-[#0f1f18] to-black rounded-2xl p-1 shadow-xl border border-[#e4ff00]/30">
              <div className="relative bg-[#020617] rounded-2xl overflow-hidden min-h-[260px] md:min-h-[340px] flex items-center justify-center">
                <div className="absolute inset-6 rounded-2xl border-2 border-[#22c55e]/40" />
                <div className="absolute inset-x-16 top-10 h-1 rounded-full bg-[#22c55e]/20 overflow-hidden">
                  <div className="h-full w-1/2 bg-[#22c55e] animate-pulse" />
                </div>
                <div className="relative text-center px-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#22c55e]/20 mb-4">
                    <FiTarget className="text-[#22c55e]" size={22} />
                  </div>
                  <p className="text-white font-semibold text-lg mb-1">Analyzing crop image...</p>
                  <p className="text-gray-300 text-xs md:text-sm max-w-md mx-auto">
                    AI model detecting disease markers and health patterns.
                  </p>
                  <p className="text-gray-400 text-xs mt-4">{previewLabel}</p>
                  {isAnalyzing && (
                    <p className="text-[10px] text-emerald-400 mt-2">AI model is analyzing your image...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Camera Controls */}
            <div className="bg-white border border-[#1a3a2a]/8 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#1a3a2a] mb-1">Camera Preview</p>
                <p className="text-xs text-gray-500">
                  Position the affected leaf clearly within the frame markers.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#22c55e] text-white text-sm font-semibold hover:bg-[#16a34a] transition-colors shadow-md"
                >
                  <FiCamera size={16} />
                  Take Photo
                </button>
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[#1a3a2a]/10 bg-slate-50 text-sm font-semibold text-[#1a3a2a] hover:bg-slate-100 transition-colors disabled:opacity-60"
                  disabled={isAnalyzing}
                >
                  <FiUpload size={16} />
                  Upload Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Scanning Tips */}
          <div className="space-y-4">
            <div className="bg-white border border-[#1a3a2a]/8 rounded-2xl p-5 shadow-sm flex gap-3">
              <div className="mt-1 w-9 h-9 rounded-full bg-[#e4ff00]/20 flex items-center justify-center flex-shrink-0">
                <FiSun className="text-[#e4ff00]" size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1a3a2a]">Good Lighting</p>
                <p className="text-xs text-gray-500 mt-1">
                  Ensure the plant is well-lit in natural light for accurate detection.
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#1a3a2a]/8 rounded-2xl p-5 shadow-sm flex gap-3">
              <div className="mt-1 w-9 h-9 rounded-full bg-[#22c55e]/10 flex items-center justify-center flex-shrink-0">
                <FiTarget className="text-[#22c55e]" size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1a3a2a]">Steady Focus</p>
                <p className="text-xs text-gray-500 mt-1">Hold your device steady while the AI processes the leaf.</p>
              </div>
            </div>

            <div className="bg-white border border-[#1a3a2a]/8 rounded-2xl p-5 shadow-sm flex gap-3">
              <div className="mt-1 w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <FiEye className="text-slate-700" size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1a3a2a]">Clear View</p>
                <p className="text-xs text-gray-500 mt-1">
                  Avoid blurry shots or multiple overlapping leaves in a single scan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScanPage