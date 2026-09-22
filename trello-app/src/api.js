const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

async function request(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export function getBoard() {
  return request('/lists')
}

export function createList(title) {
  return request('/lists', { method: 'POST', body: JSON.stringify({ title }) })
}

export function updateList(listId, updates) {
  return request(`/lists/${listId}`, { method: 'PUT', body: JSON.stringify(updates) })
}

export function deleteList(listId) {
  return request(`/lists/${listId}`, { method: 'DELETE' })
}

export function createCard(listId, title) {
  return request(`/lists/${listId}/cards`, { method: 'POST', body: JSON.stringify({ title }) })
}

export function updateCard(cardId, updates) {
  return request(`/cards/${cardId}`, { method: 'PUT', body: JSON.stringify(updates) })
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
