export default function HistoryPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pt-16 pb-16">
      <h1 className="text-3xl font-semibold tracking-tight">生成历史</h1>
      {/* 历史存储未实现，先呈现空状态 */}
      <div className="mt-32 flex flex-col items-center gap-2 text-center">
        <p className="text-zinc-400">还没有生成记录</p>
        <p className="text-sm text-zinc-500">在创作页生成第一张图片后，你的作品会出现在这里</p>
      </div>
    </main>
  )
}
