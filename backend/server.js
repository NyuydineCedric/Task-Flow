process.env.TZ = 'Africa/Douala'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import authRouter     from './routes/auth.js'
import tasksRouter    from './routes/tasks.js'
import settingsRouter from './routes/settings.js'
import emailRouter    from './routes/email.js'
import { restoreQueueAfterRestart } from './services/schedulerService.js'

const app  = express()
const PORT = process.env.PORT || 4000

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://task-flow-81vq7k0xb-nyuydinecedrics-projects.vercel.app",
    "https://task-flow.vercel.app"
  ],
  credentials: true
}));

app.use(express.json())
app.use('/api/auth',     authRouter)
app.use('/api/tasks',    tasksRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/email',    emailRouter)

app.get('/health', (_, res) => res.json({
  status:      'ok',
  timezone:    'Africa/Douala (WAT)',
  cameroonTime: new Date().toLocaleString('en-US', { timeZone:'Africa/Douala' }),
}))

app.use((req, res) => res.status(404).json({ error:`${req.method} ${req.path} not found` }))
app.use((err, req, res, next) => res.status(500).json({ error:'Internal server error' }))

app.listen(PORT, () => {
  const now = new Date().toLocaleString('en-US', { timeZone:'Africa/Douala' })
  console.log(`\n TaskFlow Backend → http://localhost:${PORT}`)
  console.log(`Timezone: Africa/Douala (WAT = UTC+1)`)
  console.log(`Cameroon time: ${now}`)
  console.log(` Brevo ready`)
  console.log(` Data in backend/data/*.json\n`)
  restoreQueueAfterRestart()
})