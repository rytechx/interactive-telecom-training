import { useNavigate } from 'react-router-dom'
import useAppSessionStore from '../store/useAppSessionStore.js'

export default function useTrainingLaunch() {
  const navigate = useNavigate()
  const selectTrainingModule = useAppSessionStore(
    (state) => state.selectTrainingModule,
  )

  return (moduleId = null) => {
    selectTrainingModule(moduleId)
    navigate('/lab')
  }
}
