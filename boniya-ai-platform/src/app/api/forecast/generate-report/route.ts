import { NextRequest, NextResponse } from 'next/server'
import { salesForecastAI, ForecastReportData } from '@/lib/ai/sales-forecast-ai'
import { executeSafeQuery } from '@/lib/db/connection'

// 生成销售预测报告API
export async function POST(request: NextRequest) {
  try {
    const reportData: ForecastReportData = await request.json()

    // 验证输入数据
    if (!reportData.product_name || !reportData.forecast_data || !reportData.analysis_period) {
      return NextResponse.json({
        success: false,
        error: '缺少必要的预测数据'
      }, { status: 400 })
    }

    // 调用Gemini AI生成报告
    const report = await salesForecastAI.generateForecastReport(reportData)

    // 保存报告到数据库
    try {
      const insertQuery = `
        INSERT INTO sales_forecasts (
          product_name, 
          forecast_data, 
          gemini_report, 
          confidence_level,
          analysis_period_start,
          analysis_period_end,
          key_factors
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `
      
      const reportText = `${report.summary}\n\n${report.daily_analysis}\n\n${report.recommendation}`
      
      const result = await executeSafeQuery`
        INSERT INTO sales_forecasts (
          product_name,
          forecast_data,
          gemini_report,
          confidence_level,
          analysis_period_start,
          analysis_period_end,
          key_factors
        ) VALUES (${reportData.product_name}, ${JSON.stringify(reportData.forecast_data)}, ${reportText}, ${report.confidence_level}, ${reportData.analysis_period.start_date}, ${reportData.analysis_period.end_date}, ${JSON.stringify(reportData.key_factors)})
        RETURNING id
      `

      return NextResponse.json({
        success: true,
        data: {
          report,
          report_id: result.rows[0]?.id
        }
      })

    } catch (dbError) {
      console.error('Database save error:', dbError)
      // 即使数据库保存失败，也返回生成的报告
      return NextResponse.json({
        success: true,
        data: {
          report,
          warning: '报告生成成功，但保存到数据库失败'
        }
      })
    }

  } catch (error) {
    console.error('Report generation API error:', error)
    return NextResponse.json({
      success: false,
      error: '报告生成失败，请稍后重试'
    }, { status: 500 })
  }
}

// 获取历史报告API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productName = searchParams.get('product_name')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = `
      SELECT 
        id,
        product_name,
        forecast_data,
        gemini_report,
        confidence_level,
        analysis_period_start,
        analysis_period_end,
        key_factors,
        created_at
      FROM sales_forecasts
    `
    
    const params: any[] = []
    
    if (productName) {
      query += ` WHERE product_name = $1`
      params.push(productName)
      query += ` ORDER BY created_at DESC LIMIT $2`
      params.push(limit)
    } else {
      query += ` ORDER BY created_at DESC LIMIT $1`
      params.push(limit)
    }

    let result
    if (productName) {
      result = await executeSafeQuery`
        SELECT
          id,
          product_name,
          forecast_data,
          gemini_report,
          confidence_level,
          analysis_period_start,
          analysis_period_end,
          key_factors,
          created_at
        FROM sales_forecasts
        WHERE product_name = ${productName}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    } else {
      result = await executeSafeQuery`
        SELECT
          id,
          product_name,
          forecast_data,
          gemini_report,
          confidence_level,
          analysis_period_start,
          analysis_period_end,
          key_factors,
          created_at
        FROM sales_forecasts
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    }

    return NextResponse.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        product_name: row.product_name,
        forecast_data: JSON.parse(row.forecast_data),
        report: row.gemini_report,
        confidence_level: row.confidence_level,
        analysis_period: {
          start_date: row.analysis_period_start,
          end_date: row.analysis_period_end
        },
        key_factors: JSON.parse(row.key_factors || '[]'),
        created_at: row.created_at
      }))
    })

  } catch (error) {
    console.error('Get reports API error:', error)
    return NextResponse.json({
      success: false,
      error: '获取历史报告失败'
    }, { status: 500 })
  }
}
