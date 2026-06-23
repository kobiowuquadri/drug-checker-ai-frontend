// components/footer.tsx

import Link from "next/link";
import { Shield, AlertTriangle, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border-app bg-surface-app/30 py-16 backdrop-blur-sm dark:border-slate-800 transition-colors">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Top section */}
        <div className="grid gap-12 md:grid-cols-4 lg:gap-16">
          
          {/* Brand & Info */}
          <div className="md:col-span-2">
            <h2 className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-text-primary">
              <span className="rounded-lg bg-primary-blue p-1.5 text-white">
                <Shield size={16} />
              </span>
              <span>Drug Checker AI</span>
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-secondary">
              An intelligent medication pairing companion built to promote medical awareness and check compatibility. Designed to keep patients, caregivers, and practitioners informed.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                className="rounded-lg border border-border-app bg-card-app p-2 text-text-muted hover:text-text-primary hover:shadow-sm transition dark:border-slate-800"
              >
                <Shield size={16} />
              </a>
              <a
                href="mailto:support@aidrugchecker.com"
                className="flex items-center gap-2 rounded-lg border border-border-app bg-card-app px-3.5 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:shadow-sm transition dark:border-slate-800"
              >
                <Mail size={14} />
                <span>support@aidrugchecker.com</span>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Quick Navigation</h3>
            <ul className="mt-4 space-y-3 text-sm font-medium">
              <li>
                <Link href="/" className="text-text-secondary hover:text-primary-blue dark:hover:text-primary-blue-light transition">
                  Home Page
                </Link>
              </li>
              <li>
                <Link href="/check" className="text-text-secondary hover:text-primary-blue dark:hover:text-primary-blue-light transition">
                  Drug Checker
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-text-secondary hover:text-primary-blue dark:hover:text-primary-blue-light transition">
                  About Project
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-text-secondary hover:text-primary-blue dark:hover:text-primary-blue-light transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety notice */}
          <div>
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted">
              <AlertTriangle size={14} className="text-warning-orange" />
              Safety Notice
            </h3>
            <p className="mt-4 text-xs leading-relaxed text-text-secondary">
              This application does not provide or replace professional medical advice, diagnosis, or treatment. Always consult with a licensed healthcare practitioner before changing or starting medication regimens.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col gap-6 border-t border-border-app/60 pt-8 md:flex-row md:items-center md:justify-between dark:border-slate-800">
          <p className="text-xs font-medium text-text-muted">
            © {new Date().getFullYear()} Drug Checker AI. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-xs font-semibold text-text-muted">
            <span className="flex items-center gap-1 text-medical-green bg-medical-green/5 border border-medical-green/10 px-2.5 py-1 rounded-full">
              <Shield size={12} />
              Secure Connection Enabled
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}