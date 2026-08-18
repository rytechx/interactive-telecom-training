import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { verifyDatabaseConnection } from './config/database.js'
import environment from './config/environment.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import authRouter from './routes/authRoutes.js'
import instructorRouter from './routes/instructorRoutes.js'
import trainingRouter from './routes/trainingRoutes.js'

const app = express()
const corsOrigin = (origin, callback) => {
  callback(null, !origin || origin === environment.clientOrigin)
}

app.disable('x-powered-by')
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }),
)
app.use(express.json({ limit: '32kb' }))
app.use(cookieParser())

app.get('/api/health', async (request, response) => {
  void request

  try {
    await verifyDatabaseConnection()
    response.json({
      success: true,
      data: {
        status: 'ok',
        service: 'TeleSim 3D API',
        database: 'connected',
      },
    })
  } catch {
    response.status(503).json({
      success: false,
      data: {
        status: 'degraded',
        service: 'TeleSim 3D API',
        database: 'unavailable',
      },
    })
  }
})

app.use('/api/auth', authRouter)
app.use('/api/training', trainingRouter)
app.use('/api/instructor', instructorRouter)
app.use(notFound)
app.use(errorHandler)

export default app
