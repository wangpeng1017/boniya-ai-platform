import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { sql } from '@vercel/postgres'

// 文件上传API
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const upload_type = formData.get('upload_type') as string || 'general'
    const description = formData.get('description') as string || ''

    if (!file) {
      return NextResponse.json(
        { success: false, error: '没有选择文件' },
        { status: 400 }
      )
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: '不支持的文件类型，请上传图片文件' },
        { status: 400 }
      )
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '文件大小不能超过5MB' },
        { status: 400 }
      )
    }

    // 生成唯一文件名
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${upload_type}_${timestamp}_${randomString}.${fileExtension}`

    try {
      // 上传到Vercel Blob
      const blob = await put(fileName, file, {
        access: 'public',
      })

      // 保存文件记录到数据库
      const fileRecord = await sql`
        INSERT INTO file_uploads (
          filename, original_name, file_path, file_size, mime_type,
          upload_type, processing_status, description, created_at
        ) VALUES (
          ${fileName}, ${file.name}, ${blob.url}, ${file.size}, ${file.type},
          ${upload_type}, 'completed', ${description}, CURRENT_TIMESTAMP
        ) RETURNING id, file_path
      `

      // 如果是竞品照片，尝试OCR识别
      let ocrResult = null
      if (upload_type === 'competitor_photo') {
        ocrResult = await performOCR(blob.url)
        
        // 更新OCR结果
        await sql`
          UPDATE file_uploads 
          SET ocr_result = ${JSON.stringify(ocrResult)},
              processing_status = 'completed'
          WHERE id = ${fileRecord.rows[0].id}
        `
      }

      return NextResponse.json({
        success: true,
        data: {
          id: fileRecord.rows[0].id,
          filename: fileName,
          original_name: file.name,
          file_url: blob.url,
          file_size: file.size,
          upload_type,
          ocr_result: ocrResult
        }
      })

    } catch (uploadError) {
      console.error('文件上传失败:', uploadError)
      return NextResponse.json(
        { success: false, error: '文件上传失败，请重试' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('处理上传请求失败:', error)
    return NextResponse.json(
      { success: false, error: '处理上传请求失败' },
      { status: 500 }
    )
  }
}

// 获取上传文件列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const upload_type = searchParams.get('upload_type')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = `
      SELECT * FROM file_uploads 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `

    if (upload_type) {
      query = `
        SELECT * FROM file_uploads 
        WHERE upload_type = '${upload_type}'
        ORDER BY created_at DESC 
        LIMIT ${limit}
      `
    }

    const result = await sql.query(query)

    return NextResponse.json({
      success: true,
      data: result.rows
    })

  } catch (error) {
    console.error('获取文件列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取文件列表失败' },
      { status: 500 }
    )
  }
}

// 模拟OCR识别功能
async function performOCR(imageUrl: string) {
  try {
    // 这里应该调用真实的OCR服务，如Google Vision API
    // 现在返回模拟数据
    
    // 模拟OCR识别延迟
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 模拟识别结果
    const mockOCRResult = {
      detected_text: [
        "波尼亚烤肠五香 160g",
        "¥7.90",
        "喜旺烤肠 160g", 
        "¥7.90",
        "双汇王中王 240g",
        "¥12.80"
      ],
      confidence: 0.92,
      products: [
        {
          name: "波尼亚烤肠五香",
          specification: "160g",
          price: 7.90,
          confidence: 0.95
        },
        {
          name: "喜旺烤肠",
          specification: "160g", 
          price: 7.90,
          confidence: 0.89
        },
        {
          name: "双汇王中王",
          specification: "240g",
          price: 12.80,
          confidence: 0.91
        }
      ],
      processing_time: "2.1s",
      status: "success"
    }

    return mockOCRResult

  } catch (error) {
    console.error('OCR识别失败:', error)
    return {
      status: "failed",
      error: "OCR识别失败",
      detected_text: [],
      products: [],
      confidence: 0
    }
  }
}

// 真实的OCR集成示例（需要配置Google Vision API）
async function performRealOCR(imageUrl: string) {
  try {
    // 需要安装: npm install @google-cloud/vision
    // const vision = require('@google-cloud/vision')
    // const client = new vision.ImageAnnotatorClient()
    
    // const [result] = await client.textDetection(imageUrl)
    // const detections = result.textAnnotations
    
    // if (detections && detections.length > 0) {
    //   const fullText = detections[0].description
    //   const products = extractProductInfo(fullText)
    //   
    //   return {
    //     detected_text: fullText.split('\n'),
    //     products: products,
    //     confidence: 0.9,
    //     status: "success"
    //   }
    // }
    
    return performOCR(imageUrl) // 暂时使用模拟数据
    
  } catch (error) {
    console.error('Google Vision OCR失败:', error)
    return performOCR(imageUrl) // 降级到模拟数据
  }
}

// 从OCR文本中提取商品信息
function extractProductInfo(text: string) {
  const products: any[] = []
  const lines = text.split('\n')
  
  // 简单的正则表达式匹配商品名称和价格
  const priceRegex = /¥?(\d+\.?\d*)/g
  const productRegex = /([^¥\d]+)(\d+g|\d+ml)?/g
  
  // 这里需要更复杂的逻辑来准确提取商品信息
  // 现在返回简化的结果
  
  return products
}
