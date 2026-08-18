import { Link } from 'react-router-dom'

export default function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
  variant = 'student',
}) {
  const isStaff = variant === 'staff'
  const isRegistration = variant === 'registration'
  const pageClassName = [
    'auth-page',
    isStaff ? 'is-staff' : '',
    isRegistration ? 'is-registration' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={pageClassName}>
      <section className="auth-brand-panel" aria-label="TeleSim 3D platform">
        <Link
          className="auth-brand"
          to={isStaff ? '/staff/login' : '/login'}
          aria-label={`TeleSim 3D ${isStaff ? 'staff' : 'student'} login`}
        >
          <span className="application-brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>TeleSim 3D</strong>
            <small>{isStaff ? 'Staff Portal' : 'Telecom Training Platform'}</small>
          </span>
        </Link>

        {isStaff && (
          <div className="auth-mobile-context">
            <span>Secure Management Workspace</span>
            <strong>Instructor / Administrator Access</strong>
          </div>
        )}

        <div className="auth-brand-copy">
          <span>{isStaff ? 'Instructor & Administration' : 'Interactive Technical Education'}</span>
          <h1>
            {isStaff
              ? 'Manage training delivery through a secure staff workspace.'
              : 'Build practical telecom skills in a secure virtual laboratory.'}
          </h1>
          <p>
            {isStaff
              ? 'Review student performance, training outcomes, module diagnostics, and authorized account administration.'
              : 'Practice copper cabling, fiber optic splicing, network installation, CLI configuration, and structured troubleshooting scenarios.'}
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
          {!isStaff && <strong>Virtual Lab Online</strong>}
        </div>

        {isStaff && (
          <div className="auth-staff-system-status" aria-hidden="true">
            <i />
            <strong>Staff Systems Online</strong>
          </div>
        )}

        <div className="auth-capabilities" aria-label="Training capabilities">
          <span>{isStaff ? 'Student Oversight' : 'Guided Procedures'}</span>
          <span>{isStaff ? 'Training Analytics' : 'Practical Assessments'}</span>
          <span>{isStaff ? 'Role Protected' : 'Network Troubleshooting'}</span>
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
