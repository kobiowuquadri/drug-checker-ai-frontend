"use client";

import { Sparkles, Brain, Loader2, ArrowRight } from "lucide-react";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import { InteractionResult } from "@/lib/mock-data";

interface CheckInteractionDrugsProps {
  drugs: string[];
  result: InteractionResult | null;
  isChecking: boolean;
  onCheck: () => void;
}

const severityLabels = {
  high: "High Risk",
  moderate: "Moderate Risk",
  low: "Low Risk",
  none: "No Known Risk",
};

export default function CheckInteractionDrugs({
  drugs,
  result,
  isChecking,
  onCheck,
}: CheckInteractionDrugsProps) {
  const canCheck = drugs.length >= 2;

  return (
    <div className="space-y-6">
      <Button
        onClick={onCheck}
        disabled={!canCheck || isChecking}
        fullWidth
        className="py-4 text-base relative overflow-hidden group shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isChecking ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Running clinical interaction analysis...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 text-emerald-100 group-hover:scale-110 transition duration-300" />
              Check Interactions
            </>
          )}
        </span>
      </Button>

      {!canCheck && (
        <p className="text-center text-xs font-semibold text-slate-400">
          Select at least two medications from the search bar to run checks.
        </p>
      )}

      {result && (
        <Card className="space-y-6 border-slate-200/80 bg-white p-6 md:p-8 animate-fade-in shadow-xl shadow-slate-100/50">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm md:text-base">
                Clinical Interaction Results
              </h3>
            </div>
            <Badge variant={result.severity}>{severityLabels[result.severity]}</Badge>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Drug Combination</p>
              <p className="mt-1.5 font-bold text-slate-800 text-sm md:text-base">{result.drugs.join(" + ")}</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Summary</p>
              <p className="mt-1.5 font-bold text-slate-800 text-sm md:text-base">{result.summary}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Medical Explanation</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">{result.explanation}</p>
          </div>

          <div
            className={`rounded-2xl border p-5 ${
              result.severity === "high"
                ? "bg-red-500/5 border-red-500/15 text-red-700"
                : result.severity === "moderate"
                  ? "bg-amber-500/5 border-amber-500/15 text-amber-700"
                  : result.severity === "low"
                    ? "bg-blue-500/5 border-blue-500/15 text-blue-700"
                    : "bg-emerald-500/5 border-emerald-500/15 text-emerald-700"
            }`}
          >
            <h5 className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Clinical Recommendation</h5>
            <p className="text-sm font-semibold leading-relaxed">
              {result.recommendation}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
