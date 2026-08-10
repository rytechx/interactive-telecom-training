export default function InstructorStatePanel({
  title,
  message,
  actionLabel = 'Retry',
  onAction,
}) {
  return (
    <section className="instructor-state-panel" role="alert">
      <strong>{title}</strong>
      <p>{message}</p>
      {onAction && (
        <button type="button" onClick={onAction}>{actionLabel}</button>
      )}
    </section>
  )
}
