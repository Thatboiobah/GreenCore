import supabase from '../config/db.js'
import { createUser, getUserById, updateUser } from '../models/User.js'

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password, location, farmSize } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      // Check if it's a network/connection error
      if (error.message?.includes('timeout') || error.message?.includes('ENOTFOUND') || error.message?.includes('connect')) {
        return res.status(503).json({ 
          error: 'Unable to reach authentication service. Please check your internet connection and try again.',
          code: 'SERVICE_UNAVAILABLE'
        })
      }
      // Email already exists
      if (error.message?.includes('already registered') || error.message?.includes('User already exists')) {
        return res.status(400).json({ 
          error: 'An account with this email already exists. Please log in instead.',
          code: 'EMAIL_EXISTS'
        })
      }
      return res.status(400).json({ error: error.message })
    }

    const userId = data.user.id

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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        location: user.location,
        farm_size: user.farm_size
      }
    })
  } catch (error) {
    // Network or internal server errors
    if (error.message?.includes('timeout') || error.message?.includes('ENOTFOUND') || error.message?.includes('connect')) {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable. Please try again later.',
        code: 'SERVICE_UNAVAILABLE'
      })
    }
    res.status(500).json({ error: 'An unexpected error occurred. Please try again.' })
  }
}

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      // Check if it's a network/connection error
      if (error.message?.includes('timeout') || error.message?.includes('ENOTFOUND') || error.message?.includes('connect')) {
        return res.status(503).json({ 
          error: 'Unable to reach authentication service. Please check your internet connection and try again.',
          code: 'SERVICE_UNAVAILABLE'
        })
      }
      // Invalid credentials
      if (error.message?.includes('Invalid login credentials')) {
        return res.status(401).json({ 
          error: 'Invalid email or password. Please try again.',
          code: 'INVALID_CREDENTIALS'
        })
      }
      return res.status(401).json({ error: error.message })
    }

    // Try to get user from database, if fails, create minimal user object
    let user
    try {
      user = await getUserById(data.user.id)
    } catch (err) {
      // User exists in auth but not in users table
      user = {
        id: data.user.id,
        name: data.user.email.split('@')[0], // default to email prefix
        email: data.user.email,
        location: null,
        farm_size: null
      }
    }

    res.json({
      message: 'Login successful',
      token: data.session.access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        location: user.location,
        farm_size: user.farm_size
      }
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

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, location, farm_size, crop_type } = req.body
    const userId = req.user.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const updates = {}
    if (name) updates.name = name
    if (location) updates.location = location
    if (farm_size) updates.farm_size = farm_size
    if (crop_type) updates.crop_type = crop_type

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    const user = await updateUser(userId, updates)

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        location: user.location,
        farm_size: user.farm_size,
        crop_type: user.crop_type
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ error: error.message })
  }
}