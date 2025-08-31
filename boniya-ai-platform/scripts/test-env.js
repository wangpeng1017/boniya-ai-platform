#!/usr/bin/env node

/**
 * Environment Variables Test Script
 * Run this script to verify all environment variables are properly configured
 * 
 * Usage: node scripts/test-env.js
 */

const fs = require('fs')
const path = require('path')

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local')
  
  if (!fs.existsSync(envPath)) {
    log('❌ .env.local file not found!', 'red')
    return false
  }

  try {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const envLines = envContent.split('\n')
    
    envLines.forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '')
          process.env[key] = value
        }
      }
    })
    
    log('✅ .env.local file loaded successfully', 'green')
    return true
  } catch (error) {
    log(`❌ Error loading .env.local: ${error.message}`, 'red')
    return false
  }
}

function testEnvironmentVariable(name, validator = null) {
  const value = process.env[name]
  const result = {
    name,
    configured: !!value,
    valid: true,
    error: null,
    valueLength: value ? value.length : 0
  }

  if (!value) {
    result.valid = false
    result.error = 'Not configured'
    return result
  }

  if (validator) {
    try {
      const validationResult = validator(value)
      if (validationResult !== true) {
        result.valid = false
        result.error = validationResult
      }
    } catch (error) {
      result.valid = false
      result.error = error.message
    }
  }

  return result
}

// Validators
const validators = {
  geminiApiKey: (value) => {
    if (!value.startsWith('AIza')) return 'Should start with "AIza"'
    if (value.length < 30) return 'Should be at least 30 characters'
    return true
  },
  
  baiduApiKey: (value) => {
    if (value.length !== 24) return 'Should be exactly 24 characters'
    return true
  },
  
  baiduSecretKey: (value) => {
    if (value.length !== 32) return 'Should be exactly 32 characters'
    return true
  },
  
  postgresUrl: (value) => {
    if (!value.startsWith('postgres://')) return 'Should start with "postgres://"'
    if (!value.includes('@')) return 'Should contain database credentials'
    return true
  },
  
  prismaUrl: (value) => {
    if (!value.startsWith('prisma+postgres://')) return 'Should start with "prisma+postgres://"'
    if (!value.includes('accelerate.prisma-data.net')) return 'Should use Prisma Accelerate'
    return true
  },
  
  nextAuthSecret: (value) => {
    if (value.length < 32) return 'Should be at least 32 characters for security'
    return true
  },
  
  nextAuthUrl: (value) => {
    try {
      new URL(value)
      return true
    } catch {
      return 'Should be a valid URL'
    }
  }
}

function runTests() {
  log('\n🧪 BONIYA AI PLATFORM - ENVIRONMENT VARIABLES TEST', 'bold')
  log('=' * 60, 'blue')
  
  const tests = [
    // Database Configuration
    { name: 'POSTGRES_URL', validator: validators.postgresUrl, category: 'Database' },
    { name: 'PRISMA_DATABASE_URL', validator: validators.prismaUrl, category: 'Database' },
    { name: 'POSTGRES_PRISMA_URL', validator: validators.postgresUrl, category: 'Database' },
    
    // API Keys
    { name: 'GEMINI_API_KEY', validator: validators.geminiApiKey, category: 'API Keys' },
    { name: 'BAIDU_OCR_API_KEY', validator: validators.baiduApiKey, category: 'API Keys' },
    { name: 'BAIDU_OCR_SECRET_KEY', validator: validators.baiduSecretKey, category: 'API Keys' },
    
    // Authentication
    { name: 'NEXTAUTH_SECRET', validator: validators.nextAuthSecret, category: 'Authentication' },
    { name: 'NEXTAUTH_URL', validator: validators.nextAuthUrl, category: 'Authentication' }
  ]

  const results = {}
  let currentCategory = ''

  tests.forEach(test => {
    if (test.category !== currentCategory) {
      currentCategory = test.category
      log(`\n📂 ${currentCategory}:`, 'blue')
    }

    const result = testEnvironmentVariable(test.name, test.validator)
    results[test.name] = result

    const status = result.configured && result.valid ? '✅' : '❌'
    const statusColor = result.configured && result.valid ? 'green' : 'red'
    
    log(`  ${status} ${test.name}`, statusColor)
    
    if (!result.configured) {
      log(`    ⚠️  Not configured`, 'yellow')
    } else if (!result.valid) {
      log(`    ⚠️  ${result.error}`, 'yellow')
    } else {
      log(`    ✓ Valid (${result.valueLength} characters)`, 'green')
    }
  })

  // Summary
  const totalTests = tests.length
  const passedTests = Object.values(results).filter(r => r.configured && r.valid).length
  const failedTests = totalTests - passedTests
  const successRate = Math.round((passedTests / totalTests) * 100)

  log('\n📊 SUMMARY:', 'bold')
  log(`Total Tests: ${totalTests}`, 'blue')
  log(`Passed: ${passedTests}`, 'green')
  log(`Failed: ${failedTests}`, 'red')
  log(`Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red')

  if (successRate === 100) {
    log('\n🎉 All environment variables are properly configured!', 'green')
  } else if (successRate >= 90) {
    log('\n⚠️  Most environment variables are configured, but some need attention.', 'yellow')
  } else {
    log('\n❌ Several environment variables need to be configured before deployment.', 'red')
  }

  log('\n💡 Tips:', 'blue')
  log('  • Copy environment variables from .env.local to Vercel dashboard')
  log('  • Test API endpoints: /api/test-env (GET) for full test')
  log('  • Check database connectivity after deployment')
  
  return successRate === 100
}

// Main execution
function main() {
  log('🚀 Starting environment variables test...', 'blue')
  
  if (!loadEnvFile()) {
    process.exit(1)
  }
  
  const success = runTests()
  process.exit(success ? 0 : 1)
}

if (require.main === module) {
  main()
}

module.exports = { testEnvironmentVariable, validators }
