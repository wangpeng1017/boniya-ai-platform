# 京东评论爬虫集成部署指南

## 📋 概述

本文档详细说明如何将JDComment_Spider京东评论爬虫集成到波尼亚AI平台中，实现自动化的商品评论数据采集和分析。

## 🎯 功能特性

### 核心功能
- ✅ 自动爬取京东商品评论数据
- ✅ 支持时间范围限制（最近30天）
- ✅ 实时任务状态监控
- ✅ 自动情感分析和关键词提取
- ✅ 定时任务调度（每天凌晨3点）
- ✅ 完整的错误处理和日志记录

### 数据字段
- 用户ID、评论内容、会员级别
- 点赞数、回复数、评价星级
- 购买时间、手机型号
- 商品颜色、尺寸信息
- 情感分析结果、关键词

## 🏗️ 系统架构

```
波尼亚AI平台
├── Next.js API Routes          # API接口层
│   ├── /api/crawlers/jd-comments    # 爬虫控制API
│   └── /api/crawlers/jd-comments/schedule  # 定时任务API
├── Python爬虫模块             # 数据采集层
│   ├── jd_comment_spider.py    # 核心爬虫逻辑
│   └── crawl_jd_comments.py    # 执行脚本
├── PostgreSQL数据库           # 数据存储层
│   ├── jd_crawl_tasks         # 任务管理表
│   ├── jd_comments            # 评论数据表
│   └── jd_comment_stats       # 统计数据表
└── React监控界面              # 用户界面层
    └── /crawlers/jd-monitor   # 监控面板
```

## 🚀 部署步骤

### 1. 环境准备

#### 1.1 Python环境
```bash
# 安装Python依赖
pip install -r requirements.txt
```

#### 1.2 环境变量配置
在`.env.local`中添加：
```bash
# 定时任务密钥
CRON_SECRET_TOKEN=your-secret-token-here

# 数据库连接（已有）
POSTGRES_URL=your-postgres-url
POSTGRES_PRISMA_URL=your-postgres-prisma-url
POSTGRES_URL_NON_POOLING=your-postgres-non-pooling-url
```

### 2. 数据库初始化

执行数据库迁移脚本：
```sql
-- 在PostgreSQL中执行
\i src/lib/db/schema.sql
```

或者使用Vercel Postgres控制台执行相关的CREATE TABLE语句。

### 3. Vercel部署配置

#### 3.1 vercel.json配置
项目已包含`vercel.json`配置文件，包含：
- Cron任务配置（每天凌晨3点执行）
- 函数超时设置（5-10分钟）
- Python环境配置

#### 3.2 部署到Vercel
```bash
# 部署到Vercel
vercel --prod
```

### 4. 定时任务配置

#### 4.1 Vercel Cron Jobs
Vercel会自动根据`vercel.json`配置创建定时任务。

#### 4.2 手动触发测试
```bash
# 测试定时任务API
curl -X POST https://your-domain.vercel.app/api/crawlers/jd-comments/schedule \
  -H "Authorization: Bearer your-secret-token"
```

## 🔧 使用说明

### 1. 启动爬取任务

#### 1.1 通过API
```bash
curl -X POST https://your-domain.vercel.app/api/crawlers/jd-comments \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "10032280299715",
    "max_pages": 10,
    "days_limit": 30
  }'
```

#### 1.2 通过监控界面
1. 访问 `https://your-domain.vercel.app/crawlers/jd-monitor`
2. 输入商品ID
3. 点击"开始爬取"按钮

### 2. 监控任务状态

#### 2.1 查看任务列表
```bash
curl https://your-domain.vercel.app/api/crawlers/jd-comments
```

#### 2.2 查看特定任务
```bash
curl https://your-domain.vercel.app/api/crawlers/jd-comments?task_id=123
```

### 3. 查看爬取数据

```sql
-- 查看最新评论
SELECT * FROM jd_comments 
WHERE product_id = '10032280299715' 
ORDER BY comment_time DESC 
LIMIT 10;

-- 查看情感分析统计
SELECT sentiment, COUNT(*) as count 
FROM jd_comments 
WHERE product_id = '10032280299715' 
GROUP BY sentiment;
```

## ⚠️ 注意事项

### 1. 合规要求
- ✅ 遵循京东robots.txt协议
- ✅ 控制请求频率（1-3秒间隔）
- ✅ 仅用于数据分析和学习目的
- ✅ 不进行商业用途的数据销售

### 2. 技术限制
- Vercel函数最大执行时间：10分钟
- 建议单次爬取页数不超过20页
- 需要定期更新User-Agent池

### 3. 错误处理
- 网络超时自动重试
- 反爬虫检测时暂停爬取
- 详细的错误日志记录

## 🔍 故障排除

### 1. 常见问题

#### Q: Python脚本执行失败
A: 检查Python环境和依赖安装：
```bash
python3 --version
pip list | grep requests
```

#### Q: 数据库连接失败
A: 验证环境变量配置：
```bash
echo $POSTGRES_URL
```

#### Q: 爬取数据为空
A: 检查商品ID是否正确，网络是否正常

### 2. 日志查看

#### Vercel函数日志
1. 访问Vercel Dashboard
2. 进入项目 → Functions
3. 查看函数执行日志

#### 数据库日志
```sql
-- 查看失败的任务
SELECT * FROM jd_crawl_tasks 
WHERE task_status = 'failed' 
ORDER BY created_at DESC;
```

## 📈 性能优化

### 1. 爬取策略
- 使用增量爬取，只获取新评论
- 合理设置页数限制
- 避开高峰时段（凌晨执行）

### 2. 数据库优化
- 定期清理过期数据
- 优化查询索引
- 使用数据分区

### 3. 监控告警
- 设置任务失败告警
- 监控爬取成功率
- 跟踪数据质量指标

## 🔄 扩展功能

### 1. 多商品支持
修改定时任务配置，添加更多商品ID：
```typescript
const products = [
  { product_id: '10032280299715', max_pages: 10 },
  { product_id: '另一个商品ID', max_pages: 5 },
  // 添加更多商品
]
```

### 2. 价格监控
扩展爬虫功能，添加价格数据采集：
```python
def get_product_price(product_id):
    # 实现价格获取逻辑
    pass
```

### 3. 图片下载
添加评论图片下载功能：
```python
def download_comment_images(comment):
    # 实现图片下载逻辑
    pass
```

## 📞 技术支持

如有问题，请通过以下方式联系：
- 项目Issues: GitHub项目页面
- 技术文档: 查看项目README
- 日志分析: 查看Vercel函数日志

---

**部署完成后，您就可以通过波尼亚AI平台自动化地收集和分析京东商品评论数据了！** 🎉
