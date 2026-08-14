import { useEffect, useState } from 'react'
import PasswordField from '../auth/PasswordField.jsx'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const initialValues = Object.freeze({
  firstName: '',
  lastName: '',
  email: '',
  role: 'instructor',
  password: '',
  confirmPassword: '',
})

function validateForm(values) {
  const errors = {}

  if (!values.firstName.trim()) errors.firstName = 'First name is required.'
  if (!values.lastName.trim()) errors.lastName = 'Last name is required.'
  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }
  if (values.password.length < 12) {
    errors.password = 'Temporary password must be at least 12 characters.'
  } else if (new TextEncoder().encode(values.password).length > 72) {
    errors.password = 'Temporary password must be 72 bytes or fewer.'
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm the temporary password.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export default function AdminCreateStaffDialog({
  isOpen,
  ...dialogProps
}) {
  if (!isOpen) return null

  return <AdminCreateStaffDialogContent {...dialogProps} />
}

function AdminCreateStaffDialogContent({
  isLoading,
  onCancel,
  onCreated,
  onSubmit,
}) {
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && !isLoading) {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isLoading, onCancel])

  const updateField = (fieldName) => (event) => {
    setValues((current) => ({ ...current, [fieldName]: event.target.value }))
    setFieldErrors((current) => ({ ...current, [fieldName]: null }))
    setSubmitError(null)
  }

  const submitForm = async (event) => {
    event.preventDefault()
    const validationErrors = validateForm(values)

    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors)
      return
    }

    const result = await onSubmit({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      role: values.role,
      password: values.password,
    })

    if (!result.success) {
      setFieldErrors(result.errors)
      setSubmitError(result.message)
      return
    }

    onCreated(result.user)
  }

  return (
    <div className="admin-confirm-backdrop" role="presentation">
      <section
        className="admin-confirm-dialog admin-create-staff-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-staff-title"
      >
        <span>Administrator Action</span>
        <h2 id="create-staff-title">Create Staff Account</h2>
        <p>Create an instructor or administrator login. No student number is assigned.</p>

        {submitError && <div className="admin-dialog-error" role="alert">{submitError}</div>}

        <form className="admin-create-staff-form" onSubmit={submitForm} noValidate>
          <div className="auth-field">
            <label htmlFor="staffFirstName">First Name</label>
            <input
              id="staffFirstName"
              value={values.firstName}
              onChange={updateField('firstName')}
              autoComplete="given-name"
              required
              autoFocus
              aria-invalid={Boolean(fieldErrors.firstName)}
              aria-describedby={fieldErrors.firstName ? 'staff-first-name-error' : undefined}
            />
            {fieldErrors.firstName && <span id="staff-first-name-error" className="auth-field-error">{fieldErrors.firstName}</span>}
          </div>
          <div className="auth-field">
            <label htmlFor="staffLastName">Last Name</label>
            <input
              id="staffLastName"
              value={values.lastName}
              onChange={updateField('lastName')}
              autoComplete="family-name"
              required
              aria-invalid={Boolean(fieldErrors.lastName)}
              aria-describedby={fieldErrors.lastName ? 'staff-last-name-error' : undefined}
            />
            {fieldErrors.lastName && <span id="staff-last-name-error" className="auth-field-error">{fieldErrors.lastName}</span>}
          </div>
          <div className="auth-field field-full">
            <label htmlFor="newStaffEmail">Email</label>
            <input
              id="newStaffEmail"
              type="email"
              value={values.email}
              onChange={updateField('email')}
              autoComplete="off"
              required
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'new-staff-email-error' : undefined}
            />
            {fieldErrors.email && <span id="new-staff-email-error" className="auth-field-error">{fieldErrors.email}</span>}
          </div>
          <div className="auth-field field-full">
            <label htmlFor="newStaffRole">Role</label>
            <select
              id="newStaffRole"
              value={values.role}
              onChange={updateField('role')}
            >
              <option value="instructor">Instructor</option>
              <option value="admin">Administrator</option>
            </select>
            {fieldErrors.role && <span className="auth-field-error">{fieldErrors.role}</span>}
          </div>
          <PasswordField
            id="temporaryPassword"
            label="Temporary Password"
            value={values.password}
            onChange={updateField('password')}
            error={fieldErrors.password}
            hint="At least 12 characters. Share it securely."
            autoComplete="new-password"
          />
          <PasswordField
            id="confirmTemporaryPassword"
            label="Confirm Password"
            value={values.confirmPassword}
            onChange={updateField('confirmPassword')}
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
          />
          <div className="admin-create-staff-actions field-full">
            <button type="button" onClick={onCancel} disabled={isLoading}>Cancel</button>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
