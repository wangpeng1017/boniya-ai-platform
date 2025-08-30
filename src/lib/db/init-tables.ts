import { executeSafeQuery } from './connection'

/**
 * 初始化所有数据库表
 */
export async function initializeTables() {
  try {
    console.log('开始初始化数据库表结构...')

    // 创建销售预测表
    await executeSafeQuery`
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
    await executeSafeQuery`
      CREATE TABLE IF NOT EXISTS competitor_prices (
        id SERIAL PRIMARY KEY,
        product_name VARCHAR(200) NOT NULL,
        our_price DECIMAL(10,2) NOT NULL,
        competitor_name VARCHAR(100) NOT NULL,
        competitor_price DECIMAL(10,2) NOT NULL,
        price_advantage BOOLEAN,
        price_difference DECIMAL(10,2),
        price_difference_percent VARCHAR(10),
        location VARCHAR(100),
        office VARCHAR(100),
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建电商分析表
    await executeSafeQuery`
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
    await executeSafeQuery`
      CREATE TABLE IF NOT EXISTS service_tickets (
        id SERIAL PRIMARY KEY,
        ticket_number VARCHAR(50) UNIQUE,
        customer_name VARCHAR(100),
        customer_phone VARCHAR(20),
        customer_email VARCHAR(100),
        issue_type VARCHAR(50),
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'open',
        description TEXT,
        assigned_to VARCHAR(100),
        resolution TEXT,
        satisfaction_rating INTEGER,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
      )
    `

    // 创建门店监控表
    await executeSafeQuery`
      CREATE TABLE IF NOT EXISTS store_monitoring_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(50) UNIQUE,
        store_id VARCHAR(50),
        camera_config JSONB,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP
      )
    `

    // 创建门店检查表
    await executeSafeQuery`
      CREATE TABLE IF NOT EXISTS store_inspections (
        id SERIAL PRIMARY KEY,
        store_id VARCHAR(50),
        inspector_name VARCHAR(100),
        inspection_type VARCHAR(50),
        compliance_score INTEGER,
        issues_found JSONB,
        recommendations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建质量检测表
    await executeSafeQuery`
      CREATE TABLE IF NOT EXISTS quality_inspections (
        id SERIAL PRIMARY KEY,
        inspection_id VARCHAR(50) UNIQUE,
        batch_id VARCHAR(50),
        product_type VARCHAR(100),
        inspection_result JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建商品识别表
    await executeSafeQuery`
      CREATE TABLE IF NOT EXISTS recognition_products (
        id SERIAL PRIMARY KEY,
        product_name VARCHAR(200) NOT NULL,
        category VARCHAR(100),
        price_per_kg DECIMAL(10,2),
        barcode VARCHAR(50),
        image_features JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建商品识别记录表
    await executeSafeQuery`
      CREATE TABLE IF NOT EXISTS product_recognitions (
        id SERIAL PRIMARY KEY,
        recognition_id VARCHAR(50) UNIQUE,
        image_data JSONB,
        recognition_result JSONB,
        confidence_score DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建京东评论表（如果需要）
    await executeSafeQuery`
      CREATE TABLE IF NOT EXISTS jd_comments (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(50) NOT NULL,
        product_name VARCHAR(200),
        comment_id VARCHAR(50) UNIQUE,
        user_id VARCHAR(50),
        username VARCHAR(100),
        comment_text TEXT,
        rating INTEGER,
        comment_time TIMESTAMP,
        useful_votes INTEGER DEFAULT 0,
        reply_count INTEGER DEFAULT 0,
        sentiment VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建文件上传表
    await executeSafeQuery`
      CREATE TABLE IF NOT EXISTS file_uploads (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255),
        file_path TEXT NOT NULL,
        file_size INTEGER,
        mime_type VARCHAR(100),
        upload_type VARCHAR(50),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 创建系统日志表
    await executeSafeQuery`
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
    await executeSafeQuery`CREATE INDEX IF NOT EXISTS idx_sales_forecasts_store ON sales_forecasts(store_id)`
    await executeSafeQuery`CREATE INDEX IF NOT EXISTS idx_sales_forecasts_created ON sales_forecasts(created_at)`
    await executeSafeQuery`CREATE INDEX IF NOT EXISTS idx_competitor_prices_product ON competitor_prices(product_name)`
    await executeSafeQuery`CREATE INDEX IF NOT EXISTS idx_competitor_prices_created ON competitor_prices(created_at)`
    await executeSafeQuery`CREATE INDEX IF NOT EXISTS idx_ecommerce_analysis_platform ON ecommerce_analysis(platform)`
    await executeSafeQuery`CREATE INDEX IF NOT EXISTS idx_service_tickets_status ON service_tickets(status)`
    await executeSafeQuery`CREATE INDEX IF NOT EXISTS idx_service_tickets_created ON service_tickets(created_at)`
    await executeSafeQuery`CREATE INDEX IF NOT EXISTS idx_store_inspections_store ON store_inspections(store_id)`
    await executeSafeQuery`CREATE INDEX IF NOT EXISTS idx_quality_inspections_batch ON quality_inspections(batch_id)`
    await executeSafeQuery`CREATE INDEX IF NOT EXISTS idx_product_recognitions_created ON product_recognitions(created_at)`
    await executeSafeQuery`CREATE INDEX IF NOT EXISTS idx_jd_comments_product ON jd_comments(product_id)`
    await executeSafeQuery`CREATE INDEX IF NOT EXISTS idx_jd_comments_time ON jd_comments(comment_time)`
    await executeSafeQuery`CREATE INDEX IF NOT EXISTS idx_system_logs_module ON system_logs(module)`
    await executeSafeQuery`CREATE INDEX IF NOT EXISTS idx_system_logs_created ON system_logs(created_at)`

    console.log('数据库表结构初始化完成')
    return { success: true, message: '数据库表结构初始化完成' }

  } catch (error) {
    console.error('数据库初始化失败:', error)
    throw error
  }
}

/**
 * 检查数据库连接和表状态
 */
export async function checkDatabaseStatus() {
  try {
    // 检查表是否存在
    const tables = await executeSafeQuery`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `

    // 检查关键表的记录数
    const salesForecastCount = await executeSafeQuery`SELECT COUNT(*) as count FROM sales_forecasts`
    const competitorPriceCount = await executeSafeQuery`SELECT COUNT(*) as count FROM competitor_prices`
    const ecommerceAnalysisCount = await executeSafeQuery`SELECT COUNT(*) as count FROM ecommerce_analysis`

    return {
      success: true,
      tables: tables.rows.map(row => row.table_name),
      record_counts: {
        sales_forecasts: salesForecastCount.rows[0].count,
        competitor_prices: competitorPriceCount.rows[0].count,
        ecommerce_analysis: ecommerceAnalysisCount.rows[0].count
      },
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('数据库状态检查失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }
  }
}
