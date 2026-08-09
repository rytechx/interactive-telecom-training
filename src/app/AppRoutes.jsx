import { Navigate, Route, Routes } from 'react-router-dom'
import ApplicationShell from '../components/layout/ApplicationShell.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import ResultsPage from '../pages/ResultsPage.jsx'
import TelecomLabPage from '../pages/TelecomLabPage.jsx'
import TrainingModulesPage from '../pages/TrainingModulesPage.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<ApplicationShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="training" element={<TrainingModulesPage />} />
        <Route path="results" element={<ResultsPage />} />
      </Route>
      <Route path="lab" element={<TelecomLabPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
