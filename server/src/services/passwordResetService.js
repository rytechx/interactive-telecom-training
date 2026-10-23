import { createHash, createHmac, randomBytes, randomInt } from 'node:crypto'
import environment from '../config/environment.js'
import HttpError from '../utils/HttpError.js'
import { hashPassword } from '../utils/passwordSecurity.js'
import { sendPasswordResetOtpEmail } from './emailService.js'
import passwordResetRepository, {
  OTP_CREATION_STATUSES,
  OTP_VERIFICATION_STATUSES,
} from './passwordResetRepository.js'

const FORGOT_PASSWORD_PUBLIC_MESSAGE =
  'If an account exists for that email address, a verification code has been sent.'
const INVALID_OTP_MESSAGE =
  'This verification code is invalid or has expired.'
const ATTEMPTS_EXHAUSTED_MESSAGE =
  'Too many incorrect attempts. Please request a new verification code.'
const INVALID_RESET_AUTHORIZATION_MESSAGE =
  'This password reset authorization is invalid or has expired.'
const STAFF_ROLES = new Set(['instructor', 'admin'])

function generateResetOtp() {
  return randomInt(0, 1_000_000).toString().padStart(6, '0')
}

function generateResetAuthorization() {
  return randomBytes(32).toString('base64url')
}

function hashResetOtp(email, otp, secret = environment.jwtSecret) {
  return createHmac('sha256', secret)
    .update(`password-reset-otp:${email}:${otp}`)
    .digest('hex')
}

function hashResetAuthorization(token) {
  return createHash('sha256').update(token).digest('hex')
}

function createPasswordResetService({
  configuration = environment.passwordReset,
  otpHashSecret = environment.jwtSecret,
  repository = passwordResetRepository,
  sendOtpEmail = sendPasswordResetOtpEmail,
  passwordHasher = hashPassword,
  otpFactory = generateResetOtp,
  resetAuthorizationFactory = generateResetAuthorization,
  clock = () => new Date(),
  logger = console,
} = {}) {
  async function requestPasswordReset(email) {
    if (!configuration.enabled) {
      return { message: FORGOT_PASSWORD_PUBLIC_MESSAGE }
    }

    const otp = otpFactory()
    const createdAt = clock()
    const result = await repository.createPasswordResetOtp({
      email,
      otpHash: hashResetOtp(email, otp, otpHashSecret),
      expiresAt: new Date(
        createdAt.getTime() + configuration.otpTtlMinutes * 60 * 1000,
      ),
      createdAt,
      cooldownCutoff: new Date(
        createdAt.getTime() - configuration.cooldownSeconds * 1000,
      ),
      maxAttempts: configuration.maxAttempts,
    })

    if (result.status !== OTP_CREATION_STATUSES.CREATED) {
      return { message: FORGOT_PASSWORD_PUBLIC_MESSAGE }
    }

    try {
      await sendOtpEmail({
        to: result.account.email,
        otp,
        expiresInMinutes: configuration.otpTtlMinutes,
        maxAttempts: configuration.maxAttempts,
      })
    } catch (error) {
      try {
        await repository.discardPasswordResetOtp(result.requestId)
      } catch (discardError) {
        logger.error('Password reset OTP invalidation failed.', {
          code: discardError.code ?? 'PASSWORD_RESET_OTP_INVALIDATION_ERROR',
        })
      }

      logger.error('Password reset OTP delivery failed.', {
        code: error.code ?? 'PASSWORD_RESET_EMAIL_ERROR',
      })
    }

    return { message: FORGOT_PASSWORD_PUBLIC_MESSAGE }
  }

  async function verifyResetOtp({ email, otp }) {
    if (!configuration.enabled) {
      throw new HttpError(
        503,
        'Password reset is currently unavailable.',
        'PASSWORD_RESET_UNAVAILABLE',
      )
    }

    const now = clock()
    const resetAuthorization = resetAuthorizationFactory()
    const result = await repository.verifyPasswordResetOtp({
      email,
      otpHash: hashResetOtp(email, otp, otpHashSecret),
      resetTokenHash: hashResetAuthorization(resetAuthorization),
      resetTokenExpiresAt: new Date(
        now.getTime() + configuration.otpTtlMinutes * 60 * 1000,
      ),
      now,
    })

    if (result.status === OTP_VERIFICATION_STATUSES.VERIFIED) {
      return { resetAuthorization }
    }

    if (result.status === OTP_VERIFICATION_STATUSES.INCORRECT) {
      const attemptWord = result.attemptsRemaining === 1 ? 'attempt' : 'attempts'

      throw new HttpError(
        400,
        `Incorrect verification code. ${result.attemptsRemaining} ${attemptWord} remaining.`,
        'INCORRECT_RESET_OTP',
        { attemptsRemaining: result.attemptsRemaining },
      )
    }

    if (result.status === OTP_VERIFICATION_STATUSES.ATTEMPTS_EXHAUSTED) {
      throw new HttpError(
        400,
        ATTEMPTS_EXHAUSTED_MESSAGE,
        'RESET_OTP_ATTEMPTS_EXHAUSTED',
        { attemptsRemaining: 0 },
      )
    }

    throw new HttpError(400, INVALID_OTP_MESSAGE, 'INVALID_RESET_OTP')
  }

  async function resetPassword({ resetAuthorization, password }) {
    if (!configuration.enabled) {
      throw new HttpError(
        503,
        'Password reset is currently unavailable.',
        'PASSWORD_RESET_UNAVAILABLE',
      )
    }

    const passwordHash = await passwordHasher(password)
    const result = await repository.resetPasswordWithAuthorization({
      resetTokenHash: hashResetAuthorization(resetAuthorization),
      passwordHash,
      now: clock(),
    })

    if (!result) {
      throw new HttpError(
        400,
        INVALID_RESET_AUTHORIZATION_MESSAGE,
        'INVALID_RESET_AUTHORIZATION',
      )
    }

    return {
      loginPortal: STAFF_ROLES.has(result.role) ? 'staff' : 'student',
    }
  }

  return Object.freeze({
    requestPasswordReset,
    resetPassword,
    verifyResetOtp,
  })
}

const passwordResetService = createPasswordResetService()

export {
  ATTEMPTS_EXHAUSTED_MESSAGE,
  createPasswordResetService,
  FORGOT_PASSWORD_PUBLIC_MESSAGE,
  generateResetAuthorization,
  generateResetOtp,
  hashResetAuthorization,
  hashResetOtp,
  INVALID_OTP_MESSAGE,
  INVALID_RESET_AUTHORIZATION_MESSAGE,
}
export const requestPasswordReset = passwordResetService.requestPasswordReset
export const resetPassword = passwordResetService.resetPassword
export const verifyResetOtp = passwordResetService.verifyResetOtp
