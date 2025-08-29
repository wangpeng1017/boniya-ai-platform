import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

// 销售预测API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      store_id = 'all',
      product_category = 'all',
      forecast_days = 7,
      confidence_level = 85,
      weather_condition = 'normal',
      is_holiday = false,
      is_promotion = false
    } = body

    // 模拟AI预测算法
    const mockForecastData = generateMockForecast({
      store_id,
      product_category,
      forecast_days,
      confidence_level,
      weather_condition,
      is_holiday,
      is_promotion
    })

    // 保存预测任务记录
    const taskResult = await sql`
      INSERT INTO sales_forecasts (
        store_id, product_category, forecast_days, confidence_level,
        weather_condition, is_holiday, is_promotion, forecast_data,
        accuracy_rate, created_at
      ) VALUES (
        ${store_id}, ${product_category}, ${forecast_days}, ${confidence_level},
        ${weather_condition}, ${is_holiday}, ${is_promotion}, ${JSON.stringify(mockForecastData)},
        ${mockForecastData.accuracy_rate}, CURRENT_TIMESTAMP
      ) RETURNING id
    `

    const taskId = taskResult.rows[0].id

    return NextResponse.json({
      success: true,
      data: {
        task_id: taskId,
        forecast_data: mockForecastData,
        parameters: {
          store_id,
          product_category,
          forecast_days,
          confidence_level,
          weather_condition,
          is_holiday,
          is_promotion
        }
      }
    })

  } catch (error) {
    console.error('销售预测失败:', error)
    return NextResponse.json(
      { success: false, error: '销售预测失败' },
      { status: 500 }
    )
  }
}

// 获取预测历史记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const store_id = searchParams.get('store_id')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = `
      SELECT * FROM sales_forecasts 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `

    if (store_id && store_id !== 'all') {
      query = `
        SELECT * FROM sales_forecasts 
        WHERE store_id = '${store_id}'
        ORDER BY created_at DESC 
        LIMIT ${limit}
      `
    }

    const result = await sql.query(query)

    return NextResponse.json({
      success: true,
      data: result.rows
    })

  } catch (error) {
    console.error('获取预测记录失败:', error)
    return NextResponse.json(
      { success: false, error: '获取预测记录失败' },
      { status: 500 }
    )
  }
}

// 模拟AI预测算法
function generateMockForecast(params: any) {
  const { forecast_days, confidence_level, weather_condition, is_holiday, is_promotion } = params
  
  // 基础销量（模拟历史平均值）
  let baseSales = 1000
  
  // 天气影响因子
  const weatherMultiplier = weather_condition === 'good' ? 1.1 : 
                           weather_condition === 'bad' ? 0.8 : 1.0
  
  // 节假日影响因子
  const holidayMultiplier = is_holiday ? 1.3 : 1.0
  
  // 促销影响因子
  const promotionMultiplier = is_promotion ? 1.5 : 1.0
  
  // 生成预测数据
  const forecastData = []
  for (let i = 1; i <= forecast_days; i++) {
    // 添加随机波动
    const randomFactor = 0.8 + Math.random() * 0.4 // 0.8-1.2之间的随机数
    
    const predictedSales = Math.round(
      baseSales * weatherMultiplier * holidayMultiplier * 
      promotionMultiplier * randomFactor
    )
    
    const date = new Date()
    date.setDate(date.getDate() + i)
    
    forecastData.push({
      date: date.toISOString().split('T')[0],
      predicted_sales: predictedSales,
      confidence: confidence_level + Math.random() * 10 - 5, // 置信度波动
      factors: {
        weather: weather_condition,
        holiday: is_holiday,
        promotion: is_promotion
      }
    })
  }
  
  // 计算总体指标
  const totalPredicted = forecastData.reduce((sum, day) => sum + day.predicted_sales, 0)
  const avgConfidence = forecastData.reduce((sum, day) => sum + day.confidence, 0) / forecast_days
  
  return {
    forecast_data: forecastData,
    summary: {
      total_predicted_sales: totalPredicted,
      avg_daily_sales: Math.round(totalPredicted / forecast_days),
      avg_confidence: Math.round(avgConfidence * 100) / 100,
      forecast_period: `${forecast_days}天`,
      factors_considered: ['历史销量', '天气条件', '节假日', '促销活动']
    },
    accuracy_rate: Math.round((85 + Math.random() * 10) * 100) / 100, // 85-95%之间
    recommendations: generateRecommendations(forecastData)
  }
}

// 生成建议
function generateRecommendations(forecastData: any[]) {
  const recommendations = []
  
  // 分析销量趋势
  const avgSales = forecastData.reduce((sum, day) => sum + day.predicted_sales, 0) / forecastData.length
  const highSalesDays = forecastData.filter(day => day.predicted_sales > avgSales * 1.2)
  const lowSalesDays = forecastData.filter(day => day.predicted_sales < avgSales * 0.8)
  
  if (highSalesDays.length > 0) {
    recommendations.push({
      type: 'inventory',
      priority: 'high',
      message: `预计${highSalesDays.length}天销量较高，建议提前备货`,
      action: '增加库存'
    })
  }
  
  if (lowSalesDays.length > 0) {
    recommendations.push({
      type: 'promotion',
      priority: 'medium',
      message: `预计${lowSalesDays.length}天销量较低，建议开展促销活动`,
      action: '促销推广'
    })
  }
  
  recommendations.push({
    type: 'general',
    priority: 'low',
    message: '建议持续监控实际销量与预测的偏差，优化预测模型',
    action: '模型优化'
  })
  
  return recommendations
}
