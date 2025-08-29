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

    // 创建销售预测表
    await sql`
      CREATE TABLE IF NOT EXISTS sales_forecasts (
        id SERIAL PRIMARY KEY,
        store_id VARCHAR(50),
        product_category VARCHAR(100),
        forecast_days INTEGER,
        confidence_level INTEGER,
        weather_condition VARCHAR(50),
        is_holiday BOOLEAN DEFAULT FALSE,
        is_promotion BOOLEAN DEFAULT FALSE,
        forecast_data JSONB,
        accuracy_rate DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建竞品价格表
    await sql`
      CREATE TABLE IF NOT EXISTS competitor_prices (
        id SERIAL PRIMARY KEY,
        product_name VARCHAR(200) NOT NULL,
        our_price DECIMAL(10,2) NOT NULL,
        competitor_name VARCHAR(100) NOT NULL,
        competitor_price DECIMAL(10,2) NOT NULL,
        location VARCHAR(200),
        office VARCHAR(100),
        price_advantage BOOLEAN,
        price_difference DECIMAL(10,2),
        price_difference_percent VARCHAR(10),
        image_url TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建文件上传表
    await sql`
      CREATE TABLE IF NOT EXISTS file_uploads (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255),
        file_path TEXT NOT NULL,
        file_size INTEGER,
        mime_type VARCHAR(100),
        upload_type VARCHAR(50),
        processing_status VARCHAR(50) DEFAULT 'pending',
        description TEXT,
        ocr_result JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建电商分析表
    await sql`
      CREATE TABLE IF NOT EXISTS ecommerce_analysis (
        id SERIAL PRIMARY KEY,
        platform VARCHAR(50),
        product_name VARCHAR(200),
        analysis_type VARCHAR(50),
        data_source VARCHAR(50),
        analysis_result JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建客服工单表
    await sql`
      CREATE TABLE IF NOT EXISTS service_tickets (
        id SERIAL PRIMARY KEY,
        ticket_number VARCHAR(50) UNIQUE,
        customer_name VARCHAR(100),
        customer_phone VARCHAR(20),
        customer_email VARCHAR(200),
        channel VARCHAR(50),
        category VARCHAR(100),
        priority VARCHAR(20) DEFAULT 'medium',
        subject VARCHAR(200),
        description TEXT NOT NULL,
        product_info JSONB,
        status VARCHAR(20) DEFAULT 'open',
        ai_analysis JSONB,
        resolution TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
      )
    `

    // 创建门店监控表
    await sql`
      CREATE TABLE IF NOT EXISTS store_monitoring_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(50) UNIQUE,
        store_id VARCHAR(50),
        camera_config JSONB,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP
      )
    `

    // 创建门店检查表
    await sql`
      CREATE TABLE IF NOT EXISTS store_inspections (
        id SERIAL PRIMARY KEY,
        store_id VARCHAR(50),
        inspector_name VARCHAR(100),
        inspection_type VARCHAR(50),
        checklist_items JSONB,
        overall_score INTEGER,
        notes TEXT,
        photos JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建门店预警配置表
    await sql`
      CREATE TABLE IF NOT EXISTS store_alert_configs (
        id SERIAL PRIMARY KEY,
        store_id VARCHAR(50) UNIQUE,
        alert_types JSONB,
        thresholds JSONB,
        notification_channels JSONB,
        escalation_rules JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建质量检测表
    await sql`
      CREATE TABLE IF NOT EXISTS quality_inspections (
        id SERIAL PRIMARY KEY,
        inspection_id VARCHAR(50) UNIQUE,
        batch_id VARCHAR(50),
        product_type VARCHAR(100),
        inspection_result JSONB,
        overall_quality VARCHAR(20),
        confidence_score DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建批次质量检查表
    await sql`
      CREATE TABLE IF NOT EXISTS batch_quality_checks (
        id SERIAL PRIMARY KEY,
        batch_id VARCHAR(50),
        product_type VARCHAR(100),
        inspector_name VARCHAR(100),
        sample_size INTEGER,
        pass_rate DECIMAL(5,2),
        avg_quality_score DECIMAL(5,2),
        batch_status VARCHAR(20),
        inspection_result JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建质量模型表
    await sql`
      CREATE TABLE IF NOT EXISTS quality_models (
        id SERIAL PRIMARY KEY,
        model_id VARCHAR(50) UNIQUE,
        model_name VARCHAR(100),
        defect_categories JSONB,
        performance_metrics JSONB,
        model_file_path TEXT,
        training_status VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建商品识别表
    await sql`
      CREATE TABLE IF NOT EXISTS recognition_products (
        id SERIAL PRIMARY KEY,
        product_name VARCHAR(200) NOT NULL,
        category VARCHAR(100),
        price_per_kg DECIMAL(10,2),
        product_code VARCHAR(50),
        description TEXT,
        training_images JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建商品识别记录表
    await sql`
      CREATE TABLE IF NOT EXISTS product_recognitions (
        id SERIAL PRIMARY KEY,
        recognition_id VARCHAR(50) UNIQUE,
        image_data JSONB,
        recognition_result JSONB,
        primary_product_id VARCHAR(50),
        confidence_score DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建识别模型表
    await sql`
      CREATE TABLE IF NOT EXISTS recognition_models (
        id SERIAL PRIMARY KEY,
        model_id VARCHAR(50) UNIQUE,
        model_name VARCHAR(100),
        product_categories JSONB,
        performance_metrics JSONB,
        model_file_path TEXT,
        training_status VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建MOP同步日志表
    await sql`
      CREATE TABLE IF NOT EXISTS mop_sync_logs (
        id SERIAL PRIMARY KEY,
        sync_id VARCHAR(50) UNIQUE,
        store_id VARCHAR(50),
        products_synced INTEGER,
        successful_syncs INTEGER,
        failed_syncs INTEGER,
        sync_details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建投诉分析表
    await sql`
      CREATE TABLE IF NOT EXISTS complaint_analysis (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER REFERENCES service_tickets(id),
        analysis_result JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log('数据库表结构初始化完成')

    return NextResponse.json({
      success: true,
      message: '数据库初始化成功',
      tables: [
        'jd_crawl_tasks',
        'jd_comments',
        'jd_comment_stats',
        'system_logs',
        'sales_forecasts',
        'competitor_prices',
        'file_uploads',
        'ecommerce_analysis',
        'service_tickets',
        'store_monitoring_sessions',
        'store_inspections',
        'store_alert_configs',
        'quality_inspections',
        'batch_quality_checks',
        'quality_models',
        'recognition_products',
        'product_recognitions',
        'recognition_models',
        'mop_sync_logs',
        'complaint_analysis'
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
    const stats: Record<string, string | number> = {}
    for (const table of tables.rows) {
      try {
        const count = await sql.query(`SELECT COUNT(*) as count FROM ${table.table_name}`)
        stats[table.table_name] = count.rows[0].count
      } catch {
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
