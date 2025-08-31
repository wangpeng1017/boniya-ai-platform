'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // 直接跳转到销售预测页面
    router.replace('/sales-forecast')
  }, [router])

  // 显示加载状态，避免闪烁
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">正在跳转到波尼亚AI平台...</p>
      </div>
    </div>
  )
}

