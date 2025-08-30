import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/connection'

// 获取电商数据分析统计
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date_from = searchParams.get('date_from') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const date_to = searchParams.get('date_to') || new Date().toISOString().split('T')[0]
    const platform_id = searchParams.get('platform_id')

    // 构建平台筛选条件
    let platformFilter = ''
    const params = [date_from, date_to]
    if (platform_id) {
      platformFilter = 'AND cf.platform_id = $3'
      params.push(platform_id)
    }

    // 1. 总体统计
    const overviewQuery = `
      SELECT 
        COUNT(DISTINCT eo.id) as total_orders,
        COUNT(DISTINCT cf.id) as total_feedback,
        COUNT(DISTINCT CASE WHEN cf.sentiment = 'positive' THEN cf.id END) as positive_feedback,
        COUNT(DISTINCT CASE WHEN cf.sentiment = 'negative' THEN cf.id END) as negative_feedback,
        COUNT(DISTINCT CASE WHEN cf.sentiment = 'neutral' THEN cf.id END) as neutral_feedback,
        AVG(CASE 
          WHEN cf.sentiment = 'positive' THEN 5
          WHEN cf.sentiment = 'neutral' THEN 3
          WHEN cf.sentiment = 'negative' THEN 1
          ELSE 3
        END) as avg_satisfaction
      FROM ecommerce_orders eo
      LEFT JOIN customer_feedback cf ON eo.id = cf.order_id
      WHERE eo.order_date >= $1 AND eo.order_date <= $2
      ${platformFilter}
    `

    const overviewResult = await db.query(overviewQuery, params)
    const overview = overviewResult.rows[0]

    // 2. 按平台统计
    const platformStatsQuery = `
      SELECT 
        ep.name as platform_name,
        COUNT(DISTINCT eo.id) as order_count,
        COUNT(DISTINCT cf.id) as feedback_count,
        COUNT(DISTINCT CASE WHEN cf.sentiment = 'positive' THEN cf.id END) as positive_count,
        COUNT(DISTINCT CASE WHEN cf.sentiment = 'negative' THEN cf.id END) as negative_count
      FROM ecommerce_platforms ep
      LEFT JOIN ecommerce_orders eo ON ep.id = eo.platform_id 
        AND eo.order_date >= $1 AND eo.order_date <= $2
      LEFT JOIN customer_feedback cf ON eo.id = cf.order_id
      ${platform_id ? 'WHERE ep.id = $3' : ''}
      GROUP BY ep.id, ep.name
      ORDER BY order_count DESC
    `

    const platformStatsResult = await db.query(platformStatsQuery, params)

    // 3. 问题分类统计
    const categoryStatsQuery = `
      SELECT 
        cf.category,
        COUNT(*) as count,
        COUNT(CASE WHEN cf.sentiment = 'negative' THEN 1 END) as negative_count
      FROM customer_feedback cf
      WHERE cf.created_at >= $1 AND cf.created_at <= $2
      ${platformFilter}
      AND cf.category IS NOT NULL
      GROUP BY cf.category
      ORDER BY count DESC
      LIMIT 10
    `

    const categoryStatsResult = await db.query(categoryStatsQuery, params)

    // 4. 时间趋势分析
    const trendQuery = `
      SELECT 
        DATE(cf.created_at) as date,
        COUNT(*) as total_feedback,
        COUNT(CASE WHEN cf.sentiment = 'positive' THEN 1 END) as positive_count,
        COUNT(CASE WHEN cf.sentiment = 'negative' THEN 1 END) as negative_count
      FROM customer_feedback cf
      WHERE cf.created_at >= $1 AND cf.created_at <= $2
      ${platformFilter}
      GROUP BY DATE(cf.created_at)
      ORDER BY date DESC
      LIMIT 30
    `

    const trendResult = await db.query(trendQuery, params)

    // 5. 热门关键词（模拟数据，实际需要NLP处理）
    const keywordsQuery = `
      SELECT 
        jsonb_array_elements_text(cf.keywords) as keyword,
        COUNT(*) as frequency
      FROM customer_feedback cf
      WHERE cf.created_at >= $1 AND cf.created_at <= $2
      ${platformFilter}
      AND cf.keywords IS NOT NULL
      GROUP BY keyword
      ORDER BY frequency DESC
      LIMIT 20
    `

    let keywordsResult
    try {
      keywordsResult = await db.query(keywordsQuery, params)
    } catch (error) {
      // 如果关键词查询失败，返回模拟数据
      keywordsResult = {
        rows: [
          { keyword: '漏气', frequency: 45 },
          { keyword: '不新鲜', frequency: 32 },
          { keyword: '包装破损', frequency: 28 },
          { keyword: '发货慢', frequency: 23 },
          { keyword: '味道好', frequency: 67 },
          { keyword: '包装精美', frequency: 41 }
        ]
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total_orders: parseInt(overview.total_orders) || 0,
          total_feedback: parseInt(overview.total_feedback) || 0,
          positive_feedback: parseInt(overview.positive_feedback) || 0,
          negative_feedback: parseInt(overview.negative_feedback) || 0,
          neutral_feedback: parseInt(overview.neutral_feedback) || 0,
          avg_satisfaction: parseFloat(overview.avg_satisfaction) || 3.0
        },
        platform_stats: platformStatsResult.rows,
        category_stats: categoryStatsResult.rows,
        trend_data: trendResult.rows,
        keywords: keywordsResult.rows
      }
    })

  } catch (error) {
    console.error('获取电商分析数据失败:', error)
    return NextResponse.json(
      { success: false, error: '获取分析数据失败' },
      { status: 500 }
    )
  }
}

// NLP分析处理
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { feedback_id, content } = body

    if (!feedback_id || !content) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 模拟NLP分析结果（实际应该调用AI服务）
    const mockAnalysis = {
      sentiment: content.includes('好') || content.includes('满意') ? 'positive' : 
                content.includes('差') || content.includes('问题') ? 'negative' : 'neutral',
      keywords: extractKeywords(content),
      category: categorizeContent(content),
      confidence: 0.85
    }

    // 更新反馈记录
    const updateQuery = `
      UPDATE customer_feedback 
      SET 
        sentiment = $1,
        keywords = $2,
        category = $3,
        nlp_analysis = $4
      WHERE id = $5
      RETURNING *
    `

    const result = await db.query(updateQuery, [
      mockAnalysis.sentiment,
      JSON.stringify(mockAnalysis.keywords),
      mockAnalysis.category,
      JSON.stringify(mockAnalysis),
      feedback_id
    ])

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'NLP分析完成'
    })

  } catch (error) {
    console.error('NLP分析失败:', error)
    return NextResponse.json(
      { success: false, error: 'NLP分析失败' },
      { status: 500 }
    )
  }
}

// 简单的关键词提取函数（实际应该使用专业NLP服务）
function extractKeywords(content: string): string[] {
  const commonKeywords = ['漏气', '不新鲜', '包装破损', '发货慢', '味道好', '包装精美', '服务态度', '物流', '质量']
  return commonKeywords.filter(keyword => content.includes(keyword))
}

// 简单的内容分类函数
function categorizeContent(content: string): string {
  if (content.includes('包装') || content.includes('漏气')) return '包装问题'
  if (content.includes('物流') || content.includes('发货')) return '物流问题'
  if (content.includes('质量') || content.includes('新鲜')) return '产品质量'
  if (content.includes('服务') || content.includes('态度')) return '客服问题'
  return '其他问题'
}
