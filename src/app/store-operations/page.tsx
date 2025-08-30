'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Store,
  Camera,
  AlertTriangle,
  CheckCircle,
  Eye,
  Settings,
  BarChart3,
  Clock,
  User,
  Shield,
  Search,
  Filter
} from 'lucide-react'

// 模拟数据
const mockStats = {
  total_stores: 45,
  total_cameras: 180,
  online_cameras: 176,
  today_alerts: 12,
  compliance_rate: 94.2
}

const mockAlerts = [
  {
    id: 1,
    store_name: '青岛市城阳区利客来城阳直营专柜',
    camera_name: '收银台摄像头01',
    alert_type: 'dress_code',
    alert_level: 'medium',
    description: '员工未佩戴工作帽',
    detected_at: '2024-08-29 14:30',
    status: 'pending',
    screenshot_url: '/mock-screenshot-1.jpg'
  },
  {
    id: 2,
    store_name: '青岛市市北区家乐福直营专柜',
    camera_name: '服务台摄像头02',
    alert_type: 'phone_usage',
    alert_level: 'high',
    description: '员工在工作时间使用手机超过5分钟',
    detected_at: '2024-08-29 13:45',
    status: 'acknowledged',
    screenshot_url: '/mock-screenshot-2.jpg'
  },
  {
    id: 3,
    store_name: '青岛市李沧区大润发直营专柜',
    camera_name: '陈列区摄像头03',
    alert_type: 'display_violation',
    alert_level: 'low',
    description: '商品陈列不符合标准要求',
    detected_at: '2024-08-29 12:15',
    status: 'resolved',
    screenshot_url: '/mock-screenshot-3.jpg'
  }
]

const mockComplianceData = [
  { store_name: '城阳利客来', overall_score: 96.5, dress_code: 98, attendance: 95, display: 96 },
  { store_name: '市北家乐福', overall_score: 92.3, dress_code: 90, attendance: 94, display: 93 },
  { store_name: '李沧大润发', overall_score: 89.7, dress_code: 88, attendance: 92, display: 89 },
  { store_name: '崂山华润万家', overall_score: 95.1, dress_code: 96, attendance: 94, display: 95 }
]

export default function StoreOperationsPage() {
  const [stats, setStats] = useState(mockStats)
  const [alerts, setAlerts] = useState(mockAlerts)
  const [complianceData, setComplianceData] = useState(mockComplianceData)
  const [loading, setLoading] = useState(false)

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800'
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'false_positive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertTypeText = (type: string) => {
    switch (type) {
      case 'dress_code': return '着装违规'
      case 'absence': return '脱岗'
      case 'phone_usage': return '使用手机'
      case 'display_violation': return '陈列违规'
      default: return type
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待处理'
      case 'acknowledged': return '已确认'
      case 'resolved': return '已解决'
      case 'false_positive': return '误报'
      default: return status
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600'
    if (score >= 90) return 'text-blue-600'
    if (score >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">门店运营标准化管理</h1>
            <p className="text-gray-600 mt-1">
              通过技术手段对门店员工着装、商品陈列等标准化执行情况进行自动监控
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              摄像头管理
            </Button>
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              合规报告
            </Button>
          </div>
        </div>

        {/* KPI 卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                监控门店数
              </CardTitle>
              <Store className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_stores}</div>
              <p className="text-xs text-green-600">全部接入</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                摄像头数量
              </CardTitle>
              <Camera className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_cameras}</div>
              <p className="text-xs text-green-600">
                在线率 {Math.round((stats.online_cameras / stats.total_cameras) * 100)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                今日预警
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today_alerts}</div>
              <p className="text-xs text-yellow-600">需要处理</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                合规率
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.compliance_rate}%</div>
              <p className="text-xs text-green-600">+1.5% 较上月</p>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Camera className="h-12 w-12 mx-auto text-blue-500 mb-2" />
              <CardTitle>智能视频监控</CardTitle>
              <CardDescription>
                实时监控门店运营情况，自动识别违规行为
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 mx-auto text-green-500 mb-2" />
              <CardTitle>合规性检查</CardTitle>
              <CardDescription>
                定期评估门店标准化执行情况和合规性
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-orange-500 mb-2" />
              <CardTitle>预警管理</CardTitle>
              <CardDescription>
                及时处理监控预警，确保门店运营标准
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
