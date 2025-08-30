import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/connection'

// 定时任务API - 每天自动爬取京东评论
export async function POST(request: NextRequest) {
  try {
    // 验证请求来源（可以添加API密钥验证）
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET_TOKEN || 'your-secret-token'
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    // 获取需要定时爬取的商品列表
    const products = [
      {
        product_id: '10032280299715',
        product_url: 'https://item.jd.com/10032280299715.html',
        max_pages: 10,
        days_limit: 1  // 只爬取最近1天的新评论
      }
      // 可以添加更多商品
    ]

    const results = []

    for (const product of products) {
      try {
        // 检查是否已有今天的爬取任务
        const today = new Date().toISOString().split('T')[0]
        const existingTask = await db.query(
          `SELECT id FROM jd_crawl_tasks 
           WHERE product_id = $1 
           AND DATE(created_at) = $2 
           AND task_status IN ('completed', 'running')`,
          [product.product_id, today]
        )

        if (existingTask.rows.length > 0) {
          results.push({
            product_id: product.product_id,
            status: 'skipped',
            message: '今天已经爬取过了'
          })
          continue
        }

        // 调用爬取API
        const crawlResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/crawlers/jd-comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product)
        })

        const crawlResult = await crawlResponse.json()

        results.push({
          product_id: product.product_id,
          status: crawlResult.success ? 'started' : 'failed',
          task_id: crawlResult.data?.task_id,
          message: crawlResult.message || crawlResult.error
        })

      } catch (error) {
        results.push({
          product_id: product.product_id,
          status: 'error',
          message: error.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        executed_at: new Date().toISOString(),
        products_processed: products.length,
        results
      }
    })

  } catch (error) {
    console.error('定时任务执行失败:', error)
    return NextResponse.json(
      { success: false, error: '定时任务执行失败' },
      { status: 500 }
    )
  }
}

// 获取定时任务执行历史
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

    // 获取最近N天的任务执行情况
    const result = await db.query(
      `SELECT 
         DATE(created_at) as date,
         COUNT(*) as total_tasks,
         COUNT(CASE WHEN task_status = 'completed' THEN 1 END) as completed_tasks,
         COUNT(CASE WHEN task_status = 'failed' THEN 1 END) as failed_tasks,
         COUNT(CASE WHEN task_status = 'running' THEN 1 END) as running_tasks,
         SUM(total_comments) as total_comments
       FROM jd_crawl_tasks 
       WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      []
    )

    return NextResponse.json({
      success: true,
      data: result.rows
    })

  } catch (error) {
    console.error('获取任务历史失败:', error)
    return NextResponse.json(
      { success: false, error: '获取任务历史失败' },
      { status: 500 }
    )
  }
}
