"use client";

import { useState } from "react";
import Sidebar from "@/app/components/dashboard/Sidebar";
import { Menu, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar Component with mobile drawer props */}
      <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      {/* Main content wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top navigation bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/60 bg-white px-6 md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <span className="font-extrabold text-sm text-slate-800">Drug Checker AI</span>
          </Link>

          <button
            onClick={() => setIsMobileOpen(true)}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition cursor-pointer"
            aria-label="Open Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Scrollable content container */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
