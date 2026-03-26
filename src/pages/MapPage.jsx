import { useState, useEffect, useRef } from 'react'
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
  html: '<div style="font-size:28px;text-align:center;line-height:1">🟢</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const unvisitedIcon = new L.DivIcon({
  className: '',
  html: '<div style="font-size:28px;text-align:center;line-height:1">🎭</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const myLocationIcon = new L.DivIcon({
  className: '',
  html: '<div style="font-size:24px;text-align:center;line-height:1">📍</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
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

  const handleLocate = () => {
    getCurrentPosition()
  }

  useEffect(() => {
    if (position) setFlyTarget(position)
  }, [position])

  const visitedCount = visits.length
  const totalCount = panels.length

  return (
    <div className="h-full flex flex-col relative">
      {/* Stats bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/90 backdrop-blur text-sm border-b border-gray-100">
        <span>
          🎭 {totalCount}{t('map.panels')} | ✅ {visitedCount}{t('map.visited')}
        </span>
        <button
          onClick={handleLocate}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? '...' : '📍'} {t('map.myLocation')}
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
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1 }}
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
                  <div className="min-w-[180px]">
                    <h3 className="font-bold text-sm mb-1">
                      {isJa ? panel.name : panel.nameEn}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1">
                      📍 {isJa ? panel.prefecture : panel.prefectureEn}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      {isJa ? panel.description : panel.descriptionEn}
                    </p>
                    <p className="text-xs font-medium mb-2">
                      🎯 {panel.points}{t('common.points')}
                    </p>
                    {visited ? (
                      <span className="inline-block text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        {t('map.alreadyVisited')}
                      </span>
                    ) : (
                      <button
                        onClick={() => addVisit(panel.id)}
                        className="w-full text-xs px-3 py-2 bg-[var(--color-primary)] text-white rounded-lg font-bold hover:bg-[var(--color-primary-dark)] transition"
                      >
                        {t('map.visit')}
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
