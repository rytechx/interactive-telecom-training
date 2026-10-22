import { Router } from 'express'
import {
  studentClasses,
  studentJoinClass,
} from '../controllers/classController.js'
import authenticate from '../middleware/authenticate.js'
import authorize from '../middleware/authorize.js'

const classRouter = Router()

classRouter.use(authenticate, authorize('student'))
classRouter.get('/me', studentClasses)
classRouter.post('/join', studentJoinClass)

export default classRouter
