import { Component } from 'react'
import { useLocation } from 'react-router-dom'

class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidUpdate(previousProps) {
    if (
      this.state.hasError &&
      previousProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="application-error-page" role="alert">
          <section>
            <span>TeleSim 3D</span>
            <h1>Unable to load this section.</h1>
            <p>Retry the page or return to the application home screen.</p>
            <div>
              <button type="button" onClick={() => window.location.reload()}>
                Retry
              </button>
              <a href="/">Return to Dashboard</a>
            </div>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

export default function ApplicationErrorBoundary({ children }) {
  const location = useLocation()

  return (
    <ErrorBoundary resetKey={location.key}>
      {children}
    </ErrorBoundary>
  )
}
