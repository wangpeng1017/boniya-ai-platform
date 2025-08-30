import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const envCheck = {
      // 基础配置
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ 已配置' : '❌ 未配置',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ 已配置' : '❌ 未配置',
      
      // 数据库配置
      POSTGRES_URL: process.env.POSTGRES_URL ? '✅ 已配置' : '❌ 未配置',
      POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? '✅ 已配置' : '❌ 未配置',
      POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? '✅ 已配置' : '❌ 未配置',
      
      // 文件存储配置
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN ? '✅ 已配置' : '❌ 未配置',
      
      // AI服务配置
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? {
        status: '✅ 已配置',
        length: process.env.GEMINI_API_KEY.length,
        prefix: process.env.GEMINI_API_KEY.substring(0, 10) + '...',
        isValid: process.env.GEMINI_API_KEY.startsWith('AIza')
      } : '❌ 未配置',
      GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-pro (默认)',
      
      // 安全配置
      CRON_SECRET_TOKEN: process.env.CRON_SECRET_TOKEN ? '✅ 已配置' : '❌ 未配置',
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ? '✅ 已配置' : '❌ 未配置',
      API_SECRET_KEY: process.env.API_SECRET_KEY ? '✅ 已配置' : '❌ 未配置',
    }

    // 检查关键配置
    const criticalMissing = []
    if (!process.env.NEXTAUTH_SECRET) criticalMissing.push('NEXTAUTH_SECRET')
    if (!process.env.POSTGRES_URL) criticalMissing.push('POSTGRES_URL')
    if (!process.env.BLOB_READ_WRITE_TOKEN) criticalMissing.push('BLOB_READ_WRITE_TOKEN')
    if (!process.env.GEMINI_API_KEY) criticalMissing.push('GEMINI_API_KEY')

    return NextResponse.json({
      success: true,
      message: '环境变量检查完成',
      environment: envCheck,
      criticalMissing,
      allCriticalConfigured: criticalMissing.length === 0,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Environment check failed:', error)
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
