"use client";

import { X, Pill } from "lucide-react";
import Card from "@/app/components/ui/Card";

interface SelectedDrugsProps {
  drugs: string[];
  onRemove: (drug: string) => void;
}

export default function SelectedDrugs({ drugs, onRemove }: SelectedDrugsProps) {
  if (drugs.length === 0) {
    return null;
  }

  return (
    <Card className="border-border-app bg-card-app dark:border-slate-800">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-gray-400">
        Selected Medications ({drugs.length})
      </h3>
      <div className="flex flex-wrap gap-2.5">
        {drugs.map((drug) => (
          <span
            key={drug}
            className="inline-flex items-center gap-2 rounded-full border border-border-app bg-surface-app px-4 py-2 text-sm font-semibold text-text-secondary shadow-sm transition-all duration-200 hover:border-text-secondary/40 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200 animate-fade-in"
          >
            <Pill className="h-4 w-4 text-text-muted" />
            <span>{drug}</span>
            <button
              type="button"
              onClick={() => onRemove(drug)}
              className="rounded-full p-1 text-text-muted hover:bg-surface-app hover:text-text-primary dark:hover:bg-slate-850 transition"
              aria-label={`Remove ${drug}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
    </Card>
  );
}
