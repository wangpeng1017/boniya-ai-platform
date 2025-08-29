import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, ShoppingCart, MessageSquare, Store, Shield, Scale, Eye } from 'lucide-react'

const modules = [
  {
    title: '门店销售数量预测',
    description: '基于历史销售数据，结合时间维度和外部变量，为各门店提供精准的商品订货量预测',
    icon: BarChart3,
    status: '开发中',
    color: 'bg-blue-500',
    href: '/sales-forecast'
  },
  {
    title: '竞品价格分析',
    description: '系统化、多维度地对主要竞品的价格进行收集与分析，快速应对市场变化',
    icon: TrendingUp,
    status: '开发中',
    color: 'bg-green-500',
    href: '/competitive-analysis'
  },
  {
    title: '电商平台数据分析',
    description: '整合多电商平台的售后反馈，进行系统化分析，发现共性问题',
    icon: ShoppingCart,
    status: '规划中',
    color: 'bg-purple-500',
    href: '/ecommerce-analysis'
  },
  {
    title: '智能客服管理',
    description: '对全渠道客户投诉与反馈进行统一管理和智能分析，提升服务效率',
    icon: MessageSquare,
    status: '规划中',
    color: 'bg-orange-500',
    href: '/customer-service'
  },
  {
    title: '门店运营标准化管理',
    description: '通过技术手段对门店员工着装、商品陈列等标准化执行情况进行自动监控',
    icon: Store,
    status: '规划中',
    color: 'bg-red-500',
    href: '/store-operations'
  },
  {
    title: '产品品质智能控制',
    description: '利用AI技术提升来货检验、发货检验和生产过程中异物检验的效率与准确性',
    icon: Shield,
    status: '规划中',
    color: 'bg-indigo-500',
    href: '/quality-control'
  },
  {
    title: '称重商品自动识别',
    description: '在顾客称重散装商品时，通过摄像头自动识别商品品类，提升收银效率',
    icon: Scale,
    status: '规划中',
    color: 'bg-teal-500',
    href: '/product-recognition'
  },
  {
    title: '京东爬虫监控',
    description: '监控京东商品评论数据爬取任务状态，提供实时的数据采集和分析功能',
    icon: Eye,
    status: '已完成',
    color: 'bg-cyan-500',
    href: '/crawlers/jd-monitor'
  }
]

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎使用波尼亚AI平台</h1>
          <p className="text-gray-600">
            通过整合人工智能技术，解决公司在销售预测、市场竞争分析、客户服务、门店运营、质量控制和零售效率等方面的核心痛点
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${module.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        module.status === '开发中'
                          ? 'bg-blue-100 text-blue-800'
                          : module.status === '已完成'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {module.status}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {module.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </MainLayout>
  )
}
