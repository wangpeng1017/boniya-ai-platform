/**
 * Google Gemini API客户端
 * 用于波尼亚AI平台的AI功能模块
 */

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string
    }>
  }>
  generationConfig?: {
    temperature?: number
    topK?: number
    topP?: number
    maxOutputTokens?: number
  }
}

export class GeminiClient {
  private apiKey: string
  private model: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || ''
    this.model = process.env.GEMINI_MODEL || 'gemini-2.5-pro'
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models'
  }

  private checkApiKey(): void {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required')
    }
  }

  /**
   * 生成文本内容
   */
  async generateContent(prompt: string, options?: {
    temperature?: number
    maxTokens?: number
  }): Promise<string> {
    this.checkApiKey()

    try {
      const request: GeminiRequest = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: options?.temperature || 0.7,
          maxOutputTokens: options?.maxTokens || 1000,
          topK: 40,
          topP: 0.95
        }
      }

      const response = await fetch(
        `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request)
        }
      )

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
      }

      const data: GeminiResponse = await response.json()
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini API')
      }

      return data.candidates[0].content.parts[0].text

    } catch (error) {
      console.error('Gemini API error:', error)
      throw error
    }
  }

  /**
   * 情感分析
   */
  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral'
    confidence: number
    reasoning: string
  }> {
    const prompt = `
请分析以下文本的情感倾向，并返回JSON格式的结果：

文本: "${text}"

请返回以下格式的JSON：
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.0-1.0,
  "reasoning": "分析理由"
}
`

    try {
      const response = await this.generateContent(prompt, { temperature: 0.3 })
      
      // 尝试解析JSON响应
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      // 如果无法解析JSON，返回默认结果
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        reasoning: '无法解析AI响应'
      }
    } catch (error) {
      console.error('Sentiment analysis error:', error)
      return {
        sentiment: 'neutral',
        confidence: 0.0,
        reasoning: '分析失败'
      }
    }
  }

  /**
   * 关键词提取
   */
  async extractKeywords(text: string, maxKeywords: number = 10): Promise<string[]> {
    const prompt = `
请从以下文本中提取最重要的关键词，返回JSON数组格式：

文本: "${text}"

请返回最多${maxKeywords}个关键词，格式如下：
["关键词1", "关键词2", "关键词3"]
`

    try {
      const response = await this.generateContent(prompt, { temperature: 0.3 })
      
      // 尝试解析JSON数组
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      return []
    } catch (error) {
      console.error('Keyword extraction error:', error)
      return []
    }
  }

  /**
   * 智能客服回复生成
   */
  async generateCustomerServiceReply(
    customerMessage: string,
    context?: string
  ): Promise<string> {
    const prompt = `
你是波尼亚AI平台的智能客服助手。请根据客户的问题生成专业、友好的回复。

${context ? `背景信息: ${context}` : ''}

客户问题: "${customerMessage}"

请生成一个专业、友好、有帮助的客服回复：
`

    return await this.generateContent(prompt, { temperature: 0.7 })
  }

  /**
   * 文本摘要
   */
  async summarizeText(text: string, maxLength: number = 200): Promise<string> {
    const prompt = `
请为以下文本生成一个简洁的摘要，长度不超过${maxLength}个字符：

文本: "${text}"

摘要:
`

    return await this.generateContent(prompt, { temperature: 0.5, maxTokens: 300 })
  }

  /**
   * 检查API连接状态
   */
  async healthCheck(): Promise<boolean> {
    try {
      console.log('Gemini health check - starting...')
      console.log('API Key configured:', !!this.apiKey)
      console.log('Model:', this.model)

      if (!this.apiKey) {
        console.error('Gemini health check - No API key configured')
        return false
      }

      const result = await this.generateContent('Hello', { maxTokens: 10 })
      console.log('Gemini health check - success:', result)
      return true
    } catch (error) {
      console.error('Gemini API health check failed:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      return false
    }
  }
}

// 导出单例实例
export const geminiClient = new GeminiClient()
