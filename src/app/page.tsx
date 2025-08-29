export default function Home() {
  return (
    <html>
      <head>
        <title>波尼亚AI平台</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h1 style={{ color: '#333', fontSize: '2.5rem', marginBottom: '20px', textAlign: 'center' }}>
            🎉 波尼亚AI平台
          </h1>
          <p style={{ color: '#666', fontSize: '1.2rem', textAlign: 'center', marginBottom: '30px' }}>
            企业级AI数据分析平台 - 部署成功！
          </p>

          <div style={{ backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h2 style={{ color: '#2d5a2d', marginBottom: '10px' }}>✅ 系统状态</h2>
            <p style={{ color: '#2d5a2d', margin: '5px 0' }}>🚀 部署状态: 成功</p>
            <p style={{ color: '#2d5a2d', margin: '5px 0' }}>📦 版本: v1.0.0</p>
            <p style={{ color: '#2d5a2d', margin: '5px 0' }}>🌐 域名: boniya.aifly.me</p>
            <p style={{ color: '#2d5a2d', margin: '5px 0' }}>⏰ 时间: {new Date().toLocaleString('zh-CN')}</p>
          </div>

          <div style={{ backgroundColor: '#e8f0ff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h2 style={{ color: '#1a365d', marginBottom: '15px' }}>🚀 核心功能模块</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>📊 销售预测</div>
              <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>📈 竞品分析</div>
              <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>🛒 电商分析</div>
              <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>💬 智能客服</div>
              <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>🏪 门店运营</div>
              <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>🛡️ 品质控制</div>
              <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>⚖️ 商品识别</div>
              <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>🕷️ 京东爬虫</div>
              <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>🤖 Gemini AI</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h2 style={{ color: '#856404', marginBottom: '10px' }}>🔗 系统API测试</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
              <a href="/api/health" style={{ color: '#007bff', textDecoration: 'none', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', display: 'block' }}>
                🔍 健康检查
              </a>
              <a href="/api/test" style={{ color: '#007bff', textDecoration: 'none', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', display: 'block' }}>
                🧪 环境测试
              </a>
              <a href="/api/env-check" style={{ color: '#007bff', textDecoration: 'none', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', display: 'block' }}>
                ⚙️ 环境变量检查
              </a>
              <a href="/api/ai/gemini/test" style={{ color: '#007bff', textDecoration: 'none', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', display: 'block' }}>
                🤖 AI功能测试
              </a>
            </div>
          </div>

          <div style={{ backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h2 style={{ color: '#2d5a2d', marginBottom: '10px' }}>🗄️ 数据库API测试</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
              <a href="/api/db/init" style={{ color: '#007bff', textDecoration: 'none', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', display: 'block' }}>
                🏗️ 数据库状态检查
              </a>
              <a href="/api/crawlers/jd-comments" style={{ color: '#007bff', textDecoration: 'none', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', display: 'block' }}>
                🕷️ 爬虫任务列表
              </a>
              <a href="/api/comments?product_id=10032280299715" style={{ color: '#007bff', textDecoration: 'none', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', display: 'block' }}>
                💬 评论数据查询
              </a>
            </div>
          </div>

          <div style={{ backgroundColor: '#e8f0ff', padding: '20px', borderRadius: '8px' }}>
            <h2 style={{ color: '#1a365d', marginBottom: '10px' }}>🚀 快速操作说明</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px' }}>
                <strong>🏗️ 初始化数据库</strong>
                <p style={{ fontSize: '0.9rem', margin: '5px 0 0 0' }}>POST /api/db/init</p>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px' }}>
                <strong>🕷️ 启动爬虫任务</strong>
                <p style={{ fontSize: '0.9rem', margin: '5px 0 0 0' }}>POST /api/crawlers/jd-comments</p>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px' }}>
                <strong>📊 情感分析</strong>
                <p style={{ fontSize: '0.9rem', margin: '5px 0 0 0' }}>POST /api/comments</p>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '30px', color: '#888' }}>
            <p>🎊 恭喜！波尼亚AI平台已成功部署并运行</p>
            <p style={{ fontSize: '0.9rem' }}>如果您看到这个页面，说明部署完全成功！</p>
          </div>
        </div>
      </body>
    </html>
  )
}
