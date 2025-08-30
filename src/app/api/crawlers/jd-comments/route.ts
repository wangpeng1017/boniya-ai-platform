import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/connection'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'

// 京东评论爬取API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      product_id = '10032280299715', 
      product_url = 'https://item.jd.com/10032280299715.html',
      max_pages = 10,
      days_limit = 30 
    } = body

    // 基础验证
    if (!product_id) {
      return NextResponse.json(
        { success: false, error: '商品ID不能为空' },
        { status: 400 }
      )
    }

    // 检查是否已有进行中的任务
    const existingTask = await db.query(
      `SELECT id FROM jd_crawl_tasks 
       WHERE product_id = $1 AND task_status = 'running'`,
      [product_id]
    )

    if (existingTask.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: '该商品已有爬取任务在进行中' },
        { status: 409 }
      )
    }

    // 创建爬取任务记录
    const taskResult = await db.query(
      `INSERT INTO jd_crawl_tasks (product_id, product_url, task_status, start_time)
       VALUES ($1, $2, 'running', CURRENT_TIMESTAMP)
       RETURNING id`,
      [product_id, product_url]
    )

    const taskId = taskResult.rows[0].id

    // 异步执行爬虫
    executeCrawler(taskId, product_id, max_pages, days_limit)
      .catch(error => {
        console.error('爬虫执行失败:', error)
        // 更新任务状态为失败
        db.query(
          `UPDATE jd_crawl_tasks 
           SET task_status = 'failed', error_message = $1, end_time = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [error.message, taskId]
        )
      })

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
      const result = await db.query(
        `SELECT * FROM jd_crawl_tasks WHERE id = $1`,
        [task_id]
      )

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
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (product_id) {
      whereClause += ` AND product_id = $${paramIndex}`
      params.push(product_id)
      paramIndex++
    }

    const result = await db.query(
      `SELECT * FROM jd_crawl_tasks ${whereClause} 
       ORDER BY created_at DESC LIMIT 20`,
      params
    )

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

// 异步执行爬虫函数
async function executeCrawler(
  taskId: number, 
  productId: string, 
  maxPages: number, 
  daysLimit: number
) {
  return new Promise<void>((resolve, reject) => {
    // Python脚本路径
    const scriptPath = path.join(process.cwd(), 'src/lib/crawlers/jd_comment_spider.py')
    
    // 执行Python爬虫脚本
    const pythonProcess = spawn('python3', [
      scriptPath,
      '--product_id', productId,
      '--max_pages', maxPages.toString(),
      '--days_limit', daysLimit.toString(),
      '--task_id', taskId.toString()
    ])

    let output = ''
    let errorOutput = ''

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    pythonProcess.on('close', async (code) => {
      if (code === 0) {
        try {
          // 解析爬虫输出结果
          const result = JSON.parse(output)
          
          // 保存评论数据到数据库
          await saveCommentsToDatabase(taskId, productId, result.comments)
          
          // 更新任务状态
          await db.query(
            `UPDATE jd_crawl_tasks 
             SET task_status = 'completed', 
                 total_comments = $1, 
                 processed_comments = $2,
                 end_time = CURRENT_TIMESTAMP
             WHERE id = $3`,
            [result.total_comments, result.processed_comments, taskId]
          )

          resolve()
        } catch (error) {
          console.error('处理爬虫结果失败:', error)
          reject(error)
        }
      } else {
        const error = new Error(`爬虫执行失败，退出码: ${code}, 错误信息: ${errorOutput}`)
        reject(error)
      }
    })

    pythonProcess.on('error', (error) => {
      reject(new Error(`启动爬虫失败: ${error.message}`))
    })
  })
}

// 保存评论数据到数据库
async function saveCommentsToDatabase(taskId: number, productId: string, comments: any[]) {
  for (const comment of comments) {
    try {
      // 简单的情感分析
      const sentiment = analyzeSentiment(comment.comment_content)
      
      // 提取关键词
      const keywords = extractKeywords(comment.comment_content)

      await db.query(
        `INSERT INTO jd_comments (
          task_id, product_id, user_id, comment_id, comment_content,
          comment_time, star_rating, useful_vote_count, reply_count,
          user_level, user_level_name, phone_model, product_color,
          product_size, is_mobile, is_purchased, sentiment, keywords
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (comment_id) DO NOTHING`,
        [
          taskId, productId, comment.user_id, comment.comment_id,
          comment.comment_content, comment.comment_time, comment.star_rating,
          comment.useful_vote_count, comment.reply_count, comment.user_level,
          comment.user_level_name, comment.phone_model, comment.product_color,
          comment.product_size, comment.is_mobile, comment.is_purchased,
          sentiment, JSON.stringify(keywords)
        ]
      )
    } catch (error) {
      console.error('保存评论失败:', error)
    }
  }
}

// 简单的情感分析
function analyzeSentiment(text: string): string {
  if (!text) return 'neutral'
  
  const positiveWords = ['好', '棒', '赞', '满意', '喜欢', '推荐', '优秀', '完美', '不错']
  const negativeWords = ['差', '坏', '烂', '垃圾', '失望', '后悔', '问题', '投诉', '退货']
  
  const positiveCount = positiveWords.filter(word => text.includes(word)).length
  const negativeCount = negativeWords.filter(word => text.includes(word)).length
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

// 提取关键词
function extractKeywords(text: string): string[] {
  if (!text) return []
  
  const keywords = ['包装', '质量', '味道', '价格', '物流', '服务', '新鲜', '好吃', '满意', '推荐']
  return keywords.filter(keyword => text.includes(keyword))
}
