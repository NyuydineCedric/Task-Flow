import { Router } from 'express'
import { getTasksByUser, saveTask, deleteTask as removeTask, getTaskById, getUserById } from '../services/fileStore.js'
import { protect } from '../middleware/auth.js'
import { scheduleReminder, cancelReminder } from '../services/schedulerService.js'

const router = Router()
router.use(protect)

function makeId() { return `t_${Date.now()}_${Math.random().toString(36).slice(2,7)}` }

// GET /api/tasks
router.get('/', (req, res) => {
  try {
    const tasks = getTasksByUser(req.user.id)
    res.json({ tasks })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/tasks
router.post('/', (req, res) => {
  try {
    const task = {
      id:          makeId(),
      userId:      req.user.id,
      title:       req.body.title,
      description: req.body.description || '',
      category:    req.body.category    || 'Work',
      priority:    req.body.priority    || 'medium',
      done:        false,
      due:         req.body.due         || '',
      tags:        req.body.tags        || [],
      createdAt:   Date.now(),
    }
    saveTask(task)
    if (task.due) {
      const user = getUserById(req.user.id)
      scheduleReminder(task, user.email)
    }
    res.status(201).json({ task })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/tasks/:id
router.patch('/:id', (req, res) => {
  try {
    const existing = getTaskById(req.params.id)
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Task not found' })
    }
    const updated = { ...existing, ...req.body, id: existing.id, userId: existing.userId }
    saveTask(updated)
    if (updated.due && !updated.done) {
      const user = getUserById(req.user.id)
      scheduleReminder(updated, user.email)
    } else {
      cancelReminder(updated.id)
    }
    res.json({ task: updated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  try {
    const existing = getTaskById(req.params.id)
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Task not found' })
    }
    removeTask(req.params.id)
    cancelReminder(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/tasks/:id/toggle
router.patch('/:id/toggle', (req, res) => {
  try {
    const existing = getTaskById(req.params.id)
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Task not found' })
    }
    const updated = { ...existing, done: !existing.done, completedAt: !existing.done ? Date.now() : null }
    saveTask(updated)
    if (updated.done) cancelReminder(updated.id)
    res.json({ task: updated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router