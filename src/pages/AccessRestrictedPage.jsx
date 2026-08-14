import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore.js'
import { getHomeRouteForRole } from '../utils/roleRoutes.js'

export default function AccessRestrictedPage() {
  const navigate = useNavigate()
  const role = useAuthStore((state) => state.user?.role)

  return (
    <main className="access-restricted-page">
      <section>
        <span>Authorization</span>
        <h1>403 — Access Restricted</h1>
        <p>You do not have permission to access this section.</p>
        <button
          type="button"
          onClick={() => navigate(getHomeRouteForRole(role), { replace: true })}
        >
          Return to Dashboard
        </button>
      </section>
    </main>
  )
}
