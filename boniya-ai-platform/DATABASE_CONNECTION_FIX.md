# 数据库连接错误修复指南

## 🚨 **当前错误分析**

您遇到的错误：
```
VercelPostgresError - 'invalid_connection_string': This connection string is meant to be used with a direct connection. Make sure to use a pooled connection string or try `createClient()` instead.
```

## 🔍 **问题根源**

根据您的`.env.local`文件，问题在于：

1. **缺少池化连接字符串**: 没有`POSTGRES_PRISMA_URL`
2. **连接字符串格式**: 当前使用的是Prisma Accelerate格式，不是标准Vercel Postgres格式
3. **环境变量配置**: 需要正确的Vercel Postgres连接字符串

## 🔧 **解决方案**

### 方案1：使用Vercel Postgres（推荐）

如果您使用的是Vercel Postgres，请按以下步骤配置：

1. **登录Vercel控制台**
2. **进入Storage标签页**
3. **选择您的Postgres数据库**
4. **复制连接字符串**

正确的环境变量配置应该是：

```env
# Vercel Postgres 池化连接（推荐）
POSTGRES_PRISMA_URL="postgres://default:password@ep-xxx-pooler.us-east-1.postgres.vercel-storage.com/verceldb?pgbouncer=true&connect_timeout=15"

# Vercel Postgres 直连（备用）
POSTGRES_URL="postgres://default:password@ep-xxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require"

# 非池化连接（用于迁移）
POSTGRES_URL_NON_POOLING="postgres://default:password@ep-xxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require"
```

### 方案2：使用Prisma Accelerate

如果您想继续使用Prisma Accelerate，请更新环境变量：

```env
# 保留您的Prisma Accelerate连接
PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your_api_key"

# 添加直连字符串（用于备用）
POSTGRES_URL="postgres://b2d829914e2e601463f4a6769bd22abec7c8c8d9533891cb99e99109e4dd40b7:sk_QdB3j9s4hBWzeRznOae7m@db.prisma.io:5432/postgres?sslmode=require"
```

## 📝 **推荐的.env.local配置**

请将您的`.env.local`文件更新为：

```env
# 百度OCR API配置
BAIDU_OCR_API_KEY=b522CG0HalSDWRWrh49p9jKn
BAIDU_OCR_SECRET_KEY=usLhtbqVNjdUGZkGSoc31LUsyJSdiiaw

# Google Gemini AI配置
GEMINI_API_KEY=AIzaSyBtw7WLw0Lf749k0j5yeKJpjz1AfWgDsuA

# 数据库配置 - 选择以下方案之一

# 方案A: Vercel Postgres（推荐）
POSTGRES_PRISMA_URL="postgres://default:your_password@ep-xxx-pooler.us-east-1.postgres.vercel-storage.com/verceldb?pgbouncer=true&connect_timeout=15"
POSTGRES_URL="postgres://default:your_password@ep-xxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require"
POSTGRES_URL_NON_POOLING="postgres://default:your_password@ep-xxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require"

# 方案B: Prisma Accelerate（如果您偏好使用）
# PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your_api_key"
# POSTGRES_URL="postgres://your_user:your_password@db.prisma.io:5432/postgres?sslmode=require"

# 其他配置
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"
```

## 🔄 **代码修复**

我已经更新了数据库连接代码，现在支持：

1. **自动检测连接类型**: 根据连接字符串格式自动选择连接方式
2. **优先级处理**: POSTGRES_PRISMA_URL > PRISMA_DATABASE_URL > POSTGRES_URL
3. **详细日志**: 帮助调试连接问题
4. **错误处理**: 更好的错误信息和处理

## 🚀 **部署步骤**

1. **更新环境变量**: 在Vercel控制台中设置正确的环境变量
2. **重新部署**: 推送代码或手动触发部署
3. **测试连接**: 访问`/api/test`端点验证连接

## 📋 **验证清单**

- [ ] 环境变量格式正确
- [ ] 连接字符串包含正确的主机名和端口
- [ ] 密码和用户名正确
- [ ] 网络连接正常
- [ ] Vercel部署环境变量已设置

## 🆘 **常见问题**

### Q: 如何获取Vercel Postgres连接字符串？
A: 
1. 登录Vercel控制台
2. 进入项目的Storage标签页
3. 选择Postgres数据库
4. 在.env.local标签页中复制连接字符串

### Q: 为什么需要多个连接字符串？
A:
- `POSTGRES_PRISMA_URL`: 池化连接，用于应用查询（推荐）
- `POSTGRES_URL`: 直连，用于备用
- `POSTGRES_URL_NON_POOLING`: 非池化，用于数据库迁移

### Q: 如何测试连接是否正常？
A: 
1. 启动应用：`npm run dev`
2. 访问：`http://localhost:3000/api/test`
3. 检查响应中的数据库连接状态

## 📞 **获取帮助**

如果问题仍然存在，请提供：
1. 完整的错误日志
2. 您的环境变量配置（隐藏敏感信息）
3. 使用的数据库服务类型

---

**注意**: 请确保不要将包含真实密钥的环境变量文件提交到版本控制系统中！
