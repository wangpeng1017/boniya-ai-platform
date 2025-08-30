import FormData from 'form-data'

// 百度OCR API配置
const BAIDU_OCR_CONFIG = {
  // 请替换为您的实际API Key和Secret Key
  API_KEY: process.env.BAIDU_OCR_API_KEY || 'your_api_key_here',
  SECRET_KEY: process.env.BAIDU_OCR_SECRET_KEY || 'your_secret_key_here',
  TOKEN_URL: 'https://aip.baidubce.com/oauth/2.0/token',
  OCR_URL: 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic'
}

// OCR识别结果接口
export interface OCRResult {
  success: boolean
  data?: {
    words_result: Array<{
      words: string
      location: {
        left: number
        top: number
        width: number
        height: number
      }
    }>
    words_result_num: number
  }
  error?: string
}

// 提取的商品信息接口
export interface ExtractedProductInfo {
  product_name?: string
  specification?: string
  price?: number
  location?: string
  confidence: number
  raw_text: string[]
}

/**
 * 获取百度OCR访问令牌
 */
async function getBaiduAccessToken(): Promise<string> {
  try {
    const response = await fetch(
      `${BAIDU_OCR_CONFIG.TOKEN_URL}?grant_type=client_credentials&client_id=${BAIDU_OCR_CONFIG.API_KEY}&client_secret=${BAIDU_OCR_CONFIG.SECRET_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    )

    const result = await response.json()
    
    if (result.access_token) {
      return result.access_token
    } else {
      throw new Error(`获取访问令牌失败: ${result.error_description || '未知错误'}`)
    }
  } catch (error) {
    console.error('获取百度OCR访问令牌失败:', error)
    throw new Error('OCR服务暂时不可用，请稍后重试')
  }
}

/**
 * 调用百度OCR API进行图片识别
 */
export async function performBaiduOCR(imageBuffer: Buffer): Promise<OCRResult> {
  try {
    // 获取访问令牌
    const accessToken = await getBaiduAccessToken()
    
    // 将图片转换为base64
    const imageBase64 = imageBuffer.toString('base64')
    
    // 构建请求参数
    const params = new URLSearchParams()
    params.append('image', imageBase64)
    params.append('language_type', 'CHN_ENG') // 中英文混合识别
    
    // 调用OCR API
    const response = await fetch(
      `${BAIDU_OCR_CONFIG.OCR_URL}?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      }
    )

    const result = await response.json()
    
    if (result.error_code) {
      throw new Error(`OCR识别失败: ${result.error_msg || '未知错误'}`)
    }

    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('百度OCR识别失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '图片识别失败'
    }
  }
}

/**
 * 从OCR结果中提取商品信息
 */
export function extractProductInfo(ocrResult: OCRResult): ExtractedProductInfo[] {
  if (!ocrResult.success || !ocrResult.data) {
    return []
  }

  const words = ocrResult.data.words_result.map(item => item.words)
  const allText = words.join(' ')
  
  // 价格识别正则表达式
  const priceRegex = /[¥￥]?(\d+\.?\d*)[元]?/g
  const prices: number[] = []
  let match
  
  while ((match = priceRegex.exec(allText)) !== null) {
    const price = parseFloat(match[1])
    if (price > 0 && price < 10000) { // 合理价格范围
      prices.push(price)
    }
  }

  // 商品名称识别（简单规则，可以根据实际情况优化）
  const productKeywords = ['火腿', '香肠', '肉枣', '猪头肉', '猪耳', '猪肝', '烤肠', '肉丸']
  const productNames: string[] = []
  
  words.forEach(word => {
    productKeywords.forEach(keyword => {
      if (word.includes(keyword) && !productNames.includes(word)) {
        productNames.push(word)
      }
    })
  })

  // 规格识别
  const specRegex = /(\d+[gG克]|\d+[kK][gG]|\d+ml|\d+ML)/g
  const specifications: string[] = []
  
  words.forEach(word => {
    const specMatches = word.match(specRegex)
    if (specMatches) {
      specifications.push(...specMatches)
    }
  })

  // 构建结果
  const results: ExtractedProductInfo[] = []
  
  if (prices.length > 0 || productNames.length > 0) {
    // 如果识别到多个商品，尝试匹配
    const maxItems = Math.max(prices.length, productNames.length, 1)
    
    for (let i = 0; i < maxItems; i++) {
      results.push({
        product_name: productNames[i] || '',
        specification: specifications[i] || '',
        price: prices[i] || 0,
        confidence: 0.8, // 基础置信度
        raw_text: words
      })
    }
  } else {
    // 如果没有识别到具体信息，返回原始文本
    results.push({
      confidence: 0.3,
      raw_text: words
    })
  }

  return results
}

/**
 * 验证图片文件
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '仅支持 JPEG、PNG、WebP 格式的图片'
    }
  }

  // 检查文件大小 (最大4MB)
  const maxSize = 4 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '图片大小不能超过4MB'
    }
  }

  return { valid: true }
}
