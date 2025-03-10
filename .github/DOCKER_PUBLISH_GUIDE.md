# Docker 镜像发布指南

本指南详细说明如何设置和使用 GitHub Actions 自动构建和发布 Docker 镜像。

## 前提条件

1. GitHub 账号
2. Docker Hub 账号
3. 对仓库的管理员权限

## 设置 Docker Hub 访问令牌

1. 登录到 [Docker Hub](https://hub.docker.com/)
2. 点击右上角的用户头像，选择 "Account Settings"
3. 在左侧菜单中选择 "Security"
4. 点击 "New Access Token"
5. 输入令牌名称（例如 "GitHub Actions"）
6. 选择适当的权限（至少需要 "Read & Write" 权限）
7. 点击 "Generate"
8. 复制生成的令牌（这是唯一一次显示完整令牌的机会）

## 在 GitHub 仓库中设置 Secrets

1. 在 GitHub 上打开你的仓库
2. 点击 "Settings" 选项卡
3. 在左侧菜单中选择 "Secrets and variables" > "Actions"
4. 点击 "New repository secret"
5. 添加以下 Secrets：
   - 名称：`DOCKERHUB_USERNAME`，值：你的 Docker Hub 用户名
   - 名称：`DOCKERHUB_TOKEN`，值：之前生成的 Docker Hub 访问令牌

## 依赖项管理

### 已知问题

项目需要 `@ant-design/icons` 包才能成功构建。我们已经通过以下方式解决了这个问题：

1. 在 `package.json` 中添加了 `@ant-design/icons` 依赖
2. 在 Dockerfile 中添加了额外的安装步骤
3. 在 GitHub Actions 工作流中添加了依赖检查

如果您遇到类似的依赖问题，可以：

1. 确保所有必要的依赖都在 `package.json` 中列出
2. 检查 TypeScript 类型声明是否完整
3. 如果需要，在 Dockerfile 中添加额外的安装步骤

## 发布流程

### 自动发布

工作流配置为在以下情况下自动触发：

1. 推送到 `main` 分支
2. 推送标签（格式为 `v*.*.*`）
3. 创建针对 `main` 分支的 Pull Request

### 手动发布版本

要手动发布一个新版本：

```bash
# 确保你在最新的代码上
git pull origin main

# 创建一个新标签
git tag v1.0.0  # 使用适当的版本号

# 推送标签到 GitHub
git push origin v1.0.0
```

推送标签后，GitHub Actions 将自动构建并发布 Docker 镜像。

## 镜像标签策略

工作流使用 [docker/metadata-action](https://github.com/docker/metadata-action) 生成标签，策略如下：

- 分支推送：`{分支名称}`
- PR：`pr-{PR编号}`
- 标签推送：
  - 完整版本：`{版本号}` (例如 `1.0.0`)
  - 主要和次要版本：`{主要}.{次要}` (例如 `1.0`)
  - 主要版本：`{主要}` (例如 `1`)
- 最新提交：`sha-{短SHA}`

此外，如果推送的是标签或 `main` 分支，镜像还会被标记为 `latest`。

## 使用发布的镜像

### 从 Docker Hub 拉取

```bash
docker pull {你的Docker用户名}/chatbi:latest
# 或指定版本
docker pull {你的Docker用户名}/chatbi:1.0.0
```

### 从 GitHub Container Registry 拉取

```bash
docker pull ghcr.io/{你的GitHub用户名}/chatbi:latest
# 或指定版本
docker pull ghcr.io/{你的GitHub用户名}/chatbi:1.0.0
```

### 运行容器

```bash
docker run -p 3000:3000 {你的Docker用户名}/chatbi:latest
```

## 故障排除

如果工作流失败，请检查以下几点：

1. Secrets 是否正确设置
2. Docker Hub 访问令牌是否有效且具有足够权限
3. Dockerfile 是否位于仓库根目录
4. 构建过程中是否有错误
5. 依赖项是否完整，特别是 `@ant-design/icons` 是否已安装

可以在 GitHub 仓库的 "Actions" 选项卡中查看工作流运行日志，以获取更详细的错误信息。 