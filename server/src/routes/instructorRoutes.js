import { Router } from 'express'
import {
  modules,
  overview,
  results,
  studentAttemptDetail,
  studentAttempts,
  studentDetail,
  students,
  troubleshooting,
} from '../controllers/instructorController.js'
import authenticate from '../middleware/authenticate.js'
import authorize from '../middleware/authorize.js'

const instructorRouter = Router()

instructorRouter.use(authenticate, authorize('instructor', 'admin'))
instructorRouter.get('/overview', overview)
instructorRouter.get('/students', students)
instructorRouter.get('/students/:studentId', studentDetail)
instructorRouter.get('/students/:studentId/attempts', studentAttempts)
instructorRouter.get(
  '/students/:studentId/attempts/:attemptId',
  studentAttemptDetail,
)
instructorRouter.get('/modules', modules)
instructorRouter.get('/results', results)
instructorRouter.get('/troubleshooting', troubleshooting)

export default instructorRouter
