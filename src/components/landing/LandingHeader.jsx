import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const navigationItems = Object.freeze([
  Object.freeze({ id: 'top', label: 'Home' }),
  Object.freeze({ id: 'training', label: 'Training' }),
  Object.freeze({ id: 'workflow', label: 'How It Works' }),
  Object.freeze({ id: 'platform', label: 'Platform' }),
  Object.freeze({ id: 'about', label: 'About' }),
])

export default function LandingHeader({ session }) {
  const menuButtonRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('top')

  useEffect(() => {
    if (!menuOpen) return undefined

    const closeMenu = (event) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      menuButtonRef.current?.focus()
    }

    document.addEventListener('keydown', closeMenu)
    return () => document.removeEventListener('keydown', closeMenu)
  }, [menuOpen])

  useEffect(() => {
    const page = document.getElementById('top')
    if (!page) return undefined

    const updateHeader = () => {
      setScrolled(page.scrollTop > 8)

      const marker = page.scrollTop + 150
      let currentSection = 'top'

      navigationItems.forEach((item) => {
        const section = document.getElementById(item.id)
        if (section && section.offsetTop <= marker) {
          currentSection = item.id
        }
      })

      setActiveSection(currentSection)
    }

    updateHeader()
    page.addEventListener('scroll', updateHeader, { passive: true })
    window.addEventListener('resize', updateHeader)

    return () => {
      page.removeEventListener('scroll', updateHeader)
      window.removeEventListener('resize', updateHeader)
    }
  }, [])

  const closeNavigation = () => setMenuOpen(false)

  return (
    <header className={`landing-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="landing-container landing-header-inner">
        <Link className="landing-brand" to="/" aria-label="TeleSim 3D home">
          <span className="application-brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>TeleSim 3D</strong>
            <small>Interactive Telecom Training</small>
          </span>
        </Link>

        <button
          ref={menuButtonRef}
          type="button"
          className="landing-menu-button"
          onClick={() => setMenuOpen((currentValue) => !currentValue)}
          aria-expanded={menuOpen}
          aria-controls="landing-navigation"
          aria-label={`${menuOpen ? 'Close' : 'Open'} navigation menu`}
        >
          <span />
          <span />
          <span />
        </button>

        <div
          id="landing-navigation"
          className={`landing-navigation${menuOpen ? ' is-open' : ''}`}
        >
          <nav aria-label="Public navigation">
            {navigationItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={activeSection === item.id ? 'is-active' : undefined}
                aria-current={activeSection === item.id ? 'location' : undefined}
                onClick={closeNavigation}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="landing-header-actions">
            {session.isAuthenticated ? (
              <>
                <span className="landing-user-greeting">{session.greeting}</span>
                <Link
                  className="landing-button is-primary is-compact"
                  to={session.actionPath}
                  onClick={closeNavigation}
                >
                  {session.actionLabel}
                </Link>
              </>
            ) : (
              <>
                <Link
                  className="landing-button is-quiet is-compact"
                  to="/staff/login"
                  onClick={closeNavigation}
                >
                  Staff Portal
                </Link>
                <Link
                  className="landing-button is-secondary is-compact"
                  to="/login"
                  onClick={closeNavigation}
                >
                  Student Login
                </Link>
                <Link
                  className="landing-button is-primary is-compact"
                  to="/register"
                  onClick={closeNavigation}
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
