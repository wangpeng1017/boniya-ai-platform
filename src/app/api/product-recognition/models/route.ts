import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/connection'

// 获取商品识别模型列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const offset = (page - 1) * limit

    // 构建查询条件
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (status) {
      whereClause += ` AND status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM product_recognition_models
      ${whereClause}
    `
    const countResult = await db.query(countQuery, params)
    const total = parseInt(countResult.rows[0].total)

    // 查询数据
    const dataQuery = `
      SELECT *
      FROM product_recognition_models
      ${whereClause}
      ORDER BY created_at DESC
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
    console.error('获取识别模型失败:', error)
    return NextResponse.json(
      { success: false, error: '获取识别模型失败' },
      { status: 500 }
    )
  }
}

// 创建新的识别模型
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      model_name,
      model_version,
      product_categories,
      accuracy_rate,
      training_data_count,
      model_file_path
    } = body

    // 基础验证
    if (!model_name || !model_version) {
      return NextResponse.json(
        { success: false, error: '模型名称和版本不能为空' },
        { status: 400 }
      )
    }

    // 插入模型记录
    const insertQuery = `
      INSERT INTO product_recognition_models (
        model_name, model_version, product_categories, accuracy_rate,
        training_data_count, model_file_path, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'active', CURRENT_TIMESTAMP)
      RETURNING *
    `

    const result = await db.query(insertQuery, [
      model_name,
      model_version,
      product_categories ? JSON.stringify(product_categories) : null,
      accuracy_rate || null,
      training_data_count || null,
      model_file_path || null
    ])

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: '识别模型创建成功'
    })

  } catch (error) {
    console.error('创建识别模型失败:', error)
    return NextResponse.json(
      { success: false, error: '创建识别模型失败' },
      { status: 500 }
    )
  }
}

// 更新模型状态
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      model_id,
      status,
      accuracy_rate,
      deployed_at
    } = body

    if (!model_id) {
      return NextResponse.json(
        { success: false, error: '模型ID不能为空' },
        { status: 400 }
      )
    }

    // 构建更新字段
    const updateFields = []
    const params = [model_id]
    let paramIndex = 2

    if (status) {
      updateFields.push(`status = $${paramIndex}`)
      params.push(status)
      paramIndex++
    }

    if (accuracy_rate) {
      updateFields.push(`accuracy_rate = $${paramIndex}`)
      params.push(accuracy_rate)
      paramIndex++
    }

    if (deployed_at) {
      updateFields.push(`deployed_at = $${paramIndex}`)
      params.push(deployed_at)
      paramIndex++
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有要更新的字段' },
        { status: 400 }
      )
    }

    const updateQuery = `
      UPDATE product_recognition_models 
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING *
    `

    const result = await db.query(updateQuery, params)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '模型不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: '模型状态更新成功'
    })

  } catch (error) {
    console.error('更新模型状态失败:', error)
    return NextResponse.json(
      { success: false, error: '更新模型状态失败' },
      { status: 500 }
    )
  }
}
