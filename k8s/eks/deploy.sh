#!/bin/bash

# 部署 ChatBI 应用到 EKS 集群
# 使用方法: ./deploy.sh [环境] [镜像标签] [镜像仓库]
# 示例: ./deploy.sh production v1.0.0 aliyun

set -e

# 默认值
ENV=${1:-production}
IMAGE_TAG=${2:-latest}
REGISTRY_TYPE=${3:-aliyun}  # 默认使用阿里云镜像仓库

# 根据选择的镜像仓库设置变量
if [ "$REGISTRY_TYPE" = "aliyun" ]; then
    DOCKER_REGISTRY=${DOCKER_REGISTRY:-registry.cn-hangzhou.aliyuncs.com}
    DOCKER_USERNAME=${DOCKER_USERNAME:-$(read -p "请输入阿里云命名空间: " ns && echo $ns)}
elif [ "$REGISTRY_TYPE" = "ghcr" ]; then
    DOCKER_REGISTRY=${DOCKER_REGISTRY:-ghcr.io}
    DOCKER_USERNAME=${DOCKER_USERNAME:-$(git config --get remote.origin.url | sed -n 's/.*github.com[:/]\([^/]*\).*/\1/p')}
else
    DOCKER_REGISTRY=${DOCKER_REGISTRY:-docker.io}
    DOCKER_USERNAME=${DOCKER_USERNAME:-$(read -p "请输入 Docker Hub 用户名: " user && echo $user)}
fi

NAMESPACE=chatbi

# 检查 kubectl 是否已安装
if ! command -v kubectl &> /dev/null; then
    echo "错误: 未找到 kubectl 命令，请先安装 kubectl"
    exit 1
fi

# 检查 AWS CLI 是否已安装
if ! command -v aws &> /dev/null; then
    echo "错误: 未找到 AWS CLI，请先安装 AWS CLI"
    exit 1
fi

# 检查是否已配置 AWS 凭证
if ! aws sts get-caller-identity &> /dev/null; then
    echo "错误: AWS 凭证未配置或无效，请先配置 AWS 凭证"
    exit 1
fi

# 获取 EKS 集群列表
CLUSTERS=$(aws eks list-clusters --output text --query 'clusters')

if [ -z "$CLUSTERS" ]; then
    echo "错误: 未找到 EKS 集群，请先创建 EKS 集群"
    exit 1
fi

# 选择 EKS 集群
echo "可用的 EKS 集群:"
select CLUSTER_NAME in $CLUSTERS; do
    if [ -n "$CLUSTER_NAME" ]; then
        break
    else
        echo "请选择有效的集群"
    fi
done

# 更新 kubeconfig
echo "正在更新 kubeconfig..."
aws eks update-kubeconfig --name $CLUSTER_NAME

# 替换部署文件中的变量
echo "正在准备部署文件..."
mkdir -p .deploy
cp -r k8s/eks/* .deploy/
find .deploy -type f -name "*.yaml" -exec sed -i.bak "s|\${DOCKER_REGISTRY}|$DOCKER_REGISTRY|g; s|\${DOCKER_USERNAME}|$DOCKER_USERNAME|g; s|\${IMAGE_TAG}|$IMAGE_TAG|g; s|\${ENV}|$ENV|g" {} \;
find .deploy -name "*.bak" -delete

# 创建 Docker 仓库密钥
echo "正在创建 Docker 仓库密钥..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# 检查是否需要创建 Docker 仓库密钥
if ! kubectl get secret docker-registry-secret -n $NAMESPACE &> /dev/null; then
    echo "请输入 Docker 仓库凭证:"
    read -p "Docker 用户名 [$DOCKER_USERNAME]: " DOCKER_USER
    DOCKER_USER=${DOCKER_USER:-$DOCKER_USERNAME}
    read -sp "Docker 密码: " DOCKER_PASSWORD
    echo
    read -p "Docker 邮箱: " DOCKER_EMAIL
    
    kubectl create secret docker-registry docker-registry-secret \
        --docker-server=$DOCKER_REGISTRY \
        --docker-username=$DOCKER_USER \
        --docker-password=$DOCKER_PASSWORD \
        --docker-email=$DOCKER_EMAIL \
        -n $NAMESPACE
fi

# 应用 Kubernetes 配置
echo "正在部署应用..."
kubectl apply -k .deploy/

# 等待部署完成
echo "等待部署完成..."
kubectl rollout status deployment/chatbi -n $NAMESPACE

# 获取服务信息
echo "部署完成！服务信息:"
kubectl get svc,ing -n $NAMESPACE

# 清理临时文件
rm -rf .deploy

echo "ChatBI 应用已成功部署到 EKS 集群 $CLUSTER_NAME" 