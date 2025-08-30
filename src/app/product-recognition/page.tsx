'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Scale,
  Camera,
  Zap,
  Target,
  Settings,
  BarChart3,
  Search,
  Filter,
  Upload,
  Brain,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

// 模拟数据
const mockStats = {
  connected_stores: 15,
  total_cameras: 45,
  online_cameras: 43,
  avg_response_time: 0.8,
  accuracy_rate: 91.5
}

const mockRecognitions = [
  {
    id: 1,
    store_name: '青岛市城阳区利客来城阳直营专柜',
    image_url: '/mock-product-1.jpg',
    recognition_results: {
      predicted_product: '五花肉',
      confidence: 0.95,
      alternatives: [
        { product: '猪肉', confidence: 0.89 },
        { product: '排骨', confidence: 0.76 }
      ]
    },
    actual_product_name: '五花肉',
    is_correct: true,
    processing_time_ms: 750,
    recognized_at: '2024-08-29 14:30',
    cashier_name: '张收银员'
  },
  {
    id: 2,
    store_name: '青岛市市北区家乐福直营专柜',
    image_url: '/mock-product-2.jpg',
    recognition_results: {
      predicted_product: '苹果',
      confidence: 0.88,
      alternatives: [
        { product: '梨', confidence: 0.72 },
        { product: '桃子', confidence: 0.65 }
      ]
    },
    actual_product_name: '梨',
    is_correct: false,
    processing_time_ms: 920,
    recognized_at: '2024-08-29 14:15',
    cashier_name: '李收银员'
  },
  {
    id: 3,
    store_name: '青岛市李沧区大润发直营专柜',
    image_url: '/mock-product-3.jpg',
    recognition_results: {
      predicted_product: '土豆',
      confidence: 0.92,
      alternatives: [
        { product: '红薯', confidence: 0.78 },
        { product: '萝卜', confidence: 0.68 }
      ]
    },
    actual_product_name: '土豆',
    is_correct: true,
    processing_time_ms: 680,
    recognized_at: '2024-08-29 13:45',
    cashier_name: '王收银员'
  }
]

const mockModels = [
  {
    id: 1,
    model_name: '散装商品识别模型',
    model_version: 'v2.1.0',
    accuracy_rate: 91.5,
    training_data_count: 15000,
    status: 'active',
    deployed_at: '2024-08-15'
  },
  {
    id: 2,
    model_name: '水果蔬菜识别模型',
    model_version: 'v1.8.3',
    accuracy_rate: 89.2,
    training_data_count: 12000,
    status: 'active',
    deployed_at: '2024-08-10'
  }
]

export default function ProductRecognitionPage() {
  const [stats, setStats] = useState(mockStats)
  const [recognitions, setRecognitions] = useState(mockRecognitions)
  const [models, setModels] = useState(mockModels)
  const [loading, setLoading] = useState(false)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">称重商品自动识别</h1>
            <p className="text-gray-600 mt-1">
              在顾客称重散装商品时，通过摄像头自动识别商品品类，提升收银效率
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              模型管理
            </Button>
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              识别报告
            </Button>
          </div>
        </div>

        {/* KPI 卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                接入门店数
              </CardTitle>
              <Scale className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.connected_stores}</div>
              <p className="text-xs text-green-600">试点运行</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                识别摄像头
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
                识别速度
              </CardTitle>
              <Zap className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avg_response_time}秒</div>
              <p className="text-xs text-green-600">平均响应时间</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                识别准确率
              </CardTitle>
              <Target className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.accuracy_rate}%</div>
              <p className="text-xs text-green-600">+2.1% 较上月</p>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Brain className="h-12 w-12 mx-auto text-blue-500 mb-2" />
              <CardTitle>AI模型训练</CardTitle>
              <CardDescription>
                管理训练数据，优化识别模型准确率
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Camera className="h-12 w-12 mx-auto text-green-500 mb-2" />
              <CardTitle>实时识别</CardTitle>
              <CardDescription>
                监控实时识别效果和处理性能
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Upload className="h-12 w-12 mx-auto text-purple-500 mb-2" />
              <CardTitle>数据标注</CardTitle>
              <CardDescription>
                上传和标注商品图片，扩充训练数据集
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* 模型状态和搜索筛选 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 模型状态 */}
          <Card>
            <CardHeader>
              <CardTitle>识别模型状态</CardTitle>
              <CardDescription>当前部署的AI识别模型</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {models.map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{model.model_name}</div>
                      <div className="text-sm text-gray-500">
                        版本: {model.model_version} | 训练数据: {model.training_data_count.toLocaleString()}张
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">准确率: {model.accuracy_rate}%</div>
                      <div className="text-xs text-green-600">
                        {model.status === 'active' ? '运行中' : '已停用'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 搜索和筛选 */}
          <Card>
            <CardHeader>
              <CardTitle>识别记录查询</CardTitle>
              <CardDescription>搜索和筛选商品识别记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input placeholder="搜索门店或商品..." className="pl-10" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select className="px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">识别结果</option>
                    <option value="true">识别正确</option>
                    <option value="false">识别错误</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">选择门店</option>
                    <option value="1">城阳利客来</option>
                    <option value="2">市北家乐福</option>
                    <option value="3">李沧大润发</option>
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

        {/* 最新识别记录 */}
        <Card>
          <CardHeader>
            <CardTitle>最新识别记录</CardTitle>
            <CardDescription>显示最近的商品识别记录和准确性</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">门店</th>
                    <th className="text-left py-3 px-4">识别结果</th>
                    <th className="text-left py-3 px-4">置信度</th>
                    <th className="text-left py-3 px-4">实际商品</th>
                    <th className="text-left py-3 px-4">识别状态</th>
                    <th className="text-left py-3 px-4">处理时间</th>
                    <th className="text-left py-3 px-4">识别时间</th>
                    <th className="text-left py-3 px-4">收银员</th>
                  </tr>
                </thead>
                <tbody>
                  {recognitions.map((recognition) => (
                    <tr key={recognition.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 max-w-xs truncate">{recognition.store_name}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{recognition.recognition_results.predicted_product}</div>
                        <div className="text-xs text-gray-500">
                          备选: {recognition.recognition_results.alternatives[0]?.product}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">
                          {(recognition.recognition_results.confidence * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">{recognition.actual_product_name}</td>
                      <td className="py-3 px-4">
                        {recognition.is_correct ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">正确</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <XCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">错误</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                          <span className="text-sm">{recognition.processing_time_ms}ms</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{recognition.recognized_at}</td>
                      <td className="py-3 px-4">{recognition.cashier_name}</td>
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
