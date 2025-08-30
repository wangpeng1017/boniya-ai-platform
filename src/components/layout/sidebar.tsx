'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  MessageSquare,
  Store,
  Shield,
  Scale,
  Eye,
  Home,
  Users,
  Settings,
  Zap
} from 'lucide-react'

const navigationItems = [
  {
    title: '门店销售数量预测',
    href: '/sales-forecast',
    icon: BarChart3
  },
  {
    title: '竞品价格分析',
    href: '/competitive-analysis',
    icon: TrendingUp
  },
  {
    title: '电商平台数据分析',
    href: '/ecommerce-analysis',
    icon: ShoppingCart
  },
  {
    title: '智能客服管理',
    href: '/customer-service',
    icon: MessageSquare
  },
  {
    title: '门店运营标准化管理',
    href: '/store-operations',
    icon: Store
  },
  {
    title: '产品品质智能控制',
    href: '/quality-control',
    icon: Shield
  },
  {
    title: '称重商品自动识别',
    href: '/product-recognition',
    icon: Scale
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">波尼亚AI平台</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item, index) => {
          const Icon = item.icon
          // 如果在主页，高亮第一个业务模块
          const isActive = pathname === item.href || (pathname === '/' && index === 0)

          return (
            <Link
              key={index}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200'
              )}
            >
              <Icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                )}
              />
              <span className="truncate font-medium">{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
