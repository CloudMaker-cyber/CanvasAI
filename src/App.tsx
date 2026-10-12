import { useEffect, useState } from 'react'
import CreatePage from './components/CreatePage'
import HistoryPage from './components/HistoryPage'
import TopNav from './components/TopNav'
import { MAX_HISTORY, loadHistory, saveHistory } from './storage/history'
import type { HistoryItem } from './storage/history'
import { blobToDataUrl, deleteImageSource, getImageSource, setImageSource } from './storage/images'
import { fetchImageBlob, isRemoteImageAlive } from './utils/download'

export type View = 'create' | 'history'

export default function App() {
  const [view, setView] = useState<View>('create')
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory)
  const [sources, setSources] = useState<Record<string, string>>({})

  useEffect(() => {
    saveHistory(history)
  }, [history])

  // 远程签名 URL 约 7 天后失效，所以每条记录都要在本地 IndexedDB 存一份副本
  useEffect(() => {
    let cancelled = false
    void (async () => {
      for (const item of history) {
        const local = await getImageSource(item.id)
        if (local) {
          if (!cancelled) setSources((prev) => ({ ...prev, [item.id]: local }))
          continue
        }
        if (!isRemoteImageAlive(item.url)) continue
        try {
          const dataUrl = await blobToDataUrl(await fetchImageBlob(item.url))
          await setImageSource(item.id, dataUrl)
          if (!cancelled) setSources((prev) => ({ ...prev, [item.id]: dataUrl }))
        } catch {
          // 暂时取不到就先用远程地址显示，下次进入再补
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [history])

  function handleGenerated(item: HistoryItem) {
    setHistory((prev) => [item, ...prev].slice(0, MAX_HISTORY))
  }

  function handleDelete(id: string) {
    setHistory((prev) => prev.filter((item) => item.id !== id))
    setSources((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    void deleteImageSource(id)
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <TopNav view={view} onChange={setView} />
      {view === 'create' ? (
        <CreatePage history={history} sources={sources} onGenerated={handleGenerated} />
      ) : (
        <HistoryPage history={history} sources={sources} onDelete={handleDelete} />
      )}
    </div>
  )
}
