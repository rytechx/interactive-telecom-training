import { Router } from 'express'
import {
  currentUser,
  login,
  logout,
  register,
} from '../controllers/authController.js'
import authenticate from '../middleware/authenticate.js'

const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/me', authenticate, currentUser)
authRouter.post('/logout', logout)

export default authRouter
