'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ShoppingCart,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Upload,
  Search,
  Filter,
  Eye,
  BarChart3,
  PieChart
} from 'lucide-react'

// 模拟数据
const mockAnalyticsData = {
  overview: {
    total_orders: 12847,
    total_feedback: 342,
    positive_feedback: 198,
    negative_feedback: 89,
    neutral_feedback: 55,
    avg_satisfaction: 4.2
  },
  platform_stats: [
    { platform_name: '京东', order_count: 4521, feedback_count: 123, positive_count: 78, negative_count: 32 },
    { platform_name: '天猫', order_count: 3892, feedback_count: 98, positive_count: 65, negative_count: 21 },
    { platform_name: '拼多多', order_count: 2834, feedback_count: 87, positive_count: 42, negative_count: 28 },
    { platform_name: '私域', order_count: 1600, feedback_count: 34, positive_count: 13, negative_count: 8 }
  ],
  category_stats: [
    { category: '包装问题', count: 45, negative_count: 38 },
    { category: '产品质量', count: 32, negative_count: 28 },
    { category: '物流问题', count: 28, negative_count: 15 },
    { category: '客服问题', count: 18, negative_count: 8 },
    { category: '其他问题', count: 12, negative_count: 5 }
  ],
  keywords: [
    { keyword: '味道好', frequency: 67 },
    { keyword: '漏气', frequency: 45 },
    { keyword: '包装精美', frequency: 41 },
    { keyword: '不新鲜', frequency: 32 },
    { keyword: '包装破损', frequency: 28 },
    { keyword: '发货慢', frequency: 23 }
  ]
}

const recentFeedback = [
  {
    id: 1,
    platform_name: '京东',
    order_number: 'JD202408290001',
    feedback_content: '产品包装有漏气现象，影响了食品的新鲜度',
    sentiment: 'negative',
    category: '包装问题',
    created_at: '2024-08-29 14:30',
    status: 'pending'
  },
  {
    id: 2,
    platform_name: '天猫',
    order_number: 'TM202408290002',
    feedback_content: '味道很好，包装也很精美，会继续购买',
    sentiment: 'positive',
    category: '产品质量',
    created_at: '2024-08-29 13:15',
    status: 'resolved'
  },
  {
    id: 3,
    platform_name: '拼多多',
    order_number: 'PDD202408290003',
    feedback_content: '发货速度有点慢，希望能改进物流',
    sentiment: 'neutral',
    category: '物流问题',
    created_at: '2024-08-29 12:45',
    status: 'processing'
  }
]

export default function EcommerceAnalysisPage() {
  const [analyticsData, setAnalyticsData] = useState(mockAnalyticsData)
  const [feedbackList, setFeedbackList] = useState(recentFeedback)
  const [loading, setLoading] = useState(false)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">电商平台数据分析</h1>
            <p className="text-gray-600 mt-1">
              整合多电商平台的售后反馈，进行系统化分析，发现共性问题
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              导入数据
            </Button>
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              生成报告
            </Button>
          </div>
        </div>

        {/* KPI 卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                总订单数
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.total_orders.toLocaleString()}</div>
              <p className="text-xs text-green-600">+8.2% 较上月</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                售后反馈
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.total_feedback}</div>
              <p className="text-xs text-red-600">+12 较上月</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                满意度评分
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.avg_satisfaction.toFixed(1)}</div>
              <p className="text-xs text-green-600">+0.2 较上月</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                待处理问题
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.negative_feedback}</div>
              <p className="text-xs text-yellow-600">需要关注</p>
            </CardContent>
          </Card>
        </div>

        {/* 平台统计和问题分类 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 平台统计 */}
          <Card>
            <CardHeader>
              <CardTitle>平台数据统计</CardTitle>
              <CardDescription>各电商平台的订单和反馈情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.platform_stats.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{platform.platform_name}</div>
                      <div className="text-sm text-gray-500">
                        订单: {platform.order_count.toLocaleString()} | 反馈: {platform.feedback_count}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        <span className="text-green-600">好评: {platform.positive_count}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-red-600">差评: {platform.negative_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 问题分类统计 */}
          <Card>
            <CardHeader>
              <CardTitle>问题分类统计</CardTitle>
              <CardDescription>客户反馈的主要问题类型</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.category_stats.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">总计: {category.count}</span>
                      <span className="text-sm text-red-600">负面: {category.negative_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 关键词分析 */}
        <Card>
          <CardHeader>
            <CardTitle>关键词分析</CardTitle>
            <CardDescription>客户反馈中的热门关键词</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {analyticsData.keywords.map((keyword, index) => (
                <div
                  key={index}
                  className={`px-3 py-2 rounded-full text-sm font-medium ${
                    ['味道好', '包装精美'].includes(keyword.keyword)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {keyword.keyword} ({keyword.frequency})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 搜索和筛选 */}
        <Card>
          <CardHeader>
            <CardTitle>反馈数据查询</CardTitle>
            <CardDescription>搜索和筛选客户反馈数据</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input placeholder="搜索反馈内容..." className="pl-10" />
              </div>
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">选择平台</option>
                <option value="jd">京东</option>
                <option value="tmall">天猫</option>
                <option value="pdd">拼多多</option>
                <option value="private">私域</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">情感分析</option>
                <option value="positive">正面</option>
                <option value="negative">负面</option>
                <option value="neutral">中性</option>
              </select>
              <Button>
                <Filter className="h-4 w-4 mr-2" />
                筛选数据
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 最新反馈列表 */}
        <Card>
          <CardHeader>
            <CardTitle>最新客户反馈</CardTitle>
            <CardDescription>显示最近的客户反馈和处理状态</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">平台</th>
                    <th className="text-left py-3 px-4">订单号</th>
                    <th className="text-left py-3 px-4">反馈内容</th>
                    <th className="text-left py-3 px-4">情感</th>
                    <th className="text-left py-3 px-4">分类</th>
                    <th className="text-left py-3 px-4">时间</th>
                    <th className="text-left py-3 px-4">状态</th>
                    <th className="text-left py-3 px-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackList.map((feedback) => (
                    <tr key={feedback.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{feedback.platform_name}</td>
                      <td className="py-3 px-4 font-mono text-sm">{feedback.order_number}</td>
                      <td className="py-3 px-4 max-w-xs truncate">{feedback.feedback_content}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          feedback.sentiment === 'positive'
                            ? 'bg-green-100 text-green-800'
                            : feedback.sentiment === 'negative'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {feedback.sentiment === 'positive' ? '正面' :
                           feedback.sentiment === 'negative' ? '负面' : '中性'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{feedback.category}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{feedback.created_at}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          feedback.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : feedback.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {feedback.status === 'resolved' ? '已解决' :
                           feedback.status === 'processing' ? '处理中' : '待处理'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          查看
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
