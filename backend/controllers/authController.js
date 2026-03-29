import supabase from '../config/db.js'
import { createUser, getUserById } from '../models/User.js'

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password, location, farmSize } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Supabase Auth handles password hashing + user creation
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) return res.status(400).json({ error: error.message })

    const userId = data.user.id

    // Save extra fields to your users table
    const user = await createUser({
      id: userId,
      name,
      email,
      location: location || null,
      farm_size: farmSize || null
    })

    res.status(201).json({
      message: 'User registered',
      token: data.session?.access_token,
      user
    })
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

    // Supabase Auth handles password check + token generation
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) return res.status(401).json({ error: error.message })

    const user = await getUserById(data.user.id)

    res.json({
      message: 'Login successful',
      token: data.session.access_token,
      user
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await getUserById(req.user.id)
    res.json({ user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}