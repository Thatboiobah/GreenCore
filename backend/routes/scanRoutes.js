import express from 'express'
import { analyze, getScans, getScan, removeScan } from '../controllers/scanContoller.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.post('/', authMiddleware, analyze)
router.get('/', authMiddleware, getScans)
router.get('/:id', authMiddleware, getScan)
router.delete('/:id', authMiddleware, removeScan)

export default router