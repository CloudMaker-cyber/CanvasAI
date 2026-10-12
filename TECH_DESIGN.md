# 技术设计

## 技术栈
- React + TypeScript + Vite
- Tailwind CSS
- 智谱 AI API
- LocalStorage 存储历史生成的图片



## API 调用
- **提示词优化**走智谱AI的 Responses API（或更简单的对话补全接口），**图片生成**走 `images/generations` 接口。
- API Key 存储在环境变量中