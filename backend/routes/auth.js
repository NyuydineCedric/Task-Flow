import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { getUserByEmail, saveUser, getUserById, getSettings, getDefaultSettings } from '../services/fileStore.js'
import { protect } from '../middleware/auth.js'
import 'dotenv/config'

const router = Router()

function makeId()      { return `u_${Date.now()}_${Math.random().toString(36).slice(2,7)}` }
function signToken(id) { return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN }) }
function getInitials(name) {
  return name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()
}
function safeUser(u) {
  const { password, ...rest } = u
  return rest
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email address' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const existing = getUserByEmail(email)
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = {
      id:        makeId(),
      name:      name.trim(),
      email:     email.trim().toLowerCase(),
      password:  hashed,
      initials:  getInitials(name),
      role:      'User',
      plan:      'Free',
      xp:        0,
      level:     1,
      xpToNext:  2000,
      streak:    0,
      joinedAt:  new Date().toISOString(),
      settings:  getDefaultSettings(),
    }

    saveUser(user)

    const token = signToken(user.id)
    res.status(201).json({ success:true, token, user: safeUser(user) })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = getUserByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'No account found with this email.' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ error: 'Incorrect password.' })
    }

    const token = signToken(user.id)
    res.json({ success:true, token, user: safeUser(user) })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ user: safeUser(req.user) })
})

// PATCH /api/auth/profile
router.patch('/profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body
    const user = { ...req.user }
    if (name)  { user.name = name.trim(); user.initials = getInitials(name) }
    if (email) { user.email = email.trim().toLowerCase() }
    saveUser(user)
    res.json({ user: safeUser(user) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router