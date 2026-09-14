import { useEffect, useState } from 'react'
import Board from './components/Board'
import { getBoard } from './api'
import { normalizeBoard } from './normalize'
import './App.css'

function App() {
  const [data, setData] = useState({ lists: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getBoard()
      .then((lists) => setData(normalizeBoard(lists)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>My Trello</h1>
      </header>
      {error && <p className="error-banner">通信エラー: {error}（バックエンドが起動しているか確認してください）</p>}
      {loading ? <p className="loading">読み込み中...</p> : <Board data={data} setData={setData} />}
    </div>
  )
}

export default App
