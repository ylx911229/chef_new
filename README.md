# Chef Recipe MCP Server

一个基于 TypeScript 的 MCP (Model Context Protocol) 服务器，用于搜索中文菜谱。

## 功能特性

- 🔍 **智能搜索**: 根据菜名、食材或描述模糊搜索菜谱
- 📋 **详细信息**: 获取完整的菜谱制作步骤和食材清单
- 🏷️ **分类浏览**: 按菜系分类浏览菜谱
- 🌐 **实时数据**: 从远程数据源获取最新菜谱信息

## 安装和使用

### 1. 安装依赖

```bash
npm install
```

### 2. 构建项目

```bash
npm run build
```

### 3. 运行服务器

```bash
npm start
```

或者在开发模式下运行：

```bash
npm run dev
```

## 可用工具

### 1. search_recipes
根据关键词搜索菜谱

**参数:**
- `query` (string): 搜索关键词
- `limit` (number, 可选): 返回结果数量，默认为5

**示例:**
```json
{
  "query": "咖喱蟹",
  "limit": 3
}
```

### 2. get_recipe_detail
获取菜谱的详细信息

**参数:**
- `recipe_id` (string): 菜谱ID

**示例:**
```json
{
  "recipe_id": "dishes-aquatic-咖喱炒蟹"
}
```

### 3. get_recipes_by_category
按分类获取菜谱列表

**参数:**
- `category` (string): 菜谱分类

**示例:**
```json
{
  "category": "水产"
}
```

### 4. get_categories
获取所有可用分类

**参数:** 无

## 数据源

菜谱数据来自: https://weilei.site/all_recipes.json

## 技术栈

- TypeScript
- MCP SDK
- Fuse.js (模糊搜索)
- Node.js

## 开发

### 项目结构

```
├── src/
│   ├── index.ts          # MCP服务器入口
│   ├── recipeService.ts  # 菜谱服务类
│   └── types.ts          # 类型定义
├── package.json
├── tsconfig.json
└── README.md
```

### 构建和运行

```bash
# 清理构建目录
npm run clean

# 构建项目
npm run build

# 运行服务器
npm start
```

## 许可证

MIT License 