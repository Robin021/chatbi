# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装依赖
RUN npm install -g pnpm && pnpm install

# 复制源代码
COPY . .

# 安装缺失的依赖
RUN pnpm add @ant-design/icons

# 构建应用（只使用默认 API 但不硬编码）
RUN NEXT_PUBLIC_API_URL=https://default-url.com \
    ONEAPI_API_BASE_URL=https://default-oneapi.com \
    ONEAPI_MODEL=qwen-turbo \
    pnpm build

# 构建应用
RUN pnpm build

# 运行阶段
FROM node:18-alpine AS runner

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production

# 复制必要的文件
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 暴露端口
EXPOSE 3000

# 启动应用
# CMD ["npm", "start"] 
CMD ["sh", "-c", "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL ONEAPI_API_BASE_URL=$ONEAPI_API_BASE_URL ONEAPI_API_KEY=$ONEAPI_API_KEY ONEAPI_MODEL=$ONEAPI_MODEL pnpm start"]