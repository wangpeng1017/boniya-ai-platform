'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Eye, Play, RefreshCw, Download, AlertCircle } from 'lucide-react'

interface Task {
  id: number
  product_id: string
  product_url: string
  task_status: string
  start_time?: string
  end_time?: string
  total_comments: number
  processed_comments: number
  error_message?: string
  created_at: string
}

export default function JDMonitorPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)

  // 获取爬虫任务列表
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/crawlers/jd-comments')
      const data = await response.json()
      if (data.success) {
        setTasks(data.data || [])
      }
    } catch (error) {
      console.error('获取任务列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 启动新的爬虫任务
  const startCrawlTask = async () => {
    try {
      const response = await fetch('/api/crawlers/jd-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: '10032280299715',
          product_url: 'https://item.jd.com/10032280299715.html'
        })
      })
      const data = await response.json()
      if (data.success) {
        alert('爬虫任务启动成功！')
        fetchTasks()
      } else {
        alert('启动失败: ' + data.error)
      }
    } catch (error) {
      alert('启动失败: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">京东爬虫监控</h1>
            <p className="text-gray-600 mt-2">
              监控京东商品评论数据爬取任务状态，提供实时的数据采集和分析功能
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchTasks} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              刷新状态
            </Button>
            <Button onClick={startCrawlTask}>
              <Play className="mr-2 h-4 w-4" />
              启动新任务
            </Button>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总任务数</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
              <p className="text-xs text-muted-foreground">累计爬取任务</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">运行中任务</CardTitle>
              <Play className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(task => task.task_status === 'running').length}
              </div>
              <p className="text-xs text-muted-foreground">正在执行</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已完成任务</CardTitle>
              <Download className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {tasks.filter(task => task.task_status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">成功完成</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">失败任务</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {tasks.filter(task => task.task_status === 'failed').length}
              </div>
              <p className="text-xs text-muted-foreground">执行失败</p>
            </CardContent>
          </Card>
        </div>

        {/* New Task Form */}
        <Card>
          <CardHeader>
            <CardTitle>创建新的爬取任务</CardTitle>
            <CardDescription>配置京东商品评论爬取参数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productId">商品ID</Label>
                <Input 
                  id="productId"
                  placeholder="例如: 10032280299715"
                  defaultValue="10032280299715"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productUrl">商品URL</Label>
                <Input 
                  id="productUrl"
                  placeholder="京东商品页面链接"
                  defaultValue="https://item.jd.com/10032280299715.html"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={startCrawlTask} className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  启动爬取任务
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task List */}
        <Card>
          <CardHeader>
            <CardTitle>任务列表</CardTitle>
            <CardDescription>查看所有爬取任务的状态和进度</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">加载中...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暂无爬取任务</p>
                <p className="text-sm text-gray-400">点击&quot;启动新任务&quot;开始第一个爬取任务</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant={
                          task.task_status === 'running' ? 'default' :
                          task.task_status === 'completed' ? 'secondary' :
                          task.task_status === 'failed' ? 'destructive' : 'outline'
                        }>
                          {task.task_status === 'running' ? '运行中' :
                           task.task_status === 'completed' ? '已完成' :
                           task.task_status === 'failed' ? '失败' : '等待中'}
                        </Badge>
                        <span className="font-medium">商品ID: {task.product_id}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        任务ID: {task.id}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">开始时间</p>
                        <p className="font-medium">
                          {task.start_time ? new Date(task.start_time).toLocaleString('zh-CN') : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">结束时间</p>
                        <p className="font-medium">
                          {task.end_time ? new Date(task.end_time).toLocaleString('zh-CN') : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">评论数量</p>
                        <p className="font-medium">
                          {task.processed_comments || 0} / {task.total_comments || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">进度</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: task.total_comments > 0 
                                  ? `${(task.processed_comments / task.total_comments) * 100}%` 
                                  : '0%' 
                              }}
                            ></div>
                          </div>
                          <span className="text-xs">
                            {task.total_comments > 0 
                              ? Math.round((task.processed_comments / task.total_comments) * 100)
                              : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {task.error_message && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                        错误信息: {task.error_message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
