# 安全最佳实践指南

本文档提供了在公开项目中处理敏感信息的最佳实践。

## 敏感信息类型

在 ChatBI 项目中，以下类型的信息被视为敏感信息：

1. **API 密钥和令牌**：如 OneAPI 密钥
2. **服务 URL**：如 PocketBase 服务 URL
3. **数据库凭证**：用户名、密码、连接字符串
4. **环境配置**：特定于环境的配置信息
5. **AWS 凭证**：访问密钥和密钥 ID

## 开发环境安全实践

### 环境变量管理

1. **使用 .env.local 文件**：
   - 所有敏感信息应存储在 `.env.local` 文件中
   - 确保 `.env.local` 已添加到 `.gitignore`

2. **提供示例文件**：
   - 创建 `.env.example` 文件作为模板
   - 仅包含变量名和示例值，不包含实际敏感信息

### 代码审查

1. **提交前检查**：
   - 使用 `git diff` 检查是否意外包含敏感信息
   - 考虑使用预提交钩子自动检查敏感信息

2. **避免硬编码**：
   - 不要在代码中硬编码任何敏感信息
   - 始终使用环境变量或配置文件

## 生产环境安全实践

### Kubernetes Secrets

1. **创建和使用 Secrets**：
   - 敏感信息应存储在 Kubernetes Secrets 中
   - 使用 base64 编码（注意：这不是加密，只是编码）
   - 考虑使用 Sealed Secrets 或 Vault 进行加密

2. **引用 Secrets**：
   - 在 Deployment 中使用 `envFrom` 或 `env.valueFrom.secretKeyRef`
   - 避免在日志中打印敏感信息

### GitHub Actions Secrets

1. **存储敏感信息**：
   - 使用 GitHub Secrets 存储所有敏感信息
   - 不要在工作流文件中硬编码敏感信息

2. **安全使用**：
   - 避免在日志中打印 Secrets
   - 使用 `${{ secrets.SECRET_NAME }}` 语法引用

## 密钥轮换和管理

1. **定期轮换**：
   - 定期更改所有密钥和凭证
   - 实施自动轮换机制（如果可能）

2. **访问控制**：
   - 限制对敏感信息的访问
   - 遵循最小权限原则

## 安全审计

1. **定期审查**：
   - 定期审查代码库中的敏感信息
   - 使用工具如 GitGuardian 或 TruffleHog

2. **漏洞扫描**：
   - 定期扫描依赖项中的漏洞
   - 使用 GitHub 依赖项扫描或类似工具

## 意外泄露处理

如果敏感信息被意外提交到代码库：

1. **立即轮换**：
   - 立即更改泄露的密钥或凭证
   - 撤销已泄露的访问令牌

2. **清理历史**：
   - 使用 BFG Repo-Cleaner 或 git-filter-branch 从 Git 历史中删除敏感信息
   - 强制推送更改（注意：这会改变 Git 历史）

3. **通知相关方**：
   - 通知安全团队
   - 如果适用，通知受影响的用户或客户

## 其他资源

- [GitHub 安全最佳实践](https://docs.github.com/en/code-security/getting-started/github-security-best-practices)
- [Kubernetes Secrets 文档](https://kubernetes.io/docs/concepts/configuration/secret/)
- [OWASP 安全备忘单](https://cheatsheetseries.owasp.org/) 