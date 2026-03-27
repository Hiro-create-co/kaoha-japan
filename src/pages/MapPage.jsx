import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
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

const makeIcon = (emoji) => new L.DivIcon({
  className: '',
  html: `<div style="font-size:28px;text-align:center;line-height:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.3))">${emoji}</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const visitedIcon = makeIcon('✅')
const unvisitedIcon = makeIcon('🎭')
const userPanelIcon = makeIcon('📌')
const userVisitedIcon = makeIcon('🏅')

const myLocationIcon = new L.DivIcon({
  className: '',
  html: '<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 2px #3b82f6,0 2px 8px rgba(0,0,0,0.3)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

const createClusterIcon = (cluster) => {
  const count = cluster.getChildCount()
  let size = 'small'
  let bg = '#3b82f6'
  if (count >= 20) { size = 'large'; bg = '#e74c3c' }
  else if (count >= 10) { size = 'medium'; bg = '#f39c12' }
  const dim = size === 'large' ? 48 : size === 'medium' ? 42 : 36
  return L.divIcon({
    html: `<div style="background:${bg};color:white;width:${dim}px;height:${dim}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:${dim > 40 ? 15 : 13}px;box-shadow:0 3px 12px rgba(0,0,0,0.25);border:3px solid white">${count}</div>`,
    className: '',
    iconSize: [dim, dim],
    iconAnchor: [dim / 2, dim / 2],
  })
}

const PREFECTURES_FILTER = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
]

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
  const [selectedPrefecture, setSelectedPrefecture] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const isJa = i18n.language === 'ja'

  useEffect(() => {
    fetch('/data/panels.json')
      .then((r) => r.json())
      .then((data) => setMasterPanels(data.map((p) => ({ ...p, source: 'master' }))))
      .catch(console.error)
  }, [])

  const allPanels = useMemo(() => [...masterPanels, ...userPanels], [masterPanels, userPanels])

  const filteredPanels = useMemo(() => {
    if (!selectedPrefecture) return allPanels
    return allPanels.filter((p) => p.prefecture === selectedPrefecture)
  }, [allPanels, selectedPrefecture])

  const isVisited = (panelId) => visits.some((v) => v.panelId === panelId)

  useEffect(() => {
    if (position) setFlyTarget(position)
  }, [position])

  const visitedCount = visits.length
  const totalCount = allPanels.length

  const getIcon = (panel, visited) => {
    if (panel.source === 'user') return visited ? userVisitedIcon : userPanelIcon
    return visited ? visitedIcon : unvisitedIcon
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Top controls */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between gap-2">
        <div className="flex gap-2 flex-wrap">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-white/50">
            <span className="text-xs font-bold text-gray-600">🎭 {totalCount}</span>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-white/50">
            <span className="text-xs font-bold text-green-600">✅ {visitedCount}</span>
          </div>
          {/* Prefecture filter toggle */}
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border text-xs font-bold transition ${
              selectedPrefecture ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-white/50 text-gray-600'
            }`}
          >
            🔍 {selectedPrefecture || t('map.filter')}
          </button>
        </div>
        <button
          onClick={() => getCurrentPosition()}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-sm text-gray-700 rounded-xl text-xs font-bold shadow-lg border border-white/50 hover:bg-white transition disabled:opacity-50 active:scale-95 shrink-0"
        >
          {loading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <span style={{ color: '#3b82f6' }}>●</span>
          )}
          {t('map.myLocation')}
        </button>
      </div>

      {/* Prefecture filter dropdown */}
      {showFilter && (
        <div className="absolute top-16 left-3 right-3 z-[1000] bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 p-3 max-h-60 overflow-y-auto">
          <button
            onClick={() => { setSelectedPrefecture(''); setShowFilter(false) }}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition ${
              !selectedPrefecture ? 'bg-red-50 text-[var(--color-primary)] font-bold' : 'hover:bg-gray-50'
            }`}
          >
            {t('map.allPrefectures')}
          </button>
          <div className="grid grid-cols-3 gap-1 mt-1">
            {PREFECTURES_FILTER.map((pref) => (
              <button
                key={pref}
                onClick={() => { setSelectedPrefecture(pref); setShowFilter(false) }}
                className={`text-left px-2 py-1.5 rounded-lg text-xs font-medium transition truncate ${
                  selectedPrefecture === pref ? 'bg-red-50 text-[var(--color-primary)] font-bold' : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                {pref}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Panel button - positioned above attribution */}
      <button
        onClick={() => setShowAddModal(true)}
        className="absolute bottom-12 right-4 z-[1000] flex items-center gap-2 px-5 py-3 text-white rounded-2xl font-bold text-sm shadow-xl transition-all hover:opacity-90 active:scale-95"
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

          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterIcon}
            maxClusterRadius={50}
            spiderfyOnMaxZoom
            showCoverageOnHover={false}
          >
            {filteredPanels.map((panel) => {
              const visited = isVisited(panel.id)
              const isUser = panel.source === 'user'
              return (
                <Marker
                  key={panel.id}
                  position={[panel.lat, panel.lng]}
                  icon={getIcon(panel, visited)}
                >
                  <Popup>
                    <div className="min-w-[200px] max-w-[260px]">
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

                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          📍 {isJa ? panel.prefecture : (panel.prefectureEn || panel.prefecture)}
                        </span>
                        {isUser ? (
                          <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full font-bold">
                            {t('map.userSubmitted')}
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full font-bold">
                            {t('map.unverified')}
                          </span>
                        )}
                      </div>

                      {panel.description && (
                        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
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
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      <AddPanelModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addUserPanel}
      />
    </div>
  )
}
