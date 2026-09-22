const TOKEN_KEY = 'trello_token'
const USERNAME_KEY = 'trello_username'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUsername() {
  return localStorage.getItem(USERNAME_KEY)
}

export function saveAuth({ token, username }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USERNAME_KEY, username)
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
}
