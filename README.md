# 🧠 多模态AI系统学习平台

[![Deploy to GitHub Pages](https://github.com/neko233-com/ai-learning-website/actions/workflows/deploy.yml/badge.svg)](https://github.com/neko233-com/ai-learning-website/actions/workflows/deploy.yml)

一个循序渐进学习多模态AI知识的交互式平台。

## 🌐 在线访问

**[https://neko233-com.github.io/ai-learning-website/](https://neko233-com.github.io/ai-learning-website/)**

## ✨ 功能特点

- 📚 **系统化学习路径** - 10个章节，从基础到前沿循序渐进
- 📊 **进度追踪** - 自动保存学习进度到本地存储
- 🔓 **章节解锁机制** - 完成当前章节解锁下一章
- 📝 **知识测验** - 每个知识点配备小测验巩固学习
- 🏆 **成就系统** - 完成章节获得成就提示
- 📱 **响应式设计** - 支持桌面和移动设备
- 🌙 **美观UI** - 现代化渐变设计，毛玻璃效果

## 📖 章节目录

| 章节 | 主题 | 知识点数量 |
|------|------|------------|
| 1 | 深度学习基础 | 5 |
| 2 | 注意力机制与Transformer | 5 |
| 3 | 预训练语言模型 | 5 |
| 4 | 视觉Transformer与图像理解 | 5 |
| 5 | 多模态大模型 | 5 |
| 6 | 图像生成与扩散模型 | 5 |
| 7 | 语音与音频AI | 5 |
| 8 | 视频理解与生成 | 5 |
| 9 | 模型优化与部署 | 5 |
| 10 | 前沿话题与未来趋势 | 5 |

## 🏗️ 项目结构

```
ai-learning-website/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 自动部署
├── src/
│   ├── css/
│   │   └── main.css            # 主样式文件
│   ├── js/
│   │   ├── app.js              # 主应用逻辑
│   │   ├── storage.js          # 存储管理
│   │   └── ui.js               # UI 渲染
│   └── data/
│       └── knowledge-base.json # 知识库数据
├── assets/
│   ├── images/                 # 图片资源
│   └── icons/                  # 图标资源
├── docs/
│   └── LOCAL_MODEL_GUIDE.md    # 本地模型搭建指南
├── index.html                  # 主页面
├── README.md
├── LICENSE
└── .gitignore
```

## 🚀 本地运行

### 方式一：直接打开

直接用浏览器打开 `index.html` 即可。

### 方式二：本地服务器（推荐）

```bash
# 使用 Python
python -m http.server 8080

# 或使用 Node.js
npx serve .

# 或使用 VS Code Live Server 插件
```

然后访问 `http://localhost:8080`

## 🔧 技术栈

- **前端**: 原生 HTML5 + CSS3 + JavaScript (ES6+)
- **样式**: CSS 变量 + Flexbox + Grid
- **存储**: localStorage
- **部署**: GitHub Pages + GitHub Actions

## 📚 相关资源

- [本地特调模型实现指南](./docs/LOCAL_MODEL_GUIDE.md) - 如何搭建本地 AI 系统生成小说和二次元图片

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 添加新知识点

1. 编辑 `src/data/knowledge-base.json`
2. 按照现有格式添加新的 topic
3. 确保包含：term, english, definition, tips, difficulty, quiz

### 代码规范

- CSS 使用 BEM 命名规范
- JavaScript 使用 ES6+ 语法
- 注释使用 JSDoc 格式

## 📄 License

MIT License - 详见 [LICENSE](./LICENSE)

## 🙏 致谢

- 原始知识库参考：[multimodal-knowledge-game](https://sikickchen47.github.io/multimodal-knowledge-game/)
- UI 设计灵感：现代化学习平台

---

Made with ❤️ by [neko233](https://github.com/neko233-com)
