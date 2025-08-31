'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TrendingUp, TrendingDown, Minus, Search, RefreshCw, Plus, Camera, Upload, AlertCircle, Eye, Calendar, MapPin, User, Image as ImageIcon } from 'lucide-react'
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

interface CompetitorRecord {
  id: number
  product_name: string
  specification: string
  price: number
  competitor_name: string
  location: string
  region: string
  image_url?: string
  image_thumbnail?: string
  submitted_by: string
  submitted_at: string
  source_type: 'ocr' | 'manual'
  confidence_score?: number
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
  const [activeTab, setActiveTab] = useState('analysis')

  // 竞品数据相关状态
  const [competitorRecords, setCompetitorRecords] = useState<CompetitorRecord[]>([])
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(10)

  // 筛选状态
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [rawDataInput, setRawDataInput] = useState('')
  const [processingLoading, setProcessingLoading] = useState(false)
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

  // 获取竞品数据记录
  const fetchCompetitorRecords = async () => {
    setRecordsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        region: selectedRegion,
        ...(dateRange.start && { start_date: dateRange.start }),
        ...(dateRange.end && { end_date: dateRange.end })
      })

      const response = await fetch(`/api/competitive-analysis/records?${params}`)
      const result = await response.json()

      if (result.success) {
        setCompetitorRecords(result.data.records || [])
        setTotalPages(Math.ceil((result.data.total || 0) / pageSize))
      } else {
        console.error('获取竞品数据失败:', result.error)
      }
    } catch (error) {
      console.error('获取竞品数据失败:', error)
    } finally {
      setRecordsLoading(false)
    }
  }

  // AI价格趋势分析函数
  const handleAIAnalysis = async () => {
    setAnalysisLoading(true)
    try {
      const response = await fetch('/api/competitor-price/analyze-trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand: 'all',
          region: selectedRegion === 'all' ? null : selectedRegion,
          startDate: dateRange.start,
          endDate: dateRange.end,
          analysisType: 'comprehensive'
        })
      })

      const result = await response.json()
      if (result.success) {
        setAiAnalysis(result.data)
      } else {
        alert('AI分析失败: ' + result.error)
      }
    } catch (error) {
      console.error('AI analysis error:', error)
      alert('AI分析失败，请稍后重试')
    } finally {
      setAnalysisLoading(false)
    }
  }

  // 处理原始数据函数
  const handleProcessRawData = async () => {
    if (!rawDataInput.trim()) {
      alert('请输入原始数据')
      return
    }

    setProcessingLoading(true)
    try {
      const response = await fetch('/api/competitor-price/process-raw-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawText: rawDataInput,
          sourceType: 'manual',
          locationText: selectedRegion === 'all' ? null : selectedRegion,
          salespersonId: 1
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('数据处理成功！')
        setRawDataInput('')
        // 刷新竞品数据
        if (activeTab === 'data') {
          fetchCompetitorRecords()
        }
      } else {
        alert('数据处理失败: ' + result.error)
      }
    } catch (error) {
      console.error('Raw data processing error:', error)
      alert('数据处理失败，请稍后重试')
    } finally {
      setProcessingLoading(false)
    }
  }

  // 页面加载时获取数据
  useEffect(() => {
    if (activeTab === 'data') {
      fetchCompetitorRecords()
    }
  }, [activeTab, currentPage, selectedRegion, dateRange])

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
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

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analysis">竞品分析</TabsTrigger>
            <TabsTrigger value="data">竞品数据</TabsTrigger>
          </TabsList>

          {/* 竞品分析标签页 */}
          <TabsContent value="analysis" className="space-y-6">
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>波尼亚产品</TableHead>
                    <TableHead>类别</TableHead>
                    <TableHead>区域</TableHead>
                    <TableHead>波尼亚价格</TableHead>
                    <TableHead>竞品名称</TableHead>
                    <TableHead>竞品价格</TableHead>
                    <TableHead>价格差异</TableHead>
                    <TableHead>优势状态</TableHead>
                    <TableHead>趋势</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
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
                    },
                    {
                      name: '法国皇家火腿 200g',
                      ourPrice: 25.9,
                      category: '火腿类',
                      region: '城阳即墨',
                      competitors: [
                        { name: '喜旺', price: 26.9, trend: 'up', status: '波尼亚更优' }
                      ],
                      advantage: true
                    }
                  ].map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {product.region}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-lg font-bold text-blue-600">
                          ¥{product.ourPrice.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {product.isUnique ? (
                          <span className="text-gray-500 italic">无竞品</span>
                        ) : (
                          product.competitors.map((competitor, idx) => (
                            <div key={idx} className="font-medium">
                              {competitor.name}
                            </div>
                          ))
                        )}
                      </TableCell>
                      <TableCell>
                        {product.isUnique ? (
                          <span className="text-gray-500">-</span>
                        ) : (
                          product.competitors.map((competitor, idx) => (
                            <div key={idx} className="font-medium">
                              ¥{competitor.price.toFixed(2)}
                            </div>
                          ))
                        )}
                      </TableCell>
                      <TableCell>
                        {product.isUnique ? (
                          <span className="text-gray-500">-</span>
                        ) : (
                          product.competitors.map((competitor, idx) => (
                            <div key={idx} className={`font-medium ${
                              competitor.price > product.ourPrice ? 'text-red-600' :
                              competitor.price < product.ourPrice ? 'text-green-600' :
                              'text-gray-600'
                            }`}>
                              {competitor.price === product.ourPrice ? '0.0%' :
                               `${competitor.price > product.ourPrice ? '+' : ''}${((competitor.price - product.ourPrice) / product.ourPrice * 100).toFixed(1)}%`}
                            </div>
                          ))
                        )}
                      </TableCell>
                      <TableCell>
                        {product.isUnique && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            波尼亚独有
                          </Badge>
                        )}
                        {product.isEqual && (
                          <Badge variant="secondary">价格相同</Badge>
                        )}
                        {product.advantage === true && (
                          <Badge variant="default">波尼亚优势</Badge>
                        )}
                        {product.advantage === false && (
                          <Badge variant="destructive">价格劣势</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.isUnique ? (
                          <span className="text-gray-500">-</span>
                        ) : (
                          product.competitors.map((competitor, idx) => (
                            <div key={idx} className="flex items-center">
                              {competitor.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                              {competitor.trend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
                              {competitor.trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
                            </div>
                          ))
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* AI智能分析 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Gemini AI 智能分析</span>
            </CardTitle>
            <CardDescription>基于AI的竞品价格趋势分析和市场洞察</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={handleAIAnalysis}
                disabled={analysisLoading}
                className="w-full"
              >
                {analysisLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    AI分析中...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    开始AI智能分析
                  </>
                )}
              </Button>

              {/* AI分析结果展示 */}
              {aiAnalysis && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-blue-900">AI分析报告</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      aiAnalysis.trend_analysis.confidence_level === 'high' ? 'bg-green-100 text-green-800' :
                      aiAnalysis.trend_analysis.confidence_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {aiAnalysis.trend_analysis.confidence_level === 'high' ? '高置信度' :
                       aiAnalysis.trend_analysis.confidence_level === 'medium' ? '中等置信度' : '低置信度'}
                    </span>
                  </div>

                  {/* 执行摘要 */}
                  <div className="bg-white/70 rounded p-3">
                    <h5 className="font-medium text-blue-800 mb-2">📊 执行摘要</h5>
                    <p className="text-sm text-blue-700">{aiAnalysis.summary_report}</p>
                  </div>

                  {/* 趋势分析 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/70 rounded p-3">
                      <h5 className="font-medium text-blue-800 mb-2">📈 价格趋势</h5>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          aiAnalysis.trend_analysis.trend_direction === 'rising' ? 'bg-red-100 text-red-800' :
                          aiAnalysis.trend_analysis.trend_direction === 'falling' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {aiAnalysis.trend_analysis.trend_direction === 'rising' ? '上涨' :
                           aiAnalysis.trend_analysis.trend_direction === 'falling' ? '下跌' :
                           aiAnalysis.trend_analysis.trend_direction === 'stable' ? '稳定' : '波动'}
                        </span>
                        <span className="text-sm text-blue-700">
                          强度: {aiAnalysis.trend_analysis.trend_strength === 'strong' ? '强' :
                                aiAnalysis.trend_analysis.trend_strength === 'moderate' ? '中等' : '弱'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/70 rounded p-3">
                      <h5 className="font-medium text-blue-800 mb-2">📊 数据点</h5>
                      <p className="text-2xl font-bold text-blue-900">{aiAnalysis.data_points_count}</p>
                      <p className="text-xs text-blue-600">个价格数据点</p>
                    </div>
                  </div>

                  {/* 关键洞察 */}
                  <div className="bg-white/70 rounded p-3">
                    <h5 className="font-medium text-blue-800 mb-2">💡 关键洞察</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {aiAnalysis.trend_analysis.key_insights.map((insight: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 市场机会和威胁 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/70 rounded p-3">
                      <h5 className="font-medium text-green-800 mb-2">🚀 市场机会</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        {aiAnalysis.trend_analysis.market_opportunities.map((opportunity: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{opportunity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white/70 rounded p-3">
                      <h5 className="font-medium text-red-800 mb-2">⚠️ 潜在威胁</h5>
                      <ul className="text-sm text-red-700 space-y-1">
                        {aiAnalysis.trend_analysis.threats.map((threat: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{threat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 定价建议 */}
                  <div className="bg-white/70 rounded p-3">
                    <h5 className="font-medium text-purple-800 mb-2">💰 定价建议</h5>
                    <ul className="text-sm text-purple-700 space-y-1">
                      {aiAnalysis.trend_analysis.pricing_recommendations.map((recommendation: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
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
          </TabsContent>

          {/* 竞品数据标签页 */}
          <TabsContent value="data" className="space-y-6">
            {/* AI数据处理 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>AI智能数据录入</span>
                </CardTitle>
                <CardDescription>使用Gemini AI自动解析和结构化竞品价格信息</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="raw-data-input">原始数据输入</Label>
                    <textarea
                      id="raw-data-input"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 min-h-[100px]"
                      placeholder="例如：那个喜旺的蒜香味儿的烤肠，160克一包的，现在卖七块九。"
                      value={rawDataInput}
                      onChange={(e) => setRawDataInput(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      支持语音转文字、OCR识别结果或手动输入的原始文本
                    </p>
                  </div>

                  <Button
                    onClick={handleProcessRawData}
                    disabled={processingLoading || !rawDataInput.trim()}
                    className="w-full"
                  >
                    {processingLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        AI处理中...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        AI智能解析并保存
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 筛选器 */}
            <Card>
              <CardHeader>
                <CardTitle>数据筛选</CardTitle>
                <CardDescription>筛选和查看所有竞品数据记录</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="start-date">开始日期</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">结束日期</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="region-filter">区域筛选</Label>
                    <select
                      id="region-filter"
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="all">全部区域</option>
                      <option value="青岛市区">青岛市区</option>
                      <option value="城阳区">城阳区</option>
                      <option value="即墨区">即墨区</option>
                      <option value="胶州市">胶州市</option>
                      <option value="平度市">平度市</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={fetchCompetitorRecords} disabled={recordsLoading}>
                      <Search className="mr-2 h-4 w-4" />
                      {recordsLoading ? '搜索中...' : '搜索'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 竞品数据表格 */}
            <Card>
              <CardHeader>
                <CardTitle>竞品数据记录</CardTitle>
                <CardDescription>
                  共 {competitorRecords.length} 条记录，第 {currentPage} 页 / 共 {totalPages} 页
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recordsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span>加载中...</span>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>区域</TableHead>
                            <TableHead>商品名称</TableHead>
                            <TableHead>规格</TableHead>
                            <TableHead>价格</TableHead>
                            <TableHead>竞品品牌</TableHead>
                            <TableHead>图片</TableHead>
                            <TableHead>提交时间</TableHead>
                            <TableHead>提交人员</TableHead>
                            <TableHead>来源</TableHead>
                            <TableHead>操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {competitorRecords.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                                暂无数据记录
                              </TableCell>
                            </TableRow>
                          ) : (
                            competitorRecords.map((record) => (
                              <TableRow key={record.id}>
                                <TableCell>
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                    {record.region}
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {record.product_name}
                                </TableCell>
                                <TableCell>{record.specification || '-'}</TableCell>
                                <TableCell>
                                  <span className="font-semibold text-green-600">
                                    ¥{record.price.toFixed(2)}
                                  </span>
                                </TableCell>
                                <TableCell>{record.competitor_name}</TableCell>
                                <TableCell>
                                  {record.image_thumbnail ? (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setSelectedImageUrl(record.image_url || null)}
                                        >
                                          <ImageIcon className="h-4 w-4 mr-1" />
                                          查看
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                          <DialogTitle>商品图片</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex justify-center">
                                          <img
                                            src={selectedImageUrl || record.image_thumbnail}
                                            alt={record.product_name}
                                            className="max-w-full max-h-96 object-contain"
                                          />
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  ) : (
                                    <span className="text-gray-400">无图片</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center text-sm">
                                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                    {formatDate(record.submitted_at)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 mr-1 text-gray-400" />
                                    {record.submitted_by}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={record.source_type === 'ocr' ? 'default' : 'secondary'}>
                                    {record.source_type === 'ocr' ? 'OCR识别' : '手动录入'}
                                  </Badge>
                                  {record.confidence_score && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      置信度: {Math.round(record.confidence_score * 100)}%
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* 分页控件 */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                          显示第 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, competitorRecords.length)} 条记录
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            上一页
                          </Button>
                          <span className="flex items-center px-3 py-1 text-sm">
                            {currentPage} / {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                          >
                            下一页
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
