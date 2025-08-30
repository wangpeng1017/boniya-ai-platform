'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Users, Clock, CheckCircle, Plus, Phone, Mail } from 'lucide-react'
import { useState } from 'react'

export default function CustomerServicePage() {
  const [loading, setLoading] = useState(false)
  const [tickets, setTickets] = useState<any[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: '',
    contact_info: '',
    channel: 'phone',
    issue_type: 'complaint',
    description: '',
    severity: 'medium'
  })

  const handleCreateTicket = async () => {
    if (!formData.customer_name || !formData.description) {
      alert('请填写必填字段')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/customer-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      if (result.success) {
        alert('工单创建成功')
        setFormData({
          customer_name: '',
          contact_info: '',
          channel: 'phone',
          issue_type: 'complaint',
          description: '',
          severity: 'medium'
        })
        setShowCreateForm(false)
        // 刷新工单列表
        loadTickets()
      } else {
        alert('工单创建失败: ' + result.error)
      }
    } catch (error) {
      alert('工单创建失败: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const loadTickets = async () => {
    try {
      const response = await fetch('/api/customer-service')
      const result = await response.json()
      if (result.success) {
        setTickets(result.data)
      }
    } catch (error) {
      console.error('加载工单失败:', error)
    }
  }
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">智能客服管理</h1>
            <p className="text-gray-600 mt-2">
              对全渠道客户投诉与反馈进行统一管理和智能分析，提升服务效率
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            创建工单
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日工单</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">+8 较昨日</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">在线客服</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">当前在线</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3分钟</div>
              <p className="text-xs text-muted-foreground">-0.5分钟 较昨日</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">解决率</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.5%</div>
              <p className="text-xs text-muted-foreground">+2.1% 较昨日</p>
            </CardContent>
          </Card>
        </div>

        {/* 工单创建表单 */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>创建工单</CardTitle>
              <CardDescription>填写客户反馈信息创建新工单</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">客户姓名 *</Label>
                  <Input
                    id="customer_name"
                    placeholder="请输入客户姓名"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_info">联系方式</Label>
                  <Input
                    id="contact_info"
                    placeholder="请输入联系方式"
                    value={formData.contact_info}
                    onChange={(e) => setFormData({...formData, contact_info: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="channel">反馈渠道</Label>
                  <select
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    value={formData.channel}
                    onChange={(e) => setFormData({...formData, channel: e.target.value})}
                  >
                    <option value="phone">电话</option>
                    <option value="email">邮件</option>
                    <option value="wechat">微信</option>
                    <option value="online">在线客服</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issue_type">问题类型</Label>
                  <select
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    value={formData.issue_type}
                    onChange={(e) => setFormData({...formData, issue_type: e.target.value})}
                  >
                    <option value="complaint">投诉</option>
                    <option value="suggestion">建议</option>
                    <option value="inquiry">咨询</option>
                    <option value="technical">技术问题</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">问题描述 *</Label>
                  <textarea
                    id="description"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 min-h-[100px]"
                    placeholder="请详细描述问题"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">严重程度</Label>
                  <select
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    value={formData.severity}
                    onChange={(e) => setFormData({...formData, severity: e.target.value})}
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateTicket} disabled={loading}>
                  {loading ? '创建中...' : '创建工单'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 工单列表 */}
        <Card>
          <CardHeader>
            <CardTitle>工单列表</CardTitle>
            <CardDescription>客服工单管理</CardDescription>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暂无工单数据</p>
                <p className="text-sm text-gray-400 mt-1">点击&quot;创建工单&quot;开始添加客服工单</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">#{ticket.ticket_id} - {ticket.customer_name}</h3>
                      <div className="flex space-x-2">
                        <Badge variant={ticket.severity === 'high' ? 'destructive' :
                                      ticket.severity === 'medium' ? 'secondary' : 'default'}>
                          {ticket.severity === 'high' ? '高' :
                           ticket.severity === 'medium' ? '中' : '低'}
                        </Badge>
                        <Badge variant={ticket.status === 'resolved' ? 'default' : 'secondary'}>
                          {ticket.status === 'resolved' ? '已解决' :
                           ticket.status === 'processing' ? '处理中' : '待处理'}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">联系方式：</span>
                        {ticket.contact_info || '未提供'}
                      </div>
                      <div>
                        <span className="font-medium">反馈渠道：</span>
                        {ticket.channel === 'phone' ? '电话' :
                         ticket.channel === 'email' ? '邮件' :
                         ticket.channel === 'wechat' ? '微信' : '在线客服'}
                      </div>
                      <div>
                        <span className="font-medium">问题类型：</span>
                        {ticket.issue_type === 'complaint' ? '投诉' :
                         ticket.issue_type === 'suggestion' ? '建议' :
                         ticket.issue_type === 'inquiry' ? '咨询' : '技术问题'}
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="font-medium text-sm">问题描述：</span>
                      <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
