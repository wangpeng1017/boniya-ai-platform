#!/usr/bin/env node

/**
 * Vercel部署配置验证脚本
 * 验证项目结构和配置文件是否正确
 */

const fs = require('fs')
const path = require('path')

// 颜色输出
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

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath)
  const status = exists ? '✅' : '❌'
  const statusColor = exists ? 'green' : 'red'
  
  log(`  ${status} ${description}: ${filePath}`, statusColor)
  return exists
}

function checkDirectoryStructure() {
  log('\n📁 检查项目结构:', 'blue')
  
  const checks = [
    { path: 'boniya-ai-platform', desc: '项目根目录' },
    { path: 'boniya-ai-platform/package.json', desc: 'Package.json文件' },
    { path: 'boniya-ai-platform/next.config.ts', desc: 'Next.js配置文件' },
    { path: 'boniya-ai-platform/src', desc: '源代码目录' },
    { path: 'boniya-ai-platform/src/app', desc: 'App Router目录' },
    { path: 'boniya-ai-platform/src/app/api', desc: 'API路由目录' },
    { path: 'vercel.json', desc: 'Vercel配置文件' }
  ]
  
  let allPassed = true
  checks.forEach(check => {
    const passed = checkFileExists(check.path, check.desc)
    if (!passed) allPassed = false
  })
  
  return allPassed
}

function checkVercelConfig() {
  log('\n⚙️ 检查Vercel配置:', 'blue')
  
  try {
    const vercelConfigPath = 'vercel.json'
    if (!fs.existsSync(vercelConfigPath)) {
      log('  ❌ vercel.json文件不存在', 'red')
      return false
    }
    
    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'))
    
    // 检查必需的配置项
    const requiredFields = ['framework', 'buildCommand', 'outputDirectory', 'installCommand']
    let configValid = true
    
    requiredFields.forEach(field => {
      if (config[field]) {
        log(`  ✅ ${field}: ${config[field]}`, 'green')
      } else {
        log(`  ❌ 缺少必需字段: ${field}`, 'red')
        configValid = false
      }
    })
    
    // 检查是否有无效的functions配置
    if (config.functions) {
      log('  ⚠️ 检测到functions配置，可能导致路径匹配问题', 'yellow')
      Object.keys(config.functions).forEach(pattern => {
        log(`    - ${pattern}`, 'yellow')
      })
      log('  💡 建议：移除functions配置，让Vercel自动检测API路由', 'blue')
    } else {
      log('  ✅ 未配置functions，将使用自动检测', 'green')
    }
    
    return configValid
    
  } catch (error) {
    log(`  ❌ vercel.json解析错误: ${error.message}`, 'red')
    return false
  }
}

function checkAPIRoutes() {
  log('\n🔌 检查API路由:', 'blue')
  
  const apiDir = 'boniya-ai-platform/src/app/api'
  if (!fs.existsSync(apiDir)) {
    log('  ❌ API目录不存在', 'red')
    return false
  }
  
  try {
    const apiRoutes = []
    
    function scanDirectory(dir, basePath = '') {
      const items = fs.readdirSync(dir)
      
      items.forEach(item => {
        const itemPath = path.join(dir, item)
        const stat = fs.statSync(itemPath)
        
        if (stat.isDirectory()) {
          scanDirectory(itemPath, path.join(basePath, item))
        } else if (item === 'route.ts' || item === 'route.js') {
          apiRoutes.push(path.join(basePath, item))
        }
      })
    }
    
    scanDirectory(apiDir)
    
    if (apiRoutes.length === 0) {
      log('  ⚠️ 未找到API路由文件', 'yellow')
      return false
    }
    
    log(`  ✅ 找到 ${apiRoutes.length} 个API路由:`, 'green')
    apiRoutes.forEach(route => {
      log(`    - /api/${route.replace(/\\/g, '/').replace('/route.ts', '').replace('/route.js', '')}`, 'green')
    })
    
    return true
    
  } catch (error) {
    log(`  ❌ 扫描API路由时出错: ${error.message}`, 'red')
    return false
  }
}

function checkPackageJson() {
  log('\n📦 检查Package.json:', 'blue')
  
  try {
    const packagePath = 'boniya-ai-platform/package.json'
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    
    // 检查Next.js依赖
    const nextVersion = packageJson.dependencies?.next
    if (nextVersion) {
      log(`  ✅ Next.js版本: ${nextVersion}`, 'green')
    } else {
      log('  ❌ 未找到Next.js依赖', 'red')
      return false
    }
    
    // 检查构建脚本
    const buildScript = packageJson.scripts?.build
    if (buildScript) {
      log(`  ✅ 构建脚本: ${buildScript}`, 'green')
    } else {
      log('  ❌ 未找到构建脚本', 'red')
      return false
    }
    
    // 检查关键依赖
    const keyDeps = ['react', 'react-dom', '@vercel/postgres']
    keyDeps.forEach(dep => {
      if (packageJson.dependencies?.[dep]) {
        log(`  ✅ ${dep}: ${packageJson.dependencies[dep]}`, 'green')
      } else {
        log(`  ⚠️ 未找到依赖: ${dep}`, 'yellow')
      }
    })
    
    return true
    
  } catch (error) {
    log(`  ❌ Package.json检查失败: ${error.message}`, 'red')
    return false
  }
}

function generateRecommendations(results) {
  log('\n💡 部署建议:', 'blue')
  
  if (results.structure && results.vercelConfig && results.apiRoutes && results.packageJson) {
    log('  🎉 所有检查都通过了！项目应该能够成功部署到Vercel', 'green')
    log('\n📋 部署清单:', 'blue')
    log('  1. ✅ 项目结构正确', 'green')
    log('  2. ✅ Vercel配置有效', 'green')
    log('  3. ✅ API路由可检测', 'green')
    log('  4. ✅ Package.json配置正确', 'green')
    log('\n🚀 可以安全地推送到GitHub进行部署！', 'green')
  } else {
    log('  ⚠️ 发现一些问题需要修复:', 'yellow')
    
    if (!results.structure) {
      log('  - 修复项目结构问题', 'red')
    }
    if (!results.vercelConfig) {
      log('  - 修复vercel.json配置', 'red')
    }
    if (!results.apiRoutes) {
      log('  - 检查API路由文件', 'red')
    }
    if (!results.packageJson) {
      log('  - 修复package.json配置', 'red')
    }
    
    log('\n🔧 建议的修复步骤:', 'blue')
    log('  1. 确保所有文件都在正确位置', 'blue')
    log('  2. 验证vercel.json语法正确', 'blue')
    log('  3. 确认API路由文件存在', 'blue')
    log('  4. 检查package.json依赖完整', 'blue')
  }
}

function main() {
  log('🔍 VERCEL部署配置验证', 'bold')
  log('=' * 50, 'blue')
  
  const results = {
    structure: checkDirectoryStructure(),
    vercelConfig: checkVercelConfig(),
    apiRoutes: checkAPIRoutes(),
    packageJson: checkPackageJson()
  }
  
  generateRecommendations(results)
  
  const allPassed = Object.values(results).every(result => result)
  process.exit(allPassed ? 0 : 1)
}

if (require.main === module) {
  main()
}

module.exports = { checkDirectoryStructure, checkVercelConfig, checkAPIRoutes, checkPackageJson }
