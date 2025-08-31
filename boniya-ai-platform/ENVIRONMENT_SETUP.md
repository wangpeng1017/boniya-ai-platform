# 波尼亚AI平台环境变量配置指南

## 🚀 快速开始

### 1. 复制环境变量模板
```bash
cp .env.example .env.local
```

### 2. 必需的环境变量

#### 📊 数据库配置 (必需)
根据您的错误信息，您需要配置Vercel Postgres数据库连接：

```env
# Vercel Postgres 池化连接字符串 (推荐)
POSTGRES_PRISMA_URL="postgres://username:password@host:port/database?pgbouncer=true&connect_timeout=15"

# Vercel Postgres 直连字符串 (备用)
POSTGRES_URL="postgres://username:password@host:port/database?sslmode=require"
```

**重要说明：**
- 优先使用 `POSTGRES_PRISMA_URL` (池化连接)，这样可以避免您遇到的 `invalid_connection_string` 错误
- 如果只有直连字符串，请确保使用 `POSTGRES_URL`
- 系统会自动选择合适的连接方式

#### 🤖 AI服务配置 (必需)
```env
# Google Gemini AI API密钥
GEMINI_API_KEY="your_gemini_api_key_here"
```

**获取Gemini API密钥：**
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录您的Google账户
3. 创建新的API密钥
4. 复制密钥到环境变量中

### 3. 可选的环境变量

#### 🔐 应用安全配置
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_random_secret_here"
JWT_SECRET="your_jwt_secret_here"
```

#### 📧 通知服务配置
```env
# 邮件服务
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_email_password"

# 短信服务
SMS_ACCESS_KEY_ID="your_sms_access_key_id"
SMS_ACCESS_KEY_SECRET="your_sms_access_key_secret"
```

#### ☁️ 云存储配置
```env
# 阿里云OSS
ALIYUN_ACCESS_KEY_ID="your_access_key_id"
ALIYUN_ACCESS_KEY_SECRET="your_access_key_secret"
ALIYUN_OSS_BUCKET="your_bucket_name"
ALIYUN_OSS_REGION="oss-cn-hangzhou"

# 腾讯云COS
TENCENT_SECRET_ID="your_secret_id"
TENCENT_SECRET_KEY="your_secret_key"
TENCENT_COS_BUCKET="your_bucket_name"
TENCENT_COS_REGION="ap-guangzhou"
```

## 🔧 数据库连接问题解决

### 问题：`invalid_connection_string` 错误
**原因：** 使用了直连字符串而不是池化连接字符串

**解决方案：**
1. **推荐方式：** 使用池化连接字符串
   ```env
   POSTGRES_PRISMA_URL="postgres://username:password@host:port/database?pgbouncer=true&connect_timeout=15"
   ```

2. **备用方式：** 如果只有直连字符串
   ```env
   POSTGRES_URL="postgres://username:password@host:port/database?sslmode=require"
   ```

### Vercel Postgres配置示例
如果您使用Vercel Postgres，连接字符串格式如下：
```env
# 池化连接 (推荐)
POSTGRES_PRISMA_URL="postgres://default:password@ep-xxx-pooler.us-east-1.postgres.vercel-storage.com/verceldb?pgbouncer=true&connect_timeout=15"

# 直连 (备用)
POSTGRES_URL="postgres://default:password@ep-xxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require"
```

## 🚀 启动应用

### 开发环境
```bash
npm run dev
```

### 生产环境
```bash
npm run build
npm start
```

## 📋 环境变量检查清单

### ✅ 必需配置
- [ ] `POSTGRES_PRISMA_URL` 或 `POSTGRES_URL` (数据库连接)
- [ ] `GEMINI_API_KEY` (AI服务)

### 🔧 推荐配置
- [ ] `NEXTAUTH_SECRET` (应用安全)
- [ ] `JWT_SECRET` (JWT加密)

### 📊 功能增强配置
- [ ] 邮件服务配置 (用于通知)
- [ ] 云存储配置 (用于文件上传)
- [ ] 监控配置 (用于错误追踪)

## 🆘 常见问题

### Q: 如何获取数据库连接字符串？
A: 
- **Vercel Postgres**: 在Vercel控制台的Storage标签页中查看
- **其他数据库**: 联系您的数据库提供商

### Q: Gemini API有使用限制吗？
A: 
- 免费层有请求频率限制
- 建议查看 [Google AI Studio配额页面](https://makersuite.google.com/app/apikey)

### Q: 如何测试配置是否正确？
A: 
1. 启动开发服务器：`npm run dev`
2. 访问：`http://localhost:3000`
3. 检查控制台是否有错误信息

## 📞 技术支持

如果您在配置过程中遇到问题，请：
1. 检查环境变量格式是否正确
2. 确认API密钥是否有效
3. 查看应用日志获取详细错误信息

---

**注意：** 请勿将包含真实密钥的 `.env.local` 文件提交到版本控制系统中！
