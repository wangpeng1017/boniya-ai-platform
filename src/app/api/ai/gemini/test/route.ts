import { NextRequest, NextResponse } from 'next/server'
import { geminiClient } from '@/lib/ai/gemini-client'

// 测试Gemini API连接和功能
export async function GET(request: NextRequest) {
  try {
    // 检查API密钥是否配置
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'GEMINI_API_KEY not configured' 
        },
        { status: 500 }
      )
    }

    // 执行健康检查
    const isHealthy = await geminiClient.healthCheck()
    
    if (!isHealthy) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Gemini API health check failed' 
        },
        { status: 500 }
      )
    }

    // 测试基本功能
    const testResults = await Promise.allSettled([
      // 测试文本生成
      geminiClient.generateContent('请用中文说"你好，我是波尼亚AI助手"'),
      
      // 测试情感分析
      geminiClient.analyzeSentiment('这个产品质量很好，我很满意！'),
      
      // 测试关键词提取
      geminiClient.extractKeywords('波尼亚AI平台是一个企业级的数据分析平台，集成了多种AI功能'),
      
      // 测试客服回复
      geminiClient.generateCustomerServiceReply('我想了解一下你们的产品功能')
    ])

    const results = {
      textGeneration: testResults[0].status === 'fulfilled' ? testResults[0].value : 'Failed',
      sentimentAnalysis: testResults[1].status === 'fulfilled' ? testResults[1].value : 'Failed',
      keywordExtraction: testResults[2].status === 'fulfilled' ? testResults[2].value : 'Failed',
      customerService: testResults[3].status === 'fulfilled' ? testResults[3].value : 'Failed'
    }

    return NextResponse.json({
      success: true,
      message: 'Gemini API测试完成',
      config: {
        model: process.env.GEMINI_MODEL,
        apiKeyConfigured: !!process.env.GEMINI_API_KEY
      },
      testResults: results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Gemini API test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// 手动触发特定测试
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { test, text } = body

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      )
    }

    let result

    switch (test) {
      case 'sentiment':
        result = await geminiClient.analyzeSentiment(text || '测试文本')
        break
      
      case 'keywords':
        result = await geminiClient.extractKeywords(text || '测试文本')
        break
      
      case 'generate':
        result = await geminiClient.generateContent(text || '请介绍一下波尼亚AI平台')
        break
      
      case 'customer-service':
        result = await geminiClient.generateCustomerServiceReply(text || '我需要帮助')
        break
      
      case 'summary':
        result = await geminiClient.summarizeText(text || '这是一段需要总结的长文本内容')
        break
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid test type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      test,
      input: text,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Gemini API manual test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
