import express from 'express'
import { getDashboardMetrics, getRecentScans } from '../controllers/dashboardController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

/**
 * GET /api/dashboard/metrics
 * Retrieves farm overview metrics:
 * - Total scans performed
 * - Total diseases detected
 * - Healthy crops count
 * - Farm health score (0-100%)
 * - Trend percentages for each metric
 * - AI insights for the farm
 */
router.get('/metrics', authMiddleware, getDashboardMetrics)

/**
 * GET /api/dashboard/recent-scans?limit=5
 * Retrieves recent scan records with:
 * - Crop type (tomato, cassava, corn, etc.)
 * - Disease diagnosis
 * - Scan date/time
 * - Confidence score
 * - Crop image thumbnail
 */
router.get('/recent-scans', authMiddleware, getRecentScans)

export default router
