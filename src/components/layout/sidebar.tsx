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
} from 'lucide-react'

const navigationItems = [
  {
    title: '门店销售数量预测',
    href: '/sales-forecast',
    icon: BarChart3,
    description: '基于历史数据预测销售量，优化库存管理'
  },
  {
    title: '竞品价格分析',
    href: '/competitor-analysis',
    icon: TrendingUp,
    description: '多维度竞品价格收集与分析'
  },
  {
    title: '电商平台数据分析',
    href: '/ecommerce-analysis',
    icon: ShoppingCart,
    description: '整合多平台售后反馈，发现共性问题'
  },
  {
    title: '智能客服管理',
    href: '/customer-service',
    icon: MessageSquare,
    description: '统一管理客户投诉与反馈，智能分析'
  },
  {
    title: '门店运营标准化管理',
    href: '/store-operations',
    icon: Store,
    description: '智能监控门店标准化执行情况'
  },
  {
    title: '产品品质智能控制',
    href: '/quality-control',
    icon: Shield,
    description: 'AI视觉检测提升品质控制效率'
  },
  {
    title: '称重商品自动识别',
    href: '/product-recognition',
    icon: Scale,
    description: '自动识别称重商品，提升收银效率'
  },
  {
    title: '京东爬虫监控',
    href: '/crawlers/jd-monitor',
    icon: Eye,
    description: '监控京东评论数据爬取任务状态'
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">波尼亚AI平台</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <Icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                )}
              />
              <div className="flex-1">
                <div className="truncate">{item.title}</div>
                <div className="text-xs text-gray-400 group-hover:text-gray-300">
                  {item.description}
                </div>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-700 p-4">
        <div className="text-xs text-gray-400">
          © 2024 波尼亚AI平台
        </div>
      </div>
    </div>
  )
}
