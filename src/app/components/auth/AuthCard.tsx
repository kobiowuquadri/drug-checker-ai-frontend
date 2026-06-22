import Logo from "@/app/components/ui/Logo";
import Card from "@/app/components/ui/Card";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-mesh-pattern px-6 py-12">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[20%] left-[20%] -z-10 h-[300px] w-[300px] rounded-full bg-emerald-400/5 blur-[80px]" />
      <div className="absolute bottom-[20%] right-[20%] -z-10 h-[300px] w-[300px] rounded-full bg-teal-400/5 blur-[80px]" />

      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center transition hover:scale-105 duration-300">
          <Logo />
        </div>

        <Card padding="lg" className="border border-slate-200/60 bg-white/95 shadow-xl shadow-slate-100/50 backdrop-blur-md">
          <div className="mb-6 text-center">
            <h1 className="bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{subtitle}</p>
            )}
          </div>

          {children}
        </Card>
      </div>
    </div>
  );
}
