import { useEffect } from 'react'
import useAuthStore from '../store/useAuthStore.js'
import useTrainingPersistenceStore from '../store/useTrainingPersistenceStore.js'

export default function useTrainingPersistenceBootstrap() {
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const sessionChecked = useAuthStore((state) => state.sessionChecked)
  const initializeForUser = useTrainingPersistenceStore(
    (state) => state.initializeForUser,
  )

  useEffect(() => {
    if (!sessionChecked) return
    void initializeForUser(isAuthenticated ? userId : null)
  }, [initializeForUser, isAuthenticated, sessionChecked, userId])
}
