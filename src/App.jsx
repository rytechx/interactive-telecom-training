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
import MaintenancePage from './pages/MaintenancePage.jsx'

function NormalApplication() {
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

export default function App() {
  const maintenanceMode =
    import.meta.env.VITE_MAINTENANCE_MODE?.trim().toLowerCase() === 'true'

  if (maintenanceMode) {
    return <MaintenancePage />
  }

  return <NormalApplication />
}
