import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel部署优化配置
  experimental: {
    // 启用服务器组件
    serverComponentsExternalPackages: ['@vercel/postgres']
  },

  // API路由配置
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
