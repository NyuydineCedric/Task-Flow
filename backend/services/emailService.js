import * as Brevo from '@getbrevo/brevo'
import { reminderEmailHTML, reminderEmailText } from '../hello/reminderEmail.js'
import 'dotenv/config'

const client = new Brevo.TransactionalEmailsApi()
client.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY)

export async function sendReminderEmail(task, recipient, label = 'soon') {
  try {
    const subject = task.priority === 'high'
      ? `🚨 URGENT: "${task.title}" is due ${label}`
      : `⏰ Reminder: "${task.title}" is due ${label}`

    const email = new Brevo.SendSmtpEmail()
    email.subject = subject
    email.htmlContent = reminderEmailHTML(task, label)
    email.textContent = reminderEmailText(task, label)
    email.sender = {
      name:  process.env.EMAIL_FROM_NAME    || 'TaskFlow',
      email: process.env.EMAIL_FROM_ADDRESS,
    }
    email.to = [{ email: recipient }]

    const result = await client.sendTransacEmail(email)
    console.log(`📧 Brevo email sent to ${recipient} — ID: ${result.body?.messageId}`)
    return result
  } catch (err) {
    console.error('❌ Brevo email failed:', err?.response?.body || err.message)
    throw err
  }
}

export async function sendTestEmail(recipient) {
  const testTask = {
    id:          'test',
    title:       'Test Reminder — TaskFlow is working!',
    description: 'If you see this email, your Brevo email notifications are set up correctly.',
    category:    'Work',
    priority:    'medium',
    due:         new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  }
  return sendReminderEmail(testTask, recipient, 'in 10 minutes')
}