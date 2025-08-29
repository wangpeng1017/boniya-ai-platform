import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

// 称重商品自动识别API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      action,
      image_data,
      product_data,
      training_data,
      mop_config
    } = body

    let result

    switch (action) {
      case 'recognize_product':
        result = await recognizeProduct(image_data)
        break
      case 'add_product':
        result = await addProductToDatabase(product_data)
        break
      case 'train_model':
        result = await trainRecognitionModel(training_data)
        break
      case 'sync_mop':
        result = await syncWithMOPSystem(mop_config)
        break
      case 'calibrate_scale':
        result = await calibrateScale(image_data)
        break
      default:
        return NextResponse.json(
          { success: false, error: '不支持的操作类型' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('商品识别操作失败:', error)
    return NextResponse.json(
      { success: false, error: '商品识别操作失败' },
      { status: 500 }
    )
  }
}

// 获取商品识别数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const data_type = searchParams.get('data_type') || 'dashboard'
    const product_id = searchParams.get('product_id')
    const date_range = searchParams.get('date_range') || '7'

    let result

    switch (data_type) {
      case 'dashboard':
        result = await getRecognitionDashboard(date_range)
        break
      case 'products':
        result = await getProductDatabase()
        break
      case 'recognition_history':
        result = await getRecognitionHistory(product_id || undefined, date_range)
        break
      case 'model_performance':
        result = await getModelPerformance()
        break
      case 'mop_integration':
        result = await getMOPIntegrationStatus()
        break
      default:
        result = await getRecognitionDashboard(date_range)
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('获取商品识别数据失败:', error)
    return NextResponse.json(
      { success: false, error: '获取商品识别数据失败' },
      { status: 500 }
    )
  }
}

// 商品识别
async function recognizeProduct(imageData: any) {
  // 模拟AI商品识别
  await new Promise(resolve => setTimeout(resolve, 1500))

  const mockRecognitionResult = {
    recognition_id: `REC_${Date.now()}`,
    timestamp: new Date().toISOString(),
    image_quality: 0.92,
    recognition_results: [
      {
        product_id: 'P001',
        product_name: '新鲜牛肉片',
        category: '生鲜肉类',
        confidence: 0.94,
        price_per_kg: 68.00,
        estimated_weight: 0.45,
        estimated_price: 30.60,
        bounding_box: { x: 120, y: 80, width: 200, height: 150 }
      },
      {
        product_id: 'P002',
        product_name: '有机蔬菜',
        category: '蔬菜',
        confidence: 0.78,
        price_per_kg: 12.00,
        estimated_weight: 0.25,
        estimated_price: 3.00,
        bounding_box: { x: 350, y: 120, width: 180, height: 140 }
      }
    ],
    recommended_action: 'confirm_selection',
    alternative_suggestions: [
      { product_id: 'P003', product_name: '精选牛肉', confidence: 0.85 }
    ]
  }

  // 保存识别记录
  await sql`
    INSERT INTO product_recognitions (
      recognition_id, image_data, recognition_result, 
      primary_product_id, confidence_score, created_at
    ) VALUES (
      ${mockRecognitionResult.recognition_id}, ${JSON.stringify(imageData)},
      ${JSON.stringify(mockRecognitionResult)}, 
      ${mockRecognitionResult.recognition_results[0].product_id},
      ${mockRecognitionResult.recognition_results[0].confidence},
      CURRENT_TIMESTAMP
    )
  `

  return mockRecognitionResult
}

// 添加商品到数据库
async function addProductToDatabase(productData: any) {
  const {
    product_name,
    category,
    price_per_kg,
    product_code,
    description,
    training_images
  } = productData

  const result = await sql`
    INSERT INTO recognition_products (
      product_name, category, price_per_kg, product_code,
      description, training_images, created_at, updated_at
    ) VALUES (
      ${product_name}, ${category}, ${price_per_kg}, ${product_code},
      ${description}, ${JSON.stringify(training_images)}, 
      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) RETURNING id
  `

  const productId = result.rows[0].id

  return {
    product_id: productId,
    product_name,
    category,
    price_per_kg,
    status: 'added',
    training_required: training_images.length < 10,
    next_steps: training_images.length < 10 ? 
      ['上传更多训练图片', '开始模型训练'] : 
      ['开始模型训练', '测试识别效果']
  }
}

// 训练识别模型
async function trainRecognitionModel(trainingData: any) {
  const {
    model_name,
    product_categories,
    training_dataset,
    validation_split,
    epochs
  } = trainingData

  // 模拟模型训练
  const trainingResult = {
    model_id: `REC_MODEL_${Date.now()}`,
    model_name,
    training_status: 'completed',
    training_duration: '3小时45分钟',
    dataset_size: training_dataset.length,
    epochs_completed: epochs,
    final_metrics: {
      accuracy: 0.91,
      top_5_accuracy: 0.97,
      precision: 0.89,
      recall: 0.88,
      f1_score: 0.88
    },
    category_performance: product_categories.map((cat: string) => ({
      category: cat,
      accuracy: Math.random() * 0.15 + 0.80,
      sample_count: Math.floor(Math.random() * 100) + 50
    })),
    model_file_path: `/models/recognition/${model_name}_${Date.now()}.h5`,
    deployment_ready: true,
    estimated_inference_time: '0.3秒'
  }

  // 保存模型信息
  await sql`
    INSERT INTO recognition_models (
      model_id, model_name, product_categories, performance_metrics,
      model_file_path, training_status, created_at
    ) VALUES (
      ${trainingResult.model_id}, ${model_name}, ${JSON.stringify(product_categories)},
      ${JSON.stringify(trainingResult.final_metrics)}, ${trainingResult.model_file_path},
      ${trainingResult.training_status}, CURRENT_TIMESTAMP
    )
  `

  return trainingResult
}

// 与MOP系统同步
async function syncWithMOPSystem(mopConfig: any) {
  const {
    mop_api_url,
    api_key,
    store_id,
    sync_products
  } = mopConfig

  // 模拟MOP系统集成
  const syncResult = {
    sync_id: `SYNC_${Date.now()}`,
    mop_system_version: '3.2.1',
    sync_status: 'completed',
    sync_time: new Date().toISOString(),
    products_synced: sync_products.length,
    successful_syncs: Math.floor(sync_products.length * 0.95),
    failed_syncs: Math.ceil(sync_products.length * 0.05),
    sync_details: sync_products.map((product: any) => ({
      product_id: product.id,
      product_name: product.name,
      mop_sku: `MOP_${product.id}`,
      sync_status: Math.random() > 0.05 ? 'success' : 'failed',
      price_updated: true
    })),
    next_sync_scheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  }

  // 保存同步记录
  await sql`
    INSERT INTO mop_sync_logs (
      sync_id, store_id, products_synced, successful_syncs,
      failed_syncs, sync_details, created_at
    ) VALUES (
      ${syncResult.sync_id}, ${store_id}, ${syncResult.products_synced},
      ${syncResult.successful_syncs}, ${syncResult.failed_syncs},
      ${JSON.stringify(syncResult.sync_details)}, CURRENT_TIMESTAMP
    )
  `

  return syncResult
}

// 校准称重
async function calibrateScale(imageData: any) {
  // 模拟称重校准
  const calibrationResult = {
    calibration_id: `CAL_${Date.now()}`,
    scale_id: imageData.scale_id,
    calibration_time: new Date().toISOString(),
    reference_weight: 1.000, // kg
    measured_weight: 0.998, // kg
    accuracy: 99.8,
    calibration_status: 'success',
    drift_detected: false,
    recommendations: [
      '校准成功，精度良好',
      '建议每周进行一次校准',
      '注意保持称重台清洁'
    ]
  }

  return calibrationResult
}

// 获取识别仪表板
async function getRecognitionDashboard(dateRange: string) {
  const days = parseInt(dateRange)
  
  return {
    overview: {
      total_recognitions: generateRandomNumber(500, 2000),
      recognition_accuracy: generateRandomMetric(88, 95),
      avg_recognition_time: '0.4秒',
      active_products: generateRandomNumber(150, 300),
      mop_sync_status: 'connected'
    },
    daily_metrics: generateDailyRecognitionMetrics(days),
    top_recognized_products: [
      { product: '新鲜牛肉', count: generateRandomNumber(50, 150), accuracy: 0.94 },
      { product: '有机蔬菜', count: generateRandomNumber(40, 120), accuracy: 0.89 },
      { product: '海鲜类', count: generateRandomNumber(30, 100), accuracy: 0.91 },
      { product: '水果类', count: generateRandomNumber(60, 180), accuracy: 0.87 }
    ],
    recognition_accuracy_by_category: [
      { category: '肉类', accuracy: 0.94, sample_count: 245 },
      { category: '蔬菜', accuracy: 0.89, sample_count: 189 },
      { category: '水果', accuracy: 0.87, sample_count: 156 },
      { category: '海鲜', accuracy: 0.91, sample_count: 98 }
    ],
    system_performance: {
      model_load_time: '2.1秒',
      avg_inference_time: '0.4秒',
      memory_usage: '1.2GB',
      cpu_usage: '15%'
    },
    recent_activities: [
      {
        type: '商品识别',
        message: '成功识别新鲜牛肉，置信度94%',
        time: '5分钟前'
      },
      {
        type: 'MOP同步',
        message: '与MOP系统同步完成，更新156个商品',
        time: '1小时前'
      }
    ]
  }
}

// 获取商品数据库
async function getProductDatabase() {
  try {
    const result = await sql`
      SELECT * FROM recognition_products 
      ORDER BY created_at DESC 
      LIMIT 100
    `

    return {
      products: result.rows,
      summary: {
        total_products: result.rows.length,
        categories: [...new Set(result.rows.map(p => p.category))],
        avg_price: result.rows.length > 0 ? 
          result.rows.reduce((sum, p) => sum + p.price_per_kg, 0) / result.rows.length : 0
      }
    }
  } catch (error) {
    return {
      products: [],
      summary: { total_products: 0, categories: [], avg_price: 0 }
    }
  }
}

// 获取识别历史
async function getRecognitionHistory(productId: string | undefined, dateRange: string) {
  try {
    let whereClause = `WHERE created_at >= CURRENT_DATE - INTERVAL '${dateRange} days'`
    if (productId) {
      whereClause += ` AND primary_product_id = '${productId}'`
    }

    const result = await sql.query(`
      SELECT * FROM product_recognitions 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT 100
    `)

    return {
      recognitions: result.rows,
      summary: {
        total_recognitions: result.rows.length,
        avg_confidence: result.rows.length > 0 ? 
          result.rows.reduce((sum, r) => sum + r.confidence_score, 0) / result.rows.length : 0,
        success_rate: result.rows.filter(r => r.confidence_score > 0.8).length / result.rows.length * 100
      }
    }
  } catch (error) {
    return {
      recognitions: [],
      summary: { total_recognitions: 0, avg_confidence: 0, success_rate: 0 }
    }
  }
}

// 获取模型性能
async function getModelPerformance() {
  return {
    active_models: [
      {
        model_id: 'REC_MODEL_001',
        name: '通用商品识别模型',
        accuracy: 0.91,
        categories: ['肉类', '蔬菜', '水果', '海鲜'],
        last_updated: '2024-03-20',
        status: 'active'
      },
      {
        model_id: 'REC_MODEL_002',
        name: '肉类专用识别模型',
        accuracy: 0.94,
        categories: ['牛肉', '猪肉', '羊肉', '鸡肉'],
        last_updated: '2024-03-18',
        status: 'active'
      }
    ],
    performance_trends: {
      accuracy_trend: generateTrendData(30, 85, 95),
      inference_time_trend: generateTrendData(30, 0.3, 0.6),
      error_rate_trend: generateTrendData(30, 2, 8)
    },
    training_history: [
      { date: '2024-03-20', model: '通用商品识别模型', accuracy: 0.91, duration: '3.5小时' },
      { date: '2024-03-18', model: '肉类专用识别模型', accuracy: 0.94, duration: '2.8小时' }
    ]
  }
}

// 获取MOP集成状态
async function getMOPIntegrationStatus() {
  return {
    connection_status: 'connected',
    last_sync: '2024-03-25 14:30:00',
    sync_frequency: '每小时',
    synced_products: 156,
    pending_updates: 3,
    sync_history: [
      { date: '2024-03-25 14:30', status: 'success', products: 156, duration: '45秒' },
      { date: '2024-03-25 13:30', status: 'success', products: 154, duration: '42秒' },
      { date: '2024-03-25 12:30', status: 'partial', products: 152, duration: '38秒' }
    ],
    configuration: {
      api_endpoint: 'https://mop.example.com/api/v1',
      timeout: '30秒',
      retry_attempts: 3,
      batch_size: 50
    }
  }
}

// 辅助函数
function generateRandomMetric(min: number, max: number) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1))
}

function generateRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateDailyRecognitionMetrics(days: number) {
  const metrics = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    metrics.push({
      date: date.toISOString().split('T')[0],
      recognitions: generateRandomNumber(50, 200),
      accuracy: generateRandomMetric(85, 95),
      avg_confidence: generateRandomMetric(80, 95),
      errors: generateRandomNumber(2, 10)
    })
  }
  return metrics
}

function generateTrendData(days: number, min: number, max: number) {
  const data = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      value: generateRandomMetric(min, max)
    })
  }
  return data
}
