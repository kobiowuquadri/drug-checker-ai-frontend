import { Pill } from "lucide-react";
import Card from "@/app/components/ui/Card";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = "No medications selected",
  description = "Search and add medications above to check for potential interactions.",
}: EmptyStateProps) {
  return (
    <Card className="border-dashed border-border-app bg-surface-app/30 py-12 text-center dark:border-slate-800 transition-colors">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-card-app shadow-sm border border-border-app text-text-muted dark:border-slate-800">
        <Pill className="h-6 w-6 animate-pulse" />
      </div>
      <h3 className="text-base font-extrabold text-text-primary">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-xs font-semibold text-text-secondary leading-relaxed">
        {description}
      </p>
    </Card>
  );
}
