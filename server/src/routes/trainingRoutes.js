import { Router } from 'express'
import {
  attemptDetail,
  completeAttempt,
  listAttempts,
  progress,
  saveScenario,
  startAttempt,
} from '../controllers/trainingController.js'
import authenticate from '../middleware/authenticate.js'

const trainingRouter = Router()

trainingRouter.use(authenticate)
trainingRouter.get('/progress', progress)
trainingRouter.get('/attempts', listAttempts)
trainingRouter.post('/attempts', startAttempt)
trainingRouter.get('/attempts/:attemptId', attemptDetail)
trainingRouter.post('/attempts/:attemptId/complete', completeAttempt)
trainingRouter.post('/attempts/:attemptId/scenarios', saveScenario)

export default trainingRouter
