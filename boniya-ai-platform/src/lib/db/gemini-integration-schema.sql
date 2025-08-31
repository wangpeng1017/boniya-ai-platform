-- Gemini AI集成相关数据库表结构
-- 用于支持销售预测、竞品分析、电商反馈三大模块的AI功能

-- 1. 销售预测报告表
CREATE TABLE IF NOT EXISTS sales_forecasts (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    forecast_data JSONB NOT NULL, -- 存储预测数据
    gemini_report TEXT, -- Gemini生成的分析报告
    confidence_level VARCHAR(20) DEFAULT 'medium', -- high, medium, low
    analysis_period_start DATE,
    analysis_period_end DATE,
    key_factors JSONB, -- 影响因素
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 竞品价格数据表（更新现有表结构）
CREATE TABLE IF NOT EXISTS competitor_prices (
    id SERIAL PRIMARY KEY,
    capture_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    location_text VARCHAR(255),
    -- 存储由Gemini解析出的结构化数据
    brand VARCHAR(100),
    product_name VARCHAR(255),
    specifications VARCHAR(255),
    price NUMERIC(10, 2),
    confidence_score NUMERIC(3, 2), -- Gemini解析的置信度
    parsing_notes TEXT, -- 解析说明
    -- 原始数据，用于追溯和模型优化
    raw_text TEXT,
    source_type VARCHAR(20) NOT NULL, -- 'ocr', 'stt', 'manual'
    salesperson_id INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 竞品分析报告表
CREATE TABLE IF NOT EXISTS competitor_analysis_reports (
    id SERIAL PRIMARY KEY,
    analysis_type VARCHAR(50) DEFAULT 'comprehensive',
    filter_conditions JSONB, -- 分析的筛选条件
    data_points_count INT, -- 分析的数据点数量
    trend_analysis JSONB, -- Gemini生成的趋势分析
    summary_report TEXT, -- 执行摘要
    confidence_level VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 客户反馈表
CREATE TABLE IF NOT EXISTS customer_feedback (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL, -- e.g., 'Tmall', 'JD', 'PDD'
    order_id VARCHAR(100),
    original_comment TEXT NOT NULL, -- 原始评论
    comment_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Gemini分析结果
    sentiment VARCHAR(20), -- '正面', '中性', '负面'
    issues JSONB, -- 问题标签数组
    urgency VARCHAR(20), -- '高', '中', '低'
    summary TEXT, -- 问题摘要
    confidence_score NUMERIC(3, 2), -- 分析置信度
    analysis_notes TEXT, -- 分析说明
    -- 处理状态
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved'
    processed_by_user_id INT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. 反馈洞察报告表
CREATE TABLE IF NOT EXISTS feedback_insights_reports (
    id SERIAL PRIMARY KEY,
    filter_conditions JSONB, -- 生成洞察的筛选条件
    data_points_count INT, -- 分析的反馈数量
    insights_data JSONB, -- Gemini生成的洞察数据
    confidence_level VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. AI特征提取记录表
CREATE TABLE IF NOT EXISTS ai_feature_extractions (
    id SERIAL PRIMARY KEY,
    module_type VARCHAR(50) NOT NULL, -- 'sales_forecast', 'competitor_analysis', 'feedback_analysis'
    input_text TEXT NOT NULL,
    extracted_features JSONB,
    confidence_score NUMERIC(3, 2),
    processing_time_ms INT, -- 处理时间（毫秒）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_sales_forecasts_product_date ON sales_forecasts(product_name, analysis_period_start);
CREATE INDEX IF NOT EXISTS idx_competitor_prices_brand_date ON competitor_prices(brand, capture_date);
CREATE INDEX IF NOT EXISTS idx_competitor_prices_location ON competitor_prices(location_text);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_platform_time ON customer_feedback(platform, comment_time);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_sentiment ON customer_feedback(sentiment);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_urgency ON customer_feedback(urgency);
CREATE INDEX IF NOT EXISTS idx_ai_extractions_module ON ai_feature_extractions(module_type, created_at);

-- 添加注释
COMMENT ON TABLE sales_forecasts IS '销售预测AI报告表';
COMMENT ON TABLE competitor_prices IS '竞品价格数据表（含AI解析结果）';
COMMENT ON TABLE competitor_analysis_reports IS '竞品分析AI报告表';
COMMENT ON TABLE customer_feedback IS '客户反馈AI分析表';
COMMENT ON TABLE feedback_insights_reports IS '反馈洞察AI报告表';
COMMENT ON TABLE ai_feature_extractions IS 'AI特征提取记录表';

-- 插入一些示例数据用于测试
INSERT INTO customer_feedback (platform, original_comment, sentiment, issues, urgency, summary, confidence_score) VALUES
('京东', '第二次买了，但是这次的包装是坏的，里面的火腿肠都黏糊糊的了，不敢吃，联系客服半天了也没人回！', '负面', '["包装问题-破损", "产品质量-不新鲜", "客服问题"]', '高', '客户反映包装破损导致产品变质，客服响应不及时', 0.92),
('天猫', '味道不错，包装也很好，物流很快，会回购的', '正面', '["其他"]', '低', '客户对产品和服务表示满意', 0.88),
('拼多多', '价格便宜，但是口感一般般，没有想象中的好吃', '中性', '["产品质量-口感不佳", "价格与促销"]', '中', '客户认为性价比一般，口感有待改善', 0.85),
('京东', '物流太慢了，等了一个星期才到，包装还有点破损', '负面', '["物流问题-速度慢", "包装问题-破损"]', '中', '客户抱怨物流速度慢且包装有问题', 0.90),
('天猫', '非常好吃！家人都很喜欢，下次还会买', '正面', '["其他"]', '低', '客户对产品非常满意，表示会复购', 0.95);

-- 插入竞品价格示例数据
INSERT INTO competitor_prices (brand, product_name, specifications, price, confidence_score, raw_text, source_type, location_text) VALUES
('喜旺', '蒜味烤肠', '160g', 7.90, 0.95, '那个喜旺的蒜香味儿的烤肠，160克一包的，现在卖七块九', 'manual', '青岛市城阳区'),
('双汇', '维也纳香肠', '200g', 8.50, 0.88, '双汇维也纳香肠200克装8块5', 'manual', '青岛市市南区'),
('金锣', '火腿肠', '150g', 6.80, 0.92, '金锣火腿肠150g装，价格6.8元', 'manual', '青岛市李沧区');
