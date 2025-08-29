import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

// 获取评论数据API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const product_id = searchParams.get('product_id')
    const sentiment = searchParams.get('sentiment')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 构建查询条件
    const whereConditions = []
    const params = []
    let paramIndex = 1

    if (product_id) {
      whereConditions.push(`product_id = $${paramIndex}`)
      params.push(product_id)
      paramIndex++
    }

    if (sentiment) {
      whereConditions.push(`sentiment = $${paramIndex}`)
      params.push(sentiment)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : ''

    // 获取评论数据
    const commentsQuery = `
      SELECT 
        id, product_id, user_id, comment_content, comment_time,
        star_rating, useful_vote_count, reply_count, user_level_name,
        phone_model, sentiment, keywords, created_at
      FROM jd_comments 
      ${whereClause}
      ORDER BY comment_time DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    
    params.push(limit, offset)
    const comments = await sql.query(commentsQuery, params)

    // 获取统计信息
    const statsQuery = `
      SELECT 
        COUNT(*) as total_comments,
        COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive_comments,
        COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) as negative_comments,
        COUNT(CASE WHEN sentiment = 'neutral' THEN 1 END) as neutral_comments,
        AVG(star_rating) as avg_rating,
        SUM(useful_vote_count) as total_useful_votes
      FROM jd_comments 
      ${whereClause}
    `
    
    const statsParams = params.slice(0, -2) // 移除limit和offset参数
    const stats = await sql.query(statsQuery, statsParams)

    return NextResponse.json({
      success: true,
      data: {
        comments: comments.rows,
        statistics: stats.rows[0],
        pagination: {
          limit,
          offset,
          total: parseInt(stats.rows[0].total_comments)
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('获取评论数据失败:', error)
    return NextResponse.json(
      { success: false, error: '获取评论数据失败' },
      { status: 500 }
    )
  }
}

// 分析评论数据API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, analysis_type = 'sentiment' } = body

    if (!product_id) {
      return NextResponse.json(
        { success: false, error: '商品ID不能为空' },
        { status: 400 }
      )
    }

    switch (analysis_type) {
      case 'sentiment':
        // 情感分析统计
        const sentimentStats = await sql`
          SELECT 
            sentiment,
            COUNT(*) as count,
            AVG(star_rating) as avg_rating,
            AVG(useful_vote_count) as avg_useful_votes
          FROM jd_comments 
          WHERE product_id = ${product_id}
          GROUP BY sentiment
          ORDER BY count DESC
        `

        return NextResponse.json({
          success: true,
          data: {
            type: 'sentiment_analysis',
            product_id,
            results: sentimentStats.rows
          }
        })

      case 'keywords':
        // 关键词分析
        const keywordStats = await sql`
          SELECT 
            keywords,
            COUNT(*) as frequency
          FROM jd_comments 
          WHERE product_id = ${product_id} AND keywords IS NOT NULL
          GROUP BY keywords
          ORDER BY frequency DESC
          LIMIT 20
        `

        // 处理关键词数据
        const keywordMap: Record<string, number> = {}
        keywordStats.rows.forEach(row => {
          if (row.keywords) {
            const keywords: string[] = JSON.parse(row.keywords)
            keywords.forEach((keyword: string) => {
              keywordMap[keyword] = (keywordMap[keyword] || 0) + row.frequency
            })
          }
        })

        const sortedKeywords = Object.entries(keywordMap)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 20)
          .map(([keyword, count]) => ({ keyword, count }))

        return NextResponse.json({
          success: true,
          data: {
            type: 'keyword_analysis',
            product_id,
            results: sortedKeywords
          }
        })

      case 'timeline':
        // 时间线分析
        const timelineStats = await sql`
          SELECT 
            DATE(comment_time) as date,
            COUNT(*) as comment_count,
            AVG(star_rating) as avg_rating,
            COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive_count,
            COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) as negative_count
          FROM jd_comments 
          WHERE product_id = ${product_id}
          GROUP BY DATE(comment_time)
          ORDER BY date DESC
          LIMIT 30
        `

        return NextResponse.json({
          success: true,
          data: {
            type: 'timeline_analysis',
            product_id,
            results: timelineStats.rows
          }
        })

      default:
        return NextResponse.json(
          { success: false, error: '不支持的分析类型' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('评论分析失败:', error)
    return NextResponse.json(
      { success: false, error: '评论分析失败' },
      { status: 500 }
    )
  }
}
