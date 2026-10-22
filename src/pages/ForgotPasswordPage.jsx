import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError, authApi } from '../api/apiClient.js'
import AuthLayout from '../components/auth/AuthLayout.jsx'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordPage() {
  const [searchParams] = useSearchParams()
  const isStaffPortal = searchParams.get('portal') === 'staff'
  const loginPath = isStaffPortal ? '/staff/login' : '/login'
  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState(null)
  const [requestError, setRequestError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitRequest = async (event) => {
    event.preventDefault()
    const normalizedEmail = email.trim()

    setFieldError(null)
    setRequestError(null)

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setFieldError('Enter a valid email address.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await authApi.requestPasswordReset(normalizedEmail)
      setSuccessMessage(response.message)
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldError(error.errors?.email ?? null)
        setRequestError(error.message)
      } else {
        setRequestError('The password reset request could not be completed.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      variant={isStaffPortal ? 'staff' : 'student'}
      eyebrow="Account Recovery"
      title="Forgot your password?"
      description="Enter the email address associated with your TeleSim account."
      footer={(
        <p>
          <Link to={loginPath}>
            {'\u2190'} Back to {isStaffPortal ? 'Staff' : 'Student'} Login
          </Link>
        </p>
      )}
    >
      {successMessage ? (
        <div className="auth-message is-success" role="status">
          {successMessage}
        </div>
      ) : (
        <>
          {requestError && (
            <div className="auth-message is-error" role="alert">
              {requestError}
            </div>
          )}

          <form className="auth-form" onSubmit={submitRequest} noValidate>
            <div className="auth-field">
              <label htmlFor="resetEmail">Email Address</label>
              <input
                id="resetEmail"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setFieldError(null)
                  setRequestError(null)
                }}
                autoComplete="email"
                required
                aria-invalid={Boolean(fieldError)}
                aria-describedby={fieldError ? 'reset-email-error' : undefined}
                autoFocus
              />
              {fieldError && (
                <span
                  id="reset-email-error"
                  className="auth-field-error"
                  role="alert"
                >
                  {fieldError}
                </span>
              )}
            </div>

            <button
              className="auth-submit-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              <span aria-hidden="true">{'\u2192'}</span>
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  )
}
