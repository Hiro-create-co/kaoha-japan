import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import { useGeolocation } from '../hooks/useGeolocation'

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

export default function MapPage({ visits, addVisit }) {
  const { t, i18n } = useTranslation()
  const [panels, setPanels] = useState([])
  const { position, loading, getCurrentPosition } = useGeolocation()
  const [flyTarget, setFlyTarget] = useState(null)
  const isJa = i18n.language === 'ja'

  useEffect(() => {
    fetch('/data/panels.json')
      .then((r) => r.json())
      .then(setPanels)
      .catch(console.error)
  }, [])

  const isVisited = (panelId) => visits.some((v) => v.panelId === panelId)

  useEffect(() => {
    if (position) setFlyTarget(position)
  }, [position])

  const visitedCount = visits.length
  const totalCount = panels.length

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

          {panels.map((panel) => {
            const visited = isVisited(panel.id)
            return (
              <Marker
                key={panel.id}
                position={[panel.lat, panel.lng]}
                icon={visited ? visitedIcon : unvisitedIcon}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-extrabold text-base mb-1 leading-tight">
                      {isJa ? panel.name : panel.nameEn}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <span>📍</span> {isJa ? panel.prefecture : panel.prefectureEn}
                    </p>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {isJa ? panel.description : panel.descriptionEn}
                    </p>
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
    </div>
  )
}
