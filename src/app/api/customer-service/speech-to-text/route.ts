import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/connection'

// 语音转文字处理
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticket_id, audio_file_url } = body

    if (!ticket_id || !audio_file_url) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 模拟语音转文字处理（实际应该调用专业的ASR服务）
    const mockTranscript = await simulateSpeechToText(audio_file_url)

    // 更新工单的转录结果
    const updateQuery = `
      UPDATE service_tickets 
      SET transcript = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `

    const result = await db.query(updateQuery, [mockTranscript, ticket_id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '工单不存在' },
        { status: 404 }
      )
    }

    // 自动触发NLP分析
    const nlpAnalysis = await performNLPAnalysis(mockTranscript)
    
    // 更新NLP分析结果
    await db.query(
      `UPDATE service_tickets SET nlp_analysis = $1 WHERE id = $2`,
      [JSON.stringify(nlpAnalysis), ticket_id]
    )

    return NextResponse.json({
      success: true,
      data: {
        ticket_id,
        transcript: mockTranscript,
        nlp_analysis: nlpAnalysis
      },
      message: '语音转文字处理完成'
    })

  } catch (error) {
    console.error('语音转文字处理失败:', error)
    return NextResponse.json(
      { success: false, error: '语音转文字处理失败' },
      { status: 500 }
    )
  }
}

// 批量处理语音文件
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticket_ids } = body

    if (!ticket_ids || !Array.isArray(ticket_ids)) {
      return NextResponse.json(
        { success: false, error: '工单ID列表不能为空' },
        { status: 400 }
      )
    }

    const results = []

    for (const ticket_id of ticket_ids) {
      try {
        // 获取工单信息
        const ticketQuery = `SELECT * FROM service_tickets WHERE id = $1`
        const ticketResult = await db.query(ticketQuery, [ticket_id])
        
        if (ticketResult.rows.length === 0) {
          results.push({ ticket_id, success: false, error: '工单不存在' })
          continue
        }

        const ticket = ticketResult.rows[0]
        
        if (!ticket.audio_file_url) {
          results.push({ ticket_id, success: false, error: '无音频文件' })
          continue
        }

        // 处理语音转文字
        const transcript = await simulateSpeechToText(ticket.audio_file_url)
        const nlpAnalysis = await performNLPAnalysis(transcript)

        // 更新工单
        await db.query(
          `UPDATE service_tickets 
           SET transcript = $1, nlp_analysis = $2, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $3`,
          [transcript, JSON.stringify(nlpAnalysis), ticket_id]
        )

        results.push({
          ticket_id,
          success: true,
          transcript,
          nlp_analysis: nlpAnalysis
        })

      } catch (error) {
        results.push({
          ticket_id,
          success: false,
          error: error.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: `批量处理完成，成功: ${results.filter(r => r.success).length}，失败: ${results.filter(r => !r.success).length}`
    })

  } catch (error) {
    console.error('批量语音转文字处理失败:', error)
    return NextResponse.json(
      { success: false, error: '批量处理失败' },
      { status: 500 }
    )
  }
}

// 模拟语音转文字功能（实际应该调用Azure Speech Service、Google Speech-to-Text等）
async function simulateSpeechToText(audioUrl: string): Promise<string> {
  // 模拟处理延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 根据文件名或其他信息返回模拟的转录结果
  const mockTranscripts = [
    "您好，我购买的波尼亚香肠出现了包装漏气的问题，希望能够退换货。",
    "产品质量很好，但是物流速度有点慢，希望能够改进。",
    "客服态度很好，问题解决得很及时，非常满意。",
    "产品包装破损，里面的食品可能受到了污染，要求退款。",
    "味道不错，但是价格有点贵，希望能有更多优惠活动。"
  ]
  
  return mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)]
}

// NLP分析功能
async function performNLPAnalysis(text: string) {
  // 模拟NLP处理延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 情感分析
  const sentiment = analyzeSentiment(text)
  
  // 关键词提取
  const keywords = extractKeywords(text)
  
  // 问题分类
  const category = categorizeIssue(text)
  
  // 紧急程度评估
  const urgency = assessUrgency(text)
  
  return {
    sentiment,
    keywords,
    category,
    urgency,
    confidence: 0.85,
    processed_at: new Date().toISOString()
  }
}

// 情感分析
function analyzeSentiment(text: string): string {
  const positiveWords = ['好', '满意', '不错', '优秀', '赞', '棒']
  const negativeWords = ['差', '问题', '投诉', '退货', '不满', '糟糕']
  
  const positiveCount = positiveWords.filter(word => text.includes(word)).length
  const negativeCount = negativeWords.filter(word => text.includes(word)).length
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

// 关键词提取
function extractKeywords(text: string): string[] {
  const keywords = ['包装', '漏气', '质量', '物流', '客服', '退货', '退款', '价格', '味道']
  return keywords.filter(keyword => text.includes(keyword))
}

// 问题分类
function categorizeIssue(text: string): string {
  if (text.includes('包装') || text.includes('漏气')) return '包装问题'
  if (text.includes('物流') || text.includes('发货')) return '物流问题'
  if (text.includes('质量') || text.includes('味道')) return '产品质量'
  if (text.includes('客服') || text.includes('态度')) return '服务问题'
  if (text.includes('退货') || text.includes('退款')) return '退换货'
  return '一般咨询'
}

// 紧急程度评估
function assessUrgency(text: string): string {
  const urgentWords = ['紧急', '立即', '马上', '污染', '食品安全']
  const highWords = ['退货', '退款', '投诉', '问题']
  
  if (urgentWords.some(word => text.includes(word))) return 'urgent'
  if (highWords.some(word => text.includes(word))) return 'high'
  return 'medium'
}
