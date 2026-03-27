import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between px-4 py-2.5 sticky top-0 z-40" style={{ background: 'linear-gradient(135deg, #FF6B6B, #ff8e8e, #FFD93D)' }}>
        <h1 className="text-lg font-black tracking-tight text-white drop-shadow-sm flex items-center gap-1.5">
          <span className="text-xl">🎭</span>
          カオハJAPAN
        </h1>
        <button
          onClick={toggleLang}
          className="text-[10px] font-black px-3 py-1 rounded-full bg-white/25 text-white border border-white/40 hover:bg-white/40 transition-all active:scale-95 backdrop-blur-sm"
        >
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
