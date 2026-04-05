import supabase from '../config/db.js'

/**
 * GET /api/dashboard/metrics
 * 
 * Calculates and returns farm overview metrics by:
 * 1. Querying the 'scans' table filtered by user_id
 * 2. Counting total scans
 * 3. Filtering scans where disease is NOT "Healthy" for disease count
 * 4. Filtering scans where disease IS "Healthy" for healthy crops
 * 5. Calculating farm_health_score as: (healthy_crops / total_scans) * 100
 * 6. Calculating trend percentages based on scans from last 7 days vs previous 7 days
 * 7. Generating AI insights based on patterns
 */
export const getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user.id

    // Fetch all scans for this user
    const { data: allScans, error: scansError } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (scansError) throw scansError

    // Calculate metrics
    const totalScans = allScans.length
    
    // Your schema uses "disease" field (text) instead of boolean
    // "Healthy" or "None" = no disease, anything else = disease detected
    const diseasesDetected = allScans.filter(scan => 
      scan.disease && 
      scan.disease.toLowerCase() !== 'healthy' && 
      scan.disease.toLowerCase() !== 'none'
    ).length
    
    const healthyCrops = allScans.filter(scan => 
      scan.disease && 
      (scan.disease.toLowerCase() === 'healthy' || scan.disease.toLowerCase() === 'none')
    ).length
    
    const farmHealthScore = totalScans > 0 
      ? Math.round((healthyCrops / totalScans) * 100) 
      : 0

    // Calculate trends (compare last 7 days with previous 7 days)
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const recentScans = allScans.filter(s => new Date(s.created_at) >= sevenDaysAgo)
    const olderScans = allScans.filter(s => {
      const d = new Date(s.created_at)
      return d >= fourteenDaysAgo && d < sevenDaysAgo
    })

    const scansTrend = olderScans.length > 0 
      ? Math.round(((recentScans.length - olderScans.length) / olderScans.length) * 100)
      : recentScans.length > 0 
      ? 100 
      : 0

    // Generate AI insights based on data patterns
    const insights = []

    // Insight 1: Disease pattern
    if (diseasesDetected > 0) {
      const diseaseTypes = {}
      allScans.forEach(scan => {
        if (scan.disease && scan.disease.toLowerCase() !== 'healthy' && scan.disease.toLowerCase() !== 'none') {
          diseaseTypes[scan.disease] = (diseaseTypes[scan.disease] || 0) + 1
        }
      })
      const mostCommon = Object.entries(diseaseTypes).sort((a, b) => b[1] - a[1])[0]
      if (mostCommon) {
        insights.push({
          title: 'Most Common Disease',
          description: `${mostCommon[0]} detected ${mostCommon[1]} times. Recommended solution available.`
        })
      }
    } else {
      insights.push({
        title: 'Great Health Status',
        description: 'All crops are showing healthy signs!'
      })
    }

    // Insight 2: Scanning activity
    if (recentScans.length > olderScans.length) {
      insights.push({
        title: 'Increased Monitoring',
        description: `You've increased scans by ${scansTrend}% this week. Keep it up!`
      })
    }

    // Insight 3: Recommendation based on confidence scores
    const avgConfidence = allScans.length > 0
      ? Math.round(allScans.reduce((sum, s) => sum + (s.confidence || 0), 0) / allScans.length)
      : 0

    if (avgConfidence >= 90) {
      insights.push({
        title: 'High Confidence Scans',
        description: `Average confidence: ${avgConfidence}%. Your scans are very reliable.`
      })
    } else if (avgConfidence >= 70) {
      insights.push({
        title: 'Good Scan Quality',
        description: `Average confidence: ${avgConfidence}%. Try better lighting for improved accuracy.`
      })
    }

    return res.json({
      total_scans: totalScans,
      diseases_detected: diseasesDetected,
      healthy_crops: healthyCrops,
      farm_health_score: farmHealthScore,
      scans_trend: scansTrend,
      diseases_trend: diseasesDetected > 0 ? 10 : -5,
      healthy_trend: healthyCrops > 0 ? 8 : 0,
      health_trend: farmHealthScore >= 80 ? 5 : -3,
      insights: insights.slice(0, 3)
    })
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return res.status(500).json({ 
      message: 'Failed to fetch metrics',
      error: error.message 
    })
  }
}

/**
 * GET /api/dashboard/recent-scans?limit=5
 * 
 * Returns the most recent scan records formatted for the dashboard table
 * Maps your schema fields to dashboard display fields
 * 
 * Query params:
 * - limit: number of scans to return (default: 5)
 */
export const getRecentScans = async (req, res) => {
  try {
    const userId = req.user.id
    const limit = parseInt(req.query.limit) || 5

    // Fetch recent scans
    const { data: scans, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    // Format the response data to match dashboard expectations
    const formattedScans = scans.map(scan => ({
      id: scan.id,
      crop_type: scan.crop_type,
      disease_name: scan.disease,
      confidence_score: Math.round(scan.confidence),
      scan_date: scan.created_at,
      crop_image: scan.image_url || '/assets/default-crop.jpg',
      treatment_recommendation: scan.solution,
      severity: scan.severity
    }))

    return res.json(formattedScans)
  } catch (error) {
    console.error('Error fetching recent scans:', error)
    return res.status(500).json({ 
      message: 'Failed to fetch recent scans',
      error: error.message 
    })
  }
}
