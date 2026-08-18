import { Link } from 'react-router-dom'
import TelecomIcon from '../../ui/TelecomIcon.jsx'

const studentCapabilities = Object.freeze([
  'Practice guided technical procedures',
  'Use virtual telecom equipment',
  'Complete troubleshooting scenarios',
  'Receive assessment feedback',
  'Track training progress',
  'Review previous results',
])

const staffCapabilities = Object.freeze([
  'Monitor student participation',
  'Review training outcomes',
  'Analyze module completion',
  'Inspect troubleshooting performance',
  'Manage authorized users where permitted',
])

export default function LandingExperienceSection({ session }) {
  const studentAction = session.isStudent
    ? { label: 'Continue to Dashboard', to: '/dashboard' }
    : session.isStaff
      ? { label: 'Explore Student Training', href: '#training' }
      : { label: 'Start Student Training', to: '/register' }

  const staffAction = session.isStaff
    ? { label: 'Continue to Management Portal', to: '/instructor' }
    : { label: 'Open Staff Portal', to: '/staff/login' }

  return (
    <section
      id="about"
      className="landing-section landing-experience-section"
      aria-labelledby="landing-experience-title"
    >
      <div className="landing-container">
        <div className="landing-section-heading" data-reveal>
          <div>
            <span>Two Connected Workspaces</span>
            <h2 id="landing-experience-title">
              Built for Learning and Training Management
            </h2>
          </div>
          <p>
            TeleSim separates practical student training from authorized staff
            oversight while keeping outcomes connected.
          </p>
        </div>

        <div className="landing-experience-grid">
          <article className="landing-experience-card is-student" data-reveal>
            <header>
              <div className="landing-experience-icon">
                <TelecomIcon name="user" size={24} />
              </div>
              <div>
                <span>Learning Workspace</span>
                <h3>Student Experience</h3>
              </div>
            </header>
            <ul>
              {studentCapabilities.map((capability) => (
                <li key={capability}><i /> {capability}</li>
              ))}
            </ul>
            {studentAction.to ? (
              <Link className="landing-inline-link" to={studentAction.to}>
                {studentAction.label} <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <a className="landing-inline-link" href={studentAction.href}>
                {studentAction.label} <span aria-hidden="true">→</span>
              </a>
            )}
          </article>

          <article className="landing-experience-card is-staff" data-reveal>
            <header>
              <div className="landing-experience-icon">
                <TelecomIcon name="network" size={24} />
              </div>
              <div>
                <span>Management Workspace</span>
                <h3>Instructor &amp; Admin Experience</h3>
              </div>
            </header>
            <ul>
              {staffCapabilities.map((capability) => (
                <li key={capability}><i /> {capability}</li>
              ))}
            </ul>
            <Link className="landing-inline-link" to={staffAction.to}>
              {staffAction.label} <span aria-hidden="true">→</span>
            </Link>
          </article>
        </div>
      </div>
    </section>
  )
}
