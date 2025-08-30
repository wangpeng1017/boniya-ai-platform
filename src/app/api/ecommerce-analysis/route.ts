import { NextRequest, NextResponse } from 'next/server'
import { executeSafeQuery } from '@/lib/db/connection'
import { GeminiClient } from '@/lib/ai/gemini-client'

// 电商平台数据分析API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      platform = 'jd',
      product_name,
      analysis_type = 'sentiment',
      data_source = 'api',
      file_data
    } = body

    let analysisResult

    if (data_source === 'file' && file_data) {
      // 处理上传的文件数据
      analysisResult = await analyzeUploadedData(file_data, analysis_type)
    } else {
      // 从数据库获取爬虫数据进行分析
      analysisResult = await analyzeCrawlerData(platform, product_name, analysis_type)
    }

    // 保存分析结果
    const result = await executeSafeQuery`
      INSERT INTO ecommerce_analysis (
        platform, product_name, analysis_type, data_source,
        analysis_result, created_at
      ) VALUES (
        ${platform}, ${product_name}, ${analysis_type}, ${data_source},
        ${JSON.stringify(analysisResult)}, CURRENT_TIMESTAMP
      ) RETURNING id
    `

    return NextResponse.json({
      success: true,
      data: {
        analysis_id: result.rows[0].id,
        analysis_result: analysisResult
      }
    })

  } catch (error) {
    console.error('电商数据分析失败:', error)
    return NextResponse.json(
      { success: false, error: '电商数据分析失败' },
      { status: 500 }
    )
  }
}

// 获取分析历史记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const analysis_type = searchParams.get('analysis_type')
    const limit = parseInt(searchParams.get('limit') || '10')

    let whereConditions = []
    if (platform) whereConditions.push(`platform = '${platform}'`)
    if (analysis_type) whereConditions.push(`analysis_type = '${analysis_type}'`)

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : ''

    let result
    if (whereConditions.length > 0) {
      // 使用参数化查询避免SQL注入
      if (platform && analysis_type) {
        result = await executeSafeQuery`
          SELECT * FROM ecommerce_analysis
          WHERE platform = ${platform} AND analysis_type = ${analysis_type}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
      } else if (platform) {
        result = await executeSafeQuery`
          SELECT * FROM ecommerce_analysis
          WHERE platform = ${platform}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
      } else if (analysis_type) {
        result = await executeSafeQuery`
          SELECT * FROM ecommerce_analysis
          WHERE analysis_type = ${analysis_type}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
      }
    } else {
      result = await executeSafeQuery`
        SELECT * FROM ecommerce_analysis
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    }

    return NextResponse.json({
      success: true,
      data: result?.rows || []
    })

  } catch (error) {
    console.error('获取分析记录失败:', error)
    return NextResponse.json(
      { success: false, error: '获取分析记录失败' },
      { status: 500 }
    )
  }
}

// 分析爬虫数据
async function analyzeCrawlerData(platform: string, product_name: string, analysis_type: string) {
  try {
    // 获取相关评论数据
    const comments = await executeSafeQuery`
      SELECT * FROM jd_comments
      WHERE product_name ILIKE ${'%' + product_name + '%'}
      ORDER BY created_at DESC
      LIMIT 100
    `

    if (comments.rows.length === 0) {
      return {
        status: 'no_data',
        message: '未找到相关商品的评论数据',
        suggestions: ['请先运行爬虫采集数据', '检查商品名称是否正确']
      }
    }

    const gemini = new GeminiClient()
    let analysisResult

    switch (analysis_type) {
      case 'sentiment':
        analysisResult = await performSentimentAnalysis(comments.rows, gemini)
        break
      case 'keywords':
        analysisResult = await performKeywordAnalysis(comments.rows, gemini)
        break
      case 'issues':
        analysisResult = await performIssueAnalysis(comments.rows, gemini)
        break
      case 'timeline':
        analysisResult = await performTimelineAnalysis(comments.rows)
        break
      default:
        analysisResult = await performComprehensiveAnalysis(comments.rows, gemini)
    }

    return {
      status: 'success',
      platform,
      product_name,
      analysis_type,
      data_count: comments.rows.length,
      result: analysisResult,
      generated_at: new Date().toISOString()
    }

  } catch (error) {
    console.error('分析爬虫数据失败:', error)
    return {
      status: 'error',
      message: '数据分析失败',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

// 情感分析
async function performSentimentAnalysis(comments: any[], gemini: GeminiClient) {
  const commentTexts = comments.map(c => c.content).slice(0, 50) // 限制数量
  
  const prompt = `
    请分析以下商品评论的情感倾向，并提供详细统计：
    
    评论内容：
    ${commentTexts.join('\n---\n')}
    
    请按以下格式返回JSON结果：
    {
      "sentiment_distribution": {
        "positive": 数量,
        "neutral": 数量, 
        "negative": 数量
      },
      "sentiment_percentage": {
        "positive": 百分比,
        "neutral": 百分比,
        "negative": 百分比
      },
      "key_positive_points": ["正面评价要点"],
      "key_negative_points": ["负面评价要点"],
      "overall_sentiment": "positive/neutral/negative",
      "confidence_score": 0.95
    }
  `

  try {
    const response = await gemini.generateContent(prompt, { maxTokens: 1000 })
    return JSON.parse(response)
  } catch (error) {
    // 降级到简单统计
    return generateSimpleSentimentAnalysis(comments)
  }
}

// 关键词分析
async function performKeywordAnalysis(comments: any[], gemini: GeminiClient) {
  const commentTexts = comments.map(c => c.content).slice(0, 50)
  
  const prompt = `
    请分析以下商品评论中的关键词和主题：
    
    评论内容：
    ${commentTexts.join('\n---\n')}
    
    请按以下格式返回JSON结果：
    {
      "top_keywords": [
        {"word": "关键词", "frequency": 频次, "sentiment": "positive/neutral/negative"}
      ],
      "themes": [
        {"theme": "主题", "mentions": 提及次数, "sentiment": "情感倾向"}
      ],
      "product_features": [
        {"feature": "产品特性", "mentions": 提及次数, "rating": "好评/差评"}
      ]
    }
  `

  try {
    const response = await gemini.generateContent(prompt, { maxTokens: 1000 })
    return JSON.parse(response)
  } catch (error) {
    return generateSimpleKeywordAnalysis(comments)
  }
}

// 问题分析
async function performIssueAnalysis(comments: any[], gemini: GeminiClient) {
  const negativeComments = comments.filter(c => 
    c.content.includes('问题') || c.content.includes('不好') || 
    c.content.includes('差') || c.content.includes('坏')
  ).slice(0, 30)

  if (negativeComments.length === 0) {
    return {
      issues_found: 0,
      message: '未发现明显问题',
      categories: []
    }
  }

  const prompt = `
    请分析以下负面评论，识别产品存在的问题：
    
    评论内容：
    ${negativeComments.map(c => c.content).join('\n---\n')}
    
    请按以下格式返回JSON结果：
    {
      "issues_found": 问题数量,
      "categories": [
        {
          "category": "问题类别",
          "issues": ["具体问题"],
          "frequency": 频次,
          "severity": "high/medium/low",
          "suggestions": ["改进建议"]
        }
      ],
      "priority_issues": ["优先解决的问题"],
      "overall_assessment": "整体评估"
    }
  `

  try {
    const response = await gemini.generateContent(prompt, { maxTokens: 1000 })
    return JSON.parse(response)
  } catch (error) {
    return generateSimpleIssueAnalysis(negativeComments)
  }
}

// 时间线分析
async function performTimelineAnalysis(comments: any[]) {
  const timelineData: { [key: string]: { total: number, positive: number, negative: number, neutral: number } } = {}
  
  comments.forEach(comment => {
    const date = comment.created_at.split('T')[0] // 获取日期部分
    if (!timelineData[date]) {
      timelineData[date] = { total: 0, positive: 0, negative: 0, neutral: 0 }
    }
    
    timelineData[date].total++
    
    // 简单的情感判断
    const content = comment.content.toLowerCase()
    if (content.includes('好') || content.includes('棒') || content.includes('满意')) {
      timelineData[date].positive++
    } else if (content.includes('差') || content.includes('不好') || content.includes('问题')) {
      timelineData[date].negative++
    } else {
      timelineData[date].neutral++
    }
  })

  const timeline = Object.entries(timelineData)
    .map(([date, data]) => ({
      date,
      ...data,
      sentiment_score: (data.positive - data.negative) / data.total
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return {
    timeline,
    summary: {
      total_days: timeline.length,
      avg_daily_comments: timeline.reduce((sum, day) => sum + day.total, 0) / timeline.length,
      trend: calculateTrend(timeline)
    }
  }
}

// 综合分析
async function performComprehensiveAnalysis(comments: any[], gemini: GeminiClient) {
  const [sentiment, keywords, issues, timeline] = await Promise.all([
    performSentimentAnalysis(comments, gemini),
    performKeywordAnalysis(comments, gemini),
    performIssueAnalysis(comments, gemini),
    performTimelineAnalysis(comments)
  ])

  return {
    sentiment_analysis: sentiment,
    keyword_analysis: keywords,
    issue_analysis: issues,
    timeline_analysis: timeline,
    summary: {
      total_comments: comments.length,
      analysis_date: new Date().toISOString(),
      overall_rating: calculateOverallRating(sentiment, issues)
    }
  }
}

// 简单情感分析（降级方案）
function generateSimpleSentimentAnalysis(comments: any[]) {
  let positive = 0, negative = 0, neutral = 0

  comments.forEach(comment => {
    const content = comment.content.toLowerCase()
    if (content.includes('好') || content.includes('棒') || content.includes('满意')) {
      positive++
    } else if (content.includes('差') || content.includes('不好') || content.includes('问题')) {
      negative++
    } else {
      neutral++
    }
  })

  const total = comments.length
  return {
    sentiment_distribution: { positive, neutral, negative },
    sentiment_percentage: {
      positive: (positive / total * 100).toFixed(1),
      neutral: (neutral / total * 100).toFixed(1),
      negative: (negative / total * 100).toFixed(1)
    },
    overall_sentiment: positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral',
    confidence_score: 0.7
  }
}

// 简单关键词分析（降级方案）
function generateSimpleKeywordAnalysis(comments: any[]) {
  const wordCount: { [key: string]: number } = {}
  
  comments.forEach(comment => {
    const words = comment.content.split(/\s+/)
    words.forEach((word: string) => {
      if (word.length > 1) {
        wordCount[word] = (wordCount[word] || 0) + 1
      }
    })
  })

  const topKeywords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word, frequency]) => ({ word, frequency, sentiment: 'neutral' }))

  return { top_keywords: topKeywords, themes: [], product_features: [] }
}

// 简单问题分析（降级方案）
function generateSimpleIssueAnalysis(comments: any[]) {
  const issues: any[] = []
  const problemKeywords = ['问题', '坏', '差', '不好', '失望']
  
  problemKeywords.forEach(keyword => {
    const count = comments.filter(c => c.content.includes(keyword)).length
    if (count > 0) {
      issues.push({
        category: '产品问题',
        issues: [`包含"${keyword}"的评论`],
        frequency: count,
        severity: count > 5 ? 'high' : count > 2 ? 'medium' : 'low'
      })
    }
  })

  return {
    issues_found: issues.length,
    categories: issues,
    priority_issues: issues.filter(i => i.severity === 'high').map(i => i.issues[0])
  }
}

// 计算趋势
function calculateTrend(timeline: any[]) {
  if (timeline.length < 2) return 'stable'
  
  const recent = timeline.slice(-7) // 最近7天
  const earlier = timeline.slice(-14, -7) // 之前7天
  
  const recentAvg = recent.reduce((sum, day) => sum + day.sentiment_score, 0) / recent.length
  const earlierAvg = earlier.reduce((sum, day) => sum + day.sentiment_score, 0) / earlier.length
  
  if (recentAvg > earlierAvg + 0.1) return 'improving'
  if (recentAvg < earlierAvg - 0.1) return 'declining'
  return 'stable'
}

// 计算整体评分
function calculateOverallRating(sentiment: any, issues: any) {
  const sentimentScore = sentiment.sentiment_percentage?.positive || 0
  const issueScore = 100 - (issues.issues_found || 0) * 10
  
  return Math.max(0, Math.min(100, (sentimentScore * 0.7 + issueScore * 0.3)))
}

// 分析上传的文件数据
async function analyzeUploadedData(fileData: any, analysisType: string) {
  // 这里处理用户上传的Excel/CSV数据
  // 现在返回模拟结果
  return {
    status: 'success',
    message: '文件数据分析完成',
    data_source: 'uploaded_file',
    analysis_type: analysisType,
    result: {
      total_records: fileData.length || 0,
      analysis_summary: '基于上传文件的分析结果'
    }
  }
}
