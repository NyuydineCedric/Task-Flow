import * as Brevo from '@getbrevo/brevo'
import 'dotenv/config'

const client = new Brevo.TransactionalEmailsApi()
client.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY)

const email = new Brevo.SendSmtpEmail()
email.subject = '✅ TaskFlow Test Email'
email.htmlContent = '<h1>It works!</h1><p>TaskFlow email notifications are working correctly.</p>'
email.textContent = 'TaskFlow email notifications are working correctly.'
email.sender = {
  name:  process.env.EMAIL_FROM_NAME    || 'TaskFlow',
  email: process.env.EMAIL_FROM_ADDRESS,
}
email.to = [{ email: process.env.EMAIL_FROM_ADDRESS }]

console.log('Sending test email to:', process.env.EMAIL_FROM_ADDRESS)
console.log('Using API key:', process.env.BREVO_API_KEY?.slice(0, 10) + '...')
console.log('From address:', process.env.EMAIL_FROM_ADDRESS)

try {
  const result = await client.sendTransacEmail(email)
  console.log('✅ Email sent successfully!')
  console.log('Message ID:', result.body?.messageId)
} catch (err) {
  console.error('❌ Failed:', err?.response?.body || err.message)
}