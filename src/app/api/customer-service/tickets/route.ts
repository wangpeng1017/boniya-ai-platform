import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/connection'

// 获取客服工单列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const channel = searchParams.get('channel')
    const assigned_to = searchParams.get('assigned_to')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')

    const offset = (page - 1) * limit

    // 构建查询条件
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (status) {
      whereClause += ` AND st.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (priority) {
      whereClause += ` AND st.priority = $${paramIndex}`
      params.push(priority)
      paramIndex++
    }

    if (channel) {
      whereClause += ` AND st.channel = $${paramIndex}`
      params.push(channel)
      paramIndex++
    }

    if (assigned_to) {
      whereClause += ` AND st.assigned_to = $${paramIndex}`
      params.push(parseInt(assigned_to))
      paramIndex++
    }

    if (date_from) {
      whereClause += ` AND st.created_at >= $${paramIndex}`
      params.push(date_from)
      paramIndex++
    }

    if (date_to) {
      whereClause += ` AND st.created_at <= $${paramIndex}`
      params.push(date_to)
      paramIndex++
    }

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM service_tickets st
      ${whereClause}
    `
    const countResult = await db.query(countQuery, params)
    const total = parseInt(countResult.rows[0].total)

    // 查询数据
    const dataQuery = `
      SELECT 
        st.*,
        u.name as assignee_name
      FROM service_tickets st
      LEFT JOIN users u ON st.assigned_to = u.id
      ${whereClause}
      ORDER BY st.created_at DESC
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
    console.error('获取客服工单失败:', error)
    return NextResponse.json(
      { success: false, error: '获取客服工单失败' },
      { status: 500 }
    )
  }
}

// 创建新的客服工单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customer_name,
      customer_contact,
      channel,
      issue_type,
      issue_description,
      priority = 'medium',
      audio_file_url
    } = body

    // 基础验证
    if (!issue_description) {
      return NextResponse.json(
        { success: false, error: '问题描述不能为空' },
        { status: 400 }
      )
    }

    // 生成工单号
    const ticket_number = `TK${Date.now()}`

    // 插入工单记录
    const insertQuery = `
      INSERT INTO service_tickets (
        ticket_number, customer_name, customer_contact, channel,
        issue_type, issue_description, priority, audio_file_url,
        status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `

    const result = await db.query(insertQuery, [
      ticket_number,
      customer_name || null,
      customer_contact || null,
      channel || 'online',
      issue_type || '一般咨询',
      issue_description,
      priority,
      audio_file_url || null
    ])

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: '工单创建成功'
    })

  } catch (error) {
    console.error('创建客服工单失败:', error)
    return NextResponse.json(
      { success: false, error: '创建客服工单失败' },
      { status: 500 }
    )
  }
}

// 更新工单状态
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      ticket_id,
      status,
      assigned_to,
      resolution,
      nlp_analysis
    } = body

    if (!ticket_id) {
      return NextResponse.json(
        { success: false, error: '工单ID不能为空' },
        { status: 400 }
      )
    }

    // 构建更新字段
    const updateFields = []
    const params = []
    let paramIndex = 1

    if (status) {
      updateFields.push(`status = $${paramIndex}`)
      params.push(status)
      paramIndex++
    }

    if (assigned_to) {
      updateFields.push(`assigned_to = $${paramIndex}`)
      params.push(assigned_to)
      paramIndex++
    }

    if (resolution) {
      updateFields.push(`resolution = $${paramIndex}`)
      params.push(resolution)
      paramIndex++
    }

    if (nlp_analysis) {
      updateFields.push(`nlp_analysis = $${paramIndex}`)
      params.push(JSON.stringify(nlp_analysis))
      paramIndex++
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`)

    if (status === 'resolved' || status === 'closed') {
      updateFields.push(`resolved_at = CURRENT_TIMESTAMP`)
    }

    const updateQuery = `
      UPDATE service_tickets 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `
    
    params.push(ticket_id)
    const result = await db.query(updateQuery, params)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '工单不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: '工单更新成功'
    })

  } catch (error) {
    console.error('更新客服工单失败:', error)
    return NextResponse.json(
      { success: false, error: '更新客服工单失败' },
      { status: 500 }
    )
  }
}
