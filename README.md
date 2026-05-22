# 花名生成器 · Huaming Name Generator

基于 [huaming](https://www.npmjs.com/package/huaming) 引擎的花名（昵称/艺名）在线生成工具，从楚辞、唐诗、宋词、诗经等古典文学中提取字词，生成富有诗意和文化底蕴的中文名字。

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Node.js + Express 5 |
| 前端 | 原生 HTML + CSS + JavaScript（无框架依赖） |
| 核心引擎 | [huaming](https://www.npmjs.com/package/huaming) v3 |
| 容器化 | Docker (node:20-alpine) |

## 功能特性

- **10 种风格**：古风、民国、近代、仙侠、现代、诗意、清雅、江湖、宫廷、森系
- **双模式生成**：
  - **引擎模式**（默认）：调用 huaming Node.js 引擎，从唐诗宋词楚辞诗经原文中取字
  - **本地模式**：内置花名词库离线生成（引擎不可用时自动降级）
- **性别偏好**：不限 / 男 / 女
- **数量控制**：1~50 个，一键生成
- **点击复制**：点击名字即可复制到剪贴板

## 快速开始

### 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 启动服务
node server.js

# 3. 打开浏览器访问
#    http://localhost:3456
#    http://localhost:3456/name-generator-online.html
```

### API 接口

服务启动后可直接调用 API：

```bash
# 获取花名列表
curl "http://localhost:3456/api/huaming?count=5&style=古风"

# 获取支持的所有风格
curl "http://localhost:3456/api/styles"
```

**API 参数说明：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `count` | number | 10 | 生成数量（最大 50） |
| `style` | string | 古风 | 风格：古风/民国/近代/仙侠/现代/诗意/清雅/江湖/宫廷/森系 |
| `gender` | string | 不限 | 性别：不限/男/女 |

**返回格式：**

```json
{
  "code": 200,
  "data": [
    {
      "name": "墨染",
      "meta": "屈原《楚辞》",
      "source": "楚辞"
    }
  ],
  "total": 5
}
```

## Docker 部署

### 构建镜像

```bash
docker build -t nickname-generator .

### 运行容器

```bash
docker run -d -p 3456:3456 nickname-generator
```

### 验证

```bash
curl http://localhost:3456/api/huaming?count=3&style=诗意
curl http://localhost:3456/api/styles
```

然后打开 `http://localhost:3456` 即可使用 Web 界面。

## 项目结构

```
.
├── server.js                  # Express 服务入口
├── name-generator-online.html # Web 前端页面（单页应用）
├── package.json
├── Dockerfile
├── .dockerignore
└── README.md
```
