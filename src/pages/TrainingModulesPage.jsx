import ModuleCard from '../components/dashboard/ModuleCard.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import useTrainingLaunch from '../hooks/useTrainingLaunch.js'
import useTrainingOverview from '../hooks/useTrainingOverview.js'

export default function TrainingModulesPage() {
  const launchTraining = useTrainingLaunch()
  const overview = useTrainingOverview()

  return (
    <div className="application-page training-modules-page">
      <PageHeader
        eyebrow="Virtual Practical Laboratory"
        title="Training Modules"
        description="Select a guided procedure, enter the 3D laboratory, and complete the verified practical assessment."
      />

      <div className="training-catalog-summary">
        <span>3 practical modules</span>
        <span>
          {overview.completedCount === null
            ? 'Loading completed modules'
            : `${overview.completedCount} completed`}
        </span>
        <span>Progress saved to your account</span>
      </div>

      <section className="training-module-grid training-catalog-grid" aria-label="Available training modules">
        {!overview.hasProgress && overview.isLoadingProgress
          ? [1, 2, 3].map((item) => (
              <div key={item} className="module-card-skeleton" aria-hidden="true" />
            ))
          : !overview.hasProgress && overview.progressError
            ? (
                <div className="dashboard-inline-error">
                  <span>Unable to load training progress.</span>
                  <button type="button" onClick={overview.retryProgress}>Retry</button>
                </div>
              )
            : overview.modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  onLaunch={launchTraining}
                />
              ))}
      </section>
    </div>
  )
}
