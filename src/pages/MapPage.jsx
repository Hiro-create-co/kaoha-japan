import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { useGeolocation } from '../hooks/useGeolocation'
import AddPanelModal from '../components/AddPanelModal'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const makeIcon = (emoji, size = 30) => new L.DivIcon({
  className: '',
  html: `<div style="font-size:${size}px;text-align:center;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.2))">${emoji}</div>`,
  iconSize: [size + 4, size + 4],
  iconAnchor: [(size + 4) / 2, (size + 4) / 2],
})

const visitedIcon = makeIcon('✅')
const unvisitedIcon = makeIcon('🎭')
const userPanelIcon = makeIcon('📌')
const userVisitedIcon = makeIcon('🏅')

const myLocationIcon = new L.DivIcon({
  className: '',
  html: '<div style="width:16px;height:16px;background:linear-gradient(135deg,#4ECDC4,#6BCB77);border:3px solid white;border-radius:50%;box-shadow:0 0 0 2px #4ECDC4,0 2px 8px rgba(0,0,0,0.3)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

const createClusterIcon = (cluster) => {
  const count = cluster.getChildCount()
  let bg, border, size
  if (count >= 20) {
    bg = 'linear-gradient(135deg, #FF6B6B, #ee5a5a)'
    border = '#FF6B6B'
    size = 50
  } else if (count >= 10) {
    bg = 'linear-gradient(135deg, #FFD93D, #f0c830)'
    border = '#FFD93D'
    size = 44
  } else {
    bg = 'linear-gradient(135deg, #4ECDC4, #6BCB77)'
    border = '#4ECDC4'
    size = 38
  }
  return L.divIcon({
    html: `<div style="background:${bg};color:white;width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:${size > 44 ? 16 : 14}px;box-shadow:0 4px 15px ${border}40,0 2px 6px rgba(0,0,0,0.15);border:3px solid white;font-family:'Nunito',sans-serif">${count}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
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
    if (position) map.flyTo([position.lat, position.lng], 12, { duration: 1.5 })
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
  useEffect(() => { if (position) setFlyTarget(position) }, [position])

  const visitedCount = visits.length
  const totalCount = allPanels.length

  const getIcon = (panel, visited) => {
    if (panel.source === 'user') return visited ? userVisitedIcon : userPanelIcon
    return visited ? visitedIcon : unvisitedIcon
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Top floating controls */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          <div className="rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5" style={{ background: 'linear-gradient(135deg, #FF6B6B, #ff8e8e)', boxShadow: '0 4px 15px rgba(255,107,107,0.3)' }}>
            <span className="text-xs">🎭</span>
            <span className="text-xs font-black text-white">{totalCount}</span>
          </div>
          <div className="rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5" style={{ background: 'linear-gradient(135deg, #6BCB77, #4ECDC4)', boxShadow: '0 4px 15px rgba(107,203,119,0.3)' }}>
            <span className="text-xs">✅</span>
            <span className="text-xs font-black text-white">{visitedCount}</span>
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="rounded-full px-3 py-1.5 shadow-lg text-xs font-bold transition-all active:scale-95"
            style={{
              background: selectedPrefecture ? 'linear-gradient(135deg, #FFD93D, #f0c830)' : 'white',
              color: selectedPrefecture ? 'white' : '#9a8585',
              boxShadow: selectedPrefecture ? '0 4px 15px rgba(255,217,61,0.3)' : '0 4px 15px rgba(0,0,0,0.08)',
            }}
          >
            🔍 {selectedPrefecture || t('map.filter')}
          </button>
        </div>
        <button
          onClick={() => getCurrentPosition()}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all disabled:opacity-50 active:scale-95 shrink-0 text-white"
          style={{ background: 'linear-gradient(135deg, #4ECDC4, #6BCB77)', boxShadow: '0 4px 15px rgba(78,205,196,0.3)' }}
        >
          {loading ? <span className="animate-spin">⏳</span> : <span>📍</span>}
          {t('map.myLocation')}
        </button>
      </div>

      {/* Prefecture filter dropdown */}
      {showFilter && (
        <div className="absolute top-14 left-3 right-3 z-[1000] rounded-2xl shadow-2xl border border-[#ffe8e0] p-3 max-h-64 overflow-y-auto" style={{ background: 'rgba(255,248,240,0.98)', backdropFilter: 'blur(20px)' }}>
          <button
            onClick={() => { setSelectedPrefecture(''); setShowFilter(false) }}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition ${
              !selectedPrefecture ? 'text-[var(--color-primary)]' : 'hover:bg-white/50 text-[var(--color-text-light)]'
            }`}
            style={!selectedPrefecture ? { background: 'linear-gradient(135deg, #FF6B6B10, #FFD93D10)' } : {}}
          >
            {t('map.allPrefectures')}
          </button>
          <div className="grid grid-cols-3 gap-1 mt-1">
            {PREFECTURES_FILTER.map((pref) => (
              <button
                key={pref}
                onClick={() => { setSelectedPrefecture(pref); setShowFilter(false) }}
                className={`text-left px-2 py-1.5 rounded-lg text-xs font-medium transition truncate ${
                  selectedPrefecture === pref ? 'font-bold text-white' : 'hover:bg-white/60 text-[var(--color-text-light)]'
                }`}
                style={selectedPrefecture === pref ? { background: 'linear-gradient(135deg, #FF6B6B, #ff8e8e)' } : {}}
              >
                {pref}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Found Panel button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="absolute bottom-12 right-4 z-[1000] flex items-center gap-2 px-5 py-3 text-white rounded-full font-black text-sm shadow-xl transition-all hover:scale-105 active:scale-95 animate-bounce-soft"
        style={{ background: 'linear-gradient(135deg, #FF6B6B, #FFD93D)', boxShadow: '0 6px 25px rgba(255,107,107,0.4)' }}
      >
        📌 {t('map.addPanel')}
      </button>

      {/* Map */}
      <div className="flex-1">
        <MapContainer center={[36.5, 137.5]} zoom={5} className="h-full w-full" zoomControl={false}>
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
                pathOptions={{ color: '#4ECDC4', fillColor: '#4ECDC4', fillOpacity: 0.1, weight: 2 }}
              />
            </>
          )}
          <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterIcon} maxClusterRadius={50} spiderfyOnMaxZoom showCoverageOnHover={false}>
            {filteredPanels.map((panel) => {
              const visited = isVisited(panel.id)
              const isUser = panel.source === 'user'
              return (
                <Marker key={panel.id} position={[panel.lat, panel.lng]} icon={getIcon(panel, visited)}>
                  <Popup>
                    <div className="min-w-[200px] max-w-[260px]">
                      {panel.image && (
                        <img src={panel.image} alt={panel.name} className="w-full h-32 object-cover rounded-2xl mb-3" style={{ border: '2px solid #ffe8e0' }} />
                      )}
                      <h3 className="font-black text-base mb-1 leading-tight" style={{ color: 'var(--color-text)' }}>
                        {isJa ? panel.name : (panel.nameEn || panel.name)}
                      </h3>
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-light)' }}>
                          📍 {isJa ? panel.prefecture : (panel.prefectureEn || panel.prefecture)}
                        </span>
                        {isUser ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white" style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)' }}>
                            {t('map.userSubmitted')}
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: '#FFF0E0', color: '#e0a050' }}>
                            {t('map.unverified')}
                          </span>
                        )}
                      </div>
                      {panel.description && (
                        <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--color-text-light)' }}>
                          {isJa ? panel.description : (panel.descriptionEn || panel.description)}
                        </p>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-black" style={{ color: 'var(--color-secondary-dark)' }}>
                          🎯 +{panel.points} pt
                        </span>
                      </div>
                      {visited ? (
                        <div className="text-center text-sm px-4 py-2.5 rounded-xl font-bold" style={{ background: 'linear-gradient(135deg, #6BCB7715, #4ECDC415)', color: '#6BCB77', border: '1.5px solid #6BCB7730' }}>
                          ✅ {t('map.alreadyVisited')}
                        </div>
                      ) : (
                        <button
                          onClick={() => addVisit(panel.id)}
                          className="w-full text-sm px-4 py-2.5 text-white rounded-xl font-black transition-all hover:opacity-90 active:scale-[0.97]"
                          style={{ background: 'linear-gradient(135deg, #FF6B6B, #FFD93D)', boxShadow: '0 4px 15px rgba(255,107,107,0.3)' }}
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

      <AddPanelModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={addUserPanel} />
    </div>
  )
}
