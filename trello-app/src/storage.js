const STORAGE_KEY = 'trello-app-data'

const initialData = {
  lists: [
    {
      id: 'list-1',
      title: '未着手',
      cards: [],
    },
    {
      id: 'list-2',
      title: '作業中',
      cards: [],
    },
    {
      id: 'list-3',
      title: '完了',
      cards: [],
    },
  ],
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialData
    return JSON.parse(raw)
  } catch {
    return initialData
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
