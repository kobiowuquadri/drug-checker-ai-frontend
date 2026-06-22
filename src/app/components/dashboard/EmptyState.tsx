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
    <Card className="border-dashed border-slate-300 bg-slate-50/50 py-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-400">
        <Pill className="h-6 w-6 animate-pulse" />
      </div>
      <h3 className="text-base font-extrabold text-slate-800">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-xs font-semibold text-slate-400 leading-relaxed">
        {description}
      </p>
    </Card>
  );
}
