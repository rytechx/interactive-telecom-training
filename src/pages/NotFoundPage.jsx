import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore.js'
import { getHomeRouteForRole } from '../utils/roleRoutes.js'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const role = useAuthStore((state) => state.user?.role)
  const returnPath = isAuthenticated ? getHomeRouteForRole(role) : '/login'

  return (
    <main className="access-restricted-page">
      <section>
        <span>Navigation Error</span>
        <h1>404 — Page Not Found</h1>
        <p>The requested TeleSim page does not exist or is no longer available.</p>
        <button
          type="button"
          onClick={() => navigate(returnPath, { replace: true })}
        >
          {isAuthenticated ? 'Return to Dashboard' : 'Return to Login'}
        </button>
      </section>
    </main>
  )
}
