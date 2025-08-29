import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

// 京东评论爬取API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      product_id = '10032280299715',
      product_url = 'https://item.jd.com/10032280299715.html'
      // max_pages = 10,  // 暂时未使用
      // days_limit = 30  // 暂时未使用
    } = body

    // 基础验证
    if (!product_id) {
      return NextResponse.json(
        { success: false, error: '商品ID不能为空' },
        { status: 400 }
      )
    }

    // 检查是否已有进行中的任务
    const existingTask = await sql`
      SELECT id FROM jd_crawl_tasks 
      WHERE product_id = ${product_id} AND task_status = 'running'
    `

    if (existingTask.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: '该商品已有爬取任务在进行中' },
        { status: 409 }
      )
    }

    // 创建爬取任务记录
    const taskResult = await sql`
      INSERT INTO jd_crawl_tasks (product_id, product_url, task_status, start_time)
      VALUES (${product_id}, ${product_url}, 'running', CURRENT_TIMESTAMP)
      RETURNING id
    `

    const taskId = taskResult.rows[0].id

    // 模拟爬取过程（实际项目中这里会调用Python爬虫）
    setTimeout(async () => {
      try {
        // 模拟爬取数据
        const mockComments = [
          {
            user_id: 'user_001',
            comment_id: `comment_${Date.now()}_1`,
            comment_content: '这个商品质量很好，包装也很精美，物流速度很快！',
            comment_time: new Date().toISOString(),
            star_rating: 5,
            useful_vote_count: 12,
            reply_count: 2,
            user_level: '3',
            user_level_name: '金牌会员',
            phone_model: 'iPhone 15',
            sentiment: 'positive'
          },
          {
            user_id: 'user_002', 
            comment_id: `comment_${Date.now()}_2`,
            comment_content: '价格有点贵，但是质量确实不错，值得购买。',
            comment_time: new Date().toISOString(),
            star_rating: 4,
            useful_vote_count: 8,
            reply_count: 1,
            user_level: '2',
            user_level_name: '银牌会员',
            phone_model: 'Android',
            sentiment: 'positive'
          },
          {
            user_id: 'user_003',
            comment_id: `comment_${Date.now()}_3`, 
            comment_content: '收到货发现有点问题，客服态度还可以，正在处理中。',
            comment_time: new Date().toISOString(),
            star_rating: 3,
            useful_vote_count: 5,
            reply_count: 0,
            user_level: '1',
            user_level_name: '铜牌会员',
            phone_model: 'Xiaomi',
            sentiment: 'neutral'
          }
        ]

        // 保存评论数据
        for (const comment of mockComments) {
          await sql`
            INSERT INTO jd_comments (
              task_id, product_id, user_id, comment_id, comment_content,
              comment_time, star_rating, useful_vote_count, reply_count,
              user_level, user_level_name, phone_model, sentiment,
              keywords
            ) VALUES (
              ${taskId}, ${product_id}, ${comment.user_id}, ${comment.comment_id},
              ${comment.comment_content}, ${comment.comment_time}, ${comment.star_rating},
              ${comment.useful_vote_count}, ${comment.reply_count}, ${comment.user_level},
              ${comment.user_level_name}, ${comment.phone_model}, ${comment.sentiment},
              ${JSON.stringify(['质量', '包装', '物流'])}
            )
          `
        }

        // 更新任务状态
        await sql`
          UPDATE jd_crawl_tasks 
          SET task_status = 'completed', 
              total_comments = ${mockComments.length}, 
              processed_comments = ${mockComments.length},
              end_time = CURRENT_TIMESTAMP
          WHERE id = ${taskId}
        `

        console.log(`任务 ${taskId} 完成，爬取了 ${mockComments.length} 条评论`)

      } catch (error) {
        console.error('模拟爬取过程失败:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        await sql`
          UPDATE jd_crawl_tasks
          SET task_status = 'failed',
              error_message = ${errorMessage},
              end_time = CURRENT_TIMESTAMP
          WHERE id = ${taskId}
        `
      }
    }, 5000) // 5秒后完成模拟爬取

    return NextResponse.json({
      success: true,
      data: {
        task_id: taskId,
        product_id,
        status: 'running',
        message: '爬取任务已启动，请稍后查看结果'
      }
    })

  } catch (error) {
    console.error('创建爬取任务失败:', error)
    return NextResponse.json(
      { success: false, error: '创建爬取任务失败' },
      { status: 500 }
    )
  }
}

// 获取爬取任务状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const task_id = searchParams.get('task_id')
    const product_id = searchParams.get('product_id')

    if (task_id) {
      // 获取特定任务状态
      const result = await sql`
        SELECT * FROM jd_crawl_tasks WHERE id = ${task_id}
      `

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: '任务不存在' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: result.rows[0]
      })
    }

    // 获取任务列表
    let query = sql`
      SELECT * FROM jd_crawl_tasks 
      ORDER BY created_at DESC 
      LIMIT 20
    `

    if (product_id) {
      query = sql`
        SELECT * FROM jd_crawl_tasks 
        WHERE product_id = ${product_id}
        ORDER BY created_at DESC 
        LIMIT 20
      `
    }

    const result = await query

    return NextResponse.json({
      success: true,
      data: result.rows
    })

  } catch (error) {
    console.error('获取任务状态失败:', error)
    return NextResponse.json(
      { success: false, error: '获取任务状态失败' },
      { status: 500 }
    )
  }
}
