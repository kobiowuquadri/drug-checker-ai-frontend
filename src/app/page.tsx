import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Button from "@/app/components/ui/Button";
import MedicalIllustration from "@/app/components/illustrations/MedicalIllustrations";
import FaqAccordion from "@/app/components/FaqAccordion";

const features = [
  {
    icon: Search,
    title: "RxNav medication search",
    text: "Find standardized drug names, brands, dose forms, and RxCUI identifiers instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Verified interaction checks",
    text: "Compare 2 to 5 medications against a verified clinical interaction database.",
  },
  {
    icon: Brain,
    title: "AI-powered explanations",
    text: "Gemini summarizes verified findings clearly without generating medical claims.",
  },
  {
    icon: FileText,
    title: "Clinical reports",
    text: "Generate and save concise reports from your interaction history for review.",
  },
];

const steps = [
  {
    number: "01",
    title: "Search",
    text: "Use RxNav autocomplete to find and select 2 to 5 medications by generic name, brand, or RxCUI.",
    illustration: "drug-search" as const,
  },
  {
    number: "02",
    title: "Check",
    text: "The platform generates all possible drug pairs and verifies each against the interaction database.",
    illustration: "ai-assistant" as const,
  },
  {
    number: "03",
    title: "Report",
    text: "Interaction checks are saved to your history. Generate a clinical report in one click.",
    illustration: "report" as const,
  },
];


const team = [
  {
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&auto=format&fit=crop&q=80",
    name: "Team Member",
    role: "Founder & Lead",
  },
  {
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&auto=format&fit=crop&q=80",
    name: "Team Member",
    role: "Backend Engineer",
  },
  {
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&auto=format&fit=crop&q=80",
    name: "Team Member",
    role: "Frontend Developer",
  },
  {
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&auto=format&fit=crop&q=80",
    name: "Team Member",
    role: "Medical Advisor",
  },
];

const shell = "mx-auto w-full max-w-[1400px] px-6 md:px-10 lg:px-16 xl:px-24";

export default function HomePage() {
  return (
    <main className="bg-white text-text-primary">

      {/* ── NAV ── */}
      <header className="sticky top-0 z-40 border-b border-border-app bg-white/90 backdrop-blur-xl">
        <nav className={`${shell} flex h-20 items-center justify-between`}>
          <Link href="/" className="inline-flex transition hover:opacity-85">
            <span className="flex items-center gap-2 leading-none">
              <span className="text-[1.35rem] font-black tracking-tight text-text-primary">
                Drug<span className="text-primary-blue">Checker</span>
              </span>
              <span className="rounded-md bg-primary-blue px-1.5 py-[3px] text-[10px] font-black uppercase tracking-widest text-white">
                AI
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-bold text-text-secondary md:flex">
            <a href="#features" className="hover:text-primary-blue transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary-blue transition-colors">How it works</a>
            <a href="#team" className="hover:text-primary-blue transition-colors">Team</a>
            <a href="#faq" className="hover:text-primary-blue transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden rounded-2xl px-4 py-2 text-sm font-bold text-text-secondary hover:bg-surface-app sm:inline-flex transition-colors">
              Sign in
            </Link>
            <Link href="/register">
              <Button className="px-5 py-2.5">Get started <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <Image
          src="/image/hero.jpg"
          alt="Medical professional workspace"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Overlay — lighter so the hero image comes through */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-blue/75 via-primary-blue/55 to-slate-900/20" />

        <div className={`relative z-10 ${shell} py-24`}>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-100 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              AI-assisted medication safety
            </div>

            <h1 className="mt-8 text-5xl font-black leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
              Safer medication decisions,{" "}
              <span className="text-blue-200">explained clearly.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-blue-100">
              Search medications, identify verified drug-drug interactions, and generate clinical reports with clear AI explanations — all in one secure workspace.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm font-bold text-primary-blue shadow-lg transition hover:bg-blue-50 sm:w-auto"
              >
                Start checking medications <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 sm:w-auto"
              >
                Sign in to dashboard
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["2–5 drugs", "per check"],
                ["Verified DB", "interactions"],
                ["AI explained", "every finding"],
                ["Clinical", "reports"],
              ].map(([main, sub]) => (
                <div key={main} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-sm font-black text-white">{main}</p>
                  <p className="mt-0.5 text-xs font-semibold text-blue-200">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="bg-white py-24">
        <div className={shell}>
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-primary-blue">Platform features</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-text-primary">
              Built for clarity, not clutter.
            </h2>
            <p className="mt-4 text-base font-medium leading-7 text-text-secondary">
              Every feature is designed around a single goal: helping clinicians and patients make safer medication decisions with verified data.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-[28px] border border-border-app bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:border-primary-blue/20 hover:shadow-premium"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-blue/10 transition group-hover:bg-primary-blue">
                  <feature.icon className="h-6 w-6 text-primary-blue transition group-hover:text-white" />
                </div>
                <h3 className="mt-5 text-lg font-black text-text-primary">{feature.title}</h3>
                <p className="mt-3 text-sm font-medium leading-6 text-text-secondary">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-surface-app py-24">
        <div className={shell}>
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-primary-blue">How it works</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-text-primary">
              Three steps to verified safety.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="rounded-[32px] border border-border-app bg-white p-8 shadow-soft">
                <span className="text-5xl font-black text-primary-blue/15">{step.number}</span>
                <MedicalIllustration name={step.illustration} className="mt-4 h-44 w-full" />
                <h3 className="mt-5 text-2xl font-black text-text-primary">{step.title}</h3>
                <p className="mt-3 text-sm font-medium leading-6 text-text-secondary">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section id="team" className="bg-white py-24">
        <div className={shell}>
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-primary-blue">Our team</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-text-primary">
              Meet the people behind Drug Checker AI.
            </h2>
            <p className="mt-4 text-base font-medium leading-7 text-text-secondary">
              A multidisciplinary team combining clinical knowledge, engineering, and design to make medication safety accessible.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, index) => (
              <div key={index} className="overflow-hidden rounded-[28px] border border-border-app bg-white shadow-soft">
                <div className="relative h-56 w-full">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-black text-text-primary">{member.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-primary-blue">{member.role}</p>
                  <p className="mt-3 text-xs font-medium text-text-muted">Details coming soon</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REPORTS ── */}
      <section className="bg-primary-blue py-24 text-white">
        <div className={`${shell} grid gap-12 lg:grid-cols-2 lg:items-center`}>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">Clinical reports</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">
              Turn a medication check into a shareable clinical report.
            </h2>
            <p className="mt-5 text-base font-medium leading-8 text-blue-100">
              Reports are generated from saved history — keeping the workflow simple. Check interactions, save history, generate a clean report with one click.
            </p>
            <ul className="mt-8 space-y-3">
              {["Severity summary and risk indicator", "Full list of verified interactions", "AI safety summary", "Clinician notes field"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-semibold text-blue-100">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-300" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm font-bold text-primary-blue shadow-lg transition hover:bg-blue-50"
            >
              Create free account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-[32px] bg-white/10 p-8 backdrop-blur-sm ring-1 ring-white/10">
            <MedicalIllustration name="report" className="h-52 w-full" />
            <div className="mt-6 space-y-3">
              {["Severity summary", "Verified interactions", "AI safety summary", "Clinician notes"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-sm font-bold text-white">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-300" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-surface-app py-24">
        <div className={shell}>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-primary-blue">FAQ</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-text-primary">
              Clear answers for safer use.
            </h2>
          </div>

          <div className="mx-auto mt-12 max-w-4xl">
            <FaqAccordion />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-white py-24">
        <div className={shell}>
          <div className="relative overflow-hidden rounded-[40px] bg-primary-blue px-10 py-16 text-center shadow-premium md:px-16">
            {/* Subtle radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_60%)]" />
            <div className="relative">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">Ready to start?</p>
              <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-black tracking-tight text-white">
                Check medication safety with confidence.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base font-medium text-blue-100">
                Create a free account, search medications, and generate clinical reports from verified interaction data.
              </p>
              <Link
                href="/register"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-primary-blue shadow-lg transition hover:bg-blue-50"
              >
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border-app bg-white py-12">
        <div className={`${shell} flex flex-col gap-8 md:flex-row md:items-start md:justify-between`}>
          <div>
            <Link href="/" className="inline-flex transition hover:opacity-85">
              <span className="flex items-center gap-2 leading-none">
                <span className="text-[1.35rem] font-black tracking-tight text-text-primary">
                  Drug<span className="text-primary-blue">Checker</span>
                </span>
                <span className="rounded-md bg-primary-blue px-1.5 py-[3px] text-[10px] font-black uppercase tracking-widest text-white">
                  AI
                </span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm font-medium text-text-muted">
              Know before you combine.
            </p>
          </div>

          <div className="flex flex-wrap gap-12">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-text-muted">Product</p>
              <ul className="mt-3 space-y-2">
                {[["Features", "#features"], ["How it works", "#how-it-works"], ["Team", "#team"], ["FAQ", "#faq"]].map(([label, href]) => (
                  <li key={label}><a href={href} className="text-sm font-semibold text-text-secondary hover:text-primary-blue transition-colors">{label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-text-muted">Account</p>
              <ul className="mt-3 space-y-2">
                {[["Sign in", "/login"], ["Register", "/register"], ["Dashboard", "/dashboard"]].map(([label, href]) => (
                  <li key={label}><Link href={href} className="text-sm font-semibold text-text-secondary hover:text-primary-blue transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={`${shell} mt-10 border-t border-border-app pt-6`}>
          <p className="text-xs font-medium text-text-muted">
            Drug Checker AI is for reference only and does not replace professional medical advice, diagnosis, or treatment. © {new Date().getFullYear()} Drug Checker AI.
          </p>
        </div>
      </footer>
    </main>
  );
}
