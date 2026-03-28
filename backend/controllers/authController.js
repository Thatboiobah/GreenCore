import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createUser, getUserByEmail } from '../models/User.js'

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password, location, farmSize } = req.body

    // Validate
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      location: location || null,
      farm_size: farmSize || null
    })

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({ message: 'User registered', token, user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    // Find user
    const user = await getUserByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ message: 'Login successful', token, user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get current user
export const getMe = async (req, res) => {
  res.json({ user: req.user })
}