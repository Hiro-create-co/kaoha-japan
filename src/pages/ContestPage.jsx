import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

export default function ContestPage({ photos, addPhoto, deletePhoto }) {
  const { t } = useTranslation()
  const fileInputRef = useRef(null)

  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      addPhoto({
        dataUrl: ev.target.result,
        fileName: file.name,
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const shareOnTwitter = (photo) => {
    const text = encodeURIComponent('カオハJAPANで顔ハメパネル巡り中！ 🎭 #カオハJAPAN #顔ハメ')
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  const shareOnLine = (photo) => {
    const text = encodeURIComponent('カオハJAPANで顔ハメパネル巡り中！ 🎭')
    window.open(`https://social-plugins.line.me/lineit/share?text=${text}`, '_blank')
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Upload section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 text-center">
        <span className="text-5xl">📸</span>
        <h2 className="text-lg font-bold mt-2">{t('contest.title')}</h2>
        <p className="text-sm text-gray-500 mt-1 mb-4">{t('contest.uploadHint')}</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-3 text-white rounded-xl font-bold text-sm transition hover:opacity-90 active:scale-95"
          style={{ background: 'var(--color-primary)' }}
        >
          📷 {t('contest.upload')}
        </button>
      </div>

      {/* Gallery */}
      <h3 className="font-bold text-sm mb-3">{t('contest.gallery')}</h3>
      {photos.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <span className="text-4xl">🖼️</span>
          <p className="text-sm text-gray-400 mt-2">{t('contest.noPhotos')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...photos].reverse().map((photo) => (
            <div key={photo.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <img
                src={photo.dataUrl}
                alt="Face cutout photo"
                className="w-full h-64 object-cover"
              />
              <div className="p-3">
                <p className="text-xs text-gray-400 mb-2">
                  {new Date(photo.createdAt).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => shareOnTwitter(photo)}
                    className="flex-1 text-xs py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
                  >
                    𝕏 {t('contest.shareTwitter')}
                  </button>
                  <button
                    onClick={() => shareOnLine(photo)}
                    className="flex-1 text-xs py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
                  >
                    💬 {t('contest.shareLine')}
                  </button>
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="text-xs px-3 py-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
