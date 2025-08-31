
### **产品需求文档 (PRD) - 波尼亚AI平台 Gemini集成模块**

| 版本 | 日期 | 作者 | 备注 |
| :--- | :--- | :--- | :--- |
| V2.0 | 2025年8月31日 | Gemini | 针对销量预测、竞品分析、电商反馈三大模块的Gemini集成方案 |

### **1. 项目概述**

本文档旨在详细阐述“波尼亚AI平台”中三个核心业务模块——**门店销售预测**、**竞品价格分析**和**电商平台数据分析**——如何深度集成Google Gemini模型。目标是利用Gemini强大的自然语言理解、推理和生成能力，将传统的数据处理和分析流程智能化，从而提升效率、深度和商业价值。

---

### **2. 模块一：门店销售预测 (Sales Forecast)**

#### **2.1. 用户故事**
作为一名区域经理，我不仅需要知道下周可能卖多少货，更想理解**为什么**会是这个预测结果（比如因为天气转凉和周末促销），并希望系统能直接给我一份简洁易懂的订货分析报告，而不是一堆冰冷的数字。

#### **2.2. 核心业务流程与Gemini角色定位**

**核心痛点：** 传统的预测模型只能输出数字，无法解释原因，也无法结合实时的、非结构化的商业信息（如“隔壁商场搞活动”）。

**Gemini角色定位：** 在此模块中，Gemini不作为核心的**数值预测器**，而是扮演两个关键的**智能辅助角色**：
1.  **特征工程师 (Feature Engineer):** 在预测前，将人类语言描述的事件（如天气、促销、节假日）转化为机器学习模型可以理解的结构化特征。
2.  **数据分析报告生成器 (Report Generator):** 在预测后，将模型输出的数字结果和关键影响因素，翻译成通俗易懂的商业洞察和行动建议。

#### **2.3. 流程图**

```mermaid
graph TD
    subgraph "阶段一: 预测前 - 特征工程"
        A[非结构化数据输入<br>e.g., "本周六有啤酒节活动", "未来三天大雨"] --> B{Gemini API 调用<br>(特征提取Prompt)};
        B --> C[结构化特征输出<br>e.g., { "event_impact": "high", "weather_impact": "negative" }];
        D[历史销售数据] --> E[专业预测模型<br>(e.g., LightGBM/Prophet)];
        C --> E;
    end

    subgraph "阶段二: 预测与报告生成"
        E --> F[生成数值预测结果<br>e.g., {"2025-09-01": 55.5, ...}];
        F --> G{Gemini API 调用<br>(报告生成Prompt)};
        C --> G;
        G --> H[输出智能分析报告<br>(人类可读的文本)];
        F --> I[数据库];
        H --> I[数据库];
    end

    subgraph "阶段三: 前端展示"
        I --> J[前端界面<br>展示图表 + 智能分析报告];
    end
```

#### **2.4. 功能需求与技术实现**

**1. 后端 - 特征提取 (可选高级功能):**
   *   创建一个API端点 `/api/forecast/extract-features`。
   *   该API接收文本输入（如运营人员填写的“本周活动”）。
   *   **Gemini API 调用 (Prompt 示例):**
     ```
     你是一位零售行业的数据科学家。请评估以下事件对熟食产品（特别是烤肠、猪蹄类）销量的潜在影响，并以JSON格式输出影响等级。

     # 规则:
     - impact_level: "high", "medium", "low", "negative", "neutral"
     - reasoning: 简要说明判断理由

     # JSON输出格式:
     {
       "impact_level": "影响等级",
       "reasoning": "判断理由"
     }

     # 事件描述:
     """
     本周六门店门口将举办大型啤酒节活动。
     """
     ```

**2. 后端 - 报告生成 (核心功能):**
   *   在专业模型（如LightGBM）完成预测后，获取数值结果和最重要的影响特征。
   *   创建一个API端点 `/api/forecast/generate-report`。
   *   **Gemini API 调用 (Prompt 示例):**
     ```
     你是一位波尼亚公司的资深数据分析师。请根据以下销售预测数据和关键影响因素，为门店经理撰写一份简洁、专业的订货策略周报。

     # 周报要求:
     1. 首先总结本周销量的整体趋势。
     2. 逐日分析关键日的销量波动原因。
     3. 最后给出一项核心的备货或运营建议。
     4. 语气要专业、肯定，直接面向门店管理者。

     # 数据:
     - 预测产品: 老汤牛肉
     - 预测数据: { "2025-09-01": 25.2, "2025-09-02": 28.1, "2025-09-03": 55.8, "2025-09-04": 60.5, "2025-09-05": 30.1 }
     - 关键影响因素:
       - 9月3日、4日是周末，且天气晴朗，客流量预计大增。
       - 9月1日至5日有“第二件半价”促销活动。

     # ---
     # 请生成周报:
     ```

#### **2.5. 数据模型 (Vercel Postgres)**
```sql
CREATE TABLE SalesForecasts (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    store_id INT NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_quantity NUMERIC(10, 3) NOT NULL, -- 模型预测的数值
    gemini_report TEXT, -- Gemini生成的分析报告 (存储整个周期的报告)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### **3. 模块二：竞品价格分析 (Competitor Analysis)**

#### **3.1. 用户故事**
作为一名一线销售，我每天都在不同的超市奔波，希望能用最快的方式（说句话或拍张照）就把竞品价格信息录入系统，而不需要停下来手动填写繁琐的表单。

#### **3.2. 核心业务流程与Gemini角色定位**

**核心痛点：** 原始采集方式（拍照、语音）产生的数据是非结构化的，手动整理耗时且易错，导致数据时效性差、质量低。

**Gemini角色定位：** **智能数据结构化引擎**。它作为流程的核心环节，负责将从OCR和语音识别服务获得的杂乱文本，精准地解析并转换为统一、干净的JSON数据，实现数据采集的“端到端”自动化。

#### **3.3. 流程图**

```mermaid
graph TD
    subgraph "数据采集端 (移动Web)"
        A[销售人员拍照] --> B[OCR服务];
        C[销售人员语音录入] --> D[语音转文本(STT)服务];
    end

    subgraph "后端处理流程"
        B --> E[获取原始OCR文本];
        D --> F[获取原始语音文本];
        E --> G{Gemini API 调用<br>(信息结构化Prompt)};
        F --> G;
        G --> H[生成结构化JSON数据];
        H --> I[存入Vercel Postgres数据库];
    end

    subgraph "数据分析与展示"
        I --> J[前端平台<br>(数据报表、趋势分析)];
    end
```

#### **3.4. 功能需求与技术实现**

**1. 后端 - 数据结构化:**
   *   创建一个API端点 `/api/competitor-price/process-raw-data`。
   *   该API接收一个包含原始文本的JSON对象：`{ "rawText": "..." }`。
   *   **Gemini API 调用 (Prompt 示例):**
     ```
     你是一位精通中文零售商品信息的数据录入专家。你的任务是将一段从图片或语音中提取的、可能杂乱无章的原始文本，解析并转换成一个结构化的JSON对象。

     # 规则:
     1. 仔细识别品牌名称(如喜旺、双汇、金锣)、商品名称、规格(如克重、口味、包装形式)和价格。
     2. 将所有价格信息统一为阿拉伯数字（浮点数）。
     3. 如果某项信息在原始文本中不存在，请在JSON中使用 null 值。
     4. 品牌名称必须从 ["喜旺", "双汇", "金锣", "其他"] 中选择，如果无法判断则为 "其他"。
     5. 严格按照指定的JSON格式输出，不要添加任何额外的解释或文字。

     # JSON输出格式:
     {
       "brand": "品牌名称",
       "product_name": "商品名称",
       "specifications": "规格描述",
       "price": 价格数字
     }

     # ---
     # 现在，请处理以下原始文本：
     # 原始文本:
     """
     那个喜旺的蒜香味儿的烤肠，160克一包的，现在卖七块九。
     """
     ```

**2. 前端:**
   *   采集页面：提供文件上传（拍照）和语音录入按钮。
   *   分析页面：表格展示所有已结构化的竞品数据，提供按品牌、时间、地点的筛选和排序功能。

#### **3.5. 数据模型 (Vercel Postgres)**
```sql
CREATE TABLE CompetitorPrices (
    id SERIAL PRIMARY KEY,
    capture_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    location_text VARCHAR(255),
    -- 存储由Gemini解析出的结构化数据
    brand VARCHAR(100),
    product_name VARCHAR(255),
    specifications VARCHAR(255),
    price NUMERIC(10, 2),
    -- 原始数据，用于追溯和模型优化
    raw_text TEXT,
    source_type VARCHAR(20) NOT NULL, -- 'ocr' or 'stt'
    salesperson_id INT
);
```

---

### **4. 模块三：电商平台数据分析 (E-commerce Feedback)**

#### **4.1. 用户故事**
作为一名电商运营，我每天要面对上百条用户评论，我希望能有一个系统能自动帮我读完所有评论，告诉我今天大家主要在抱怨什么（比如是包装漏气还是物流太慢），并且能标出哪些是急需处理的严重负面评论。

#### **4.2. 核心业务流程与Gemini角色定位**

**核心痛点：** 海量非结构化文本难以快速、准确地进行分类和根本原因分析。

**Gemini角色定位：** **多维度智能文本分析师**。对每一条用户反馈，Gemini都进行一次深度的、多维度的分析，输出一个包含情感、问题分类、摘要、紧急程度等信息的结构化对象，将文本数据转化为可量化的分析指标。

#### **4.3. 流程图**
```mermaid
graph TD
    subgraph "数据同步"
        A[电商平台API] --> B[同步原始用户反馈文本];
    end

    subgraph "后端智能分析"
        B --> C{对每一条反馈<br>调用Gemini API<br>(多维度分析Prompt)};
        C --> D[生成结构化分析JSON];
        D --> E[存入Vercel Postgres数据库];
    end
    
    subgraph "前端监控与分析"
        E --> F[舆情监控看板<br>(问题分类饼图、情感趋势图)];
        E --> G[负面反馈预警系统<br>(筛选紧急反馈)];
        E --> H[数据报表与详情查询];
    end
```
#### **4.4. 功能需求与技术实现**

**1. 后端 - 反馈分析:**
   *   创建一个后台任务或API端点 `/api/feedback/analyze`，用于处理新的用户反馈。
   *   **Gemini API 调用 (Prompt 示例):**
     ```
     你是一位波尼亚食品公司的客户体验分析专家。请对以下客户反馈进行多维度分析，并以结构化的JSON格式输出。

     # 分析维度与规则:
     1.  **sentiment (情感)**: 判断客户的情感倾向。选项: "正面", "中性", "负面"。
     2.  **issues (问题标签)**: 识别所有相关问题点，可多选。必须从以下列表中选择: `包装问题-漏气`, `包装问题-破损`, `产品质量-不新鲜`, `产品质量-异物`, `产品质量-口感不佳`, `物流问题-速度慢`, `物流问题-包装差`, `客服问题`, `价格与促销`, `发货问题`, `其他`。
     3.  **urgency (紧急程度)**: 评估该反馈是否需要立即人工介入。选项: "高", "中", "低"。负面反馈且涉及食品安全（如不新鲜、异物）的为"高"。
     4.  **summary (问题摘要)**: 用一句话简明扼要地概括客户反馈的核心内容。

     # JSON输出格式:
     {
       "sentiment": "...",
       "issues": ["...", "..."],
       "urgency": "...",
       "summary": "..."
     }

     # ---
     # 客户反馈:
     """
     第二次买了，但是这次的包装是坏的，里面的火腿肠都黏糊糊的了，不敢吃，联系客服半天了也没人回！
     """
     ```

**2. 前端:**
   *   **舆情看板：** 使用图表（如饼图、条形图）实时展示`issues`标签的分布和`sentiment`的趋势。
   *   **预警列表：** 创建一个专门的页面，只显示`urgency`为“高”的反馈，并按时间倒序排列，方便客服优先处理。

#### **4.5. 数据模型 (Vercel Postgres)**
```sql
CREATE TABLE CustomerFeedback (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL, -- e.g., 'Tmall', 'JD'
    order_id VARCHAR(100),
    original_comment TEXT NOT NULL, -- 原始评论
    comment_time TIMESTAMP WITH TIME ZONE,
    -- Gemini分析结果
    sentiment VARCHAR(20),
    issues TEXT[], -- 使用Postgres的数组类型存储多个标签
    urgency VARCHAR(20),
    summary TEXT,
    -- 处理状态
    status VARCHAR(50) DEFAULT 'pending', -- e.g., 'pending', 'in_progress', 'resolved'
    processed_by_user_id INT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```