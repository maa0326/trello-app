import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleAddList = async (e) => {
    e.preventDefault()
    const title = newListTitle.trim()
    if (!title) return
    setNewListTitle('')
    const created = await api.createList(title)
    setData((prev) => ({ ...prev, lists: [...prev.lists, normalizeList(created)] }))
  }

  const handleDeleteList = async (listId) => {
    setData((prev) => ({ ...prev, lists: prev.lists.filter((l) => l.id !== listId) }))
    await api.deleteList(listId)
  }

  const handleRenameList = async (listId, title) => {
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => (l.id === listId ? { ...l, title } : l)),
    }))
    await api.updateList(listId, { title })
  }

  const handleAddCard = async (listId, title) => {
    const created = await api.createCard(listId, title)
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((l) =>
        l.id === listId ? { ...l, cards: [...l.cards, normalizeCard(created)] } : l
      ),
    }))
  }

  const handleDeleteCard = async (listId, cardId) => {
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((l) =>
        l.id === listId ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) } : l
      ),
    }))
    await api.deleteCard(cardId)
  }

  const handleChangeSortMode = async (listId, sortMode) => {
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => (l.id === listId ? { ...l, sortMode } : l)),
    }))
    await api.updateList(listId, { sortMode })
  }

  const handleTogglePin = async (cardId, pinned) => {
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => ({
        ...l,
        cards: l.cards.map((c) => (c.id === cardId ? { ...c, pinned } : c)),
      })),
    }))
    await api.updateCard(cardId, { pinned })
  }

  const handleSaveCard = async (cardId, updates) => {
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => ({
        ...l,
        cards: l.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
      })),
    }))
    await api.updateCard(cardId, {
      title: updates.title,
      description: updates.description,
      dueDate: updates.dueDate || null,
      priority: updates.priority ? updates.priority.toUpperCase() : undefined,
    })
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id
    if (activeId === overId) return

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
      api.moveCard(moveInfo.cardId, moveInfo.targetListId, moveInfo.targetPosition)
    }
  }

  return (
    <div className="board">
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
        <CardModal card={openCard} onClose={() => setOpenCard(null)} onSave={handleSaveCard} />
      )}
    </div>
  )
}

export default Board
