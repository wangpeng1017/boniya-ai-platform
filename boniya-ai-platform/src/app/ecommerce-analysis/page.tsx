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
  const [feedbackInsights, setFeedbackInsights] = useState<any>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [feedbackInput, setFeedbackInput] = useState('')
  const [feedbackAnalysisLoading, setFeedbackAnalysisLoading] = useState(false)
  const [formData, setFormData] = useState({
    platform: 'jd',
    product_name: '',
    product_url: ''
  })

  // AI反馈分析函数
  const handleFeedbackAnalysis = async () => {
    if (!feedbackInput.trim()) {
      alert('请输入用户反馈内容')
      return
    }

    setFeedbackAnalysisLoading(true)
    try {
      const response = await fetch('/api/feedback/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackText: feedbackInput,
          platform: formData.platform,
          orderId: null
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('反馈分析完成！')
        setFeedbackInput('')
        // 可以在这里更新UI显示分析结果
      } else {
        alert('反馈分析失败: ' + result.error)
      }
    } catch (error) {
      console.error('Feedback analysis error:', error)
      alert('反馈分析失败，请稍后重试')
    } finally {
      setFeedbackAnalysisLoading(false)
    }
  }

  // 生成反馈洞察报告函数
  const handleGenerateInsights = async () => {
    setInsightsLoading(true)
    try {
      const response = await fetch('/api/feedback/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: formData.platform,
          startDate: null,
          endDate: null,
          sentimentFilter: 'all',
          urgencyFilter: 'all'
        })
      })

      const result = await response.json()
      if (result.success) {
        setFeedbackInsights(result.data.insights)
      } else {
        alert('洞察生成失败: ' + result.error)
      }
    } catch (error) {
      console.error('Insights generation error:', error)
      alert('洞察生成失败，请稍后重试')
    } finally {
      setInsightsLoading(false)
    }
  }

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

        {/* AI反馈分析 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 单条反馈分析 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span>Gemini AI 反馈分析</span>
              </CardTitle>
              <CardDescription>智能分析用户反馈的情感、问题和紧急程度</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="feedback-input">用户反馈内容</Label>
                  <textarea
                    id="feedback-input"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 min-h-[100px]"
                    placeholder="例如：第二次买了，但是这次的包装是坏的，里面的火腿肠都黏糊糊的了，不敢吃，联系客服半天了也没人回！"
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleFeedbackAnalysis}
                  disabled={feedbackAnalysisLoading || !feedbackInput.trim()}
                  className="w-full"
                >
                  {feedbackAnalysisLoading ? (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4 animate-spin" />
                      AI分析中...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      开始AI反馈分析
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 反馈洞察报告 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>反馈洞察报告</span>
              </CardTitle>
              <CardDescription>基于历史反馈数据生成智能洞察</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={handleGenerateInsights}
                  disabled={insightsLoading}
                  className="w-full"
                >
                  {insightsLoading ? (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4 animate-spin" />
                      生成洞察中...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      生成AI洞察报告
                    </>
                  )}
                </Button>

                {/* 洞察结果展示 */}
                {feedbackInsights && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-green-900">AI洞察报告</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        feedbackInsights.confidence_level === 'high' ? 'bg-green-100 text-green-800' :
                        feedbackInsights.confidence_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {feedbackInsights.confidence_level === 'high' ? '高置信度' :
                         feedbackInsights.confidence_level === 'medium' ? '中等置信度' : '低置信度'}
                      </span>
                    </div>

                    {/* 数据概览 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/70 rounded p-3">
                        <h5 className="font-medium text-green-800 mb-2">📊 反馈总数</h5>
                        <p className="text-2xl font-bold text-green-900">{feedbackInsights.total_feedback_count}</p>
                      </div>
                      <div className="bg-white/70 rounded p-3">
                        <h5 className="font-medium text-green-800 mb-2">😊 情感分布</h5>
                        <div className="text-sm text-green-700">
                          <div>正面: {feedbackInsights.sentiment_distribution.positive}</div>
                          <div>中性: {feedbackInsights.sentiment_distribution.neutral}</div>
                          <div>负面: {feedbackInsights.sentiment_distribution.negative}</div>
                        </div>
                      </div>
                    </div>

                    {/* 主要问题 */}
                    <div className="bg-white/70 rounded p-3">
                      <h5 className="font-medium text-green-800 mb-2">🔍 主要问题</h5>
                      <div className="space-y-1">
                        {feedbackInsights.top_issues.slice(0, 5).map((issue: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm text-green-700">
                            <span>{issue.issue}</span>
                            <span>{issue.count}次 ({issue.percentage}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 关键洞察 */}
                    <div className="bg-white/70 rounded p-3">
                      <h5 className="font-medium text-green-800 mb-2">💡 关键洞察</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        {feedbackInsights.key_insights.map((insight: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 改进建议 */}
                    <div className="bg-white/70 rounded p-3">
                      <h5 className="font-medium text-green-800 mb-2">🚀 改进建议</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        {feedbackInsights.improvement_suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

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
