/**
 * 百度OCR文字识别服务
 * 支持通用文字识别和高精度文字识别
 */

interface BaiduOCRConfig {
  apiKey: string
  secretKey: string
}

interface OCRResult {
  success: boolean
  text: string
  confidence: number
  words: Array<{
    words: string
    location: {
      left: number
      top: number
      width: number
      height: number
    }
    probability: {
      average: number
      min: number
      variance: number
    }
  }>
  error?: string
}

export class BaiduOCRService {
  private config: BaiduOCRConfig
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor() {
    this.config = {
      apiKey: process.env.BAIDU_OCR_API_KEY || '',
      secretKey: process.env.BAIDU_OCR_SECRET_KEY || ''
    }

    if (!this.config.apiKey || !this.config.secretKey) {
      throw new Error('百度OCR API密钥未配置')
    }
  }

  /**
   * 获取访问令牌
   */
  private async getAccessToken(): Promise<string> {
    // 检查token是否过期
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const response = await fetch('https://aip.baidubce.com/oauth/2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.apiKey,
          client_secret: this.config.secretKey
        })
      })

      const data = await response.json()
      
      if (data.access_token) {
        this.accessToken = data.access_token
        // token有效期30天，提前1天刷新
        this.tokenExpiry = Date.now() + (data.expires_in - 86400) * 1000
        return this.accessToken
      } else {
        throw new Error(`获取访问令牌失败: ${data.error_description || data.error}`)
      }
    } catch (error) {
      console.error('百度OCR获取访问令牌失败:', error)
      throw error
    }
  }

  /**
   * 通用文字识别
   * @param imageBase64 图片的base64编码
   * @param options 识别选项
   */
  async recognizeText(
    imageBase64: string, 
    options: {
      language_type?: 'CHN_ENG' | 'ENG' | 'JAP' | 'KOR'
      detect_direction?: boolean
      probability?: boolean
    } = {}
  ): Promise<OCRResult> {
    try {
      const accessToken = await this.getAccessToken()
      
      // 移除base64前缀
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
      
      const response = await fetch(
        `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            image: cleanBase64,
            language_type: options.language_type || 'CHN_ENG',
            detect_direction: options.detect_direction ? 'true' : 'false',
            probability: options.probability ? 'true' : 'false'
          })
        }
      )

      const result = await response.json()
      
      if (result.error_code) {
        return {
          success: false,
          text: '',
          confidence: 0,
          words: [],
          error: `OCR识别失败: ${result.error_msg}`
        }
      }

      // 提取所有文字
      const allText = result.words_result?.map((item: any) => item.words).join('\n') || ''
      
      // 计算平均置信度
      const avgConfidence = result.words_result?.length > 0 
        ? result.words_result.reduce((sum: number, item: any) => 
            sum + (item.probability?.average || 0.8), 0) / result.words_result.length
        : 0.8

      return {
        success: true,
        text: allText,
        confidence: avgConfidence,
        words: result.words_result || []
      }

    } catch (error) {
      console.error('百度OCR识别失败:', error)
      return {
        success: false,
        text: '',
        confidence: 0,
        words: [],
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 高精度文字识别
   * @param imageBase64 图片的base64编码
   */
  async recognizeTextAccurate(imageBase64: string): Promise<OCRResult> {
    try {
      const accessToken = await this.getAccessToken()
      
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
      
      const response = await fetch(
        `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            image: cleanBase64,
            probability: 'true'
          })
        }
      )

      const result = await response.json()
      
      if (result.error_code) {
        return {
          success: false,
          text: '',
          confidence: 0,
          words: [],
          error: `高精度OCR识别失败: ${result.error_msg}`
        }
      }

      const allText = result.words_result?.map((item: any) => item.words).join('\n') || ''
      const avgConfidence = result.words_result?.length > 0 
        ? result.words_result.reduce((sum: number, item: any) => 
            sum + (item.probability?.average || 0.9), 0) / result.words_result.length
        : 0.9

      return {
        success: true,
        text: allText,
        confidence: avgConfidence,
        words: result.words_result || []
      }

    } catch (error) {
      console.error('百度高精度OCR识别失败:', error)
      return {
        success: false,
        text: '',
        confidence: 0,
        words: [],
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 检测服务状态
   */
  async checkStatus(): Promise<{ available: boolean; message: string }> {
    try {
      await this.getAccessToken()
      return { available: true, message: '百度OCR服务正常' }
    } catch (error) {
      return { 
        available: false, 
        message: `百度OCR服务不可用: ${error instanceof Error ? error.message : '未知错误'}` 
      }
    }
  }
}

// 导出单例实例
export const baiduOCR = new BaiduOCRService()
