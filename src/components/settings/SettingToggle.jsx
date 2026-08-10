export default function SettingToggle({
  id,
  label,
  description,
  checked,
  disabled = false,
  onChange,
}) {
  return (
    <label className={`settings-toggle-row${disabled ? ' is-disabled' : ''}`} htmlFor={id}>
      <span className="settings-toggle-copy">
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <span className="settings-toggle-control">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
        />
        <span aria-hidden="true"><i /></span>
        <b>{disabled ? 'Planned' : checked ? 'On' : 'Off'}</b>
      </span>
    </label>
  )
}
