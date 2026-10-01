"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi, Download, CheckCircle2, X } from "lucide-react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [dismissedInstall, setDismissedInstall] = useState(false);

  useEffect(() => {
    // Check initial online status
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => {
        setIsOffline(false);
        setShowReconnected(true);
        setTimeout(() => setShowReconnected(false), 3500);
      };

      const handleOffline = () => {
        setIsOffline(true);
        setShowReconnected(false);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Register Service Worker
      if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("[PWA] Service Worker registered with scope:", reg.scope))
          .catch((err) => console.warn("[PWA] Service Worker registration failed:", err));
      } else if ("serviceWorker" in navigator) {
        // Also register in dev if enabled
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("[PWA Dev] SW registered:", reg.scope))
          .catch(() => {});
      }

      // Capture beforeinstallprompt for PWA installation
      const handleInstallPrompt = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e);
      };
      window.addEventListener("beforeinstallprompt", handleInstallPrompt);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  return (
    <>
      {/* Offline Alert Bar */}
      {isOffline && (
        <div className="bg-amber-950/90 border-b border-amber-500/40 text-amber-200 px-4 py-2 text-xs flex items-center justify-between sticky top-0 z-50 backdrop-blur-md animate-in slide-in-from-top">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Chế độ Ngoại tuyến (Offline Mode):</strong> Thiết bị đang ngắt kết nối mạng. Bạn vẫn có thể đọc các phân đoạn Kinh Thánh và dữ liệu đã lưu trong bộ nhớ đệm PWA.
            </span>
          </div>
        </div>
      )}

      {/* Reconnected Toast */}
      {showReconnected && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-200 px-4 py-2 text-xs flex items-center justify-center sticky top-0 z-50 backdrop-blur-md animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Đã kết nối lại Internet. Toàn bộ tính năng AI và cơ sở dữ liệu đã sẵn sàng.</span>
          </div>
        </div>
      )}

      {/* PWA Install Banner */}
      {installPrompt && !dismissedInstall && (
        <aside 
          aria-label="Cài đặt ứng dụng PWA"
          className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl glass-panel border border-blue-500/40 bg-slate-900/95 p-4 shadow-2xl shadow-blue-950/80 flex flex-col gap-2.5 animate-in slide-in-from-bottom"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">Cài Đặt Ứng Dụng BibleKnowledge</h2>
                <p className="text-[11px] text-slate-400">Đọc Kinh Thánh mượt mà & tra cứu ngoại tuyến trên máy tính/điện thoại</p>
              </div>
            </div>
            <button
              onClick={() => setDismissedInstall(true)}
              aria-label="Đóng thông báo cài đặt ứng dụng"
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleInstallClick}
              className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cài Đặt Ngay</span>
            </button>
            <button
              onClick={() => setDismissedInstall(true)}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Để Sau
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
