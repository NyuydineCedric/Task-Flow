import { Router } from 'express'
import { sendReminderEmail, sendTestEmail } from '../services/emailService.js'
import { scheduleReminder, cancelReminder, rescheduleAll, getActiveReminders } from '../services/schedulerService.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// POST /api/email/reminder  (protected)
router.post('/reminder', protect, async (req, res) => {
  try {
    const { task, label } = req.body
    if (!task?.title) return res.status(400).json({ error: 'task with title required' })
    const recipient = req.user.email
    await sendReminderEmail(task, recipient, label || 'soon')
    res.json({ success: true, sentTo: recipient })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/email/test  (protected)
router.post('/test', protect, async (req, res) => {
  try {
    const recipient = req.user.email
    await sendTestEmail(recipient)
    res.json({ success: true, sentTo: recipient })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/email/schedule  (protected)
router.post('/schedule', protect, (req, res) => {
  try {
    const { task } = req.body
    if (!task?.id || !task?.due) return res.status(400).json({ error: 'task with id and due required' })
    scheduleReminder(task, req.user.email)
    res.json({ success: true, taskId: task.id, sentTo: req.user.email })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/email/schedule/:taskId  (protected)
router.delete('/schedule/:taskId', protect, (req, res) => {
  try {
    cancelReminder(req.params.taskId)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/email/reschedule-all  (protected)
router.post('/reschedule-all', protect, (req, res) => {
  try {
    const { tasks } = req.body
    if (!Array.isArray(tasks)) return res.status(400).json({ error: 'tasks array required' })

    // Log what we received
    console.log(`\n📨 reschedule-all called by ${req.user.email}`)
    console.log(`   Total tasks received: ${tasks.length}`)
    tasks.forEach(t => {
      console.log(`   - "${t.title}" | due: ${t.due || 'NO DUE DATE'} | done: ${t.done}`)
    })

    rescheduleAll(tasks, req.user.email)
    res.json({ success:true, count: tasks.filter(t => !t.done && t.due).length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/email/active
router.get('/active', protect, (req, res) => {
  res.json({ activeTaskIds: getActiveReminders() })
})


// GET /api/email/servertime  — add this before export
router.get('/servertime', (req, res) => {
  res.json({
    utc:       new Date().toUTCString(),
    iso:       new Date().toISOString(),
    timestamp: Date.now(),
    timezone:  Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
})

export default router