import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, ShoppingCart, MessageSquare, Store, Shield, Scale, Eye, Plus, Settings, Activity } from 'lucide-react'

const modules = [
  {
    title: '门店销售数量预测',
    description: '基于历史销售数据，结合时间维度和外部变量，为各门店提供精准的商品订货量预测',
    icon: BarChart3,
    status: '开发中',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    statusColor: 'bg-blue-100 text-blue-700',
    href: '/sales-forecast',
    id: 'F001',
    version: 'v3.2',
    creator: '李启方',
    price: '¥12.50',
    usage: '8.5',
    updateTime: '2024-03-20 14:20:00'
  },
  {
    title: '竞品价格分析',
    description: '系统化、多维度地对主要竞品的价格进行收集与分析，快速应对市场变化',
    icon: TrendingUp,
    status: '已发布',
    color: 'bg-green-50 text-green-600 border-green-200',
    statusColor: 'bg-green-100 text-green-700',
    href: '/competitive-analysis',
    id: 'F002',
    version: 'v2.1',
    creator: '王启方',
    price: '¥10.80',
    usage: '6.5',
    updateTime: '2024-03-18 16:45:00'
  },
  {
    title: '电商平台数据分析',
    description: '整合多电商平台的售后反馈，进行系统化分析，发现共性问题',
    icon: ShoppingCart,
    status: '内测中',
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    statusColor: 'bg-orange-100 text-orange-700',
    href: '/ecommerce-analysis',
    id: 'F003',
    version: 'v1.6',
    creator: '赵启方',
    price: '¥15.20',
    usage: '10.2',
    updateTime: '2024-03-25 09:30:00'
  },
  {
    title: '智能客服管理',
    description: '对全渠道客户投诉与反馈进行统一管理和智能分析，提升服务效率',
    icon: MessageSquare,
    status: '规划中',
    color: 'bg-gray-50 text-gray-600 border-gray-200',
    statusColor: 'bg-gray-100 text-gray-700',
    href: '/customer-service',
    id: 'F004',
    version: 'v1.0',
    creator: '陈启方',
    price: '¥8.90',
    usage: '3.2',
    updateTime: '2024-03-15 11:15:00'
  },
  {
    title: '门店运营标准化管理',
    description: '通过技术手段对门店员工着装、商品陈列等标准化执行情况进行自动监控',
    icon: Store,
    status: '规划中',
    color: 'bg-gray-50 text-gray-600 border-gray-200',
    statusColor: 'bg-gray-100 text-gray-700',
    href: '/store-operations',
    id: 'F005',
    version: 'v1.0',
    creator: '刘启方',
    price: '¥6.30',
    usage: '2.1',
    updateTime: '2024-03-12 08:45:00'
  },
  {
    title: '产品品质智能控制',
    description: '利用AI技术提升来货检验、发货检验和生产过程中异物检验的效率与准确性',
    icon: Shield,
    status: '规划中',
    color: 'bg-gray-50 text-gray-600 border-gray-200',
    statusColor: 'bg-gray-100 text-gray-700',
    href: '/quality-control',
    id: 'F006',
    version: 'v1.0',
    creator: '张启方',
    price: '¥9.60',
    usage: '4.8',
    updateTime: '2024-03-10 15:20:00'
  },
  {
    title: '称重商品自动识别',
    description: '在顾客称重散装商品时，通过摄像头自动识别商品品类，提升收银效率',
    icon: Scale,
    status: '规划中',
    color: 'bg-gray-50 text-gray-600 border-gray-200',
    statusColor: 'bg-gray-100 text-gray-700',
    href: '/product-recognition',
    id: 'F007',
    version: 'v1.0',
    creator: '杨启方',
    price: '¥7.40',
    usage: '1.9',
    updateTime: '2024-03-08 13:30:00'
  },
  {
    title: '京东爬虫监控',
    description: '监控京东商品评论数据爬取任务状态，提供实时的数据采集和分析功能',
    icon: Eye,
    status: '已发布',
    color: 'bg-green-50 text-green-600 border-green-200',
    statusColor: 'bg-green-100 text-green-700',
    href: '/crawlers/jd-monitor',
    id: 'F008',
    version: 'v2.3',
    creator: '周启方',
    price: '¥11.20',
    usage: '7.6',
    updateTime: '2024-03-22 10:15:00'
  }
]

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">波尼亚AI平台</h1>
            <p className="text-sm text-gray-500 mt-1">
              智能化业务管理平台 - 7大核心业务模块全面覆盖
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-300">
              <Settings className="h-4 w-4 mr-2" />
              系统设置
            </Button>
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-300">
              <Activity className="h-4 w-4 mr-2" />
              数据统计
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              快速开始
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-6 border-b border-gray-200">
          <button className="pb-3 px-1 border-b-2 border-blue-600 text-blue-600 font-medium text-sm">
            业务模块总览
          </button>
          <button className="pb-3 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
            AI功能统计
          </button>
          <button className="pb-3 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
            系统监控
          </button>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索业务模块名称或功能"
                className="w-80 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button className="absolute right-3 top-2.5 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600">
              <option>开发状态</option>
              <option>已发布</option>
              <option>开发中</option>
              <option>内测中</option>
              <option>规划中</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    模块编号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    业务模块名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    版本
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    开发状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    负责人
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    预估成本
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    完成度(%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    更新时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {modules.map((module, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-blue-600 font-medium">{module.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 font-medium">{module.title}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-blue-600">{module.version}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={module.statusColor}>
                        {module.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {module.creator}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {module.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {module.usage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                      {module.updateTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-3">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Settings className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Activity className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
