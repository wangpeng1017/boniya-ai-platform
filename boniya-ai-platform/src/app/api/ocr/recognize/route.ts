import { NextRequest, NextResponse } from 'next/server'
import { baiduOCR } from '@/lib/ocr/baidu-ocr'
import { competitorAnalysisAI } from '@/lib/ai/competitor-analysis-ai'

// OCR文字识别API
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    const recognitionType = formData.get('type') as string || 'basic'
    const autoParsePrice = formData.get('autoParsePrice') === 'true'

    if (!image) {
      return NextResponse.json({
        success: false,
        error: '请上传图片文件'
      }, { status: 400 })
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp']
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json({
        success: false,
        error: '不支持的图片格式，请上传 JPG、PNG 或 BMP 格式的图片'
      }, { status: 400 })
    }

    // 验证文件大小 (最大4MB)
    if (image.size > 4 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: '图片文件过大，请上传小于4MB的图片'
      }, { status: 400 })
    }

    // 将图片转换为base64
    const arrayBuffer = await image.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const imageBase64 = `data:${image.type};base64,${base64}`

    // 执行OCR识别
    let ocrResult
    if (recognitionType === 'accurate') {
      ocrResult = await baiduOCR.recognizeTextAccurate(imageBase64)
    } else {
      ocrResult = await baiduOCR.recognizeText(imageBase64, {
        language_type: 'CHN_ENG',
        detect_direction: true,
        probability: true
      })
    }

    if (!ocrResult.success) {
      return NextResponse.json({
        success: false,
        error: ocrResult.error || 'OCR识别失败'
      }, { status: 500 })
    }

    // 如果需要自动解析价格信息
    let parsedData = null
    if (autoParsePrice && ocrResult.text) {
      try {
        parsedData = await competitorAnalysisAI.parseRawText(ocrResult.text)
      } catch (parseError) {
        console.error('价格信息解析失败:', parseError)
        // 解析失败不影响OCR结果返回
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ocr_result: {
          text: ocrResult.text,
          confidence: ocrResult.confidence,
          word_count: ocrResult.words.length,
          words: ocrResult.words
        },
        parsed_data: parsedData,
        processing_info: {
          image_size: image.size,
          image_type: image.type,
          recognition_type: recognitionType,
          auto_parsed: autoParsePrice && parsedData !== null
        }
      }
    })

  } catch (error) {
    console.error('OCR识别API错误:', error)
    return NextResponse.json({
      success: false,
      error: 'OCR识别服务暂时不可用，请稍后重试'
    }, { status: 500 })
  }
}

// 获取OCR服务状态
export async function GET() {
  try {
    const status = await baiduOCR.checkStatus()
    
    return NextResponse.json({
      success: true,
      data: {
        service_status: status,
        supported_formats: ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp'],
        max_file_size: '4MB',
        recognition_types: [
          {
            type: 'basic',
            name: '通用文字识别',
            description: '适用于一般场景的文字识别'
          },
          {
            type: 'accurate',
            name: '高精度文字识别',
            description: '更高精度的文字识别，适用于对准确率要求较高的场景'
          }
        ]
      }
    })
  } catch (error) {
    console.error('获取OCR服务状态失败:', error)
    return NextResponse.json({
      success: false,
      error: '无法获取OCR服务状态'
    }, { status: 500 })
  }
}
