/**
 * 电商反馈分析AI服务
 * 集成Gemini AI进行用户反馈的多维度智能分析
 */

import { geminiClient } from './gemini-client'

export interface FeedbackAnalysis {
  sentiment: '正面' | '中性' | '负面'
  issues: string[]
  urgency: '高' | '中' | '低'
  summary: string
  confidence: number
  analysis_notes?: string
}

export interface FeedbackInsights {
  total_feedback_count: number
  sentiment_distribution: {
    positive: number
    neutral: number
    negative: number
  }
  top_issues: Array<{
    issue: string
    count: number
    percentage: number
  }>
  urgency_distribution: {
    high: number
    medium: number
    low: number
  }
  key_insights: string[]
  improvement_suggestions: string[]
  confidence_level: 'high' | 'medium' | 'low'
}

export class EcommerceFeedbackAI {
  /**
   * 分析单条用户反馈
   */
  async analyzeFeedback(feedbackText: string): Promise<FeedbackAnalysis> {
    const prompt = `
你是一位波尼亚食品公司的客户体验分析专家。请对以下客户反馈进行多维度分析，并以结构化的JSON格式输出。

# 分析维度与规则:
1. **sentiment (情感)**: 判断客户的情感倾向。选项: "正面", "中性", "负面"。
2. **issues (问题标签)**: 识别所有相关问题点，可多选。必须从以下列表中选择: 
   "包装问题-漏气", "包装问题-破损", "产品质量-不新鲜", "产品质量-异物", "产品质量-口感不佳", 
   "物流问题-速度慢", "物流问题-包装差", "客服问题", "价格与促销", "发货问题", "其他"。
3. **urgency (紧急程度)**: 评估该反馈是否需要立即人工介入。选项: "高", "中", "低"。
   负面反馈且涉及食品安全（如不新鲜、异物）的为"高"。
4. **summary (问题摘要)**: 用一句话简明扼要地概括客户反馈的核心内容。
5. **confidence (置信度)**: 分析结果的置信度，范围0.0-1.0。

# JSON输出格式:
{
  "sentiment": "...",
  "issues": ["...", "..."],
  "urgency": "...",
  "summary": "...",
  "confidence": 置信度数值,
  "analysis_notes": "分析说明(可选)"
}

# ---
# 客户反馈:
"""
${feedbackText}
"""
`

    try {
      const response = await geminiClient.generateContent(prompt, { 
        temperature: 0.3,
        maxTokens: 500 
      })
      
      // 提取JSON
      const jsonMatch = response.match(/\{[\s\S]*?\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        return {
          sentiment: result.sentiment || '中性',
          issues: result.issues || ['其他'],
          urgency: result.urgency || '低',
          summary: result.summary || '客户反馈分析',
          confidence: result.confidence || 0.5,
          analysis_notes: result.analysis_notes || ''
        }
      }
      
      // 默认返回
      return {
        sentiment: '中性',
        issues: ['其他'],
        urgency: '低',
        summary: '无法解析客户反馈',
        confidence: 0.3,
        analysis_notes: '无法解析AI响应'
      }
    } catch (error) {
      console.error('Feedback analysis error:', error)
      return {
        sentiment: '中性',
        issues: ['其他'],
        urgency: '低',
        summary: '反馈分析失败',
        confidence: 0.0,
        analysis_notes: '分析过程出错'
      }
    }
  }

  /**
   * 批量分析用户反馈
   */
  async batchAnalyzeFeedback(feedbackTexts: string[]): Promise<FeedbackAnalysis[]> {
    const results: FeedbackAnalysis[] = []
    
    for (const feedbackText of feedbackTexts) {
      try {
        const result = await this.analyzeFeedback(feedbackText)
        results.push(result)
        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (error) {
        console.error(`Feedback analysis failed for text: ${feedbackText}`, error)
        results.push({
          sentiment: '中性',
          issues: ['其他'],
          urgency: '低',
          summary: '批量分析失败',
          confidence: 0.0,
          analysis_notes: '批量处理异常'
        })
      }
    }
    
    return results
  }

  /**
   * 生成反馈洞察报告
   */
  async generateFeedbackInsights(analysisResults: FeedbackAnalysis[]): Promise<FeedbackInsights> {
    // 统计分析
    const totalCount = analysisResults.length
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 }
    const urgencyCounts = { high: 0, medium: 0, low: 0 }
    const issuesCounts: Record<string, number> = {}

    analysisResults.forEach(result => {
      // 情感统计
      if (result.sentiment === '正面') sentimentCounts.positive++
      else if (result.sentiment === '负面') sentimentCounts.negative++
      else sentimentCounts.neutral++

      // 紧急程度统计
      if (result.urgency === '高') urgencyCounts.high++
      else if (result.urgency === '中') urgencyCounts.medium++
      else urgencyCounts.low++

      // 问题统计
      result.issues.forEach(issue => {
        issuesCounts[issue] = (issuesCounts[issue] || 0) + 1
      })
    })

    // 生成Top问题列表
    const topIssues = Object.entries(issuesCounts)
      .map(([issue, count]) => ({
        issue,
        count,
        percentage: Math.round((count / totalCount) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // 调用AI生成洞察
    const insightsPrompt = `
基于以下客户反馈分析统计数据，请生成关键洞察和改进建议：

# 统计数据:
- 总反馈数: ${totalCount}
- 情感分布: 正面${sentimentCounts.positive}条, 中性${sentimentCounts.neutral}条, 负面${sentimentCounts.negative}条
- 紧急程度: 高${urgencyCounts.high}条, 中${urgencyCounts.medium}条, 低${urgencyCounts.low}条
- 主要问题: ${topIssues.map(item => `${item.issue}(${item.count}条)`).join(', ')}

请生成JSON格式的洞察报告：
{
  "key_insights": ["洞察1", "洞察2", "洞察3"],
  "improvement_suggestions": ["建议1", "建议2", "建议3"]
}
`

    try {
      const response = await geminiClient.generateContent(insightsPrompt, { 
        temperature: 0.6,
        maxTokens: 600 
      })
      
      const jsonMatch = response.match(/\{[\s\S]*?\}/)
      let keyInsights = ['数据分析完成，请查看详细统计']
      let improvementSuggestions = ['建议关注主要问题类别']
      
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        keyInsights = result.key_insights || keyInsights
        improvementSuggestions = result.improvement_suggestions || improvementSuggestions
      }

      return {
        total_feedback_count: totalCount,
        sentiment_distribution: sentimentCounts,
        top_issues: topIssues,
        urgency_distribution: urgencyCounts,
        key_insights: keyInsights,
        improvement_suggestions: improvementSuggestions,
        confidence_level: totalCount > 50 ? 'high' : totalCount > 20 ? 'medium' : 'low'
      }

    } catch (error) {
      console.error('Insights generation error:', error)
      return {
        total_feedback_count: totalCount,
        sentiment_distribution: sentimentCounts,
        top_issues: topIssues,
        urgency_distribution: urgencyCounts,
        key_insights: ['洞察生成失败，请查看统计数据'],
        improvement_suggestions: ['建议手动分析反馈数据'],
        confidence_level: 'low'
      }
    }
  }

  /**
   * 生成客服回复建议
   */
  async generateCustomerServiceReply(
    feedbackText: string, 
    analysisResult: FeedbackAnalysis
  ): Promise<string> {
    const prompt = `
你是波尼亚食品公司的专业客服。基于客户反馈和AI分析结果，请生成一个专业、友好、有针对性的客服回复。

# 客户反馈:
"${feedbackText}"

# AI分析结果:
- 情感: ${analysisResult.sentiment}
- 主要问题: ${analysisResult.issues.join(', ')}
- 紧急程度: ${analysisResult.urgency}
- 问题摘要: ${analysisResult.summary}

# 回复要求:
1. 语气友好专业
2. 针对具体问题给出解决方案
3. 体现波尼亚品牌的关怀
4. 控制在150字以内

请生成客服回复:
`

    try {
      const response = await geminiClient.generateContent(prompt, { 
        temperature: 0.7,
        maxTokens: 300 
      })
      
      return response.trim()
    } catch (error) {
      console.error('Customer service reply generation error:', error)
      return '感谢您的反馈，我们会认真处理您的问题。如有任何疑问，请随时联系我们的客服团队。'
    }
  }
}

// 导出单例实例
export const ecommerceFeedbackAI = new EcommerceFeedbackAI()
