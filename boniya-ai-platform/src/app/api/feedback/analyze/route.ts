import { NextRequest, NextResponse } from 'next/server'
import { ecommerceFeedbackAI } from '@/lib/ai/ecommerce-feedback-ai'
import { executeSafeQuery } from '@/lib/db/connection'

// 分析单条反馈API
export async function POST(request: NextRequest) {
  try {
    const { feedbackText, platform, orderId } = await request.json()

    if (!feedbackText || typeof feedbackText !== 'string') {
      return NextResponse.json({
        success: false,
        error: '反馈内容不能为空'
      }, { status: 400 })
    }

    // 调用Gemini AI分析反馈
    const analysisResult = await ecommerceFeedbackAI.analyzeFeedback(feedbackText)

    // 保存到数据库
    try {
      const insertQuery = `
        INSERT INTO customer_feedback (
          platform,
          order_id,
          original_comment,
          sentiment,
          issues,
          urgency,
          summary,
          confidence_score,
          analysis_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, comment_time
      `
      
      const result = await executeSafeQuery`
        INSERT INTO customer_feedback (
          platform,
          order_id,
          original_comment,
          sentiment,
          issues,
          urgency,
          summary,
          confidence_score,
          analysis_notes
        ) VALUES (${platform || 'manual'}, ${orderId || null}, ${feedbackText}, ${analysisResult.sentiment}, ${JSON.stringify(analysisResult.issues)}, ${analysisResult.urgency}, ${analysisResult.summary}, ${analysisResult.confidence}, ${analysisResult.analysis_notes})
        RETURNING id, comment_time
      `

      return NextResponse.json({
        success: true,
        data: {
          id: result.rows[0].id,
          comment_time: result.rows[0].comment_time,
          analysis_result: analysisResult,
          original_comment: feedbackText
        }
      })

    } catch (dbError) {
      console.error('Database save error:', dbError)
      // 即使数据库保存失败，也返回分析结果
      return NextResponse.json({
        success: true,
        data: {
          analysis_result: analysisResult,
          original_comment: feedbackText,
          warning: '分析完成，但保存到数据库失败'
        }
      })
    }

  } catch (error) {
    console.error('Feedback analysis API error:', error)
    return NextResponse.json({
      success: false,
      error: '反馈分析失败，请稍后重试'
    }, { status: 500 })
  }
}

// 批量分析反馈API
export async function PUT(request: NextRequest) {
  try {
    const { feedbacks } = await request.json()

    if (!Array.isArray(feedbacks) || feedbacks.length === 0) {
      return NextResponse.json({
        success: false,
        error: '反馈列表不能为空'
      }, { status: 400 })
    }

    if (feedbacks.length > 50) {
      return NextResponse.json({
        success: false,
        error: '批量分析最多支持50条反馈'
      }, { status: 400 })
    }

    // 提取反馈文本
    const feedbackTexts = feedbacks.map(f => f.feedbackText || f.original_comment)
    
    // 批量分析
    const analysisResults = await ecommerceFeedbackAI.batchAnalyzeFeedback(feedbackTexts)

    // 批量保存到数据库
    const savedResults = []
    for (let i = 0; i < feedbacks.length; i++) {
      try {
        const feedback = feedbacks[i]
        const analysis = analysisResults[i]

        const insertQuery = `
          INSERT INTO customer_feedback (
            platform,
            order_id,
            original_comment,
            sentiment,
            issues,
            urgency,
            summary,
            confidence_score,
            analysis_notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id, comment_time
        `
        
        const result = await executeSafeQuery`
          INSERT INTO customer_feedback (
            platform,
            order_id,
            original_comment,
            sentiment,
            issues,
            urgency,
            summary,
            confidence_score,
            analysis_notes
          ) VALUES (${feedback.platform || 'batch'}, ${feedback.orderId || null}, ${feedbackTexts[i]}, ${analysis.sentiment}, ${JSON.stringify(analysis.issues)}, ${analysis.urgency}, ${analysis.summary}, ${analysis.confidence}, ${analysis.analysis_notes})
          RETURNING id, comment_time
        `

        savedResults.push({
          id: result.rows[0].id,
          comment_time: result.rows[0].comment_time,
          analysis_result: analysis,
          original_comment: feedbackTexts[i]
        })

      } catch (dbError) {
        console.error(`Database save error for feedback ${i}:`, dbError)
        savedResults.push({
          analysis_result: analysisResults[i],
          original_comment: feedbackTexts[i],
          error: '保存失败'
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        processed_count: feedbacks.length,
        results: savedResults
      }
    })

  } catch (error) {
    console.error('Batch feedback analysis API error:', error)
    return NextResponse.json({
      success: false,
      error: '批量分析失败，请稍后重试'
    }, { status: 500 })
  }
}
