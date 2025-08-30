import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/connection'

// 获取合规检查记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const store_id = searchParams.get('store_id')
    const check_type = searchParams.get('check_type')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')

    const offset = (page - 1) * limit

    // 构建查询条件
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (store_id) {
      whereClause += ` AND cc.store_id = $${paramIndex}`
      params.push(parseInt(store_id))
      paramIndex++
    }

    if (check_type) {
      whereClause += ` AND cc.check_type = $${paramIndex}`
      params.push(check_type)
      paramIndex++
    }

    if (date_from) {
      whereClause += ` AND cc.check_date >= $${paramIndex}`
      params.push(date_from)
      paramIndex++
    }

    if (date_to) {
      whereClause += ` AND cc.check_date <= $${paramIndex}`
      params.push(date_to)
      paramIndex++
    }

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM compliance_checks cc
      ${whereClause}
    `
    const countResult = await db.query(countQuery, params)
    const total = parseInt(countResult.rows[0].total)

    // 查询数据
    const dataQuery = `
      SELECT 
        cc.*,
        s.name as store_name,
        u.name as checker_name
      FROM compliance_checks cc
      LEFT JOIN stores s ON cc.store_id = s.id
      LEFT JOIN users u ON cc.checker_id = u.id
      ${whereClause}
      ORDER BY cc.check_date DESC
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
    console.error('获取合规检查记录失败:', error)
    return NextResponse.json(
      { success: false, error: '获取合规检查记录失败' },
      { status: 500 }
    )
  }
}

// 创建合规检查记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      store_id,
      check_type = 'daily',
      dress_code_score,
      attendance_score,
      display_score,
      violations_count = 0,
      recommendations,
      checker_id
    } = body

    // 基础验证
    if (!store_id) {
      return NextResponse.json(
        { success: false, error: '门店ID不能为空' },
        { status: 400 }
      )
    }

    // 计算总体评分
    const scores = [dress_code_score, attendance_score, display_score].filter(s => s !== null && s !== undefined)
    const overall_score = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null

    // 插入检查记录
    const insertQuery = `
      INSERT INTO compliance_checks (
        store_id, check_date, check_type, dress_code_score,
        attendance_score, display_score, overall_score,
        violations_count, recommendations, checker_id, created_at
      ) VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      RETURNING *
    `

    const result = await db.query(insertQuery, [
      store_id,
      check_type,
      dress_code_score || null,
      attendance_score || null,
      display_score || null,
      overall_score,
      violations_count,
      recommendations || null,
      checker_id || null
    ])

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: '合规检查记录创建成功'
    })

  } catch (error) {
    console.error('创建合规检查记录失败:', error)
    return NextResponse.json(
      { success: false, error: '创建合规检查记录失败' },
      { status: 500 }
    )
  }
}

// 获取合规统计数据
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { store_id, date_from, date_to } = body

    // 构建查询条件
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (store_id) {
      whereClause += ` AND store_id = $${paramIndex}`
      params.push(store_id)
      paramIndex++
    }

    if (date_from) {
      whereClause += ` AND check_date >= $${paramIndex}`
      params.push(date_from)
      paramIndex++
    }

    if (date_to) {
      whereClause += ` AND check_date <= $${paramIndex}`
      params.push(date_to)
      paramIndex++
    }

    // 统计查询
    const statsQuery = `
      SELECT 
        COUNT(*) as total_checks,
        AVG(overall_score) as avg_overall_score,
        AVG(dress_code_score) as avg_dress_code_score,
        AVG(attendance_score) as avg_attendance_score,
        AVG(display_score) as avg_display_score,
        SUM(violations_count) as total_violations,
        COUNT(CASE WHEN overall_score >= 90 THEN 1 END) as excellent_count,
        COUNT(CASE WHEN overall_score >= 80 AND overall_score < 90 THEN 1 END) as good_count,
        COUNT(CASE WHEN overall_score >= 70 AND overall_score < 80 THEN 1 END) as fair_count,
        COUNT(CASE WHEN overall_score < 70 THEN 1 END) as poor_count
      FROM compliance_checks
      ${whereClause}
    `

    const statsResult = await db.query(statsQuery, params)
    const stats = statsResult.rows[0]

    // 趋势查询
    const trendQuery = `
      SELECT 
        check_date,
        AVG(overall_score) as daily_score,
        COUNT(*) as checks_count
      FROM compliance_checks
      ${whereClause}
      GROUP BY check_date
      ORDER BY check_date DESC
      LIMIT 30
    `

    const trendResult = await db.query(trendQuery, params)

    return NextResponse.json({
      success: true,
      data: {
        statistics: {
          total_checks: parseInt(stats.total_checks) || 0,
          avg_overall_score: parseFloat(stats.avg_overall_score) || 0,
          avg_dress_code_score: parseFloat(stats.avg_dress_code_score) || 0,
          avg_attendance_score: parseFloat(stats.avg_attendance_score) || 0,
          avg_display_score: parseFloat(stats.avg_display_score) || 0,
          total_violations: parseInt(stats.total_violations) || 0,
          grade_distribution: {
            excellent: parseInt(stats.excellent_count) || 0,
            good: parseInt(stats.good_count) || 0,
            fair: parseInt(stats.fair_count) || 0,
            poor: parseInt(stats.poor_count) || 0
          }
        },
        trend_data: trendResult.rows
      }
    })

  } catch (error) {
    console.error('获取合规统计数据失败:', error)
    return NextResponse.json(
      { success: false, error: '获取合规统计数据失败' },
      { status: 500 }
    )
  }
}
