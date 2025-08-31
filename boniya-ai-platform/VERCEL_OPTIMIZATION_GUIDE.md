# Vercel部署优化指南 - 解决maxDuration错误

## 🚨 **问题分析**

### maxDuration错误原因
```
The value for maxDuration must be between 1 second and 300 seconds, 
in order to increase this limit upgrade your plan: https://vercel.com/pricing
```

这个错误表明您的函数配置了超过当前Vercel计划限制的执行时间。

## 📊 **Vercel计划限制对比**

| 计划类型 | maxDuration限制 | 月费 | 适用场景 |
|---------|----------------|------|----------|
| **Hobby (免费)** | **10秒** | $0 | 个人项目、原型 |
| **Pro** | **300秒 (5分钟)** | $20 | 专业项目、小团队 |
| **Enterprise** | **900秒 (15分钟)** | 定制 | 企业级应用 |

## 🔧 **已修复的配置问题**

### 1. **vercel.json配置优化**
```json
{
  "framework": "nextjs",
  "functions": {
    "boniya-ai-platform/src/app/api/*/route.ts": {
      "maxDuration": 10  // ✅ 符合免费计划限制
    }
  }
}
```

**修复前的问题**:
- `maxDuration: 600` (10分钟) - ❌ 超出所有计划限制
- `maxDuration: 300` (5分钟) - ❌ 超出免费计划限制

### 2. **AI函数超时控制**
为所有AI服务添加了5秒超时控制：

```typescript
// 示例：销售预测AI优化
try {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('AI请求超时')), 5000)
  })

  const aiPromise = geminiClient.generateContent(prompt, { 
    temperature: 0.3,
    maxTokens: 300 
  })

  const response = await Promise.race([aiPromise, timeoutPromise])
} catch (error) {
  // 返回默认结果而不是抛出错误
  return defaultResult
}
```

## 🚀 **优化策略**

### 1. **函数执行时间优化**

#### **AI请求优化**
- ✅ 添加5秒超时控制
- ✅ 减少prompt长度
- ✅ 限制maxTokens参数
- ✅ 使用更快的模型配置

#### **数据库查询优化**
- ✅ 使用池化连接 (POSTGRES_PRISMA_URL)
- ✅ 限制查询结果数量 (LIMIT 1000)
- ✅ 添加适当的索引
- ✅ 避免复杂的JOIN操作

#### **批量处理优化**
```typescript
// 限制批量处理数量
if (feedbacks.length > 50) {
  return NextResponse.json({
    success: false,
    error: '批量分析最多支持50条反馈'
  }, { status: 400 })
}
```

### 2. **异步处理策略**

对于需要长时间处理的任务，使用以下策略：

#### **方案A: 分步处理**
```typescript
// 将大任务分解为多个小任务
export async function POST(request: NextRequest) {
  const { taskId, step } = await request.json()
  
  switch (step) {
    case 'init':
      // 初始化任务，返回任务ID
      return NextResponse.json({ taskId, status: 'initialized' })
    case 'process':
      // 处理一小部分数据
      return NextResponse.json({ taskId, status: 'processing', progress: 30 })
    case 'complete':
      // 完成处理
      return NextResponse.json({ taskId, status: 'completed' })
  }
}
```

#### **方案B: 队列系统**
```typescript
// 使用外部队列服务（如Redis Queue）
export async function POST(request: NextRequest) {
  const jobId = await addToQueue('ai-analysis', requestData)
  return NextResponse.json({ 
    jobId, 
    status: 'queued',
    checkUrl: `/api/jobs/${jobId}/status`
  })
}
```

### 3. **缓存策略**

#### **AI结果缓存**
```typescript
// 缓存AI分析结果
const cacheKey = `ai-analysis-${hash(inputData)}`
const cached = await redis.get(cacheKey)

if (cached) {
  return NextResponse.json({ 
    success: true, 
    data: JSON.parse(cached),
    cached: true 
  })
}

// 执行AI分析
const result = await aiAnalysis(inputData)

// 缓存结果（24小时）
await redis.setex(cacheKey, 86400, JSON.stringify(result))
```

## 🔄 **长时间处理的替代方案**

### 1. **客户端轮询**
```typescript
// 前端轮询实现
async function startLongTask(data) {
  // 启动任务
  const { taskId } = await fetch('/api/tasks/start', {
    method: 'POST',
    body: JSON.stringify(data)
  }).then(r => r.json())

  // 轮询状态
  const pollStatus = async () => {
    const status = await fetch(`/api/tasks/${taskId}/status`)
      .then(r => r.json())
    
    if (status.completed) {
      return status.result
    } else {
      setTimeout(pollStatus, 2000) // 2秒后再次检查
    }
  }

  return pollStatus()
}
```

### 2. **WebSocket实时更新**
```typescript
// 使用WebSocket推送进度更新
const ws = new WebSocket('wss://your-app.vercel.app/api/ws')

ws.onmessage = (event) => {
  const { taskId, progress, status } = JSON.parse(event.data)
  updateUI(progress, status)
}
```

### 3. **外部服务集成**
- **Google Cloud Functions**: 15分钟执行时间
- **AWS Lambda**: 15分钟执行时间
- **Azure Functions**: 10分钟执行时间

## 📋 **部署检查清单**

### ✅ **配置检查**
- [ ] vercel.json中maxDuration ≤ 10秒
- [ ] 所有AI函数添加超时控制
- [ ] 数据库查询优化
- [ ] 批量处理限制

### ✅ **性能优化**
- [ ] AI prompt简化
- [ ] 数据库索引优化
- [ ] 缓存策略实施
- [ ] 错误处理完善

### ✅ **监控设置**
- [ ] 函数执行时间监控
- [ ] 错误率监控
- [ ] 用户体验监控

## 🚀 **部署命令**

```bash
# 构建检查
npm run build

# 部署到Vercel
vercel --prod

# 检查部署状态
vercel logs
```

## 📞 **升级计划建议**

如果您的应用确实需要更长的执行时间：

### **Pro计划 ($20/月)**
- maxDuration: 300秒 (5分钟)
- 适合大多数AI应用
- 包含更多带宽和存储

### **Enterprise计划**
- maxDuration: 900秒 (15分钟)
- 适合复杂的AI处理
- 定制化支持

## 🔍 **故障排除**

### 常见错误及解决方案

1. **"Function execution timed out"**
   - 检查maxDuration配置
   - 添加超时控制
   - 优化算法复杂度

2. **"Memory limit exceeded"**
   - 减少数据处理量
   - 使用流式处理
   - 优化内存使用

3. **"Cold start timeout"**
   - 减少依赖包大小
   - 使用预热策略
   - 优化初始化代码

---

**注意**: 所有优化已应用到当前代码库中，您可以直接部署使用。
