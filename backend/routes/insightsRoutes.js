import express from 'express'
import { getInsights } from '../controllers/insightsController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authMiddleware, getInsights)

export default router