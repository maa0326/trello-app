import { getToken } from './auth'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

async function request(path, options) {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json()
      if (body?.message) message = body.message
    } catch {
      // ボディがJSONでない場合はstatusTextのまま
    }
    const error = new Error(message)
    error.status = res.status
    throw error
  }
  if (res.status === 204) return null
  return res.json()
}

export function register(username, password) {
  return request('/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) })
}

export function login(username, password) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
}

export function getBoard() {
  return request('/lists')
}

export function createList(title) {
  return request('/lists', { method: 'POST', body: JSON.stringify({ title }) })
}

export function updateList(listId, updates) {
  return request(`/lists/${listId}`, { method: 'PATCH', body: JSON.stringify(updates) })
}

export function deleteList(listId) {
  return request(`/lists/${listId}`, { method: 'DELETE' })
}

export function createCard(listId, title) {
  return request(`/lists/${listId}/cards`, { method: 'POST', body: JSON.stringify({ title }) })
}

export function updateCard(cardId, updates) {
  return request(`/cards/${cardId}`, { method: 'PATCH', body: JSON.stringify(updates) })
}

export function deleteCard(cardId) {
  return request(`/cards/${cardId}`, { method: 'DELETE' })
}

export function moveCard(cardId, targetListId, targetPosition) {
  return request(`/cards/${cardId}/move`, {
    method: 'PUT',
    body: JSON.stringify({ targetListId, targetPosition }),
  })
}

export function searchCards({ keyword, priority } = {}) {
  const params = new URLSearchParams()
  if (keyword) params.set('keyword', keyword)
  if (priority) params.set('priority', priority.toUpperCase())
  const query = params.toString()
  return request(`/cards/search${query ? `?${query}` : ''}`)
}
