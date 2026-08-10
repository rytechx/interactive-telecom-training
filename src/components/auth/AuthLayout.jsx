import { Link } from 'react-router-dom'

export default function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
}) {
  return (
    <div className="auth-page">
      <section className="auth-brand-panel" aria-label="TeleSim 3D platform">
        <Link className="auth-brand" to="/login" aria-label="TeleSim 3D login">
          <span className="application-brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>TeleSim 3D</strong>
            <small>Telecom Training Platform</small>
          </span>
        </Link>

        <div className="auth-brand-copy">
          <span>Interactive Technical Education</span>
          <h1>Build practical telecom skills in a secure virtual laboratory.</h1>
          <p>
            Practice copper cabling, fiber optic splicing, network installation,
            CLI configuration, and structured troubleshooting scenarios.
          </p>
        </div>

        <div className="auth-network-graphic" aria-hidden="true">
          <i className="auth-node node-one" />
          <i className="auth-node node-two" />
          <i className="auth-node node-three" />
          <i className="auth-node node-four" />
          <span className="auth-link link-one" />
          <span className="auth-link link-two" />
          <span className="auth-link link-three" />
          <span className="auth-link link-four" />
          <strong>Virtual Lab Online</strong>
        </div>

        <div className="auth-capabilities" aria-label="Training capabilities">
          <span>Guided Procedures</span>
          <span>Practical Assessments</span>
          <span>Network Troubleshooting</span>
        </div>
      </section>

      <main className="auth-form-region">
        <section className="auth-card">
          <header>
            <span>{eyebrow}</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </header>
          {children}
          {footer && <footer>{footer}</footer>}
        </section>
      </main>
    </div>
  )
}
