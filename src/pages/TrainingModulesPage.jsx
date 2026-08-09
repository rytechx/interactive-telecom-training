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
        <span>{overview.completedCount} completed this session</span>
        <span>No database persistence yet</span>
      </div>

      <section className="training-module-grid training-catalog-grid" aria-label="Available training modules">
        {overview.modules.map((module) => (
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
