import { useState } from 'react'
import { downloadImage } from '../utils/download'

interface DownloadButtonProps {
  url: string
  timestamp: number
}

export default function DownloadButton({ url, timestamp }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')

  async function handleClick() {
    setDownloading(true)
    setError('')
    try {
      await downloadImage(url, timestamp)
    } catch (e) {
      setError(e instanceof Error ? e.message : '下载失败，请重试。')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <button
        onClick={() => void handleClick()}
        disabled={downloading}
        className="rounded-full px-5 py-2 text-sm text-zinc-300 ring-1 ring-white/15 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {downloading ? '下载中' : '下载图片'}
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
