import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SESSION_EXPIRED_EVENT } from '../../api/apiClient.js'
import useAdminStore from '../../store/useAdminStore.js'
import useAuthStore from '../../store/useAuthStore.js'
import useInstructorStore from '../../store/useInstructorStore.js'

const sessionExpiredMessage = 'Your session has expired. Please sign in again.'

export default function SessionExpiryHandler() {
  const location = useLocation()
  const navigate = useNavigate()
  const expireSession = useAuthStore((state) => state.expireSession)

  useEffect(() => {
    const handleSessionExpiry = () => {
      const currentRole = useAuthStore.getState().user?.role
      const isStaffContext =
        location.pathname.startsWith('/instructor') ||
        currentRole === 'instructor' ||
        currentRole === 'admin'

      useInstructorStore.getState().reset()
      useAdminStore.getState().reset()
      expireSession()
      navigate(isStaffContext ? '/staff/login' : '/login', {
        replace: true,
        state: {
          message: sessionExpiredMessage,
          messageType: 'error',
        },
      })
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpiry)

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpiry)
    }
  }, [expireSession, location.pathname, navigate])

  return null
}
