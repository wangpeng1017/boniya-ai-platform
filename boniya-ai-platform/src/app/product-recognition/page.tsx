import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Scale, Camera, Zap, TrendingUp } from 'lucide-react'

export default function ProductRecognitionPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">称重商品自动识别</h1>
            <p className="text-gray-600 mt-2">
              在顾客称重散装商品时，通过摄像头自动识别商品品类，提升收银效率
            </p>
          </div>
          <Button>
            <Scale className="mr-2 h-4 w-4" />
            查看识别记录
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">识别设备</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">智能称重设备</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">识别准确率</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">96.8%</div>
              <p className="text-xs text-muted-foreground">+1.2% 较上月</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">日均识别</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,847</div>
              <p className="text-xs text-muted-foreground">次商品识别</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">效率提升</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45%</div>
              <p className="text-xs text-muted-foreground">收银速度提升</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>功能开发中</CardTitle>
            <CardDescription>称重商品自动识别功能正在开发中，敬请期待</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Scale className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">功能开发中</h3>
              <p className="text-gray-500 mb-4">
                我们正在开发AI驱动的称重商品自动识别系统，大幅提升收银效率
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>✓ 实时商品图像识别</p>
                <p>✓ 自动价格匹配</p>
                <p>✓ 多品类智能区分</p>
                <p>✓ 收银流程优化</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
