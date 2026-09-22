import { describe, expect, it } from 'vitest'
import { sortCards } from './sort'

function card(id, priority, createdAt, pinned = false) {
  return { id, priority, createdAt, pinned }
}

describe('sortCards', () => {
  it('manualモードでは並び順を変更しない', () => {
    const cards = [card(1, 'low', 1), card(2, 'high', 2)]
    expect(sortCards(cards, 'manual')).toBe(cards)
  })

  it('priorityモードではhigh > mid > lowの順に並ぶ', () => {
    const cards = [card(1, 'low', 1), card(2, 'high', 2), card(3, 'mid', 3)]
    const sorted = sortCards(cards, 'priority')
    expect(sorted.map((c) => c.id)).toEqual([2, 3, 1])
  })

  it('newestモードではcreatedAtが新しい順に並ぶ', () => {
    const cards = [card(1, 'mid', 1), card(2, 'mid', 3), card(3, 'mid', 2)]
    const sorted = sortCards(cards, 'newest')
    expect(sorted.map((c) => c.id)).toEqual([2, 3, 1])
  })

  it('pinned=trueのカードはソート基準に関わらず先頭にまとまる', () => {
    const cards = [
      card(1, 'high', 1),
      card(2, 'low', 2, true),
      card(3, 'mid', 3),
    ]
    const sorted = sortCards(cards, 'priority')
    expect(sorted.map((c) => c.id)).toEqual([2, 1, 3])
  })
})
