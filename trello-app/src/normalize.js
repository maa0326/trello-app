export function normalizeCard(card) {
  return {
    ...card,
    priority: (card.priority || 'MID').toLowerCase(),
    dueDate: card.dueDate || '',
    description: card.description || '',
  }
}

export function normalizeList(list) {
  return {
    ...list,
    sortMode: list.sortMode || 'manual',
    cards: (list.cards || []).map(normalizeCard),
  }
}

export function normalizeBoard(lists) {
  return { lists: (lists || []).map(normalizeList) }
}
