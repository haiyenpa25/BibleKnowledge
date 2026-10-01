import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "BibleKnowledge — Nền tảng Nghiên cứu & Khám phá Kinh Thánh AI",
  description: "Hệ thống nghiên cứu Kinh Thánh thông minh với 4 tầng: Học tập, Khám phá, Kết nối đồ thị tri thức, và Trí tuệ nhân tạo RAG.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className="antialiased selection:bg-blue-600 selection:text-white flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
