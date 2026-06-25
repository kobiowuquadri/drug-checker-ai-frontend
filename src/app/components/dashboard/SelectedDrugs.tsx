"use client";

import { X, Pill, Info } from "lucide-react";
import Card from "@/app/components/ui/Card";
import { SelectedDrug } from "./DrugChecker";

interface SelectedDrugsProps {
  drugs: SelectedDrug[];
  onRemove: (rxcui: string) => void;
  onShowDetails: (drug: SelectedDrug) => void;
}

export default function SelectedDrugs({ drugs, onRemove, onShowDetails }: SelectedDrugsProps) {
  if (drugs.length === 0) {
    return null;
  }

  return (
    <Card className="border-border-app bg-card-app dark:border-slate-800 animate-fade-in">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-gray-400">
        Selected Medications ({drugs.length})
      </h3>
      <div className="flex flex-wrap gap-2.5">
        {drugs.map((drug) => (
          <span
            key={drug.rxcui}
            className="inline-flex items-center gap-2 rounded-full border border-border-app bg-surface-app px-4 py-2 text-sm font-semibold text-text-secondary shadow-sm transition-all duration-200 hover:border-text-secondary/40 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200"
          >
            <Pill className="h-4 w-4 text-text-muted shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-xs md:max-w-md" title={drug.name}>
              {drug.name}
            </span>
            <div className="flex items-center gap-1 shrink-0 ml-1 border-l border-border-app pl-2 dark:border-slate-700">
              <button
                type="button"
                onClick={() => onShowDetails(drug)}
                className="rounded-full p-1 text-text-muted hover:bg-slate-200 hover:text-text-primary dark:hover:bg-slate-800 transition cursor-pointer"
                title="View drug details"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onRemove(drug.rxcui)}
                className="rounded-full p-1 text-text-muted hover:bg-slate-200 hover:text-red-500 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label={`Remove ${drug.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </span>
        ))}
      </div>
    </Card>
  );
}
