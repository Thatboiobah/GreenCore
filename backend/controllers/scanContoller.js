import { createScan, getUserScans, getScanById, deleteScan } from '../models/Scan.js'

// Mock AI analysis (replace with real model later)
const mockAnalyze = async (cropType) => {
  const mockResults = {
    tomato: {
      disease: "Early Blight",
      confidence: 92,
      severity: "High",
      solution: "Apply fungicide every 7 days. Remove infected leaves."
    },
    maize: {
      disease: "Corn Leaf Blight",
      confidence: 87,
      severity: "Moderate",
      solution: "Improve air circulation. Use resistant varieties."
    },
    rice: {
      disease: "Brown Spot",
      confidence: 78,
      severity: "Low",
      solution: "Use treated seeds. Avoid excessive nitrogen."
    }
  }
  return mockResults[cropType.toLowerCase()] || mockResults.tomato
}

// Create scan with mock AI
export const analyze = async (req, res) => {
  try {
    const { cropType, imageBase64 } = req.body
    const userId = req.user.id

    if (!cropType) {
      return res.status(400).json({ error: 'cropType required' })
    }

    // Call mock AI
    const aiResult = await mockAnalyze(cropType)

    const scan = await createScan({
      user_id: userId,
      crop_type: cropType,
      disease: aiResult.disease,
      confidence: aiResult.confidence,
      severity: aiResult.severity,
      solution: aiResult.solution
    })

    res.status(201).json({ 
      message: 'Scan analyzed', 
      scan 
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get user scans
export const getScans = async (req, res) => {
  try {
    const userId = req.user.id
    const scans = await getUserScans(userId)
    res.json({ scans })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get single scan
export const getScan = async (req, res) => {
  try {
    const scan = await getScanById(req.params.id)
    if (scan.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' })
    }
    res.json({ scan })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Delete scan
export const removeScan = async (req, res) => {
  try {
    const scan = await getScanById(req.params.id)
    if (scan.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' })
    }
    await deleteScan(req.params.id)
    res.json({ message: 'Scan deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}