import {
  Brain,
  FileDown,
  Search,
  ShieldCheck,
} from "lucide-react";
import Card from "@/app/components/ui/Card";

const features = [
  {
    icon: Search,
    title: "Smart Drug Search",
    description:
      "Quickly find medications and build a list of everything you are currently taking.",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    icon: Brain,
    title: "AI-Powered Explanations",
    description:
      "Get clear, plain-language explanations of potential interactions and why they matter.",
    color: "from-purple-500 to-indigo-500",
    bg: "bg-purple-50",
    textColor: "text-purple-600",
  },
  {
    icon: ShieldCheck,
    title: "Risk Level Indicators",
    description:
      "See severity ratings at a glance so you can prioritize what to discuss with your doctor.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    textColor: "text-amber-600",
  },
  {
    icon: FileDown,
    title: "Downloadable Reports",
    description:
      "Save interaction summaries as PDF reports to share with your healthcare provider.",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50",
    textColor: "text-blue-600",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative bg-slate-50/50 py-24 lg:py-32">
      {/* Decorative gradient dividers */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Everything You Need for Safer Medication Use
          </h2>
          <p className="mt-4 text-base md:text-lg text-slate-600 leading-relaxed">
            Drug Checker AI processes verified safety datasets alongside clinical-trained AI models to help you understand your prescriptions.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group relative overflow-hidden border border-slate-200/60 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50"
            >
              {/* Feature color accent stripe */}
              <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${feature.color}`} />

              <div className={`mb-6 inline-flex rounded-2xl ${feature.bg} p-3.5 transition-transform duration-300 group-hover:scale-110`}>
                <feature.icon className={`h-6 w-6 ${feature.textColor}`} />
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition duration-200">
                {feature.title}
              </h3>
              
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
