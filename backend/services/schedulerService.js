import { sendReminderEmail } from './emailService.js'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname  = dirname(fileURLToPath(import.meta.url))
const QUEUE_FILE = join(__dirname, '../data/reminder_queue.json')
const TZ         = 'Africa/Douala'

const activeReminders = new Map()

function formatCameroon(date) {
  return new Date(date).toLocaleString('en-US', {
    timeZone: TZ, month:'short', day:'numeric',
    year:'numeric', hour:'numeric', minute:'2-digit',
    second:'2-digit', hour12:true,
  })
}

// ---- Persist queue to file ----
function loadQueue() {
  try {
    if (!existsSync(QUEUE_FILE)) return []
    return JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'))
  } catch { return [] }
}

function saveQueue(queue) {
  try {
    writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2))
  } catch (err) {
    console.error('Failed to save queue:', err.message)
  }
}

function addToQueue(task, recipient, label, fireAt) {
  const queue = loadQueue()
  // Remove existing entries for this task+label
  const filtered = queue.filter(q => !(q.taskId === task.id && q.label === label))
  filtered.push({
    taskId:    task.id,
    task,
    recipient,
    label,
    fireAt,
    createdAt: Date.now(),
  })
  saveQueue(filtered)
}

function removeFromQueue(taskId, label = null) {
  const queue = loadQueue()
  const filtered = label
    ? queue.filter(q => !(q.taskId === taskId && q.label === label))
    : queue.filter(q => q.taskId !== taskId)
  saveQueue(filtered)
}

// ---- Core scheduler ----
export function scheduleReminder(task, recipient) {
  if (!task.due || task.done) return
  cancelReminder(task.id)

  const dueTime = new Date(task.due).getTime()
  const now     = Date.now()

  if (isNaN(dueTime)) {
    console.log(`⚠️  Invalid due date: ${task.due}`)
    return
  }

  const minutesLeft = Math.round((dueTime - now) / 60000)

  console.log(`\n📅 Scheduling: "${task.title}"`)
  console.log(`   Due (Cameroon): ${formatCameroon(dueTime)}`)
  console.log(`   Now (Cameroon): ${formatCameroon(now)}`)
  console.log(`   Minutes until due: ${minutesLeft}`)
  console.log(`   Recipient: ${recipient}`)

  const slots = [
    { lead: 30 * 60 * 1000, label: 'in 30 minutes' },
    { lead: 10 * 60 * 1000, label: 'in 10 minutes' },
    { lead: 0,              label: 'right now'      },
  ]

  const timeouts = []

  slots.forEach(({ lead, label }) => {
    const fireAt = dueTime - lead
    const delay  = fireAt - now

    if (delay < 0) {
      console.log(`   ⏭  "${label}" already passed`)
      return
    }

    const minsFromNow = Math.round(delay / 60000)
    console.log(`   ✅ "${label}" fires in ${minsFromNow} min (${formatCameroon(fireAt)})`)

    // Save to file queue in case of restart
    addToQueue(task, recipient, label, fireAt)

    const id = setTimeout(async () => {
      console.log(`\n🔔 FIRING: "${task.title}" — ${label} → ${recipient}`)
      console.log(`   Cameroon time: ${formatCameroon(Date.now())}`)
      try {
        await sendReminderEmail(task, recipient, label)
        console.log(`   ✅ Email sent to ${recipient}`)
        removeFromQueue(task.id, label)
      } catch (err) {
        console.error(`   ❌ Email failed:`, err?.response?.body || err.message)
      }
    }, delay)

    timeouts.push(id)
  })

  if (timeouts.length > 0) {
    activeReminders.set(task.id, timeouts)
  }
}

export function cancelReminder(taskId) {
  const timeouts = activeReminders.get(taskId) || []
  timeouts.forEach(id => clearTimeout(id))
  activeReminders.delete(taskId)
  removeFromQueue(taskId)
}

export function rescheduleAll(tasks, recipient) {
  console.log(`\n🔄 Rescheduling all — ${formatCameroon(Date.now())}`)
  activeReminders.forEach(timeouts => timeouts.forEach(id => clearTimeout(id)))
  activeReminders.clear()

  const eligible = tasks.filter(t => !t.done && t.due)
  console.log(`   Tasks: ${eligible.length}`)
  eligible.forEach(t => scheduleReminder(t, recipient))
}

// ---- Restore queue after server restart ----
export function restoreQueueAfterRestart() {
  const queue = loadQueue()
  const now   = Date.now()
  const future = queue.filter(q => q.fireAt > now)
  const missed = queue.filter(q => q.fireAt <= now)

  console.log(`\n♻️  Restoring reminder queue after restart`)
  console.log(`   Future reminders: ${future.length}`)
  console.log(`   Missed reminders: ${missed.length}`)

  // Send missed reminders immediately
  missed.forEach(async ({ task, recipient, label }) => {
    console.log(`   📧 Sending missed reminder: "${task.title}" — ${label} → ${recipient}`)
    try {
      await sendReminderEmail(task, recipient, `${label} (sent late after restart)`)
      removeFromQueue(task.id, label)
    } catch (err) {
      console.error(`   ❌ Missed reminder failed:`, err.message)
    }
  })

  // Reschedule future ones
  future.forEach(({ task, recipient, label, fireAt }) => {
    const delay = fireAt - now
    console.log(`   ⏰ Re-scheduling "${task.title}" — ${label} in ${Math.round(delay/60000)} min`)

    const id = setTimeout(async () => {
      console.log(`\n🔔 FIRING (restored): "${task.title}" — ${label} → ${recipient}`)
      try {
        await sendReminderEmail(task, recipient, label)
        console.log(`   ✅ Email sent!`)
        removeFromQueue(task.id, label)
      } catch (err) {
        console.error(`   ❌ Failed:`, err.message)
      }
    }, delay)

    const existing = activeReminders.get(task.id) || []
    existing.push(id)
    activeReminders.set(task.id, existing)
  })

  // Clean up missed from file
  saveQueue(future)
}

export function getActiveReminders() {
  return [...activeReminders.keys()]
}