type BadgeVariant = "high" | "moderate" | "low" | "none" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  high: "bg-red-500/10 border-red-500/20 text-red-600 border",
  moderate: "bg-amber-500/10 border-amber-500/20 text-amber-700 border",
  low: "bg-blue-500/10 border-blue-500/20 text-blue-600 border",
  none: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 border",
  default: "bg-slate-500/10 border-slate-500/20 text-slate-600 border",
};

export default function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
