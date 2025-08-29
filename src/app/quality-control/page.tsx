import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Eye, AlertTriangle, CheckCircle } from 'lucide-react'

export default function QualityControlPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">产品品质智能控制</h1>
            <p className="text-gray-600 mt-2">
              利用AI技术提升来货检验、发货检验和生产过程中异物检验的效率与准确性
            </p>
          </div>
          <Button>
            <Shield className="mr-2 h-4 w-4" />
            查看检验报告
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">检验设备</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-muted-foreground">AI视觉检测设备</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">检验准确率</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.2%</div>
              <p className="text-xs text-muted-foreground">+0.3% 较上月</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">异常检出</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">本月累计</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">处理效率</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.2秒</div>
              <p className="text-xs text-muted-foreground">平均检验时间</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>功能开发中</CardTitle>
            <CardDescription>产品品质智能控制功能正在开发中，敬请期待</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">功能开发中</h3>
              <p className="text-gray-500 mb-4">
                我们正在开发AI驱动的产品品质智能控制系统，提升检验效率和准确性
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>✓ AI视觉异物检测</p>
                <p>✓ 来货质量自动检验</p>
                <p>✓ 发货前品质确认</p>
                <p>✓ 实时质量监控报告</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
