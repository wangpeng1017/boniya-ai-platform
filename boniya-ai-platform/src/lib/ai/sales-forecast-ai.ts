/**
 * 销售预测AI服务
 * 集成Gemini AI进行特征提取和报告生成
 */

import { geminiClient } from './gemini-client'

export interface FeatureExtractionResult {
  impact_level: 'high' | 'medium' | 'low' | 'negative' | 'neutral'
  reasoning: string
  confidence: number
}

export interface ForecastReportData {
  product_name: string
  forecast_data: Record<string, number>
  key_factors: string[]
  analysis_period: {
    start_date: string
    end_date: string
  }
}

export interface ForecastReport {
  summary: string
  daily_analysis: string
  recommendation: string
  confidence_level: 'high' | 'medium' | 'low'
}

export class SalesForecastAI {
  /**
   * 特征提取 - 将非结构化事件描述转换为结构化特征
   */
  async extractFeatures(eventDescription: string): Promise<FeatureExtractionResult> {
    const prompt = `
你是一位零售行业的数据科学家。请评估以下事件对熟食产品（特别是烤肠、猪蹄、火腿类）销量的潜在影响，并以JSON格式输出影响等级。

# 规则:
- impact_level: "high", "medium", "low", "negative", "neutral"
- reasoning: 简要说明判断理由（50字以内）
- confidence: 置信度（0.0-1.0）

# 影响等级说明:
- high: 预计销量增长20%以上
- medium: 预计销量增长5-20%
- low: 预计销量增长0-5%
- negative: 预计销量下降
- neutral: 基本无影响

# JSON输出格式:
{
  "impact_level": "影响等级",
  "reasoning": "判断理由",
  "confidence": 置信度数值
}

# 事件描述:
"""
${eventDescription}
"""
`

    try {
      const response = await geminiClient.generateContent(prompt, { 
        temperature: 0.3,
        maxTokens: 300 
      })
      
      // 提取JSON
      const jsonMatch = response.match(/\{[\s\S]*?\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        return {
          impact_level: result.impact_level || 'neutral',
          reasoning: result.reasoning || '无法分析',
          confidence: result.confidence || 0.5
        }
      }
      
      // 默认返回
      return {
        impact_level: 'neutral',
        reasoning: '无法解析AI响应',
        confidence: 0.3
      }
    } catch (error) {
      console.error('Feature extraction error:', error)
      return {
        impact_level: 'neutral',
        reasoning: '特征提取失败',
        confidence: 0.0
      }
    }
  }

  /**
   * 生成销售预测分析报告
   */
  async generateForecastReport(data: ForecastReportData): Promise<ForecastReport> {
    const prompt = `
你是一位波尼亚公司的资深数据分析师。请根据以下销售预测数据和关键影响因素，为门店经理撰写一份简洁、专业的订货策略周报。

# 周报要求:
1. 首先总结本周销量的整体趋势（50字以内）
2. 逐日分析关键日的销量波动原因（100字以内）
3. 最后给出一项核心的备货或运营建议（50字以内）
4. 语气要专业、肯定，直接面向门店管理者

# 数据:
- 预测产品: ${data.product_name}
- 预测数据: ${JSON.stringify(data.forecast_data)}
- 关键影响因素: ${data.key_factors.join('、')}
- 分析周期: ${data.analysis_period.start_date} 至 ${data.analysis_period.end_date}

# 请按以下格式生成周报:
## 整体趋势
[在此写整体趋势分析]

## 关键日分析
[在此写逐日波动分析]

## 核心建议
[在此写备货建议]
`

    try {
      const response = await geminiClient.generateContent(prompt, { 
        temperature: 0.7,
        maxTokens: 800 
      })
      
      // 解析报告内容
      const sections = this.parseReportSections(response)
      
      return {
        summary: sections.summary || '本周销量预测已生成',
        daily_analysis: sections.daily_analysis || '详细分析请查看数据图表',
        recommendation: sections.recommendation || '建议根据预测数据合理备货',
        confidence_level: this.calculateConfidenceLevel(data.forecast_data)
      }
    } catch (error) {
      console.error('Report generation error:', error)
      return {
        summary: '预测报告生成失败，请查看原始数据',
        daily_analysis: '系统暂时无法生成详细分析',
        recommendation: '建议联系技术支持',
        confidence_level: 'low'
      }
    }
  }

  /**
   * 解析报告章节
   */
  private parseReportSections(reportText: string): {
    summary?: string
    daily_analysis?: string
    recommendation?: string
  } {
    const sections: any = {}
    
    // 提取整体趋势
    const summaryMatch = reportText.match(/##\s*整体趋势\s*\n([\s\S]*?)(?=##|$)/)
    if (summaryMatch) {
      sections.summary = summaryMatch[1].trim()
    }
    
    // 提取关键日分析
    const analysisMatch = reportText.match(/##\s*关键日分析\s*\n([\s\S]*?)(?=##|$)/)
    if (analysisMatch) {
      sections.daily_analysis = analysisMatch[1].trim()
    }
    
    // 提取核心建议
    const recommendationMatch = reportText.match(/##\s*核心建议\s*\n([\s\S]*?)(?=##|$)/)
    if (recommendationMatch) {
      sections.recommendation = recommendationMatch[1].trim()
    }
    
    return sections
  }

  /**
   * 计算置信度等级
   */
  private calculateConfidenceLevel(forecastData: Record<string, number>): 'high' | 'medium' | 'low' {
    const values = Object.values(forecastData)
    const variance = this.calculateVariance(values)
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    
    // 基于变异系数判断置信度
    const coefficientOfVariation = Math.sqrt(variance) / mean
    
    if (coefficientOfVariation < 0.2) return 'high'
    if (coefficientOfVariation < 0.5) return 'medium'
    return 'low'
  }

  /**
   * 计算方差
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  }

  /**
   * 批量处理多个事件的特征提取
   */
  async batchExtractFeatures(events: string[]): Promise<FeatureExtractionResult[]> {
    const results: FeatureExtractionResult[] = []
    
    for (const event of events) {
      try {
        const result = await this.extractFeatures(event)
        results.push(result)
        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Feature extraction failed for event: ${event}`, error)
        results.push({
          impact_level: 'neutral',
          reasoning: '批量处理失败',
          confidence: 0.0
        })
      }
    }
    
    return results
  }
}

// 导出单例实例
export const salesForecastAI = new SalesForecastAI()
