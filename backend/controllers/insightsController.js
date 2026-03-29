import { getUserScans } from '../models/Scan.js'

export const getInsights = async (req, res) => {
  try {
    const userId = req.user.id
    const scans = await getUserScans(userId)

    const totalScans = scans.length

    if (totalScans === 0) {
      return res.json({
        totalScans: 0,
        diseaseCount: 0,
        healthScore: 100,
        riskLevel: 'Low',
        mostFrequentDisease: null,
        mostAffectedCrop: null
      })
    }

    // Count diseases
    const diseaseCounts = {}
    const cropCounts = {}

    scans.forEach(scan => {
      if (scan.disease) {
        diseaseCounts[scan.disease] = (diseaseCounts[scan.disease] || 0) + 1
      }
      if (scan.crop_type) {
        cropCounts[scan.crop_type] = (cropCounts[scan.crop_type] || 0) + 1
      }
    })

    const mostFrequentDisease = Object.keys(diseaseCounts).reduce((a, b) =>
      diseaseCounts[a] > diseaseCounts[b] ? a : b
    )

    const mostAffectedCrop = Object.keys(cropCounts).reduce((a, b) =>
      cropCounts[a] > cropCounts[b] ? a : b
    )

    const diseaseCount = Object.keys(diseaseCounts).length

    const healthScore = Math.max(0, 100 - diseaseCount * 5)

    const riskLevel =
      healthScore >= 80 ? 'Low' :
      healthScore >= 50 ? 'Moderate' : 'High'

    res.json({
      totalScans,
      diseaseCount,
      healthScore,
      riskLevel,
      mostFrequentDisease,
      mostAffectedCrop
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}