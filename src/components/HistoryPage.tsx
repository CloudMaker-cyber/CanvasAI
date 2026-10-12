import { useState } from 'react'
import type { HistoryItem } from '../storage/history'

interface HistoryPageProps {
  history: HistoryItem[]
  onDelete: (id: string) => void
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function HistoryPage({ history, onDelete }: HistoryPageProps) {
  const [selectedId, setSelectedId] = useState('')
  const selected = history.find((item) => item.id === selectedId) ?? history[0]

  if (!selected) {
    return (
      <main className="mx-auto max-w-6xl px-6 pt-16 pb-16">
        <h1 className="text-3xl font-semibold tracking-tight">生成历史</h1>
        <div className="mt-32 flex flex-col items-center gap-2 text-center">
          <p className="text-zinc-400">还没有生成记录</p>
          <p className="text-sm text-zinc-500">在创作页生成第一张图片后，你的作品会出现在这里</p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-6 pt-12 pb-16">
      <h1 className="text-3xl font-semibold tracking-tight">生成历史</h1>

      <div className="mt-8 grid gap-6 md:grid-cols-[300px_1fr]">
        <ul className="max-h-[72vh] space-y-2 overflow-y-auto pr-1">
          {history.map((item) => (
            <li
              key={item.id}
              className={`flex items-stretch gap-1 rounded-xl ring-1 ${
                item.id === selected.id ? 'bg-zinc-800 ring-white/25' : 'bg-zinc-900 ring-white/10'
              }`}
            >
              <button
                onClick={() => setSelectedId(item.id)}
                className="flex min-w-0 flex-1 items-start gap-3 p-2 text-left"
              >
                <img
                  src={item.url}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-xs leading-relaxed text-zinc-300">
                    {item.prompt}
                  </span>
                  <span className="mt-1 block text-[11px] text-zinc-500">
                    {formatTime(item.createdAt)}
                  </span>
                </span>
              </button>
              <button
                onClick={() => onDelete(item.id)}
                aria-label="删除这条记录"
                className="px-2 text-zinc-600 transition-colors hover:text-red-400"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <section className="min-w-0">
          <img
            src={selected.url}
            alt={selected.prompt}
            className="mx-auto max-h-[62vh] rounded-2xl object-contain ring-1 ring-white/10"
          />
          <div className="mx-auto mt-5 max-w-2xl">
            <p className="text-sm leading-relaxed text-zinc-300">{selected.prompt}</p>
            <p className="mt-2 text-xs text-zinc-500">生成于 {formatTime(selected.createdAt)}</p>
          </div>
        </section>
      </div>
    </main>
  )
}
