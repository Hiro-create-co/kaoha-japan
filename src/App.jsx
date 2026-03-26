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

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between px-5 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-40 shadow-sm">
        <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-primary)' }}>
          🎭 カオハJAPAN
        </h1>
        <button
          onClick={toggleLang}
          className="text-xs font-bold px-4 py-1.5 rounded-full border-2 border-gray-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors bg-white"
        >
          {i18n.language === 'ja' ? 'EN' : 'JA'}
        </button>
      </header>

      <main className="flex-1 overflow-auto pb-safe">
        <Routes>
          <Route path="/" element={<MapPage visits={visits} addVisit={addVisit} />} />
          <Route path="/points" element={<PointsPage visits={visits} />} />
          <Route path="/contest" element={<ContestPage photos={photos} addPhoto={addPhoto} deletePhoto={deletePhoto} />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  )
}
