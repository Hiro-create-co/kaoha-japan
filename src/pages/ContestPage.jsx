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
      addPhoto({ dataUrl: ev.target.result, fileName: file.name })
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
    <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
      {/* Upload hero */}
      <div className="rounded-3xl p-6 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8, #FF6B6B)' }}>
        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 30% 40%, white 0%, transparent 50%)' }} />
        <div className="relative">
          <div className="text-5xl mb-2 animate-float">📸</div>
          <h2 className="text-lg font-black text-white mb-1">{t('contest.title')}</h2>
          <p className="text-xs text-white/70 mb-4 font-medium">{t('contest.uploadHint')}</p>

          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm transition-all hover:scale-105 active:scale-95"
            style={{ background: 'white', color: '#a78bfa', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
          >
            📷 {t('contest.upload')}
          </button>
        </div>
      </div>

      {/* Data notice */}
      <div className="rounded-2xl px-4 py-3 text-xs font-medium flex items-start gap-2" style={{ background: 'linear-gradient(135deg, #a78bfa10, #a78bfa05)', color: '#8b7acc', border: '1px solid #a78bfa20' }}>
        <span>💡</span>
        <span>{t('contest.localNotice')}</span>
      </div>

      {/* Gallery */}
      <div>
        <h3 className="font-black text-sm mb-3 px-1 flex items-center gap-1.5">
          🖼️ {t('contest.gallery')}
        </h3>
        {photos.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#ffe8e0]" style={{ boxShadow: '0 4px 20px rgba(255,107,107,0.06)' }}>
            <div className="text-5xl mb-3 animate-float">🎭</div>
            <p className="text-sm font-bold" style={{ color: 'var(--color-text-light)' }}>{t('contest.noPhotos')}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-light)' }}>{t('contest.noPhotosHint')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...photos].reverse().map((photo) => (
              <div key={photo.id} className="bg-white rounded-2xl overflow-hidden border border-[#ffe8e0]" style={{ boxShadow: '0 4px 20px rgba(255,107,107,0.06)' }}>
                <img src={photo.dataUrl} alt="Face cutout photo" className="w-full h-64 object-cover" />
                <div className="p-3">
                  <p className="text-[10px] font-medium mb-2.5" style={{ color: 'var(--color-text-light)' }}>
                    {new Date(photo.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
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
                      className="flex-1 text-xs py-2.5 text-white rounded-xl font-bold hover:opacity-90 transition active:scale-95"
                      style={{ background: '#06C755' }}
                    >
                      💬 LINE
                    </button>
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="text-xs px-3 py-2.5 rounded-xl transition active:scale-95 hover:bg-red-50 hover:text-red-400"
                      style={{ background: '#FFF0E0', color: 'var(--color-text-light)' }}
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
