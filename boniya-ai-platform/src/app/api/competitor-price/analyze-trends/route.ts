import { NextRequest, NextResponse } from 'next/server'
import { competitorAnalysisAI } from '@/lib/ai/competitor-analysis-ai'
import { executeSafeQuery } from '@/lib/db/connection'

// 价格趋势分析API
export async function POST(request: NextRequest) {
  try {
    const { 
      brand, 
      productName, 
      region, 
      startDate, 
      endDate,
      analysisType = 'comprehensive' 
    } = await request.json()

    // 构建查询条件
    let whereConditions = ['price IS NOT NULL']
    let queryParams = []
    let paramIndex = 1

    if (brand && brand !== 'all') {
      whereConditions.push(`brand = $${paramIndex}`)
      queryParams.push(brand)
      paramIndex++
    }

    if (productName) {
      whereConditions.push(`product_name ILIKE $${paramIndex}`)
      queryParams.push(`%${productName}%`)
      paramIndex++
    }

    if (region && region !== 'all') {
      whereConditions.push(`location_text ILIKE $${paramIndex}`)
      queryParams.push(`%${region}%`)
      paramIndex++
    }

    if (startDate) {
      whereConditions.push(`capture_date >= $${paramIndex}`)
      queryParams.push(startDate)
      paramIndex++
    }

    if (endDate) {
      whereConditions.push(`capture_date <= $${paramIndex}`)
      queryParams.push(endDate + ' 23:59:59')
      paramIndex++
    }

    const whereClause = whereConditions.join(' AND ')

    // 获取竞品价格数据
    const dataQuery = `
      SELECT 
        brand,
        product_name,
        price,
        capture_date::date as date,
        location_text as region,
        confidence_score
      FROM competitor_prices 
      WHERE ${whereClause}
      ORDER BY capture_date DESC
      LIMIT 100
    `

    const dataResult = await executeSafeQuery`${dataQuery}`

    if (dataResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: '没有找到符合条件的价格数据'
      }, { status: 404 })
    }

    // 准备分析数据
    const analysisData = dataResult.rows.map(row => ({
      brand: row.brand,
      product_name: row.product_name,
      price: parseFloat(row.price),
      date: row.date,
      region: row.region
    }))

    // 调用Gemini AI进行趋势分析
    const trendAnalysis = await competitorAnalysisAI.analyzePriceTrends(analysisData)

    // 生成摘要报告
    const summaryReport = await competitorAnalysisAI.generateCompetitorSummary(trendAnalysis)

    // 保存分析结果到数据库
    try {
      const insertQuery = `
        INSERT INTO competitor_analysis_reports (
          analysis_type,
          filter_conditions,
          data_points_count,
          trend_analysis,
          summary_report,
          confidence_level
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at
      `
      
      const filterConditions = {
        brand,
        productName,
        region,
        startDate,
        endDate
      }

      const result = await executeSafeQuery`
        INSERT INTO competitor_analysis_reports (
          analysis_type,
          filter_conditions,
          data_points_count,
          trend_analysis,
          summary_report,
          confidence_level
        ) VALUES (${analysisType}, ${JSON.stringify(filterConditions)}, ${analysisData.length}, ${JSON.stringify(trendAnalysis)}, ${summaryReport}, ${trendAnalysis.confidence_level})
        RETURNING id, created_at
      `

      return NextResponse.json({
        success: true,
        data: {
          analysis_id: result.rows[0].id,
          created_at: result.rows[0].created_at,
          data_points_count: analysisData.length,
          trend_analysis: trendAnalysis,
          summary_report: summaryReport,
          raw_data: analysisData
        }
      })

    } catch (dbError) {
      console.error('Analysis save error:', dbError)
      // 即使保存失败，也返回分析结果
      return NextResponse.json({
        success: true,
        data: {
          data_points_count: analysisData.length,
          trend_analysis: trendAnalysis,
          summary_report: summaryReport,
          raw_data: analysisData,
          warning: '分析完成，但保存到数据库失败'
        }
      })
    }

  } catch (error) {
    console.error('Price trend analysis API error:', error)
    return NextResponse.json({
      success: false,
      error: '价格趋势分析失败，请稍后重试'
    }, { status: 500 })
  }
}

// 获取历史分析报告API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const analysisType = searchParams.get('analysis_type') || 'comprehensive'

    const query = `
      SELECT 
        id,
        analysis_type,
        filter_conditions,
        data_points_count,
        trend_analysis,
        summary_report,
        confidence_level,
        created_at
      FROM competitor_analysis_reports
      WHERE analysis_type = $1
      ORDER BY created_at DESC 
      LIMIT $2
    `

    const result = await executeSafeQuery`
      SELECT
        id,
        analysis_type,
        filter_conditions,
        data_points_count,
        trend_analysis,
        summary_report,
        confidence_level,
        created_at
      FROM competitor_analysis_reports
      WHERE analysis_type = ${analysisType}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `

    return NextResponse.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        analysis_type: row.analysis_type,
        filter_conditions: JSON.parse(row.filter_conditions),
        data_points_count: row.data_points_count,
        trend_analysis: JSON.parse(row.trend_analysis),
        summary_report: row.summary_report,
        confidence_level: row.confidence_level,
        created_at: row.created_at
      }))
    })

  } catch (error) {
    console.error('Get analysis reports API error:', error)
    return NextResponse.json({
      success: false,
      error: '获取分析报告失败'
    }, { status: 500 })
  }
}
