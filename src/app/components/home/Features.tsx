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
    color: "from-primary-blue to-primary-blue-light",
    bg: "bg-primary-blue/10 dark:bg-primary-blue/20",
    textColor: "text-primary-blue dark:text-primary-blue-light",
  },
  {
    icon: Brain,
    title: "AI-Powered Explanations",
    description:
      "Get clear, plain-language explanations of potential interactions and why they matter.",
    color: "from-purple-accent to-purple-light",
    bg: "bg-purple-accent/10 dark:bg-purple-accent/20",
    textColor: "text-purple-accent dark:text-purple-light",
  },
  {
    icon: ShieldCheck,
    title: "Risk Level Indicators",
    description:
      "See severity ratings at a glance so you can prioritize what to discuss with your doctor.",
    color: "from-warning-orange to-severity-moderate",
    bg: "bg-warning-orange/10 dark:bg-warning-orange/20",
    textColor: "text-warning-orange",
  },
  {
    icon: FileDown,
    title: "Downloadable Reports",
    description:
      "Save interaction summaries as PDF reports to share with your healthcare provider.",
    color: "from-info-blue to-cyan-accent",
    bg: "bg-info-blue/10 dark:bg-info-blue/20",
    textColor: "text-info-blue dark:text-cyan-accent",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative bg-surface-app/30 py-24 lg:py-32 transition-colors">
      {/* Decorative gradient dividers */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border-app to-transparent dark:via-slate-800" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border-app to-transparent dark:via-slate-800" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
            Everything You Need for Safer Medication Use
          </h2>
          <p className="mt-4 text-base md:text-lg text-text-secondary leading-relaxed">
            Drug Checker AI processes verified safety datasets alongside clinical-trained AI models to help you understand your prescriptions.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group relative overflow-hidden border border-border-app bg-card-app p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-100/10 dark:border-slate-800 dark:hover:shadow-none"
            >
              {/* Feature color accent stripe */}
              <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${feature.color}`} />

              <div className={`mb-6 inline-flex rounded-2xl ${feature.bg} p-3.5 transition-transform duration-300 group-hover:scale-110`}>
                <feature.icon className={`h-6 w-6 ${feature.textColor}`} />
              </div>
              
              <h3 className="text-lg font-bold text-text-primary group-hover:text-primary-blue dark:group-hover:text-primary-blue-light transition duration-200">
                {feature.title}
              </h3>
              
              <p className="mt-3 text-sm leading-relaxed text-text-muted">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
