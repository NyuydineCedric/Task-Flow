import nodemailer from 'nodemailer'
import 'dotenv/config'

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Verify connection on startup
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ Mail server connection failed:', err.message)
  } else {
    console.log('✅ Mail server connected and ready')
  }
})

export default transporter