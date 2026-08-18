const platformCapabilities = Object.freeze([
  'Browser-Based',
  'Interactive 3D Lab',
  'Guided Procedures',
  'Assessment & Scoring',
  'Progress Tracking',
  'Role-Based Access',
])

export default function LandingStatusStrip() {
  return (
    <section className="landing-status-strip" aria-label="Platform capabilities">
      <div className="landing-container">
        <span className="landing-status-label">
          <i /> Platform Ready
        </span>
        <div>
          {platformCapabilities.map((capability) => (
            <span key={capability}>{capability}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
