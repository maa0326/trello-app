import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import List from './List'
import CardModal from './CardModal'
import * as api from '../api'
import { normalizeCard, normalizeList } from '../normalize'

function findListByCardId(lists, cardId) {
  return lists.find((list) => list.cards.some((c) => c.id === cardId))
}

function Board({ data, setData }) {
  const [newListTitle, setNewListTitle] = useState('')
  const [openCard, setOpenCard] = useState(null)
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleAddList = async (e) => {
    e.preventDefault()
    const title = newListTitle.trim()
    if (!title) return
    setNewListTitle('')
    try {
      const created = await api.createList(title)
      setData((prev) => ({ ...prev, lists: [...prev.lists, normalizeList(created)] }))
    } catch (err) {
      setError(err.message || '操作に失敗しました')
    }
  }

  const handleDeleteList = async (listId) => {
    const prevData = data
    setData((prev) => ({ ...prev, lists: prev.lists.filter((l) => l.id !== listId) }))
    try {
      await api.deleteList(listId)
    } catch (err) {
      setData(prevData)
      setError(err.message || '操作に失敗しました')
    }
  }

  const handleRenameList = async (listId, title) => {
    const prevData = data
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => (l.id === listId ? { ...l, title } : l)),
    }))
    try {
      await api.updateList(listId, { title })
    } catch (err) {
      setData(prevData)
      setError(err.message || '操作に失敗しました')
    }
  }

  const handleAddCard = async (listId, title) => {
    try {
      const created = await api.createCard(listId, title)
      setData((prev) => ({
        ...prev,
        lists: prev.lists.map((l) =>
          l.id === listId ? { ...l, cards: [...l.cards, normalizeCard(created)] } : l
        ),
      }))
    } catch (err) {
      setError(err.message || '操作に失敗しました')
    }
  }

  const handleDeleteCard = async (listId, cardId) => {
    const prevData = data
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((l) =>
        l.id === listId ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) } : l
      ),
    }))
    try {
      await api.deleteCard(cardId)
    } catch (err) {
      setData(prevData)
      setError(err.message || '操作に失敗しました')
    }
  }

  const handleChangeSortMode = async (listId, sortMode) => {
    const prevData = data
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => (l.id === listId ? { ...l, sortMode } : l)),
    }))
    try {
      await api.updateList(listId, { sortMode })
    } catch (err) {
      setData(prevData)
      setError(err.message || '操作に失敗しました')
    }
  }

  const handleToggleListPin = async (listId, pinned) => {
    const prevData = data
    const pinnedAt = pinned ? Date.now() : null
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => (l.id === listId ? { ...l, pinned, pinnedAt } : l)),
    }))
    try {
      await api.updateList(listId, { pinned })
    } catch (err) {
      setData(prevData)
      setError(err.message || '操作に失敗しました')
    }
  }

  const handleTogglePin = async (cardId, pinned) => {
    const prevData = data
    const pinnedAt = pinned ? Date.now() : null
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => ({
        ...l,
        cards: l.cards.map((c) => (c.id === cardId ? { ...c, pinned, pinnedAt } : c)),
      })),
    }))
    try {
      await api.updateCard(cardId, { pinned })
    } catch (err) {
      setData(prevData)
      setError(err.message || '操作に失敗しました')
    }
  }

  const handleSaveCard = async (cardId, updates) => {
    const prevData = data
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => ({
        ...l,
        cards: l.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
      })),
    }))
    try {
      await api.updateCard(cardId, {
        title: updates.title,
        description: updates.description,
        dueDate: updates.dueDate || null,
        priority: updates.priority ? updates.priority.toUpperCase() : undefined,
      })
    } catch (err) {
      setData(prevData)
      setError(err.message || '操作に失敗しました')
    }
  }

  const handleMoveList = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const sourceListId = active.data.current.listId
    const all = data.lists
    const sourceList = all.find((l) => l.id === sourceListId)
    if (!sourceList || sourceList.pinned) return

    // ピン留めされたリストは絶対位置(スロット)を固定し、ピン留めなしのリストだけを
    // その隙間を避けて並べ替える(バックエンドのmoveListと同じアルゴリズム)
    let beforeListId = null
    if (over.data.current?.type === 'list') {
      const overListId = over.data.current.listId
      const overList = all.find((l) => l.id === overListId)
      if (overList?.pinned) {
        const overAbsIndex = all.findIndex((l) => l.id === overListId)
        const nextUnpinned = all.slice(overAbsIndex + 1).find((l) => !l.pinned)
        beforeListId = nextUnpinned ? nextUnpinned.id : null
      } else {
        beforeListId = overListId
      }
    }

    const pinnedBySlot = new Map()
    all.forEach((l, i) => {
      if (l.pinned) pinnedBySlot.set(i, l)
    })

    const unpinned = all.filter((l) => !l.pinned && l.id !== sourceListId)
    const insertAt = beforeListId == null ? unpinned.length : unpinned.findIndex((l) => l.id === beforeListId)
    unpinned.splice(insertAt === -1 ? unpinned.length : insertAt, 0, sourceList)

    const lists = []
    let ui = 0
    for (let i = 0; i < all.length; i++) {
      lists.push(pinnedBySlot.has(i) ? pinnedBySlot.get(i) : unpinned[ui++])
    }

    const prevData = data
    setData((prev) => ({ ...prev, lists }))

    api.moveList(sourceListId, beforeListId).catch((err) => {
      setData(prevData)
      setError(err.message || '操作に失敗しました')
    })
  }

  const handleDragEnd = (event) => {
    setIsDragging(false)
    if (event.active.data.current?.type === 'list') {
      handleMoveList(event)
      return
    }

    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id
    if (activeId === overId) return

    const prevData = data
    let moveInfo = null

    setData((prev) => {
      const lists = prev.lists.map((l) => ({ ...l, cards: [...l.cards] }))

      const sourceList = findListByCardId(lists, activeId)
      if (!sourceList) return prev

      const targetList =
        findListByCardId(lists, overId) || lists.find((l) => l.id === overId)
      if (!targetList) return prev

      if (sourceList.id === targetList.id && sourceList.sortMode !== 'manual') {
        return prev
      }

      const sourceIndex = sourceList.cards.findIndex((c) => c.id === activeId)
      const [movedCard] = sourceList.cards.splice(sourceIndex, 1)

      let targetIndex = targetList.cards.findIndex((c) => c.id === overId)
      if (targetIndex === -1) targetIndex = targetList.cards.length

      targetList.cards.splice(targetIndex, 0, movedCard)

      moveInfo = { cardId: activeId, targetListId: targetList.id, targetPosition: targetIndex }

      return { ...prev, lists }
    })

    if (moveInfo) {
      api
        .moveCard(moveInfo.cardId, moveInfo.targetListId, moveInfo.targetPosition)
        .catch((err) => {
          setData(prevData)
          setError(err.message || '操作に失敗しました')
        })
    }
  }

  return (
    <div className="board">
      {error && (
        <p className="error-banner board-error" onClick={() => setError(null)}>
          操作に失敗しました: {error}(クリックで閉じる)
        </p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setIsDragging(false)}
      >
        <SortableContext
          items={data.lists.map((l) => `list-${l.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          {data.lists.map((list) => (
            <List
              key={list.id}
              list={list}
              onAddCard={handleAddCard}
              onDeleteList={handleDeleteList}
              onDeleteCard={handleDeleteCard}
              onOpenCard={setOpenCard}
              onRenameList={handleRenameList}
              onChangeSortMode={handleChangeSortMode}
              onTogglePin={handleTogglePin}
              onToggleListPin={handleToggleListPin}
              forceExpanded={isDragging}
            />
          ))}
        </SortableContext>
      </DndContext>

      <form className="add-list-form" onSubmit={handleAddList}>
        <input
          type="text"
          placeholder="+ リストを追加"
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
        />
      </form>

      {openCard && (
        <CardModal
          key={openCard.id}
          card={openCard}
          onClose={() => setOpenCard(null)}
          onSave={handleSaveCard}
        />
      )}
    </div>
  )
}

export default Board
