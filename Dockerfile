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
# 构建时设置默认环境变量（但可被 Docker 构建参数覆盖）

ENV NEXT_PUBLIC_API_URL=http://54.222.196.102:3000

# 构建应用
RUN pnpm build

# 运行阶段
FROM node:18-alpine AS runner

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://54.222.196.102:3000


# 复制必要的文件
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"] 
# CMD ["sh", "-c", "NODE_ENV=production NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL npm start"]
