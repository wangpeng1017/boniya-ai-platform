import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "波尼亚AI平台",
  description: "基于人工智能技术的企业管理平台，提供销售预测、竞品分析、客服管理等功能",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
