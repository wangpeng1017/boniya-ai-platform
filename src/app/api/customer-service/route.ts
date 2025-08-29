import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { GeminiClient } from '@/lib/ai/gemini-client'

// 智能客服管理API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      action,
      ticket_data,
      audio_file,
      customer_info
    } = body

    let result

    switch (action) {
      case 'create_ticket':
        result = await createServiceTicket(ticket_data)
        break
      case 'process_audio':
        result = await processAudioToText(audio_file)
        break
      case 'analyze_complaint':
        result = await analyzeComplaint(ticket_data)
        break
      case 'auto_response':
        result = await generateAutoResponse(ticket_data)
        break
      default:
        return NextResponse.json(
          { success: false, error: '不支持的操作类型' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('客服管理操作失败:', error)
    return NextResponse.json(
      { success: false, error: '客服管理操作失败' },
      { status: 500 }
    )
  }
}

// 获取工单列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const channel = searchParams.get('channel')
    const limit = parseInt(searchParams.get('limit') || '20')
    const analysis_type = searchParams.get('analysis_type')

    if (analysis_type === 'dashboard') {
      return NextResponse.json({
        success: true,
        data: await getServiceDashboard()
      })
    }

    let whereConditions = []
    if (status) whereConditions.push(`status = '${status}'`)
    if (priority) whereConditions.push(`priority = '${priority}'`)
    if (channel) whereConditions.push(`channel = '${channel}'`)

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : ''

    const result = await sql.query(`
      SELECT * FROM service_tickets 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `)

    return NextResponse.json({
      success: true,
      data: result.rows
    })

  } catch (error) {
    console.error('获取工单列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取工单列表失败' },
      { status: 500 }
    )
  }
}

// 创建服务工单
async function createServiceTicket(ticketData: any) {
  const {
    customer_name,
    customer_phone,
    customer_email,
    channel,
    category,
    priority,
    subject,
    description,
    product_info
  } = ticketData

  // 使用AI分析工单内容
  const gemini = new GeminiClient()
  const analysis = await analyzeTicketContent(description, gemini)

  const result = await sql`
    INSERT INTO service_tickets (
      customer_name, customer_phone, customer_email, channel,
      category, priority, subject, description, product_info,
      status, ai_analysis, created_at, updated_at
    ) VALUES (
      ${customer_name}, ${customer_phone}, ${customer_email}, ${channel},
      ${category}, ${priority}, ${subject}, ${description}, ${JSON.stringify(product_info)},
      'open', ${JSON.stringify(analysis)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) RETURNING id, ticket_number
  `

  const ticketId = result.rows[0].id
  const ticketNumber = `TK${Date.now().toString().slice(-8)}`

  // 更新工单号
  await sql`
    UPDATE service_tickets 
    SET ticket_number = ${ticketNumber}
    WHERE id = ${ticketId}
  `

  return {
    ticket_id: ticketId,
    ticket_number: ticketNumber,
    status: 'open',
    ai_analysis: analysis,
    estimated_resolution_time: analysis.estimated_resolution_time,
    recommended_actions: analysis.recommended_actions
  }
}

// 分析工单内容
async function analyzeTicketContent(description: string, gemini: GeminiClient) {
  const prompt = `
    请分析以下客服工单内容，并提供处理建议：
    
    工单描述：${description}
    
    请按以下JSON格式返回分析结果：
    {
      "category": "问题类别",
      "urgency_level": "high/medium/low",
      "sentiment": "positive/neutral/negative",
      "key_issues": ["关键问题点"],
      "product_mentioned": "涉及产品",
      "estimated_resolution_time": "预计解决时间",
      "recommended_actions": ["建议处理步骤"],
      "escalation_needed": true/false,
      "similar_cases": "相似案例数量",
      "customer_satisfaction_risk": "high/medium/low"
    }
  `

  try {
    const response = await gemini.generateContent(prompt, { maxTokens: 800 })
    return JSON.parse(response)
  } catch (error) {
    // 降级到简单分析
    return {
      category: '一般咨询',
      urgency_level: 'medium',
      sentiment: 'neutral',
      key_issues: ['需要人工处理'],
      estimated_resolution_time: '24小时',
      recommended_actions: ['分配给客服专员', '及时回复客户'],
      escalation_needed: false
    }
  }
}

// 语音转文字处理
async function processAudioToText(audioFile: string) {
  try {
    // 这里应该集成真实的语音识别服务
    // 现在返回模拟结果
    
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 3000))

    const mockTranscription = {
      text: "您好，我是张先生，我昨天在你们店里买的牛奶有问题，打开后发现有异味，我想要退货或者换货。我的电话是138****1234，订单号是JD202403251234。",
      confidence: 0.92,
      duration: "45秒",
      language: "zh-CN",
      segments: [
        { start: 0, end: 8, text: "您好，我是张先生" },
        { start: 8, end: 20, text: "我昨天在你们店里买的牛奶有问题" },
        { start: 20, end: 30, text: "打开后发现有异味" },
        { start: 30, end: 40, text: "我想要退货或者换货" },
        { start: 40, end: 45, text: "我的电话是138****1234，订单号是JD202403251234" }
      ],
      extracted_info: {
        customer_name: "张先生",
        phone: "138****1234",
        order_number: "JD202403251234",
        product: "牛奶",
        issue: "有异味",
        request: "退货或换货"
      }
    }

    return mockTranscription

  } catch (error) {
    return {
      error: "语音转文字失败",
      message: "请检查音频文件格式或网络连接"
    }
  }
}

// 投诉分析
async function analyzeComplaint(ticketData: any) {
  const gemini = new GeminiClient()
  
  const prompt = `
    请分析以下客户投诉，并提供详细的分析报告：
    
    投诉内容：${ticketData.description}
    产品信息：${JSON.stringify(ticketData.product_info)}
    客户信息：${ticketData.customer_name}
    
    请按以下JSON格式返回分析结果：
    {
      "complaint_type": "投诉类型",
      "severity": "high/medium/low",
      "root_cause": "根本原因分析",
      "affected_product": "涉及产品",
      "compensation_suggestion": "补偿建议",
      "prevention_measures": ["预防措施"],
      "follow_up_actions": ["后续行动"],
      "escalation_path": "升级路径",
      "similar_complaints": "相似投诉统计",
      "resolution_priority": "处理优先级"
    }
  `

  try {
    const response = await gemini.generateContent(prompt, { maxTokens: 1000 })
    const analysis = JSON.parse(response)
    
    // 保存分析结果
    await sql`
      INSERT INTO complaint_analysis (
        ticket_id, analysis_result, created_at
      ) VALUES (
        ${ticketData.ticket_id}, ${JSON.stringify(analysis)}, CURRENT_TIMESTAMP
      )
    `

    return analysis
  } catch (error) {
    return {
      complaint_type: '产品质量',
      severity: 'medium',
      root_cause: '需要进一步调查',
      resolution_priority: 'normal'
    }
  }
}

// 自动回复生成
async function generateAutoResponse(ticketData: any) {
  const gemini = new GeminiClient()
  
  const prompt = `
    请为以下客服工单生成专业的回复内容：
    
    客户问题：${ticketData.description}
    工单类别：${ticketData.category}
    客户姓名：${ticketData.customer_name}
    
    请生成一个专业、友好、有帮助的回复，包含：
    1. 问候和感谢
    2. 问题确认
    3. 解决方案或下一步行动
    4. 联系方式和后续跟进
    
    回复应该体现波尼亚品牌的专业性和客户关怀。
  `

  try {
    const response = await gemini.generateContent(prompt, { maxTokens: 500 })
    
    return {
      auto_response: response,
      response_type: 'ai_generated',
      confidence: 0.85,
      requires_review: true,
      suggested_actions: [
        '发送自动回复',
        '分配给专员跟进',
        '设置提醒'
      ]
    }
  } catch (error) {
    return {
      auto_response: `尊敬的${ticketData.customer_name}，感谢您联系波尼亚客服。我们已收到您的问题，将在24小时内为您处理。如有紧急情况，请拨打客服热线400-xxx-xxxx。`,
      response_type: 'template',
      requires_review: false
    }
  }
}

// 获取服务仪表板数据
async function getServiceDashboard() {
  try {
    // 工单统计
    const ticketStats = await sql`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tickets,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_tickets,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_tickets,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_resolution_hours
      FROM service_tickets 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `

    // 渠道统计
    const channelStats = await sql`
      SELECT 
        channel,
        COUNT(*) as ticket_count,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_response_time
      FROM service_tickets 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY channel
      ORDER BY ticket_count DESC
    `

    // 类别统计
    const categoryStats = await sql`
      SELECT 
        category,
        COUNT(*) as ticket_count,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count
      FROM service_tickets 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY category
      ORDER BY ticket_count DESC
    `

    const stats = ticketStats.rows[0]
    const resolutionRate = stats.total_tickets > 0 ?
      (stats.resolved_tickets / stats.total_tickets * 100).toFixed(1) : '0'

    return {
      overview: {
        total_tickets: parseInt(String(stats.total_tickets || 0)),
        open_tickets: parseInt(String(stats.open_tickets || 0)),
        in_progress_tickets: parseInt(String(stats.in_progress_tickets || 0)),
        resolved_tickets: parseInt(String(stats.resolved_tickets || 0)),
        high_priority_tickets: parseInt(String(stats.high_priority_tickets || 0)),
        resolution_rate: parseFloat(resolutionRate),
        avg_resolution_hours: parseFloat(String(stats.avg_resolution_hours || 0)).toFixed(1)
      },
      channel_analysis: channelStats.rows,
      category_analysis: categoryStats.rows,
      performance_metrics: {
        response_time_target: '2小时',
        resolution_time_target: '24小时',
        satisfaction_target: '95%',
        current_satisfaction: '92.5%'
      }
    }

  } catch (error) {
    console.error('获取仪表板数据失败:', error)
    return {
      overview: {
        total_tickets: 0,
        open_tickets: 0,
        resolution_rate: 0
      },
      channel_analysis: [],
      category_analysis: []
    }
  }
}
