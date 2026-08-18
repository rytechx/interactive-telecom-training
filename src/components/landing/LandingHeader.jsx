import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export default function LandingHeader({ session }) {
  const menuButtonRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

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

  const closeNavigation = () => setMenuOpen(false)

  return (
    <header className="landing-header">
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
            <a href="#top" onClick={closeNavigation}>Home</a>
            <a href="#training" onClick={closeNavigation}>Training</a>
            <a href="#about" onClick={closeNavigation}>About</a>
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
