const PRIORITY_LABEL = { low: '低', mid: '中', high: '高' }

function SearchResults({ cards, loading, error }) {
  if (loading) return <p className="loading">検索中...</p>
  if (error) return <p className="error-banner">検索エラー: {error}</p>
  if (cards.length === 0) return <p className="loading">該当するカードが見つかりませんでした</p>

  return (
    <div className="list search-results">
      <div className="card-list">
        {cards.map((card) => (
          <div key={card.id} className="card">
            <span className={`priority-badge priority-${card.priority || 'mid'}`}>
              {PRIORITY_LABEL[card.priority || 'mid']}
            </span>
            <div className="card-title">{card.title}</div>
            {card.dueDate && <div className="card-due">期限: {card.dueDate}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchResults
