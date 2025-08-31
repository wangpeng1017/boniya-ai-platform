/**
 * 竞品价格分析AI服务
 * 集成Gemini AI进行数据结构化和价格趋势分析
 */

import { geminiClient } from './gemini-client'

export interface CompetitorDataStructure {
  brand: string
  product_name: string
  specifications: string | null
  price: number | null
  confidence: number
  parsing_notes?: string
}

export interface PriceTrendAnalysis {
  trend_direction: 'rising' | 'falling' | 'stable' | 'volatile'
  trend_strength: 'strong' | 'moderate' | 'weak'
  key_insights: string[]
  market_opportunities: string[]
  threats: string[]
  pricing_recommendations: string[]
  confidence_level: 'high' | 'medium' | 'low'
}

export class CompetitorAnalysisAI {
  /**
   * 数据结构化 - 将OCR或语音识别的原始文本转换为结构化数据
   */
  async structureCompetitorData(rawText: string): Promise<CompetitorDataStructure> {
    const prompt = `
你是一位精通中文零售商品信息的数据录入专家。你的任务是将一段从图片或语音中提取的、可能杂乱无章的原始文本，解析并转换成一个结构化的JSON对象。

# 规则:
1. 仔细识别品牌名称(如喜旺、双汇、金锣)、商品名称、规格(如克重、口味、包装形式)和价格。
2. 将所有价格信息统一为阿拉伯数字（浮点数）。
3. 如果某项信息在原始文本中不存在，请在JSON中使用 null 值。
4. 品牌名称必须从 ["喜旺", "双汇", "金锣", "其他"] 中选择，如果无法判断则为 "其他"。
5. 严格按照指定的JSON格式输出，不要添加任何额外的解释或文字。
6. 添加confidence字段表示解析的置信度(0.0-1.0)。

# JSON输出格式:
{
  "brand": "品牌名称",
  "product_name": "商品名称",
  "specifications": "规格描述",
  "price": 价格数字,
  "confidence": 置信度数值,
  "parsing_notes": "解析说明(可选)"
}

# ---
# 现在，请处理以下原始文本：
# 原始文本:
"""
${rawText}
"""
`

    try {
      const response = await geminiClient.generateContent(prompt, { 
        temperature: 0.2,
        maxTokens: 400 
      })
      
      // 提取JSON
      const jsonMatch = response.match(/\{[\s\S]*?\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        return {
          brand: result.brand || '其他',
          product_name: result.product_name || '未知商品',
          specifications: result.specifications || null,
          price: result.price || null,
          confidence: result.confidence || 0.5,
          parsing_notes: result.parsing_notes || ''
        }
      }
      
      // 默认返回
      return {
        brand: '其他',
        product_name: '解析失败',
        specifications: null,
        price: null,
        confidence: 0.0,
        parsing_notes: '无法解析AI响应'
      }
    } catch (error) {
      console.error('Data structuring error:', error)
      return {
        brand: '其他',
        product_name: '解析失败',
        specifications: null,
        price: null,
        confidence: 0.0,
        parsing_notes: '数据结构化失败'
      }
    }
  }

  /**
   * 价格趋势分析 - 分析竞品价格数据并生成洞察
   */
  async analyzePriceTrends(competitorData: Array<{
    brand: string
    product_name: string
    price: number
    date: string
    region?: string
  }>): Promise<PriceTrendAnalysis> {
    const prompt = `
你是一位波尼亚食品公司的市场分析专家。请基于以下竞品价格数据，进行深度的市场趋势分析，并提供战略建议。

# 分析要求:
1. 分析价格趋势方向和强度
2. 识别关键市场洞察
3. 发现市场机会和威胁
4. 提供具体的定价策略建议
5. 评估分析的置信度

# 竞品价格数据:
${JSON.stringify(competitorData, null, 2)}

# 请按以下JSON格式输出分析结果:
{
  "trend_direction": "rising|falling|stable|volatile",
  "trend_strength": "strong|moderate|weak", 
  "key_insights": ["洞察1", "洞察2", "洞察3"],
  "market_opportunities": ["机会1", "机会2"],
  "threats": ["威胁1", "威胁2"],
  "pricing_recommendations": ["建议1", "建议2", "建议3"],
  "confidence_level": "high|medium|low"
}
`

    try {
      const response = await geminiClient.generateContent(prompt, { 
        temperature: 0.6,
        maxTokens: 800 
      })
      
      // 提取JSON
      const jsonMatch = response.match(/\{[\s\S]*?\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        return {
          trend_direction: result.trend_direction || 'stable',
          trend_strength: result.trend_strength || 'moderate',
          key_insights: result.key_insights || ['暂无关键洞察'],
          market_opportunities: result.market_opportunities || ['暂无发现机会'],
          threats: result.threats || ['暂无发现威胁'],
          pricing_recommendations: result.pricing_recommendations || ['建议保持现有定价策略'],
          confidence_level: result.confidence_level || 'medium'
        }
      }
      
      // 默认返回
      return {
        trend_direction: 'stable',
        trend_strength: 'moderate',
        key_insights: ['数据分析中，请稍后查看'],
        market_opportunities: ['暂无发现机会'],
        threats: ['暂无发现威胁'],
        pricing_recommendations: ['建议保持现有定价策略'],
        confidence_level: 'low'
      }
    } catch (error) {
      console.error('Price trend analysis error:', error)
      return {
        trend_direction: 'stable',
        trend_strength: 'weak',
        key_insights: ['价格趋势分析失败'],
        market_opportunities: ['系统暂时无法分析'],
        threats: ['系统暂时无法分析'],
        pricing_recommendations: ['建议联系技术支持'],
        confidence_level: 'low'
      }
    }
  }

  /**
   * 批量处理原始数据结构化
   */
  async batchStructureData(rawTexts: string[]): Promise<CompetitorDataStructure[]> {
    const results: CompetitorDataStructure[] = []
    
    for (const rawText of rawTexts) {
      try {
        const result = await this.structureCompetitorData(rawText)
        results.push(result)
        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`Data structuring failed for text: ${rawText}`, error)
        results.push({
          brand: '其他',
          product_name: '批量处理失败',
          specifications: null,
          price: null,
          confidence: 0.0,
          parsing_notes: '批量处理异常'
        })
      }
    }
    
    return results
  }

  /**
   * 生成竞品分析摘要报告
   */
  async generateCompetitorSummary(analysisData: PriceTrendAnalysis): Promise<string> {
    const prompt = `
请基于以下竞品价格分析结果，生成一份简洁的执行摘要报告，适合向管理层汇报。

# 分析数据:
${JSON.stringify(analysisData, null, 2)}

# 报告要求:
- 控制在200字以内
- 突出最重要的发现和建议
- 语言简洁专业
- 面向决策者

请生成报告:
`

    try {
      const response = await geminiClient.generateContent(prompt, { 
        temperature: 0.5,
        maxTokens: 300 
      })
      
      return response.trim()
    } catch (error) {
      console.error('Summary generation error:', error)
      return '竞品分析摘要生成失败，请查看详细分析数据。'
    }
  }
}

// 导出单例实例
export const competitorAnalysisAI = new CompetitorAnalysisAI()
