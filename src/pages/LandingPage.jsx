import { useRef } from 'react'
import { Link } from 'react-router-dom'
import LandingExperienceSection from '../components/landing/LandingExperienceSection.jsx'
import LandingHeader from '../components/landing/LandingHeader.jsx'
import LandingNetworkVisual from '../components/landing/LandingNetworkVisual.jsx'
import LandingStatusStrip from '../components/landing/LandingStatusStrip.jsx'
import LandingTrainingPreview from '../components/landing/LandingTrainingPreview.jsx'
import useLandingReveal from '../components/landing/useLandingReveal.js'
import useAuthStore from '../store/useAuthStore.js'
import TelecomIcon from '../ui/TelecomIcon.jsx'
import { isStaffRole } from '../utils/roleRoutes.js'

const trainingAreas = Object.freeze([
  Object.freeze({
    title: 'RJ45 Cable Termination',
    description: 'Prepare, arrange, terminate, crimp, and test copper Ethernet cabling.',
    icon: 'rj45',
    label: 'Copper Cabling',
    skills: Object.freeze(['Preparation', 'T568B', 'Crimping', 'Cable Testing']),
  }),
  Object.freeze({
    title: 'Fiber Optic Fusion Splicing',
    description: 'Practice fiber preparation, precision cleaving, fusion, and splice inspection.',
    icon: 'fiber',
    label: 'Fiber Optics',
    skills: Object.freeze(['Fiber Prep', 'Cleaving', 'Fusion', 'Inspection']),
  }),
  Object.freeze({
    title: 'Network Device Installation',
    description: 'Place, connect, and verify routers, switches, patch panels, and endpoints.',
    icon: 'network',
    label: 'Infrastructure',
    skills: Object.freeze(['Device Placement', 'Cabling', 'Port Mapping', 'Link Checks']),
  }),
  Object.freeze({
    title: 'Router & Switch Configuration',
    description: 'Build practical command-line confidence with guided device configuration.',
    icon: 'settings',
    label: 'Device CLI',
    skills: Object.freeze(['Router CLI', 'Switch CLI', 'Interfaces', 'Connectivity']),
  }),
  Object.freeze({
    title: 'IP Address Configuration',
    description: 'Apply IPv4 addressing and interface settings across realistic network paths.',
    icon: 'modules',
    label: 'IPv4 Networking',
    skills: Object.freeze(['IPv4 Address', 'Subnet Mask', 'Gateway', 'Ping Testing']),
  }),
  Object.freeze({
    title: 'Network Troubleshooting',
    description: 'Diagnose structured fault scenarios using inspection, testing, and verification.',
    icon: 'help',
    label: 'Diagnostics',
    skills: Object.freeze(['Fault Isolation', 'Inspection', 'Testing', 'Recovery']),
  }),
])

const learningSteps = Object.freeze([
  Object.freeze({
    title: 'Learn',
    description: 'Review equipment, procedures, and technical objectives.',
    icon: 'modules',
  }),
  Object.freeze({
    title: 'Practice',
    description: 'Perform guided technical procedures inside the interactive 3D laboratory.',
    icon: 'lab',
  }),
  Object.freeze({
    title: 'Troubleshoot',
    description: 'Diagnose realistic telecommunications and network faults.',
    icon: 'help',
  }),
  Object.freeze({
    title: 'Assess',
    description: 'Receive scores, feedback, and saved training results.',
    icon: 'results',
  }),
])

const platformFeatures = Object.freeze([
  Object.freeze({ group: 'Practice', title: 'Interactive 3D Laboratory', description: 'Explore a focused environment built around real telecom workflows.', icon: 'lab' }),
  Object.freeze({ group: 'Practice', title: 'Guided Technical Procedures', description: 'Progress through structured tasks with clear checkpoints.', icon: 'modules' }),
  Object.freeze({ group: 'Diagnose', title: 'Virtual Troubleshooting Scenarios', description: 'Investigate realistic faults using inspection and verification.', icon: 'help' }),
  Object.freeze({ group: 'Assess', title: 'Assessment & Scoring', description: 'Validate technique, sequencing, and technical outcomes.', icon: 'results' }),
  Object.freeze({ group: 'Assess', title: 'Training Progress Tracking', description: 'Review completion, scores, activity, and developing skills.', icon: 'dashboard' }),
  Object.freeze({ group: 'Manage', title: 'Instructor Analytics', description: 'Review student participation and training performance.', icon: 'network' }),
])

function getLandingSession(user, isAuthenticated, sessionChecked) {
  if (!sessionChecked || !isAuthenticated || !user) {
    return {
      isAuthenticated: false,
      actionPath: '/register',
      actionLabel: 'Start Training',
      greeting: '',
      roleLabel: '',
      isStaff: false,
      isStudent: false,
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
    isStaff: staff,
    isStudent: user.role === 'student',
  }
}

export default function LandingPage() {
  const pageRef = useRef(null)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const sessionChecked = useAuthStore((state) => state.sessionChecked)
  const session = getLandingSession(user, isAuthenticated, sessionChecked)
  useLandingReveal(pageRef)

  return (
    <div id="top" className="landing-page" ref={pageRef}>
      <a className="landing-skip-link" href="#landing-content">Skip to content</a>
      <LandingHeader session={session} />

      <main id="landing-content">
        <section className="landing-hero" aria-labelledby="landing-hero-title">
          <div className="landing-hero-backdrop" aria-hidden="true" />
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-copy" data-reveal>
              <span className="landing-eyebrow">Interactive Telecom Training Platform</span>
              {session.isAuthenticated && (
                <div className="landing-session-message" role="status">
                  <i />
                  <span>{session.greeting}</span>
                  <strong>{session.roleLabel}</strong>
                </div>
              )}
              <h1 id="landing-hero-title">
                <span>Train. Configure. Troubleshoot.</span>
                <span>Build Real Telecom Skills in 3D.</span>
              </h1>
              <p>
                Practice telecommunications procedures through guided 3D
                simulations, virtual equipment, configuration exercises,
                assessments, and realistic troubleshooting scenarios.
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

            </div>

            <div className="landing-network-reveal" data-reveal>
              <LandingNetworkVisual />
            </div>
          </div>
        </section>

        <LandingStatusStrip />

        <section id="training" className="landing-section landing-training-section" aria-labelledby="landing-training-title">
          <div className="landing-container">
            <div className="landing-section-heading" data-reveal>
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
                <article
                  className="landing-module-card"
                  key={area.title}
                  data-reveal
                  style={{ '--reveal-delay': `${(index % 3) * 60}ms` }}
                >
                  <div className="landing-card-icon">
                    <TelecomIcon name={area.icon} size={22} />
                  </div>
                  <span>{area.label} / {String(index + 1).padStart(2, '0')}</span>
                  <h3>{area.title}</h3>
                  <p>{area.description}</p>
                  <ul className="landing-skill-tags" aria-label={`${area.title} skills`}>
                    {area.skills.map((skill) => <li key={skill}>{skill}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="landing-section landing-process-section" aria-labelledby="landing-process-title">
          <div className="landing-container">
            <div className="landing-section-heading is-centered" data-reveal>
              <div>
                <span>Structured Learning Journey</span>
                <h2 id="landing-process-title">How TeleSim Works</h2>
              </div>
              <p>Every training path connects technical knowledge to measurable hands-on performance.</p>
            </div>

            <ol className="landing-process-grid">
              {learningSteps.map((step, index) => (
                <li
                  key={step.title}
                  data-reveal
                  style={{ '--reveal-delay': `${index * 70}ms` }}
                >
                  <div className="landing-process-marker">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <TelecomIcon name={step.icon} size={19} />
                  </div>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <LandingTrainingPreview />

        <section id="platform" className="landing-section landing-features-section" aria-labelledby="landing-features-title">
          <div className="landing-container landing-features-layout">
            <div className="landing-features-intro" data-reveal>
              <span className="landing-eyebrow">Platform Capabilities</span>
              <h2 id="landing-features-title">One focused platform for applied telecom learning.</h2>
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
              {platformFeatures.map((feature, index) => (
                <article
                  key={feature.title}
                  data-reveal
                  style={{ '--reveal-delay': `${(index % 2) * 60}ms` }}
                >
                  <TelecomIcon name={feature.icon} size={20} />
                  <div>
                    <span className="landing-feature-group">{feature.group}</span>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <LandingExperienceSection session={session} />

        <section className="landing-final-section" aria-labelledby="landing-final-title">
          <div className="landing-container landing-final-card" data-reveal>
            <div>
              <span>{session.isAuthenticated ? 'Your Training Workspace Is Ready' : 'Ready for Practical Training?'}</span>
              <h2 id="landing-final-title">
                {session.isAuthenticated
                  ? 'Continue your TeleSim 3D training experience.'
                  : 'Ready to build practical telecom skills?'}
              </h2>
              <p>
                {session.isAuthenticated
                  ? 'Return to your role-specific workspace and continue where you left off.'
                  : 'Build telecommunications skills through guided, repeatable virtual practice.'}
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
                  <span className="landing-final-staff-link">
                    Staff member? <Link to="/staff/login">Open Staff Portal →</Link>
                  </span>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-main">
          <div className="landing-footer-brand">
            <strong>TeleSim 3D</strong>
            <span>Interactive Telecom Training Platform</span>
            <p>
              Browser-based practical training for telecommunications procedures,
              configuration, assessment, and troubleshooting.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <div>
              <strong>Platform</strong>
              <a href="#platform">Capabilities</a>
              <a href="#workflow">How It Works</a>
              <a href="#about">About TeleSim</a>
            </div>
            <div>
              <strong>Training</strong>
              <a href="#training">Training Areas</a>
              <Link to="/login">Student Login</Link>
              <Link to="/staff/login">Staff Portal</Link>
            </div>
          </nav>
        </div>
        <div className="landing-container landing-footer-bottom">
          <span>© {new Date().getFullYear()} TeleSim 3D</span>
          <p>Interactive Telecom Training Application</p>
        </div>
      </footer>
    </div>
  )
}
