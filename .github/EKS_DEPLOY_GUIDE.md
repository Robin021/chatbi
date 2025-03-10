# Amazon EKS 部署指南

本指南详细说明如何设置和使用 GitHub Actions 自动部署 ChatBI 应用到 Amazon EKS 集群。

## 前提条件

1. 已创建 Amazon EKS 集群
2. 已配置 AWS IAM 用户和权限
3. 已构建并推送 Docker 镜像到容器仓库

## 设置 AWS 凭证

1. 在 AWS IAM 控制台创建具有 EKS 管理权限的用户
2. 生成访问密钥（Access Key ID 和 Secret Access Key）
3. 在 GitHub 仓库设置中添加以下 Secrets：
   - `AWS_ACCESS_KEY_ID`: AWS 访问密钥 ID
   - `AWS_SECRET_ACCESS_KEY`: AWS 访问密钥

## 设置容器镜像仓库凭证

本项目支持多种容器镜像仓库，包括 GitHub Container Registry、Docker Hub 和阿里云容器镜像服务。

### GitHub Container Registry

无需额外设置，使用 GitHub Token 自动授权。

### Docker Hub

在 GitHub 仓库设置中添加以下 Secrets：
- `DOCKERHUB_USERNAME`: Docker Hub 用户名
- `DOCKERHUB_TOKEN`: Docker Hub 访问令牌

### 阿里云容器镜像服务

在 GitHub 仓库设置中添加以下 Secrets：
- `ALIYUN_USERNAME`: 阿里云账号用户名
- `ALIYUN_PASSWORD`: 阿里云账号密码
- `ALIYUN_NAMESPACE`: 阿里云容器镜像服务命名空间

## 设置应用环境变量

为了安全地处理敏感信息，需要在 GitHub 仓库设置中添加以下 Secrets：

1. `POCKETBASE_URL`: PocketBase 服务的 URL
2. `ONEAPI_API_BASE_URL`: OneAPI 服务的基础 URL
3. `ONEAPI_API_KEY`: OneAPI 的 API 密钥
4. `ONEAPI_MODEL`: 使用的 LLM 模型名称

添加方法：
1. 在 GitHub 仓库页面，点击 "Settings" 选项卡
2. 在左侧菜单中选择 "Secrets and variables" > "Actions"
3. 点击 "New repository secret"
4. 添加上述 Secrets

## 配置 EKS 部署工作流

在 `.github/workflows/eks-deploy.yml` 文件中，需要修改以下环境变量：

```yaml
env:
  AWS_REGION: ap-northeast-1  # 替换为您的 AWS 区域
  EKS_CLUSTER_NAME: your-eks-cluster  # 替换为您的 EKS 集群名称
  NAMESPACE: chatbi
  # 镜像仓库配置已预设，无需修改
```

## 部署方式

### 自动部署

工作流配置为在以下情况下自动触发：

1. 推送标签（格式为 `v*.*.*`）：自动部署到生产环境，使用阿里云容器镜像服务

### 手动部署

您可以通过 GitHub Actions 界面手动触发部署：

1. 在 GitHub 仓库页面，点击 "Actions" 选项卡
2. 选择 "部署到 Amazon EKS" 工作流
3. 点击 "Run workflow" 按钮
4. 选择部署环境（production、staging 或 development）
5. 选择镜像仓库（aliyun、ghcr 或 dockerhub）
6. 输入镜像标签（例如 `latest` 或 `v1.0.0`）
7. 点击 "Run workflow" 按钮启动部署

### 使用部署脚本

您也可以使用本地部署脚本：

```bash
# 部署到生产环境，使用阿里云容器镜像服务的最新镜像
./k8s/eks/deploy.sh production latest aliyun

# 部署到生产环境，使用 GitHub Container Registry 的特定版本镜像
./k8s/eks/deploy.sh production v1.0.0 ghcr

# 部署到生产环境，使用 Docker Hub 的特定版本镜像
./k8s/eks/deploy.sh production v1.0.0 dockerhub
```

## 敏感信息处理

本项目采用以下方式处理敏感信息：

1. **开发环境**：
   - 使用 `.env.local` 文件存储环境变量（已在 `.gitignore` 中排除）
   - 提供 `.env.example` 作为模板，不包含实际值

2. **生产环境**：
   - 敏感信息存储在 GitHub Secrets 中
   - 部署时自动创建 Kubernetes Secret
   - 应用容器通过环境变量引用这些 Secret

3. **安全最佳实践**：
   - 不在代码库中存储实际的密钥或凭证
   - 使用 base64 编码存储 Kubernetes Secret
   - 定期轮换密钥和凭证

## 部署流程

部署工作流执行以下步骤：

1. 检出代码
2. 设置镜像标签和环境
3. 选择镜像仓库
4. 配置 AWS 凭证
5. 更新 kubeconfig
6. 安装 kubectl 和 kustomize
7. 准备部署文件
8. 创建命名空间
9. 创建 Docker 仓库密钥
10. 创建环境变量 Secret
11. 部署到 EKS
12. 获取服务信息

## 部署后验证

部署完成后，可以通过以下方式验证部署是否成功：

1. 查看 GitHub Actions 运行日志
2. 使用 kubectl 命令检查部署状态：

```bash
# 查看 Pod 状态
kubectl get pods -n chatbi

# 查看服务和入口
kubectl get svc,ing -n chatbi

# 查看部署详情
kubectl describe deployment chatbi -n chatbi
```

## 访问应用

部署成功后，可以通过配置的域名访问应用：

```
https://chatbi.example.com
```

注意：需要将 `chatbi.example.com` 替换为您在 `ingress.yaml` 中配置的实际域名，并确保 DNS 记录已正确设置。

## 故障排除

### 常见问题

1. **AWS 凭证错误**：确保 GitHub Secrets 中的 AWS 凭证正确且有足够权限
2. **EKS 集群连接失败**：检查 EKS 集群名称和区域是否正确
3. **镜像拉取失败**：检查 Docker 仓库密钥是否正确配置
4. **环境变量问题**：检查是否正确设置了所有必要的 GitHub Secrets
5. **镜像仓库访问问题**：确保选择了可访问的镜像仓库（如阿里云容器镜像服务）

### 查看工作流日志

如果部署失败，可以在 GitHub Actions 页面查看详细的错误日志，以帮助诊断问题。

## 回滚部署

如果需要回滚到之前的版本，可以：

1. 手动触发工作流，指定之前的镜像标签
2. 或者使用 kubectl 命令回滚：

```bash
kubectl rollout undo deployment/chatbi -n chatbi
```

## 清理资源

如果需要删除部署的资源，可以：

```bash
kubectl delete -k k8s/eks/
```

或者删除整个命名空间：

```bash
kubectl delete namespace chatbi
``` 