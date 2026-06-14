import Link from "next/link";
import {
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 lg:py-28">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-100 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
        {/* Left */}

        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />

            <span className="text-sm font-medium text-emerald-700">
              AI-Powered Medication Safety
            </span>
          </div>

          <h1 className="text-5xl font-bold leading-tight text-slate-900 lg:text-6xl">
            Make Every Medication Decision
            <span className="text-emerald-600">
              {" "}
              Safer.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Identify harmful drug combinations,
            understand their risks through
            AI-powered explanations, and take
            medications with greater confidence.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 font-semibold text-white transition hover:bg-emerald-700"
            >
              Get Started Free

              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="#features"
              className="rounded-2xl border border-slate-300 bg-white px-8 py-4 font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Learn More
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-emerald-600" />

              <span className="text-sm text-slate-600">
                Trusted Drug Data
              </span>
            </div>

            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-emerald-600" />

              <span className="text-sm text-slate-600">
                AI Explanations
              </span>
            </div>

            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-emerald-600" />

              <span className="text-sm text-slate-600">
                Download Reports
              </span>
            </div>
          </div>
        </div>

        {/* Right */}

        <div className="relative">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-semibold">
                Interaction Results
              </h3>

              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                High Risk
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <p className="font-medium text-slate-900">
                  Drug Combination
                </p>

                <p className="text-slate-600">
                  Warfarin + Ibuprofen
                </p>
              </div>

              <div>
                <p className="font-medium text-slate-900">
                  AI Explanation
                </p>

                <p className="text-slate-600">
                  Taking these medicines together
                  may increase the chance of
                  stomach bleeding.
                </p>
              </div>

              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-sm text-red-700">
                  Speak with your healthcare
                  provider before combining these
                  medications.
                </p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 -left-6 rounded-2xl border border-emerald-200 bg-white p-4 shadow-lg">
            <p className="text-sm text-slate-500">
              Medication Checks
            </p>

            <p className="text-2xl font-bold text-emerald-600">
              10K+
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;