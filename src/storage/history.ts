export interface HistoryItem {
  id: string
  prompt: string
  url: string
  createdAt: number
}

const STORAGE_KEY = 'canvasai:history'
export const MAX_HISTORY = 50

export function loadHistory(): HistoryItem[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isHistoryItem)
  } catch {
    return []
  }
}

export function saveHistory(items: HistoryItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)))
}

function isHistoryItem(value: unknown): value is HistoryItem {
  const item = value as Partial<HistoryItem> | null
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    typeof item.prompt === 'string' &&
    typeof item.url === 'string' &&
    typeof item.createdAt === 'number'
  )
}
