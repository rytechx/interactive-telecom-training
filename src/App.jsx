import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './app/AppRoutes.jsx'
import SessionExpiryHandler from './components/auth/SessionExpiryHandler.jsx'
import ApplicationErrorBoundary from './components/layout/ApplicationErrorBoundary.jsx'
import useTrainingPersistenceBootstrap from './hooks/useTrainingPersistenceBootstrap.js'
import useTrainingResultSync from './hooks/useTrainingResultSync.js'
import useSettingsEffects from './hooks/useSettingsEffects.js'
import useAudioSystem from './hooks/useAudioSystem.js'
import useAuthStore from './store/useAuthStore.js'

export default function App() {
  useTrainingResultSync()
  useTrainingPersistenceBootstrap()
  useSettingsEffects()
  useAudioSystem()
  const checkSession = useAuthStore((state) => state.checkSession)

  useEffect(() => {
    checkSession()
  }, [checkSession])

  return (
    <BrowserRouter>
      <SessionExpiryHandler />
      <ApplicationErrorBoundary>
        <AppRoutes />
      </ApplicationErrorBoundary>
    </BrowserRouter>
  )
}
