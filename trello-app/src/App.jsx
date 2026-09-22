import { useEffect, useState } from 'react'
import Board from './components/Board'
import SearchBar from './components/SearchBar'
import SearchResults from './components/SearchResults'
import Login from './components/Login'
import { getBoard, searchCards } from './api'
import { normalizeBoard, normalizeCard } from './normalize'
import { clearAuth, getToken, getUsername } from './auth'
import './App.css'

function App() {
  const [username, setUsername] = useState(getToken() ? getUsername() : null)

  const [data, setData] = useState({ lists: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)

  useEffect(() => {
    if (!username) return
    getBoard()
      .then((lists) => setData(normalizeBoard(lists)))
      .catch((err) => {
        if (err.status === 401) {
          handleLogout()
          return
        }
        setError(err.message)
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  const handleSearch = ({ keyword, priority }) => {
    setIsSearching(true)
    setSearchLoading(true)
    setSearchError(null)
    searchCards({ keyword, priority })
      .then((cards) => setSearchResults((cards || []).map(normalizeCard)))
      .catch((err) => setSearchError(err.message))
      .finally(() => setSearchLoading(false))
  }

  const handleClearSearch = () => {
    setIsSearching(false)
    setSearchResults([])
    setSearchError(null)
  }

  const handleLogout = () => {
    clearAuth()
    setUsername(null)
    setData({ lists: [] })
    setLoading(true)
  }

  if (!username) {
    return <Login onLoggedIn={setUsername} />
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <h1>My Trello</h1>
          <div className="user-menu">
            <span>{username}</span>
            <button type="button" onClick={handleLogout}>
              ログアウト
            </button>
          </div>
        </div>
        <SearchBar onSearch={handleSearch} onClear={handleClearSearch} isSearching={isSearching} />
      </header>
      {error && <p className="error-banner">通信エラー: {error}（バックエンドが起動しているか確認してください）</p>}
      {loading ? (
        <p className="loading">読み込み中...</p>
      ) : isSearching ? (
        <SearchResults cards={searchResults} loading={searchLoading} error={searchError} />
      ) : (
        <Board data={data} setData={setData} />
      )}
    </div>
  )
}

export default App
