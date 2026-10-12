import { useState } from 'react'
import { generateImage, optimizePrompt } from '../api/zhipu'

const SIZE_OPTIONS = ['1:1', '4:3', '16:9', '9:16'] as const
type SizeOption = (typeof SIZE_OPTIONS)[number]

const STYLE_OPTIONS = ['自动', '写实', '动漫', '油画', '水彩', '像素风'] as const
type StyleOption = (typeof STYLE_OPTIONS)[number]

// UI 比例映射到接口支持的预设分辨率
const SIZE_MAP: Record<SizeOption, string> = {
  '1:1': '1024x1024',
  '4:3': '1152x864',
  '16:9': '1344x768',
  '9:16': '768x1344',
}

const SKELETON_CLASS: Record<SizeOption, string> = {
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-video',
  '9:16': 'mx-auto aspect-[9/16] max-w-[260px]',
}

// 接口没有 style 参数，风格通过拼接提示词实现；"自动"不拼接，完全尊重用户描述
const STYLE_SUFFIX: Partial<Record<StyleOption, string>> = {
  写实: '写实摄影风格，超高细节',
  动漫: '日系动漫插画风格',
  油画: '古典油画风格，厚重笔触',
  水彩: '清新水彩插画风格',
  像素风: '复古像素艺术风格',
}

type Status = 'idle' | 'loading' | 'success' | 'error'

// public/gallery 下 4 张为 AI 生成的演示图，接入真实生成历史后整段替换
const demoImages = [
  { src: '/gallery/lake.png', alt: '高山湖泊' },
  { src: '/gallery/dune-grass.png', alt: '海岸草丘' },
  { src: '/gallery/sunburst.png', alt: '云隙日出' },
  { src: '/gallery/desert.png', alt: '沙漠沙丘' },
]

export default function CreatePage() {
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState<SizeOption>('1:1')
  const [style, setStyle] = useState<StyleOption>('自动')
  const [status, setStatus] = useState<Status>('idle')
  const [imageUrl, setImageUrl] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [optimizing, setOptimizing] = useState(false)

  const generating = status === 'loading'
  const busy = generating || optimizing

  async function handleOptimize() {
    const trimmed = prompt.trim()
    if (!trimmed) {
      setStatus('error')
      setErrorMsg('请先输入需要优化的描述。')
      return
    }
    setOptimizing(true)
    setErrorMsg('')
    try {
      const optimized = await optimizePrompt(trimmed)
      setPrompt(optimized)
      setStatus((s) => (s === 'error' ? 'idle' : s))
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : '优化失败，请重试。')
      setStatus('error')
    } finally {
      setOptimizing(false)
    }
  }

  async function handleGenerate() {
    const trimmed = prompt.trim()
    if (!trimmed) {
      setStatus('error')
      setErrorMsg('请先输入图片描述。')
      return
    }
    setStatus('loading')
    setErrorMsg('')
    try {
      const suffix = STYLE_SUFFIX[style]
      const url = await generateImage({
        prompt: suffix ? `${trimmed}，${suffix}` : trimmed,
        size: SIZE_MAP[size],
      })
      setImageUrl(url)
      setStatus('success')
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : '生成失败，请重试。')
      setStatus('error')
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6">
      <section className="flex flex-col items-center pt-16 md:pt-20">
        <h1 className="text-center text-4xl font-semibold tracking-tight md:text-6xl">
          释放你的想象力
        </h1>

        <div className="mt-10 flex w-full max-w-2xl items-center gap-2 rounded-full bg-zinc-900 p-2 ring-1 ring-white/10">
          <label htmlFor="prompt" className="sr-only">
            图片描述
          </label>
          <input
            id="prompt"
            type="text"
            value={prompt}
            disabled={busy}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !busy) void handleGenerate()
            }}
            placeholder="描述你想要生成的画面..."
            className="min-w-0 flex-1 bg-transparent px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none disabled:cursor-not-allowed"
          />
          <button
            onClick={() => void handleGenerate()}
            disabled={busy}
            className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-zinc-950 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? '生成中' : '生成'}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <label htmlFor="size" className="sr-only">
            图片尺寸
          </label>
          <select
            id="size"
            value={size}
            disabled={busy}
            onChange={(e) => setSize(e.target.value as SizeOption)}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm text-zinc-300 ring-1 ring-white/10 disabled:cursor-not-allowed"
          >
            {SIZE_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <label htmlFor="style" className="sr-only">
            图片风格
          </label>
          <select
            id="style"
            value={style}
            disabled={busy}
            onChange={(e) => setStyle(e.target.value as StyleOption)}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm text-zinc-300 ring-1 ring-white/10 disabled:cursor-not-allowed"
          >
            {STYLE_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <button
            onClick={() => void handleOptimize()}
            disabled={busy}
            className="rounded-full px-4 py-2 text-sm text-zinc-400 ring-1 ring-white/15 transition-colors hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {optimizing ? '优化中' : '优化提示词'}
          </button>
        </div>

        {status !== 'idle' && (
          <div className="mt-10 w-full max-w-2xl">
            {generating && (
              <div
                className={`relative w-full overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/10 ${SKELETON_CLASS[size]}`}
              >
                <div className="shimmer absolute inset-0" />
                <p className="absolute inset-0 flex items-center justify-center text-sm text-zinc-400">
                  正在生成图片，通常需要 10～30 秒…
                </p>
              </div>
            )}
            {status === 'error' && (
              <p
                role="alert"
                className="rounded-2xl bg-red-950/40 px-5 py-4 text-sm text-red-300 ring-1 ring-red-900/60"
              >
                {errorMsg}
              </p>
            )}
            {status === 'success' && (
              <img
                src={imageUrl}
                alt={prompt}
                className="mx-auto max-h-[70vh] rounded-2xl object-contain ring-1 ring-white/10"
              />
            )}
          </div>
        )}
      </section>

      <section className="mt-20 pb-16">
        <h2 className="text-lg font-medium">近期作品</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {demoImages.map((img) => (
            <img
              key={img.src}
              src={img.src}
              alt={img.alt}
              className="aspect-square w-full rounded-2xl object-cover transition-opacity duration-300 hover:opacity-90"
            />
          ))}
        </div>
      </section>
    </main>
  )
}
