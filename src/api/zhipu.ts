const API_URL = 'https://open.bigmodel.cn/api/paas/v4/images/generations'
const MODEL = 'cogview-3-flash'

const CHAT_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
const TEXT_MODEL = 'glm-4.5-flash'

export interface GenerateImageParams {
  prompt: string
  size: string
}

export class ApiError extends Error {}

function requestApiKey(): string {
  const apiKey = import.meta.env.VITE_ZHIPU_API_KEY
  if (!apiKey) {
    throw new ApiError('未找到 API Key。请确认系统环境变量 VITE_ZHIPU_API_KEY 已设置，且开发服务器是在设置之后重新启动的。')
  }
  return apiKey
}

async function postJson(url: string, body: unknown): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requestApiKey()}`,
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError('网络连接失败，请检查网络（本机可能需要开启代理）后重试。')
  }

  const data = (await response.json().catch(() => null)) as unknown
  if (!response.ok) {
    const msg = (data as { error?: { message?: string } } | null)?.error?.message
    throw new ApiError(msg || `接口返回错误（HTTP ${response.status}），请稍后重试。`)
  }
  return data
}

export async function generateImage({ prompt, size }: GenerateImageParams): Promise<string> {
  const data = await postJson(API_URL, { model: MODEL, prompt, size }) as {
    data?: { url?: string }[]
  } | null
  const url = data?.data?.[0]?.url
  if (!url) {
    throw new ApiError('接口未返回图片地址，请稍后重试。')
  }
  return url
}

const OPTIMIZE_SYSTEM_PROMPT =
  '你是图片生成提示词专家。用户会给出一个简单的画面描述，你把它扩写成一段详细的图片生成提示词，' +
  '必须覆盖这些维度：主体细节、画面风格、光线、色彩、构图。' +
  '如果用户描述中已经包含风格意图（如动漫、水彩、油画、像素等），必须保留该风格并围绕它扩写，不得擅自改成写实风格。' +
  '要求：只输出提示词正文，写成连贯的一段话；不要解释、不要引号、不要分点列表。'

// styleHint 是下拉框所选风格，仅在描述本身没写明风格时传入，作为补充信息
export async function optimizePrompt(prompt: string, styleHint?: string): Promise<string> {
  const userContent = styleHint
    ? `${prompt}\n（画面风格倾向：${styleHint}，请围绕该风格扩写）`
    : prompt
  const data = await postJson(CHAT_URL, {
    model: TEXT_MODEL,
    messages: [
      { role: 'system', content: OPTIMIZE_SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
  }) as { choices?: { message?: { content?: string } }[] } | null

  const content = data?.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new ApiError('AI 未返回优化结果，请重试。')
  }
  return content
}
