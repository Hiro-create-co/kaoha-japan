import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin, Flag, TrendingUp, ChevronRight, Info } from 'lucide-react'
import { getRank, getNextRank, getProgress, RANKS, POINTS_PER_VISIT } from '../utils/ranks'

export default function PointsPage({ visits, userPanels = [] }) {
  const { t, i18n } = useTranslation()
  const [masterPanels, setMasterPanels] = useState([])
  const isJa = i18n.language === 'ja'

  useEffect(() => {
    fetch('/data/panels.json')
      .then((r) => r.json())
      .then(setMasterPanels)
      .catch(console.error)
  }, [])

  const panels = [...masterPanels, ...userPanels]
  const visitCount = visits.length
  const totalPoints = visitCount * POINTS_PER_VISIT
  const currentRank = getRank(visitCount)
  const nextRank = getNextRank(visitCount)
  const progress = getProgress(visitCount)
  const visitedPanels = panels.filter((p) => visits.some((v) => v.panelId === p.id))
  const prefectures = [...new Set(visitedPanels.map((p) => p.prefecture))]
  const prefectureCount = prefectures.length

  return (
    <div className="px-5 py-6 max-w-lg mx-auto space-y-5">
      {/* Points header */}
      <div>
        <p className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">{t('points.totalPoints')}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tracking-tight">{totalPoints}</span>
          <span className="text-sm font-medium text-[var(--color-text-tertiary)]">{t('common.points')}</span>
        </div>
      </div>

      {/* Rank progress */}
      <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-lg">
              {currentRank.icon}
            </div>
            <div>
              <p className="text-sm font-bold">{t(`points.ranks.${currentRank.key}`)}</p>
              {nextRank && <p className="text-xs text-[var(--color-text-tertiary)]">{t(`points.ranks.${nextRank.key}`)} {t('points.until')} {nextRank.minVisits - visitCount}</p>}
            </div>
          </div>
        </div>
        {nextRank && (
          <div>
            <div className="w-full bg-[var(--color-bg)] rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out bg-[var(--color-primary)]"
                style={{ width: `${Math.max(progress, 3)}%` }}
              />
            </div>
            <p className="text-[11px] text-[var(--color-text-tertiary)] mt-2">{visitCount} / {nextRank.minVisits}</p>
          </div>
        )}
        {!nextRank && (
          <p className="text-sm text-[var(--color-sage)] font-medium">{t('points.allComplete')}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: MapPin, value: visitCount, label: t('points.visited'), color: 'var(--color-primary)' },
          { icon: Flag, value: prefectureCount, label: t('points.prefectures'), color: 'var(--color-sage)' },
          { icon: TrendingUp, value: panels.length > 0 ? Math.round((visitCount / panels.length) * 100) + '%' : '0%', label: t('points.progress'), color: '#8B5CF6' },
        ].map(({ icon: Icon, value, label, color }, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-[var(--color-border)]">
            <Icon size={16} style={{ color }} className="mb-2" />
            <p className="text-xl font-bold">{value}</p>
            <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Ranks */}
      <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)]">
        <p className="text-sm font-bold mb-4">{t('points.rank')}</p>
        <div className="flex justify-between">
          {RANKS.map((rank, i) => {
            const unlocked = visitCount >= rank.minVisits
            return (
              <div key={rank.key} className="flex flex-col items-center gap-1.5">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                  unlocked ? 'bg-[var(--color-primary-light)]' : 'bg-[var(--color-bg)] opacity-40'
                }`}>
                  {rank.icon}
                </div>
                <span className="text-[10px] font-medium text-center leading-tight">{t(`points.ranks.${rank.key}`)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
        <Info size={14} className="shrink-0 mt-0.5 text-[var(--color-text-tertiary)]" />
        <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">{t('points.localNotice')}</p>
      </div>

      {/* Visit history */}
      <div>
        <p className="text-sm font-bold mb-3">{t('points.visitHistory')}</p>
        {visitedPanels.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-[var(--color-border)] text-center">
            <MapPin size={32} className="mx-auto mb-3 text-[var(--color-text-tertiary)]" />
            <p className="text-sm text-[var(--color-text-secondary)]">{t('points.noVisits')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
            {visitedPanels.map((panel) => {
              const visit = visits.find((v) => v.panelId === panel.id)
              return (
                <div key={panel.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-sage-light)] flex items-center justify-center shrink-0">
                    <MapPin size={14} className="text-[var(--color-sage)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{isJa ? panel.name : panel.nameEn}</p>
                    <p className="text-[11px] text-[var(--color-text-tertiary)]">{isJa ? panel.prefecture : panel.prefectureEn}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-[var(--color-primary)]">+{panel.points}pt</p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)]">{new Date(visit.visitedAt).toLocaleDateString(isJa ? 'ja-JP' : 'en-US')}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
