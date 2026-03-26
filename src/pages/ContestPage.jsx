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

  const shareOnTwitter = () => {
    const text = encodeURIComponent('カオハJAPANで顔ハメパネル巡り中！ 🎭 #カオハJAPAN #顔ハメ')
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  const shareOnLine = () => {
    const text = encodeURIComponent('カオハJAPANで顔ハメパネル巡り中！ 🎭')
    window.open(`https://social-plugins.line.me/lineit/share?text=${text}`, '_blank')
  }

  return (
    <div className="px-4 py-5 max-w-md mx-auto space-y-4">
      {/* Upload section */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 text-center">
        <div className="text-6xl mb-3">📸</div>
        <h2 className="text-xl font-extrabold mb-1">{t('contest.title')}</h2>
        <p className="text-sm text-gray-400 mb-5">{t('contest.uploadHint')}</p>

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
          className="inline-flex items-center gap-2 px-8 py-3.5 text-white rounded-2xl font-bold text-base transition-all hover:opacity-90 active:scale-95 shadow-lg"
          style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}
        >
          📷 {t('contest.upload')}
        </button>
      </div>

      {/* Gallery */}
      <div>
        <h3 className="font-extrabold text-sm mb-3 px-1">{t('contest.gallery')}</h3>
        {photos.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 shadow-md border border-gray-100 text-center">
            <div className="text-5xl mb-3">🖼️</div>
            <p className="text-sm text-gray-400">{t('contest.noPhotos')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...photos].reverse().map((photo) => (
              <div key={photo.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <img
                  src={photo.dataUrl}
                  alt="Face cutout photo"
                  className="w-full h-72 object-cover"
                />
                <div className="p-4">
                  <p className="text-xs text-gray-400 font-medium mb-3">
                    {new Date(photo.createdAt).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={shareOnTwitter}
                      className="flex-1 text-xs py-2.5 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition active:scale-95"
                    >
                      𝕏 {t('contest.shareTwitter')}
                    </button>
                    <button
                      onClick={shareOnLine}
                      className="flex-1 text-xs py-2.5 bg-[#06C755] text-white rounded-xl font-bold hover:opacity-90 transition active:scale-95"
                    >
                      💬 {t('contest.shareLine')}
                    </button>
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="text-sm px-3.5 py-2.5 bg-gray-100 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition active:scale-95"
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
    </div>
  )
}
