import { NextRequest, NextResponse } from 'next/server'
import { geminiClient } from '@/lib/ai/gemini-client'

// 测试Gemini API连接和功能
export async function GET() {
  try {
    // 详细的环境变量检查
    const apiKey = process.env.GEMINI_API_KEY
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-pro'

    console.log('Gemini API Test - Environment Check:')
    console.log('API Key configured:', !!apiKey)
    console.log('API Key length:', apiKey?.length || 0)
    console.log('API Key prefix:', apiKey?.substring(0, 10) + '...')
    console.log('Model:', model)

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'GEMINI_API_KEY not configured',
          details: {
            apiKeyConfigured: false,
            model: model
          }
        },
        { status: 500 }
      )
    }

    // 手动测试API连接
    console.log('Testing direct API connection...')
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const testRequest = {
      contents: [{
        parts: [{
          text: "Hello, please respond with 'API connection successful'"
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 50
      }
    }

    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest)
    })

    console.log('API Response Status:', response.status)
    console.log('API Response Headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)

      return NextResponse.json(
        {
          success: false,
          error: `Gemini API request failed: ${response.status} ${response.statusText}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            apiKeyConfigured: true,
            apiKeyLength: apiKey.length,
            model: model,
            errorResponse: errorText
          }
        },
        { status: 500 }
      )
    }

    const responseData = await response.json()
    console.log('API Success Response:', responseData)

    // 如果直接API调用成功，再测试客户端
    let clientHealthy = false
    try {
      clientHealthy = await geminiClient.healthCheck()
    } catch (clientError) {
      console.error('Client health check error:', clientError)
    }

    return NextResponse.json({
      success: true,
      message: 'Gemini API连接测试成功！',
      details: {
        apiKeyConfigured: true,
        apiKeyLength: apiKey.length,
        model: model,
        directApiTest: 'SUCCESS',
        clientHealthCheck: clientHealthy,
        responsePreview: responseData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text'
      },
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
