# 波尼亚AI平台 - 百度OCR集成说明

## 🎯 功能概述

波尼亚AI平台的竞品价格分析模块已成功集成百度OCR API，实现以下核心功能：

### ✅ 已实现功能
1. **图片上传和OCR识别**
   - 支持手机拍照直接上传
   - 支持从相册选择图片
   - 自动调用百度OCR API进行价格识别
   - 实时显示处理状态（上传中、识别中、已完成）

2. **智能信息提取**
   - 自动识别商品名称
   - 自动提取价格信息
   - 识别商品规格（重量、包装等）
   - 记录地理位置信息

3. **OCR结果编辑和校验**
   - 可视化展示识别结果
   - 支持人工编辑和校正
   - 一张图片支持识别多个商品
   - 置信度评估显示

4. **移动端优化**
   - 响应式设计，适配手机屏幕
   - 触摸友好的操作界面
   - 相机直接拍照功能
   - 简化的操作流程

## 🔧 配置说明

### 1. 环境变量配置

在项目根目录的 `.env.local` 文件中配置百度OCR API密钥：

```env
# 百度OCR API配置
BAIDU_OCR_API_KEY=your_api_key_here
BAIDU_OCR_SECRET_KEY=your_secret_key_here
```

### 2. 获取百度OCR API密钥

1. 访问 [百度智能云控制台](https://console.bce.baidu.com/)
2. 创建应用并获取 API Key 和 Secret Key
3. 将密钥配置到环境变量中

## 📱 使用流程

### 销售人员现场使用流程：

1. **访问竞品分析页面**
   - 在手机浏览器中打开波尼亚AI平台
   - 导航到"竞品价格分析"模块

2. **拍照识别**
   - 点击"拍照识别"按钮
   - 对准竞品价格标签拍照
   - 系统自动上传并识别

3. **查看识别结果**
   - 系统显示识别出的商品信息
   - 包括商品名称、规格、价格等

4. **编辑和确认**
   - 点击"编辑"按钮修正识别错误
   - 确认信息无误后点击"保存"

5. **数据入库**
   - 数据自动保存到竞品分析数据库
   - 可在数据报表中查看和分析

## 🔍 技术实现

### API接口

**POST** `/api/competitive-analysis`

**请求格式：** `multipart/form-data`

**参数：**
- `image`: 图片文件
- `location`: 地理位置（可选）
- `office`: 办事处（默认：青岛办事处）

**响应格式：**
```json
{
  "success": true,
  "data": {
    "ocr_result": {
      "words_result": [...],
      "words_result_num": 5
    },
    "extracted_products": [
      {
        "product_name": "波尼亚烤肠五香(160g)",
        "specification": "160g",
        "price": 7.9,
        "confidence": 0.85,
        "raw_text": ["波尼亚", "烤肠", "五香", "160g", "7.9元"]
      }
    ],
    "upload_info": {
      "filename": "image.jpg",
      "size": 1024000,
      "type": "image/jpeg",
      "location": "36.123456, 120.654321",
      "office": "青岛办事处",
      "timestamp": "2025-01-15T10:30:00Z"
    }
  }
}
```

### 核心组件

1. **百度OCR工具类** (`src/utils/baiduOCR.ts`)
   - 访问令牌获取
   - OCR API调用
   - 结果解析和信息提取

2. **竞品分析API** (`src/app/api/competitive-analysis/route.ts`)
   - 图片上传处理
   - OCR服务集成
   - 数据存储逻辑

3. **前端界面** (`src/app/competitive-analysis/page.tsx`)
   - 移动端优化界面
   - 实时状态显示
   - 结果编辑功能

## 📊 数据流程

```
用户拍照 → 图片上传 → 百度OCR识别 → 信息提取 → 人工校验 → 数据入库 → 分析报表
```

## 🚀 部署说明

1. **环境变量配置**
   ```bash
   # 在生产环境中设置
   BAIDU_OCR_API_KEY=实际的API密钥
   BAIDU_OCR_SECRET_KEY=实际的Secret密钥
   ```

2. **依赖安装**
   ```bash
   npm install form-data
   ```

3. **构建和部署**
   ```bash
   npm run build
   npm start
   ```

## 🔒 安全考虑

1. **API密钥保护**
   - 密钥存储在环境变量中
   - 不在客户端暴露敏感信息

2. **文件上传安全**
   - 限制文件类型（仅支持图片）
   - 限制文件大小（最大4MB）
   - 服务端验证

3. **数据传输安全**
   - HTTPS加密传输
   - 图片数据不在服务器长期存储

## 📈 性能优化

1. **图片处理优化**
   - 客户端图片压缩
   - 异步处理机制
   - 错误重试机制

2. **用户体验优化**
   - 实时状态反馈
   - 加载动画显示
   - 离线缓存支持

## 🐛 故障排除

### 常见问题

1. **OCR识别失败**
   - 检查API密钥配置
   - 确认网络连接
   - 验证图片格式和大小

2. **识别准确率低**
   - 确保图片清晰度
   - 避免反光和阴影
   - 保持文字水平

3. **移动端兼容性**
   - 使用现代浏览器
   - 启用相机权限
   - 检查网络状况

### 错误代码

- `400`: 请求参数错误
- `500`: 服务器内部错误
- `OCR_ERROR`: OCR服务调用失败
- `VALIDATION_ERROR`: 文件验证失败

## 📞 技术支持

如需技术支持，请联系开发团队或查看：
- [百度OCR API文档](https://cloud.baidu.com/doc/OCR/s/tk3h7y2aq)
- [Next.js文档](https://nextjs.org/docs)
- 项目GitHub仓库Issues
