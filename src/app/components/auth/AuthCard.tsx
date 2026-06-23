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
      <div className="absolute top-[20%] left-[20%] -z-10 h-[300px] w-[300px] rounded-full bg-primary-blue/5 blur-[80px]" />
      <div className="absolute bottom-[20%] right-[20%] -z-10 h-[300px] w-[300px] rounded-full bg-medical-green/5 blur-[80px]" />

      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center transition hover:scale-105 duration-300">
          <Logo />
        </div>

        <Card padding="lg" className="border border-border-app bg-card-app/95 shadow-xl dark:border-slate-800 transition-colors">
          <div className="mb-6 text-center">
            <h1 className="bg-gradient-to-r from-text-primary to-text-secondary dark:from-white dark:to-gray-300 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{subtitle}</p>
            )}
          </div>

          {children}
        </Card>
      </div>
    </div>
  );
}
