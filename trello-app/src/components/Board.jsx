import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
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
      setError(err.message)
    }
  }

  const handleDeleteList = async (listId) => {
    const prevData = data
    setData((prev) => ({ ...prev, lists: prev.lists.filter((l) => l.id !== listId) }))
    try {
      await api.deleteList(listId)
    } catch (err) {
      setData(prevData)
      setError(err.message)
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
      setError(err.message)
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
      setError(err.message)
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
      setError(err.message)
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
      setError(err.message)
    }
  }

  const handleTogglePin = async (cardId, pinned) => {
    const prevData = data
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => ({
        ...l,
        cards: l.cards.map((c) => (c.id === cardId ? { ...c, pinned } : c)),
      })),
    }))
    try {
      await api.updateCard(cardId, { pinned })
    } catch (err) {
      setData(prevData)
      setError(err.message)
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
      setError(err.message)
    }
  }

  const handleDragEnd = (event) => {
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
          setError(err.message)
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
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
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
          />
        ))}
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
