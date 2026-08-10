import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore.js'
import AuthLoadingScreen from './AuthLoadingScreen.jsx'

export default function ProtectedRoute() {
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const sessionChecked = useAuthStore((state) => state.sessionChecked)

  if (!sessionChecked) {
    return <AuthLoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
