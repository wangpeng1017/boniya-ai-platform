/**
 * 语音识别服务
 * 支持浏览器原生Web Speech API和百度语音识别API
 */

interface SpeechRecognitionResult {
  success: boolean
  text: string
  confidence: number
  error?: string
}

interface SpeechRecognitionOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
}

/**
 * 浏览器原生语音识别服务
 */
export class WebSpeechRecognition {
  private recognition: any = null
  private isSupported: boolean = false

  constructor() {
    // 检查浏览器支持
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.isSupported = true
        this.setupRecognition()
      }
    }
  }

  private setupRecognition() {
    if (!this.recognition) return

    this.recognition.continuous = false
    this.recognition.interimResults = false
    this.recognition.lang = 'zh-CN'
    this.recognition.maxAlternatives = 1
  }

  /**
   * 检查浏览器是否支持语音识别
   */
  isAvailable(): boolean {
    return this.isSupported
  }

  /**
   * 开始语音识别
   */
  async startRecognition(options: SpeechRecognitionOptions = {}): Promise<SpeechRecognitionResult> {
    if (!this.isSupported) {
      return {
        success: false,
        text: '',
        confidence: 0,
        error: '浏览器不支持语音识别功能'
      }
    }

    return new Promise((resolve) => {
      // 配置识别参数
      this.recognition.continuous = options.continuous || false
      this.recognition.interimResults = options.interimResults || false
      this.recognition.lang = options.language || 'zh-CN'
      this.recognition.maxAlternatives = options.maxAlternatives || 1

      // 设置事件监听器
      this.recognition.onresult = (event: any) => {
        const result = event.results[0]
        if (result.isFinal) {
          resolve({
            success: true,
            text: result[0].transcript,
            confidence: result[0].confidence || 0.8
          })
        }
      }

      this.recognition.onerror = (event: any) => {
        resolve({
          success: false,
          text: '',
          confidence: 0,
          error: `语音识别错误: ${event.error}`
        })
      }

      this.recognition.onend = () => {
        // 如果没有结果，返回超时错误
        resolve({
          success: false,
          text: '',
          confidence: 0,
          error: '语音识别超时或未检测到语音'
        })
      }

      // 开始识别
      try {
        this.recognition.start()
      } catch (error) {
        resolve({
          success: false,
          text: '',
          confidence: 0,
          error: `启动语音识别失败: ${error}`
        })
      }
    })
  }

  /**
   * 停止语音识别
   */
  stopRecognition() {
    if (this.recognition) {
      this.recognition.stop()
    }
  }
}

/**
 * 百度语音识别服务
 */
export class BaiduSpeechRecognition {
  private config: {
    apiKey: string
    secretKey: string
  }
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor() {
    this.config = {
      apiKey: process.env.BAIDU_OCR_API_KEY || '', // 复用OCR的API Key
      secretKey: process.env.BAIDU_OCR_SECRET_KEY || ''
    }
  }

  /**
   * 获取访问令牌
   */
  private async getAccessToken(): Promise<string> {
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
        this.tokenExpiry = Date.now() + (data.expires_in - 86400) * 1000
        return this.accessToken
      } else {
        throw new Error(`获取访问令牌失败: ${data.error_description || data.error}`)
      }
    } catch (error) {
      console.error('百度语音识别获取访问令牌失败:', error)
      throw error
    }
  }

  /**
   * 语音识别
   * @param audioBase64 音频文件的base64编码
   * @param format 音频格式 (wav, pcm, amr, m4a)
   * @param rate 采样率 (8000, 16000)
   */
  async recognizeSpeech(
    audioBase64: string,
    format: 'wav' | 'pcm' | 'amr' | 'm4a' = 'wav',
    rate: 8000 | 16000 = 16000
  ): Promise<SpeechRecognitionResult> {
    try {
      const accessToken = await this.getAccessToken()
      
      // 移除base64前缀
      const cleanBase64 = audioBase64.replace(/^data:audio\/[a-z0-9]+;base64,/, '')
      
      const response = await fetch(
        `https://vop.baidu.com/server_api?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            format: format,
            rate: rate,
            channel: 1,
            cuid: 'boniya-ai-platform',
            token: accessToken,
            speech: cleanBase64,
            len: Math.floor(cleanBase64.length * 0.75) // 估算音频长度
          })
        }
      )

      const result = await response.json()
      
      if (result.err_no === 0) {
        return {
          success: true,
          text: result.result?.[0] || '',
          confidence: 0.8 // 百度API不返回置信度，使用默认值
        }
      } else {
        return {
          success: false,
          text: '',
          confidence: 0,
          error: `语音识别失败: ${result.err_msg}`
        }
      }

    } catch (error) {
      console.error('百度语音识别失败:', error)
      return {
        success: false,
        text: '',
        confidence: 0,
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
      return { available: true, message: '百度语音识别服务正常' }
    } catch (error) {
      return { 
        available: false, 
        message: `百度语音识别服务不可用: ${error instanceof Error ? error.message : '未知错误'}` 
      }
    }
  }
}

/**
 * 统一语音识别服务
 */
export class SpeechRecognitionService {
  private webSpeech: WebSpeechRecognition
  private baiduSpeech: BaiduSpeechRecognition

  constructor() {
    this.webSpeech = new WebSpeechRecognition()
    this.baiduSpeech = new BaiduSpeechRecognition()
  }

  /**
   * 获取可用的识别方式
   */
  getAvailableMethods(): string[] {
    const methods: string[] = []
    if (this.webSpeech.isAvailable()) {
      methods.push('web')
    }
    methods.push('baidu') // 百度API总是可用（如果配置正确）
    return methods
  }

  /**
   * 使用最佳可用方法进行语音识别
   */
  async recognize(
    input: string | File, 
    method: 'auto' | 'web' | 'baidu' = 'auto'
  ): Promise<SpeechRecognitionResult> {
    // 如果是实时语音识别，优先使用Web Speech API
    if (typeof input === 'string' && input === 'live') {
      if (method === 'web' || (method === 'auto' && this.webSpeech.isAvailable())) {
        return this.webSpeech.startRecognition()
      }
    }

    // 如果是音频文件，使用百度API
    if (input instanceof File) {
      return this.recognizeAudioFile(input)
    }

    return {
      success: false,
      text: '',
      confidence: 0,
      error: '不支持的输入类型'
    }
  }

  /**
   * 识别音频文件
   */
  private async recognizeAudioFile(file: File): Promise<SpeechRecognitionResult> {
    try {
      // 将文件转换为base64
      const base64 = await this.fileToBase64(file)
      
      // 确定音频格式
      const format = this.getAudioFormat(file.type)
      
      return this.baiduSpeech.recognizeSpeech(base64, format)
    } catch (error) {
      return {
        success: false,
        text: '',
        confidence: 0,
        error: `音频文件处理失败: ${error}`
      }
    }
  }

  /**
   * 文件转base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * 获取音频格式
   */
  private getAudioFormat(mimeType: string): 'wav' | 'pcm' | 'amr' | 'm4a' {
    if (mimeType.includes('wav')) return 'wav'
    if (mimeType.includes('m4a') || mimeType.includes('mp4')) return 'm4a'
    if (mimeType.includes('amr')) return 'amr'
    return 'wav' // 默认格式
  }
}

// 导出单例实例
export const speechRecognition = new SpeechRecognitionService()
