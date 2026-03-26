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
      <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100 sticky top-0 z-40">
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
          🎭 カオハJAPAN
        </h1>
        <button
          onClick={toggleLang}
          className="text-xs px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-50 transition"
        >
          {i18n.language === 'ja' ? 'EN' : 'JA'}
        </button>
      </header>

      <main className="flex-1 overflow-auto pb-16">
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
