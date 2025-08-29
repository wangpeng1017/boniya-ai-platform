import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

// 竞品价格分析API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      product_name,
      our_price,
      competitor_name,
      competitor_price,
      location,
      office,
      image_url,
      notes
    } = body

    // 基础验证
    if (!product_name || !our_price || !competitor_name || !competitor_price) {
      return NextResponse.json(
        { success: false, error: '必填字段不能为空' },
        { status: 400 }
      )
    }

    // 计算价格优势
    const price_advantage = our_price < competitor_price
    const price_difference = competitor_price - our_price
    const price_difference_percent = ((price_difference / our_price) * 100).toFixed(2)

    // 保存竞品价格数据
    const result = await sql`
      INSERT INTO competitor_prices (
        product_name, our_price, competitor_name, competitor_price,
        location, office, price_advantage, price_difference,
        price_difference_percent, image_url, notes, created_at
      ) VALUES (
        ${product_name}, ${our_price}, ${competitor_name}, ${competitor_price},
        ${location}, ${office}, ${price_advantage}, ${price_difference},
        ${price_difference_percent}, ${image_url}, ${notes}, CURRENT_TIMESTAMP
      ) RETURNING id
    `

    const recordId = result.rows[0].id

    return NextResponse.json({
      success: true,
      data: {
        id: recordId,
        product_name,
        our_price,
        competitor_name,
        competitor_price,
        price_advantage,
        price_difference,
        price_difference_percent,
        analysis: generatePriceAnalysis({
          our_price,
          competitor_price,
          price_advantage,
          price_difference_percent
        })
      }
    })

  } catch (error) {
    console.error('竞品价格分析失败:', error)
    return NextResponse.json(
      { success: false, error: '竞品价格分析失败' },
      { status: 500 }
    )
  }
}

// 获取竞品价格数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const office = searchParams.get('office')
    const competitor = searchParams.get('competitor')
    const limit = parseInt(searchParams.get('limit') || '20')
    const analysis_type = searchParams.get('analysis_type') || 'list'

    if (analysis_type === 'summary') {
      // 返回汇总分析
      const summaryData = await generateSummaryAnalysis(office || undefined, competitor || undefined)
      return NextResponse.json({
        success: true,
        data: summaryData
      })
    }

    // 构建查询条件
    let whereConditions = []
    let params = []
    let paramIndex = 1

    if (office) {
      whereConditions.push(`office = $${paramIndex}`)
      params.push(office)
      paramIndex++
    }

    if (competitor) {
      whereConditions.push(`competitor_name = $${paramIndex}`)
      params.push(competitor)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : ''

    const query = `
      SELECT * FROM competitor_prices 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex}
    `
    params.push(limit)

    const result = await sql.query(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows
    })

  } catch (error) {
    console.error('获取竞品价格数据失败:', error)
    return NextResponse.json(
      { success: false, error: '获取竞品价格数据失败' },
      { status: 500 }
    )
  }
}

// 生成价格分析
function generatePriceAnalysis(data: any) {
  const { our_price, competitor_price, price_advantage, price_difference_percent } = data
  
  let analysis = {
    status: price_advantage ? 'advantage' : 'disadvantage',
    message: '',
    recommendation: '',
    urgency: 'low'
  }

  const diffPercent = Math.abs(parseFloat(price_difference_percent))

  if (price_advantage) {
    if (diffPercent > 20) {
      analysis.message = `我方价格优势明显，比竞品低${diffPercent}%`
      analysis.recommendation = '可以考虑适当提价，增加利润空间'
      analysis.urgency = 'low'
    } else if (diffPercent > 10) {
      analysis.message = `我方价格有一定优势，比竞品低${diffPercent}%`
      analysis.recommendation = '保持当前价格策略，监控竞品动态'
      analysis.urgency = 'low'
    } else {
      analysis.message = `我方价格略有优势，比竞品低${diffPercent}%`
      analysis.recommendation = '密切关注竞品价格变化，准备应对策略'
      analysis.urgency = 'medium'
    }
  } else {
    if (diffPercent > 20) {
      analysis.message = `我方价格劣势明显，比竞品高${diffPercent}%`
      analysis.recommendation = '建议立即调整价格策略或提升产品价值'
      analysis.urgency = 'high'
    } else if (diffPercent > 10) {
      analysis.message = `我方价格处于劣势，比竞品高${diffPercent}%`
      analysis.recommendation = '考虑降价或通过促销活动提升竞争力'
      analysis.urgency = 'high'
    } else {
      analysis.message = `我方价格略高于竞品${diffPercent}%`
      analysis.recommendation = '可通过服务优势或产品差异化维持价格'
      analysis.urgency = 'medium'
    }
  }

  return analysis
}

// 生成汇总分析
async function generateSummaryAnalysis(office?: string, competitor?: string) {
  try {
    let whereClause = ''
    let params = []
    
    if (office) {
      whereClause = 'WHERE office = $1'
      params.push(office)
    }

    // 总体统计
    const overallStats = await sql.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN price_advantage = true THEN 1 END) as advantage_count,
        COUNT(CASE WHEN price_advantage = false THEN 1 END) as disadvantage_count,
        AVG(price_difference_percent) as avg_price_diff,
        AVG(our_price) as avg_our_price,
        AVG(competitor_price) as avg_competitor_price
      FROM competitor_prices 
      ${whereClause}
    `, params)

    // 按竞品分组统计
    const competitorStats = await sql.query(`
      SELECT 
        competitor_name,
        COUNT(*) as product_count,
        COUNT(CASE WHEN price_advantage = true THEN 1 END) as advantage_count,
        AVG(price_difference_percent) as avg_price_diff
      FROM competitor_prices 
      ${whereClause}
      GROUP BY competitor_name
      ORDER BY product_count DESC
    `, params)

    // 按办事处分组统计
    const officeStats = await sql.query(`
      SELECT 
        office,
        COUNT(*) as product_count,
        COUNT(CASE WHEN price_advantage = true THEN 1 END) as advantage_count,
        AVG(price_difference_percent) as avg_price_diff
      FROM competitor_prices 
      GROUP BY office
      ORDER BY product_count DESC
    `)

    const stats = overallStats.rows[0]
    const advantageRate = ((stats.advantage_count / stats.total_products) * 100).toFixed(1)

    return {
      overview: {
        total_products: parseInt(stats.total_products),
        advantage_count: parseInt(stats.advantage_count),
        disadvantage_count: parseInt(stats.disadvantage_count),
        advantage_rate: parseFloat(advantageRate),
        avg_price_difference: parseFloat(stats.avg_price_diff).toFixed(2),
        avg_our_price: parseFloat(stats.avg_our_price).toFixed(2),
        avg_competitor_price: parseFloat(stats.avg_competitor_price).toFixed(2)
      },
      competitor_analysis: competitorStats.rows,
      office_analysis: officeStats.rows,
      recommendations: generateOverallRecommendations({
        advantage_rate: parseFloat(advantageRate),
        avg_price_diff: parseFloat(stats.avg_price_diff)
      })
    }

  } catch (error) {
    console.error('生成汇总分析失败:', error)
    return null
  }
}

// 生成整体建议
function generateOverallRecommendations(data: any) {
  const { advantage_rate, avg_price_diff } = data
  const recommendations = []

  if (advantage_rate > 70) {
    recommendations.push({
      type: 'pricing',
      priority: 'medium',
      message: '整体价格优势明显，可考虑适当提价增加利润',
      action: '价格策略优化'
    })
  } else if (advantage_rate < 30) {
    recommendations.push({
      type: 'pricing',
      priority: 'high',
      message: '价格竞争力不足，需要制定应对策略',
      action: '紧急价格调整'
    })
  }

  if (Math.abs(avg_price_diff) > 15) {
    recommendations.push({
      type: 'monitoring',
      priority: 'high',
      message: '价格差异较大，建议加强竞品监控频率',
      action: '增强监控'
    })
  }

  recommendations.push({
    type: 'analysis',
    priority: 'low',
    message: '建议定期分析价格趋势，优化定价策略',
    action: '定期分析'
  })

  return recommendations
}
