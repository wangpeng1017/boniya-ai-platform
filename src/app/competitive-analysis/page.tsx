'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown, Minus, Search, RefreshCw, Plus, Camera, Upload, AlertCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface CompetitorData {
  id: number
  product_name: string
  our_price: number
  competitor_name: string
  competitor_price: number
  price_advantage: boolean
  price_difference: number
  price_difference_percent: string
  location: string
  office: string
  created_at: string
}

interface AnalysisSummary {
  overview: {
    total_products: number
    advantage_count: number
    disadvantage_count: number
    advantage_rate: number
    avg_price_difference: string
  }
  competitor_analysis: Array<{
    competitor_name: string
    product_count: number
    advantage_count: number
    avg_price_diff: string
  }>
  recommendations: Array<{
    type: string
    priority: string
    message: string
    action: string
  }>
}

export default function CompetitiveAnalysisPage() {
  const [loading, setLoading] = useState(false)
  const [competitorData, setCompetitorData] = useState<CompetitorData[]>([])
  const [analysisSummary, setAnalysisSummary] = useState<AnalysisSummary | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    product_name: '',
    our_price: '',
    competitor_name: '',
    competitor_price: '',
    location: '',
    office: '',
    notes: ''
  })

  useEffect(() => {
    fetchCompetitorData()
    fetchAnalysisSummary()
  }, [])

  const fetchCompetitorData = async () => {
    try {
      const response = await fetch('/api/competitive-analysis')
      const result = await response.json()
      if (result.success) {
        setCompetitorData(result.data)
      }
    } catch (error) {
      console.error('获取竞品数据失败:', error)
    }
  }

  const fetchAnalysisSummary = async () => {
    try {
      const response = await fetch('/api/competitive-analysis?analysis_type=summary')
      const result = await response.json()
      if (result.success) {
        setAnalysisSummary(result.data)
      }
    } catch (error) {
      console.error('获取分析汇总失败:', error)
    }
  }

  const handleAddCompetitor = async () => {
    if (!formData.product_name || !formData.our_price || !formData.competitor_name || !formData.competitor_price) {
      alert('请填写必填字段')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/competitive-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          our_price: parseFloat(formData.our_price),
          competitor_price: parseFloat(formData.competitor_price),
          image_url: uploadedImage
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('竞品数据添加成功')
        setFormData({
          product_name: '',
          our_price: '',
          competitor_name: '',
          competitor_price: '',
          location: '',
          office: '',
          notes: ''
        })
        setUploadedImage(null)
        setShowAddForm(false)
        fetchCompetitorData()
        fetchAnalysisSummary()
      } else {
        alert('添加失败: ' + result.error)
      }
    } catch (error) {
      alert('添加失败，请重试')
    } finally {
      setLoading(false)
    }
  }
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_type', 'competitor_photo')
    formData.append('description', '竞品价格照片')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (result.success) {
        setUploadedImage(result.data.file_url)

        // 如果有OCR结果，自动填充表单
        if (result.data.ocr_result && result.data.ocr_result.products.length > 0) {
          const product = result.data.ocr_result.products[0]
          setFormData(prev => ({
            ...prev,
            product_name: product.name || '',
            competitor_price: product.price?.toString() || ''
          }))
        }
      } else {
        alert('图片上传失败: ' + result.error)
      }
    } catch (error) {
      alert('图片上传失败，请重试')
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">竞品价格分析</h1>
            <p className="text-gray-600 mt-2">
              基于青岛地区波尼亚与喜旺品牌真实价格数据，提供精准的竞争分析和定价建议
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => {fetchCompetitorData(); fetchAnalysisSummary()}}>
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新数据
            </Button>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="mr-2 h-4 w-4" />
              添加竞品数据
            </Button>
          </div>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">波尼亚产品数</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">30</div>
              <p className="text-xs text-muted-foreground">青岛地区SKU</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">价格优势产品</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">6</div>
              <p className="text-xs text-muted-foreground">
                城阳即墨地区优势
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">价格持平产品</CardTitle>
              <Minus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">6</div>
              <p className="text-xs text-muted-foreground">
                青岛办事处持平
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">独有产品</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">18</div>
              <p className="text-xs text-muted-foreground">
                喜旺无对应竞品
              </p>
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
                  <option>火腿类</option>
                  <option>烤肠类</option>
                  <option>香肠类</option>
                  <option>红肠类</option>
                  <option>熟食类</option>
                  <option>汤品类</option>
                  <option>包装食品</option>
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
                  name: '德国黑森林火腿 200g',
                  ourPrice: 29.9,
                  category: '火腿类',
                  region: '青岛办事处',
                  competitors: [
                    { name: '喜旺', price: 29.9, trend: 'stable', status: '价格相同' }
                  ],
                  advantage: null,
                  isEqual: true
                },
                {
                  name: '维也纳香肠 160g',
                  ourPrice: 7.9,
                  category: '香肠类',
                  region: '青岛办事处',
                  competitors: [
                    { name: '喜旺', price: 7.9, trend: 'stable', status: '价格相同' }
                  ],
                  advantage: null,
                  isEqual: true
                },
                {
                  name: '猪头肉 200g',
                  ourPrice: 15.9,
                  category: '熟食类',
                  region: '青岛办事处',
                  competitors: [],
                  advantage: null,
                  isUnique: true
                },
                {
                  name: '蒜味烤肠 160g (城阳即墨)',
                  ourPrice: 7.5,
                  category: '烤肠类',
                  region: '城阳即墨',
                  competitors: [
                    { name: '喜旺', price: 7.9, trend: 'stable', status: '波尼亚更优' }
                  ],
                  advantage: true
                },
                {
                  name: '流亭猪蹄 300g',
                  ourPrice: 16.9,
                  category: '包装食品',
                  region: '青岛办事处',
                  competitors: [],
                  advantage: null,
                  isUnique: true
                }
              ].map((product, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium">{product.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {product.region}
                      </Badge>
                      {product.isEqual && (
                        <Badge variant="secondary">价格相同</Badge>
                      )}
                      {product.advantage === true && (
                        <Badge variant="default">波尼亚优势</Badge>
                      )}
                      {product.advantage === false && (
                        <Badge variant="destructive">价格劣势</Badge>
                      )}
                      {product.isUnique && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">波尼亚独有</Badge>
                      )}
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      ¥{product.ourPrice.toFixed(2)}
                    </div>
                  </div>

                  {product.isUnique ? (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700 font-medium">波尼亚独有产品</span>
                      </div>
                      <p className="text-green-600 text-sm mt-1">
                        喜旺无对应竞品，可利用产品独特性进行市场推广
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {product.competitors.map((competitor, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{competitor.name}</p>
                            <p className="text-sm text-gray-500">{competitor.status}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">¥{competitor.price.toFixed(2)}</span>
                              {competitor.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                              {competitor.trend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
                              {competitor.trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
                            </div>
                            {!product.isEqual && (
                              <p className="text-xs text-gray-500">
                                {competitor.price > product.ourPrice ? '+' : ''}
                                {((competitor.price - product.ourPrice) / product.ourPrice * 100).toFixed(1)}%
                              </p>
                            )}
                            {product.isEqual && (
                              <p className="text-xs text-blue-600">价格一致</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                { product: '蒜味烤肠 160g (城阳即墨)', type: '价格优势', message: '波尼亚 ¥7.5 vs 喜旺 ¥7.9，优势 5.1%', time: '1小时前', severity: 'low' },
                { product: '德国黑森林火腿 200g', type: '价格持平', message: '波尼亚与喜旺价格均为 ¥29.9，建议关注服务差异化', time: '3小时前', severity: 'medium' },
                { product: '猪头肉 200g', type: '独有产品', message: '波尼亚独有产品 ¥15.9，喜旺无对应竞品', time: '6小时前', severity: 'low' },
                { product: '法国皇家火腿 200g (城阳即墨)', type: '价格优势', message: '波尼亚 ¥25.9 vs 喜旺 ¥26.9，优势 3.7%', time: '1天前', severity: 'low' }
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
