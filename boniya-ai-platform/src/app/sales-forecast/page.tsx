'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BarChart3, TrendingUp, Calendar, Store, RefreshCw, Download, AlertCircle, Settings } from 'lucide-react'
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
  const [aiReport, setAiReport] = useState<any>(null)
  const [eventDescription, setEventDescription] = useState('')
  const [extractedFeatures, setExtractedFeatures] = useState<any>(null)
  const [featureLoading, setFeatureLoading] = useState(false)
  const [formData, setFormData] = useState({
    store_id: 'qingdao_chengyang',
    product_category: 'all',
    forecast_days: 7,
    confidence_level: 85,
    weather_condition: 'normal',
    is_holiday: false,
    is_promotion: false
  })



  // 特征提取函数
  const handleFeatureExtraction = async () => {
    if (!eventDescription.trim()) {
      alert('请输入事件描述')
      return
    }

    setFeatureLoading(true)
    try {
      const response = await fetch('/api/forecast/extract-features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventDescription: eventDescription
        })
      })

      const result = await response.json()
      if (result.success) {
        setExtractedFeatures(result.data)
      } else {
        alert('特征提取失败: ' + result.error)
      }
    } catch (error) {
      console.error('Feature extraction error:', error)
      alert('特征提取失败，请稍后重试')
    } finally {
      setFeatureLoading(false)
    }
  }

  // 生成AI报告函数
  const generateAIReport = async (forecastData: any) => {
    try {
      const reportData = {
        product_name: getProductName(formData.product_category),
        forecast_data: forecastData.forecast_data.reduce((acc: any, item: any) => {
          acc[item.date] = item.predicted_sales
          return acc
        }, {}),
        key_factors: forecastData.summary.factors_considered,
        analysis_period: {
          start_date: forecastData.forecast_data[0]?.date || new Date().toISOString().split('T')[0],
          end_date: forecastData.forecast_data[forecastData.forecast_data.length - 1]?.date || new Date().toISOString().split('T')[0]
        }
      }

      const response = await fetch('/api/forecast/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
      })

      const result = await response.json()
      if (result.success) {
        setAiReport(result.data.report)
      }
    } catch (error) {
      console.error('AI report generation error:', error)
    }
  }

  // 获取产品名称
  const getProductName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'sausage': '香肠类产品',
      'ham': '火腿类产品',
      'pork': '猪肉制品',
      'beef': '牛肉制品',
      'all': '全品类产品'
    }
    return categoryMap[category] || '未知产品'
  }

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
        // 自动生成AI报告
        await generateAIReport(result.data.forecast_data)
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

        {/* Forecast Configuration - 单独占一行 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <span>预测配置</span>
            </CardTitle>
            <CardDescription>设置预测参数和条件</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store" className="text-sm font-medium">选择门店</Label>
                <select
                  id="store"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={formData.store_id}
                  onChange={(e) => setFormData({...formData, store_id: e.target.value})}
                >
                  <option value="qingdao_chengyang">城阳利客来</option>
                  <option value="qingdao_licang">李沧大润发</option>
                  <option value="qingdao_shibei">市北家乐福</option>
                  <option value="qingdao_huangdao">黄岛沃尔玛</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product" className="text-sm font-medium">商品类别</Label>
                <select
                  id="product"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={formData.product_category}
                  onChange={(e) => setFormData({...formData, product_category: e.target.value})}
                >
                  <option value="ham">火腿类</option>
                  <option value="sausage">香肠类</option>
                  <option value="cooked">熟食类</option>
                  <option value="soup">汤品类</option>
                  <option value="packaged">包装食品</option>
                  <option value="all">全部类别</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period" className="text-sm font-medium">预测周期</Label>
                <select
                  id="period"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={formData.forecast_days.toString()}
                  onChange={(e) => setFormData({...formData, forecast_days: parseInt(e.target.value)})}
                >
                  <option value="7">未来7天</option>
                  <option value="14">未来14天</option>
                  <option value="30">未来30天</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weather" className="text-sm font-medium">天气条件</Label>
                <select
                  id="weather"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={formData.weather_condition}
                  onChange={(e) => setFormData({...formData, weather_condition: e.target.value})}
                >
                  <option value="good">晴好天气</option>
                  <option value="normal">正常天气</option>
                  <option value="bad">恶劣天气</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidence" className="text-sm font-medium">置信度(%)</Label>
                <Input
                  type="number"
                  className="text-sm"
                  value={formData.confidence_level}
                  onChange={(e) => setFormData({...formData, confidence_level: parseInt(e.target.value)})}
                  min="50"
                  max="99"
                />
              </div>
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

              {/* AI特征提取部分 */}
              <div className="border-t pt-4 space-y-3">
                <Label htmlFor="event-description">特殊事件描述 (AI智能分析)</Label>
                <textarea
                  id="event-description"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 min-h-[80px]"
                  placeholder="例如：本周六门店门口将举办大型啤酒节活动，预计客流量大增..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFeatureExtraction}
                  disabled={featureLoading || !eventDescription.trim()}
                  className="w-full"
                >
                  {featureLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      AI分析中...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      AI智能特征提取
                    </>
                  )}
                </Button>

                {/* 特征提取结果显示 */}
                {extractedFeatures && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-800">AI分析结果</span>
                    </div>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p><strong>影响等级:</strong> {extractedFeatures.impact_level}</p>
                      <p><strong>分析理由:</strong> {extractedFeatures.reasoning}</p>
                      <p><strong>置信度:</strong> {Math.round(extractedFeatures.confidence * 100)}%</p>
                    </div>
                  </div>
                )}
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

        {/* Forecast Results - 单独占一行 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>预测结果</span>
            </CardTitle>
            <CardDescription>基于AI模型的销售量预测结果</CardDescription>
          </CardHeader>
          <CardContent>
            {forecastData ? (
              <div className="space-y-4">
                {/* 预测摘要 - 紧凑显示 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">总预测销量</p>
                    <p className="text-lg font-bold text-blue-900">
                      {forecastData.summary.total_predicted_sales.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-600 mb-1">日均销量</p>
                    <p className="text-lg font-bold text-green-900">
                      {forecastData.summary.avg_daily_sales.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-purple-600 mb-1">平均置信度</p>
                    <p className="text-lg font-bold text-purple-900">
                      {forecastData.summary.avg_confidence}%
                    </p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-600 mb-1">预测准确率</p>
                    <p className="text-lg font-bold text-orange-900">
                      {forecastData.accuracy_rate}%
                    </p>
                  </div>
                </div>

                {/* 预测数据列表 - 紧凑显示 */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">详细预测数据</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {forecastData.forecast_data.map((day, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm font-medium text-gray-900">{day.date}</div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            day.confidence >= 90 ? 'bg-green-100 text-green-800' :
                            day.confidence >= 80 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {day.confidence.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-lg font-bold text-blue-600 mb-2">
                          {day.predicted_sales.toLocaleString()} 件
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            <span>{day.factors.weather}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            <span>{day.factors.holiday ? '节假日' : '工作日'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                            <span>{day.factors.promotion ? '促销活动' : '正常销售'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                  {/* Gemini AI智能分析报告 */}
                  {aiReport && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-blue-900">Gemini AI 智能分析报告</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          aiReport.confidence_level === 'high' ? 'bg-green-100 text-green-800' :
                          aiReport.confidence_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {aiReport.confidence_level === 'high' ? '高置信度' :
                           aiReport.confidence_level === 'medium' ? '中等置信度' : '低置信度'}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-blue-800 mb-2">📊 整体趋势分析</h5>
                          <p className="text-sm text-blue-700 bg-white/50 rounded p-3">
                            {aiReport.summary}
                          </p>
                        </div>

                        <div>
                          <h5 className="font-medium text-blue-800 mb-2">📈 关键日分析</h5>
                          <p className="text-sm text-blue-700 bg-white/50 rounded p-3">
                            {aiReport.daily_analysis}
                          </p>
                        </div>

                        <div>
                          <h5 className="font-medium text-blue-800 mb-2">💡 核心建议</h5>
                          <p className="text-sm text-blue-700 bg-white/50 rounded p-3 font-medium">
                            {aiReport.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 建议 */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">系统建议</h4>
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
