import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './app/AppRoutes.jsx'
import useTrainingResultSync from './hooks/useTrainingResultSync.js'

export default function App() {
  useTrainingResultSync()

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
