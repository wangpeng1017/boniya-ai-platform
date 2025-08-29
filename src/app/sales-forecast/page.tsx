import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart3, TrendingUp, Calendar, Store } from 'lucide-react'

export default function SalesForecastPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">门店销售数量预测</h1>
            <p className="text-gray-600 mt-2">
              基于历史销售数据，结合时间维度和外部变量，为各门店提供精准的商品订货量预测
            </p>
          </div>
          <Button>
            <BarChart3 className="mr-2 h-4 w-4" />
            生成预测报告
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总门店数</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+2 较上月</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">预测准确率</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87.5%</div>
              <p className="text-xs text-muted-foreground">+2.1% 较上月</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">本月预测商品</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">+12% 较上月</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">节省成本</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥128.5万</div>
              <p className="text-xs text-muted-foreground">+8.2% 较上月</p>
            </CardContent>
          </Card>
        </div>

        {/* Forecast Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>预测配置</CardTitle>
              <CardDescription>设置预测参数和条件</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store">选择门店</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择门店" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="store1">北京朝阳店</SelectItem>
                    <SelectItem value="store2">上海浦东店</SelectItem>
                    <SelectItem value="store3">深圳南山店</SelectItem>
                    <SelectItem value="all">所有门店</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="product">商品类别</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择商品类别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">食品饮料</SelectItem>
                    <SelectItem value="daily">日用百货</SelectItem>
                    <SelectItem value="fresh">生鲜蔬果</SelectItem>
                    <SelectItem value="all">全部类别</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="period">预测周期</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择预测周期" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">未来7天</SelectItem>
                    <SelectItem value="14">未来14天</SelectItem>
                    <SelectItem value="30">未来30天</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confidence">置信度</Label>
                <Input type="number" placeholder="85" min="50" max="99" />
              </div>
              
              <Button className="w-full">
                开始预测分析
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>预测结果</CardTitle>
              <CardDescription>基于AI模型的销售量预测结果</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">请配置预测参数后查看结果</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Predictions */}
        <Card>
          <CardHeader>
            <CardTitle>最近预测记录</CardTitle>
            <CardDescription>查看最近的预测任务和结果</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { store: '北京朝阳店', product: '食品饮料', accuracy: '89.2%', date: '2024-08-28', status: '已完成' },
                { store: '上海浦东店', product: '日用百货', accuracy: '85.7%', date: '2024-08-27', status: '已完成' },
                { store: '深圳南山店', product: '生鲜蔬果', accuracy: '91.3%', date: '2024-08-26', status: '已完成' },
              ].map((record, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">{record.store} - {record.product}</p>
                      <p className="text-sm text-gray-500">预测日期: {record.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{record.accuracy}</p>
                    <p className="text-sm text-gray-500">{record.status}</p>
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
