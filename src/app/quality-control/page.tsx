'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Shield,
  Eye,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
  Search,
  Filter,
  Camera,
  Cpu,
  TrendingUp
} from 'lucide-react'

// 模拟数据
const mockStats = {
  total_devices: 24,
  today_inspections: 2847,
  defects_found: 8,
  accuracy_rate: 99.2
}

const mockInspections = [
  {
    id: 1,
    device_name: '来货检验设备01',
    device_type: 'incoming',
    product_name: '经典1903火腿',
    batch_number: 'B20240829001',
    inspection_type: 'visual',
    inspection_result: 'fail',
    defect_types: ['包装破损', '标签错误'],
    confidence_scores: { overall: 0.95, defect: 0.92 },
    inspected_at: '2024-08-29 14:30',
    inspector_name: '张检验员'
  },
  {
    id: 2,
    device_name: '生产线检验设备02',
    device_type: 'production',
    product_name: '维也纳香肠',
    batch_number: 'B20240829002',
    inspection_type: 'contamination',
    inspection_result: 'pass',
    defect_types: [],
    confidence_scores: { overall: 0.98, clean: 0.99 },
    inspected_at: '2024-08-29 14:15',
    inspector_name: '李检验员'
  },
  {
    id: 3,
    device_name: '发货检验设备03',
    device_type: 'outgoing',
    product_name: '酱猪耳',
    batch_number: 'B20240829003',
    inspection_type: 'defect',
    inspection_result: 'warning',
    defect_types: ['轻微变色'],
    confidence_scores: { overall: 0.85, defect: 0.78 },
    inspected_at: '2024-08-29 13:45',
    inspector_name: '王检验员'
  }
]

const mockDefectStats = [
  { defect_type: '包装破损', count: 15, percentage: 35.7 },
  { defect_type: '标签错误', count: 8, percentage: 19.0 },
  { defect_type: '异物污染', count: 5, percentage: 11.9 },
  { defect_type: '重量不符', count: 3, percentage: 7.1 },
  { defect_type: '轻微变色', count: 11, percentage: 26.2 }
]

export default function QualityControlPage() {
  const [stats, setStats] = useState(mockStats)
  const [inspections, setInspections] = useState(mockInspections)
  const [defectStats, setDefectStats] = useState(mockDefectStats)
  const [loading, setLoading] = useState(false)

  const getResultColor = (result: string) => {
    switch (result) {
      case 'pass': return 'bg-green-100 text-green-800'
      case 'fail': return 'bg-red-100 text-red-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getResultText = (result: string) => {
    switch (result) {
      case 'pass': return '合格'
      case 'fail': return '不合格'
      case 'warning': return '警告'
      default: return result
    }
  }

  const getDeviceTypeText = (type: string) => {
    switch (type) {
      case 'incoming': return '来货检验'
      case 'production': return '生产检验'
      case 'outgoing': return '发货检验'
      default: return type
    }
  }

  const getInspectionTypeText = (type: string) => {
    switch (type) {
      case 'visual': return '外观检测'
      case 'defect': return '缺陷检测'
      case 'contamination': return '污染检测'
      default: return type
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">产品品质智能控制</h1>
            <p className="text-gray-600 mt-1">
              利用AI技术提升来货检验、发货检验和生产过程中异物检验的效率与准确性
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              设备管理
            </Button>
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              质量报告
            </Button>
          </div>
        </div>

        {/* KPI 卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                检测设备数
              </CardTitle>
              <Eye className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_devices}</div>
              <p className="text-xs text-green-600">全部在线</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                今日检测数
              </CardTitle>
              <Shield className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today_inspections.toLocaleString()}</div>
              <p className="text-xs text-green-600">+12% 较昨日</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                异物检出
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.defects_found}</div>
              <p className="text-xs text-red-600">需要处理</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                检测准确率
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.accuracy_rate}%</div>
              <p className="text-xs text-green-600">+0.3% 较上月</p>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Camera className="h-12 w-12 mx-auto text-blue-500 mb-2" />
              <CardTitle>AI视觉检测</CardTitle>
              <CardDescription>
                自动识别产品缺陷、异物污染和包装问题
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Cpu className="h-12 w-12 mx-auto text-green-500 mb-2" />
              <CardTitle>模型管理</CardTitle>
              <CardDescription>
                管理和训练AI检测模型，提升识别准确率
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-purple-500 mb-2" />
              <CardTitle>质量分析</CardTitle>
              <CardDescription>
                分析质量趋势，识别潜在的质量风险
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* 缺陷类型统计和检测记录 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 缺陷类型统计 */}
          <Card>
            <CardHeader>
              <CardTitle>缺陷类型统计</CardTitle>
              <CardDescription>最近30天检测到的主要缺陷类型</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {defectStats.map((defect, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium">{defect.defect_type}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{defect.count}次</span>
                      <span className="text-sm font-medium">{defect.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 搜索和筛选 */}
          <Card>
            <CardHeader>
              <CardTitle>检测记录查询</CardTitle>
              <CardDescription>搜索和筛选质量检测记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input placeholder="搜索批次号或产品..." className="pl-10" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select className="px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">设备类型</option>
                    <option value="incoming">来货检验</option>
                    <option value="production">生产检验</option>
                    <option value="outgoing">发货检验</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">检测结果</option>
                    <option value="pass">合格</option>
                    <option value="fail">不合格</option>
                    <option value="warning">警告</option>
                  </select>
                </div>
                <Button className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  筛选记录
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 最新检测记录 */}
        <Card>
          <CardHeader>
            <CardTitle>最新检测记录</CardTitle>
            <CardDescription>显示最近的质量检测记录和结果</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">设备名称</th>
                    <th className="text-left py-3 px-4">设备类型</th>
                    <th className="text-left py-3 px-4">产品名称</th>
                    <th className="text-left py-3 px-4">批次号</th>
                    <th className="text-left py-3 px-4">检测类型</th>
                    <th className="text-left py-3 px-4">检测结果</th>
                    <th className="text-left py-3 px-4">置信度</th>
                    <th className="text-left py-3 px-4">检测时间</th>
                    <th className="text-left py-3 px-4">检验员</th>
                  </tr>
                </thead>
                <tbody>
                  {inspections.map((inspection) => (
                    <tr key={inspection.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{inspection.device_name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {getDeviceTypeText(inspection.device_type)}
                        </span>
                      </td>
                      <td className="py-3 px-4">{inspection.product_name}</td>
                      <td className="py-3 px-4 font-mono text-sm">{inspection.batch_number}</td>
                      <td className="py-3 px-4">{getInspectionTypeText(inspection.inspection_type)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getResultColor(inspection.inspection_result)}`}>
                          {getResultText(inspection.inspection_result)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">
                          {(inspection.confidence_scores.overall * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{inspection.inspected_at}</td>
                      <td className="py-3 px-4">{inspection.inspector_name}</td>
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
