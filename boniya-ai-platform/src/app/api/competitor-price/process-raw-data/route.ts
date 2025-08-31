import { NextRequest, NextResponse } from 'next/server'
import { competitorAnalysisAI } from '@/lib/ai/competitor-analysis-ai'
import { executeSafeQuery } from '@/lib/db/connection'

// 处理原始竞品数据API
export async function POST(request: NextRequest) {
  try {
    const { rawText, sourceType, locationText, salespersonId } = await request.json()

    if (!rawText || typeof rawText !== 'string') {
      return NextResponse.json({
        success: false,
        error: '原始文本数据不能为空'
      }, { status: 400 })
    }

    if (!sourceType || !['ocr', 'stt'].includes(sourceType)) {
      return NextResponse.json({
        success: false,
        error: '数据源类型必须是 ocr 或 stt'
      }, { status: 400 })
    }

    // 调用Gemini AI进行数据结构化
    const structuredData = await competitorAnalysisAI.structureCompetitorData(rawText)

    // 保存到数据库
    try {
      const insertQuery = `
        INSERT INTO competitor_prices (
          raw_text,
          source_type,
          location_text,
          brand,
          product_name,
          specifications,
          price,
          confidence_score,
          parsing_notes,
          salesperson_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, capture_date
      `
      
      const result = await executeSafeQuery`
        INSERT INTO competitor_prices (
          raw_text,
          source_type,
          location_text,
          brand,
          product_name,
          specifications,
          price,
          confidence_score,
          parsing_notes,
          salesperson_id
        ) VALUES (${rawText}, ${sourceType}, ${locationText || null}, ${structuredData.brand}, ${structuredData.product_name}, ${structuredData.specifications}, ${structuredData.price}, ${structuredData.confidence}, ${structuredData.parsing_notes}, ${salespersonId || null})
        RETURNING id, capture_date
      `

      return NextResponse.json({
        success: true,
        data: {
          id: result.rows[0].id,
          capture_date: result.rows[0].capture_date,
          structured_data: structuredData,
          raw_text: rawText
        }
      })

    } catch (dbError) {
      console.error('Database save error:', dbError)
      // 即使数据库保存失败，也返回结构化数据
      return NextResponse.json({
        success: true,
        data: {
          structured_data: structuredData,
          raw_text: rawText,
          warning: '数据结构化成功，但保存到数据库失败'
        }
      })
    }

  } catch (error) {
    console.error('Raw data processing API error:', error)
    return NextResponse.json({
      success: false,
      error: '数据处理失败，请稍后重试'
    }, { status: 500 })
  }
}

// 批量处理原始数据API
export async function PUT(request: NextRequest) {
  try {
    const { rawTexts, sourceType, locationText, salespersonId } = await request.json()

    if (!Array.isArray(rawTexts) || rawTexts.length === 0) {
      return NextResponse.json({
        success: false,
        error: '原始文本数组不能为空'
      }, { status: 400 })
    }

    if (rawTexts.length > 20) {
      return NextResponse.json({
        success: false,
        error: '批量处理最多支持20条数据'
      }, { status: 400 })
    }

    // 批量结构化数据
    const structuredResults = await competitorAnalysisAI.batchStructureData(rawTexts)

    // 批量保存到数据库
    const savedResults = []
    for (let i = 0; i < rawTexts.length; i++) {
      try {
        const insertQuery = `
          INSERT INTO competitor_prices (
            raw_text,
            source_type,
            location_text,
            brand,
            product_name,
            specifications,
            price,
            confidence_score,
            parsing_notes,
            salesperson_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id, capture_date
        `
        
        const result = await executeSafeQuery`
          INSERT INTO competitor_prices (
            raw_text,
            source_type,
            location_text,
            brand,
            product_name,
            specifications,
            price,
            confidence_score,
            parsing_notes,
            salesperson_id
          ) VALUES (${rawTexts[i]}, ${sourceType}, ${locationText || null}, ${structuredResults[i].brand}, ${structuredResults[i].product_name}, ${structuredResults[i].specifications}, ${structuredResults[i].price}, ${structuredResults[i].confidence}, ${structuredResults[i].parsing_notes}, ${salespersonId || null})
          RETURNING id, capture_date
        `

        savedResults.push({
          id: result.rows[0].id,
          capture_date: result.rows[0].capture_date,
          structured_data: structuredResults[i],
          raw_text: rawTexts[i]
        })

      } catch (dbError) {
        console.error(`Database save error for item ${i}:`, dbError)
        savedResults.push({
          structured_data: structuredResults[i],
          raw_text: rawTexts[i],
          error: '保存失败'
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        processed_count: rawTexts.length,
        results: savedResults
      }
    })

  } catch (error) {
    console.error('Batch processing API error:', error)
    return NextResponse.json({
      success: false,
      error: '批量处理失败，请稍后重试'
    }, { status: 500 })
  }
}
