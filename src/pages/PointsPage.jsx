import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getRank, getNextRank, getProgress, RANKS, POINTS_PER_VISIT } from '../utils/ranks'

export default function PointsPage({ visits }) {
  const { t, i18n } = useTranslation()
  const [panels, setPanels] = useState([])
  const isJa = i18n.language === 'ja'

  useEffect(() => {
    fetch('/data/panels.json')
      .then((r) => r.json())
      .then(setPanels)
      .catch(console.error)
  }, [])

  const visitCount = visits.length
  const totalPoints = visitCount * POINTS_PER_VISIT
  const currentRank = getRank(visitCount)
  const nextRank = getNextRank(visitCount)
  const progress = getProgress(visitCount)

  // Group visits by prefecture
  const visitedPanels = panels.filter((p) => visits.some((v) => v.panelId === p.id))
  const prefectures = [...new Set(visitedPanels.map((p) => p.prefecture))]

  // Count unique prefectures visited
  const prefectureCount = prefectures.length

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Rank Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="text-center mb-4">
          <span className="text-5xl">{currentRank.icon}</span>
          <h2 className="text-xl font-bold mt-2">
            {t(`points.ranks.${currentRank.key}`)}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t('points.totalPoints')}: <span className="font-bold text-lg" style={{ color: 'var(--color-accent)' }}>{totalPoints}</span> {t('common.points')}
          </p>
        </div>

        {/* Progress bar */}
        {nextRank && (
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{t(`points.ranks.${currentRank.key}`)}</span>
              <span>{t(`points.ranks.${nextRank.key}`)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${currentRank.color}, ${nextRank.color})`,
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-center">
              {visitCount} {t('common.of')} {nextRank.minVisits} {t('map.panels')}
            </p>
          </div>
        )}

        {!nextRank && (
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
              🎉 全パネル制覇！ / All panels completed!
            </p>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{visitCount}</p>
          <p className="text-xs text-gray-500">{t('points.visited')}</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>{prefectureCount}</p>
          <p className="text-xs text-gray-500">{t('points.prefectures')}</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>{panels.length > 0 ? Math.round((visitCount / panels.length) * 100) : 0}%</p>
          <p className="text-xs text-gray-500">{t('points.progress')}</p>
        </div>
      </div>

      {/* Rank milestones */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <h3 className="font-bold text-sm mb-3">{t('points.rank')}</h3>
        <div className="flex justify-between">
          {RANKS.map((rank) => (
            <div
              key={rank.key}
              className={`flex flex-col items-center gap-1 ${
                visitCount >= rank.minVisits ? 'opacity-100' : 'opacity-30'
              }`}
            >
              <span className="text-2xl">{rank.icon}</span>
              <span className="text-xs font-medium">{t(`points.ranks.${rank.key}`)}</span>
              <span className="text-[10px] text-gray-400">{rank.minVisits}+</span>
            </div>
          ))}
        </div>
      </div>

      {/* Visit history */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-sm mb-3">{t('points.visitHistory')}</h3>
        {visitedPanels.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">{t('points.noVisits')}</p>
        ) : (
          <div className="space-y-2">
            {visitedPanels.map((panel) => {
              const visit = visits.find((v) => v.panelId === panel.id)
              return (
                <div key={panel.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-lg">🟢</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {isJa ? panel.name : panel.nameEn}
                    </p>
                    <p className="text-xs text-gray-400">
                      {isJa ? panel.prefecture : panel.prefectureEn}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold" style={{ color: 'var(--color-accent)' }}>
                      +{panel.points}{t('common.points')}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(visit.visitedAt).toLocaleDateString(isJa ? 'ja-JP' : 'en-US')}
                    </p>
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
