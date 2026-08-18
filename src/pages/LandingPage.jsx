import { Link } from 'react-router-dom'
import LandingHeader from '../components/landing/LandingHeader.jsx'
import LandingNetworkVisual from '../components/landing/LandingNetworkVisual.jsx'
import useAuthStore from '../store/useAuthStore.js'
import TelecomIcon from '../ui/TelecomIcon.jsx'
import { isStaffRole } from '../utils/roleRoutes.js'

const trainingAreas = Object.freeze([
  Object.freeze({
    title: 'RJ45 Cable Termination',
    description: 'Prepare, arrange, terminate, crimp, and test copper Ethernet cabling.',
    icon: 'rj45',
    label: 'Copper Cabling',
  }),
  Object.freeze({
    title: 'Fiber Optic Fusion Splicing',
    description: 'Practice fiber preparation, precision cleaving, fusion, and splice inspection.',
    icon: 'fiber',
    label: 'Fiber Optics',
  }),
  Object.freeze({
    title: 'Network Device Installation',
    description: 'Place, connect, and verify routers, switches, patch panels, and endpoints.',
    icon: 'network',
    label: 'Infrastructure',
  }),
  Object.freeze({
    title: 'Router & Switch Configuration',
    description: 'Build practical command-line confidence with guided device configuration.',
    icon: 'settings',
    label: 'Device CLI',
  }),
  Object.freeze({
    title: 'IP Address Configuration',
    description: 'Apply IPv4 addressing and interface settings across realistic network paths.',
    icon: 'modules',
    label: 'IPv4 Networking',
  }),
  Object.freeze({
    title: 'Network Troubleshooting',
    description: 'Diagnose structured fault scenarios using inspection, testing, and verification.',
    icon: 'help',
    label: 'Diagnostics',
  }),
])

const learningSteps = Object.freeze([
  Object.freeze({
    title: 'Learn',
    description: 'Review equipment, procedures, and technical objectives.',
  }),
  Object.freeze({
    title: 'Practice',
    description: 'Perform guided technical procedures inside the interactive 3D laboratory.',
  }),
  Object.freeze({
    title: 'Troubleshoot',
    description: 'Diagnose realistic telecommunications and network faults.',
  }),
  Object.freeze({
    title: 'Assess',
    description: 'Receive scores, feedback, and saved training results.',
  }),
])

const platformFeatures = Object.freeze([
  Object.freeze({ title: 'Interactive 3D Laboratory', description: 'Explore a focused training environment built around real telecom workflows.', icon: 'lab' }),
  Object.freeze({ title: 'Guided Technical Procedures', description: 'Progress through structured tasks with clear instructions and checkpoints.', icon: 'modules' }),
  Object.freeze({ title: 'Virtual Troubleshooting Scenarios', description: 'Investigate realistic faults using equipment inspection and network verification.', icon: 'help' }),
  Object.freeze({ title: 'Assessment & Scoring', description: 'Validate technique, sequencing, configuration, and troubleshooting outcomes.', icon: 'results' }),
  Object.freeze({ title: 'Training Progress Tracking', description: 'Review module completion, scores, activity, and developing technical skills.', icon: 'dashboard' }),
  Object.freeze({ title: 'Instructor Analytics', description: 'Give authorized staff a clear view of student participation and performance.', icon: 'network' }),
])

function getLandingSession(user, isAuthenticated, sessionChecked) {
  if (!sessionChecked || !isAuthenticated || !user) {
    return {
      isAuthenticated: false,
      actionPath: '/register',
      actionLabel: 'Start Training',
      greeting: '',
      roleLabel: '',
    }
  }

  const firstName = user.firstName?.trim() || 'Learner'
  const staff = isStaffRole(user.role)
  const roleLabel = user.role === 'admin' ? 'Administrator' : staff ? 'Instructor' : 'Student'

  return {
    isAuthenticated: true,
    actionPath: staff ? '/instructor' : '/dashboard',
    actionLabel: staff ? 'Continue to Management Portal' : 'Continue to Dashboard',
    greeting: `Welcome back, ${firstName}.`,
    roleLabel,
  }
}

export default function LandingPage() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const sessionChecked = useAuthStore((state) => state.sessionChecked)
  const session = getLandingSession(user, isAuthenticated, sessionChecked)

  return (
    <div id="top" className="landing-page">
      <a className="landing-skip-link" href="#landing-content">Skip to content</a>
      <LandingHeader session={session} />

      <main id="landing-content">
        <section className="landing-hero" aria-labelledby="landing-hero-title">
          <div className="landing-hero-backdrop" aria-hidden="true" />
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-copy">
              <span className="landing-eyebrow">Interactive Telecom Training</span>
              {session.isAuthenticated && (
                <div className="landing-session-message" role="status">
                  <i />
                  <span>{session.greeting}</span>
                  <strong>{session.roleLabel}</strong>
                </div>
              )}
              <h1 id="landing-hero-title">Interactive Telecom Training, Reimagined.</h1>
              <p>
                Build practical telecommunications skills through realistic 3D
                simulations, guided technical procedures, virtual equipment, and
                troubleshooting scenarios.
              </p>

              <div className="landing-hero-actions">
                {session.isAuthenticated ? (
                  <>
                    <Link className="landing-button is-primary" to={session.actionPath}>
                      {session.actionLabel}
                      <span aria-hidden="true">→</span>
                    </Link>
                    <a className="landing-button is-secondary" href="#training">
                      Explore Training
                    </a>
                  </>
                ) : (
                  <>
                    <Link className="landing-button is-primary" to="/register">
                      Start Training
                      <span aria-hidden="true">→</span>
                    </Link>
                    <Link className="landing-button is-secondary" to="/login">
                      Student Login
                    </Link>
                    <Link className="landing-staff-link" to="/staff/login">
                      Instructor or Administrator? <strong>Open Staff Portal →</strong>
                    </Link>
                  </>
                )}
              </div>

              <div className="landing-hero-proof" aria-label="Platform highlights">
                <span><i /> Browser-Based Training</span>
                <span><i /> Guided Assessments</span>
                <span><i /> Secure Role Access</span>
              </div>
            </div>

            <LandingNetworkVisual />
          </div>
        </section>

        <section id="training" className="landing-section landing-training-section" aria-labelledby="landing-training-title">
          <div className="landing-container">
            <div className="landing-section-heading">
              <div>
                <span>Practical Skill Development</span>
                <h2 id="landing-training-title">Practice Real Telecommunications Procedures</h2>
              </div>
              <p>
                Build a connected foundation across physical cabling, network
                equipment, configuration, and fault diagnosis.
              </p>
            </div>

            <div className="landing-module-grid">
              {trainingAreas.map((area, index) => (
                <article className="landing-module-card" key={area.title}>
                  <div className="landing-card-icon">
                    <TelecomIcon name={area.icon} size={22} />
                  </div>
                  <span>{String(index + 1).padStart(2, '0')} / {area.label}</span>
                  <h3>{area.title}</h3>
                  <p>{area.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section landing-process-section" aria-labelledby="landing-process-title">
          <div className="landing-container">
            <div className="landing-section-heading is-centered">
              <div>
                <span>Structured Learning Journey</span>
                <h2 id="landing-process-title">How TeleSim Works</h2>
              </div>
              <p>Every training path connects technical knowledge to measurable hands-on performance.</p>
            </div>

            <ol className="landing-process-grid">
              {learningSteps.map((step, index) => (
                <li key={step.title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="about" className="landing-section landing-features-section" aria-labelledby="landing-features-title">
          <div className="landing-container landing-features-layout">
            <div className="landing-features-intro">
              <span className="landing-eyebrow">Built for Technical Education</span>
              <h2 id="landing-features-title">A focused platform for applied telecom learning.</h2>
              <p>
                TeleSim 3D brings instruction, simulation, assessment, and progress
                visibility into one secure learning environment.
              </p>
              {!session.isAuthenticated && (
                <Link className="landing-inline-link" to="/register">
                  Create a student account <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>

            <div className="landing-feature-grid">
              {platformFeatures.map((feature) => (
                <article key={feature.title}>
                  <TelecomIcon name={feature.icon} size={20} />
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-final-section" aria-labelledby="landing-final-title">
          <div className="landing-container landing-final-card">
            <div>
              <span>{session.isAuthenticated ? 'Your Workspace Is Ready' : 'Start Building Practical Skills'}</span>
              <h2 id="landing-final-title">
                {session.isAuthenticated
                  ? 'Continue your TeleSim 3D experience.'
                  : 'Ready to build practical telecom skills?'}
              </h2>
              <p>
                {session.isAuthenticated
                  ? 'Return to your role-specific workspace and continue where you left off.'
                  : 'Create an account to begin, or sign in to continue your existing training.'}
              </p>
            </div>
            <div className="landing-final-actions">
              {session.isAuthenticated ? (
                <Link className="landing-button is-primary" to={session.actionPath}>
                  {session.actionLabel}
                  <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <>
                  <Link className="landing-button is-primary" to="/register">Create Student Account</Link>
                  <Link className="landing-button is-secondary" to="/login">Student Login</Link>
                  <Link className="landing-button is-quiet" to="/staff/login">Staff Portal</Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container">
          <span>© {new Date().getFullYear()} TeleSim 3D</span>
          <p>Interactive telecom training for practical technical education.</p>
        </div>
      </footer>
    </div>
  )
}
