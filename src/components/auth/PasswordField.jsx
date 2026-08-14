import { useState } from 'react'

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  autoComplete,
}) {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const hintId = hint ? `${id}-hint` : null
  const errorId = error ? `${id}-error` : null
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-input-wrap">
        <input
          id={id}
          name={id}
          type={passwordVisible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
        <button
          type="button"
          onClick={() => setPasswordVisible((visible) => !visible)}
          aria-label={`${passwordVisible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
        >
          {passwordVisible ? 'Hide' : 'Show'}
        </button>
      </div>
      {hint && <small id={hintId}>{hint}</small>}
      {error && <span id={errorId} className="auth-field-error">{error}</span>}
    </div>
  )
}
