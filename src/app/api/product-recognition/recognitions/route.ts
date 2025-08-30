import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/connection'

// 获取商品识别记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const store_id = searchParams.get('store_id')
    const model_id = searchParams.get('model_id')
    const is_correct = searchParams.get('is_correct')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')

    const offset = (page - 1) * limit

    // 构建查询条件
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (store_id) {
      whereClause += ` AND pr.store_id = $${paramIndex}`
      params.push(parseInt(store_id))
      paramIndex++
    }

    if (model_id) {
      whereClause += ` AND pr.model_id = $${paramIndex}`
      params.push(parseInt(model_id))
      paramIndex++
    }

    if (is_correct !== null && is_correct !== undefined) {
      whereClause += ` AND pr.is_correct = $${paramIndex}`
      params.push(is_correct === 'true')
      paramIndex++
    }

    if (date_from) {
      whereClause += ` AND pr.recognized_at >= $${paramIndex}`
      params.push(date_from)
      paramIndex++
    }

    if (date_to) {
      whereClause += ` AND pr.recognized_at <= $${paramIndex}`
      params.push(date_to)
      paramIndex++
    }

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM product_recognitions pr
      ${whereClause}
    `
    const countResult = await db.query(countQuery, params)
    const total = parseInt(countResult.rows[0].total)

    // 查询数据
    const dataQuery = `
      SELECT 
        pr.*,
        s.name as store_name,
        prm.model_name,
        prm.model_version,
        p.name as actual_product_name,
        p.code as actual_product_code,
        u.name as cashier_name
      FROM product_recognitions pr
      LEFT JOIN stores s ON pr.store_id = s.id
      LEFT JOIN product_recognition_models prm ON pr.model_id = prm.id
      LEFT JOIN products p ON pr.actual_product_id = p.id
      LEFT JOIN users u ON pr.cashier_id = u.id
      ${whereClause}
      ORDER BY pr.recognized_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    
    params.push(limit, offset)
    const dataResult = await db.query(dataQuery, params)

    return NextResponse.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('获取识别记录失败:', error)
    return NextResponse.json(
      { success: false, error: '获取识别记录失败' },
      { status: 500 }
    )
  }
}

// 创建商品识别记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      store_id,
      model_id,
      image_url,
      recognition_results,
      actual_product_id,
      is_correct,
      processing_time_ms,
      cashier_id
    } = body

    // 基础验证
    if (!store_id || !model_id || !image_url) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 插入识别记录
    const insertQuery = `
      INSERT INTO product_recognitions (
        store_id, model_id, image_url, recognition_results,
        actual_product_id, is_correct, processing_time_ms,
        cashier_id, recognized_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      RETURNING *
    `

    const result = await db.query(insertQuery, [
      store_id,
      model_id,
      image_url,
      recognition_results ? JSON.stringify(recognition_results) : null,
      actual_product_id || null,
      is_correct || null,
      processing_time_ms || null,
      cashier_id || null
    ])

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: '识别记录创建成功'
    })

  } catch (error) {
    console.error('创建识别记录失败:', error)
    return NextResponse.json(
      { success: false, error: '创建识别记录失败' },
      { status: 500 }
    )
  }
}

// 获取识别统计数据
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { store_id, model_id, date_from, date_to } = body

    // 构建查询条件
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (store_id) {
      whereClause += ` AND store_id = $${paramIndex}`
      params.push(store_id)
      paramIndex++
    }

    if (model_id) {
      whereClause += ` AND model_id = $${paramIndex}`
      params.push(model_id)
      paramIndex++
    }

    if (date_from) {
      whereClause += ` AND recognized_at >= $${paramIndex}`
      params.push(date_from)
      paramIndex++
    }

    if (date_to) {
      whereClause += ` AND recognized_at <= $${paramIndex}`
      params.push(date_to)
      paramIndex++
    }

    // 统计查询
    const statsQuery = `
      SELECT 
        COUNT(*) as total_recognitions,
        COUNT(CASE WHEN is_correct = true THEN 1 END) as correct_count,
        COUNT(CASE WHEN is_correct = false THEN 1 END) as incorrect_count,
        AVG(processing_time_ms) as avg_processing_time,
        MIN(processing_time_ms) as min_processing_time,
        MAX(processing_time_ms) as max_processing_time
      FROM product_recognitions
      ${whereClause}
    `

    const statsResult = await db.query(statsQuery, params)
    const stats = statsResult.rows[0]

    // 按门店统计
    const storeStatsQuery = `
      SELECT 
        s.name as store_name,
        COUNT(*) as recognition_count,
        COUNT(CASE WHEN pr.is_correct = true THEN 1 END) as correct_count,
        AVG(pr.processing_time_ms) as avg_processing_time
      FROM product_recognitions pr
      LEFT JOIN stores s ON pr.store_id = s.id
      ${whereClause}
      GROUP BY s.id, s.name
      ORDER BY recognition_count DESC
      LIMIT 10
    `

    const storeStatsResult = await db.query(storeStatsQuery, params)

    // 时间趋势
    const trendQuery = `
      SELECT 
        DATE(recognized_at) as date,
        COUNT(*) as total_count,
        COUNT(CASE WHEN is_correct = true THEN 1 END) as correct_count,
        AVG(processing_time_ms) as avg_time
      FROM product_recognitions
      ${whereClause}
      GROUP BY DATE(recognized_at)
      ORDER BY date DESC
      LIMIT 30
    `

    const trendResult = await db.query(trendQuery, params)

    return NextResponse.json({
      success: true,
      data: {
        statistics: {
          total_recognitions: parseInt(stats.total_recognitions) || 0,
          correct_count: parseInt(stats.correct_count) || 0,
          incorrect_count: parseInt(stats.incorrect_count) || 0,
          accuracy_rate: stats.total_recognitions > 0 
            ? ((parseInt(stats.correct_count) || 0) / parseInt(stats.total_recognitions) * 100).toFixed(2)
            : 0,
          avg_processing_time: parseFloat(stats.avg_processing_time) || 0,
          min_processing_time: parseInt(stats.min_processing_time) || 0,
          max_processing_time: parseInt(stats.max_processing_time) || 0
        },
        store_stats: storeStatsResult.rows,
        trend_data: trendResult.rows
      }
    })

  } catch (error) {
    console.error('获取识别统计失败:', error)
    return NextResponse.json(
      { success: false, error: '获取识别统计失败' },
      { status: 500 }
    )
  }
}
