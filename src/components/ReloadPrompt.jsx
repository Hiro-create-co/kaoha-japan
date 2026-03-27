import { useRegisterSW } from 'virtual:pwa-register/react'
import { useTranslation } from 'react-i18next'

export default function ReloadPrompt() {
  const { t } = useTranslation()
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (r) {
        // Check for updates every hour
        setInterval(() => r.update(), 60 * 60 * 1000)
      }
    },
  })

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom">
      <div className="bg-white rounded-2xl shadow-xl border border-[var(--color-border)] p-4 flex items-center gap-3">
        <div className="flex-1 text-sm text-[var(--color-text)]">
          {t('newVersionAvailable', '新しいバージョンがあります')}
        </div>
        <button
          onClick={() => updateServiceWorker(true)}
          className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl shrink-0"
        >
          {t('update', '更新')}
        </button>
      </div>
    </div>
  )
}
