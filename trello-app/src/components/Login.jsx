import { useState } from 'react'
import * as api from '../api'
import { saveAuth } from '../auth'

function Login({ onLoggedIn }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const auth = mode === 'login' ? await api.login(username, password) : await api.register(username, password)
      saveAuth(auth)
      onLoggedIn(auth.username)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>My Trello</h1>
        <div className="login-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'selected' : ''}
            onClick={() => setMode('login')}
          >
            ログイン
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'selected' : ''}
            onClick={() => setMode('register')}
          >
            新規登録
          </button>
        </div>

        <label className="modal-label">
          ユーザー名
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>

        <label className="modal-label">
          パスワード
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === 'register' ? 8 : undefined}
          />
        </label>

        {error && <p className="error-banner">{error}</p>}

        <button type="submit" className="primary" disabled={submitting}>
          {mode === 'login' ? 'ログイン' : '登録してログイン'}
        </button>
      </form>
    </div>
  )
}

export default Login
