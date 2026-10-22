export default function TrainingErrorFeedback({ message }) {
  if (!message) {
    return null
  }

  return (
    <aside className="training-error-feedback" role="alert" aria-live="assertive">
      <span className="training-error-feedback-label">
        <i aria-hidden="true" />
        Incorrect Action
      </span>
      <p>{message}</p>
    </aside>
  )
}
