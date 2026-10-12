const IMAGE_HOST = 'maas-watermark-prod-new.cn-wlcb.ufileos.com'
const IMAGE_PROXY_PREFIX = '/image-proxy'

// 生成的图片是跨域签名 URL，且服务端不带 CORS 头，浏览器无法直接 fetch 字节。
// 命中该域名时改走开发服务器代理，变成同源请求。
export async function fetchImageBlob(url: string): Promise<Blob> {
  const parsed = new URL(url)
  const source =
    parsed.hostname === IMAGE_HOST
      ? `${IMAGE_PROXY_PREFIX}${parsed.pathname}${parsed.search}`
      : url

  const response = await fetch(source)
  if (!response.ok) {
    throw new Error('图片已过期或暂时无法访问，请重新生成后再下载。')
  }
  return response.blob()
}

// 签名 URL 里的 Expires 是秒级时间戳，过期后远程地址再也取不到内容
export function isRemoteImageAlive(url: string): boolean {
  const expires = new URL(url).searchParams.get('Expires')
  if (!expires) return true
  return Number(expires) * 1000 > Date.now()
}

export async function downloadImage(url: string, timestamp: number): Promise<void> {
  const blob = await fetchImageBlob(url)
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = `ai-image-${timestamp}.png`
  link.click()
  URL.revokeObjectURL(objectUrl)
}
