import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import scanRoutes from './routes/scanRoutes.js'
import insightsRoutes from './routes/insightsRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'GreenCore API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/scans', scanRoutes)
app.use('/api/insights', insightsRoutes)

app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(500).json({ error: err.message })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})