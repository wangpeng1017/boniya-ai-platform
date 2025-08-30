import { NextResponse } from "next/server"
import { initializeTables, checkDatabaseStatus } from "@/lib/db/init-tables"

// 数据库初始化API
export async function POST() {
  try {
    console.log("开始初始化数据库表结构...")

    const result = await initializeTables()

    return NextResponse.json({
      success: true,
      message: "数据库初始化成功",
      details: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("数据库初始化失败:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "数据库初始化失败",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// 获取数据库状态
export async function GET() {
  try {
    const status = await checkDatabaseStatus()
    return NextResponse.json(status)

  } catch (error) {
    console.error("获取数据库状态失败:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "获取数据库状态失败",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
