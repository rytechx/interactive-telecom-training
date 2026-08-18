import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import PasswordField from '../components/auth/PasswordField.jsx'
import useAuthStore from '../store/useAuthStore.js'

function validateLoginForm(values) {
  const errors = {}

  if (!values.identifier.trim()) {
    errors.identifier = 'Email or student number is required.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  }

  return errors
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const isLoading = useAuthStore((state) => state.isLoading)
  const authError = useAuthStore((state) => state.authError)
  const clearAuthError = useAuthStore((state) => state.clearAuthError)
  const [values, setValues] = useState({ identifier: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(
    () => () => {
      clearAuthError()
    },
    [clearAuthError],
  )

  const updateField = (fieldName) => (event) => {
    setValues((currentValues) => ({
      ...currentValues,
      [fieldName]: event.target.value,
    }))
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: null,
    }))
    clearAuthError()
  }

  const submitLogin = async (event) => {
    event.preventDefault()
    const validationErrors = validateLoginForm(values)

    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors)
      return
    }

    const result = await login({
      identifier: values.identifier.trim(),
      password: values.password,
    })

    if (!result.success) {
      setFieldErrors(result.errors)
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <AuthLayout
      eyebrow="Student Login"
      title="Sign in to TeleSim"
      description="Continue to your student dashboard and practical training modules."
      footer={
        <div className="student-login-links">
          <p>New to TeleSim? <Link to="/register">Create Student Account</Link></p>
          <p className="auth-staff-link">Instructor or Administrator? <Link to="/staff/login">Staff Login</Link></p>
        </div>
      }
    >
      {location.state?.message && (
        <div
          className={`auth-message ${
            location.state.messageType === 'error' ? 'is-error' : 'is-success'
          }`}
          role={location.state.messageType === 'error' ? 'alert' : 'status'}
        >
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
          <label htmlFor="identifier">Email or Student Number</label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            value={values.identifier}
            onChange={updateField('identifier')}
            autoComplete="username"
            required
            aria-invalid={Boolean(fieldErrors.identifier)}
            aria-describedby={fieldErrors.identifier ? 'identifier-error' : undefined}
            autoFocus
          />
          {fieldErrors.identifier && (
            <span id="identifier-error" className="auth-field-error" role="alert">
              {fieldErrors.identifier}
            </span>
          )}
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={values.password}
          onChange={updateField('password')}
          error={fieldErrors.password}
          autoComplete="current-password"
        />

        <button className="auth-submit-button" type="submit" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
          <span aria-hidden="true">→</span>
        </button>
      </form>
    </AuthLayout>
  )
}
