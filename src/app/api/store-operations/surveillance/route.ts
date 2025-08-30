import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/connection'

// 获取监控预警列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const store_id = searchParams.get('store_id')
    const alert_type = searchParams.get('alert_type')
    const status = searchParams.get('status')
    const alert_level = searchParams.get('alert_level')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')

    const offset = (page - 1) * limit

    // 构建查询条件
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (store_id) {
      whereClause += ` AND sa.store_id = $${paramIndex}`
      params.push(parseInt(store_id))
      paramIndex++
    }

    if (alert_type) {
      whereClause += ` AND sa.alert_type = $${paramIndex}`
      params.push(alert_type)
      paramIndex++
    }

    if (status) {
      whereClause += ` AND sa.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (alert_level) {
      whereClause += ` AND sa.alert_level = $${paramIndex}`
      params.push(alert_level)
      paramIndex++
    }

    if (date_from) {
      whereClause += ` AND sa.detected_at >= $${paramIndex}`
      params.push(date_from)
      paramIndex++
    }

    if (date_to) {
      whereClause += ` AND sa.detected_at <= $${paramIndex}`
      params.push(date_to)
      paramIndex++
    }

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM surveillance_alerts sa
      ${whereClause}
    `
    const countResult = await db.query(countQuery, params)
    const total = parseInt(countResult.rows[0].total)

    // 查询数据
    const dataQuery = `
      SELECT 
        sa.*,
        s.name as store_name,
        sc.camera_name,
        sc.camera_location,
        u.name as handler_name
      FROM surveillance_alerts sa
      LEFT JOIN stores s ON sa.store_id = s.id
      LEFT JOIN surveillance_cameras sc ON sa.camera_id = sc.id
      LEFT JOIN users u ON sa.handler_id = u.id
      ${whereClause}
      ORDER BY sa.detected_at DESC
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
    console.error('获取监控预警失败:', error)
    return NextResponse.json(
      { success: false, error: '获取监控预警失败' },
      { status: 500 }
    )
  }
}

// 创建监控预警
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      camera_id,
      store_id,
      alert_type,
      alert_level = 'medium',
      description,
      screenshot_url,
      detection_confidence
    } = body

    // 基础验证
    if (!camera_id || !store_id || !alert_type || !description) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 插入预警记录
    const insertQuery = `
      INSERT INTO surveillance_alerts (
        camera_id, store_id, alert_type, alert_level, description,
        screenshot_url, detection_confidence, status, detected_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', CURRENT_TIMESTAMP)
      RETURNING *
    `

    const result = await db.query(insertQuery, [
      camera_id,
      store_id,
      alert_type,
      alert_level,
      description,
      screenshot_url || null,
      detection_confidence || null
    ])

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: '监控预警创建成功'
    })

  } catch (error) {
    console.error('创建监控预警失败:', error)
    return NextResponse.json(
      { success: false, error: '创建监控预警失败' },
      { status: 500 }
    )
  }
}

// 更新预警状态
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      alert_id,
      status,
      handler_id,
      resolution_notes
    } = body

    if (!alert_id || !status) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 构建更新字段
    const updateFields = ['status = $2', 'updated_at = CURRENT_TIMESTAMP']
    const params = [alert_id, status]
    let paramIndex = 3

    if (handler_id) {
      updateFields.push(`handler_id = $${paramIndex}`)
      params.push(handler_id)
      paramIndex++
    }

    if (status === 'acknowledged') {
      updateFields.push('acknowledged_at = CURRENT_TIMESTAMP')
    }

    if (status === 'resolved') {
      updateFields.push('resolved_at = CURRENT_TIMESTAMP')
    }

    const updateQuery = `
      UPDATE surveillance_alerts 
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING *
    `

    const result = await db.query(updateQuery, params)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '预警记录不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: '预警状态更新成功'
    })

  } catch (error) {
    console.error('更新预警状态失败:', error)
    return NextResponse.json(
      { success: false, error: '更新预警状态失败' },
      { status: 500 }
    )
  }
}
