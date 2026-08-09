import { NavLink, Outlet } from 'react-router-dom'
import TelecomIcon from '../../ui/TelecomIcon.jsx'

const navigationItems = Object.freeze([
  Object.freeze({ path: '/', label: 'Dashboard', icon: 'dashboard', end: true }),
  Object.freeze({ path: '/training', label: 'Training Modules', icon: 'modules' }),
  Object.freeze({ path: '/lab', label: 'Telecom Laboratory', icon: 'lab' }),
  Object.freeze({ path: '/results', label: 'Results', icon: 'results' }),
])

export default function ApplicationShell() {
  return (
    <div className="application-shell">
      <aside className="application-sidebar">
        <div className="application-brand">
          <span className="application-brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>TeleSim 3D</strong>
            <small>Telecom Training Platform</small>
          </span>
        </div>

        <nav className="application-navigation" aria-label="Primary navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => (isActive ? 'is-active' : '')}
            >
              <TelecomIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="application-sidebar-footer">
          <button type="button" aria-label="Settings placeholder" disabled>
            <TelecomIcon name="settings" />
            <span>Settings</span>
          </button>
          <div className="application-profile-placeholder">
            <TelecomIcon name="user" />
            <span>
              <strong>Student Profile</strong>
              <small>Session mode</small>
            </span>
          </div>
        </div>
      </aside>

      <main className="application-main">
        <Outlet />
      </main>
    </div>
  )
}
