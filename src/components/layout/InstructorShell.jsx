import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore.js'
import useAdminStore from '../../store/useAdminStore.js'
import useInstructorStore from '../../store/useInstructorStore.js'
import TelecomIcon from '../../ui/TelecomIcon.jsx'

const staffNavigation = Object.freeze([
  Object.freeze({ path: '/instructor', label: 'Overview', icon: 'dashboard', end: true }),
  Object.freeze({ path: '/instructor/students', label: 'Students', icon: 'user' }),
  Object.freeze({ path: '/instructor/modules', label: 'Modules', icon: 'modules' }),
  Object.freeze({ path: '/instructor/results', label: 'Training Results', icon: 'results' }),
  Object.freeze({ path: '/instructor/troubleshooting', label: 'Troubleshooting', icon: 'network' }),
  Object.freeze({ path: '/instructor/users', label: 'User Management', icon: 'settings', adminOnly: true }),
  Object.freeze({ path: '/instructor/profile', label: 'Profile', icon: 'user' }),
])

export default function InstructorShell() {
  const navigate = useNavigate()
  const mobileMenuButtonRef = useRef(null)
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigation = staffNavigation.filter(
    (item) => !item.adminOnly || user?.role === 'admin',
  )
  const fullName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : 'TeleSim Staff'
  const roleLabel = user?.role === 'admin' ? 'Administrator' : 'Instructor'

  useEffect(() => {
    if (!mobileNavigationOpen) return undefined

    const closeMobileNavigation = (event) => {
      if (event.key !== 'Escape') return
      setMobileNavigationOpen(false)
      mobileMenuButtonRef.current?.focus()
    }

    document.addEventListener('keydown', closeMobileNavigation)
    return () => document.removeEventListener('keydown', closeMobileNavigation)
  }, [mobileNavigationOpen])

  const signOut = async () => {
    setMobileNavigationOpen(false)
    useInstructorStore.getState().reset()
    useAdminStore.getState().reset()
    await logout()
    navigate('/staff/login', { replace: true })
  }

  return (
    <div className="application-shell instructor-shell">
      <header className="application-mobile-header instructor-mobile-header">
        <div>
          <span className="application-brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>TeleSim 3D</strong>
            <small>{roleLabel}</small>
          </span>
        </div>
        <button
          ref={mobileMenuButtonRef}
          type="button"
          className="application-mobile-menu-button"
          onClick={() => setMobileNavigationOpen((open) => !open)}
          aria-expanded={mobileNavigationOpen}
          aria-controls="staff-mobile-navigation"
          aria-label={`${mobileNavigationOpen ? 'Close' : 'Open'} navigation menu`}
        >
          <i />
          <i />
          <i />
        </button>
      </header>

      {mobileNavigationOpen && (
        <>
          <button
            type="button"
            className="application-mobile-backdrop"
            onClick={() => setMobileNavigationOpen(false)}
            aria-label="Close navigation menu"
          />
          <aside
            id="staff-mobile-navigation"
            className="application-mobile-drawer instructor-mobile-drawer"
            aria-label="Staff navigation menu"
          >
            <div className="application-mobile-drawer-heading">
              <span>Management Portal</span>
              <strong>{roleLabel}</strong>
            </div>
            <nav className="application-mobile-navigation" aria-label="Mobile staff navigation">
              {navigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) => (isActive ? 'is-active' : '')}
                  onClick={() => setMobileNavigationOpen(false)}
                >
                  <TelecomIcon name={item.icon} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="application-mobile-account">
              <div>
                <strong>{fullName}</strong>
                <small>{user?.role?.toUpperCase()}</small>
              </div>
              <button type="button" onClick={signOut}>
                <TelecomIcon name="logout" size={16} />
                Log Out
              </button>
            </div>
          </aside>
        </>
      )}

      <aside className="application-sidebar instructor-sidebar">
        <div className="application-brand">
          <span className="application-brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>TeleSim 3D</strong>
            <small>Training Management</small>
          </span>
        </div>

        <div className="instructor-sidebar-context">
          <span>Management Portal</span>
          <strong>{roleLabel}</strong>
        </div>

        <nav className="application-navigation" aria-label="Instructor navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => (isActive ? 'is-active' : '')}
              aria-label={item.label}
              title={item.label}
            >
              <TelecomIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="instructor-sidebar-footer">
          <div>
            <TelecomIcon name="user" />
            <span>
              <strong>{fullName}</strong>
              <small>{user?.role?.toUpperCase()}</small>
            </span>
          </div>
          <button type="button" onClick={signOut} aria-label="Log out" title="Log Out">
            <TelecomIcon name="logout" size={14} />
            Log Out
          </button>
        </div>
      </aside>

      <main className="application-main instructor-main">
        <Outlet />
      </main>
    </div>
  )
}
