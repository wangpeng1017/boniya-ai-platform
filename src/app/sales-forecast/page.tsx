import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  AlertCircle,
  Calendar,
  Search,
  Filter,
  Download
} from 'lucide-react'

// 模拟数据
const kpiData = [
  {
    title: '总销售额',
    value: '¥2,847,392',
    change: '+12.5%',
    trend: 'up',
    icon: BarChart3
  },
  {
    title: '预测准确率',
    value: '87.3%',
    change: '+2.1%',
    trend: 'up',
    icon: TrendingUp
  },
  {
    title: '库存周转天数',
    value: '15.2天',
    change: '-1.8天',
    trend: 'down',
    icon: Package
  },
  {
    title: '缺货风险',
    value: '3个SKU',
    change: '-2个',
    trend: 'down',
    icon: AlertCircle
  }
]

const recentForecasts = [
  {
    date: '2024-08-30',
    store: '青岛市城阳区利客来城阳直营专柜',
    product: '肉枣肠',
    predicted: '25.5kg',
    confidence: '92%',
    status: 'high'
  },
  {
    date: '2024-08-30',
    store: '青岛市城阳区利客来城阳直营专柜',
    product: '维也纳香肠',
    predicted: '32.8kg',
    confidence: '88%',
    status: 'high'
  },
  {
    date: '2024-08-30',
    store: '青岛市城阳区利客来城阳直营专柜',
    product: '酱猪耳',
    predicted: '8.2kg',
    confidence: '75%',
    status: 'medium'
  }
]

export default function SalesForecastPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">门店销售数量预测</h1>
            <p className="text-gray-600 mt-1">
              基于历史销售数据，结合时间维度和外部变量，为各门店提供精准的商品订货量预测
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              选择日期
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              导出报告
            </Button>
          </div>
        </div>

        {/* KPI 卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {kpi.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <p className={`text-xs ${
                    kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.change} 较上月
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 搜索和筛选 */}
        <Card>
          <CardHeader>
            <CardTitle>销售预测查询</CardTitle>
            <CardDescription>
              输入查询条件，获取精准的销售预测数据
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input placeholder="搜索门店或商品..." className="pl-10" />
              </div>
              <Input type="date" placeholder="开始日期" />
              <Input type="date" placeholder="结束日期" />
              <Button>
                <Filter className="h-4 w-4 mr-2" />
                查询预测
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 预测结果表格 */}
        <Card>
          <CardHeader>
            <CardTitle>最新预测结果</CardTitle>
            <CardDescription>
              显示最近的销售预测数据和置信度
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">日期</th>
                    <th className="text-left py-3 px-4">门店</th>
                    <th className="text-left py-3 px-4">商品</th>
                    <th className="text-left py-3 px-4">预测销量</th>
                    <th className="text-left py-3 px-4">置信度</th>
                    <th className="text-left py-3 px-4">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {recentForecasts.map((forecast, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{forecast.date}</td>
                      <td className="py-3 px-4 max-w-xs truncate">{forecast.store}</td>
                      <td className="py-3 px-4">{forecast.product}</td>
                      <td className="py-3 px-4 font-medium">{forecast.predicted}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          forecast.status === 'high' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {forecast.confidence}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">
                          查看详情
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
