'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Plus,
  Search,
  Filter,
  Eye,
  Mic,
  Brain,
  User,
  AlertTriangle
} from 'lucide-react'

// 模拟数据
const mockTickets = [
  {
    id: 1,
    ticket_number: 'TK1724923800001',
    customer_name: '张先生',
    customer_contact: '138****5678',
    channel: 'phone',
    issue_type: '产品质量',
    issue_description: '购买的香肠包装有漏气现象，希望退换货',
    priority: 'high',
    status: 'open',
    assignee_name: '李客服',
    created_at: '2024-08-29 14:30',
    has_audio: true,
    has_transcript: false
  },
  {
    id: 2,
    ticket_number: 'TK1724923800002',
    customer_name: '王女士',
    customer_contact: 'wang@email.com',
    channel: 'online',
    issue_type: '物流问题',
    issue_description: '订单发货速度太慢，已经等了一周了',
    priority: 'medium',
    status: 'in_progress',
    assignee_name: '张客服',
    created_at: '2024-08-29 13:15',
    has_audio: false,
    has_transcript: true
  },
  {
    id: 3,
    ticket_number: 'TK1724923800003',
    customer_name: '刘先生',
    customer_contact: '微信客服',
    channel: 'social_media',
    issue_type: '一般咨询',
    issue_description: '想了解产品的营养成分和保质期信息',
    priority: 'low',
    status: 'resolved',
    assignee_name: '陈客服',
    created_at: '2024-08-29 12:45',
    has_audio: false,
    has_transcript: false
  }
]

const mockStats = {
  total_tickets: 1247,
  phone_tickets: 89,
  online_tickets: 456,
  avg_resolution_time: 2.3
}

export default function CustomerServicePage() {
  const [tickets, setTickets] = useState(mockTickets)
  const [stats, setStats] = useState(mockStats)
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return '待处理'
      case 'in_progress': return '处理中'
      case 'resolved': return '已解决'
      case 'closed': return '已关闭'
      default: return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return '紧急'
      case 'high': return '高'
      case 'medium': return '中'
      case 'low': return '低'
      default: return priority
    }
  }

  const getChannelText = (channel: string) => {
    switch (channel) {
      case 'phone': return '电话'
      case 'online': return '在线客服'
      case 'social_media': return '社交媒体'
      case 'email': return '邮件'
      default: return channel
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">智能客服管理</h1>
            <p className="text-gray-600 mt-1">
              对全渠道客户投诉与反馈进行统一管理和智能分析，提升服务效率
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Mic className="h-4 w-4 mr-2" />
              语音转文字
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新建工单
            </Button>
          </div>
        </div>

        {/* KPI 卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                总工单数
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_tickets.toLocaleString()}</div>
              <p className="text-xs text-green-600">+5.2% 较上月</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                电话投诉
              </CardTitle>
              <Phone className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.phone_tickets}</div>
              <p className="text-xs text-red-600">+12 较上月</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                在线客服
              </CardTitle>
              <Mail className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.online_tickets}</div>
              <p className="text-xs text-green-600">-8 较上月</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                平均处理时间
              </CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avg_resolution_time}小时</div>
              <p className="text-xs text-green-600">-0.5小时</p>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Mic className="h-12 w-12 mx-auto text-blue-500 mb-2" />
              <CardTitle>语音转文字</CardTitle>
              <CardDescription>
                自动将客服电话录音转换为文字，便于分析和处理
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Brain className="h-12 w-12 mx-auto text-green-500 mb-2" />
              <CardTitle>NLP智能分析</CardTitle>
              <CardDescription>
                对客户反馈进行情感分析、关键词提取和问题分类
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <User className="h-12 w-12 mx-auto text-purple-500 mb-2" />
              <CardTitle>自动回访</CardTitle>
              <CardDescription>
                智能机器人自动进行客户满意度调查和回访
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* 搜索和筛选 */}
        <Card>
          <CardHeader>
            <CardTitle>工单查询</CardTitle>
            <CardDescription>搜索和筛选客服工单</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input placeholder="搜索工单号或客户..." className="pl-10" />
              </div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">所有状态</option>
                <option value="open">待处理</option>
                <option value="in_progress">处理中</option>
                <option value="resolved">已解决</option>
                <option value="closed">已关闭</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                <option value="">所有优先级</option>
                <option value="urgent">紧急</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">所有渠道</option>
                <option value="phone">电话</option>
                <option value="online">在线客服</option>
                <option value="social_media">社交媒体</option>
                <option value="email">邮件</option>
              </select>
              <Button>
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 工单列表 */}
        <Card>
          <CardHeader>
            <CardTitle>客服工单列表</CardTitle>
            <CardDescription>显示所有客服工单和处理状态</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">工单号</th>
                    <th className="text-left py-3 px-4">客户</th>
                    <th className="text-left py-3 px-4">渠道</th>
                    <th className="text-left py-3 px-4">问题类型</th>
                    <th className="text-left py-3 px-4">优先级</th>
                    <th className="text-left py-3 px-4">状态</th>
                    <th className="text-left py-3 px-4">处理人</th>
                    <th className="text-left py-3 px-4">创建时间</th>
                    <th className="text-left py-3 px-4">功能</th>
                    <th className="text-left py-3 px-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{ticket.ticket_number}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{ticket.customer_name}</div>
                          <div className="text-sm text-gray-500">{ticket.customer_contact}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {getChannelText(ticket.channel)}
                        </span>
                      </td>
                      <td className="py-3 px-4">{ticket.issue_type}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(ticket.priority)}`}>
                          {getPriorityText(ticket.priority)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">{ticket.assignee_name || '未分配'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{ticket.created_at}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-1">
                          {ticket.has_audio && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" title="有录音文件"></div>
                          )}
                          {ticket.has_transcript && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" title="已转录"></div>
                          )}
                          {ticket.priority === 'high' && (
                            <AlertTriangle className="h-3 w-3 text-orange-500" title="高优先级" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            查看
                          </Button>
                          {ticket.has_audio && !ticket.has_transcript && (
                            <Button variant="outline" size="sm" className="text-blue-600">
                              <Mic className="h-4 w-4 mr-1" />
                              转录
                            </Button>
                          )}
                          {ticket.has_transcript && (
                            <Button variant="outline" size="sm" className="text-green-600">
                              <Brain className="h-4 w-4 mr-1" />
                              分析
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 统计图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>工单状态分布</CardTitle>
              <CardDescription>各状态工单的数量分布</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>待处理</span>
                  </div>
                  <span className="font-medium">156</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>处理中</span>
                  </div>
                  <span className="font-medium">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>已解决</span>
                  </div>
                  <span className="font-medium">1002</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>问题类型统计</CardTitle>
              <CardDescription>客户反馈的主要问题类型</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>产品质量</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>物流问题</span>
                  <span className="font-medium">28%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>服务问题</span>
                  <span className="font-medium">18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>一般咨询</span>
                  <span className="font-medium">9%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
