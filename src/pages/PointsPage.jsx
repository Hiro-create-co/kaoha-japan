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

  const visitedPanels = panels.filter((p) => visits.some((v) => v.panelId === p.id))
  const prefectures = [...new Set(visitedPanels.map((p) => p.prefecture))]
  const prefectureCount = prefectures.length

  return (
    <div className="px-4 py-5 max-w-md mx-auto space-y-4">
      {/* Rank Card */}
      <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
        <div className="text-center mb-5">
          <div className="text-6xl mb-2">{currentRank.icon}</div>
          <h2 className="text-2xl font-extrabold">
            {t(`points.ranks.${currentRank.key}`)}
          </h2>
          <div className="mt-2 inline-flex items-baseline gap-1">
            <span className="text-3xl font-black" style={{ color: 'var(--color-accent)' }}>{totalPoints}</span>
            <span className="text-sm font-bold text-gray-400">{t('common.points')}</span>
          </div>
        </div>

        {/* Progress bar */}
        {nextRank && (
          <div>
            <div className="flex justify-between text-xs font-bold text-gray-400 mb-1.5 px-1">
              <span>{t(`points.ranks.${currentRank.key}`)}</span>
              <span>{t(`points.ranks.${nextRank.key}`)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border border-gray-200">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.max(progress, 4)}%`,
                  background: `linear-gradient(90deg, ${currentRank.color}, ${nextRank.color})`,
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 text-center font-medium">
              {visitCount} {t('common.of')} {nextRank.minVisits}
            </p>
          </div>
        )}

        {!nextRank && (
          <div className="text-center py-2">
            <p className="text-base font-bold" style={{ color: 'var(--color-accent)' }}>
              🎉 全パネル制覇！
            </p>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-gray-100">
          <p className="text-3xl font-black" style={{ color: 'var(--color-primary)' }}>{visitCount}</p>
          <p className="text-[11px] font-bold text-gray-400 mt-1">{t('points.visited')}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-gray-100">
          <p className="text-3xl font-black" style={{ color: 'var(--color-success)' }}>{prefectureCount}</p>
          <p className="text-[11px] font-bold text-gray-400 mt-1">{t('points.prefectures')}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-gray-100">
          <p className="text-3xl font-black" style={{ color: 'var(--color-accent)' }}>
            {panels.length > 0 ? Math.round((visitCount / panels.length) * 100) : 0}%
          </p>
          <p className="text-[11px] font-bold text-gray-400 mt-1">{t('points.progress')}</p>
        </div>
      </div>

      {/* Rank milestones */}
      <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
        <h3 className="font-extrabold text-sm mb-4">{t('points.rank')}</h3>
        <div className="grid grid-cols-4 gap-2">
          {RANKS.map((rank) => {
            const unlocked = visitCount >= rank.minVisits
            return (
              <div
                key={rank.key}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition ${
                  unlocked ? 'bg-amber-50 border border-amber-200' : 'opacity-30'
                }`}
              >
                <span className="text-3xl">{rank.icon}</span>
                <span className="text-[11px] font-bold text-center leading-tight">
                  {t(`points.ranks.${rank.key}`)}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">{rank.minVisits}+</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Visit history */}
      <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
        <h3 className="font-extrabold text-sm mb-3">{t('points.visitHistory')}</h3>
        {visitedPanels.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🗾</div>
            <p className="text-sm text-gray-400">{t('points.noVisits')}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {visitedPanels.map((panel) => {
              const visit = visits.find((v) => v.panelId === panel.id)
              return (
                <div key={panel.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition">
                  <div className="w-10 h-10 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center text-lg shrink-0">
                    ✅
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">
                      {isJa ? panel.name : panel.nameEn}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      {isJa ? panel.prefecture : panel.prefectureEn}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black" style={{ color: 'var(--color-accent)' }}>
                      +{panel.points}pt
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
