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
    title: '数字化研发设计看板',
    href: '/',
    icon: BarChart3,
    isActive: true
  },
  {
    title: '数字化研发业务平台',
    href: '/business-platform',
    icon: TrendingUp,
    children: [
      { title: '数字化研发设计看板', href: '/design-dashboard' },
      { title: '设计智能数字化', href: '/design-intelligence' },
      { title: '叶组配方数字化设计', href: '/formula-design' },
      { title: '市场营销数字化设计', href: '/marketing-design' },
      { title: '三纸一特数字化设计', href: '/paper-design' },
      { title: '加工工艺数字化设计', href: '/process-design' },
      { title: '包装材料数字化设计', href: '/packaging-design' },
      { title: '企业与输出数字化', href: '/enterprise-output' }
    ]
  },
  {
    title: '数字化研发设计平台',
    href: '/design-platform',
    icon: ShoppingCart,
    children: []
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">数字化研发平台</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigationItems.map((item, index) => {
          const Icon = item.icon
          const isActive = item.isActive || pathname === item.href

          return (
            <div key={index}>
              <Link
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon
                  className={cn(
                    'mr-3 h-4 w-4 flex-shrink-0',
                    isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                <span className="truncate">{item.title}</span>
                {item.children && item.children.length > 0 && (
                  <svg
                    className={cn(
                      'ml-auto h-4 w-4 transition-transform',
                      isActive ? 'rotate-90' : ''
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Link>

              {/* Submenu */}
              {item.children && item.children.length > 0 && isActive && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.map((child, childIndex) => (
                    <Link
                      key={childIndex}
                      href={child.href}
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
