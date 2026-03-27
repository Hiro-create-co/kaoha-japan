import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, Trash2, Share2, Info, Camera } from 'lucide-react'

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
    const text = encodeURIComponent('カオハメJAPANで顔ハメパネル巡り中！ #カオハメJAPAN #顔ハメ')
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  const shareOnLine = () => {
    const text = encodeURIComponent('カオハメJAPANで顔ハメパネル巡り中！')
    window.open(`https://social-plugins.line.me/lineit/share?text=${text}`, '_blank')
  }

  return (
    <div className="px-5 py-6 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold">{t('contest.title')}</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{t('contest.uploadHint')}</p>
      </div>

      {/* Upload */}
      <div>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleUpload} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-[var(--color-border-strong)] rounded-2xl text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
        >
          <Upload size={20} />
          <span className="text-sm font-semibold">{t('contest.upload')}</span>
        </button>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
        <Info size={14} className="shrink-0 mt-0.5 text-[var(--color-text-tertiary)]" />
        <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">{t('contest.localNotice')}</p>
      </div>

      {/* Gallery */}
      <div>
        <p className="text-sm font-bold mb-3">{t('contest.gallery')}</p>
        {photos.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-[var(--color-border)] text-center">
            <Camera size={32} className="mx-auto mb-3 text-[var(--color-text-tertiary)]" />
            <p className="text-sm text-[var(--color-text-secondary)]">{t('contest.noPhotos')}</p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{t('contest.noPhotosHint')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...photos].reverse().map((photo) => (
              <div key={photo.id} className="bg-white rounded-2xl overflow-hidden border border-[var(--color-border)]">
                <img src={photo.dataUrl} alt="Face cutout photo" className="w-full aspect-[4/3] object-cover" />
                <div className="p-4">
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-3">
                    {new Date(photo.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={shareOnTwitter} className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5 bg-[var(--color-text)] text-white rounded-xl font-medium hover:opacity-90 transition active:scale-95">
                      <Share2 size={12} /> {t('contest.shareTwitter')}
                    </button>
                    <button onClick={shareOnLine} className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5 bg-[#06C755] text-white rounded-xl font-medium hover:opacity-90 transition active:scale-95">
                      <Share2 size={12} /> LINE
                    </button>
                    <button onClick={() => deletePhoto(photo.id)} className="px-3 py-2.5 rounded-xl text-[var(--color-text-tertiary)] hover:bg-red-50 hover:text-red-400 transition active:scale-95 border border-[var(--color-border)]">
                      <Trash2 size={14} />
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
