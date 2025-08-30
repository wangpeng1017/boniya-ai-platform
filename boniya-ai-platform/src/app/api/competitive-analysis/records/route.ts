import { NextRequest, NextResponse } from 'next/server'
import { executeSafeQuery } from '@/lib/db/connection'

// 获取竞品数据记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const region = searchParams.get('region') || 'all'
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    const offset = (page - 1) * limit

    // 构建查询条件
    let whereConditions = []
    let queryParams = []
    let paramIndex = 1

    if (region && region !== 'all') {
      whereConditions.push(`region = $${paramIndex}`)
      queryParams.push(region)
      paramIndex++
    }

    if (startDate) {
      whereConditions.push(`submitted_at >= $${paramIndex}`)
      queryParams.push(startDate)
      paramIndex++
    }

    if (endDate) {
      whereConditions.push(`submitted_at <= $${paramIndex}`)
      queryParams.push(endDate + ' 23:59:59')
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // 获取总记录数
    const countQuery = `SELECT COUNT(*) as total FROM competitor_records ${whereClause}`
    const countResult = await executeSafeQuery`SELECT COUNT(*) as total FROM competitor_records`

    // 获取分页数据
    const dataQuery = `
      SELECT 
        id,
        product_name,
        specification,
        price,
        competitor_name,
        location,
        region,
        image_url,
        image_thumbnail,
        submitted_by,
        submitted_at,
        source_type,
        confidence_score
      FROM competitor_records 
      ${whereClause}
      ORDER BY submitted_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    // 模拟数据（实际应该从数据库获取）
    const mockRecords = [
      {
        id: 1,
        product_name: '蒜味烤肠',
        specification: '160g',
        price: 7.9,
        competitor_name: '喜旺',
        location: '青岛市城阳区正阳路家乐福',
        region: '城阳区',
        image_url: '/images/competitor-1.jpg',
        image_thumbnail: '/images/competitor-1-thumb.jpg',
        submitted_by: '张三',
        submitted_at: '2025-01-15T10:30:00Z',
        source_type: 'ocr',
        confidence_score: 0.85
      },
      {
        id: 2,
        product_name: '德国黑森林火腿',
        specification: '200g',
        price: 29.9,
        competitor_name: '喜旺',
        location: '青岛市市南区香港中路万象城',
        region: '市南区',
        image_url: '/images/competitor-2.jpg',
        image_thumbnail: '/images/competitor-2-thumb.jpg',
        submitted_by: '李四',
        submitted_at: '2025-01-15T14:20:00Z',
        source_type: 'manual',
        confidence_score: null
      },
      {
        id: 3,
        product_name: '猪头肉',
        specification: '200g',
        price: 15.9,
        competitor_name: '双汇',
        location: '青岛市即墨区蓝村镇大润发',
        region: '即墨区',
        image_url: '/images/competitor-3.jpg',
        image_thumbnail: '/images/competitor-3-thumb.jpg',
        submitted_by: '王五',
        submitted_at: '2025-01-14T16:45:00Z',
        source_type: 'ocr',
        confidence_score: 0.92
      },
      {
        id: 4,
        product_name: '法国皇家火腿',
        specification: '200g',
        price: 26.9,
        competitor_name: '喜旺',
        location: '青岛市胶州市胶州湾大道利群',
        region: '胶州市',
        image_url: '/images/competitor-4.jpg',
        image_thumbnail: '/images/competitor-4-thumb.jpg',
        submitted_by: '赵六',
        submitted_at: '2025-01-14T09:15:00Z',
        source_type: 'ocr',
        confidence_score: 0.78
      },
      {
        id: 5,
        product_name: '五香烤肠',
        specification: '160g',
        price: 8.5,
        competitor_name: '双汇',
        location: '青岛市平度市人民路华润万家',
        region: '平度市',
        image_url: '/images/competitor-5.jpg',
        image_thumbnail: '/images/competitor-5-thumb.jpg',
        submitted_by: '孙七',
        submitted_at: '2025-01-13T11:30:00Z',
        source_type: 'manual',
        confidence_score: null
      }
    ]

    // 应用筛选条件
    let filteredRecords = mockRecords

    if (region && region !== 'all') {
      filteredRecords = filteredRecords.filter(record => record.region === region)
    }

    if (startDate) {
      filteredRecords = filteredRecords.filter(record => 
        new Date(record.submitted_at) >= new Date(startDate)
      )
    }

    if (endDate) {
      filteredRecords = filteredRecords.filter(record => 
        new Date(record.submitted_at) <= new Date(endDate + ' 23:59:59')
      )
    }

    // 分页
    const total = filteredRecords.length
    const paginatedRecords = filteredRecords.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        records: paginatedRecords,
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('获取竞品数据记录失败:', error)
    return NextResponse.json({
      success: false,
      error: '获取竞品数据记录失败'
    }, { status: 500 })
  }
}
