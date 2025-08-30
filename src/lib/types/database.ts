// 数据库表类型定义

export interface User {
  id: number
  email: string
  name: string
  password_hash: string
  role: string
  created_at: Date
  updated_at: Date
}

export interface Store {
  id: number
  name: string
  code: string
  address?: string
  region?: string
  office?: string
  manager_name?: string
  phone?: string
  status: string
  created_at: Date
  updated_at: Date
}

export interface Product {
  id: number
  code: string
  name: string
  category?: string
  unit?: string
  price?: number
  status: string
  created_at: Date
  updated_at: Date
}

export interface SalesHistory {
  id: number
  date: Date
  store_id: number
  product_id: number
  quantity: number
  amount?: number
  weather?: string
  is_holiday: boolean
  is_promotion: boolean
  created_at: Date
  // 关联数据
  store?: Store
  product?: Product
}

export interface SalesForecast {
  id: number
  store_id: number
  product_id: number
  forecast_date: Date
  predicted_quantity: number
  confidence_score?: number
  model_version?: string
  external_factors?: Record<string, any>
  created_at: Date
  // 关联数据
  store?: Store
  product?: Product
}

export interface Competitor {
  id: number
  name: string
  brand?: string
  created_at: Date
}

export interface CompetitorPrice {
  id: number
  location: string
  office?: string
  our_product_name?: string
  our_price?: number
  competitor_id: number
  competitor_product_name?: string
  competitor_price?: number
  collection_date: Date
  collector_id?: number
  image_url?: string
  latitude?: number
  longitude?: number
  status: string
  created_at: Date
  // 关联数据
  competitor?: Competitor
  collector?: User
}

export interface FileUpload {
  id: number
  filename: string
  original_name?: string
  file_path: string
  file_size?: number
  mime_type?: string
  upload_type?: string
  uploader_id?: number
  processing_status: string
  ocr_result?: Record<string, any>
  created_at: Date
  // 关联数据
  uploader?: User
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 分页类型
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 查询参数类型
export interface QueryParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any>
}

// 销售预测查询参数
export interface SalesForecastQuery extends QueryParams {
  store_id?: number
  product_code?: string
  date_from?: string
  date_to?: string
  weather?: string
  is_holiday?: boolean
  is_promotion?: boolean
}

// 竞品价格查询参数
export interface CompetitorPriceQuery extends QueryParams {
  location?: string
  office?: string
  competitor_id?: number
  date_from?: string
  date_to?: string
  status?: string
}

// 电商平台类型
export interface EcommercePlatform {
  id: number
  name: string
  platform_code: string
  api_config?: Record<string, any>
  status: string
  created_at: Date
}

// 电商订单类型
export interface EcommerceOrder {
  id: number
  platform_id: number
  order_id: string
  product_id?: number
  customer_name?: string
  customer_phone?: string
  order_amount?: number
  order_date?: Date
  order_status?: string
  shipping_address?: string
  created_at: Date
  // 关联数据
  platform?: EcommercePlatform
  product?: Product
}

// 客户反馈类型
export interface CustomerFeedback {
  id: number
  platform_id?: number
  order_id?: number
  feedback_type?: string
  feedback_content: string
  sentiment?: string
  keywords?: Record<string, any>
  category?: string
  priority: string
  status: string
  handler_id?: number
  created_at: Date
  resolved_at?: Date
  // 关联数据
  platform?: EcommercePlatform
  order?: EcommerceOrder
  handler?: User
}

// 客服工单类型
export interface ServiceTicket {
  id: number
  ticket_number: string
  customer_name?: string
  customer_contact?: string
  channel?: string
  issue_type?: string
  issue_description: string
  priority: string
  status: string
  assigned_to?: number
  audio_file_url?: string
  transcript?: string
  nlp_analysis?: Record<string, any>
  resolution?: string
  created_at: Date
  updated_at: Date
  resolved_at?: Date
  // 关联数据
  assignee?: User
}

// 电商数据查询参数
export interface EcommerceQuery extends QueryParams {
  platform_id?: number
  date_from?: string
  date_to?: string
  order_status?: string
  sentiment?: string
}

// 客服工单查询参数
export interface ServiceTicketQuery extends QueryParams {
  status?: string
  priority?: string
  channel?: string
  assigned_to?: number
  date_from?: string
  date_to?: string
}
