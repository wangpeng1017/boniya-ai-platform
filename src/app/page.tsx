// import { MainLayout } from '@/components/layout/main-layout'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { BarChart3, TrendingUp, ShoppingCart, MessageSquare, Store, Shield, Scale } from 'lucide-react'

const modules = [
  {
    title: '门店销售数量预测',
    description: '基于历史销售数据，结合时间维度和外部变量，为各门店提供精准的商品订货量预测',
    icon: BarChart3,
    status: '开发中',
    color: 'bg-blue-500'
  },
  {
    title: '竞品价格分析',
    description: '系统化、多维度地对主要竞品的价格进行收集与分析，快速应对市场变化',
    icon: TrendingUp,
    status: '开发中',
    color: 'bg-green-500'
  },
  {
    title: '电商平台数据分析',
    description: '整合多电商平台的售后反馈，进行系统化分析，发现共性问题',
    icon: ShoppingCart,
    status: '规划中',
    color: 'bg-purple-500'
  },
  {
    title: '智能客服管理',
    description: '对全渠道客户投诉与反馈进行统一管理和智能分析，提升服务效率',
    icon: MessageSquare,
    status: '规划中',
    color: 'bg-orange-500'
  },
  {
    title: '门店运营标准化管理',
    description: '通过技术手段对门店员工着装、商品陈列等标准化执行情况进行自动监控',
    icon: Store,
    status: '规划中',
    color: 'bg-red-500'
  },
  {
    title: '产品品质智能控制',
    description: '利用AI技术提升来货检验、发货检验和生产过程中异物检验的效率与准确性',
    icon: Shield,
    status: '规划中',
    color: 'bg-indigo-500'
  },
  {
    title: '称重商品自动识别',
    description: '在顾客称重散装商品时，通过摄像头自动识别商品品类，提升收银效率',
    icon: Scale,
    status: '规划中',
    color: 'bg-teal-500'
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 波尼亚AI平台
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          企业级AI数据分析平台 - 部署成功！
        </p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">✅ 系统状态</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">部署状态</h3>
              <p className="text-green-600">✅ 成功部署</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">构建版本</h3>
              <p className="text-blue-600">📦 v1.0.0</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">环境</h3>
              <p className="text-purple-600">🚀 生产环境</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800">域名</h3>
              <p className="text-orange-600">🌐 boniya.aifly.me</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">🚀 核心功能模块</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">📊 销售预测</h3>
              <p className="text-sm text-gray-600">门店销售数量预测</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">📈 竞品分析</h3>
              <p className="text-sm text-gray-600">竞品价格分析</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">🛒 电商分析</h3>
              <p className="text-sm text-gray-600">电商平台数据分析</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">💬 智能客服</h3>
              <p className="text-sm text-gray-600">智能客服管理</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">🏪 门店运营</h3>
              <p className="text-sm text-gray-600">门店运营标准化</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">🛡️ 品质控制</h3>
              <p className="text-sm text-gray-600">产品品质智能控制</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">⚖️ 商品识别</h3>
              <p className="text-sm text-gray-600">称重商品自动识别</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">🕷️ 京东爬虫</h3>
              <p className="text-sm text-gray-600">评论数据采集</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">🤖 Gemini AI</h3>
              <p className="text-sm text-gray-600">Google AI集成</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500">
            🎊 恭喜！波尼亚AI平台已成功部署并运行
          </p>
          <p className="text-sm text-gray-400 mt-2">
            构建时间: {new Date().toLocaleString('zh-CN')}
          </p>
        </div>
      </div>
    </div>
  )
}
