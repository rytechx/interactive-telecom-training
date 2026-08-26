const maintenanceServices = Object.freeze([
  Object.freeze({ label: 'Web Platform', status: 'Maintenance' }),
  Object.freeze({ label: 'Training Lab', status: 'Temporarily Unavailable' }),
  Object.freeze({ label: 'User Access', status: 'Paused' }),
])

export default function MaintenancePage() {
  return (
    <main className="maintenance-page">
      <div className="maintenance-grid" aria-hidden="true" />

      <section className="maintenance-shell" aria-labelledby="maintenance-title">
        <header className="maintenance-header">
          <div className="maintenance-brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div>
            <strong>TeleSim 3D</strong>
            <span>Interactive Telecom Training Platform</span>
          </div>
        </header>

        <div className="maintenance-layout">
          <div className="maintenance-copy">
            <span className="maintenance-eyebrow">Scheduled Platform Service</span>
            <h1 id="maintenance-title">System Under Maintenance</h1>
            <p>
              We&apos;re currently performing scheduled maintenance and system
              improvements. TeleSim 3D will be available again shortly.
            </p>
            <div className="maintenance-progress-status" role="status">
              <i />
              <span>Maintenance in Progress</span>
            </div>
          </div>

          <aside className="maintenance-console" aria-label="Platform maintenance status">
            <div className="maintenance-console-heading">
              <div>
                <span>TeleSim Systems</span>
                <strong>Service Status</strong>
              </div>
              <span className="maintenance-console-code">TS / MAINT</span>
            </div>

            <div className="maintenance-network-visual" aria-hidden="true">
              <svg viewBox="0 0 420 120">
                <path d="M22 60h92l34-32h124l34 32h92" />
                <path d="M114 60l34 32h124l34-32" />
                <circle cx="22" cy="60" r="5" />
                <circle cx="148" cy="28" r="5" />
                <circle cx="210" cy="60" r="10" />
                <circle cx="272" cy="28" r="5" />
                <circle cx="398" cy="60" r="5" />
                <circle cx="148" cy="92" r="5" />
                <circle cx="272" cy="92" r="5" />
              </svg>
              <div className="maintenance-core-node">
                <i />
                <i />
                <i />
              </div>
            </div>

            <dl className="maintenance-service-list">
              {maintenanceServices.map((service) => (
                <div key={service.label}>
                  <dt>{service.label}</dt>
                  <dd>{service.status}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <footer className="maintenance-footer">
          <span><i /> Scheduled System Maintenance</span>
          <strong>TeleSim 3D</strong>
        </footer>
      </section>
    </main>
  )
}
