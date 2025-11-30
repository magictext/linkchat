# LinkChat 开发文档

## 项目概述
LinkChat 是一个基于节点的 LLM 聊天前端应用程序，使用 Vue.js 构建。该应用程序支持 OpenAI 兼容的 LLM 连接和多种数据持久化方法。

## 功能特性
- 基于节点的 LLM 交互聊天界面
- 支持 OpenAI API 连接
- Vue.js 前端框架
- 多种数据持久化选项
  - 浏览器数据库（IndexedDB）用于网页使用
  - 文件系统/数据库支持用于 PC/移动应用程序

## 技术栈
- **前端框架**: Vue 3
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **数据库**: IndexedDB（浏览器），支持扩展其他存储选项

## 快速开始

### 前置要求
- Node.js (v16 或更高版本)
- npm 或 cnpm

### 安装
1. 克隆仓库
2. 使用 `npm install` 或 `cnpm install` 安装依赖
3. 使用 `npm run dev` 运行开发服务器

### 脚本命令
- `npm run dev`: 启动开发服务器
- `npm run build`: 构建生产版本
- `npm run preview`: 预览生产构建
- `npm run lint`: 检查并修复代码

## 项目结构
```
linkchat/
├── public/           # 静态资源
├── src/              # 源文件
│   ├── assets/       # 图片、样式等
│   ├── components/   # Vue 组件
│   ├── views/        # 页面组件
│   ├── stores/       # Pinia 存储
│   ├── router/       # Vue Router 配置
│   └── App.vue       # 主应用程序组件
├── package.json
├── vite.config.js    # Vite 配置
└── develop.md        # 本文档
```

## 架构设计
应用程序采用模块化架构设计，以支持：
- 不同 LLM 提供商（从 OpenAI 开始）
- 多种持久化层
- 基于节点的聊天界面
- 跨平台兼容性（网页、PC 应用、移动应用）

## 开发指南
- 遵循 Vue 3 组合式 API 模式
- 使用 TypeScript 确保类型安全（将来添加）
- 实现响应式设计以支持跨平台
- 使用 async/await 进行 API 调用
- 实现适当的错误处理
- 项目要求注释完善，使用中文注释增加项目可读性

## 持久化策略
- **网页浏览器**: IndexedDB 用于本地存储
- **PC 应用**: 文件系统或嵌入式数据库
- **移动应用**: SQLite 或类似本地数据库