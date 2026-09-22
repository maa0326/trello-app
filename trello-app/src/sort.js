const PRIORITY_RANK = { high: 0, mid: 1, low: 2 }

function byPriority(a, b) {
  const rankDiff = PRIORITY_RANK[a.priority || 'mid'] - PRIORITY_RANK[b.priority || 'mid']
  if (rankDiff !== 0) return rankDiff
  return (a.createdAt || 0) - (b.createdAt || 0)
}

function byNewest(a, b) {
  return (b.createdAt || 0) - (a.createdAt || 0)
}

export function sortCards(cards, sortMode) {
  if (sortMode === 'priority' || sortMode === 'newest') {
    const compare = sortMode === 'priority' ? byPriority : byNewest
    const pinned = cards.filter((c) => c.pinned).sort(compare)
    const rest = cards.filter((c) => !c.pinned).sort(compare)
    return [...pinned, ...rest]
  }
  return cards
}
