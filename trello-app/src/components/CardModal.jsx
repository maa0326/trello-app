import { useState } from 'react'

function CardModal({ card, onClose, onSave }) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [dueDate, setDueDate] = useState(card.dueDate || '')

  const handleSave = () => {
    onSave(card.id, { title: title.trim() || card.title, description, dueDate })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <label className="modal-label">
          タイトル
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label className="modal-label">
          期限日
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>

        <label className="modal-label">
          説明
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="詳細メモを入力..."
          />
        </label>

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            キャンセル
          </button>
          <button type="button" className="primary" onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

export default CardModal
