import type { View } from '../App'

interface TopNavProps {
  view: View
  onChange: (view: View) => void
}

const items: { key: View; label: string }[] = [
  { key: 'create', label: '创作' },
  { key: 'history', label: '历史' },
]

export default function TopNav({ view, onChange }: TopNavProps) {
  return (
    <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
      <span className="text-lg font-semibold tracking-tight">CanvasAI</span>
      <div className="flex items-center gap-8">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={
              view === item.key
                ? 'text-sm font-medium text-zinc-100'
                : 'text-sm text-zinc-400 transition-colors hover:text-zinc-200'
            }
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
