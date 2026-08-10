import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore.js'

export default function RoleRoute({ allowedRoles, redirectTo = '/access-restricted' }) {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ attemptedPath: location.pathname }}
      />
    )
  }

  return <Outlet />
}
