'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Camera,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Upload,
  Search,
  Filter,
  Eye,
  Loader2,
  Edit,
  Save,
  X
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import '@/styles/mobile-competitive-analysis.css'

// 模拟数据
const priceComparisonData = [
  {
    id: 1,
    location: '青岛办事处',
    ourProduct: '经典1903 果木烤火腿(350g)',
    ourPrice: 19.9,
    competitorProduct: '手掰肉老火腿 340g',
    competitorPrice: 22.9,
    competitor: '喜旺',
    difference: -3.0,
    status: 'advantage'
  },
  {
    id: 2,
    location: '青岛办事处',
    ourProduct: '1981 青岛老火腿(300g)',
    ourPrice: 29.9,
    competitorProduct: '无淀粉大肉块火腿 340g',
    competitorPrice: 26.9,
    competitor: '喜旺',
    difference: 3.0,
    status: 'disadvantage'
  },
  {
    id: 3,
    location: '城阳即墨',
    ourProduct: '波尼亚烤肠五香(160g)',
    ourPrice: 7.9,
    competitorProduct: '喜旺烤肠 160g',
    competitorPrice: 7.9,
    competitor: '喜旺',
    difference: 0,
    status: 'equal'
  }
]

const pendingUploads = [
  {
    id: 1,
    filename: 'competitor_price_001.jpg',
    location: '青岛办事处',
    uploadTime: '2024-08-29 14:30',
    status: 'pending',
    ocrStatus: 'processing'
  },
  {
    id: 2,
    filename: 'competitor_price_002.jpg',
    location: '城阳即墨',
    uploadTime: '2024-08-29 15:15',
    status: 'completed',
    ocrStatus: 'completed'
  }
]

export default function CompetitorAnalysisPage() {
  const [loading, setLoading] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrResults, setOcrResults] = useState<any[]>([])
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [competitorData, setCompetitorData] = useState(priceComparisonData)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // 获取用户位置
  const [userLocation, setUserLocation] = useState<string>('')

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
        },
        (error) => {
          console.log('获取位置失败:', error)
          setUserLocation('位置获取失败')
        }
      )
    }
  }, [])

  // 处理图片上传和OCR识别
  const handleImageUpload = async (file: File) => {
    if (!file) return

    setProcessingStatus('uploading')
    setOcrLoading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('location', userLocation)
      formData.append('office', '青岛办事处')

      setProcessingStatus('processing')

      const response = await fetch('/api/competitive-analysis', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setOcrResults(result.data.extracted_products || [])
        setProcessingStatus('completed')
      } else {
        setProcessingStatus('error')
        alert('OCR识别失败: ' + result.error)
      }
    } catch (error) {
      setProcessingStatus('error')
      alert('图片处理失败: ' + error)
    } finally {
      setOcrLoading(false)
    }
  }

  // 文件选择处理
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  // 相机拍照处理
  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  // 编辑OCR结果
  const handleEditOcrResult = (index: number, field: string, value: string) => {
    const updatedResults = [...ocrResults]
    updatedResults[index] = {
      ...updatedResults[index],
      [field]: field === 'price' ? parseFloat(value) || 0 : value
    }
    setOcrResults(updatedResults)
  }

  // 保存OCR结果到竞品数据
  const handleSaveOcrResult = async (ocrResult: any, index: number) => {
    if (!ocrResult.product_name || !ocrResult.price) {
      alert('请填写完整的商品名称和价格信息')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/competitive-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_name: '波尼亚产品', // 这里应该让用户选择对应的波尼亚产品
          our_price: 0, // 这里应该从产品数据库获取
          competitor_name: ocrResult.product_name,
          competitor_price: ocrResult.price,
          location: userLocation,
          office: '青岛办事处',
          category: 'other'
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('竞品数据保存成功')
        // 从OCR结果中移除已保存的项
        const updatedResults = ocrResults.filter((_, i) => i !== index)
        setOcrResults(updatedResults)
        setEditingIndex(null)

        // 刷新竞品数据列表
        loadCompetitorData()
      } else {
        alert('保存失败: ' + result.error)
      }
    } catch (error) {
      alert('保存失败: ' + error)
    } finally {
      setLoading(false)
    }
  }

  // 加载竞品数据
  const loadCompetitorData = async () => {
    try {
      const response = await fetch('/api/competitive-analysis')
      const result = await response.json()
      if (result.success) {
        setCompetitorData(result.data)
      }
    } catch (error) {
      console.error('加载竞品数据失败:', error)
    }
  }

  // 删除OCR结果
  const handleDeleteOcrResult = (index: number) => {
    const updatedResults = ocrResults.filter((_, i) => i !== index)
    setOcrResults(updatedResults)
  }
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">竞品价格分析</h1>
            <p className="text-gray-600 mt-1">
              系统化、多维度地对主要竞品的价格进行收集与分析，快速应对市场变化
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => cameraInputRef.current?.click()}
              disabled={ocrLoading}
              className="w-full sm:w-auto"
            >
              {ocrLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Camera className="h-4 w-4 mr-2" />
              )}
              {ocrLoading ? '处理中...' : '拍照识别'}
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={ocrLoading}
              className="w-full sm:w-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              上传图片
            </Button>

            {/* 隐藏的文件输入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
          </div>
        </div>

        {/* 处理状态显示 */}
        {processingStatus !== 'idle' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {processingStatus === 'uploading' && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                {processingStatus === 'processing' && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                {processingStatus === 'completed' && <CheckCircle className="h-5 w-5 mr-2 text-green-500" />}
                {processingStatus === 'error' && <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />}

                {processingStatus === 'uploading' && '正在上传图片...'}
                {processingStatus === 'processing' && '正在识别价格信息...'}
                {processingStatus === 'completed' && '识别完成'}
                {processingStatus === 'error' && '处理失败'}
              </CardTitle>
            </CardHeader>
            {processingStatus === 'completed' && ocrResults.length > 0 && (
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  识别到 {ocrResults.length} 个商品信息，请核对并编辑：
                </p>
              </CardContent>
            )}
          </Card>
        )}

        {/* OCR结果编辑界面 */}
        {ocrResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>OCR识别结果</CardTitle>
              <CardDescription>请核对并编辑识别出的商品信息，然后保存到数据库</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ocrResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">商品 {index + 1}</h4>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {editingIndex === index ? '取消编辑' : '编辑'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveOcrResult(result, index)}
                          disabled={loading}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          保存
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteOcrResult(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {editingIndex === index ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`product_name_${index}`}>商品名称</Label>
                          <Input
                            id={`product_name_${index}`}
                            value={result.product_name || ''}
                            onChange={(e) => handleEditOcrResult(index, 'product_name', e.target.value)}
                            placeholder="请输入商品名称"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`specification_${index}`}>规格</Label>
                          <Input
                            id={`specification_${index}`}
                            value={result.specification || ''}
                            onChange={(e) => handleEditOcrResult(index, 'specification', e.target.value)}
                            placeholder="如：350g, 160g等"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`price_${index}`}>价格</Label>
                          <Input
                            id={`price_${index}`}
                            type="number"
                            step="0.01"
                            value={result.price || ''}
                            onChange={(e) => handleEditOcrResult(index, 'price', e.target.value)}
                            placeholder="请输入价格"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`location_${index}`}>地点</Label>
                          <Input
                            id={`location_${index}`}
                            value={result.location || userLocation}
                            onChange={(e) => handleEditOcrResult(index, 'location', e.target.value)}
                            placeholder="商品销售地点"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">商品名称：</span>
                          <span className="font-medium">{result.product_name || '未识别'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">规格：</span>
                          <span>{result.specification || '未识别'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">价格：</span>
                          <span className="font-medium text-green-600">
                            {result.price ? `¥${result.price}` : '未识别'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">置信度：</span>
                          <Badge variant={result.confidence > 0.7 ? 'default' : 'secondary'}>
                            {Math.round(result.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                    )}

                    {result.raw_text && result.raw_text.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-500 mb-1">原始识别文本：</p>
                        <p className="text-xs text-gray-600 bg-white p-2 rounded">
                          {result.raw_text.join(' | ')}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-orange-500 mb-2" />
              <CardTitle>价格对比分析</CardTitle>
              <CardDescription>
                查看价格差异分析，制定竞争策略
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* 待处理上传 */}
        <Card>
          <CardHeader>
            <CardTitle>待处理图片</CardTitle>
            <CardDescription>
              显示已上传但需要确认的竞品价格图片
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingUploads.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Camera className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium">{upload.filename}</div>
                      <div className="text-sm text-gray-500 flex items-center space-x-4">
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {upload.location}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {upload.uploadTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      upload.ocrStatus === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {upload.ocrStatus === 'completed' ? 'OCR完成' : 'OCR处理中'}
                    </span>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      查看
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 搜索和筛选 */}
        <Card>
          <CardHeader>
            <CardTitle>价格对比查询</CardTitle>
            <CardDescription>
              筛选和搜索竞品价格数据
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input placeholder="搜索商品名称..." className="pl-10" />
              </div>
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">选择地区</option>
                <option value="青岛办事处">青岛办事处</option>
                <option value="城阳即墨">城阳即墨</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">选择竞品</option>
                <option value="喜旺">喜旺</option>
                <option value="双汇">双汇</option>
                <option value="金锣">金锣</option>
              </select>
              <Button>
                <Filter className="h-4 w-4 mr-2" />
                筛选数据
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 价格对比表格 */}
        <Card>
          <CardHeader>
            <CardTitle>价格对比分析</CardTitle>
            <CardDescription>
              显示我方产品与竞品的价格对比情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">地点</th>
                    <th className="text-left py-3 px-4">本品名称</th>
                    <th className="text-left py-3 px-4">本品价格</th>
                    <th className="text-left py-3 px-4">竞品名称</th>
                    <th className="text-left py-3 px-4">竞品价格</th>
                    <th className="text-left py-3 px-4">价格差异</th>
                    <th className="text-left py-3 px-4">竞争状态</th>
                  </tr>
                </thead>
                <tbody>
                  {priceComparisonData.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{item.location}</td>
                      <td className="py-3 px-4 max-w-xs truncate">{item.ourProduct}</td>
                      <td className="py-3 px-4 font-medium">¥{item.ourPrice}</td>
                      <td className="py-3 px-4 max-w-xs truncate">{item.competitorProduct}</td>
                      <td className="py-3 px-4 font-medium">¥{item.competitorPrice}</td>
                      <td className={`py-3 px-4 font-medium ${
                        item.difference > 0 ? 'text-red-600' : 
                        item.difference < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {item.difference > 0 ? '+' : ''}{item.difference}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === 'advantage' ? 'bg-green-100 text-green-800' :
                          item.status === 'disadvantage' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status === 'advantage' ? '价格优势' :
                           item.status === 'disadvantage' ? '价格劣势' : '价格相等'}
                        </span>
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
