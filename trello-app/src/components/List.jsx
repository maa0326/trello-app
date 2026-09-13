import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Card from './Card'
import { sortCards } from '../sort'

const SORT_OPTIONS = [
  { value: 'manual', label: '手動' },
  { value: 'priority', label: '優先度順' },
  { value: 'newest', label: '新着順' },
]

function List({
  list,
  onAddCard,
  onDeleteList,
  onDeleteCard,
  onOpenCard,
  onRenameList,
  onChangeSortMode,
}) {
  const [newCardTitle, setNewCardTitle] = useState('')
  const { setNodeRef } = useDroppable({ id: list.id, data: { type: 'list' } })
  const sortMode = list.sortMode || 'manual'
  const displayedCards = sortCards(list.cards, sortMode)

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

      <div className="sort-mode-picker">
        {SORT_OPTIONS.map((opt) => (
          <button
            type="button"
            key={opt.value}
            className={`sort-option ${sortMode === opt.value ? 'selected' : ''}`}
            onClick={() => onChangeSortMode(list.id, opt.value)}
          >
            {sortMode === opt.value ? '✓ ' : ''}
            {opt.label}
          </button>
        ))}
      </div>

      <div className="card-list" ref={setNodeRef}>
        <SortableContext items={displayedCards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {displayedCards.map((card) => (
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
