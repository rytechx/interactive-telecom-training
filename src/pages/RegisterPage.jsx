import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import PasswordField from '../components/auth/PasswordField.jsx'
import useAuthStore from '../store/useAuthStore.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STUDENT_NUMBER_PATTERN = /^[A-Za-z0-9-]+$/

function validateRegistrationForm(values) {
  const errors = {}
  const studentNumber = values.studentNumber.trim()
  const email = values.email.trim()

  if (
    studentNumber.length < 4 ||
    studentNumber.length > 32 ||
    !STUDENT_NUMBER_PATTERN.test(studentNumber)
  ) {
    errors.studentNumber =
      'Use 4 to 32 letters, numbers, or hyphens.'
  }

  if (!values.firstName.trim()) {
    errors.firstName = 'First name is required.'
  }

  if (!values.lastName.trim()) {
    errors.lastName = 'Last name is required.'
  }

  if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)
  const isLoading = useAuthStore((state) => state.isLoading)
  const authError = useAuthStore((state) => state.authError)
  const clearAuthError = useAuthStore((state) => state.clearAuthError)
  const [values, setValues] = useState({
    studentNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
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

  const submitRegistration = async (event) => {
    event.preventDefault()
    const validationErrors = validateRegistrationForm(values)

    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors)
      return
    }

    const result = await register(values)

    if (!result.success) {
      setFieldErrors(result.errors)
      return
    }

    navigate('/login', {
      replace: true,
      state: {
        message: result.message || 'Account created successfully. Please sign in.',
      },
    })
  }

  return (
    <AuthLayout
      eyebrow="Student Registration"
      title="Create your account"
      description="Register for secure access to TeleSim practical modules and future training records."
      footer={
        <p>
          Already registered? <Link to="/login">Sign In</Link>
        </p>
      }
    >
      {authError && (
        <div className="auth-message is-error" role="alert">
          {authError}
        </div>
      )}

      <form className="auth-form registration-form" onSubmit={submitRegistration} noValidate>
        <div className="auth-field field-full">
          <label htmlFor="studentNumber">Student Number</label>
          <input
            id="studentNumber"
            name="studentNumber"
            type="text"
            value={values.studentNumber}
            onChange={updateField('studentNumber')}
            autoComplete="off"
            required
            aria-invalid={Boolean(fieldErrors.studentNumber)}
            aria-describedby={fieldErrors.studentNumber ? 'student-number-error' : undefined}
            autoFocus
          />
          {fieldErrors.studentNumber && (
            <span id="student-number-error" className="auth-field-error">
              {fieldErrors.studentNumber}
            </span>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={values.firstName}
            onChange={updateField('firstName')}
            autoComplete="given-name"
            required
            aria-invalid={Boolean(fieldErrors.firstName)}
          />
          {fieldErrors.firstName && (
            <span className="auth-field-error">{fieldErrors.firstName}</span>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={values.lastName}
            onChange={updateField('lastName')}
            autoComplete="family-name"
            required
            aria-invalid={Boolean(fieldErrors.lastName)}
          />
          {fieldErrors.lastName && (
            <span className="auth-field-error">{fieldErrors.lastName}</span>
          )}
        </div>

        <div className="auth-field field-full">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={updateField('email')}
            autoComplete="email"
            required
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          />
          {fieldErrors.email && (
            <span id="email-error" className="auth-field-error">
              {fieldErrors.email}
            </span>
          )}
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={values.password}
          onChange={updateField('password')}
          error={fieldErrors.password}
          hint="At least 8 characters."
          autoComplete="new-password"
        />

        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          value={values.confirmPassword}
          onChange={updateField('confirmPassword')}
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
        />

        <button className="auth-submit-button field-full" type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Student Account'}
          <span aria-hidden="true">→</span>
        </button>
      </form>
    </AuthLayout>
  )
}
