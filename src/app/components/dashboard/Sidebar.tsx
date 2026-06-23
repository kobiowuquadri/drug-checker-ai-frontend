"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  User,
  ShieldCheck,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuth } from "@/app/components/auth/AuthContext";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Checker Portal", icon: LayoutDashboard },
  { href: "/dashboard/history", label: "Check History", icon: History },
  { href: "/dashboard/report", label: "Clinical Reports", icon: ClipboardList },
  { href: "/dashboard/profile", label: "Profile & Settings", icon: User },
];

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const handleSignOut = async () => {
    if (onClose) onClose();
    await logout();
  };

  return (
    <>
      {/* Mobile dark backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden"
        />
      )}

      {/* Sidebar drawer container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/60 bg-white transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand logo & Close button */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="group flex items-center gap-2.5"
          >
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600 transition duration-300 group-hover:scale-105 group-hover:bg-emerald-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-slate-900">
                Drug Checker AI
              </h1>
              <p className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                Dashboard
              </p>
            </div>
          </Link>

          {/* Mobile close toggle button */}
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-100 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 md:hidden cursor-pointer"
              aria-label="Close Menu"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation items list */}
        <nav className="flex-1 space-y-1.5 p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500/5 text-emerald-700 shadow-sm shadow-emerald-500/5"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-4.5 w-4.5 transition-colors duration-200 ${
                    isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                  }`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <ChevronRight className="h-4 w-4 text-emerald-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile card & Log out */}
        <div className="border-t border-slate-100 p-4 space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-800 truncate">{user?.name || "User"}</h4>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || "loading..."}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition duration-200 text-left border-0 bg-transparent cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
