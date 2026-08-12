import { Router } from 'express'
import {
  currentUser,
  login,
  logout,
  register,
  staffLogin,
} from '../controllers/authController.js'
import authenticate from '../middleware/authenticate.js'

const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/staff/login', staffLogin)
authRouter.get('/me', authenticate, currentUser)
authRouter.post('/logout', logout)

export default authRouter
