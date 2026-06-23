"use client";

import { useState } from "react";
import Sidebar from "@/app/components/dashboard/Sidebar";
import Logo from "@/app/components/ui/Logo";
import { Menu } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-app transition-colors duration-300">
      {/* Sidebar Component with mobile drawer props */}
      <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      {/* Main content wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top navigation bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-app bg-card-app px-6 md:hidden dark:border-slate-800">
          <Logo href="/dashboard" showTagline={false} />

          <button
            onClick={() => setIsMobileOpen(true)}
            className="rounded-xl border border-border-app p-2 text-text-secondary hover:bg-surface-app hover:text-text-primary transition cursor-pointer dark:border-slate-800"
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
