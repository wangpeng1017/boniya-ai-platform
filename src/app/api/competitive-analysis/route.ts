import { NextRequest, NextResponse } from 'next/server'
import { performBaiduOCR, extractProductInfo, validateImageFile } from '@/utils/baiduOCR'

// 模拟竞品价格数据
const mockCompetitorData = [
  {
    id: 1,
    product_name: '经典1903 果木烤火腿(350g)',
    our_price: 19.9,
    competitor_name: '手掰肉老火腿 340g',
    competitor_price: 22.9,
    price_advantage: true,
    price_difference: -3.0,
    price_difference_percent: '-13.1%',
    location: '青岛办事处',
    office: '青岛办事处',
    category: 'ham',
    created_at: '2025-01-15T10:30:00Z'
  },
  {
    id: 2,
    product_name: '1981 青岛老火腿(300g)',
    our_price: 29.9,
    competitor_name: '无淀粉大肉块火腿 340g',
    competitor_price: 26.9,
    price_advantage: false,
    price_difference: 3.0,
    price_difference_percent: '+11.2%',
    location: '青岛办事处',
    office: '青岛办事处',
    category: 'ham',
    created_at: '2025-01-15T11:15:00Z'
  },
  {
    id: 3,
    product_name: '波尼亚烤肠五香(160g)',
    our_price: 7.9,
    competitor_name: '喜旺烤肠 160g',
    competitor_price: 7.9,
    price_advantage: null,
    price_difference: 0,
    price_difference_percent: '0%',
    location: '青岛办事处',
    office: '青岛办事处',
    category: 'sausage',
    created_at: '2025-01-15T14:20:00Z'
  }
]

// 处理图片上传和OCR识别
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    
    // 处理图片上传和OCR识别
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('image') as File
      const location = formData.get('location') as string || ''
      const office = formData.get('office') as string || '青岛办事处'
      
      if (!file) {
        return NextResponse.json({
          success: false,
          error: '请选择要上传的图片'
        }, { status: 400 })
      }

      // 验证图片文件
      const validation = validateImageFile(file)
      if (!validation.valid) {
        return NextResponse.json({
          success: false,
          error: validation.error
        }, { status: 400 })
      }

      try {
        // 将文件转换为Buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // 调用百度OCR进行识别
        const ocrResult = await performBaiduOCR(buffer)
        
        if (!ocrResult.success) {
          return NextResponse.json({
            success: false,
            error: ocrResult.error || 'OCR识别失败'
          }, { status: 500 })
        }

        // 提取商品信息
        const extractedProducts = extractProductInfo(ocrResult)
        
        // 返回OCR识别结果
        return NextResponse.json({
          success: true,
          data: {
            ocr_result: ocrResult.data,
            extracted_products: extractedProducts,
            upload_info: {
              filename: file.name,
              size: file.size,
              type: file.type,
              location: location,
              office: office,
              timestamp: new Date().toISOString()
            }
          }
        })

      } catch (error) {
        console.error('OCR处理失败:', error)
        return NextResponse.json({
          success: false,
          error: 'OCR处理失败，请稍后重试'
        }, { status: 500 })
      }
    }
    
    // 处理竞品数据添加
    else if (contentType.includes('application/json')) {
      const body = await request.json()
      const { 
        product_name, 
        our_price, 
        competitor_name, 
        competitor_price, 
        location, 
        office,
        category 
      } = body

      // 验证必填字段
      if (!product_name || !our_price || !competitor_name || !competitor_price) {
        return NextResponse.json({
          success: false,
          error: '请填写完整的商品信息'
        }, { status: 400 })
      }

      // 计算价格差异
      const priceDiff = our_price - competitor_price
      const priceDiffPercent = competitor_price > 0 
        ? ((priceDiff / competitor_price) * 100).toFixed(1) + '%'
        : '0%'

      // 创建新的竞品数据
      const newCompetitorData = {
        id: mockCompetitorData.length + 1,
        product_name,
        our_price: parseFloat(our_price),
        competitor_name,
        competitor_price: parseFloat(competitor_price),
        price_advantage: priceDiff < 0,
        price_difference: priceDiff,
        price_difference_percent: priceDiff >= 0 ? `+${priceDiffPercent}` : priceDiffPercent,
        location: location || '青岛办事处',
        office: office || '青岛办事处',
        category: category || 'other',
        created_at: new Date().toISOString()
      }

      // 添加到模拟数据中
      mockCompetitorData.push(newCompetitorData)

      return NextResponse.json({
        success: true,
        message: '竞品数据添加成功',
        data: newCompetitorData
      })
    }

    return NextResponse.json({
      success: false,
      error: '不支持的请求格式'
    }, { status: 400 })

  } catch (error) {
    console.error('竞品分析API错误:', error)
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}

// 获取竞品分析数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const office = searchParams.get('office')
    const category = searchParams.get('category')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let filteredData = [...mockCompetitorData]

    // 按办事处筛选
    if (office && office !== 'all') {
      filteredData = filteredData.filter(item => item.office === office)
    }

    // 按类别筛选
    if (category && category !== 'all') {
      filteredData = filteredData.filter(item => item.category === category)
    }

    // 按日期筛选
    if (startDate) {
      filteredData = filteredData.filter(item => 
        new Date(item.created_at) >= new Date(startDate)
      )
    }
    if (endDate) {
      filteredData = filteredData.filter(item => 
        new Date(item.created_at) <= new Date(endDate)
      )
    }

    // 生成分析摘要
    const summary = {
      total_products: filteredData.length,
      advantage_count: filteredData.filter(item => item.price_advantage === true).length,
      disadvantage_count: filteredData.filter(item => item.price_advantage === false).length,
      neutral_count: filteredData.filter(item => item.price_advantage === null).length,
      avg_price_difference: filteredData.length > 0 
        ? (filteredData.reduce((sum, item) => sum + item.price_difference, 0) / filteredData.length).toFixed(2)
        : '0.00'
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      summary: summary
    })

  } catch (error) {
    console.error('获取竞品分析数据失败:', error)
    return NextResponse.json({
      success: false,
      error: '获取数据失败'
    }, { status: 500 })
  }
}
