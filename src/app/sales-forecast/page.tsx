'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart3, TrendingUp, Calendar, Store, RefreshCw, Download, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ForecastData {
  forecast_data: Array<{
    date: string
    predicted_sales: number
    confidence: number
    factors: any
  }>
  summary: {
    total_predicted_sales: number
    avg_daily_sales: number
    avg_confidence: number
    forecast_period: string
    factors_considered: string[]
  }
  accuracy_rate: number
  recommendations: Array<{
    type: string
    priority: string
    message: string
    action: string
  }>
}

export default function SalesForecastPage() {
  const [loading, setLoading] = useState(false)
  const [forecastData, setForecastData] = useState<ForecastData | null>(null)
  const [formData, setFormData] = useState({
    store_id: 'all',
    product_category: 'all',
    forecast_days: 7,
    confidence_level: 85,
    weather_condition: 'normal',
    is_holiday: false,
    is_promotion: false
  })

  const handleForecast = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sales-forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      if (result.success) {
        setForecastData(result.data.forecast_data)
      } else {
        alert('预测失败: ' + result.error)
      }
    } catch (error) {
      alert('预测失败，请重试')
    } finally {
      setLoading(false)
    }
  }
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
                <Select value={formData.store_id} onChange={(e) => setFormData({...formData, store_id: e.target.value})}>
                  <SelectItem value="store1">北京朝阳店</SelectItem>
                  <SelectItem value="store2">上海浦东店</SelectItem>
                  <SelectItem value="store3">深圳南山店</SelectItem>
                  <SelectItem value="all">所有门店</SelectItem>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">商品类别</Label>
                <Select value={formData.product_category} onChange={(e) => setFormData({...formData, product_category: e.target.value})}>
                  <SelectItem value="food">食品饮料</SelectItem>
                  <SelectItem value="daily">日用百货</SelectItem>
                  <SelectItem value="fresh">生鲜蔬果</SelectItem>
                  <SelectItem value="all">全部类别</SelectItem>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">预测周期</Label>
                <Select value={formData.forecast_days.toString()} onChange={(e) => setFormData({...formData, forecast_days: parseInt(e.target.value)})}>
                  <SelectItem value="7">未来7天</SelectItem>
                  <SelectItem value="14">未来14天</SelectItem>
                  <SelectItem value="30">未来30天</SelectItem>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weather">天气条件</Label>
                <Select value={formData.weather_condition} onChange={(e) => setFormData({...formData, weather_condition: e.target.value})}>
                  <SelectItem value="good">晴好天气</SelectItem>
                  <SelectItem value="normal">正常天气</SelectItem>
                  <SelectItem value="bad">恶劣天气</SelectItem>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidence">置信度</Label>
                <Input
                  type="number"
                  value={formData.confidence_level}
                  onChange={(e) => setFormData({...formData, confidence_level: parseInt(e.target.value)})}
                  min="50"
                  max="99"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="holiday"
                  checked={formData.is_holiday}
                  onChange={(e) => setFormData({...formData, is_holiday: e.target.checked})}
                />
                <Label htmlFor="holiday">节假日期间</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="promotion"
                  checked={formData.is_promotion}
                  onChange={(e) => setFormData({...formData, is_promotion: e.target.checked})}
                />
                <Label htmlFor="promotion">促销活动期间</Label>
              </div>

              <Button className="w-full" onClick={handleForecast} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    预测中...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    开始预测分析
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>预测结果</CardTitle>
              <CardDescription>基于AI模型的销售量预测结果</CardDescription>
            </CardHeader>
            <CardContent>
              {forecastData ? (
                <div className="space-y-6">
                  {/* 预测摘要 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600">总预测销量</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {forecastData.summary.total_predicted_sales.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600">日均销量</p>
                      <p className="text-2xl font-bold text-green-900">
                        {forecastData.summary.avg_daily_sales.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600">平均置信度</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {forecastData.summary.avg_confidence}%
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-orange-600">预测准确率</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {forecastData.accuracy_rate}%
                      </p>
                    </div>
                  </div>

                  {/* 预测数据表格 */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">日期</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">预测销量</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">置信度</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">影响因素</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {forecastData.forecast_data.map((day, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm">{day.date}</td>
                            <td className="px-4 py-2 text-sm font-medium">{day.predicted_sales.toLocaleString()}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                day.confidence >= 90 ? 'bg-green-100 text-green-800' :
                                day.confidence >= 80 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {day.confidence.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {day.factors.weather}, {day.factors.holiday ? '节假日' : '工作日'}, {day.factors.promotion ? '促销' : '正常'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 建议 */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">AI建议</h4>
                    {forecastData.recommendations.map((rec, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                        rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-start space-x-2">
                          <AlertCircle className={`h-4 w-4 mt-0.5 ${
                            rec.priority === 'high' ? 'text-red-500' :
                            rec.priority === 'medium' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                          <div>
                            <p className="text-sm font-medium">{rec.message}</p>
                            <p className="text-xs text-gray-600 mt-1">建议行动: {rec.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">请配置预测参数后查看结果</p>
                  </div>
                </div>
              )}
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
