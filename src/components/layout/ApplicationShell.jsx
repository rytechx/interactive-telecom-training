import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore.js'
import TelecomIcon from '../../ui/TelecomIcon.jsx'

const navigationItems = Object.freeze([
  Object.freeze({ path: '/dashboard', label: 'Dashboard', icon: 'dashboard', end: true }),
  Object.freeze({ path: '/training', label: 'Training Modules', icon: 'modules' }),
  Object.freeze({ path: '/lab', label: 'Telecom Laboratory', icon: 'lab' }),
  Object.freeze({ path: '/results', label: 'Results', icon: 'results' }),
])

export default function ApplicationShell() {
  const navigate = useNavigate()
  const mobileMenuButtonRef = useRef(null)
  const profileMenuRef = useRef(null)
  const profileButtonRef = useRef(null)
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const fullName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : 'Student Profile'
  const profileMeta = user
    ? `${(user.role ?? 'student').toUpperCase()} / ${
        user.studentNumber ?? 'Number unavailable'
      }`
    : 'STUDENT'

  useEffect(() => {
    if (!profileMenuOpen) {
      return undefined
    }

    const closeProfileMenu = (event) => {
      if (event.type === 'keydown') {
        if (event.key !== 'Escape') return

        setProfileMenuOpen(false)
        profileButtonRef.current?.focus()
        return
      }

      if (!profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeProfileMenu)
    document.addEventListener('keydown', closeProfileMenu)

    return () => {
      document.removeEventListener('pointerdown', closeProfileMenu)
      document.removeEventListener('keydown', closeProfileMenu)
    }
  }, [profileMenuOpen])

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
    setProfileMenuOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="application-shell">
      <header className="application-mobile-header">
        <div>
          <span className="application-brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>TeleSim 3D</strong>
            <small>Student Portal</small>
          </span>
        </div>
        <button
          ref={mobileMenuButtonRef}
          type="button"
          className="application-mobile-menu-button"
          onClick={() => setMobileNavigationOpen((open) => !open)}
          aria-expanded={mobileNavigationOpen}
          aria-controls="student-mobile-navigation"
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
            id="student-mobile-navigation"
            className="application-mobile-drawer"
            aria-label="Student navigation menu"
          >
            <div className="application-mobile-drawer-heading">
              <span>Student Workspace</span>
              <strong>TeleSim Navigation</strong>
            </div>
            <nav className="application-mobile-navigation" aria-label="Mobile navigation">
              {navigationItems.map((item) => (
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
              <NavLink
                to="/settings"
                className={({ isActive }) => (isActive ? 'is-active' : '')}
                onClick={() => setMobileNavigationOpen(false)}
              >
                <TelecomIcon name="settings" />
                <span>Settings</span>
              </NavLink>
              <NavLink to="/profile" onClick={() => setMobileNavigationOpen(false)}>
                <TelecomIcon name="user" />
                <span>Profile</span>
              </NavLink>
            </nav>
            <div className="application-mobile-account">
              <div>
                <strong>{fullName}</strong>
                <small>{profileMeta}</small>
              </div>
              <button type="button" onClick={signOut}>
                <TelecomIcon name="logout" size={16} />
                Log Out
              </button>
            </div>
          </aside>
        </>
      )}

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
              aria-label={item.label}
              title={item.label}
            >
              <TelecomIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="application-sidebar-footer">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `application-settings-link${isActive ? ' is-active' : ''}`
            }
            aria-label="Settings"
            title="Settings"
          >
            <TelecomIcon name="settings" />
            <span>Settings</span>
          </NavLink>
          <div className="application-profile-menu" ref={profileMenuRef}>
            <button
              ref={profileButtonRef}
              type="button"
              className="application-profile-placeholder"
              onClick={() => setProfileMenuOpen((open) => !open)}
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
              aria-controls="authenticated-student-menu"
              aria-label={`Open profile menu for ${fullName}`}
              title={fullName}
            >
              <TelecomIcon name="user" />
              <span>
                <strong>{fullName}</strong>
                <small>{profileMeta}</small>
              </span>
            </button>
            {profileMenuOpen && (
              <div
                id="authenticated-student-menu"
                className="application-profile-popover"
                role="menu"
              >
                <div className="application-profile-identity" role="presentation">
                  <strong>{fullName}</strong>
                  <span>{user?.studentNumber ?? 'Student number unavailable'}</span>
                  <small>{user?.role?.toUpperCase() ?? 'STUDENT'}</small>
                </div>
                <NavLink
                  to="/profile"
                  role="menuitem"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  Profile
                </NavLink>
                <NavLink
                  to="/settings"
                  role="menuitem"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  Settings
                </NavLink>
                <div className="application-profile-menu-divider" role="separator" />
                <button
                  type="button"
                  className="is-danger"
                  role="menuitem"
                  onClick={signOut}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="application-main">
        <Outlet />
      </main>
    </div>
  )
}
