import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import testRoutes from './routes/testRoutes.js' // <-- add this

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'GreenCore API is running' })
})

app.use('/api', testRoutes) // <-- mount /api routes

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})