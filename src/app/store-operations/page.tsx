import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Store, Camera, Users, CheckCircle } from 'lucide-react'

export default function StoreOperationsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">门店运营标准化管理</h1>
            <p className="text-gray-600 mt-2">
              通过技术手段对门店员工着装、商品陈列等标准化执行情况进行自动监控
            </p>
          </div>
          <Button>
            <Store className="mr-2 h-4 w-4" />
            查看监控
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">监控门店</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">全国门店</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">监控摄像头</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,248</div>
              <p className="text-xs text-muted-foreground">在线监控</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">员工数量</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3,247</div>
              <p className="text-xs text-muted-foreground">在职员工</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">合规率</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92.8%</div>
              <p className="text-xs text-muted-foreground">+1.2% 较上周</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>功能开发中</CardTitle>
            <CardDescription>门店运营标准化管理功能正在开发中，敬请期待</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">功能开发中</h3>
              <p className="text-gray-500 mb-4">
                我们正在开发门店运营标准化管理系统，通过AI视觉技术实现自动化监控
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>✓ 员工着装规范检测</p>
                <p>✓ 商品陈列标准监控</p>
                <p>✓ 服务流程合规检查</p>
                <p>✓ 实时预警和报告</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
