'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Store, Camera, Users, CheckCircle, AlertTriangle, Eye, Shield, Clock } from 'lucide-react'
import { useState } from 'react'

// 模拟门店运营数据
const mockStoreData = [
  {
    store_id: 'qingdao_chengyang',
    store_name: '青岛市城阳区利客来城阳直营专柜',
    status: 'normal',
    compliance_score: 95,
    last_inspection: '2025-01-15 14:30',
    issues: [
      { type: 'hygiene', severity: 'low', description: '冷柜温度稍高，需调整' },
      { type: 'display', severity: 'medium', description: '产品陈列需要优化' }
    ]
  },
  {
    store_id: 'qingdao_licang',
    store_name: '青岛市李沧区大润发专柜',
    status: 'warning',
    compliance_score: 87,
    last_inspection: '2025-01-15 10:15',
    issues: [
      { type: 'staff', severity: 'high', description: '员工未按规定佩戴工作服' },
      { type: 'hygiene', severity: 'medium', description: '操作台清洁度不达标' }
    ]
  },
  {
    store_id: 'qingdao_shibei',
    store_name: '青岛市市北区家乐福专柜',
    status: 'normal',
    compliance_score: 92,
    last_inspection: '2025-01-15 16:45',
    issues: [
      { type: 'inventory', severity: 'low', description: '部分产品库存不足' }
    ]
  }
]

export default function StoreOperationsPage() {
  const [selectedStore, setSelectedStore] = useState<string>('all')
  const [monitoringData] = useState(mockStoreData)
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">门店运营标准化管理</h1>
            <p className="text-gray-600 mt-2">
              通过技术手段对门店员工着装、商品陈列等标准化执行情况进行自动监控
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              实时监控
            </Button>
            <Button>
              <Camera className="mr-2 h-4 w-4" />
              视频回放
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">监控门店</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">全国门店</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">监控摄像头</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,248</div>
              <p className="text-xs text-muted-foreground">在线监控</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">员工数量</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3,247</div>
              <p className="text-xs text-muted-foreground">在职员工</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">合规率</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92.8%</div>
              <p className="text-xs text-muted-foreground">+1.2% 较上周</p>
            </CardContent>
          </Card>
        </div>

        {/* 门店监控列表 */}
        <Card>
          <CardHeader>
            <CardTitle>门店监控状态</CardTitle>
            <CardDescription>实时监控青岛地区波尼亚专柜运营状况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monitoringData.map((store) => (
                <div key={store.store_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Store className="h-5 w-5 text-gray-500" />
                      <div>
                        <h3 className="font-medium">{store.store_name}</h3>
                        <p className="text-sm text-gray-500">最后检查: {store.last_inspection}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={store.status === 'normal' ? 'default' : 'destructive'}>
                        {store.status === 'normal' ? '正常' : '警告'}
                      </Badge>
                      <div className="text-right">
                        <div className="text-lg font-bold">{store.compliance_score}</div>
                        <div className="text-xs text-gray-500">合规分</div>
                      </div>
                    </div>
                  </div>

                  {store.issues.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">待处理问题:</h4>
                      {store.issues.map((issue, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <Badge variant={
                            issue.severity === 'high' ? 'destructive' :
                            issue.severity === 'medium' ? 'secondary' : 'outline'
                          }>
                            {issue.severity === 'high' ? '高' :
                             issue.severity === 'medium' ? '中' : '低'}
                          </Badge>
                          <span className="text-gray-600">
                            {issue.type === 'hygiene' ? '卫生' :
                             issue.type === 'staff' ? '员工' :
                             issue.type === 'display' ? '陈列' : '库存'}:
                            {issue.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 实时监控视频 */}
        <Card>
          <CardHeader>
            <CardTitle>实时监控视频</CardTitle>
            <CardDescription>AI视觉监控系统实时画面</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {monitoringData.map((store, index) => (
                <div key={store.store_id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium truncate">{store.store_name}</div>
                    <div className="text-gray-500 flex items-center justify-between mt-1">
                      <span>摄像头 {index + 1}</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs">在线</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
