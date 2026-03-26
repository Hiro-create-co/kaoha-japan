export const RANKS = [
  { key: 'beginner', minVisits: 0, icon: '🔰', color: '#95a5a6' },
  { key: 'traveler', minVisits: 10, icon: '🧳', color: '#3498db' },
  { key: 'master', minVisits: 25, icon: '🏯', color: '#f39c12' },
  { key: 'legend', minVisits: 47, icon: '👑', color: '#e74c3c' },
]

export function getRank(visitCount) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (visitCount >= RANKS[i].minVisits) return RANKS[i]
  }
  return RANKS[0]
}

export function getNextRank(visitCount) {
  for (const rank of RANKS) {
    if (visitCount < rank.minVisits) return rank
  }
  return null
}

export function getProgress(visitCount) {
  const current = getRank(visitCount)
  const next = getNextRank(visitCount)
  if (!next) return 100
  const range = next.minVisits - current.minVisits
  const progress = visitCount - current.minVisits
  return Math.round((progress / range) * 100)
}

export const POINTS_PER_VISIT = 10
