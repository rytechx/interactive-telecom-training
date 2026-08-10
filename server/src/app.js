import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import environment from './config/environment.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import authRouter from './routes/authRoutes.js'
import instructorRouter from './routes/instructorRoutes.js'
import trainingRouter from './routes/trainingRoutes.js'

const app = express()

app.disable('x-powered-by')
app.use(
  cors({
    origin: environment.clientOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }),
)
app.use(express.json({ limit: '32kb' }))
app.use(cookieParser())

app.get('/api/health', (request, response) => {
  void request
  response.json({
    success: true,
    data: {
      status: 'ok',
      service: 'TeleSim 3D API',
    },
  })
})

app.use('/api/auth', authRouter)
app.use('/api/training', trainingRouter)
app.use('/api/instructor', instructorRouter)
app.use(notFound)
app.use(errorHandler)

export default app
