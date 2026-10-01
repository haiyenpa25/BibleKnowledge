import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import OfflineBanner from "@/components/OfflineBanner";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "BibleKnowledge — Nền tảng Nghiên cứu & Khám phá Kinh Thánh AI",
  description: "Hệ thống nghiên cứu Kinh Thánh thông minh với 4 tầng: Học tập, Khám phá, Kết nối đồ thị tri thức, và Trí tuệ nhân tạo RAG.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.svg",
    apple: "/icon-192.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BibleKnowledge",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className="antialiased selection:bg-blue-600 selection:text-white flex flex-col min-h-screen">
        <OfflineBanner />
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}

