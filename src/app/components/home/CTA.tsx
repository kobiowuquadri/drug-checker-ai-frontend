import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="relative px-6 pb-24 lg:pb-32">
      {/* Decorative aura */}
      <div className="absolute bottom-0 left-1/2 -z-10 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[100px]" />

      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 px-8 py-16 text-center text-white shadow-2xl shadow-slate-950/20 lg:px-16 lg:py-24">
        {/* Subtle geometric lines */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.5),rgba(255,255,255,0))]" />
        
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-emerald-400 border border-emerald-500/10">
            <Sparkles className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider">Join 10,000+ safer patients</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-tight text-white">
            Ready to Take Control of Your Medication Safety?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed">
            Create a free account today and gain immediate access to our full clinical interaction suite, downloadable reports, and profile logging tools.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="group flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-emerald-500/30"
            >
              Create Free Account
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/login"
              className="flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/50 px-8 py-4 font-semibold text-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:text-white"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;