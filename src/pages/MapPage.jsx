import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import { useGeolocation } from '../hooks/useGeolocation'
import AddPanelModal from '../components/AddPanelModal'

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const visitedIcon = new L.DivIcon({
  className: '',
  html: '<div style="font-size:30px;text-align:center;line-height:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.3))">✅</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

const unvisitedIcon = new L.DivIcon({
  className: '',
  html: '<div style="font-size:30px;text-align:center;line-height:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.3))">🎭</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

const userPanelIcon = new L.DivIcon({
  className: '',
  html: '<div style="font-size:30px;text-align:center;line-height:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.3))">📌</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

const userVisitedIcon = new L.DivIcon({
  className: '',
  html: '<div style="font-size:30px;text-align:center;line-height:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.3))">🏅</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

const myLocationIcon = new L.DivIcon({
  className: '',
  html: '<div style="width:18px;height:18px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 2px #3b82f6,0 2px 8px rgba(0,0,0,0.3)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function FlyToLocation({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 12, { duration: 1.5 })
    }
  }, [position, map])
  return null
}

export default function MapPage({ visits, addVisit, userPanels, addUserPanel }) {
  const { t, i18n } = useTranslation()
  const [masterPanels, setMasterPanels] = useState([])
  const { position, loading, getCurrentPosition } = useGeolocation()
  const [flyTarget, setFlyTarget] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const isJa = i18n.language === 'ja'

  useEffect(() => {
    fetch('/data/panels.json')
      .then((r) => r.json())
      .then((data) => setMasterPanels(data.map((p) => ({ ...p, source: 'master' }))))
      .catch(console.error)
  }, [])

  // Merge master + user panels
  const allPanels = [...masterPanels, ...userPanels]

  const isVisited = (panelId) => visits.some((v) => v.panelId === panelId)

  useEffect(() => {
    if (position) setFlyTarget(position)
  }, [position])

  const visitedCount = visits.length
  const totalCount = allPanels.length

  const getIcon = (panel, visited) => {
    if (panel.source === 'user') {
      return visited ? userVisitedIcon : userPanelIcon
    }
    return visited ? visitedIcon : unvisitedIcon
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Floating stats */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-white/50">
            <span className="text-xs font-bold text-gray-600">🎭 {totalCount}</span>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-white/50">
            <span className="text-xs font-bold text-green-600">✅ {visitedCount}</span>
          </div>
        </div>
        <button
          onClick={() => getCurrentPosition()}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/95 backdrop-blur-sm text-gray-700 rounded-xl text-xs font-bold shadow-lg border border-white/50 hover:bg-white transition disabled:opacity-50 active:scale-95"
        >
          {loading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <span style={{ color: '#3b82f6' }}>●</span>
          )}
          {t('map.myLocation')}
        </button>
      </div>

      {/* Floating add button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="absolute bottom-5 right-4 z-10 flex items-center gap-2 px-5 py-3 text-white rounded-2xl font-bold text-sm shadow-xl transition-all hover:opacity-90 active:scale-95"
        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}
      >
        📌 {t('map.addPanel')}
      </button>

      {/* Map */}
      <div className="flex-1">
        <MapContainer
          center={[36.5, 137.5]}
          zoom={5}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {flyTarget && <FlyToLocation position={flyTarget} />}

          {position && (
            <>
              <Marker position={[position.lat, position.lng]} icon={myLocationIcon}>
                <Popup>{t('map.myLocation')}</Popup>
              </Marker>
              <Circle
                center={[position.lat, position.lng]}
                radius={500}
                pathOptions={{ color: '#3b82f6', fillColor: '#93c5fd', fillOpacity: 0.15, weight: 2 }}
              />
            </>
          )}

          {allPanels.map((panel) => {
            const visited = isVisited(panel.id)
            const isUser = panel.source === 'user'
            return (
              <Marker
                key={panel.id}
                position={[panel.lat, panel.lng]}
                icon={getIcon(panel, visited)}
              >
                <Popup>
                  <div className="min-w-[220px]">
                    {/* Image if available */}
                    {panel.image && (
                      <img
                        src={panel.image}
                        alt={panel.name}
                        className="w-full h-32 object-cover rounded-xl mb-3 border border-gray-200"
                      />
                    )}

                    <h3 className="font-extrabold text-base mb-1 leading-tight">
                      {isJa ? panel.name : (panel.nameEn || panel.name)}
                    </h3>

                    {/* Source badge */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        📍 {isJa ? panel.prefecture : (panel.prefectureEn || panel.prefecture)}
                      </span>
                      {isUser ? (
                        <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full font-bold">
                          {t('map.userSubmitted')}
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-full font-bold">
                          {t('map.unverified')}
                        </span>
                      )}
                    </div>

                    {panel.description && (
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {isJa ? panel.description : (panel.descriptionEn || panel.description)}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>
                        🎯 +{panel.points} pt
                      </span>
                    </div>

                    {visited ? (
                      <div className="text-center text-sm px-4 py-2.5 bg-green-50 text-green-600 rounded-xl font-bold border border-green-200">
                        ✅ {t('map.alreadyVisited')}
                      </div>
                    ) : (
                      <button
                        onClick={() => addVisit(panel.id)}
                        className="w-full text-sm px-4 py-2.5 text-white rounded-xl font-bold transition-all hover:opacity-90 active:scale-[0.97] shadow-md"
                        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}
                      >
                        🎭 {t('map.visit')}
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Add Panel Modal */}
      <AddPanelModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addUserPanel}
      />
    </div>
  )
}
