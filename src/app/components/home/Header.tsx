"use client";

import Link from "next/link";
import { ArrowRight, Sun, Moon } from "lucide-react";
import Logo from "@/app/components/ui/Logo";
import { useTheme } from "@/app/components/ui/ThemeProvider";

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border-app/40 bg-bg-app/70 dark:bg-slate-800/90 backdrop-blur-xl transition-all duration-300 dark:border-slate-800/40">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Logo showTagline={false} />

        <nav className="flex items-center gap-6">
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-border-app p-2.5 text-text-secondary hover:bg-surface-app hover:text-text-primary transition duration-200 cursor-pointer dark:border-slate-800 dark:hover:bg-slate-800"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4.5 w-4.5 text-yellow-500" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-slate-500" />
            )}
          </button>

          <Link
            href="/login"
            className="text-sm font-semibold text-text-secondary hover:text-text-primary transition duration-200 dark:text-gray-300 dark:hover:text-white"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-blue hover:shadow-primary-blue/20 dark:bg-white dark:text-slate-950 dark:hover:bg-primary-blue dark:hover:text-white"
          >
            <span className="relative z-10">Get Started</span>
            <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-primary-blue to-primary-blue-light transition-transform duration-500 ease-out group-hover:translate-x-0" />
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;