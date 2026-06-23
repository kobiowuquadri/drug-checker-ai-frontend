import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-emerald-950/5 bg-white/70 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50/50 p-2.5 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-emerald-500/10">
            <ShieldCheck className="h-6 w-6 text-emerald-600 transition-transform duration-300 group-hover:rotate-6" />
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          </div>

          <div>
            <h1 className="bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text font-bold tracking-tight text-transparent transition-all duration-300 group-hover:from-emerald-700 group-hover:to-teal-600">
              Drug Checker AI
            </h1>

            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Know Before You Combine
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-600 transition duration-200 hover:text-slate-900"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-emerald-500/20"
          >
            <span className="relative z-10">Get Started</span>
            <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-transform duration-500 ease-out group-hover:translate-x-0" />
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;