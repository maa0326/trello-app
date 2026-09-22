import { useState } from 'react'

const PRIORITY_OPTIONS = [
  { value: '', label: 'すべて' },
  { value: 'LOW', label: '低' },
  { value: 'MID', label: '中' },
  { value: 'HIGH', label: '高' },
]

function SearchBar({ onSearch, onClear, isSearching }) {
  const [keyword, setKeyword] = useState('')
  const [priority, setPriority] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch({ keyword: keyword.trim(), priority })
  }

  const handleClear = () => {
    setKeyword('')
    setPriority('')
    onClear()
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="カードを検索..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        {PRIORITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button type="submit">検索</button>
      {isSearching && (
        <button type="button" onClick={handleClear}>
          クリア
        </button>
      )}
    </form>
  )
}

export default SearchBar
