import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Card from './Card'

function List({ list, onAddCard, onDeleteList, onDeleteCard, onOpenCard, onRenameList }) {
  const [newCardTitle, setNewCardTitle] = useState('')
  const { setNodeRef } = useDroppable({ id: list.id, data: { type: 'list' } })

  const handleAddCard = (e) => {
    e.preventDefault()
    const title = newCardTitle.trim()
    if (!title) return
    onAddCard(list.id, title)
    setNewCardTitle('')
  }

  return (
    <div className="list">
      <div className="list-header">
        <input
          className="list-title-input"
          value={list.title}
          onChange={(e) => onRenameList(list.id, e.target.value)}
        />
        <button type="button" className="list-delete" onClick={() => onDeleteList(list.id)}>
          削除
        </button>
      </div>

      <div className="card-list" ref={setNodeRef}>
        <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <Card key={card.id} card={card} onClick={onOpenCard} onDelete={(id) => onDeleteCard(list.id, id)} />
          ))}
        </SortableContext>
      </div>

      <form className="add-card-form" onSubmit={handleAddCard}>
        <input
          type="text"
          placeholder="+ カードを追加"
          value={newCardTitle}
          onChange={(e) => setNewCardTitle(e.target.value)}
        />
      </form>
    </div>
  )
}

export default List
