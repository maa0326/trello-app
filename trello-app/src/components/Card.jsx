import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function Card({ card, onClick, onDelete }) {
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
      className="card"
      onClick={() => onClick(card)}
    >
      <div className="card-title">{card.title}</div>
      {card.dueDate && <div className="card-due">期限: {card.dueDate}</div>}
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
