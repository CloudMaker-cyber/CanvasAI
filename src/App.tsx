import { useEffect, useState } from 'react'
import CreatePage from './components/CreatePage'
import HistoryPage from './components/HistoryPage'
import TopNav from './components/TopNav'
import { MAX_HISTORY, loadHistory, saveHistory } from './storage/history'
import type { HistoryItem } from './storage/history'

export type View = 'create' | 'history'

export default function App() {
  const [view, setView] = useState<View>('create')
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory)

  useEffect(() => {
    saveHistory(history)
  }, [history])

  function handleGenerated(item: HistoryItem) {
    setHistory((prev) => [item, ...prev].slice(0, MAX_HISTORY))
  }

  function handleDelete(id: string) {
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <TopNav view={view} onChange={setView} />
      {view === 'create' ? (
        <CreatePage history={history} onGenerated={handleGenerated} />
      ) : (
        <HistoryPage history={history} onDelete={handleDelete} />
      )}
    </div>
  )
}
