'use client'

import { Bell, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      {/* Search */}
      <div className="flex flex-1 items-center space-x-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="搜索功能或数据..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-xs"></span>
        </Button>

        {/* User menu */}
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>

        {/* User info */}
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div className="text-sm font-medium">管理员</div>
            <div className="text-xs text-gray-500">admin@boniya.com</div>
          </div>
        </div>
      </div>
    </header>
  )
}
