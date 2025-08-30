// API客户端工具函数

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 基础API请求函数
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('API request failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '请求失败'
    }
  }
}

// 电商平台数据分析API
export const ecommerceApi = {
  // 获取客户反馈列表
  getFeedback: (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiRequest(`/ecommerce/feedback${query}`)
  },

  // 创建客户反馈
  createFeedback: (data: any) => {
    return apiRequest('/ecommerce/feedback', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 获取分析数据
  getAnalytics: (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiRequest(`/ecommerce/analytics${query}`)
  },

  // 执行NLP分析
  performNLPAnalysis: (data: { feedback_id: number; content: string }) => {
    return apiRequest('/ecommerce/analytics', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

// 客服管理API
export const customerServiceApi = {
  // 获取工单列表
  getTickets: (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiRequest(`/customer-service/tickets${query}`)
  },

  // 创建工单
  createTicket: (data: any) => {
    return apiRequest('/customer-service/tickets', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 更新工单
  updateTicket: (data: any) => {
    return apiRequest('/customer-service/tickets', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  // 语音转文字
  speechToText: (data: { ticket_id: number; audio_file_url: string }) => {
    return apiRequest('/customer-service/speech-to-text', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 批量语音转文字
  batchSpeechToText: (data: { ticket_ids: number[] }) => {
    return apiRequest('/customer-service/speech-to-text', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }
}

// 通用API
export const commonApi = {
  // 健康检查
  healthCheck: () => {
    return apiRequest('/health')
  }
}

// 错误处理工具
export function handleApiError(error: any) {
  if (error?.error) {
    console.error('API Error:', error.error)
    return error.error
  }
  return '操作失败，请稍后重试'
}

// 成功消息处理
export function handleApiSuccess(response: any) {
  if (response?.message) {
    console.log('API Success:', response.message)
    return response.message
  }
  return '操作成功'
}
