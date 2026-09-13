const PRIORITY_RANK = { high: 0, mid: 1, low: 2 }

export function sortCards(cards, sortMode) {
  if (sortMode === 'priority') {
    return [...cards].sort((a, b) => {
      const rankDiff = PRIORITY_RANK[a.priority || 'mid'] - PRIORITY_RANK[b.priority || 'mid']
      if (rankDiff !== 0) return rankDiff
      return (a.createdAt || 0) - (b.createdAt || 0)
    })
  }
  if (sortMode === 'newest') {
    return [...cards].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  }
  return cards
}
