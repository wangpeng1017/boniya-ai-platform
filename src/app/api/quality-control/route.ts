import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

// 产品品质智能控制API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      action,
      inspection_data,
      image_data,
      batch_info,
      defect_training_data
    } = body

    let result

    switch (action) {
      case 'visual_inspection':
        result = await performVisualInspection(image_data, batch_info)
        break
      case 'batch_quality_check':
        result = await performBatchQualityCheck(inspection_data)
        break
      case 'train_defect_model':
        result = await trainDefectDetectionModel(defect_training_data)
        break
      case 'quality_report':
        result = await generateQualityReport(batch_info)
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
    console.error('品质控制操作失败:', error)
    return NextResponse.json(
      { success: false, error: '品质控制操作失败' },
      { status: 500 }
    )
  }
}

// 获取品质控制数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const data_type = searchParams.get('data_type') || 'dashboard'
    const batch_id = searchParams.get('batch_id')
    const date_range = searchParams.get('date_range') || '7'

    let result

    switch (data_type) {
      case 'dashboard':
        result = await getQualityDashboard(date_range)
        break
      case 'inspections':
        result = await getInspectionHistory(batch_id || undefined, date_range)
        break
      case 'defects':
        result = await getDefectAnalysis(date_range)
        break
      case 'models':
        result = await getModelPerformance()
        break
      default:
        result = await getQualityDashboard(date_range)
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('获取品质控制数据失败:', error)
    return NextResponse.json(
      { success: false, error: '获取品质控制数据失败' },
      { status: 500 }
    )
  }
}

// 视觉检测
async function performVisualInspection(imageData: any, batchInfo: any) {
  // 模拟AI视觉检测
  await new Promise(resolve => setTimeout(resolve, 2000))

  const mockDetectionResult = {
    inspection_id: `QC_${Date.now()}`,
    batch_id: batchInfo.batch_id,
    product_type: batchInfo.product_type,
    inspection_time: new Date().toISOString(),
    overall_quality: 'pass', // pass, warning, fail
    confidence_score: 0.94,
    detected_defects: [
      {
        defect_type: '包装破损',
        severity: 'low',
        location: { x: 120, y: 80, width: 30, height: 25 },
        confidence: 0.87
      }
    ],
    quality_metrics: {
      color_consistency: 0.96,
      shape_accuracy: 0.98,
      surface_quality: 0.92,
      packaging_integrity: 0.89
    },
    recommendations: [
      '检查包装工艺',
      '调整生产参数',
      '加强质量监控'
    ]
  }

  // 保存检测结果
  await sql`
    INSERT INTO quality_inspections (
      inspection_id, batch_id, product_type, inspection_result,
      overall_quality, confidence_score, created_at
    ) VALUES (
      ${mockDetectionResult.inspection_id}, ${batchInfo.batch_id},
      ${batchInfo.product_type}, ${JSON.stringify(mockDetectionResult)},
      ${mockDetectionResult.overall_quality}, ${mockDetectionResult.confidence_score},
      CURRENT_TIMESTAMP
    )
  `

  return mockDetectionResult
}

// 批次质量检查
async function performBatchQualityCheck(inspectionData: any) {
  const {
    batch_id,
    product_type,
    sample_size,
    inspection_criteria,
    inspector_name
  } = inspectionData

  // 模拟批次检查
  const sampleResults = []
  for (let i = 0; i < sample_size; i++) {
    sampleResults.push({
      sample_id: `${batch_id}_${i + 1}`,
      quality_score: Math.random() * 20 + 80, // 80-100分
      defects_found: Math.random() > 0.8 ? ['轻微瑕疵'] : [],
      pass: Math.random() > 0.1 // 90%通过率
    })
  }

  const passedSamples = sampleResults.filter(s => s.pass).length
  const batchQuality = {
    batch_id,
    inspection_date: new Date().toISOString(),
    inspector_name,
    sample_size,
    passed_samples: passedSamples,
    pass_rate: (passedSamples / sample_size * 100).toFixed(1),
    avg_quality_score: (sampleResults.reduce((sum, s) => sum + s.quality_score, 0) / sample_size).toFixed(1),
    batch_status: passedSamples / sample_size >= 0.95 ? 'approved' : 'rejected',
    sample_results: sampleResults,
    recommendations: generateQualityRecommendations(sampleResults)
  }

  // 保存批次检查结果
  await sql`
    INSERT INTO batch_quality_checks (
      batch_id, product_type, inspector_name, sample_size,
      pass_rate, avg_quality_score, batch_status, inspection_result,
      created_at
    ) VALUES (
      ${batch_id}, ${product_type}, ${inspector_name}, ${sample_size},
      ${parseFloat(batchQuality.pass_rate)}, ${parseFloat(batchQuality.avg_quality_score)},
      ${batchQuality.batch_status}, ${JSON.stringify(batchQuality)},
      CURRENT_TIMESTAMP
    )
  `

  return batchQuality
}

// 训练缺陷检测模型
async function trainDefectDetectionModel(trainingData: any) {
  const {
    model_name,
    defect_categories,
    training_images,
    validation_split
  } = trainingData

  // 模拟模型训练过程
  const trainingResult = {
    model_id: `MODEL_${Date.now()}`,
    model_name,
    training_status: 'completed',
    training_duration: '2小时15分钟',
    dataset_size: training_images.length,
    validation_split,
    performance_metrics: {
      accuracy: 0.94,
      precision: 0.92,
      recall: 0.89,
      f1_score: 0.90
    },
    defect_categories: defect_categories.map((cat: string) => ({
      category: cat,
      detection_accuracy: Math.random() * 0.1 + 0.85
    })),
    model_file_path: `/models/${model_name}_${Date.now()}.pkl`,
    deployment_ready: true
  }

  // 保存模型信息
  await sql`
    INSERT INTO quality_models (
      model_id, model_name, defect_categories, performance_metrics,
      model_file_path, training_status, created_at
    ) VALUES (
      ${trainingResult.model_id}, ${model_name}, ${JSON.stringify(defect_categories)},
      ${JSON.stringify(trainingResult.performance_metrics)}, ${trainingResult.model_file_path},
      ${trainingResult.training_status}, CURRENT_TIMESTAMP
    )
  `

  return trainingResult
}

// 生成质量报告
async function generateQualityReport(batchInfo: any) {
  const { batch_id, date_range } = batchInfo

  // 获取相关数据
  const inspections = await sql`
    SELECT * FROM quality_inspections 
    WHERE batch_id = ${batch_id} OR created_at >= CURRENT_DATE - INTERVAL '${date_range || 7} days'
    ORDER BY created_at DESC
  `

  const batchChecks = await sql`
    SELECT * FROM batch_quality_checks 
    WHERE batch_id = ${batch_id} OR created_at >= CURRENT_DATE - INTERVAL '${date_range || 7} days'
    ORDER BY created_at DESC
  `

  const report = {
    report_id: `QR_${Date.now()}`,
    batch_id,
    report_period: `最近${date_range || 7}天`,
    generated_at: new Date().toISOString(),
    summary: {
      total_inspections: inspections.rows.length,
      total_batches: batchChecks.rows.length,
      overall_pass_rate: calculateOverallPassRate(inspections.rows, batchChecks.rows),
      avg_quality_score: calculateAvgQualityScore(batchChecks.rows),
      defect_rate: calculateDefectRate(inspections.rows)
    },
    quality_trends: generateQualityTrends(inspections.rows, batchChecks.rows),
    defect_analysis: analyzeDefects(inspections.rows),
    batch_performance: analyzeBatchPerformance(batchChecks.rows),
    recommendations: generateQualityImprovementRecommendations(inspections.rows, batchChecks.rows)
  }

  return report
}

// 获取质量仪表板
async function getQualityDashboard(dateRange: string) {
  const days = parseInt(dateRange)
  
  return {
    overview: {
      total_inspections: generateRandomNumber(100, 500),
      pass_rate: generateRandomMetric(92, 98),
      defect_rate: generateRandomMetric(1, 5),
      avg_quality_score: generateRandomMetric(85, 95),
      active_models: generateRandomNumber(3, 8)
    },
    daily_metrics: generateDailyQualityMetrics(days),
    defect_categories: [
      { category: '包装破损', count: generateRandomNumber(5, 20), trend: 'down' },
      { category: '颜色异常', count: generateRandomNumber(2, 10), trend: 'stable' },
      { category: '形状不规则', count: generateRandomNumber(1, 8), trend: 'up' },
      { category: '表面瑕疵', count: generateRandomNumber(3, 15), trend: 'down' }
    ],
    model_performance: [
      { model: '包装检测模型', accuracy: 0.94, status: 'active' },
      { model: '颜色检测模型', accuracy: 0.91, status: 'active' },
      { model: '形状检测模型', accuracy: 0.88, status: 'training' }
    ],
    recent_alerts: [
      {
        type: '质量异常',
        message: '批次QC202403251234检测到异常',
        severity: 'high',
        time: '1小时前'
      },
      {
        type: '模型性能',
        message: '包装检测模型准确率下降',
        severity: 'medium',
        time: '3小时前'
      }
    ]
  }
}

// 获取检测历史
async function getInspectionHistory(batchId: string | undefined, dateRange: string) {
  try {
    let whereClause = `WHERE created_at >= CURRENT_DATE - INTERVAL '${dateRange} days'`
    if (batchId) {
      whereClause += ` AND batch_id = '${batchId}'`
    }

    const result = await sql.query(`
      SELECT * FROM quality_inspections 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT 50
    `)

    return {
      inspections: result.rows,
      summary: {
        total_inspections: result.rows.length,
        pass_rate: calculatePassRate(result.rows),
        avg_confidence: calculateAvgConfidence(result.rows)
      }
    }
  } catch (error) {
    return {
      inspections: [],
      summary: { total_inspections: 0, pass_rate: 0, avg_confidence: 0 }
    }
  }
}

// 获取缺陷分析
async function getDefectAnalysis(dateRange: string) {
  return {
    defect_summary: [
      { type: '包装破损', count: generateRandomNumber(10, 50), severity: 'medium' },
      { type: '颜色异常', count: generateRandomNumber(5, 25), severity: 'low' },
      { type: '形状不规则', count: generateRandomNumber(3, 20), severity: 'high' },
      { type: '表面瑕疵', count: generateRandomNumber(8, 30), severity: 'medium' }
    ],
    defect_trends: generateDefectTrends(parseInt(dateRange)),
    root_cause_analysis: [
      { cause: '生产工艺问题', percentage: 35 },
      { cause: '原材料质量', percentage: 28 },
      { cause: '设备老化', percentage: 22 },
      { cause: '人为操作', percentage: 15 }
    ],
    improvement_suggestions: [
      '优化生产工艺流程',
      '加强原材料质量控制',
      '定期维护检测设备',
      '提升操作人员技能'
    ]
  }
}

// 获取模型性能
async function getModelPerformance() {
  return {
    active_models: [
      {
        model_id: 'MODEL_001',
        name: '包装检测模型',
        accuracy: 0.94,
        precision: 0.92,
        recall: 0.89,
        last_updated: '2024-03-20',
        status: 'active'
      },
      {
        model_id: 'MODEL_002',
        name: '颜色检测模型',
        accuracy: 0.91,
        precision: 0.88,
        recall: 0.93,
        last_updated: '2024-03-18',
        status: 'active'
      }
    ],
    performance_trends: generateModelPerformanceTrends(),
    training_history: [
      { date: '2024-03-20', model: '包装检测模型', accuracy: 0.94, duration: '2.5小时' },
      { date: '2024-03-18', model: '颜色检测模型', accuracy: 0.91, duration: '1.8小时' }
    ]
  }
}

// 辅助函数
function generateQualityRecommendations(sampleResults: any[]) {
  const failedSamples = sampleResults.filter(s => !s.pass)
  if (failedSamples.length === 0) {
    return ['质量良好，继续保持当前标准']
  }
  
  return [
    '加强生产过程监控',
    '检查原材料质量',
    '调整生产工艺参数',
    '增加质检频率'
  ]
}

function calculateOverallPassRate(inspections: any[], batchChecks: any[]) {
  const totalItems = inspections.length + batchChecks.length
  if (totalItems === 0) return 0
  
  const passedInspections = inspections.filter(i => i.overall_quality === 'pass').length
  const passedBatches = batchChecks.filter(b => b.batch_status === 'approved').length
  
  return ((passedInspections + passedBatches) / totalItems * 100).toFixed(1)
}

function calculateAvgQualityScore(batchChecks: any[]) {
  if (batchChecks.length === 0) return 0
  const totalScore = batchChecks.reduce((sum, b) => sum + parseFloat(b.avg_quality_score || 0), 0)
  return (totalScore / batchChecks.length).toFixed(1)
}

function calculateDefectRate(inspections: any[]) {
  if (inspections.length === 0) return 0
  const defectiveItems = inspections.filter(i => 
    i.inspection_result && JSON.parse(i.inspection_result).detected_defects?.length > 0
  ).length
  return (defectiveItems / inspections.length * 100).toFixed(1)
}

function generateQualityTrends(inspections: any[], batchChecks: any[]) {
  // 生成模拟趋势数据
  return {
    daily_pass_rate: generateTrendData(7, 90, 98),
    defect_rate: generateTrendData(7, 1, 5),
    quality_score: generateTrendData(7, 85, 95)
  }
}

function analyzeDefects(inspections: any[]) {
  return {
    top_defects: [
      { type: '包装破损', count: generateRandomNumber(5, 20) },
      { type: '颜色异常', count: generateRandomNumber(2, 10) },
      { type: '形状不规则', count: generateRandomNumber(1, 8) }
    ],
    severity_distribution: {
      high: generateRandomNumber(1, 5),
      medium: generateRandomNumber(5, 15),
      low: generateRandomNumber(10, 25)
    }
  }
}

function analyzeBatchPerformance(batchChecks: any[]) {
  return {
    avg_pass_rate: generateRandomMetric(90, 98),
    best_performing_batch: `BATCH_${Date.now() - 86400000}`,
    worst_performing_batch: `BATCH_${Date.now() - 172800000}`,
    quality_consistency: generateRandomMetric(85, 95)
  }
}

function generateQualityImprovementRecommendations(inspections: any[], batchChecks: any[]) {
  return [
    '优化生产工艺参数',
    '加强原材料质量控制',
    '提升检测设备精度',
    '完善质量管理体系',
    '加强员工质量意识培训'
  ]
}

function generateRandomMetric(min: number, max: number) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1))
}

function generateRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateDailyQualityMetrics(days: number) {
  const metrics = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    metrics.push({
      date: date.toISOString().split('T')[0],
      inspections: generateRandomNumber(20, 80),
      pass_rate: generateRandomMetric(90, 98),
      defect_rate: generateRandomMetric(1, 5),
      quality_score: generateRandomMetric(85, 95)
    })
  }
  return metrics
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

function generateDefectTrends(days: number) {
  return {
    包装破损: generateTrendData(days, 5, 20),
    颜色异常: generateTrendData(days, 2, 10),
    形状不规则: generateTrendData(days, 1, 8),
    表面瑕疵: generateTrendData(days, 3, 15)
  }
}

function generateModelPerformanceTrends() {
  return {
    accuracy_trend: generateTrendData(30, 85, 95),
    precision_trend: generateTrendData(30, 80, 95),
    recall_trend: generateTrendData(30, 85, 95)
  }
}

function calculatePassRate(inspections: any[]) {
  if (inspections.length === 0) return 0
  const passed = inspections.filter(i => i.overall_quality === 'pass').length
  return (passed / inspections.length * 100).toFixed(1)
}

function calculateAvgConfidence(inspections: any[]) {
  if (inspections.length === 0) return 0
  const totalConfidence = inspections.reduce((sum, i) => sum + (i.confidence_score || 0), 0)
  return (totalConfidence / inspections.length).toFixed(2)
}
