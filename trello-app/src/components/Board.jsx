import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import List from './List'
import CardModal from './CardModal'

function findListByCardId(lists, cardId) {
  return lists.find((list) => list.cards.some((c) => c.id === cardId))
}

function Board({ data, setData }) {
  const [newListTitle, setNewListTitle] = useState('')
  const [openCard, setOpenCard] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleAddList = (e) => {
    e.preventDefault()
    const title = newListTitle.trim()
    if (!title) return
    setData((prev) => ({
      ...prev,
      lists: [...prev.lists, { id: uuid(), title, cards: [] }],
    }))
    setNewListTitle('')
  }

  const handleDeleteList = (listId) => {
    setData((prev) => ({
      ...prev,
      lists: prev.lists.filter((l) => l.id !== listId),
    }))
  }

  const handleRenameList = (listId, title) => {
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => (l.id === listId ? { ...l, title } : l)),
    }))
  }

  const handleAddCard = (listId, title) => {
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((l) =>
        l.id === listId
          ? { ...l, cards: [...l.cards, { id: uuid(), title, description: '', dueDate: '' }] }
          : l
      ),
    }))
  }

  const handleDeleteCard = (listId, cardId) => {
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((l) =>
        l.id === listId ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) } : l
      ),
    }))
  }

  const handleSaveCard = (cardId, updates) => {
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => ({
        ...l,
        cards: l.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
      })),
    }))
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id
    if (activeId === overId) return

    setData((prev) => {
      const lists = prev.lists.map((l) => ({ ...l, cards: [...l.cards] }))

      const sourceList = findListByCardId(lists, activeId)
      if (!sourceList) return prev

      const targetList =
        findListByCardId(lists, overId) || lists.find((l) => l.id === overId)
      if (!targetList) return prev

      const sourceIndex = sourceList.cards.findIndex((c) => c.id === activeId)
      const [movedCard] = sourceList.cards.splice(sourceIndex, 1)

      let targetIndex = targetList.cards.findIndex((c) => c.id === overId)
      if (targetIndex === -1) targetIndex = targetList.cards.length

      targetList.cards.splice(targetIndex, 0, movedCard)

      return { ...prev, lists }
    })
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
