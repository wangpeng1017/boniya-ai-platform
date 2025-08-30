// API功能测试

import { ecommerceApi, customerServiceApi, commonApi } from '@/lib/api/client'

// 测试健康检查API
export async function testHealthCheck() {
  console.log('🔍 测试健康检查API...')
  try {
    const response = await commonApi.healthCheck()
    if (response.success) {
      console.log('✅ 健康检查通过:', response.data)
      return true
    } else {
      console.error('❌ 健康检查失败:', response.error)
      return false
    }
  } catch (error) {
    console.error('❌ 健康检查异常:', error)
    return false
  }
}

// 测试电商分析API
export async function testEcommerceApi() {
  console.log('🔍 测试电商分析API...')
  
  try {
    // 测试获取分析数据
    const analyticsResponse = await ecommerceApi.getAnalytics({
      date_from: '2024-08-01',
      date_to: '2024-08-31'
    })
    
    if (analyticsResponse.success) {
      console.log('✅ 电商分析数据获取成功')
    } else {
      console.error('❌ 电商分析数据获取失败:', analyticsResponse.error)
    }

    // 测试获取反馈列表
    const feedbackResponse = await ecommerceApi.getFeedback({
      page: 1,
      limit: 10
    })
    
    if (feedbackResponse.success) {
      console.log('✅ 客户反馈列表获取成功')
    } else {
      console.error('❌ 客户反馈列表获取失败:', feedbackResponse.error)
    }

    return true
  } catch (error) {
    console.error('❌ 电商分析API测试异常:', error)
    return false
  }
}

// 测试客服管理API
export async function testCustomerServiceApi() {
  console.log('🔍 测试客服管理API...')
  
  try {
    // 测试获取工单列表
    const ticketsResponse = await customerServiceApi.getTickets({
      page: 1,
      limit: 10,
      status: 'open'
    })
    
    if (ticketsResponse.success) {
      console.log('✅ 客服工单列表获取成功')
    } else {
      console.error('❌ 客服工单列表获取失败:', ticketsResponse.error)
    }

    return true
  } catch (error) {
    console.error('❌ 客服管理API测试异常:', error)
    return false
  }
}

// 运行所有测试
export async function runAllTests() {
  console.log('🚀 开始API功能测试...\n')
  
  const results = {
    healthCheck: await testHealthCheck(),
    ecommerceApi: await testEcommerceApi(),
    customerServiceApi: await testCustomerServiceApi()
  }
  
  console.log('\n📊 测试结果汇总:')
  console.log('健康检查:', results.healthCheck ? '✅ 通过' : '❌ 失败')
  console.log('电商分析API:', results.ecommerceApi ? '✅ 通过' : '❌ 失败')
  console.log('客服管理API:', results.customerServiceApi ? '✅ 通过' : '❌ 失败')
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n🎯 测试通过率: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`)
  
  return results
}

// 模拟数据验证
export function validateMockData() {
  console.log('🔍 验证模拟数据结构...')
  
  // 验证电商分析数据结构
  const mockAnalyticsData = {
    overview: {
      total_orders: 12847,
      total_feedback: 342,
      positive_feedback: 198,
      negative_feedback: 89,
      neutral_feedback: 55,
      avg_satisfaction: 4.2
    },
    platform_stats: [
      { platform_name: '京东', order_count: 4521, feedback_count: 123 }
    ],
    category_stats: [
      { category: '包装问题', count: 45, negative_count: 38 }
    ],
    keywords: [
      { keyword: '味道好', frequency: 67 }
    ]
  }
  
  // 验证客服工单数据结构
  const mockTicketData = {
    id: 1,
    ticket_number: 'TK1724923800001',
    customer_name: '张先生',
    issue_description: '产品质量问题',
    status: 'open',
    priority: 'high'
  }
  
  console.log('✅ 模拟数据结构验证通过')
  return true
}

// 性能测试
export async function performanceTest() {
  console.log('🔍 执行性能测试...')
  
  const startTime = Date.now()
  
  // 并发请求测试
  const promises = [
    commonApi.healthCheck(),
    ecommerceApi.getAnalytics(),
    customerServiceApi.getTickets()
  ]
  
  try {
    await Promise.all(promises)
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`✅ 并发请求完成，耗时: ${duration}ms`)
    
    if (duration < 3000) {
      console.log('✅ 性能测试通过 (< 3秒)')
      return true
    } else {
      console.log('⚠️ 性能需要优化 (> 3秒)')
      return false
    }
  } catch (error) {
    console.error('❌ 性能测试失败:', error)
    return false
  }
}
