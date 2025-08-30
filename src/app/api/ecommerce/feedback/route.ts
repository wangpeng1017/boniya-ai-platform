import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/connection'

// 获取客户反馈列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const platform_id = searchParams.get('platform_id')
    const sentiment = searchParams.get('sentiment')
    const status = searchParams.get('status')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')

    const offset = (page - 1) * limit

    // 构建查询条件
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (platform_id) {
      whereClause += ` AND cf.platform_id = $${paramIndex}`
      params.push(parseInt(platform_id))
      paramIndex++
    }

    if (sentiment) {
      whereClause += ` AND cf.sentiment = $${paramIndex}`
      params.push(sentiment)
      paramIndex++
    }

    if (status) {
      whereClause += ` AND cf.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (date_from) {
      whereClause += ` AND cf.created_at >= $${paramIndex}`
      params.push(date_from)
      paramIndex++
    }

    if (date_to) {
      whereClause += ` AND cf.created_at <= $${paramIndex}`
      params.push(date_to)
      paramIndex++
    }

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM customer_feedback cf
      ${whereClause}
    `
    const countResult = await db.query(countQuery, params)
    const total = parseInt(countResult.rows[0].total)

    // 查询数据
    const dataQuery = `
      SELECT 
        cf.*,
        ep.name as platform_name,
        eo.order_id as order_number,
        u.name as handler_name
      FROM customer_feedback cf
      LEFT JOIN ecommerce_platforms ep ON cf.platform_id = ep.id
      LEFT JOIN ecommerce_orders eo ON cf.order_id = eo.id
      LEFT JOIN users u ON cf.handler_id = u.id
      ${whereClause}
      ORDER BY cf.created_at DESC
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
    console.error('获取客户反馈失败:', error)
    return NextResponse.json(
      { success: false, error: '获取客户反馈失败' },
      { status: 500 }
    )
  }
}

// 创建新的客户反馈
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      platform_id,
      order_id,
      feedback_type,
      feedback_content,
      customer_name,
      customer_contact
    } = body

    // 基础验证
    if (!feedback_content) {
      return NextResponse.json(
        { success: false, error: '反馈内容不能为空' },
        { status: 400 }
      )
    }

    // 插入反馈记录
    const insertQuery = `
      INSERT INTO customer_feedback (
        platform_id, order_id, feedback_type, feedback_content,
        status, created_at
      ) VALUES ($1, $2, $3, $4, 'pending', CURRENT_TIMESTAMP)
      RETURNING *
    `

    const result = await db.query(insertQuery, [
      platform_id || null,
      order_id || null,
      feedback_type || 'complaint',
      feedback_content
    ])

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: '反馈提交成功'
    })

  } catch (error) {
    console.error('创建客户反馈失败:', error)
    return NextResponse.json(
      { success: false, error: '创建客户反馈失败' },
      { status: 500 }
    )
  }
}
