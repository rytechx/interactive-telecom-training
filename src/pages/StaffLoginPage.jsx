import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import PasswordField from '../components/auth/PasswordField.jsx'
import useAuthStore from '../store/useAuthStore.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateStaffLogin(values) {
  const errors = {}

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter your staff email address.'
  }
  if (!values.password) {
    errors.password = 'Password is required.'
  }

  return errors
}

export default function StaffLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const staffLogin = useAuthStore((state) => state.staffLogin)
  const isLoading = useAuthStore((state) => state.isLoading)
  const authError = useAuthStore((state) => state.authError)
  const clearAuthError = useAuthStore((state) => state.clearAuthError)
  const [values, setValues] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(
    () => () => {
      clearAuthError()
    },
    [clearAuthError],
  )

  const updateField = (fieldName) => (event) => {
    setValues((current) => ({
      ...current,
      [fieldName]: event.target.value,
    }))
    setFieldErrors((current) => ({ ...current, [fieldName]: null }))
    clearAuthError()
  }

  const submitLogin = async (event) => {
    event.preventDefault()
    const validationErrors = validateStaffLogin(values)

    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors)
      return
    }

    const result = await staffLogin({
      email: values.email.trim(),
      password: values.password,
    })

    if (!result.success) {
      setFieldErrors(result.errors)
      return
    }

    navigate('/instructor', { replace: true })
  }

  return (
    <AuthLayout
      variant="staff"
      eyebrow="STAFF PORTAL"
      title="Instructor / Administrator Access"
      description="Sign in with an authorized staff account to continue to the TeleSim management workspace."
      footer={(
        <p>
          <Link to="/login">{'\u2190'} Back to Student Login</Link>
        </p>
      )}
    >
      {location.state?.message && (
        <div className="auth-message is-error" role="alert">
          {location.state.message}
        </div>
      )}
      {authError && (
        <div className="auth-message is-error" role="alert">
          {authError}
        </div>
      )}

      <form className="auth-form" onSubmit={submitLogin} noValidate>
        <div className="auth-field">
          <label htmlFor="staffEmail">Email</label>
          <input
            id="staffEmail"
            name="email"
            type="email"
            value={values.email}
            onChange={updateField('email')}
            autoComplete="username"
            required
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'staff-email-error' : undefined}
            autoFocus
          />
          {fieldErrors.email && (
            <span id="staff-email-error" className="auth-field-error">
              {fieldErrors.email}
            </span>
          )}
        </div>

        <PasswordField
          id="staffPassword"
          label="Password"
          value={values.password}
          onChange={updateField('password')}
          error={fieldErrors.password}
          autoComplete="current-password"
        />

        <button className="auth-submit-button" type="submit" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In to Staff Portal'}
          <span aria-hidden="true">{'\u2192'}</span>
        </button>
      </form>
    </AuthLayout>
  )
}
