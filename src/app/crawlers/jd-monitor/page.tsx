'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Play,
  Pause,
  RefreshCw,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react'

interface CrawlTask {
  id: number
  product_id: string
  product_url: string
  task_status: string
  start_time: string
  end_time?: string
  total_comments: number
  processed_comments: number
  error_message?: string
  created_at: string
}

export default function JDMonitorPage() {
  const [tasks, setTasks] = useState<CrawlTask[]>([])
  const [loading, setLoading] = useState(false)
  const [productId, setProductId] = useState('10032280299715')

  useEffect(() => {
    fetchTasks()
    // 每30秒刷新一次任务状态
    const interval = setInterval(fetchTasks, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/crawlers/jd-comments')
      const result = await response.json()
      if (result.success) {
        setTasks(result.data)
      }
    } catch (error) {
      console.error('获取任务列表失败:', error)
    }
  }

  const startCrawl = async () => {
    if (!productId.trim()) {
      alert('请输入商品ID')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/crawlers/jd-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          max_pages: 10,
          days_limit: 30
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('爬取任务已启动')
        fetchTasks()
      } else {
        alert(`启动失败: ${result.error}`)
      }
    } catch (error) {
      alert('启动爬取任务失败')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '等待中'
      case 'running': return '运行中'
      case 'completed': return '已完成'
      case 'failed': return '失败'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '-'
    return new Date(timeStr).toLocaleString('zh-CN')
  }

  const calculateDuration = (startTime: string, endTime?: string) => {
    if (!startTime) return '-'
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const duration = Math.round((end.getTime() - start.getTime()) / 1000)
    
    if (duration < 60) return `${duration}秒`
    if (duration < 3600) return `${Math.round(duration / 60)}分钟`
    return `${Math.round(duration / 3600)}小时`
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">京东评论爬虫监控</h1>
          <p className="text-gray-600 mt-1">
            监控和管理京东商品评论数据爬取任务
          </p>
        </div>

        {/* 控制面板 */}
        <Card>
          <CardHeader>
            <CardTitle>爬取控制</CardTitle>
            <CardDescription>启动新的评论爬取任务</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="输入京东商品ID (如: 10032280299715)"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                />
              </div>
              <Button 
                onClick={startCrawl} 
                disabled={loading}
                className="flex items-center space-x-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>{loading ? '启动中...' : '开始爬取'}</span>
              </Button>
              <Button variant="outline" onClick={fetchTasks}>
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 任务统计 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                总任务数
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                运行中
              </CardTitle>
              <RefreshCw className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {tasks.filter(t => t.task_status === 'running').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                已完成
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.task_status === 'completed').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                总评论数
              </CardTitle>
              <Eye className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {tasks.reduce((sum, task) => sum + (task.total_comments || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 任务列表 */}
        <Card>
          <CardHeader>
            <CardTitle>爬取任务列表</CardTitle>
            <CardDescription>显示所有爬取任务的状态和进度</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">任务ID</th>
                    <th className="text-left py-3 px-4">商品ID</th>
                    <th className="text-left py-3 px-4">状态</th>
                    <th className="text-left py-3 px-4">评论数</th>
                    <th className="text-left py-3 px-4">开始时间</th>
                    <th className="text-left py-3 px-4">耗时</th>
                    <th className="text-left py-3 px-4">错误信息</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono">{task.id}</td>
                      <td className="py-3 px-4 font-mono">{task.product_id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(task.task_status)}
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.task_status)}`}>
                            {getStatusText(task.task_status)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {task.task_status === 'running' ? (
                          <span>{task.processed_comments}/{task.total_comments || '?'}</span>
                        ) : (
                          <span>{task.total_comments || 0}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {formatTime(task.start_time)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {calculateDuration(task.start_time, task.end_time)}
                      </td>
                      <td className="py-3 px-4 text-sm text-red-600">
                        {task.error_message && (
                          <div className="max-w-xs truncate" title={task.error_message}>
                            {task.error_message}
                          </div>
                        )}
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
