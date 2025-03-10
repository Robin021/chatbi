# GitHub Actions 工作流说明

## Docker 镜像发布工作流

此工作流程用于自动构建和发布 Docker 镜像到 GitHub Container Registry (GHCR) 和 Docker Hub。

### 触发条件

工作流在以下情况下触发：

- 推送到 `main` 分支
- 推送标签（格式为 `v*.*.*`，例如 `v1.0.0`）
- 创建针对 `main` 分支的 Pull Request

### 发布目标

镜像将发布到两个位置：

1. **GitHub Container Registry**: `ghcr.io/{github用户名}/chatbi`
2. **Docker Hub**: `{dockerhub用户名}/chatbi`

### 所需的 Secrets

在使用此工作流之前，需要在 GitHub 仓库设置中添加以下 Secrets：

- `DOCKERHUB_USERNAME`: Docker Hub 用户名
- `DOCKERHUB_TOKEN`: Docker Hub 访问令牌（不是密码）

### 标签策略

工作流使用以下标签策略：

- 对于分支推送：使用分支名称作为标签
- 对于 PR：使用 PR 编号作为标签
- 对于标签推送：
  - 完整版本号（例如 `v1.2.3`）
  - 主要和次要版本号（例如 `1.2`）
  - 主要版本号（例如 `1`）
- 短 SHA 哈希值

### 使用方法

#### 发布新版本

要发布新版本，只需创建并推送一个新标签：

```bash
git tag v1.0.0
git push origin v1.0.0
```

#### 从 Docker Hub 拉取镜像

```bash
docker pull {dockerhub用户名}/chatbi:latest
# 或指定版本
docker pull {dockerhub用户名}/chatbi:1.0.0
```

#### 从 GitHub Container Registry 拉取镜像

```bash
docker pull ghcr.io/{github用户名}/chatbi:latest
# 或指定版本
docker pull ghcr.io/{github用户名}/chatbi:1.0.0
```

### 注意事项

- 确保 Dockerfile 位于仓库根目录
- 确保 Docker Hub 访问令牌具有足够的权限
- GitHub Container Registry 使用 GitHub 令牌自动授权，无需额外设置 