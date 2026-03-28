import express from 'express'

const router = express.Router()

// GET /api/test
router.get('/test', (req, res) => {
  res.json({ message: 'Test route working' })
})

export default router