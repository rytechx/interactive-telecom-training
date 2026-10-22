import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, authApi } from '../api/apiClient.js'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import PasswordField from '../components/auth/PasswordField.jsx'

const PASSWORD_RESET_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

function validatePasswordReset(values) {
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

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const isStaffPortal = searchParams.get('portal') === 'staff'
  const fallbackLoginPath = isStaffPortal ? '/staff/login' : '/login'
  const tokenIsValid = PASSWORD_RESET_TOKEN_PATTERN.test(token)
  const [values, setValues] = useState({
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [requestError, setRequestError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (fieldName) => (event) => {
    setValues((current) => ({
      ...current,
      [fieldName]: event.target.value,
    }))
    setFieldErrors((current) => ({ ...current, [fieldName]: null }))
    setRequestError(null)
  }

  const submitReset = async (event) => {
    event.preventDefault()
    const validationErrors = validatePasswordReset(values)

    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setRequestError(null)

    try {
      const response = await authApi.resetPassword({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      })
      const loginPath = response.data?.loginPortal === 'staff'
        ? '/staff/login'
        : '/login'

      navigate(loginPath, {
        replace: true,
        state: {
          message:
            'Your password has been reset successfully. You can now sign in.',
          messageType: 'success',
        },
      })
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(error.errors ?? {})
        setRequestError(error.message)
      } else {
        setRequestError('The password reset could not be completed.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      variant={isStaffPortal ? 'staff' : 'student'}
      eyebrow="Secure Password Reset"
      title="Create a new password"
      description="Choose a new password for your TeleSim account."
      footer={(
        <p>
          <Link to={fallbackLoginPath}>
            {'\u2190'} Back to {isStaffPortal ? 'Staff' : 'Student'} Login
          </Link>
        </p>
      )}
    >
      {!tokenIsValid ? (
        <div className="auth-message is-error" role="alert">
          This password reset link is invalid or has expired.
        </div>
      ) : (
        <>
          {requestError && (
            <div className="auth-message is-error" role="alert">
              {requestError}
            </div>
          )}

          <form className="auth-form" onSubmit={submitReset} noValidate>
            <PasswordField
              id="newPassword"
              label="New Password"
              value={values.password}
              onChange={updateField('password')}
              error={fieldErrors.password}
              hint="Use 8 to 72 bytes."
              autoComplete="new-password"
            />

            <PasswordField
              id="confirmNewPassword"
              label="Confirm New Password"
              value={values.confirmPassword}
              onChange={updateField('confirmPassword')}
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
        </>
      )}
    </AuthLayout>
  )
}
