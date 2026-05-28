import jwt from 'jsonwebtoken'
import { getUserById } from '../services/fileStore.js'
import 'dotenv/config'

export function protect(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
    const token   = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user    = getUserById(decoded.id)
    if (!user) return res.status(401).json({ error: 'User not found' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}