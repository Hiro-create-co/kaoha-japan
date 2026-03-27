import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
    <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
      {/* Hero Rank Card */}
      <div className="rounded-3xl p-5 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FF6B6B, #ff8e8e, #FFD93D)' }}>
        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 40%)' }} />
        <div className="relative">
          <div className="text-5xl mb-1 animate-float">{currentRank.icon}</div>
          <h2 className="text-xl font-black text-white drop-shadow-sm">
            {t(`points.ranks.${currentRank.key}`)}
          </h2>
          <div className="mt-1 inline-flex items-baseline gap-1">
            <span className="text-4xl font-black text-white drop-shadow-sm">{totalPoints}</span>
            <span className="text-sm font-bold text-white/70">{t('common.points')}</span>
          </div>
        </div>

        {nextRank && (
          <div className="mt-4 relative">
            <div className="flex justify-between text-[10px] font-bold text-white/70 mb-1 px-1">
              <span>{t(`points.ranks.${currentRank.key}`)}</span>
              <span>{t(`points.ranks.${nextRank.key}`)}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.max(progress, 5)}%`, background: 'rgba(255,255,255,0.8)' }}
              />
            </div>
            <p className="text-[10px] text-white/70 mt-1 text-center font-bold">
              {visitCount} {t('common.of')} {nextRank.minVisits}
            </p>
          </div>
        )}

        {!nextRank && (
          <div className="mt-2">
            <p className="text-sm font-bold text-white/90">🎉 {t('points.allComplete')}</p>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { value: visitCount, label: t('points.visited'), gradient: 'linear-gradient(135deg, #FF6B6B15, #FF6B6B05)', color: '#FF6B6B', icon: '🎭' },
          { value: prefectureCount, label: t('points.prefectures'), gradient: 'linear-gradient(135deg, #4ECDC415, #6BCB7705)', color: '#4ECDC4', icon: '🗾' },
          { value: panels.length > 0 ? Math.round((visitCount / panels.length) * 100) + '%' : '0%', label: t('points.progress'), gradient: 'linear-gradient(135deg, #FFD93D15, #FFD93D05)', color: '#f0c830', icon: '🏆' },
        ].map(({ value, label, gradient, color, icon }, i) => (
          <div key={i} className="rounded-2xl p-3 text-center border" style={{ background: gradient, borderColor: `${color}20` }}>
            <div className="text-lg mb-0.5">{icon}</div>
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
            <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--color-text-light)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Rank milestones */}
      <div className="bg-white rounded-2xl p-4 border border-[#ffe8e0]" style={{ boxShadow: '0 4px 20px rgba(255,107,107,0.06)' }}>
        <h3 className="font-black text-sm mb-3 flex items-center gap-1.5">
          👑 {t('points.rank')}
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {RANKS.map((rank) => {
            const unlocked = visitCount >= rank.minVisits
            return (
              <div
                key={rank.key}
                className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition border ${
                  unlocked ? 'border-[#FFD93D40]' : 'opacity-25 border-transparent'
                }`}
                style={unlocked ? { background: 'linear-gradient(135deg, #FFD93D10, #FF6B6B05)' } : {}}
              >
                <span className={`text-2xl ${unlocked ? 'animate-float' : ''}`}>{rank.icon}</span>
                <span className="text-[10px] font-bold text-center leading-tight">{t(`points.ranks.${rank.key}`)}</span>
                <span className="text-[9px] font-medium" style={{ color: 'var(--color-text-light)' }}>{rank.minVisits}+</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Data notice */}
      <div className="rounded-2xl px-4 py-3 text-xs font-medium flex items-start gap-2" style={{ background: 'linear-gradient(135deg, #FFD93D10, #FFD93D05)', color: '#c0a030', border: '1px solid #FFD93D20' }}>
        <span>💡</span>
        <span>{t('points.localNotice')}</span>
      </div>

      {/* Visit history */}
      <div className="bg-white rounded-2xl p-4 border border-[#ffe8e0]" style={{ boxShadow: '0 4px 20px rgba(255,107,107,0.06)' }}>
        <h3 className="font-black text-sm mb-3 flex items-center gap-1.5">
          📖 {t('points.visitHistory')}
        </h3>
        {visitedPanels.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3 animate-float">🗾</div>
            <p className="text-sm font-bold" style={{ color: 'var(--color-text-light)' }}>{t('points.noVisits')}</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {visitedPanels.map((panel) => {
              const visit = visits.find((v) => v.panelId === panel.id)
              return (
                <div key={panel.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FFF8F0] transition">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0" style={{ background: 'linear-gradient(135deg, #6BCB7720, #4ECDC420)' }}>
                    ✅
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{isJa ? panel.name : panel.nameEn}</p>
                    <p className="text-[10px] font-medium" style={{ color: 'var(--color-text-light)' }}>{isJa ? panel.prefecture : panel.prefectureEn}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black" style={{ color: '#FFD93D' }}>+{panel.points}pt</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-light)' }}>{new Date(visit.visitedAt).toLocaleDateString(isJa ? 'ja-JP' : 'en-US')}</p>
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
