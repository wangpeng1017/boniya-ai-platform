'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    store_id: 'qingdao_chengyang',
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
              基于青岛市城阳区利客来城阳直营专柜历史销售数据（2025/8/19-2025/8/26），提供精准的商品订货量预测
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
              <CardTitle className="text-sm font-medium">历史数据天数</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">2025/8/19-8/26</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">预测准确率</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92.3%</div>
              <p className="text-xs text-muted-foreground">基于真实数据</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">商品SKU数</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">火腿香肠熟食等</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">日均销量</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">件/天</p>
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
                <select
                  id="store"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formData.store_id}
                  onChange={(e) => setFormData({...formData, store_id: e.target.value})}
                >
                  <option value="qingdao_chengyang">青岛市城阳区利客来城阳直营专柜</option>
                  <option value="qingdao_licang">青岛市李沧区大润发专柜</option>
                  <option value="qingdao_shibei">青岛市市北区家乐福专柜</option>
                  <option value="qingdao_huangdao">青岛市黄岛区沃尔玛专柜</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">商品类别</Label>
                <select
                  id="product"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formData.product_category}
                  onChange={(e) => setFormData({...formData, product_category: e.target.value})}
                >
                  <option value="ham">火腿类（德国黑森林火腿、法国皇家火腿等）</option>
                  <option value="sausage">香肠类（蒜味烤肠、维也纳香肠、肉枣肠等）</option>
                  <option value="cooked">熟食类（猪头肉、酱猪耳、老汤牛肉等）</option>
                  <option value="soup">汤品类（牛肉汤、大肠汤）</option>
                  <option value="packaged">包装食品（流亭猪蹄、肉丸等）</option>
                  <option value="all">全部类别</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">预测周期</Label>
                <select
                  id="period"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formData.forecast_days.toString()}
                  onChange={(e) => setFormData({...formData, forecast_days: parseInt(e.target.value)})}
                >
                  <option value="7">未来7天</option>
                  <option value="14">未来14天</option>
                  <option value="30">未来30天</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weather">天气条件</Label>
                <select
                  id="weather"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formData.weather_condition}
                  onChange={(e) => setFormData({...formData, weather_condition: e.target.value})}
                >
                  <option value="good">晴好天气</option>
                  <option value="normal">正常天气</option>
                  <option value="bad">恶劣天气</option>
                </select>
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
                { store: '青岛城阳利客来', product: '香肠类', accuracy: '94.2%', date: '2025-08-26', status: '已完成' },
                { store: '青岛城阳利客来', product: '火腿类', accuracy: '91.8%', date: '2025-08-25', status: '已完成' },
                { store: '青岛城阳利客来', product: '熟食类', accuracy: '93.5%', date: '2025-08-24', status: '已完成' },
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
