import { createScan, getUserScans, getScanById, deleteScan } from '../models/Scan.js'

const mockAnalyze = async (cropType) => {
  const mockResults = {
    tomato: {
      disease: 'Early Blight',
      confidence: 92,
      severity: 'High',
      solution: 'Apply fungicide every 7 days. Remove infected leaves.'
    },
    maize: {
      disease: 'Corn Leaf Blight',
      confidence: 87,
      severity: 'Moderate',
      solution: 'Improve air circulation. Use resistant varieties.'
    },
    rice: {
      disease: 'Brown Spot',
      confidence: 78,
      severity: 'Low',
      solution: 'Use treated seeds. Avoid excessive nitrogen.'
    }
  }
  return mockResults[cropType.toLowerCase()] || mockResults.tomato
}

export const analyze = async (req, res) => {
  try {
    const { cropType } = req.body
    const userId = req.user.id

    if (!cropType) {
      return res.status(400).json({ error: 'cropType required' })
    }

    const aiResult = await mockAnalyze(cropType)

    const scan = await createScan({
      user_id: userId,
      crop_type: cropType,
      disease: aiResult.disease,
      confidence: aiResult.confidence,
      severity: aiResult.severity,
      solution: aiResult.solution
    })

    res.status(201).json({ message: 'Scan analyzed', scan })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getScans = async (req, res) => {
  try {
    const scans = await getUserScans(req.user.id)
    res.json({ scans })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getScan = async (req, res) => {
  try {
    const scan = await getScanById(req.params.id)

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' })
    }
    if (scan.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    res.json({ scan })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const removeScan = async (req, res) => {
  try {
    const scan = await getScanById(req.params.id)

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' })
    }
    if (scan.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    await deleteScan(req.params.id)
    res.json({ message: 'Scan deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}