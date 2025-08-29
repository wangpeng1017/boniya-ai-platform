import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

// 数据库初始化API
export async function POST() {
  try {
    console.log('开始初始化数据库表结构...')

    // 创建京东评论爬取任务表
    await sql`
      CREATE TABLE IF NOT EXISTS jd_crawl_tasks (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(50) NOT NULL,
        product_url TEXT NOT NULL,
        task_status VARCHAR(20) DEFAULT 'pending',
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        total_comments INTEGER DEFAULT 0,
        processed_comments INTEGER DEFAULT 0,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建京东评论数据表
    await sql`
      CREATE TABLE IF NOT EXISTS jd_comments (
        id SERIAL PRIMARY KEY,
        task_id INTEGER,
        product_id VARCHAR(50) NOT NULL,
        user_id VARCHAR(100),
        comment_id VARCHAR(100) UNIQUE,
        comment_content TEXT NOT NULL,
        comment_time TIMESTAMP,
        star_rating INTEGER,
        useful_vote_count INTEGER DEFAULT 0,
        reply_count INTEGER DEFAULT 0,
        user_level VARCHAR(50),
        user_level_name VARCHAR(100),
        phone_model VARCHAR(200),
        product_color VARCHAR(100),
        product_size VARCHAR(100),
        is_mobile BOOLEAN DEFAULT false,
        is_purchased BOOLEAN DEFAULT true,
        sentiment VARCHAR(20),
        keywords JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建京东评论统计表
    await sql`
      CREATE TABLE IF NOT EXISTS jd_comment_stats (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(50) NOT NULL,
        stat_date DATE NOT NULL,
        total_comments INTEGER DEFAULT 0,
        positive_comments INTEGER DEFAULT 0,
        negative_comments INTEGER DEFAULT 0,
        neutral_comments INTEGER DEFAULT 0,
        avg_rating DECIMAL(3,2),
        total_useful_votes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id, stat_date)
      )
    `

    // 创建系统日志表
    await sql`
      CREATE TABLE IF NOT EXISTS system_logs (
        id SERIAL PRIMARY KEY,
        log_level VARCHAR(20) NOT NULL,
        module VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建索引
    await sql`CREATE INDEX IF NOT EXISTS idx_jd_crawl_tasks_product ON jd_crawl_tasks(product_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_jd_crawl_tasks_status ON jd_crawl_tasks(task_status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_jd_comments_product ON jd_comments(product_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_jd_comments_time ON jd_comments(comment_time)`
    await sql`CREATE INDEX IF NOT EXISTS idx_jd_comments_sentiment ON jd_comments(sentiment)`
    await sql`CREATE INDEX IF NOT EXISTS idx_jd_comment_stats_product_date ON jd_comment_stats(product_id, stat_date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_system_logs_module ON system_logs(module)`
    await sql`CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at)`

    console.log('数据库表结构初始化完成')

    return NextResponse.json({
      success: true,
      message: '数据库初始化成功',
      tables: [
        'jd_crawl_tasks',
        'jd_comments', 
        'jd_comment_stats',
        'system_logs'
      ],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('数据库初始化失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// 获取数据库状态
export async function GET() {
  try {
    // 检查表是否存在
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `

    // 获取各表的记录数
    const stats = {}
    for (const table of tables.rows) {
      try {
        const count = await sql.query(`SELECT COUNT(*) as count FROM ${table.table_name}`)
        stats[table.table_name] = count.rows[0].count
      } catch (err) {
        stats[table.table_name] = 'Error'
      }
    }

    return NextResponse.json({
      success: true,
      message: '数据库状态检查完成',
      tables: tables.rows.map(row => row.table_name),
      tableStats: stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('数据库状态检查失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
