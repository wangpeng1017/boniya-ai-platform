import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: '波尼亚AI平台运行正常',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      modules: {
        'sales-forecast': '销售预测模块',
        'competitor-analysis': '竞品价格分析',
        'ecommerce-analysis': '电商平台数据分析',
        'customer-service': '智能客服管理',
        'store-operations': '门店运营标准化管理',
        'quality-control': '产品品质智能控制',
        'product-recognition': '称重商品自动识别'
      }
    })
  } catch (err) {
    console.error('Health check failed:', err)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}
