'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, TrendingUp, MessageSquare, Star, Plus, Search } from 'lucide-react'
import { useState } from 'react'

export default function EcommerceAnalysisPage() {
  const [loading, setLoading] = useState(false)
  const [analysisData, setAnalysisData] = useState<any[]>([])
  const [formData, setFormData] = useState({
    platform: 'jd',
    product_name: '',
    product_url: ''
  })

  const handleAnalysis = async () => {
    if (!formData.product_name) {
      alert('请输入商品名称')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ecommerce-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          analysis_type: 'comprehensive'
        })
      })

      const result = await response.json()
      if (result.success) {
        setAnalysisData([result.data.analysis_result])
        alert('分析完成')
      } else {
        alert('分析失败: ' + result.error)
      }
    } catch (error) {
      alert('分析失败: ' + error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">电商平台数据分析</h1>
            <p className="text-gray-600 mt-2">
              整合多电商平台的售后反馈，进行系统化分析，发现共性问题
            </p>
          </div>
          <Button onClick={handleAnalysis} disabled={loading}>
            <Search className="mr-2 h-4 w-4" />
            {loading ? '分析中...' : '开始分析'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">监控平台</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">京东、天猫、拼多多等</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">分析商品</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">+12% 较上月</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">收集评论</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156.8万</div>
              <p className="text-xs text-muted-foreground">本月累计</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均评分</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2</div>
              <p className="text-xs text-muted-foreground">+0.1 较上月</p>
            </CardContent>
          </Card>
        </div>

        {/* 分析表单 */}
        <Card>
          <CardHeader>
            <CardTitle>电商数据分析</CardTitle>
            <CardDescription>输入商品信息进行电商平台数据分析</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform">电商平台</Label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formData.platform}
                  onChange={(e) => setFormData({...formData, platform: e.target.value})}
                >
                  <option value="jd">京东</option>
                  <option value="tmall">天猫</option>
                  <option value="pdd">拼多多</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_name">商品名称</Label>
                <Input
                  id="product_name"
                  placeholder="请输入商品名称"
                  value={formData.product_name}
                  onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_url">商品链接（可选）</Label>
                <Input
                  id="product_url"
                  placeholder="请输入商品链接"
                  value={formData.product_url}
                  onChange={(e) => setFormData({...formData, product_url: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 分析结果 */}
        {analysisData.length > 0 && (
          <div className="space-y-6">
            {analysisData.map((item, index) => (
              <div key={index} className="space-y-6">
                {/* 分析概览 */}
                <Card>
                  <CardHeader>
                    <CardTitle>分析概览</CardTitle>
                    <CardDescription>{item.platform} - {item.product_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600">数据来源</p>
                        <p className="text-lg font-bold text-blue-900">
                          {item.platform === 'jd' ? '京东' :
                           item.platform === 'tmall' ? '天猫' : '拼多多'}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600">分析状态</p>
                        <p className="text-lg font-bold text-green-900">
                          {item.status === 'success' ? '成功' : '失败'}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600">数据量</p>
                        <p className="text-lg font-bold text-purple-900">
                          {item.data_count || 0} 条
                        </p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-orange-600">分析时间</p>
                        <p className="text-lg font-bold text-orange-900">
                          {new Date(item.generated_at || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 情感分析结果 */}
                {item.result?.sentiment_analysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle>情感分析</CardTitle>
                      <CardDescription>用户评论情感倾向分析</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {item.result.sentiment_analysis.sentiment_percentage?.positive || 0}%
                            </div>
                            <div className="text-sm text-gray-600">正面评价</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">
                              {item.result.sentiment_analysis.sentiment_percentage?.neutral || 0}%
                            </div>
                            <div className="text-sm text-gray-600">中性评价</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {item.result.sentiment_analysis.sentiment_percentage?.negative || 0}%
                            </div>
                            <div className="text-sm text-gray-600">负面评价</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-green-700 mb-2">正面评价要点</h4>
                            <ul className="space-y-1">
                              {(item.result.sentiment_analysis.key_positive_points || []).map((point: string, i: number) => (
                                <li key={i} className="text-sm text-gray-600">• {point}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-red-700 mb-2">负面评价要点</h4>
                            <ul className="space-y-1">
                              {(item.result.sentiment_analysis.key_negative_points || []).map((point: string, i: number) => (
                                <li key={i} className="text-sm text-gray-600">• {point}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 关键词分析结果 */}
                {item.result?.keyword_analysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle>关键词分析</CardTitle>
                      <CardDescription>用户评论关键词提取</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">热门关键词</h4>
                          <div className="flex flex-wrap gap-2">
                            {(item.result.keyword_analysis.top_keywords || []).map((keyword: any, i: number) => (
                              <Badge key={i} variant="outline">
                                {keyword.word} ({keyword.count})
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">主要话题</h4>
                          <div className="space-y-2">
                            {(item.result.keyword_analysis.topics || []).map((topic: any, i: number) => (
                              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm">{topic.name}</span>
                                <Badge variant="secondary">{topic.frequency}%</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 问题分析结果 */}
                {item.result?.issue_analysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle>问题分析</CardTitle>
                      <CardDescription>用户反馈问题分类统计</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(item.result.issue_analysis.issue_categories || []).map((category: any, i: number) => (
                          <div key={i} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{category.category}</h4>
                              <Badge variant={category.severity === 'high' ? 'destructive' :
                                            category.severity === 'medium' ? 'secondary' : 'default'}>
                                {category.severity === 'high' ? '高' :
                                 category.severity === 'medium' ? '中' : '低'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                            <div className="text-xs text-gray-500">
                              出现频率: {category.frequency}% | 影响用户: {category.affected_users} 人
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
