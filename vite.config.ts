import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // 图片托管在 ufileos.com，响应没有 CORS 头，浏览器无法直接 fetch 成文件。
      // 走开发服务器代理转成同源请求，才能触发真正的下载。
      '/image-proxy': {
        target: 'https://maas-watermark-prod-new.cn-wlcb.ufileos.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/image-proxy/, ''),
      },
    },
  },
})
