import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: '🎉 波尼亚AI平台API测试成功！',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextAuthUrl: process.env.NEXTAUTH_URL ? '✅ 已配置' : '❌ 未配置',
        postgresUrl: process.env.POSTGRES_URL ? '✅ 已配置' : '❌ 未配置',
        blobToken: process.env.BLOB_READ_WRITE_TOKEN ? '✅ 已配置' : '❌ 未配置',
        geminiApiKey: process.env.GEMINI_API_KEY ? '✅ 已配置' : '❌ 未配置',
      },
      status: 'healthy'
    })
  } catch (error) {
    console.error('API test failed:', error)
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
