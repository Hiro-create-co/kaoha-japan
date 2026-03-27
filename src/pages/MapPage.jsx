import { useState, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { Navigation, Plus, Search, MapPin, Check, X } from 'lucide-react'
import { useGeolocation } from '../hooks/useGeolocation'
import AddPanelModal from '../components/AddPanelModal'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const makeDotIcon = (color, size = 12) => new L.DivIcon({
  className: '',
  html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.2)"></div>`,
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2],
})

const visitedIcon = makeDotIcon('#7C9A82', 14)
const unvisitedIcon = makeDotIcon('#F4845F', 12)
const userPanelIcon = makeDotIcon('#8B5CF6', 12)
const userVisitedIcon = makeDotIcon('#7C9A82', 14)

const myLocationIcon = new L.DivIcon({
  className: '',
  html: '<div style="width:14px;height:14px;background:#3B82F6;border:2.5px solid white;border-radius:50%;box-shadow:0 0 0 2px rgba(59,130,246,0.3),0 1px 4px rgba(0,0,0,0.2)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

const createClusterIcon = (cluster) => {
  const count = cluster.getChildCount()
  const size = count >= 20 ? 44 : count >= 10 ? 38 : 32
  return L.divIcon({
    html: `<div style="background:white;color:#1a1a1a;width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${size > 38 ? 14 : 12}px;box-shadow:0 2px 8px rgba(0,0,0,0.12),0 0 0 1px rgba(0,0,0,0.06);font-family:'Inter','Noto Sans JP',system-ui,sans-serif">${count}</div>`,
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

function MarkerClusterLayer({ panels, getIcon, isVisited, isJa, addVisit, t }) {
  const map = useMap()
  const clusterRef = useRef(null)

  useEffect(() => {
    if (!map) return

    if (clusterRef.current) {
      map.removeLayer(clusterRef.current)
    }

    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: createClusterIcon,
    })

    panels.forEach((panel) => {
      const visited = isVisited(panel.id)
      const isUser = panel.source === 'user'
      const marker = L.marker([panel.lat, panel.lng], { icon: getIcon(panel, visited) })

      const popupHtml = `
        <div style="min-width:220px;max-width:260px;font-family:inherit">
          ${panel.image ? `<img src="${panel.image}" style="width:100%;height:144px;object-fit:cover;border-radius:12px;margin-bottom:12px" />` : ''}
          <h3 style="font-weight:700;font-size:15px;margin-bottom:4px;line-height:1.3;color:var(--color-text)">
            ${isJa ? panel.name : (panel.nameEn || panel.name)}
          </h3>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:12px;color:var(--color-text-secondary)">📍 ${isJa ? panel.prefecture : (panel.prefectureEn || panel.prefecture)}</span>
            ${isUser
              ? `<span style="font-size:10px;padding:2px 6px;background:#f5f3ff;color:#8b5cf6;border-radius:4px;font-weight:500">${t('map.userSubmitted')}</span>`
              : `<span style="font-size:10px;padding:2px 6px;background:#fffbeb;color:#f59e0b;border-radius:4px;font-weight:500">${t('map.unverified')}</span>`
            }
          </div>
          ${panel.description ? `<p style="font-size:12px;color:var(--color-text-secondary);margin-bottom:12px;line-height:1.6">${isJa ? panel.description : (panel.descriptionEn || panel.description)}</p>` : ''}
          <p style="font-size:12px;font-weight:600;color:var(--color-primary);margin-bottom:12px">+${panel.points} pt</p>
          ${visited
            ? `<div style="text-align:center;font-size:14px;padding:8px 16px;background:var(--color-sage-light);color:var(--color-sage);border-radius:12px;font-weight:600">${t('map.alreadyVisited')}</div>`
            : `<button data-visit-panel="${panel.id}" style="width:100%;font-size:14px;padding:8px 16px;background:var(--color-primary);color:white;border:none;border-radius:12px;font-weight:600;cursor:pointer">${t('map.visit')}</button>`
          }
        </div>
      `
      marker.bindPopup(popupHtml)
      cluster.addLayer(marker)
    })

    map.addLayer(cluster)
    clusterRef.current = cluster

    const handleClick = (e) => {
      const panelId = e.target?.dataset?.visitPanel
      if (panelId) addVisit(panelId)
    }
    map.getContainer().addEventListener('click', handleClick)

    return () => {
      map.getContainer().removeEventListener('click', handleClick)
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current)
        clusterRef.current = null
      }
    }
  }, [map, panels, isJa, t])

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
      {/* Top bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-white/90 backdrop-blur-md rounded-full px-3.5 py-2 shadow-sm border border-black/[0.04] flex items-center gap-3">
            <span className="text-xs font-semibold text-[var(--color-text)]">{totalCount} <span className="text-[var(--color-text-tertiary)] font-normal">{t('map.panels')}</span></span>
            <span className="w-px h-3 bg-[var(--color-border-strong)]"></span>
            <span className="text-xs font-semibold text-[var(--color-sage)]">{visitedCount} <span className="text-[var(--color-text-tertiary)] font-normal">{t('map.visited')}</span></span>
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`bg-white/90 backdrop-blur-md rounded-full p-2 shadow-sm border transition-all active:scale-95 ${
              selectedPrefecture ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-black/[0.04] text-[var(--color-text-secondary)]'
            }`}
          >
            <Search size={16} />
          </button>
        </div>
        <button
          onClick={() => getCurrentPosition()}
          disabled={loading}
          className="bg-white/90 backdrop-blur-md rounded-full p-2 shadow-sm border border-black/[0.04] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-all active:scale-95 disabled:opacity-50"
        >
          <Navigation size={16} className={loading ? 'animate-pulse' : ''} />
        </button>
      </div>

      {/* Filter dropdown */}
      {showFilter && (
        <div className="absolute top-14 left-3 right-3 z-[1000] bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-[var(--color-border)] p-2 max-h-72 overflow-y-auto">
          {selectedPrefecture && (
            <div className="flex items-center justify-between px-3 py-2 mb-1">
              <span className="text-xs font-semibold text-[var(--color-primary)]">{selectedPrefecture}</span>
              <button onClick={() => { setSelectedPrefecture(''); setShowFilter(false) }} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]">
                <X size={14} />
              </button>
            </div>
          )}
          <button
            onClick={() => { setSelectedPrefecture(''); setShowFilter(false) }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
              !selectedPrefecture ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold' : 'hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)]'
            }`}
          >
            {t('map.allPrefectures')}
          </button>
          <div className="grid grid-cols-3 gap-0.5 mt-1">
            {PREFECTURES_FILTER.map((pref) => (
              <button
                key={pref}
                onClick={() => { setSelectedPrefecture(pref); setShowFilter(false) }}
                className={`text-left px-2.5 py-2 rounded-lg text-xs transition truncate ${
                  selectedPrefecture === pref ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold' : 'hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)]'
                }`}
              >
                {pref}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add panel FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="absolute bottom-14 right-4 z-[1000] flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-full font-semibold text-sm shadow-lg transition-all hover:shadow-xl active:scale-95"
        style={{ boxShadow: '0 4px 20px rgba(244,132,95,0.35)' }}
      >
        <Plus size={16} strokeWidth={2.5} />
        {t('map.addPanel')}
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
              <Circle center={[position.lat, position.lng]} radius={500} pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.08, weight: 1.5 }} />
            </>
          )}
          <MarkerClusterLayer panels={filteredPanels} getIcon={getIcon} isVisited={isVisited} isJa={isJa} addVisit={addVisit} t={t} />
        </MapContainer>
      </div>

      <AddPanelModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={addUserPanel} />
    </div>
  )
}
