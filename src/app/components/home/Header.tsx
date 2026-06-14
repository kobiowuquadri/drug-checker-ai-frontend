import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>

          <div>
            <h1 className="font-bold text-slate-900">
              Drug Checker AI
            </h1>

            <p className="text-xs text-slate-500">
              Know Before You Combine
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          <Link
            href="/login"
            className="font-medium text-slate-600 transition hover:text-slate-900"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;