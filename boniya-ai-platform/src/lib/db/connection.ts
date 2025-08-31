import { sql, createClient } from '@vercel/postgres'

// 创建数据库客户端 - 使用pooled连接
export function createDbClient() {
  try {
    // 优先使用pooled连接字符串
    const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL
    
    if (!connectionString) {
      throw new Error('Database connection string not found. Please set POSTGRES_URL or POSTGRES_PRISMA_URL environment variable.')
    }

    // 使用createClient创建连接，这是推荐的方式
    const client = createClient({
      connectionString: connectionString
    })

    return client
  } catch (error) {
    console.error('Failed to create database client:', error)
    throw error
  }
}

// 默认数据库连接 - 使用sql函数（适用于简单查询）
export const db = sql

// 数据库初始化函数
export async function initializeDatabase() {
  try {
    // 测试数据库连接
    await sql`SELECT 1 as test`
    console.log('Database connection established successfully')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// 通用查询函数 - 使用pooled连接
export async function executeQuery(query: string, params: any[] = []) {
  const client = createDbClient()
  try {
    const result = await client.query(query, params)
    return result
  } catch (error) {
    console.error('Query execution failed:', error)
    throw error
  } finally {
    await client.end()
  }
}

// 安全的SQL查询函数 - 优化版本，更好地处理连接字符串
export async function executeSafeQuery(queryTemplate: TemplateStringsArray, ...values: any[]) {
  try {
    // 检查可用的连接字符串
    const pooledUrl = process.env.POSTGRES_PRISMA_URL
    const directUrl = process.env.POSTGRES_URL
    const prismaUrl = process.env.PRISMA_DATABASE_URL

    console.log('Database connection check:', {
      hasPooledUrl: !!pooledUrl,
      hasDirectUrl: !!directUrl,
      hasPrismaUrl: !!prismaUrl
    })

    // 优先级：POSTGRES_PRISMA_URL > PRISMA_DATABASE_URL > POSTGRES_URL
    let connectionString = pooledUrl || prismaUrl || directUrl

    if (!connectionString) {
      throw new Error('No database connection string found. Please set POSTGRES_PRISMA_URL, PRISMA_DATABASE_URL, or POSTGRES_URL environment variable.')
    }

    // 检查连接字符串类型并选择合适的连接方式
    if (connectionString.includes('pgbouncer=true') || connectionString.includes('prisma+postgres://')) {
      // 使用池化连接
      console.log('Using pooled connection')
      const result = await sql(queryTemplate, ...values)
      return result
    } else {
      // 使用直连
      console.log('Using direct connection with createClient')
      const client = createClient({
        connectionString: connectionString
      })

      try {
        // 将模板字符串转换为普通查询
        let query = queryTemplate[0]
        for (let i = 0; i < values.length; i++) {
          query += '$' + (i + 1) + queryTemplate[i + 1]
        }

        const result = await client.query(query, values)
        return result
      } finally {
        await client.end()
      }
    }
  } catch (error) {
    console.error('Safe query execution failed:', error)
    console.error('Connection details:', {
      hasPooledUrl: !!process.env.POSTGRES_PRISMA_URL,
      hasDirectUrl: !!process.env.POSTGRES_URL,
      hasPrismaUrl: !!process.env.PRISMA_DATABASE_URL
    })
    throw error
  }
}

// 事务处理函数
export async function executeTransaction(queries: Array<() => Promise<any>>) {
  const client = createDbClient()
  try {
    await client.query('BEGIN')
    
    const results = []
    for (const query of queries) {
      const result = await query()
      results.push(result)
    }
    
    await client.query('COMMIT')
    return results
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Transaction failed:', error)
    throw error
  } finally {
    await client.end()
  }
}
