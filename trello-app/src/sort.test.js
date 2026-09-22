import { describe, expect, it } from 'vitest'
import { sortCards } from './sort'

function card(id, priority, createdAt, { pinned = false, pinnedAt = null } = {}) {
  return { id, priority, createdAt, pinned, pinnedAt }
}

describe('sortCards', () => {
  it('manualモードでは非固定カードの並び順を変更しない', () => {
    const cards = [card(1, 'low', 1), card(2, 'high', 2)]
    expect(sortCards(cards, 'manual').map((c) => c.id)).toEqual([1, 2])
  })

  it('priorityモードでは非固定カードがhigh > mid > lowの順に並ぶ', () => {
    const cards = [card(1, 'low', 1), card(2, 'high', 2), card(3, 'mid', 3)]
    const sorted = sortCards(cards, 'priority')
    expect(sorted.map((c) => c.id)).toEqual([2, 3, 1])
  })

  it('newestモードでは非固定カードがcreatedAtが新しい順に並ぶ', () => {
    const cards = [card(1, 'mid', 1), card(2, 'mid', 3), card(3, 'mid', 2)]
    const sorted = sortCards(cards, 'newest')
    expect(sorted.map((c) => c.id)).toEqual([2, 3, 1])
  })

  it('固定カードはソートモードに関わらず常に先頭にまとまる(手動モードでも)', () => {
    const cards = [
      card(1, 'high', 1),
      card(2, 'low', 2, { pinned: true, pinnedAt: 100 }),
      card(3, 'mid', 3),
    ]
    expect(sortCards(cards, 'manual').map((c) => c.id)).toEqual([2, 1, 3])
    expect(sortCards(cards, 'priority').map((c) => c.id)).toEqual([2, 1, 3])
    expect(sortCards(cards, 'newest').map((c) => c.id)).toEqual([2, 3, 1])
  })

  it('固定カードが複数ある場合、固定した順(pinnedAtが古い順)に並ぶ', () => {
    const cards = [
      card(1, 'mid', 1, { pinned: true, pinnedAt: 300 }),
      card(2, 'mid', 2, { pinned: true, pinnedAt: 100 }),
      card(3, 'mid', 3, { pinned: true, pinnedAt: 200 }),
    ]
    const sorted = sortCards(cards, 'manual')
    expect(sorted.map((c) => c.id)).toEqual([2, 3, 1])
  })
})
