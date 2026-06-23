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
        className="py-4 text-base relative overflow-hidden group shadow-lg shadow-primary-blue/10 hover:shadow-primary-blue/25 dark:shadow-primary-blue/5"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isChecking ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Running clinical interaction analysis...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 text-blue-100 group-hover:scale-110 transition duration-300" />
              Check Interactions
            </>
          )}
        </span>
      </Button>

      {!canCheck && (
        <p className="text-center text-xs font-semibold text-slate-400 dark:text-gray-400">
          Select at least two medications from the search bar to run checks.
        </p>
      )}

      {result && (
        <Card className="space-y-6 border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/50 p-6 md:p-8 animate-fade-in shadow-xl shadow-slate-100/50 dark:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/85 pb-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary-blue/10 p-1.5 text-primary-blue dark:bg-primary-blue/20 dark:text-primary-blue-light">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base">
                Clinical Interaction Results
              </h3>
            </div>
            <Badge variant={result.severity as any}>{severityLabels[result.severity as keyof typeof severityLabels] || "Default"}</Badge>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-400">Drug Combination</p>
              <p className="mt-1.5 font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base">{result.drugs.join(" + ")}</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-400">Summary</p>
              <p className="mt-1.5 font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base">{result.summary}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-400">AI Medical Explanation</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-800/30 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">{result.explanation}</p>
          </div>

          <div
            className={`rounded-2xl border p-5 ${
              result.severity === "high"
                ? "bg-severity-high/5 border-severity-high/15 text-severity-high"
                : result.severity === "moderate"
                  ? "bg-severity-moderate/5 border-severity-moderate/15 text-severity-moderate"
                  : result.severity === "low"
                    ? "bg-severity-low/5 border-severity-low/15 text-severity-low"
                    : "bg-severity-safe/5 border-severity-safe/15 text-severity-safe"
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
