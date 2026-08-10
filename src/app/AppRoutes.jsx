import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx'
import PublicOnlyRoute from '../components/auth/PublicOnlyRoute.jsx'
import RoleRoute from '../components/auth/RoleRoute.jsx'
import ApplicationShell from '../components/layout/ApplicationShell.jsx'
import InstructorShell from '../components/layout/InstructorShell.jsx'
import AccessRestrictedPage from '../pages/AccessRestrictedPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import InstructorModulesPage from '../pages/InstructorModulesPage.jsx'
import InstructorOverviewPage from '../pages/InstructorOverviewPage.jsx'
import InstructorResultsPage from '../pages/InstructorResultsPage.jsx'
import InstructorStudentDetailPage from '../pages/InstructorStudentDetailPage.jsx'
import InstructorStudentsPage from '../pages/InstructorStudentsPage.jsx'
import InstructorTroubleshootingPage from '../pages/InstructorTroubleshootingPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import ProfilePage from '../pages/ProfilePage.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'
import ResultsPage from '../pages/ResultsPage.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'
import TelecomLabPage from '../pages/TelecomLabPage.jsx'
import TrainingModulesPage from '../pages/TrainingModulesPage.jsx'
import { STAFF_ROLES } from '../utils/roleRoutes.js'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="access-restricted" element={<AccessRestrictedPage />} />

        <Route element={<RoleRoute allowedRoles={['student']} redirectTo="/instructor" />}>
          <Route element={<ApplicationShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="training" element={<TrainingModulesPage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="lab" element={<TelecomLabPage />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={STAFF_ROLES} />}>
          <Route path="instructor" element={<InstructorShell />}>
            <Route index element={<InstructorOverviewPage />} />
            <Route path="students" element={<InstructorStudentsPage />} />
            <Route
              path="students/:studentId"
              element={<InstructorStudentDetailPage />}
            />
            <Route path="modules" element={<InstructorModulesPage />} />
            <Route path="results" element={<InstructorResultsPage />} />
            <Route
              path="troubleshooting"
              element={<InstructorTroubleshootingPage />}
            />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
