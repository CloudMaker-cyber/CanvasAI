# CanvasAI · AI 图片生成器

React + TypeScript 编写的 AI 图片生成器，调用智谱 AI 接口完成图片生成与提示词优化，生成结果保存在浏览器本地。本项目为纯本机学习用途，未部署公网。

## 功能

- **图片生成**：多行输入画面描述，`Enter` 生成、`Shift+Enter` 换行；生成中显示骨架屏并禁用输入，避免重复提交
- **尺寸选择**：`1:1` / `4:3` / `16:9` / `9:16`，映射到接口支持的预设分辨率
- **风格选择**：下拉框（自动 / 写实 / 动漫 / 油画 / 水彩 / 像素风）起提示与补充作用。描述里已写明风格时**以描述为准**，不再附加所选风格（接口无 style 参数，风格靠拼接提示词实现）
- **提示词优化**：调用文本模型把简单描述扩写为覆盖主体、风格、光线、色彩、构图的完整提示词，结果填回输入框
- **图片下载**：文件名格式 `ai-image-[生成时间戳].png`
- **生成历史**：每次成功生成后保存提示词、图片地址与时间；历史页左侧列表（缩略图 + 提示词）点击可看大图，支持逐条删除

## 技术栈

React 19 · TypeScript · Vite · Tailwind CSS v4 · oxlint。无路由库，创作页与历史页用状态切换。

## 环境准备

1. 安装依赖：`npm install`
2. 配置 API Key（两种方式任选其一）：
   - 复制 `.env.example` 为 `.env`，填入 `VITE_ZHIPU_API_KEY=...`（`.env` 已被 `.gitignore` 忽略）
   - 或设置系统环境变量 `VITE_ZHIPU_API_KEY`；Vite 在启动时把它内联进前端代码，**设置后需要重启 dev server**
3. 启动：`npm run dev`，浏览器打开终端提示的地址（默认 `http://localhost:5173`）

Key 只出现在请求头中，代码里不硬编码。

## 常用命令

```bash
npm run dev      # 开发服务器（含图片代理）
npm run build    # 类型检查 + 生产构建
npm run preview  # 预览构建产物
npm run lint     # 代码检查
```

## 目录结构

```
src/api/zhipu.ts          智谱接口：图片生成 + 提示词优化，错误统一转成友好文案
src/components/           CreatePage / HistoryPage / TopNav / DownloadButton
src/storage/history.ts    历史记录元数据，存 LocalStorage，上限 50 条
src/storage/images.ts     图片本地副本，存 IndexedDB（dataURL）
src/utils/download.ts     取图、签名 URL 过期判断、触发下载
vite.config.ts            dev server 把 /image-proxy 代理到图片 CDN
```

## 两个关键实现细节

1. **图片直链是带签名的临时地址（约 7 天后过期），且响应没有 CORS 头。** 浏览器直接 `fetch` 会被跨域拦截，`<a>` 上的 `download` 属性对跨域地址也会被忽略。解决办法：下载请求走 Vite 的 `/image-proxy` 代理变成同源，再 `fetch` → `Blob` → `URL.createObjectURL`。同时每次生成成功后把图片转存进 IndexedDB，历史页与下载优先使用本地副本，不再依赖会过期的直链。LocalStorage 只放元数据，因为它约 5MB 的配额装不下几十张图。
2. **代理只存在于 `npm run dev`。** 用 `vite preview`、静态托管或 `file://` 打开时下载会失效。本项目定位为纯本机使用，未处理该场景。

## 已知限制

- 使用的免费图片模型会在返回图上加水印
- 并发请求可能触发接口限流（错误码 1302），界面用统一的禁用态规避
- `npm run build` 产物 `dist/` 中会内联 API Key，该目录已被 `.gitignore` 忽略，请勿提交或分享
