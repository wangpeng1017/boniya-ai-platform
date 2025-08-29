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
    title: '叶组配方管理',
    href: '/',
    icon: Home,
    description: '配方创建、编辑、版本控制'
  },
  {
    title: '门店销售数量预测',
    href: '/sales-forecast',
    icon: BarChart3,
    description: '基于AI的销售预测分析'
  },
  {
    title: '竞品价格分析',
    href: '/competitive-analysis',
    icon: TrendingUp,
    description: '竞品价格监控与对比分析'
  },
  {
    title: '电商平台数据分析',
    href: '/ecommerce-analysis',
    icon: ShoppingCart,
    description: '多平台数据分析与洞察'
  },
  {
    title: '智能客服管理',
    href: '/customer-service',
    icon: MessageSquare,
    description: '工单管理与智能客服'
  },
  {
    title: '门店运营标准化管理',
    href: '/store-operations',
    icon: Store,
    description: '门店监控与合规管理'
  },
  {
    title: '产品品质智能控制',
    href: '/quality-control',
    icon: Shield,
    description: 'AI视觉检测与质量控制'
  },
  {
    title: '称重商品自动识别',
    href: '/product-recognition',
    icon: Scale,
    description: 'AI商品识别与MOP集成'
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
          const isActive = pathname === item.href

          return (
            <Link
              key={index}
              href={item.href}
              className={cn(
                'group flex flex-col px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200'
              )}
            >
              <div className="flex items-center">
                <Icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  )}
                />
                <span className="truncate font-medium">{item.title}</span>
              </div>
              {item.description && (
                <p className={cn(
                  'mt-1 text-xs leading-relaxed ml-8',
                  isActive ? 'text-blue-600' : 'text-gray-500'
                )}>
                  {item.description}
                </p>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
