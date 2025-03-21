# PBI (Power BI Intelligence)

这是一个基于 Next.js 构建的智能数据可视化系统。

## 项目概述

本项目是一个智能化的数据可视化系统，能够根据数据特征和用户需求自动生成最适合的图表展示。系统支持多种图表类型，并提供了灵活的配置选项和交互功能。

## 技术栈

- **前端框架**: Next.js 13+
- **UI 库**: Ant Design
- **图表库**: ECharts
- **开发语言**: TypeScript
- **样式方案**: Tailwind CSS

## 安全说明

本项目是公开的，但需要注意以下安全事项：

1. **环境变量**：
   - 不要提交 `.env.local` 文件（已在 `.gitignore` 中排除）
   - 使用 `.env.example` 作为模板，不包含实际值

2. **敏感信息**：
   - API 密钥、服务 URL 等敏感信息应存储在 GitHub Secrets 中
   - 部署时通过 Kubernetes Secrets 管理

3. **安全最佳实践**：
   - 详细信息请参阅 [安全最佳实践指南](.github/SECURITY_BEST_PRACTICES.md)

## Docker 支持

本项目支持通过 Docker 进行部署。

### 使用预构建镜像

```bash
# 从阿里云容器镜像服务拉取镜像
docker pull registry.cn-hangzhou.aliyuncs.com/命名空间/chatbi:latest

# 或从 GitHub Container Registry 拉取
docker pull ghcr.io/用户名/chatbi:latest

# 或从 Docker Hub 拉取
docker pull 用户名/chatbi:latest

# 运行容器
docker run -p 3000:3000 registry.cn-hangzhou.aliyuncs.com/命名空间/chatbi:latest
```

### 本地构建镜像

```bash
# 构建镜像
docker build -t chatbi:local .

# 运行容器
docker run -p 3000:3000 chatbi:local
```

### 使用 Docker Compose

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down
```

更多关于 Docker 镜像发布的信息，请参阅 [Docker 镜像发布指南](.github/DOCKER_PUBLISH_GUIDE.md)。

## Kubernetes 部署

本项目支持部署到 Kubernetes 集群，特别是 Amazon EKS。

### Amazon EKS 部署

我们提供了完整的 EKS 部署配置和脚本：

```bash
# 快速部署到 EKS，使用阿里云容器镜像服务
./k8s/eks/deploy.sh production v1.0.0 aliyun

# 或使用 GitHub Container Registry
./k8s/eks/deploy.sh production v1.0.0 ghcr

# 或使用 Docker Hub
./k8s/eks/deploy.sh production v1.0.0 dockerhub
```

部署配置包括：
- Deployment（应用部署）
- Service（服务暴露）
- Ingress（入口配置）
- HPA（自动扩展）
- ConfigMap（配置管理）
- Secret（敏感信息）

详细的部署说明请参阅 [EKS 部署指南](k8s/eks/README.md)。

## 系统架构

### 1. 核心架构设计

#### 1.1 注册表模式
```typescript
class ChartHandlerRegistry {
    private static instance: ChartHandlerRegistry;
    private handlers = new Map<ChartType, ChartTypeHandler>();
    
    // 提供注册和获取处理器的方法
    register(type: ChartType, handler: ChartTypeHandler): void
    getHandler(type: ChartType): ChartTypeHandler | undefined
    getImplementedTypes(): ChartType[]
}
```

#### 1.2 基础处理器抽象
```typescript
abstract class BaseChartHandler {
    // 提供通用的图表配置方法
    protected getDefaultTooltip()
    protected getDefaultGrid()
    protected getDefaultLegend()
    protected formatValue()
    protected getColorPalette()
}
```

### 2. 类型系统设计

#### 2.1 图表类型定义
```typescript
export const CHART_TYPES = ['bar', 'line', 'pie', ...] as const;
export type ChartType = typeof CHART_TYPES[number];
```

#### 2.2 处理器接口定义
```typescript
interface ChartTypeHandler {
    validateData(data: any[]): ValidationResult;
    preProcess(data: any[]): ProcessedData;
    getEncode(dimensions: string[]): Record<string, any>;
    getSeriesConfig(processedData: ProcessedData): any;
    getSpecialConfig?(processedData: ProcessedData): any;
}
```

### 3. 数据流设计

1. 原始数据输入
2. 数据验证
3. 数据预处理
4. 生成基础配置
5. 生成系列配置
6. 生成特殊配置
7. 输出最终图表配置

### 4. 错误处理体系

```typescript
class ChartError extends Error {
    constructor(
        message: string,
        public chartType: ChartType,
        public errorType: 'validation' | 'processing' | 'rendering'
    )
}
```

### 5. 扩展性设计

#### 5.1 新图表类型添加流程
1. 实现新的 Handler 类
2. 在注册表中注册
3. 更新类型定义
4. 添加图表配置

#### 5.2 配置项扩展
- 基础配置在 BaseHandler 中
- 特殊配置在具体 Handler 中

### 6. 国际化支持

支持中英文的错误消息和提示：
```typescript
const messages = {
    validation: {
        cn: '数据验证失败',
        en: 'Data validation failed'
    }
    // ...
}
```

## 开发指南

### 1. 环境设置

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

### 2. 添加新图表类型

1. 在 `src/components/charts/handlers/implementations` 创建新的处理器文件
2. 实现 `ChartTypeHandler` 接口
3. 在 `src/components/charts/handlers/index.ts` 注册新处理器
4. 更新 `src/components/charts/types/chartTypes.ts` 中的类型定义

### 3. 自定义图表配置

1. 继承 `BaseChartHandler`
2. 重写需要自定义的方法
3. 实现特殊配置方法 `getSpecialConfig`

## 项目结构

```
src/
├── components/
│   └── charts/
│       ├── handlers/          # 图表处理器
│       ├── types/            # 类型定义
│       └── controls/         # 图表控制组件
├── utils/
│   └── pipelines/           # 数据处理管道
└── locales/                 # 国际化资源
```

## 注意事项

1. 所有的图表处理器必须实现 `ChartTypeHandler` 接口
2. 确保在添加新图表类型时更新类型定义
3. 保持错误处理的一致性
4. 注意配置的类型安全

## 贡献指南

1. Fork 本仓库
2. 创建特性分支
3. 提交更改
4. 发起 Pull Request

## 许可证

[MIT](LICENSE)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
