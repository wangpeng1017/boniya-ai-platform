import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

// 门店运营标准化管理API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      action,
      store_id,
      inspection_data,
      camera_config,
      alert_settings
    } = body

    let result

    switch (action) {
      case 'start_monitoring':
        result = await startStoreMonitoring(store_id, camera_config)
        break
      case 'record_inspection':
        result = await recordInspection(inspection_data)
        break
      case 'configure_alerts':
        result = await configureAlerts(alert_settings)
        break
      case 'generate_report':
        result = await generateComplianceReport(store_id)
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
    console.error('门店运营管理操作失败:', error)
    return NextResponse.json(
      { success: false, error: '门店运营管理操作失败' },
      { status: 500 }
    )
  }
}

// 获取门店运营数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const store_id = searchParams.get('store_id')
    const data_type = searchParams.get('data_type') || 'dashboard'
    const date_range = searchParams.get('date_range') || '7'

    let result

    switch (data_type) {
      case 'dashboard':
        result = await getStoreDashboard(store_id || 'default', date_range)
        break
      case 'inspections':
        result = await getInspectionRecords(store_id || 'default', date_range)
        break
      case 'compliance':
        result = await getComplianceMetrics(store_id || 'default', date_range)
        break
      case 'alerts':
        result = await getAlertHistory(store_id || 'default', date_range)
        break
      default:
        result = await getStoreDashboard(store_id || 'default', date_range)
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('获取门店运营数据失败:', error)
    return NextResponse.json(
      { success: false, error: '获取门店运营数据失败' },
      { status: 500 }
    )
  }
}

// 开始门店监控
async function startStoreMonitoring(storeId: string, cameraConfig: any) {
  // 模拟启动监控系统
  const monitoringSession = {
    session_id: `MON_${Date.now()}`,
    store_id: storeId,
    camera_count: cameraConfig.cameras?.length || 0,
    monitoring_areas: cameraConfig.areas || [],
    start_time: new Date().toISOString(),
    status: 'active'
  }

  // 保存监控会话
  await sql`
    INSERT INTO store_monitoring_sessions (
      session_id, store_id, camera_config, status, created_at
    ) VALUES (
      ${monitoringSession.session_id}, ${storeId}, 
      ${JSON.stringify(cameraConfig)}, 'active', CURRENT_TIMESTAMP
    )
  `

  return {
    ...monitoringSession,
    message: '门店监控已启动',
    monitoring_features: [
      '员工着装检测',
      '商品陈列监控',
      '客流量统计',
      '安全区域监控'
    ]
  }
}

// 记录检查结果
async function recordInspection(inspectionData: any) {
  const {
    store_id,
    inspector_name,
    inspection_type,
    checklist_items,
    overall_score,
    notes,
    photos
  } = inspectionData

  const result = await sql`
    INSERT INTO store_inspections (
      store_id, inspector_name, inspection_type, checklist_items,
      overall_score, notes, photos, created_at
    ) VALUES (
      ${store_id}, ${inspector_name}, ${inspection_type}, 
      ${JSON.stringify(checklist_items)}, ${overall_score}, 
      ${notes}, ${JSON.stringify(photos)}, CURRENT_TIMESTAMP
    ) RETURNING id
  `

  const inspectionId = result.rows[0].id

  // 分析检查结果
  const analysis = analyzeInspectionResults(checklist_items, overall_score)

  return {
    inspection_id: inspectionId,
    overall_score,
    analysis,
    recommendations: analysis.recommendations,
    next_inspection_date: analysis.next_inspection_date
  }
}

// 配置预警设置
async function configureAlerts(alertSettings: any) {
  const {
    store_id,
    alert_types,
    thresholds,
    notification_channels,
    escalation_rules
  } = alertSettings

  await sql`
    INSERT INTO store_alert_configs (
      store_id, alert_types, thresholds, notification_channels,
      escalation_rules, created_at, updated_at
    ) VALUES (
      ${store_id}, ${JSON.stringify(alert_types)}, ${JSON.stringify(thresholds)},
      ${JSON.stringify(notification_channels)}, ${JSON.stringify(escalation_rules)},
      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    ON CONFLICT (store_id) 
    DO UPDATE SET 
      alert_types = ${JSON.stringify(alert_types)},
      thresholds = ${JSON.stringify(thresholds)},
      notification_channels = ${JSON.stringify(notification_channels)},
      escalation_rules = ${JSON.stringify(escalation_rules)},
      updated_at = CURRENT_TIMESTAMP
  `

  return {
    message: '预警配置已更新',
    active_alerts: alert_types.length,
    monitoring_areas: Object.keys(thresholds).length,
    notification_methods: notification_channels.length
  }
}

// 生成合规报告
async function generateComplianceReport(storeId: string) {
  // 获取最近的检查数据
  const inspections = await sql`
    SELECT * FROM store_inspections 
    WHERE store_id = ${storeId}
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    ORDER BY created_at DESC
  `

  // 获取监控数据
  const monitoringData = await sql`
    SELECT * FROM store_monitoring_sessions 
    WHERE store_id = ${storeId}
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
  `

  const report = {
    store_id: storeId,
    report_period: '最近30天',
    generated_at: new Date().toISOString(),
    compliance_summary: {
      total_inspections: inspections.rows.length,
      avg_score: inspections.rows.length > 0 ? 
        inspections.rows.reduce((sum, i) => sum + i.overall_score, 0) / inspections.rows.length : 0,
      compliance_rate: calculateComplianceRate(inspections.rows),
      improvement_trend: calculateTrend(inspections.rows)
    },
    key_metrics: {
      staff_compliance: generateRandomMetric(85, 95),
      product_display: generateRandomMetric(80, 90),
      cleanliness: generateRandomMetric(90, 98),
      safety_protocols: generateRandomMetric(88, 95)
    },
    violations: extractViolations(inspections.rows),
    recommendations: generateRecommendations(inspections.rows),
    monitoring_coverage: {
      total_hours: monitoringData.rows.length * 8, // 假设每次8小时
      alert_count: generateRandomNumber(5, 20),
      resolution_rate: generateRandomMetric(85, 95)
    }
  }

  return report
}

// 获取门店仪表板
async function getStoreDashboard(storeId: string, dateRange: string) {
  const days = parseInt(dateRange)
  
  // 模拟仪表板数据
  const dashboard = {
    store_info: {
      store_id: storeId,
      store_name: `门店${storeId}`,
      location: '北京市朝阳区',
      manager: '张经理'
    },
    current_status: {
      monitoring_active: true,
      cameras_online: generateRandomNumber(8, 12),
      total_cameras: 12,
      last_inspection: '2024-03-25',
      overall_compliance: generateRandomMetric(85, 95)
    },
    daily_metrics: generateDailyMetrics(days),
    compliance_trends: generateComplianceTrends(days),
    recent_alerts: generateRecentAlerts(),
    performance_indicators: {
      staff_compliance: generateRandomMetric(85, 95),
      product_standards: generateRandomMetric(80, 90),
      cleanliness_score: generateRandomMetric(90, 98),
      customer_satisfaction: generateRandomMetric(88, 95)
    }
  }

  return dashboard
}

// 获取检查记录
async function getInspectionRecords(storeId: string, dateRange: string) {
  try {
    const result = await sql`
      SELECT * FROM store_inspections 
      WHERE store_id = ${storeId}
      AND created_at >= CURRENT_DATE - INTERVAL '${dateRange} days'
      ORDER BY created_at DESC
    `

    return {
      inspections: result.rows,
      summary: {
        total_inspections: result.rows.length,
        avg_score: result.rows.length > 0 ? 
          result.rows.reduce((sum, i) => sum + i.overall_score, 0) / result.rows.length : 0,
        latest_inspection: result.rows[0] || null
      }
    }
  } catch (error) {
    return {
      inspections: [],
      summary: { total_inspections: 0, avg_score: 0, latest_inspection: null }
    }
  }
}

// 获取合规指标
async function getComplianceMetrics(storeId: string, dateRange: string) {
  return {
    compliance_categories: [
      { category: '员工着装', score: generateRandomMetric(85, 95), trend: 'up' },
      { category: '商品陈列', score: generateRandomMetric(80, 90), trend: 'stable' },
      { category: '环境卫生', score: generateRandomMetric(90, 98), trend: 'up' },
      { category: '安全规范', score: generateRandomMetric(88, 95), trend: 'down' }
    ],
    violation_types: [
      { type: '着装不规范', count: generateRandomNumber(2, 8), severity: 'medium' },
      { type: '商品摆放错误', count: generateRandomNumber(1, 5), severity: 'low' },
      { type: '清洁不及时', count: generateRandomNumber(0, 3), severity: 'low' }
    ],
    improvement_areas: [
      '加强员工培训',
      '优化商品陈列标准',
      '提高清洁频率'
    ]
  }
}

// 获取预警历史
async function getAlertHistory(storeId: string, dateRange: string) {
  return {
    alerts: generateAlertHistory(parseInt(dateRange)),
    alert_summary: {
      total_alerts: generateRandomNumber(10, 30),
      resolved_alerts: generateRandomNumber(8, 25),
      pending_alerts: generateRandomNumber(0, 5),
      avg_resolution_time: '2.5小时'
    }
  }
}

// 辅助函数
function analyzeInspectionResults(checklistItems: any[], overallScore: number) {
  const failedItems = checklistItems.filter(item => !item.passed)
  
  return {
    passed_items: checklistItems.length - failedItems.length,
    failed_items: failedItems.length,
    compliance_rate: ((checklistItems.length - failedItems.length) / checklistItems.length * 100).toFixed(1),
    critical_issues: failedItems.filter(item => item.severity === 'high'),
    recommendations: failedItems.map(item => `改进${item.category}: ${item.description}`),
    next_inspection_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
}

function calculateComplianceRate(inspections: any[]) {
  if (inspections.length === 0) return 0
  const passedInspections = inspections.filter(i => i.overall_score >= 80).length
  return (passedInspections / inspections.length * 100).toFixed(1)
}

function calculateTrend(inspections: any[]) {
  if (inspections.length < 2) return 'stable'
  const recent = inspections.slice(0, Math.ceil(inspections.length / 2))
  const earlier = inspections.slice(Math.ceil(inspections.length / 2))
  
  const recentAvg = recent.reduce((sum, i) => sum + i.overall_score, 0) / recent.length
  const earlierAvg = earlier.reduce((sum, i) => sum + i.overall_score, 0) / earlier.length
  
  if (recentAvg > earlierAvg + 5) return 'improving'
  if (recentAvg < earlierAvg - 5) return 'declining'
  return 'stable'
}

function extractViolations(inspections: any[]) {
  return [
    { type: '员工着装不规范', count: generateRandomNumber(2, 8), severity: 'medium' },
    { type: '商品陈列不当', count: generateRandomNumber(1, 5), severity: 'low' },
    { type: '清洁标准未达标', count: generateRandomNumber(0, 3), severity: 'low' }
  ]
}

function generateRecommendations(inspections: any[]) {
  return [
    '加强员工着装规范培训',
    '完善商品陈列标准化流程',
    '提高日常清洁检查频率',
    '建立奖惩机制提升执行力'
  ]
}

function generateRandomMetric(min: number, max: number) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1))
}

function generateRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateDailyMetrics(days: number) {
  const metrics = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    metrics.push({
      date: date.toISOString().split('T')[0],
      compliance_score: generateRandomMetric(80, 95),
      violations: generateRandomNumber(0, 5),
      inspections: generateRandomNumber(1, 3)
    })
  }
  return metrics
}

function generateComplianceTrends(days: number) {
  return {
    staff_compliance: generateTrendData(days, 85, 95),
    product_display: generateTrendData(days, 80, 90),
    cleanliness: generateTrendData(days, 90, 98),
    safety: generateTrendData(days, 88, 95)
  }
}

function generateTrendData(days: number, min: number, max: number) {
  const data = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      value: generateRandomMetric(min, max)
    })
  }
  return data
}

function generateRecentAlerts() {
  return [
    {
      id: 1,
      type: '员工着装',
      message: '检测到员工未佩戴工牌',
      severity: 'medium',
      time: '2小时前',
      status: 'resolved'
    },
    {
      id: 2,
      type: '商品陈列',
      message: '货架商品摆放不整齐',
      severity: 'low',
      time: '4小时前',
      status: 'pending'
    }
  ]
}

function generateAlertHistory(days: number) {
  const alerts = []
  for (let i = 0; i < days * 2; i++) {
    const date = new Date()
    date.setHours(date.getHours() - i * 12)
    alerts.push({
      id: i + 1,
      type: ['员工着装', '商品陈列', '环境卫生', '安全规范'][Math.floor(Math.random() * 4)],
      message: '检测到违规行为',
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      time: date.toISOString(),
      status: Math.random() > 0.2 ? 'resolved' : 'pending'
    })
  }
  return alerts
}
