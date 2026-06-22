// components/footer.tsx

import Link from "next/link";
import { Shield, AlertTriangle, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-100 bg-slate-50/50 py-16 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Top section */}
        <div className="grid gap-12 md:grid-cols-4 lg:gap-16">
          
          {/* Brand & Info */}
          <div className="md:col-span-2">
            <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900">
              <span className="rounded-lg bg-emerald-600 p-1 text-white">
                <Shield size={16} />
              </span>
              <span>Drug Checker AI</span>
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              An intelligent medication pairing companion built to promote medical awareness and check compatibility. Designed to keep patients, caregivers, and practitioners informed.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 hover:text-slate-600 hover:shadow-sm transition"
              >
                <Shield size={16} />
              </a>
              <a
                href="mailto:support@aidrugchecker.com"
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:shadow-sm transition"
              >
                <Mail size={14} />
                <span>support@aidrugchecker.com</span>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Navigation</h3>
            <ul className="mt-4 space-y-3 text-sm font-medium">
              <li>
                <Link href="/" className="text-slate-500 hover:text-emerald-600 transition">
                  Home Page
                </Link>
              </li>
              <li>
                <Link href="/check" className="text-slate-500 hover:text-emerald-600 transition">
                  Drug Checker
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-500 hover:text-emerald-600 transition">
                  About Project
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-500 hover:text-emerald-600 transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety notice */}
          <div>
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <AlertTriangle size={14} className="text-amber-500" />
              Safety Notice
            </h3>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              This application does not provide or replace professional medical advice, diagnosis, or treatment. Always consult with a licensed healthcare practitioner before changing or starting medication regimens.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col gap-6 border-t border-slate-200/60 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-medium text-slate-400">
            © {new Date().getFullYear()} Drug Checker AI. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-full">
              <Shield size={12} />
              Secure Connection Enabled
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}