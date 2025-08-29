import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, Search, RefreshCw } from 'lucide-react'

export default function CompetitiveAnalysisPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">竞品价格分析</h1>
            <p className="text-gray-600 mt-2">
              系统化、多维度地对主要竞品的价格进行收集与分析，快速应对市场变化
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新数据
            </Button>
            <Button>
              <Search className="mr-2 h-4 w-4" />
              添加监控商品
            </Button>
          </div>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">监控商品数</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+23 较上周</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">价格优势商品</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">68%</div>
              <p className="text-xs text-muted-foreground">+5% 较上周</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">价格劣势商品</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">22%</div>
              <p className="text-xs text-muted-foreground">-3% 较上周</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均价差</CardTitle>
              <Minus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-2.3%</div>
              <p className="text-xs text-muted-foreground">优于竞品</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>商品搜索</CardTitle>
            <CardDescription>搜索和筛选要分析的商品</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="search">商品名称或关键词</Label>
                <Input 
                  id="search"
                  placeholder="输入商品名称、品牌或关键词..."
                  className="mt-1"
                />
              </div>
              <div className="w-48">
                <Label htmlFor="category">商品类别</Label>
                <select className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2">
                  <option>全部类别</option>
                  <option>食品饮料</option>
                  <option>日用百货</option>
                  <option>生鲜蔬果</option>
                  <option>服装鞋帽</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button>搜索</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitive Analysis Results */}
        <Card>
          <CardHeader>
            <CardTitle>竞品价格对比</CardTitle>
            <CardDescription>实时竞品价格监控和对比分析</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: '可口可乐 330ml',
                  ourPrice: 3.50,
                  competitors: [
                    { name: '沃尔玛', price: 3.80, trend: 'up' },
                    { name: '家乐福', price: 3.60, trend: 'down' },
                    { name: '大润发', price: 3.45, trend: 'stable' }
                  ],
                  advantage: true
                },
                {
                  name: '农夫山泉 550ml',
                  ourPrice: 2.80,
                  competitors: [
                    { name: '沃尔玛', price: 2.50, trend: 'stable' },
                    { name: '家乐福', price: 2.60, trend: 'up' },
                    { name: '大润发', price: 2.55, trend: 'down' }
                  ],
                  advantage: false
                },
                {
                  name: '统一方便面',
                  ourPrice: 4.20,
                  competitors: [
                    { name: '沃尔玛', price: 4.50, trend: 'up' },
                    { name: '家乐福', price: 4.30, trend: 'stable' },
                    { name: '大润发', price: 4.40, trend: 'up' }
                  ],
                  advantage: true
                }
              ].map((product, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium">{product.name}</h3>
                      <Badge variant={product.advantage ? "default" : "destructive"}>
                        {product.advantage ? '价格优势' : '价格劣势'}
                      </Badge>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      ¥{product.ourPrice.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {product.competitors.map((competitor, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{competitor.name}</p>
                          <p className="text-sm text-gray-500">竞争对手</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">¥{competitor.price.toFixed(2)}</span>
                            {competitor.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                            {competitor.trend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
                            {competitor.trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
                          </div>
                          <p className="text-xs text-gray-500">
                            {competitor.price > product.ourPrice ? '+' : ''}
                            {((competitor.price - product.ourPrice) / product.ourPrice * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>价格预警</CardTitle>
            <CardDescription>设置价格变动预警，及时响应市场变化</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { product: '可口可乐 330ml', type: '竞品降价', message: '沃尔玛价格下调至 ¥3.60', time: '2小时前', severity: 'high' },
                { product: '农夫山泉 550ml', type: '价格劣势', message: '我方价格高于市场平均价 12%', time: '4小时前', severity: 'medium' },
                { product: '统一方便面', type: '价格优势', message: '我方价格低于竞品平均价 8%', time: '1天前', severity: 'low' }
              ].map((alert, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                  alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                  alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}>
                  <div>
                    <p className="font-medium">{alert.product}</p>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{alert.type}</Badge>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
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
