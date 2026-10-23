import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, authApi } from '../api/apiClient.js'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import PasswordField from '../components/auth/PasswordField.jsx'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OTP_PATTERN = /^\d{6}$/
const RESEND_COOLDOWN_SECONDS = 60

const STEP_CONTENT = Object.freeze({
  email: {
    eyebrow: 'Account Recovery',
    title: 'Forgot your password?',
    description: 'Enter the email address associated with your TeleSim account.',
  },
  otp: {
    eyebrow: 'Email Verification',
    title: 'Enter verification code',
    description: 'Enter the 6-digit code sent to your email address.',
  },
  password: {
    eyebrow: 'Secure Password Reset',
    title: 'Create a new password',
    description: 'Choose a new password for your TeleSim account.',
  },
})

function validateNewPassword(values) {
  const errors = {}

  if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  } else if (new TextEncoder().encode(values.password).length > 72) {
    errors.password = 'Password must be 72 bytes or fewer.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your new password.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isStaffPortal = searchParams.get('portal') === 'staff'
  const loginPath = isStaffPortal ? '/staff/login' : '/login'
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: '',
  })
  const [resetAuthorization, setResetAuthorization] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [requestError, setRequestError] = useState(null)
  const [statusMessage, setStatusMessage] = useState(null)
  const [attemptsRemaining, setAttemptsRemaining] = useState(3)
  const [verificationLocked, setVerificationLocked] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (cooldownSeconds <= 0) return undefined

    const timer = window.setInterval(() => {
      setCooldownSeconds((seconds) => Math.max(0, seconds - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [cooldownSeconds])

  const clearFeedback = () => {
    setFieldErrors({})
    setRequestError(null)
    setStatusMessage(null)
  }

  const requestCode = async () => {
    const normalizedEmail = email.trim().toLowerCase()

    clearFeedback()

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setFieldErrors({ email: 'Enter a valid email address.' })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await authApi.requestPasswordReset(normalizedEmail)

      setEmail(normalizedEmail)
      setOtp('')
      setAttemptsRemaining(3)
      setVerificationLocked(false)
      setResetAuthorization(null)
      setStatusMessage(response.message)
      setCooldownSeconds(RESEND_COOLDOWN_SECONDS)
      setStep('otp')
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(error.errors ?? {})
        setRequestError(error.message)
      } else {
        setRequestError('The verification code request could not be completed.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitEmail = async (event) => {
    event.preventDefault()
    await requestCode()
  }

  const submitOtp = async (event) => {
    event.preventDefault()
    clearFeedback()

    if (!OTP_PATTERN.test(otp)) {
      setFieldErrors({ otp: 'Enter the 6-digit verification code.' })
      return
    }

    if (verificationLocked) return

    setIsSubmitting(true)

    try {
      const response = await authApi.verifyPasswordResetOtp({ email, otp })

      setResetAuthorization(response.data?.resetAuthorization ?? null)
      setOtp('')
      setStatusMessage(response.message)
      setStep('password')
    } catch (error) {
      if (error instanceof ApiError) {
        const remaining = error.data?.attemptsRemaining

        if (Number.isInteger(remaining)) {
          setAttemptsRemaining(remaining)
        }
        if (
          error.code === 'RESET_OTP_ATTEMPTS_EXHAUSTED' ||
          error.code === 'INVALID_RESET_OTP' ||
          remaining === 0
        ) {
          setVerificationLocked(true)
        }
        setFieldErrors(error.errors ?? {})
        setRequestError(error.message)
      } else {
        setRequestError('The verification code could not be confirmed.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitPassword = async (event) => {
    event.preventDefault()
    const validationErrors = validateNewPassword(passwords)

    clearFeedback()

    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await authApi.resetPassword({
        resetAuthorization,
        password: passwords.password,
        confirmPassword: passwords.confirmPassword,
      })
      const destination = response.data?.loginPortal === 'staff'
        ? '/staff/login'
        : '/login'

      navigate(destination, {
        replace: true,
        state: {
          message:
            'Your password has been reset successfully. You can now sign in.',
          messageType: 'success',
        },
      })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'INVALID_RESET_AUTHORIZATION') {
          setResetAuthorization(null)
          setVerificationLocked(true)
          setStep('otp')
        }
        setFieldErrors(error.errors ?? {})
        setRequestError(error.message)
      } else {
        setRequestError('The password reset could not be completed.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resendCode = async () => {
    if (cooldownSeconds > 0 || isSubmitting) return
    await requestCode()
  }

  const useDifferentEmail = () => {
    clearFeedback()
    setOtp('')
    setResetAuthorization(null)
    setVerificationLocked(false)
    setStep('email')
  }

  const updatePassword = (fieldName) => (event) => {
    setPasswords((current) => ({
      ...current,
      [fieldName]: event.target.value,
    }))
    setFieldErrors((current) => ({ ...current, [fieldName]: null }))
    setRequestError(null)
  }

  const content = STEP_CONTENT[step]

  return (
    <AuthLayout
      variant={isStaffPortal ? 'staff' : 'student'}
      eyebrow={content.eyebrow}
      title={content.title}
      description={content.description}
      footer={(
        <p>
          <Link to={loginPath}>
            {'\u2190'} Back to {isStaffPortal ? 'Staff' : 'Student'} Login
          </Link>
        </p>
      )}
    >
      {statusMessage && (
        <div className="auth-message is-success" role="status">
          {statusMessage}
        </div>
      )}

      {requestError && (
        <div className="auth-message is-error" role="alert">
          {requestError}
        </div>
      )}

      {step === 'email' && (
        <form className="auth-form" onSubmit={submitEmail} noValidate>
          <div className="auth-field">
            <label htmlFor="recoveryEmail">Email Address</label>
            <input
              id="recoveryEmail"
              name="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setFieldErrors({})
                setRequestError(null)
              }}
              autoComplete="email"
              required
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'recovery-email-error' : undefined}
              autoFocus
            />
            {fieldErrors.email && (
              <span
                id="recovery-email-error"
                className="auth-field-error"
                role="alert"
              >
                {fieldErrors.email}
              </span>
            )}
          </div>

          <button
            className="auth-submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Verification Code'}
            <span aria-hidden="true">{'\u2192'}</span>
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form className="auth-form" onSubmit={submitOtp} noValidate>
          <p className="auth-recovery-email">
            Code requested for <strong>{email}</strong>
          </p>

          <div className="auth-field auth-otp-field">
            <label htmlFor="resetOtp">6-Digit Verification Code</label>
            <input
              id="resetOtp"
              name="otp"
              type="text"
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
                setFieldErrors((current) => ({ ...current, otp: null }))
                setRequestError(null)
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              disabled={verificationLocked}
              aria-invalid={Boolean(fieldErrors.otp)}
              aria-describedby={fieldErrors.otp ? 'reset-otp-error' : 'reset-otp-help'}
              autoFocus
            />
            <small id="reset-otp-help">
              {verificationLocked
                ? 'Request a new code to continue.'
                : `${attemptsRemaining} verification attempts available.`}
            </small>
            {fieldErrors.otp && (
              <span id="reset-otp-error" className="auth-field-error" role="alert">
                {fieldErrors.otp}
              </span>
            )}
          </div>

          <button
            className="auth-submit-button"
            type="submit"
            disabled={isSubmitting || verificationLocked}
          >
            {isSubmitting ? 'Verifying...' : 'Verify Code'}
            <span aria-hidden="true">{'\u2192'}</span>
          </button>

          <div className="auth-recovery-actions">
            <button type="button" onClick={useDifferentEmail}>
              Use a different email
            </button>
            <button
              type="button"
              onClick={resendCode}
              disabled={cooldownSeconds > 0 || isSubmitting}
            >
              {cooldownSeconds > 0
                ? `Resend code in ${cooldownSeconds}s`
                : verificationLocked
                  ? 'Request New Code'
                  : 'Resend Code'}
            </button>
          </div>
        </form>
      )}

      {step === 'password' && (
        <form className="auth-form" onSubmit={submitPassword} noValidate>
          <PasswordField
            id="newPassword"
            label="New Password"
            value={passwords.password}
            onChange={updatePassword('password')}
            error={fieldErrors.password}
            hint="Use at least 8 characters and no more than 72 bytes."
            autoComplete="new-password"
          />

          <PasswordField
            id="confirmNewPassword"
            label="Confirm New Password"
            value={passwords.confirmPassword}
            onChange={updatePassword('confirmPassword')}
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
          />

          <button
            className="auth-submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
            <span aria-hidden="true">{'\u2192'}</span>
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
