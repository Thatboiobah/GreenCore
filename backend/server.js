import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import scanRoutes from './routes/scanRoutes.js'

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})