export default function InstructorLoadingState({ label = 'Loading analytics...' }) {
  return (
    <section className="instructor-state-panel" aria-busy="true">
      <span className="instructor-loading-pulse" aria-hidden="true" />
      <strong>{label}</strong>
    </section>
  )
}
