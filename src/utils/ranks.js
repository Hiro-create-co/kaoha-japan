export const RANKS = [
  { key: 'beginner', minVisits: 0, icon: '🌱', color: '#9ca3af' },
  { key: 'traveler', minVisits: 10, icon: '✈️', color: '#F4845F' },
  { key: 'master', minVisits: 25, icon: '🏔️', color: '#7C9A82' },
  { key: 'legend', minVisits: 47, icon: '👑', color: '#8B5CF6' },
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
