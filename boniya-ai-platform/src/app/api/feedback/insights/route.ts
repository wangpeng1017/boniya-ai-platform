import { NextRequest, NextResponse } from 'next/server'
import { ecommerceFeedbackAI, FeedbackAnalysis } from '@/lib/ai/ecommerce-feedback-ai'
import { executeSafeQuery } from '@/lib/db/connection'

// 生成反馈洞察报告API
export async function POST(request: NextRequest) {
  try {
    const { 
      platform, 
      startDate, 
      endDate, 
      sentimentFilter,
      urgencyFilter 
    } = await request.json()

    // 构建查询条件
    let whereConditions = []
    let queryParams = []
    let paramIndex = 1

    if (platform && platform !== 'all') {
      whereConditions.push(`platform = $${paramIndex}`)
      queryParams.push(platform)
      paramIndex++
    }

    if (startDate) {
      whereConditions.push(`comment_time >= $${paramIndex}`)
      queryParams.push(startDate)
      paramIndex++
    }

    if (endDate) {
      whereConditions.push(`comment_time <= $${paramIndex}`)
      queryParams.push(endDate + ' 23:59:59')
      paramIndex++
    }

    if (sentimentFilter && sentimentFilter !== 'all') {
      whereConditions.push(`sentiment = $${paramIndex}`)
      queryParams.push(sentimentFilter)
      paramIndex++
    }

    if (urgencyFilter && urgencyFilter !== 'all') {
      whereConditions.push(`urgency = $${paramIndex}`)
      queryParams.push(urgencyFilter)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''

    // 获取反馈分析数据
    const dataQuery = `
      SELECT 
        sentiment,
        issues,
        urgency,
        summary,
        confidence_score,
        analysis_notes
      FROM customer_feedback 
      ${whereClause}
      ORDER BY comment_time DESC
      LIMIT 1000
    `

    const dataResult = await executeSafeQuery`${dataQuery}`

    if (dataResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: '没有找到符合条件的反馈数据'
      }, { status: 404 })
    }

    // 准备分析数据
    const analysisData: FeedbackAnalysis[] = dataResult.rows.map(row => ({
      sentiment: row.sentiment as '正面' | '中性' | '负面',
      issues: JSON.parse(row.issues || '[]'),
      urgency: row.urgency as '高' | '中' | '低',
      summary: row.summary,
      confidence: row.confidence_score || 0.5,
      analysis_notes: row.analysis_notes
    }))

    // 调用AI生成洞察报告
    const insights = await ecommerceFeedbackAI.generateFeedbackInsights(analysisData)

    // 保存洞察报告到数据库
    try {
      const insertQuery = `
        INSERT INTO feedback_insights_reports (
          filter_conditions,
          data_points_count,
          insights_data,
          confidence_level
        ) VALUES ($1, $2, $3, $4)
        RETURNING id, created_at
      `
      
      const filterConditions = {
        platform,
        startDate,
        endDate,
        sentimentFilter,
        urgencyFilter
      }

      const result = await executeSafeQuery`
        INSERT INTO feedback_insights_reports (
          filter_conditions,
          data_points_count,
          insights_data,
          confidence_level
        ) VALUES (${JSON.stringify(filterConditions)}, ${analysisData.length}, ${JSON.stringify(insights)}, ${insights.confidence_level})
        RETURNING id, created_at
      `

      return NextResponse.json({
        success: true,
        data: {
          insights_id: result.rows[0].id,
          created_at: result.rows[0].created_at,
          insights: insights,
          filter_conditions: filterConditions
        }
      })

    } catch (dbError) {
      console.error('Insights save error:', dbError)
      // 即使保存失败，也返回洞察结果
      return NextResponse.json({
        success: true,
        data: {
          insights: insights,
          filter_conditions: { platform, startDate, endDate, sentimentFilter, urgencyFilter },
          warning: '洞察生成成功，但保存到数据库失败'
        }
      })
    }

  } catch (error) {
    console.error('Feedback insights API error:', error)
    return NextResponse.json({
      success: false,
      error: '洞察生成失败，请稍后重试'
    }, { status: 500 })
  }
}

// 获取历史洞察报告API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const query = `
      SELECT 
        id,
        filter_conditions,
        data_points_count,
        insights_data,
        confidence_level,
        created_at
      FROM feedback_insights_reports
      ORDER BY created_at DESC 
      LIMIT $1
    `

    const result = await executeSafeQuery`
      SELECT
        id,
        filter_conditions,
        data_points_count,
        insights_data,
        confidence_level,
        created_at
      FROM feedback_insights_reports
      ORDER BY created_at DESC
      LIMIT ${limit}
    `

    return NextResponse.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        filter_conditions: JSON.parse(row.filter_conditions),
        data_points_count: row.data_points_count,
        insights: JSON.parse(row.insights_data),
        confidence_level: row.confidence_level,
        created_at: row.created_at
      }))
    })

  } catch (error) {
    console.error('Get insights reports API error:', error)
    return NextResponse.json({
      success: false,
      error: '获取洞察报告失败'
    }, { status: 500 })
  }
}
