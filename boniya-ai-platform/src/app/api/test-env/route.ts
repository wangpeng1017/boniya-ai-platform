import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

// Vercel运行时配置
export const runtime = 'nodejs'
export const maxDuration = 10

// Environment Variables Test API
export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    overall_status: 'unknown' as 'healthy' | 'partial' | 'unhealthy',
    tests: {
      database: {
        postgres_url: { configured: false, accessible: false, error: null as string | null },
        prisma_database_url: { configured: false, accessible: false, error: null as string | null },
        postgres_prisma_url: { configured: false, accessible: false, error: null as string | null }
      },
      api_keys: {
        gemini_api_key: { configured: false, valid_format: false, error: null as string | null },
        baidu_ocr_api_key: { configured: false, valid_format: false, error: null as string | null },
        baidu_ocr_secret_key: { configured: false, valid_format: false, error: null as string | null }
      },
      authentication: {
        nextauth_secret: { configured: false, valid_format: false, error: null as string | null },
        nextauth_url: { configured: false, valid_format: false, error: null as string | null }
      }
    },
    summary: {
      total_tests: 0,
      passed_tests: 0,
      failed_tests: 0,
      success_rate: 0
    }
  }

  // Test Database Connections
  console.log('🔍 Testing database connections...')

  // Test POSTGRES_URL
  try {
    const postgresUrl = process.env.POSTGRES_URL
    results.tests.database.postgres_url.configured = !!postgresUrl
    
    if (postgresUrl) {
      // Test connection
      const testResult = await sql`SELECT 1 as test`
      results.tests.database.postgres_url.accessible = testResult.rows.length > 0
    }
  } catch (error) {
    results.tests.database.postgres_url.error = error instanceof Error ? error.message : 'Connection failed'
  }

  // Test PRISMA_DATABASE_URL
  try {
    const prismaUrl = process.env.PRISMA_DATABASE_URL
    results.tests.database.prisma_database_url.configured = !!prismaUrl
    
    if (prismaUrl) {
      // Check if it's Accelerate format
      if (prismaUrl.startsWith('prisma+postgres://')) {
        results.tests.database.prisma_database_url.accessible = true
      } else {
        results.tests.database.prisma_database_url.error = 'Invalid Prisma Accelerate format'
      }
    }
  } catch (error) {
    results.tests.database.prisma_database_url.error = error instanceof Error ? error.message : 'Validation failed'
  }

  // Test POSTGRES_PRISMA_URL
  try {
    const postgresPrismaUrl = process.env.POSTGRES_PRISMA_URL
    results.tests.database.postgres_prisma_url.configured = !!postgresPrismaUrl
    
    if (postgresPrismaUrl) {
      // Check if it's a valid postgres URL with pgbouncer
      if (postgresPrismaUrl.includes('pgbouncer=true')) {
        results.tests.database.postgres_prisma_url.accessible = true
      } else {
        results.tests.database.postgres_prisma_url.error = 'Missing pgbouncer configuration'
      }
    }
  } catch (error) {
    results.tests.database.postgres_prisma_url.error = error instanceof Error ? error.message : 'Validation failed'
  }

  // Test API Keys
  console.log('🔑 Testing API keys...')

  // Test GEMINI_API_KEY
  try {
    const geminiKey = process.env.GEMINI_API_KEY
    results.tests.api_keys.gemini_api_key.configured = !!geminiKey
    
    if (geminiKey) {
      // Check format (should start with AIza)
      results.tests.api_keys.gemini_api_key.valid_format = geminiKey.startsWith('AIza') && geminiKey.length > 30
      if (!results.tests.api_keys.gemini_api_key.valid_format) {
        results.tests.api_keys.gemini_api_key.error = 'Invalid Gemini API key format'
      }
    }
  } catch (error) {
    results.tests.api_keys.gemini_api_key.error = error instanceof Error ? error.message : 'Validation failed'
  }

  // Test BAIDU_OCR_API_KEY
  try {
    const baiduApiKey = process.env.BAIDU_OCR_API_KEY
    results.tests.api_keys.baidu_ocr_api_key.configured = !!baiduApiKey
    
    if (baiduApiKey) {
      // Check format (should be 24 characters)
      results.tests.api_keys.baidu_ocr_api_key.valid_format = baiduApiKey.length === 24
      if (!results.tests.api_keys.baidu_ocr_api_key.valid_format) {
        results.tests.api_keys.baidu_ocr_api_key.error = 'Invalid Baidu API key format (should be 24 characters)'
      }
    }
  } catch (error) {
    results.tests.api_keys.baidu_ocr_api_key.error = error instanceof Error ? error.message : 'Validation failed'
  }

  // Test BAIDU_OCR_SECRET_KEY
  try {
    const baiduSecretKey = process.env.BAIDU_OCR_SECRET_KEY
    results.tests.api_keys.baidu_ocr_secret_key.configured = !!baiduSecretKey
    
    if (baiduSecretKey) {
      // Check format (should be 32 characters)
      results.tests.api_keys.baidu_ocr_secret_key.valid_format = baiduSecretKey.length === 32
      if (!results.tests.api_keys.baidu_ocr_secret_key.valid_format) {
        results.tests.api_keys.baidu_ocr_secret_key.error = 'Invalid Baidu secret key format (should be 32 characters)'
      }
    }
  } catch (error) {
    results.tests.api_keys.baidu_ocr_secret_key.error = error instanceof Error ? error.message : 'Validation failed'
  }

  // Test Authentication Settings
  console.log('🔐 Testing authentication settings...')

  // Test NEXTAUTH_SECRET
  try {
    const nextAuthSecret = process.env.NEXTAUTH_SECRET
    results.tests.authentication.nextauth_secret.configured = !!nextAuthSecret
    
    if (nextAuthSecret) {
      // Check format (should be at least 32 characters)
      results.tests.authentication.nextauth_secret.valid_format = nextAuthSecret.length >= 32
      if (!results.tests.authentication.nextauth_secret.valid_format) {
        results.tests.authentication.nextauth_secret.error = 'NextAuth secret should be at least 32 characters'
      }
    }
  } catch (error) {
    results.tests.authentication.nextauth_secret.error = error instanceof Error ? error.message : 'Validation failed'
  }

  // Test NEXTAUTH_URL
  try {
    const nextAuthUrl = process.env.NEXTAUTH_URL
    results.tests.authentication.nextauth_url.configured = !!nextAuthUrl
    
    if (nextAuthUrl) {
      // Check format (should be a valid URL)
      try {
        new URL(nextAuthUrl)
        results.tests.authentication.nextauth_url.valid_format = true
      } catch {
        results.tests.authentication.nextauth_url.valid_format = false
        results.tests.authentication.nextauth_url.error = 'Invalid URL format'
      }
    }
  } catch (error) {
    results.tests.authentication.nextauth_url.error = error instanceof Error ? error.message : 'Validation failed'
  }

  // Calculate Summary
  const allTests = [
    ...Object.values(results.tests.database),
    ...Object.values(results.tests.api_keys),
    ...Object.values(results.tests.authentication)
  ]

  results.summary.total_tests = allTests.length
  results.summary.passed_tests = allTests.filter(test => 
    test.configured && (test.accessible !== false) && (test.valid_format !== false) && !test.error
  ).length
  results.summary.failed_tests = results.summary.total_tests - results.summary.passed_tests
  results.summary.success_rate = Math.round((results.summary.passed_tests / results.summary.total_tests) * 100)

  // Determine Overall Status
  if (results.summary.success_rate >= 90) {
    results.overall_status = 'healthy'
  } else if (results.summary.success_rate >= 70) {
    results.overall_status = 'partial'
  } else {
    results.overall_status = 'unhealthy'
  }

  console.log(`✅ Environment test completed: ${results.summary.passed_tests}/${results.summary.total_tests} tests passed (${results.summary.success_rate}%)`)

  return NextResponse.json({
    success: true,
    data: results
  })
}

// Test specific environment variable
export async function POST(request: NextRequest) {
  try {
    const { variable_name } = await request.json()

    if (!variable_name) {
      return NextResponse.json({
        success: false,
        error: 'Please provide variable_name in request body'
      }, { status: 400 })
    }

    const value = process.env[variable_name]
    const result = {
      variable_name,
      configured: !!value,
      value_length: value ? value.length : 0,
      value_preview: value ? `${value.substring(0, 10)}...` : null,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Environment variable test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to test environment variable'
    }, { status: 500 })
  }
}
