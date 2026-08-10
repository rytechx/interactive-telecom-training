import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore.js'
import { getHomeRouteForRole } from '../../utils/roleRoutes.js'
import AuthLoadingScreen from './AuthLoadingScreen.jsx'

export default function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const sessionChecked = useAuthStore((state) => state.sessionChecked)
  const userRole = useAuthStore((state) => state.user?.role)

  if (!sessionChecked) {
    return <AuthLoadingScreen />
  }

  return isAuthenticated
    ? <Navigate to={getHomeRouteForRole(userRole)} replace />
    : <Outlet />
}
