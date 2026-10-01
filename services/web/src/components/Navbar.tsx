"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, 
  GraduationCap, 
  Network, 
  BookMarked, 
  BrainCircuit, 
  Home, 
  Server, 
  Sparkles,
  Menu,
  X,
  Library
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    async function checkApi() {
      try {
        const res = await fetch(`${apiUrl}/health`, { cache: "no-store" });
        setApiOnline(res.ok);
      } catch {
        setApiOnline(false);
      }
    }
    checkApi();
    const interval = setInterval(checkApi, 15000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  const navLinks = [
    { href: "/", label: "Trang Chủ", icon: Home },
    { href: "/bible", label: "Kinh Thánh", icon: BookOpen },
    { href: "/learn", label: "Học Tập", icon: GraduationCap },
    { href: "/explore", label: "Khám Phá", icon: Network },
    { href: "/study", label: "Dự Án Học", icon: BookMarked },
    { href: "/research", label: "Nghiên Cứu", icon: BrainCircuit },
    { href: "/library", label: "Thư Viện", icon: Library }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm md:text-base tracking-tight text-white flex items-center gap-1.5">
              BibleKnowledge
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold font-mono">
                Alpha
              </span>
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">Nghiên cứu & Khám phá AI</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/60">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Status Indicator & Mobile Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
            <span className={`w-2 h-2 rounded-full ${apiOnline ? "bg-emerald-400 animate-pulse" : apiOnline === false ? "bg-rose-500" : "bg-slate-500"}`}></span>
            <span className="text-slate-300">
              {apiOnline ? "AI GPU Online" : apiOnline === false ? "API Offline" : "Connecting..."}
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-slate-800 px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
