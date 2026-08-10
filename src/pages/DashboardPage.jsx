import { useNavigate } from 'react-router-dom'
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx'
import ModuleCard from '../components/dashboard/ModuleCard.jsx'
import OverallProgressCard from '../components/dashboard/OverallProgressCard.jsx'
import RecentActivity from '../components/dashboard/RecentActivity.jsx'
import SkillsOverview from '../components/dashboard/SkillsOverview.jsx'
import useTrainingLaunch from '../hooks/useTrainingLaunch.js'
import useTrainingOverview from '../hooks/useTrainingOverview.js'

export default function DashboardPage() {
  const navigate = useNavigate()
  const launchTraining = useTrainingLaunch()
  const overview = useTrainingOverview()

  return (
    <div className="application-page dashboard-page">
      <DashboardHeader onEnterLab={launchTraining} />

      <OverallProgressCard
        completedCount={overview.completedCount}
        overallProgress={overview.overallProgress}
        averageScore={overview.averageScore}
        isLoading={overview.isLoadingProgress}
        error={overview.progressError}
        onRetry={overview.retryProgress}
      />

      <section className="dashboard-modules-section" aria-labelledby="dashboard-modules-title">
        <div className="section-heading">
          <div>
            <span>Practical Training</span>
            <h2 id="dashboard-modules-title">Core Telecom Modules</h2>
          </div>
          <button type="button" onClick={() => navigate('/training')}>
            View All Modules
          </button>
        </div>
        <div className="training-module-grid">
          {!overview.hasProgress && overview.isLoadingProgress
            ? [1, 2, 3].map((item) => (
                <div key={item} className="module-card-skeleton" aria-hidden="true" />
              ))
            : !overview.hasProgress && overview.progressError
              ? (
                  <div className="dashboard-inline-error">
                    Training module progress is temporarily unavailable.
                  </div>
                )
              : overview.modules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    onLaunch={launchTraining}
                    compact
                  />
                ))}
        </div>
      </section>

      <div className="dashboard-lower-grid">
        <RecentActivity
          recentResults={overview.recentResults}
          onStartTraining={() => navigate('/training')}
          onViewResults={() => navigate('/results')}
          isLoading={overview.isLoadingProgress && !overview.hasProgress}
        />
        <SkillsOverview skills={overview.skills} />
      </div>
    </div>
  )
}
