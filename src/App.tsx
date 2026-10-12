import { useState } from 'react'
import CreatePage from './components/CreatePage'
import HistoryPage from './components/HistoryPage'
import TopNav from './components/TopNav'

export type View = 'create' | 'history'

export default function App() {
  const [view, setView] = useState<View>('create')

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <TopNav view={view} onChange={setView} />
      {view === 'create' ? <CreatePage /> : <HistoryPage />}
    </div>
  )
}
