import { useEffect, useState } from 'react'
import Board from './components/Board'
import { loadData, saveData } from './storage'
import './App.css'

function App() {
  const [data, setData] = useState(loadData)

  useEffect(() => {
    saveData(data)
  }, [data])

  return (
    <div className="app">
      <header className="app-header">
        <h1>My Trello</h1>
      </header>
      <Board data={data} setData={setData} />
    </div>
  )
}

export default App
