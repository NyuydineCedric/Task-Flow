const API = 'http://localhost:4000/api/email'

class NotificationService {
  constructor() {
    this.permissionGranted = false
    this._frontendTimers   = new Map()
    this.init()
  }

  async init() {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        this.permissionGranted = true
      } else if (Notification.permission !== 'denied') {
        const result = await Notification.requestPermission()
        this.permissionGranted = result === 'granted'
      }
    }
  }

  getToken() {
    return localStorage.getItem('tf_token')
  }

  playSound() {
    const audio = new Audio('/sounds/notification.mp3')
    audio.volume = 0.8
    console.log('🔊 Playing /sounds/notification.mp3')
    audio.play().catch(err => console.warn('Sound failed:', err.message))
  }

  showBrowserNotification(title, body, options = {}) {
    if (!this.permissionGranted) return
    try {
      const n = new Notification(title, {
        body,
        icon: '/favicon.svg',
        tag:  options.tag || 'taskflow',
        requireInteraction: options.requireInteraction || false,
      })
      n.onclick = () => { window.focus(); n.close() }
    } catch (e) {
      console.warn('Browser notification failed:', e)
    }
  }

  fireReminder(task, settings = {}) {
    console.log(`🔔 fireReminder called: ${task.title}`)
    console.log(`🔊 sounds:`, settings.sounds)

    if (settings.sounds !== false) {
      this.playSound()
    }

    if (settings.notifications !== false) {
      this.showBrowserNotification(
        `⏰ Reminder: ${task.title}`,
        `${task.category} · Due ${new Date(task.due).toLocaleTimeString('en-US', {
          hour: 'numeric', minute: '2-digit',
        })}`,
        { requireInteraction: task.priority === 'high', tag: task.id }
      )
    }

    window.dispatchEvent(new CustomEvent('taskflow:reminder', { detail: { task } }))
  }

  rescheduleAll(tasks, settings = {}) {
    this._frontendTimers.forEach(ids => ids.forEach(id => clearTimeout(id)))
    this._frontendTimers.clear()

    const eligible = tasks.filter(t => !t.done && t.due)
    console.log(`⏰ Scheduling ${eligible.length} frontend timer(s)`)
    eligible.forEach(t => this._scheduleFrontendTimers(t, settings))
  }

  async cancelReminder(taskId) {
    const token = this.getToken()
    if (token) {
      try {
        await fetch(`${API}/schedule/${taskId}`, {
          method:  'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch (err) {
        console.warn('Cancel reminder failed:', err.message)
      }
    }
    this._cancelFrontendTimers(taskId)
  }

  async sendTestEmail() {
    const token = this.getToken()
    if (!token) return
    try {
      const res  = await fetch(`${API}/test`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
      })
      return res.json()
    } catch (err) {
      console.error('Test email failed:', err.message)
    }
  }

  _scheduleFrontendTimers(task, settings = {}) {
    this._cancelFrontendTimers(task.id)

    const dueTime = new Date(task.due).getTime()
    const now     = Date.now()
    if (isNaN(dueTime)) return

    const slots = [
      { lead: 30 * 60 * 1000, label: 'in 30 minutes' },
      { lead: 10 * 60 * 1000, label: 'in 10 minutes' },
      { lead: 0,              label: 'now'            },
    ]

    const ids = []
    slots.forEach(({ lead, label }) => {
      const delay = dueTime - lead - now
      if (delay < 0) return

      console.log(`   ⏰ Timer: "${task.title}" ${label} in ${Math.round(delay/1000)}s`)
      const id = setTimeout(() => {
        this.fireReminder({ ...task, _reminderLabel: label }, settings)
      }, delay)
      ids.push(id)
    })

    if (ids.length > 0) this._frontendTimers.set(task.id, ids)
  }

  _cancelFrontendTimers(taskId) {
    const ids = this._frontendTimers.get(taskId) || []
    ids.forEach(id => clearTimeout(id))
    this._frontendTimers.delete(taskId)
  }
}

export const notificationService = new NotificationService()