import { createHash, randomBytes } from 'node:crypto'
import environment from '../config/environment.js'
import HttpError from '../utils/HttpError.js'
import { hashPassword } from '../utils/passwordSecurity.js'
import { sendPasswordResetEmail } from './emailService.js'
import passwordResetRepository, {
  TOKEN_CREATION_STATUSES,
} from './passwordResetRepository.js'

const FORGOT_PASSWORD_PUBLIC_MESSAGE =
  'If an account exists for that email address, password reset instructions have been sent.'
const INVALID_RESET_TOKEN_MESSAGE =
  'This password reset link is invalid or has expired.'
const STAFF_ROLES = new Set(['instructor', 'admin'])

function hashResetToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

function generateResetToken() {
  return randomBytes(32).toString('base64url')
}

function createPasswordResetService({
  configuration = environment.passwordReset,
  clientOrigin = environment.clientOrigin,
  repository = passwordResetRepository,
  sendResetEmail = sendPasswordResetEmail,
  passwordHasher = hashPassword,
  tokenFactory = generateResetToken,
  clock = () => new Date(),
  logger = console,
} = {}) {
  async function requestPasswordReset(email) {
    if (!configuration.enabled) {
      return { message: FORGOT_PASSWORD_PUBLIC_MESSAGE }
    }

    const rawToken = tokenFactory()
    const tokenHash = hashResetToken(rawToken)
    const createdAt = clock()
    const expiresAt = new Date(
      createdAt.getTime() + configuration.ttlMinutes * 60 * 1000,
    )
    const cooldownCutoff = new Date(
      createdAt.getTime() - configuration.cooldownSeconds * 1000,
    )
    const result = await repository.createPasswordResetToken({
      email,
      tokenHash,
      expiresAt,
      createdAt,
      cooldownCutoff,
    })

    if (result.status !== TOKEN_CREATION_STATUSES.CREATED) {
      return { message: FORGOT_PASSWORD_PUBLIC_MESSAGE }
    }

    const resetUrl = new URL('/reset-password', clientOrigin)
    resetUrl.searchParams.set('token', rawToken)

    if (STAFF_ROLES.has(result.account.role)) {
      resetUrl.searchParams.set('portal', 'staff')
    }

    try {
      await sendResetEmail({
        to: result.account.email,
        resetUrl: resetUrl.toString(),
        expiresInMinutes: configuration.ttlMinutes,
      })
    } catch (error) {
      try {
        await repository.invalidatePasswordResetToken(tokenHash, clock())
      } catch (invalidationError) {
        logger.error('Password reset token invalidation failed.', {
          code: invalidationError.code ?? 'PASSWORD_RESET_TOKEN_INVALIDATION_ERROR',
        })
      }

      logger.error('Password reset email delivery failed.', {
        code: error.code ?? 'PASSWORD_RESET_EMAIL_ERROR',
      })
    }

    return { message: FORGOT_PASSWORD_PUBLIC_MESSAGE }
  }

  async function resetPassword({ token, password }) {
    if (!configuration.enabled) {
      throw new HttpError(
        503,
        'Password reset is currently unavailable.',
        'PASSWORD_RESET_UNAVAILABLE',
      )
    }

    const tokenHash = hashResetToken(token)
    const passwordHash = await passwordHasher(password)
    const result = await repository.resetPasswordWithToken({
      tokenHash,
      passwordHash,
      now: clock(),
    })

    if (!result) {
      throw new HttpError(
        400,
        INVALID_RESET_TOKEN_MESSAGE,
        'INVALID_PASSWORD_RESET_TOKEN',
      )
    }

    return {
      loginPortal: STAFF_ROLES.has(result.role) ? 'staff' : 'student',
    }
  }

  return Object.freeze({ requestPasswordReset, resetPassword })
}

const passwordResetService = createPasswordResetService()

export {
  createPasswordResetService,
  FORGOT_PASSWORD_PUBLIC_MESSAGE,
  generateResetToken,
  hashResetToken,
  INVALID_RESET_TOKEN_MESSAGE,
}
export const requestPasswordReset = passwordResetService.requestPasswordReset
export const resetPassword = passwordResetService.resetPassword
