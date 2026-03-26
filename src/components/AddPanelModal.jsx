import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const PREFECTURES = [
  { ja: '北海道', en: 'Hokkaido' }, { ja: '青森県', en: 'Aomori' }, { ja: '岩手県', en: 'Iwate' },
  { ja: '宮城県', en: 'Miyagi' }, { ja: '秋田県', en: 'Akita' }, { ja: '山形県', en: 'Yamagata' },
  { ja: '福島県', en: 'Fukushima' }, { ja: '茨城県', en: 'Ibaraki' }, { ja: '栃木県', en: 'Tochigi' },
  { ja: '群馬県', en: 'Gunma' }, { ja: '埼玉県', en: 'Saitama' }, { ja: '千葉県', en: 'Chiba' },
  { ja: '東京都', en: 'Tokyo' }, { ja: '神奈川県', en: 'Kanagawa' }, { ja: '新潟県', en: 'Niigata' },
  { ja: '富山県', en: 'Toyama' }, { ja: '石川県', en: 'Ishikawa' }, { ja: '福井県', en: 'Fukui' },
  { ja: '山梨県', en: 'Yamanashi' }, { ja: '長野県', en: 'Nagano' }, { ja: '岐阜県', en: 'Gifu' },
  { ja: '静岡県', en: 'Shizuoka' }, { ja: '愛知県', en: 'Aichi' }, { ja: '三重県', en: 'Mie' },
  { ja: '滋賀県', en: 'Shiga' }, { ja: '京都府', en: 'Kyoto' }, { ja: '大阪府', en: 'Osaka' },
  { ja: '兵庫県', en: 'Hyogo' }, { ja: '奈良県', en: 'Nara' }, { ja: '和歌山県', en: 'Wakayama' },
  { ja: '鳥取県', en: 'Tottori' }, { ja: '島根県', en: 'Shimane' }, { ja: '岡山県', en: 'Okayama' },
  { ja: '広島県', en: 'Hiroshima' }, { ja: '山口県', en: 'Yamaguchi' }, { ja: '徳島県', en: 'Tokushima' },
  { ja: '香川県', en: 'Kagawa' }, { ja: '愛媛県', en: 'Ehime' }, { ja: '高知県', en: 'Kochi' },
  { ja: '福岡県', en: 'Fukuoka' }, { ja: '佐賀県', en: 'Saga' }, { ja: '長崎県', en: 'Nagasaki' },
  { ja: '熊本県', en: 'Kumamoto' }, { ja: '大分県', en: 'Oita' }, { ja: '宮崎県', en: 'Miyazaki' },
  { ja: '鹿児島県', en: 'Kagoshima' }, { ja: '沖縄県', en: 'Okinawa' },
]

export default function AddPanelModal({ isOpen, onClose, onSubmit, initialLat, initialLng }) {
  const { t, i18n } = useTranslation()
  const isJa = i18n.language === 'ja'
  const fileInputRef = useRef(null)

  const [name, setName] = useState('')
  const [prefecture, setPrefecture] = useState('')
  const [description, setDescription] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [imageData, setImageData] = useState(null)
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    if (initialLat && initialLng) {
      setLat(String(initialLat))
      setLng(String(initialLng))
    }
  }, [initialLat, initialLng])

  const handleGetLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(4))
        setLng(pos.coords.longitude.toFixed(4))
        setLocating(false)
        setUseCurrentLocation(true)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImageData(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !lat || !lng) return

    const pref = PREFECTURES.find((p) => p.ja === prefecture)
    onSubmit({
      name: name.trim(),
      nameEn: name.trim(),
      prefecture: prefecture || '不明',
      prefectureEn: pref?.en || 'Unknown',
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      description: description.trim() || '',
      descriptionEn: description.trim() || '',
      image: imageData,
    })

    // Reset
    setName('')
    setPrefecture('')
    setDescription('')
    setLat('')
    setLng('')
    setImageData(null)
    setUseCurrentLocation(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg font-extrabold">🎭 {t('addPanel.title')}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Photo */}
          <div>
            <label className="text-sm font-bold text-gray-600 mb-2 block">{t('addPanel.photo')}</label>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
            {imageData ? (
              <div className="relative">
                <img src={imageData} alt="" className="w-full h-48 object-cover rounded-2xl border-2 border-gray-200" />
                <button
                  type="button"
                  onClick={() => setImageData(null)}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-36 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition"
              >
                <span className="text-3xl">📷</span>
                <span className="text-sm font-bold">{t('addPanel.tapToPhoto')}</span>
              </button>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-bold text-gray-600 mb-1.5 block">{t('addPanel.name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('addPanel.namePlaceholder')}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[var(--color-primary)] focus:outline-none transition"
            />
          </div>

          {/* Prefecture */}
          <div>
            <label className="text-sm font-bold text-gray-600 mb-1.5 block">{t('addPanel.prefecture')}</label>
            <select
              value={prefecture}
              onChange={(e) => setPrefecture(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[var(--color-primary)] focus:outline-none transition bg-white"
            >
              <option value="">{t('addPanel.selectPrefecture')}</option>
              {PREFECTURES.map((p) => (
                <option key={p.ja} value={p.ja}>{isJa ? p.ja : p.en}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-bold text-gray-600 mb-1.5 block">{t('addPanel.location')}</label>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locating}
              className="w-full mb-2 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold border border-blue-200 hover:bg-blue-100 transition disabled:opacity-50"
            >
              {locating ? '⏳ ...' : `● ${t('addPanel.useCurrentLocation')}`}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder={t('addPanel.lat')}
                required
                className="px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[var(--color-primary)] focus:outline-none transition"
              />
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder={t('addPanel.lng')}
                required
                className="px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[var(--color-primary)] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-bold text-gray-600 mb-1.5 block">{t('addPanel.description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('addPanel.descriptionPlaceholder')}
              rows={2}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[var(--color-primary)] focus:outline-none transition resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim() || !lat || !lng}
            className="w-full py-3.5 text-white rounded-2xl font-bold text-base transition-all hover:opacity-90 active:scale-[0.97] shadow-lg disabled:opacity-40 disabled:shadow-none"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}
          >
            🎭 {t('addPanel.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
