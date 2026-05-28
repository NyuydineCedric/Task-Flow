import { Router } from 'express'
import { getSettings, saveSettings } from '../services/fileStore.js'
import { protect } from '../middleware/auth.js'

const router = Router()
router.use(protect)

// GET /api/settings
router.get('/', (req, res) => {
  const settings = getSettings(req.user.id)
  res.json({ settings })
})

// PATCH /api/settings
router.patch('/', (req, res) => {
  try {
    const current = getSettings(req.user.id)
    const updated = { ...current, ...req.body }
    saveSettings(req.user.id, updated)
    res.json({ settings: updated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router