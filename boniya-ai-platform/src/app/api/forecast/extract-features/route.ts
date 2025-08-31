import { NextRequest, NextResponse } from 'next/server'
import { salesForecastAI } from '@/lib/ai/sales-forecast-ai'

// 特征提取API
export async function POST(request: NextRequest) {
  try {
    const { eventDescription } = await request.json()

    if (!eventDescription || typeof eventDescription !== 'string') {
      return NextResponse.json({
        success: false,
        error: '事件描述不能为空'
      }, { status: 400 })
    }

    // 调用Gemini AI进行特征提取
    const result = await salesForecastAI.extractFeatures(eventDescription)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Feature extraction API error:', error)
    return NextResponse.json({
      success: false,
      error: '特征提取失败，请稍后重试'
    }, { status: 500 })
  }
}

// 批量特征提取API
export async function PUT(request: NextRequest) {
  try {
    const { events } = await request.json()

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({
        success: false,
        error: '事件列表不能为空'
      }, { status: 400 })
    }

    if (events.length > 10) {
      return NextResponse.json({
        success: false,
        error: '批量处理最多支持10个事件'
      }, { status: 400 })
    }

    // 批量特征提取
    const results = await salesForecastAI.batchExtractFeatures(events)

    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('Batch feature extraction API error:', error)
    return NextResponse.json({
      success: false,
      error: '批量特征提取失败，请稍后重试'
    }, { status: 500 })
  }
}
