import { Router } from 'express'
import {
  currentUser,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  staffLogin,
  verifyResetOtp,
} from '../controllers/authController.js'
import authenticate from '../middleware/authenticate.js'

const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/staff/login', staffLogin)
authRouter.post('/forgot-password', forgotPassword)
authRouter.post('/verify-reset-otp', verifyResetOtp)
authRouter.post('/reset-password', resetPassword)
authRouter.get('/me', authenticate, currentUser)
authRouter.post('/logout', logout)

export default authRouter
