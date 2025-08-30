import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

// 青岛地区波尼亚与喜旺竞品价格对比真实数据
const qingdaoCompetitorData = [
  // 青岛办事处数据
  { region: '青岛办事处', boniya_product: '德国黑森林火腿200g', boniya_price: 29.9, xiwang_product: '德国黑森林火腿200g', xiwang_price: 29.9, category: '火腿类' },
  { region: '青岛办事处', boniya_product: '法国皇家火腿200g', boniya_price: 26.9, xiwang_product: '法国皇家火腿200g', xiwang_price: 26.9, category: '火腿类' },
  { region: '青岛办事处', boniya_product: '蒜味烤肠160g', boniya_price: 7.9, xiwang_product: '蒜味烤肠160g', xiwang_price: 7.9, category: '烤肠类' },
  { region: '青岛办事处', boniya_product: '维也纳香肠160g', boniya_price: 7.9, xiwang_product: '维也纳香肠160g', xiwang_price: 7.9, category: '香肠类' },
  { region: '青岛办事处', boniya_product: '肉枣肠160g', boniya_price: 7.9, xiwang_product: '肉枣肠160g', xiwang_price: 7.9, category: '香肠类' },
  { region: '青岛办事处', boniya_product: '哈尔滨红肠200g', boniya_price: 12.9, xiwang_product: '哈尔滨红肠200g', xiwang_price: 12.9, category: '红肠类' },
  { region: '青岛办事处', boniya_product: '猪头肉200g', boniya_price: 15.9, xiwang_product: null, xiwang_price: null, category: '熟食类' },
  { region: '青岛办事处', boniya_product: '酱猪耳200g', boniya_price: 13.9, xiwang_product: null, xiwang_price: null, category: '熟食类' },
  { region: '青岛办事处', boniya_product: '老汤牛肉200g', boniya_price: 18.9, xiwang_product: null, xiwang_price: null, category: '熟食类' },
  { region: '青岛办事处', boniya_product: '牛肉汤500ml', boniya_price: 8.9, xiwang_product: null, xiwang_price: null, category: '汤品类' },
  { region: '青岛办事处', boniya_product: '大肠汤500ml', boniya_price: 7.9, xiwang_product: null, xiwang_price: null, category: '汤品类' },
  { region: '青岛办事处', boniya_product: '流亭猪蹄300g', boniya_price: 16.9, xiwang_product: null, xiwang_price: null, category: '包装食品' },
  { region: '青岛办事处', boniya_product: '肉丸200g', boniya_price: 9.9, xiwang_product: null, xiwang_price: null, category: '包装食品' },
  { region: '青岛办事处', boniya_product: '香辣鸡胗150g', boniya_price: 11.9, xiwang_product: null, xiwang_price: null, category: '熟食类' },
  { region: '青岛办事处', boniya_product: '五香牛肉200g', boniya_price: 19.9, xiwang_product: null, xiwang_price: null, category: '熟食类' },

  // 城阳即墨数据
  { region: '城阳即墨', boniya_product: '德国黑森林火腿200g', boniya_price: 28.9, xiwang_product: '德国黑森林火腿200g', xiwang_price: 29.9, category: '火腿类' },
  { region: '城阳即墨', boniya_product: '法国皇家火腿200g', boniya_price: 25.9, xiwang_product: '法国皇家火腿200g', xiwang_price: 26.9, category: '火腿类' },
  { region: '城阳即墨', boniya_product: '蒜味烤肠160g', boniya_price: 7.5, xiwang_product: '蒜味烤肠160g', xiwang_price: 7.9, category: '烤肠类' },
  { region: '城阳即墨', boniya_product: '维也纳香肠160g', boniya_price: 7.5, xiwang_product: '维也纳香肠160g', xiwang_price: 7.9, category: '香肠类' },
  { region: '城阳即墨', boniya_product: '肉枣肠160g', boniya_price: 7.5, xiwang_product: '肉枣肠160g', xiwang_price: 7.9, category: '香肠类' },
  { region: '城阳即墨', boniya_product: '哈尔滨红肠200g', boniya_price: 12.5, xiwang_product: '哈尔滨红肠200g', xiwang_price: 12.9, category: '红肠类' },
  { region: '城阳即墨', boniya_product: '猪头肉200g', boniya_price: 15.5, xiwang_product: null, xiwang_price: null, category: '熟食类' },
  { region: '城阳即墨', boniya_product: '酱猪耳200g', boniya_price: 13.5, xiwang_product: null, xiwang_price: null, category: '熟食类' },
  { region: '城阳即墨', boniya_product: '老汤牛肉200g', boniya_price: 18.5, xiwang_product: null, xiwang_price: null, category: '熟食类' },
  { region: '城阳即墨', boniya_product: '牛肉汤500ml', boniya_price: 8.5, xiwang_product: null, xiwang_price: null, category: '汤品类' },
  { region: '城阳即墨', boniya_product: '大肠汤500ml', boniya_price: 7.5, xiwang_product: null, xiwang_price: null, category: '汤品类' },
  { region: '城阳即墨', boniya_product: '流亭猪蹄300g', boniya_price: 16.5, xiwang_product: null, xiwang_price: null, category: '包装食品' },
  { region: '城阳即墨', boniya_product: '肉丸200g', boniya_price: 9.5, xiwang_product: null, xiwang_price: null, category: '包装食品' },
  { region: '城阳即墨', boniya_product: '香辣鸡胗150g', boniya_price: 11.5, xiwang_product: null, xiwang_price: null, category: '熟食类' },
  { region: '城阳即墨', boniya_product: '五香牛肉200g', boniya_price: 19.5, xiwang_product: null, xiwang_price: null, category: '熟食类' }
]

// 青岛地区波尼亚与喜旺竞品价格分析API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      product_name,
      our_price,
      competitor_name,
      competitor_price,
      location,
      office,
      image_url,
      notes,
      product_spec,
      competitor_spec
    } = body

    // 基础验证
    if (!product_name || !our_price || !office) {
      return NextResponse.json(
        { success: false, error: '必填字段不能为空' },
        { status: 400 }
      )
    }

    // 计算价格优势
    const price_advantage = our_price < competitor_price
    const price_difference = competitor_price - our_price
    const price_difference_percent = ((price_difference / our_price) * 100).toFixed(2)

    // 保存竞品价格数据
    const result = await sql`
      INSERT INTO competitor_prices (
        product_name, our_price, competitor_name, competitor_price,
        location, office, price_advantage, price_difference,
        price_difference_percent, image_url, notes, created_at
      ) VALUES (
        ${product_name}, ${our_price}, ${competitor_name}, ${competitor_price},
        ${location}, ${office}, ${price_advantage}, ${price_difference},
        ${price_difference_percent}, ${image_url}, ${notes}, CURRENT_TIMESTAMP
      ) RETURNING id
    `

    const recordId = result.rows[0].id

    return NextResponse.json({
      success: true,
      data: {
        id: recordId,
        product_name,
        our_price,
        competitor_name,
        competitor_price,
        price_advantage,
        price_difference,
        price_difference_percent,
        analysis: generatePriceAnalysis({
          our_price,
          competitor_price,
          price_advantage,
          price_difference_percent
        })
      }
    })

  } catch (error) {
    console.error('竞品价格分析失败:', error)
    return NextResponse.json(
      { success: false, error: '竞品价格分析失败' },
      { status: 500 }
    )
  }
}

// 获取青岛地区竞品价格数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const office = searchParams.get('office') || '青岛办事处'
    const category = searchParams.get('category')
    const analysis_type = searchParams.get('analysis_type') || 'list'

    if (analysis_type === 'summary') {
      // 返回汇总分析
      const summaryData = generateQingdaoSummaryAnalysis(office)
      return NextResponse.json({
        success: true,
        data: summaryData
      })
    }

    // 筛选青岛地区数据
    let filteredData = qingdaoCompetitorData.filter(item => item.region === office)

    if (category && category !== 'all') {
      filteredData = filteredData.filter(item => item.category === category)
    }

    // 转换为API格式
    const formattedData = filteredData.map((item, index) => ({
      id: index + 1,
      product_name: item.boniya_product,
      our_price: item.boniya_price,
      competitor_name: item.xiwang_product ? '喜旺' : null,
      competitor_price: item.xiwang_price,
      office: item.region,
      category: item.category,
      price_advantage: item.xiwang_price ? item.boniya_price < item.xiwang_price : null,
      price_difference: item.xiwang_price ? (item.xiwang_price - item.boniya_price).toFixed(2) : null,
      price_difference_percent: item.xiwang_price ?
        (((item.xiwang_price - item.boniya_price) / item.boniya_price) * 100).toFixed(2) : null,
      has_competitor: !!item.xiwang_product,
      created_at: new Date().toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: formattedData
    })

  } catch (error) {
    console.error('获取竞品价格数据失败:', error)
    return NextResponse.json(
      { success: false, error: '获取竞品价格数据失败' },
      { status: 500 }
    )
  }
}

// 生成基于青岛地区数据的价格分析
function generatePriceAnalysis(data: any) {
  const { our_price, competitor_price, price_advantage, price_difference_percent } = data

  let analysis = {
    status: price_advantage ? 'advantage' : 'disadvantage',
    message: '',
    recommendation: '',
    urgency: 'low'
  }

  if (!competitor_price) {
    analysis.status = 'unique'
    analysis.message = '波尼亚独有产品，喜旺无对应竞品'
    analysis.recommendation = '利用产品独特性，可适当提高定价或加强市场推广'
    analysis.urgency = 'low'
    return analysis
  }

  const diffPercent = Math.abs(parseFloat(price_difference_percent))

  if (price_advantage) {
    if (diffPercent > 10) {
      analysis.message = `波尼亚价格优势明显，比喜旺低${diffPercent}%`
      analysis.recommendation = '保持价格优势，加强市场推广，扩大市场份额'
      analysis.urgency = 'low'
    } else if (diffPercent > 5) {
      analysis.message = `波尼亚价格有一定优势，比喜旺低${diffPercent}%`
      analysis.recommendation = '保持当前价格策略，监控喜旺价格动态'
      analysis.urgency = 'low'
    } else {
      analysis.message = `波尼亚价格略有优势，比喜旺低${diffPercent}%`
      analysis.recommendation = '密切关注喜旺价格变化，准备应对策略'
      analysis.urgency = 'medium'
    }
  } else {
    if (diffPercent > 10) {
      analysis.message = `波尼亚价格劣势明显，比喜旺高${diffPercent}%`
      analysis.recommendation = '建议调整价格策略或强化产品差异化优势'
      analysis.urgency = 'high'
    } else if (diffPercent > 5) {
      analysis.message = `波尼亚价格处于劣势，比喜旺高${diffPercent}%`
      analysis.recommendation = '考虑适当降价或通过促销活动提升竞争力'
      analysis.urgency = 'high'
    } else {
      analysis.message = `波尼亚价格略高于喜旺${diffPercent}%`
      analysis.recommendation = '可通过品质优势或服务差异化维持价格'
      analysis.urgency = 'medium'
    }
  }

  return analysis
}

// 生成青岛地区汇总分析
function generateQingdaoSummaryAnalysis(office: string) {
  const regionData = qingdaoCompetitorData.filter(item => item.region === office)
  const competitorData = regionData.filter(item => item.xiwang_price !== null)
  const uniqueProducts = regionData.filter(item => item.xiwang_price === null)

  // 价格优势统计
  const advantageProducts = competitorData.filter(item => item.boniya_price < item.xiwang_price!)
  const disadvantageProducts = competitorData.filter(item => item.boniya_price > item.xiwang_price!)
  const equalPriceProducts = competitorData.filter(item => item.boniya_price === item.xiwang_price!)

  // 按类别统计
  const categoryStats = regionData.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { total: 0, advantage: 0, disadvantage: 0, unique: 0, equal: 0 }
    }
    acc[item.category].total++

    if (item.xiwang_price === null) {
      acc[item.category].unique++
    } else if (item.boniya_price < item.xiwang_price) {
      acc[item.category].advantage++
    } else if (item.boniya_price > item.xiwang_price) {
      acc[item.category].disadvantage++
    } else {
      acc[item.category].equal++
    }

    return acc
  }, {} as any)

  return {
    overview: {
      total_products: regionData.length,
      competitor_products: competitorData.length,
      unique_products: uniqueProducts.length,
      advantage_products: advantageProducts.length,
      disadvantage_products: disadvantageProducts.length,
      equal_price_products: equalPriceProducts.length,
      advantage_rate: competitorData.length > 0 ?
        ((advantageProducts.length / competitorData.length) * 100).toFixed(1) : '0',
      region: office
    },
    category_analysis: categoryStats,
    price_range: {
      boniya_min: Math.min(...regionData.map(item => item.boniya_price)),
      boniya_max: Math.max(...regionData.map(item => item.boniya_price)),
      boniya_avg: (regionData.reduce((sum, item) => sum + item.boniya_price, 0) / regionData.length).toFixed(2)
    },
    recommendations: generateRegionRecommendations(office, advantageProducts.length, disadvantageProducts.length, uniqueProducts.length)
  }
}

// 生成地区性建议
function generateRegionRecommendations(region: string, advantage: number, disadvantage: number, unique: number) {
  const recommendations = []

  if (advantage > disadvantage) {
    recommendations.push({
      type: 'pricing',
      priority: 'medium',
      message: `${region}地区波尼亚整体价格竞争力较强，有${advantage}个产品价格优于喜旺`,
      action: '保持价格优势，加强市场推广'
    })
  } else if (disadvantage > advantage) {
    recommendations.push({
      type: 'pricing',
      priority: 'high',
      message: `${region}地区需要关注价格竞争力，有${disadvantage}个产品价格高于喜旺`,
      action: '考虑调整定价策略或强化产品差异化'
    })
  }

  if (unique > 0) {
    recommendations.push({
      type: 'product',
      priority: 'low',
      message: `${region}地区有${unique}个波尼亚独有产品，无喜旺竞品`,
      action: '利用产品独特性，加强市场教育和推广'
    })
  }

  return recommendations
}

// 生成汇总分析
async function generateSummaryAnalysis(office?: string, competitor?: string) {
  try {
    let whereClause = ''
    let params = []
    
    if (office) {
      whereClause = 'WHERE office = $1'
      params.push(office)
    }

    // 总体统计
    const overallStats = await sql.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN price_advantage = true THEN 1 END) as advantage_count,
        COUNT(CASE WHEN price_advantage = false THEN 1 END) as disadvantage_count,
        AVG(price_difference_percent) as avg_price_diff,
        AVG(our_price) as avg_our_price,
        AVG(competitor_price) as avg_competitor_price
      FROM competitor_prices 
      ${whereClause}
    `, params)

    // 按竞品分组统计
    const competitorStats = await sql.query(`
      SELECT 
        competitor_name,
        COUNT(*) as product_count,
        COUNT(CASE WHEN price_advantage = true THEN 1 END) as advantage_count,
        AVG(price_difference_percent) as avg_price_diff
      FROM competitor_prices 
      ${whereClause}
      GROUP BY competitor_name
      ORDER BY product_count DESC
    `, params)

    // 按办事处分组统计
    const officeStats = await sql.query(`
      SELECT 
        office,
        COUNT(*) as product_count,
        COUNT(CASE WHEN price_advantage = true THEN 1 END) as advantage_count,
        AVG(price_difference_percent) as avg_price_diff
      FROM competitor_prices 
      GROUP BY office
      ORDER BY product_count DESC
    `)

    const stats = overallStats.rows[0]
    const advantageRate = ((stats.advantage_count / stats.total_products) * 100).toFixed(1)

    return {
      overview: {
        total_products: parseInt(stats.total_products),
        advantage_count: parseInt(stats.advantage_count),
        disadvantage_count: parseInt(stats.disadvantage_count),
        advantage_rate: parseFloat(advantageRate),
        avg_price_difference: parseFloat(stats.avg_price_diff).toFixed(2),
        avg_our_price: parseFloat(stats.avg_our_price).toFixed(2),
        avg_competitor_price: parseFloat(stats.avg_competitor_price).toFixed(2)
      },
      competitor_analysis: competitorStats.rows,
      office_analysis: officeStats.rows,
      recommendations: generateOverallRecommendations({
        advantage_rate: parseFloat(advantageRate),
        avg_price_diff: parseFloat(stats.avg_price_diff)
      })
    }

  } catch (error) {
    console.error('生成汇总分析失败:', error)
    return null
  }
}

// 生成整体建议
function generateOverallRecommendations(data: any) {
  const { advantage_rate, avg_price_diff } = data
  const recommendations = []

  if (advantage_rate > 70) {
    recommendations.push({
      type: 'pricing',
      priority: 'medium',
      message: '整体价格优势明显，可考虑适当提价增加利润',
      action: '价格策略优化'
    })
  } else if (advantage_rate < 30) {
    recommendations.push({
      type: 'pricing',
      priority: 'high',
      message: '价格竞争力不足，需要制定应对策略',
      action: '紧急价格调整'
    })
  }

  if (Math.abs(avg_price_diff) > 15) {
    recommendations.push({
      type: 'monitoring',
      priority: 'high',
      message: '价格差异较大，建议加强竞品监控频率',
      action: '增强监控'
    })
  }

  recommendations.push({
    type: 'analysis',
    priority: 'low',
    message: '建议定期分析价格趋势，优化定价策略',
    action: '定期分析'
  })

  return recommendations
}
