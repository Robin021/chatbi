# Amazon EKS 部署指南

本指南详细说明如何将 ChatBI 应用部署到 Amazon EKS (Elastic Kubernetes Service) 集群。

## 前提条件

1. 已创建 Amazon EKS 集群
2. 已安装并配置 AWS CLI
3. 已安装 kubectl 命令行工具
4. 已构建并推送 Docker 镜像到容器仓库

## 部署架构

部署架构包括以下组件：

- **Deployment**: 管理应用的 Pod 副本
- **Service**: 提供内部访问应用的方式
- **Ingress**: 配置外部访问应用的路由规则
- **HorizontalPodAutoscaler**: 根据负载自动扩展 Pod 数量
- **ConfigMap**: 存储应用的配置信息
- **Secret**: 存储敏感信息

## 快速部署

使用提供的部署脚本可以快速部署应用：

```bash
# 给脚本添加执行权限
chmod +x k8s/eks/deploy.sh

# 部署到生产环境，使用阿里云容器镜像服务的最新镜像
./k8s/eks/deploy.sh production latest aliyun

# 部署特定版本，使用 GitHub Container Registry
./k8s/eks/deploy.sh production v1.0.0 ghcr

# 部署特定版本，使用 Docker Hub
./k8s/eks/deploy.sh production v1.0.0 dockerhub
```

## 镜像仓库支持

本项目支持从多个容器镜像仓库拉取镜像：

1. **阿里云容器镜像服务**（默认）：适用于中国区域，访问速度更快
2. **GitHub Container Registry**：与 GitHub 集成更好
3. **Docker Hub**：最广泛使用的容器镜像仓库

在部署时，可以通过第三个参数指定要使用的镜像仓库。

## 手动部署

如果需要手动部署，可以按照以下步骤操作：

1. 更新 kubeconfig 以连接到 EKS 集群：

```bash
aws eks update-kubeconfig --name your-cluster-name
```

2. 创建命名空间：

```bash
kubectl apply -f k8s/eks/namespace.yaml
```

3. 创建 Docker 仓库密钥：

```bash
kubectl create secret docker-registry docker-registry-secret \
    --docker-server=registry.cn-hangzhou.aliyuncs.com \
    --docker-username=your-aliyun-username \
    --docker-password=your-aliyun-password \
    --docker-email=your-email \
    -n chatbi
```

4. 应用所有配置：

```bash
kubectl apply -k k8s/eks/
```

## 配置说明

### 部署配置 (deployment.yaml)

- 默认副本数：2
- 资源请求：200m CPU, 256Mi 内存
- 资源限制：500m CPU, 512Mi 内存
- 健康检查：HTTP GET /
- 滚动更新策略：最大不可用 0，最大增加 1

### 服务配置 (service.yaml)

- 类型：ClusterIP
- 端口：80 -> 3000

### 入口配置 (ingress.yaml)

- 使用 AWS ALB Ingress Controller
- 配置 HTTP 到 HTTPS 重定向
- 默认域名：chatbi.example.com（需要替换为实际域名）

### 自动扩展配置 (hpa.yaml)

- 最小副本数：2
- 最大副本数：10
- CPU 目标利用率：70%
- 内存目标利用率：80%

## 自定义配置

### 环境变量

在 `configmap.yaml` 中添加环境变量：

```yaml
data:
  NODE_ENV: "production"
  API_URL: "https://api.example.com"
```

### 敏感信息

在 `secret.yaml` 中添加敏感信息（使用 base64 编码）：

```yaml
data:
  API_KEY: "eW91ci1zZWNyZXQtdmFsdWU="  # echo -n "your-secret-value" | base64
```

## 监控和日志

### 查看 Pod 状态

```bash
kubectl get pods -n chatbi
```

### 查看 Pod 日志

```bash
kubectl logs -f deployment/chatbi -n chatbi
```

### 查看部署状态

```bash
kubectl describe deployment chatbi -n chatbi
```

## 故障排除

### 常见问题

1. **Pod 无法启动**：检查镜像名称和标签是否正确
2. **健康检查失败**：检查应用是否正确监听端口
3. **无法访问应用**：检查 Ingress 配置和 ALB 设置
4. **镜像拉取失败**：检查 Docker 仓库密钥是否正确，或尝试使用阿里云容器镜像服务

### 重启部署

```bash
kubectl rollout restart deployment chatbi -n chatbi
```

### 回滚部署

```bash
kubectl rollout undo deployment chatbi -n chatbi
```

## 清理资源

如需删除所有资源：

```bash
kubectl delete -k k8s/eks/
``` 