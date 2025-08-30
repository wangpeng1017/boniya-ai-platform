-- 波尼亚AI平台数据库结构设计

-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 门店表
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    region VARCHAR(100),
    office VARCHAR(100), -- 办事处
    manager_name VARCHAR(100),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 物料/商品表
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(20), -- 库存单位
    price DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 销售历史数据表
CREATE TABLE sales_history (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    store_id INTEGER REFERENCES stores(id),
    product_id INTEGER REFERENCES products(id),
    quantity DECIMAL(10,3) NOT NULL,
    amount DECIMAL(10,2),
    weather VARCHAR(50), -- 天气情况
    is_holiday BOOLEAN DEFAULT FALSE,
    is_promotion BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 销售预测表
CREATE TABLE sales_forecasts (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id),
    product_id INTEGER REFERENCES products(id),
    forecast_date DATE NOT NULL,
    predicted_quantity DECIMAL(10,3) NOT NULL,
    confidence_score DECIMAL(5,4), -- 置信度
    model_version VARCHAR(50),
    external_factors JSONB, -- 外部因素（天气、节假日等）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 竞品信息表
CREATE TABLE competitors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 竞品价格数据表
CREATE TABLE competitor_prices (
    id SERIAL PRIMARY KEY,
    location VARCHAR(200) NOT NULL, -- 地点
    office VARCHAR(100), -- 办事处
    our_product_name VARCHAR(200),
    our_price DECIMAL(10,2),
    competitor_id INTEGER REFERENCES competitors(id),
    competitor_product_name VARCHAR(200),
    competitor_price DECIMAL(10,2),
    collection_date DATE NOT NULL,
    collector_id INTEGER REFERENCES users(id),
    image_url TEXT, -- 采集照片URL
    latitude DECIMAL(10,8), -- 纬度
    longitude DECIMAL(11,8), -- 经度
    status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 文件上传记录表
CREATE TABLE file_uploads (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    upload_type VARCHAR(50), -- competitor_photo, quality_check, etc.
    uploader_id INTEGER REFERENCES users(id),
    processing_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    ocr_result JSONB, -- OCR识别结果
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 电商平台表
CREATE TABLE ecommerce_platforms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- 京东、天猫、拼多多、私域等
    platform_code VARCHAR(50) UNIQUE NOT NULL,
    api_config JSONB, -- API配置信息
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 电商订单表
CREATE TABLE ecommerce_orders (
    id SERIAL PRIMARY KEY,
    platform_id INTEGER REFERENCES ecommerce_platforms(id),
    order_id VARCHAR(100) NOT NULL, -- 平台订单号
    product_id INTEGER REFERENCES products(id),
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    order_amount DECIMAL(10,2),
    order_date TIMESTAMP,
    order_status VARCHAR(50),
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 售后反馈表
CREATE TABLE customer_feedback (
    id SERIAL PRIMARY KEY,
    platform_id INTEGER REFERENCES ecommerce_platforms(id),
    order_id INTEGER REFERENCES ecommerce_orders(id),
    feedback_type VARCHAR(50), -- complaint, suggestion, praise
    feedback_content TEXT NOT NULL,
    sentiment VARCHAR(20), -- positive, negative, neutral
    keywords JSONB, -- 提取的关键词
    category VARCHAR(100), -- 问题分类
    priority VARCHAR(20) DEFAULT 'medium', -- high, medium, low
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, resolved
    handler_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- 客服工单表
CREATE TABLE service_tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(100),
    customer_contact VARCHAR(200),
    channel VARCHAR(50), -- phone, online, social_media
    issue_type VARCHAR(100),
    issue_description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed
    assigned_to INTEGER REFERENCES users(id),
    audio_file_url TEXT, -- 录音文件URL
    transcript TEXT, -- 语音转文字结果
    nlp_analysis JSONB, -- NLP分析结果
    resolution TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_sales_history_date ON sales_history(date);
CREATE INDEX idx_sales_history_store_product ON sales_history(store_id, product_id);
CREATE INDEX idx_competitor_prices_date ON competitor_prices(collection_date);
CREATE INDEX idx_competitor_prices_location ON competitor_prices(location);
CREATE INDEX idx_file_uploads_status ON file_uploads(processing_status);
CREATE INDEX idx_ecommerce_orders_platform ON ecommerce_orders(platform_id);
CREATE INDEX idx_ecommerce_orders_date ON ecommerce_orders(order_date);
CREATE INDEX idx_customer_feedback_platform ON customer_feedback(platform_id);
CREATE INDEX idx_customer_feedback_sentiment ON customer_feedback(sentiment);
CREATE INDEX idx_service_tickets_status ON service_tickets(status);
CREATE INDEX idx_service_tickets_created ON service_tickets(created_at);

-- 监控摄像头表
CREATE TABLE surveillance_cameras (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id),
    camera_name VARCHAR(100) NOT NULL,
    camera_location VARCHAR(200), -- 摄像头位置描述
    rtmp_url TEXT, -- 视频流地址
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, maintenance
    monitoring_areas JSONB, -- 监控区域配置
    ai_features JSONB, -- 启用的AI功能
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 监控预警表
CREATE TABLE surveillance_alerts (
    id SERIAL PRIMARY KEY,
    camera_id INTEGER REFERENCES surveillance_cameras(id),
    store_id INTEGER REFERENCES stores(id),
    alert_type VARCHAR(100) NOT NULL, -- dress_code, absence, phone_usage, display_violation
    alert_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    description TEXT NOT NULL,
    screenshot_url TEXT, -- 预警截图
    detection_confidence DECIMAL(5,4), -- AI检测置信度
    status VARCHAR(20) DEFAULT 'pending', -- pending, acknowledged, resolved, false_positive
    handler_id INTEGER REFERENCES users(id),
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP
);

-- 合规检查记录表
CREATE TABLE compliance_checks (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id),
    check_date DATE NOT NULL,
    check_type VARCHAR(100), -- daily, weekly, monthly
    dress_code_score DECIMAL(5,2), -- 着装合规评分
    attendance_score DECIMAL(5,2), -- 在岗情况评分
    display_score DECIMAL(5,2), -- 陈列标准评分
    overall_score DECIMAL(5,2), -- 总体评分
    violations_count INTEGER DEFAULT 0,
    recommendations TEXT, -- 改进建议
    checker_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 质量检测设备表
CREATE TABLE quality_inspection_devices (
    id SERIAL PRIMARY KEY,
    device_name VARCHAR(100) NOT NULL,
    device_type VARCHAR(50), -- incoming, production, outgoing
    location VARCHAR(200),
    model VARCHAR(100),
    ai_model_version VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    last_calibration TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 质量检测记录表
CREATE TABLE quality_inspections (
    id SERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES quality_inspection_devices(id),
    product_id INTEGER REFERENCES products(id),
    batch_number VARCHAR(100),
    inspection_type VARCHAR(50), -- visual, defect, contamination
    inspection_result VARCHAR(20), -- pass, fail, warning
    defect_types JSONB, -- 检测到的缺陷类型
    confidence_scores JSONB, -- 各项检测的置信度
    images JSONB, -- 检测图片URLs
    inspector_id INTEGER REFERENCES users(id),
    inspected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 商品识别模型表
CREATE TABLE product_recognition_models (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50),
    product_categories JSONB, -- 支持识别的商品类别
    accuracy_rate DECIMAL(5,4), -- 模型准确率
    training_data_count INTEGER, -- 训练数据量
    model_file_path TEXT,
    status VARCHAR(20) DEFAULT 'active',
    deployed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 商品识别记录表
CREATE TABLE product_recognitions (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id),
    model_id INTEGER REFERENCES product_recognition_models(id),
    image_url TEXT NOT NULL,
    recognition_results JSONB, -- 识别结果和置信度
    actual_product_id INTEGER REFERENCES products(id), -- 实际商品（用于训练反馈）
    is_correct BOOLEAN, -- 识别是否正确
    processing_time_ms INTEGER, -- 处理耗时
    cashier_id INTEGER REFERENCES users(id),
    recognized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建额外索引
CREATE INDEX idx_surveillance_cameras_store ON surveillance_cameras(store_id);
CREATE INDEX idx_surveillance_alerts_camera ON surveillance_alerts(camera_id);
CREATE INDEX idx_surveillance_alerts_detected ON surveillance_alerts(detected_at);
CREATE INDEX idx_compliance_checks_store_date ON compliance_checks(store_id, check_date);
CREATE INDEX idx_quality_inspections_device ON quality_inspections(device_id);
CREATE INDEX idx_quality_inspections_result ON quality_inspections(inspection_result);
CREATE INDEX idx_product_recognitions_store ON product_recognitions(store_id);
CREATE INDEX idx_product_recognitions_model ON product_recognitions(model_id);

-- 京东评论爬取任务表
CREATE TABLE jd_crawl_tasks (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL, -- 京东商品ID
    product_url TEXT NOT NULL, -- 商品URL
    task_status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    total_comments INTEGER DEFAULT 0,
    processed_comments INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 京东评论数据表
CREATE TABLE jd_comments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES jd_crawl_tasks(id),
    product_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(100), -- 京东用户ID
    comment_id VARCHAR(100), -- 评论ID
    comment_content TEXT NOT NULL, -- 评论内容
    comment_time TIMESTAMP, -- 评论时间
    star_rating INTEGER, -- 星级评分 1-5
    useful_vote_count INTEGER DEFAULT 0, -- 点赞数
    reply_count INTEGER DEFAULT 0, -- 回复数
    user_level VARCHAR(50), -- 会员级别
    user_level_name VARCHAR(100), -- 会员级别名称
    phone_model VARCHAR(200), -- 手机型号
    product_color VARCHAR(100), -- 商品颜色
    product_size VARCHAR(100), -- 商品尺寸
    is_mobile BOOLEAN DEFAULT false, -- 是否手机端评论
    is_purchased BOOLEAN DEFAULT true, -- 是否购买后评论
    sentiment VARCHAR(20), -- 情感分析结果: positive, negative, neutral
    keywords JSONB, -- 提取的关键词
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 京东评论统计表
CREATE TABLE jd_comment_stats (
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
);

-- 创建索引
CREATE INDEX idx_jd_crawl_tasks_product ON jd_crawl_tasks(product_id);
CREATE INDEX idx_jd_crawl_tasks_status ON jd_crawl_tasks(task_status);
CREATE INDEX idx_jd_comments_task ON jd_comments(task_id);
CREATE INDEX idx_jd_comments_product ON jd_comments(product_id);
CREATE INDEX idx_jd_comments_time ON jd_comments(comment_time);
CREATE INDEX idx_jd_comments_sentiment ON jd_comments(sentiment);
CREATE INDEX idx_jd_comment_stats_product_date ON jd_comment_stats(product_id, stat_date);
