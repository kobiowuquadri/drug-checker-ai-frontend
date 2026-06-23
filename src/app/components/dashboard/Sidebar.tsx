"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  User,
  ChevronRight,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/app/components/auth/AuthContext";
import Logo from "@/app/components/ui/Logo";
import { useTheme } from "@/app/components/ui/ThemeProvider";

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
  const { theme, toggleTheme } = useTheme();

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
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border-app bg-card-app transition-colors duration-300 md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand logo & Close button */}
        <div className="flex h-20 items-center justify-between border-b border-border-app/50 px-6 dark:border-slate-800/50">
          <Logo href="/dashboard" showTagline={false} />

          {/* Mobile close toggle button */}
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-xl border border-border-app p-2 text-text-muted hover:bg-surface-app hover:text-text-primary md:hidden cursor-pointer dark:border-slate-800"
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
                    ? "bg-primary-blue/10 text-primary-blue shadow-sm shadow-primary-blue/5 dark:bg-primary-blue/20 dark:text-primary-blue-light"
                    : "text-text-secondary hover:bg-surface-app hover:text-text-primary"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-4.5 w-4.5 transition-colors duration-200 ${
                    isActive ? "text-primary-blue dark:text-primary-blue-light" : "text-text-muted group-hover:text-text-secondary"
                  }`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <ChevronRight className="h-4 w-4 text-primary-blue dark:text-primary-blue-light" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile card & Log out */}
        <div className="border-t border-border-app/50 p-4 space-y-3 dark:border-slate-800/50">
          {/* Theme switcher */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-app border border-border-app/30 dark:bg-slate-900/40 dark:border-slate-850">
            <span className="text-xs font-bold text-text-secondary">App Theme</span>
            <button
              onClick={toggleTheme}
              className="rounded-lg border border-border-app p-1.5 text-text-secondary hover:bg-bg-app hover:text-text-primary transition duration-200 cursor-pointer dark:border-slate-700 dark:hover:bg-slate-800"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5 text-yellow-500" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-slate-500" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-surface-app p-3 dark:bg-slate-900/20">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-blue text-white font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-text-primary truncate">{user?.name || "User"}</h4>
              <p className="text-[10px] text-text-muted truncate">{user?.email || "loading..."}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-xs font-bold text-text-secondary hover:bg-danger-red/10 hover:text-danger-red transition duration-200 text-left border-0 bg-transparent cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
