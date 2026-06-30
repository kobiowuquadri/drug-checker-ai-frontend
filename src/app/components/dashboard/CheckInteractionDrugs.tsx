"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Brain, Loader2, AlertTriangle, AlertCircle, ShieldCheck, ChevronDown, ChevronUp, Pill, FileText, ClipboardList, X } from "lucide-react";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import { BackendInteractionResponse } from "@/lib/api-types";
import { getAuthHeaders } from "@/app/components/auth/AuthContext";

interface CheckInteractionDrugsProps {
  drugs: string[];
  result: BackendInteractionResponse | null;
  isChecking: boolean;
  onCheck: () => void;
}

function getBadgeVariant(severity: string): "critical" | "high" | "moderate" | "low" | "none" | "default" {
  switch ((severity || "").toLowerCase()) {
    case "high":
    case "critical":
      return "high";
    case "moderate":
      return "moderate";
    case "low":
      return "low";
    case "safe":
    case "none":
      return "none";
    default:
      return "default";
  }
}

function getSeverityLabel(severity: string): string {
  switch ((severity || "").toUpperCase()) {
    case "HIGH":
    case "CRITICAL":
      return "High Risk";
    case "MODERATE":
      return "Moderate Risk";
    case "LOW":
      return "Low Risk";
    case "SAFE":
    case "NONE":
      return "No Known Risk";
    default:
      return severity || "Unknown Risk";
  }
}

export default function CheckInteractionDrugs({
  drugs,
  result,
  isChecking,
  onCheck,
}: CheckInteractionDrugsProps) {
  const router = useRouter();
  const canCheck = drugs.length >= 2;
  const [expandedPairs, setExpandedPairs] = useState<Record<string, boolean>>({});

  // Modal States
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (result && drugs.length > 0) {
      setReportTitle(`Interaction Report: ${drugs.join(" + ")}`);
    }
  }, [result, drugs]);

  function toggleExpand(key: string) {
    setExpandedPairs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  async function handleGenerateReport(e: React.FormEvent) {
    e.preventDefault();
    if (!result?.historyId) {
      toast.error("Unable to save report: interaction history not found.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/reports/generate", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          historyId: result.historyId,
          title: reportTitle.trim() || "Drug Interaction Report",
          notes: reportNotes.trim() || "",
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        toast.success("Clinical Safety Report generated successfully!");
        setShowGenerateModal(false);
        setReportNotes("");
        router.push(`/dashboard/report?id=${json.data.id}`);
      } else {
        toast.error(json.message || "Failed to generate report.");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("An error occurred while generating the report.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Simple Markdown parser for the AI summary
  function renderSummaryMarkdown(text: string) {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      let content = line;
      const isBullet = line.trim().startsWith("*") || line.trim().startsWith("-");
      if (isBullet) {
        content = line.replace(/^[\s*-]+/, "").trim();
      }
      
      const parts = content.split(/\*\*(.*?)\*\*/g);
      const elements = parts.map((part, idx) => {
        if (idx % 2 === 1) {
          return <strong key={idx} className="font-extrabold text-slate-800 dark:text-white">{part}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={i} className="ml-4 list-disc pl-1 text-sm font-semibold text-text-secondary dark:text-slate-350 leading-relaxed mt-1">
            {elements}
          </li>
        );
      }

      if (line.trim() === "") {
        return <div key={i} className="h-2" />;
      }

      return (
        <p key={i} className="text-sm font-semibold text-text-secondary dark:text-slate-350 leading-relaxed mb-2">
          {elements}
        </p>
      );
    });
  }

  const highestSeverity = result?.safetySummary?.highestSeverity || "NONE";
  const severityAlerts = {
    HIGH: {
      bg: "bg-red-500/5 dark:bg-red-950/20 border-red-500/15 dark:border-red-900/40 text-red-700 dark:text-red-400",
      icon: <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400 shrink-0" />,
      title: "High Severity Risk Detected",
    },
    CRITICAL: {
      bg: "bg-red-500/5 dark:bg-red-950/20 border-red-500/15 dark:border-red-900/40 text-red-700 dark:text-red-400",
      icon: <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400 shrink-0" />,
      title: "High Severity Risk Detected",
    },
    MODERATE: {
      bg: "bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/15 dark:border-amber-900/40 text-amber-700 dark:text-amber-400",
      icon: <AlertCircle className="h-6 w-6 text-amber-500 dark:text-amber-400 shrink-0" />,
      title: "Moderate Severity Risk Detected",
    },
    LOW: {
      bg: "bg-blue-500/5 dark:bg-blue-950/20 border-blue-500/15 dark:border-blue-900/40 text-blue-700 dark:text-blue-400",
      icon: <AlertCircle className="h-6 w-6 text-blue-500 dark:text-blue-400 shrink-0" />,
      title: "Minor Interaction Potential",
    },
    SAFE: {
      bg: "bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/15 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400",
      icon: <ShieldCheck className="h-6 w-6 text-emerald-500 dark:text-emerald-400 shrink-0" />,
      title: "Clinical Safe Combination",
    },
    NONE: {
      bg: "bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350",
      icon: <ShieldCheck className="h-6 w-6 text-slate-400 shrink-0" />,
      title: "No Interactions Checked",
    },
  };

  const alertStyles = severityAlerts[highestSeverity as keyof typeof severityAlerts] || {
    bg: "bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350",
    icon: <ShieldCheck className="h-6 w-6 text-slate-400 shrink-0" />,
    title: "Safety Assessment",
  };

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
        <div className="space-y-6 animate-fade-in">
          {/* 1. Main Safety Banner */}
          <div className={`rounded-3xl border p-6 flex flex-col md:flex-row gap-4 items-start md:items-center ${alertStyles.bg}`}>
            {alertStyles.icon}
            <div className="space-y-1">
              <h4 className="text-base font-extrabold tracking-wide uppercase">
                {alertStyles.title}
              </h4>
              <p className="text-sm font-semibold opacity-90 leading-relaxed">
                {result.safetySummary?.actionMessage || "No significant interactions found between these medications."}
              </p>
            </div>
            <div className="md:ml-auto shrink-0 self-start md:self-center">
              <Badge variant={getBadgeVariant(highestSeverity)}>
                {getSeverityLabel(highestSeverity)}
              </Badge>
            </div>
          </div>

          {/* 2. Safety Summary Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center p-5 border-border-app bg-card-app dark:border-slate-800/80 dark:bg-slate-900/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Drugs Checked</span>
              <p className="mt-1 text-2xl font-extrabold text-text-primary dark:text-white">
                {result.safetySummary?.totalSelectedDrugs || 0}
              </p>
            </Card>

            <Card className="text-center p-5 border-border-app bg-card-app dark:border-slate-800/80 dark:bg-slate-900/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Pairs Evaluated</span>
              <p className="mt-1 text-2xl font-extrabold text-text-primary dark:text-white">
                {result.safetySummary?.totalPairsChecked || 0}
              </p>
            </Card>

            <Card className="text-center p-5 border-border-app bg-card-app dark:border-slate-800/80 dark:bg-slate-900/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Interactions Found</span>
              <p className={`mt-1 text-2xl font-extrabold ${result.safetySummary?.verifiedInteractions > 0 ? "text-severity-high" : "text-medical-green"}`}>
                {result.safetySummary?.verifiedInteractions || 0}
              </p>
            </Card>

            <Card className="text-center p-5 border-border-app bg-card-app dark:border-slate-800/80 dark:bg-slate-900/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Duplicate Therapies</span>
              <p className={`mt-1 text-2xl font-extrabold ${result.safetySummary?.duplicateTherapies > 0 ? "text-severity-moderate" : "text-text-primary dark:text-white"}`}>
                {result.safetySummary?.duplicateTherapies || 0}
              </p>
            </Card>
          </div>

          {/* Action Call to Save/Generate Official Report */}
          {result.historyId && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border border-border-app bg-primary-blue/5 dark:bg-primary-blue/10 dark:border-primary-blue/20 rounded-3xl">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary-blue dark:text-primary-blue-light" />
                <div>
                  <h4 className="text-sm font-extrabold text-text-primary dark:text-white">Clinical Report Generation</h4>
                  <p className="text-xs text-text-muted mt-0.5">Save this analysis to Clinical Reports with customized title and practitioner observations.</p>
                </div>
              </div>
              <Button onClick={() => setShowGenerateModal(true)} variant="primary" className="py-2.5 px-5 text-xs shrink-0 font-extrabold">
                <ClipboardList className="h-4 w-4" />
                Generate Clinical Report
              </Button>
            </div>
          )}

          {/* 3. AI Summary Card */}
          {result.aiSummary && (
            <Card className="p-6 md:p-8 border-border-app bg-white dark:border-slate-800 dark:bg-slate-900/30">
              <div className="flex items-center gap-2 border-b border-border-app dark:border-slate-850 pb-4 mb-4">
                <Brain className="h-5 w-5 text-primary-blue dark:text-primary-blue-light" />
                <h3 className="font-extrabold text-text-primary dark:text-white text-sm md:text-base">
                  AI Medical Assessment & Analysis
                </h3>
              </div>
              <div className="space-y-1">
                {renderSummaryMarkdown(result.aiSummary)}
              </div>
            </Card>
          )}

          {/* 4. Detailed Pairwise Interaction Cards */}
          {result.interactions && result.interactions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Pairwise Interaction breakdown ({result.interactions.length})
                </h4>
              </div>

              {result.interactions.map((pair, idx) => {
                const pairKey = `${pair.drugA.rxcui}-${pair.drugB.rxcui}`;
                const isExpanded = !!expandedPairs[pairKey];

                return (
                  <Card 
                    key={pairKey}
                    className="border border-border-app bg-card-app dark:border-slate-800 dark:bg-slate-900/40 overflow-hidden transition-all duration-350"
                    padding="none"
                  >
                    {/* Card Accordion Toggle Header */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(pairKey)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-850/30 text-left transition select-none cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary-blue/5 p-2 text-primary-blue dark:bg-primary-blue/15 dark:text-primary-blue-light shrink-0">
                          <Pill className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <span className="text-sm font-extrabold text-text-primary dark:text-white">
                            {pair.drugA.name} <span className="text-text-muted font-normal">and</span> {pair.drugB.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-4">
                        <Badge variant={getBadgeVariant(pair.severity)}>
                          {getSeverityLabel(pair.severity)}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-text-muted" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-text-muted" />
                        )}
                      </div>
                    </button>

                    {/* Accordion Collapsible Detail Section */}
                    {isExpanded && (
                      <div className="border-t border-border-app dark:border-slate-850 p-6 space-y-5 bg-slate-50/20 dark:bg-slate-950/10 animate-fade-in">
                        <div className="grid gap-6 sm:grid-cols-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Clinical Interaction Effect</span>
                            <p className="text-sm font-semibold text-text-secondary dark:text-slate-350 leading-relaxed">
                              {pair.effect}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Recommended Action</span>
                            <p className="text-sm font-bold text-text-primary dark:text-white leading-relaxed">
                              {pair.recommendation}
                            </p>
                          </div>
                        </div>

                        {pair.aiExplanation && (
                          <div className="space-y-1.5 border-t border-border-app dark:border-slate-850 pt-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Detailed AI Explanation</span>
                            <p className="text-xs font-semibold leading-relaxed text-text-secondary dark:text-slate-400 bg-surface-app/40 border border-border-app dark:border-slate-850 p-4 rounded-xl">
                              {pair.aiExplanation}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider pt-2 border-t border-border-app dark:border-slate-850/60">
                          <span>Pair Code: {pair.drugA.rxcui} + {pair.drugB.rxcui}</span>
                          <span>Data Source: {pair.source || "FDA/Clinical Databases"}</span>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* 5. Safe Case Summary (if check succeeded but no interactions were found) */}
          {result.interactions && result.interactions.length === 0 && (
            <Card className="p-8 text-center border-border-app bg-card-app dark:border-slate-800/80 dark:bg-slate-900/30">
              <div className="mx-auto rounded-full bg-medical-green/10 text-medical-green p-3 h-12 w-12 flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="text-base font-extrabold text-text-primary dark:text-white">No Interactions Found</h4>
              <p className="text-sm text-text-muted font-semibold mt-1 max-w-md mx-auto leading-relaxed">
                Our clinical database did not identify any interactions between these medications. However, always consult your physician or pharmacist before starting a new regimen.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Report Generation Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border-app bg-card-app p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900/95 animate-scale-up">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-app pb-4 dark:border-slate-850">
              <div className="flex items-center gap-2 text-primary-blue dark:text-primary-blue-light">
                <FileText className="h-5 w-5" />
                <h3 className="text-base font-extrabold text-text-primary dark:text-white">
                  Generate Clinical Report
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="rounded-xl border border-border-app p-2 text-text-muted hover:bg-surface-app hover:text-text-primary transition cursor-pointer dark:border-slate-800"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleGenerateReport} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Report Title
                </label>
                <input
                  type="text"
                  required
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full rounded-xl border border-border-app bg-bg-app px-4 py-3 text-sm font-semibold text-text-primary focus:border-primary-blue focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-primary-blue-light"
                  placeholder="e.g. Interaction Report: Ibuprofen + Warfarin"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Clinical Notes / Observations (Optional)
                </label>
                <textarea
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-border-app bg-bg-app px-4 py-3 text-sm font-semibold text-text-primary focus:border-primary-blue focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-primary-blue-light resize-none"
                  placeholder="Add notes for the physician, pharmacist, or patient..."
                />
              </div>

              {/* Actions Footer */}
              <div className="mt-6 flex justify-end gap-3 border-t border-border-app pt-4 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-850 dark:hover:bg-slate-850 dark:text-slate-200 px-5 py-2.5 text-sm font-bold transition duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={isGenerating} className="px-6 py-2.5">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    "Save & View Report"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
