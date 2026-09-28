import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Card from './Card'
import { sortCards } from '../sort'

const SORT_OPTIONS = [
  { value: 'manual', label: '手動' },
  { value: 'priority', label: '優先度順' },
  { value: 'newest', label: '新着順' },
]

const COLLAPSED_CARD_COUNT = 3

function List({
  list,
  onAddCard,
  onDeleteList,
  onDeleteCard,
  onOpenCard,
  onRenameList,
  onChangeSortMode,
  onTogglePin,
  onToggleListPin,
  forceExpanded,
}) {
  const [newCardTitle, setNewCardTitle] = useState('')
  const [expanded, setExpanded] = useState(false)
  const { setNodeRef: setDroppableRef } = useDroppable({ id: list.id, data: { type: 'list' } })
  const {
    attributes: listDragAttributes,
    listeners: listDragListeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `list-${list.id}`,
    data: { type: 'list', listId: list.id },
    disabled: list.pinned,
  })

  const listStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const sortMode = list.sortMode || 'manual'
  const sortedCards = sortCards(list.cards, sortMode)
  const hasMore = sortedCards.length > COLLAPSED_CARD_COUNT
  const isExpanded = expanded || forceExpanded
  const displayedCards = isExpanded || !hasMore ? sortedCards : sortedCards.slice(0, COLLAPSED_CARD_COUNT)

  const handleAddCard = (e) => {
    e.preventDefault()
    const title = newCardTitle.trim()
    if (!title) return
    onAddCard(list.id, title)
    setNewCardTitle('')
  }

  return (
    <div
      className={`list ${list.pinned ? 'list-pinned' : ''}`}
      ref={setSortableRef}
      style={listStyle}
      {...listDragAttributes}
    >
      <div className="list-header" {...listDragListeners}>
        <input
          className="list-title-input"
          value={list.title}
          onChange={(e) => onRenameList(list.id, e.target.value)}
        />
        <button
          type="button"
          className={`list-pin ${list.pinned ? 'pinned' : ''}`}
          title={list.pinned ? '固定を解除' : 'リストを固定'}
          onClick={(e) => {
            e.stopPropagation()
            onToggleListPin(list.id, !list.pinned)
          }}
        >
          📌
        </button>
        <button
          type="button"
          className="list-delete"
          onClick={(e) => {
            e.stopPropagation()
            onDeleteList(list.id)
          }}
        >
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

      <div className="card-list" ref={setDroppableRef}>
        <SortableContext items={displayedCards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {displayedCards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={onOpenCard}
              onDelete={(id) => onDeleteCard(list.id, id)}
              onTogglePin={onTogglePin}
            />
          ))}
        </SortableContext>
      </div>

      {hasMore && (
        <button
          type="button"
          className="card-list-toggle"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <span className={`card-list-toggle-arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
          {isExpanded ? '閉じる' : `他 ${sortedCards.length - COLLAPSED_CARD_COUNT} 件を表示`}
        </button>
      )}

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
