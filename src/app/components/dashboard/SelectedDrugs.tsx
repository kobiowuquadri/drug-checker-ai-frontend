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
    <Card className="border-slate-200/80 bg-white">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
        Selected Medications ({drugs.length})
      </h3>
      <div className="flex flex-wrap gap-2.5">
        {drugs.map((drug) => (
          <span
            key={drug}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 animate-fade-in"
          >
            <Pill className="h-4 w-4 text-slate-400" />
            <span>{drug}</span>
            <button
              type="button"
              onClick={() => onRemove(drug)}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
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
