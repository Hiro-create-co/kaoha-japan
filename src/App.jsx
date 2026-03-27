import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import BottomNav from './components/BottomNav'
import MapPage from './pages/MapPage'
import PointsPage from './pages/PointsPage'
import ContestPage from './pages/ContestPage'
import { useLocalStorage } from './hooks/useLocalStorage'

export default function App() {
  const { i18n } = useTranslation()
  const [visits, setVisits] = useLocalStorage('kaoha-visits', [])
  const [photos, setPhotos] = useLocalStorage('kaoha-photos', [])
  const [userPanels, setUserPanels] = useLocalStorage('kaoha-user-panels', [])

  const toggleLang = () => {
    const newLang = i18n.language === 'ja' ? 'en' : 'ja'
    i18n.changeLanguage(newLang)
  }

  const addVisit = (panelId) => {
    if (visits.some((v) => v.panelId === panelId)) return
    setVisits((prev) => [...prev, { panelId, visitedAt: new Date().toISOString() }])
  }

  const addPhoto = (photo) => {
    setPhotos((prev) => [...prev, { ...photo, id: Date.now(), createdAt: new Date().toISOString() }])
  }

  const deletePhoto = (id) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  const addUserPanel = (panel) => {
    setUserPanels((prev) => [...prev, {
      ...panel,
      id: `user-${Date.now()}`,
      points: 10,
      source: 'user',
      createdAt: new Date().toISOString(),
    }])
  }

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg)]">
      <header className="flex items-center justify-between px-5 py-3 bg-white/80 backdrop-blur-xl border-b border-[var(--color-border)] sticky top-0 z-40">
        <h1 className="text-[15px] font-bold tracking-tight text-[var(--color-text)]">
          カオハJAPAN
        </h1>
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-[var(--color-border)]"
        >
          <Globe size={14} />
          {i18n.language === 'ja' ? 'EN' : 'JA'}
        </button>
      </header>

      <main className="flex-1 overflow-auto pb-safe">
        <Routes>
          <Route path="/" element={<MapPage visits={visits} addVisit={addVisit} userPanels={userPanels} addUserPanel={addUserPanel} />} />
          <Route path="/points" element={<PointsPage visits={visits} userPanels={userPanels} />} />
          <Route path="/contest" element={<ContestPage photos={photos} addPhoto={addPhoto} deletePhoto={deletePhoto} />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  )
}
