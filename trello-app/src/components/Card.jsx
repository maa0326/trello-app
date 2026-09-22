import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const PRIORITY_LABEL = { low: '低', mid: '中', high: '高' }

function Card({ card, onClick, onDelete, onTogglePin }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id, data: { type: 'card' } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`card ${card.pinned ? 'card-pinned' : ''}`}
      onClick={() => onClick(card)}
    >
      <span className={`priority-badge priority-${card.priority || 'mid'}`}>
        {PRIORITY_LABEL[card.priority || 'mid']}
      </span>
      <div className="card-title">{card.title}</div>
      {card.dueDate && <div className="card-due">期限: {card.dueDate}</div>}
      <button
        type="button"
        className={`card-pin ${card.pinned ? 'pinned' : ''}`}
        title={card.pinned ? '固定を解除' : 'カードを固定'}
        onClick={(e) => {
          e.stopPropagation()
          onTogglePin(card.id, !card.pinned)
        }}
      >
        📌
      </button>
      <button
        type="button"
        className="card-delete"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(card.id)
        }}
      >
        ×
      </button>
    </div>
  )
}

export default Card
