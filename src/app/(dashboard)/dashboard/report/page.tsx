"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Download, FileText, Calendar, Printer, ShieldAlert, Award, Loader2, ArrowLeft, Brain, Pill, ChevronDown, ChevronUp, Trash2, ChevronRight, Info, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import DashboardHeader from "@/app/components/dashboard/DashboardHeader";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import { MOCK_HISTORY } from "@/lib/mock-data";
import { getAuthHeaders } from "@/app/components/auth/AuthContext";
import Link from "next/link";

interface NormalizedReport {
  id: string | number;
  title: string;
  notes?: string;
  dateStr: string;
  drugs: string[];
  severity: "critical" | "high" | "moderate" | "low" | "none" | "default";
  summary: string;
  explanation: string;
  safetySummary?: {
    totalSelectedDrugs: number;
    totalPairsChecked: number;
    verifiedInteractions: number;
    duplicateTherapies: number;
    severitySummary: {
      LOW: number;
      MODERATE: number;
      HIGH: number;
    };
    highestSeverity: string;
    actionMessage: string;
  };
  interactions?: any[];
  isMock: boolean;
}

const severityLabels = {
  critical: "Critical Risk",
  high: "High Risk",
  moderate: "Moderate Risk",
  low: "Low Risk",
  none: "No Known Risk",
  default: "Assessed Log",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "June 15, 2026";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return dateStr;
  }
}

function getHighestSeverity(severitySummary: any, interactions: any[]): string {
  if (severitySummary) {
    if (severitySummary.HIGH > 0 || severitySummary.CRITICAL > 0) return "HIGH";
    if (severitySummary.MODERATE > 0) return "MODERATE";
    if (severitySummary.LOW > 0) return "LOW";
  }
  if (interactions && interactions.length > 0) {
    const severities = interactions.map((i) => (i.severity || "").toUpperCase());
    if (severities.includes("HIGH") || severities.includes("CRITICAL")) return "HIGH";
    if (severities.includes("MODERATE")) return "MODERATE";
    if (severities.includes("LOW")) return "LOW";
  }
  return "NONE";
}

function ReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  
  // List State vs Single Report State
  const [reportsList, setReportsList] = useState<NormalizedReport[]>([]);
  const [isUsingMockList, setIsUsingMockList] = useState(false);
  const [report, setReport] = useState<NormalizedReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPairs, setExpandedPairs] = useState<Record<string, boolean>>({});

  function toggleExpand(key: string) {
    setExpandedPairs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    toast.info("Browser printing is recommended for a pixel-perfect PDF export. Initiating browser print dialog...");
    setTimeout(() => {
      window.print();
    }, 500);
  }

  async function handleDelete(reportId: string | number, redirect = false) {
    if (String(reportId).startsWith("mock-")) {
      if (redirect) {
        toast.success("Sandbox report deleted.");
        router.push("/dashboard/report");
      } else {
        setReportsList((prev) => prev.filter((r) => r.id !== reportId));
        toast.success("Sandbox report removed from view.");
      }
      return;
    }

    if (!confirm("Are you sure you want to delete this clinical report? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/reports/${reportId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const json = await response.json();
      if (json.success) {
        toast.success("Clinical Report deleted successfully.");
        if (redirect) {
          router.push("/dashboard/report");
        } else {
          setReportsList((prev) => prev.filter((r) => r.id !== reportId));
        }
      } else {
        toast.error(json.message || "Failed to delete report.");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("An error occurred while trying to delete the report.");
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

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      
      // CASE A: Querying a single report details by ID
      if (id) {
        // If ID explicitly points to a mock report log
        if (String(id).startsWith("mock-")) {
          const mockIndex = parseInt(String(id).split("-")[1] || "0", 10);
          useMockSingleFallback(mockIndex);
          return;
        }

        try {
          const response = await fetch(`/reports/${id}`, {
            headers: getAuthHeaders(),
          });
          const json = await response.json();
          if (json.success && json.data) {
            const reportData = json.data;
            const highestSev = getHighestSeverity(reportData.severitySummary, reportData.interactions);
            const actionMsg = highestSev === "HIGH" 
              ? "High severity findings were detected. Consult a clinician before combining these medications."
              : highestSev === "MODERATE"
                ? "Moderate safety findings were detected. Review this medication list with a clinician or pharmacist."
                : highestSev === "LOW"
                  ? "Minor safety findings were detected. Monitor for any potential adverse symptoms."
                  : "No significant drug-to-drug interactions detected in our database.";

            setReport({
              id: reportData.id || id,
              title: reportData.title || "Drug Interaction Report",
              notes: reportData.notes || "",
              dateStr: formatDate(reportData.createdAt),
              drugs: reportData.selectedDrugs?.map((d: any) => d.name || "") || [],
              severity: (highestSev.toLowerCase() === "safe" ? "none" : highestSev.toLowerCase()) as any,
              summary: actionMsg,
              explanation: reportData.aiSummary || "No safety summaries provided.",
              safetySummary: {
                totalSelectedDrugs: reportData.selectedDrugs?.length || 0,
                totalPairsChecked: (reportData.selectedDrugs?.length * (reportData.selectedDrugs?.length - 1)) / 2 || 1,
                verifiedInteractions: reportData.interactions?.length || 0,
                duplicateTherapies: 0,
                severitySummary: reportData.severitySummary || { LOW: 0, MODERATE: 0, HIGH: 0 },
                highestSeverity: highestSev,
                actionMessage: actionMsg,
              },
              interactions: reportData.interactions || [],
              isMock: false,
            });
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error(`Error loading report details for ${id}:`, error);
        }

        // Single fallback if the ID failed
        useMockSingleFallback(0);
        return;
      }

      // CASE B: Loading the list of all generated reports
      try {
        const response = await fetch("/reports", {
          headers: getAuthHeaders(),
        });
        const json = await response.json();
        if (json.success && json.data && json.data.length > 0) {
          const list = json.data.map((item: any) => {
            const highestSev = getHighestSeverity(item.severitySummary, item.interactions);
            const drugNames = item.selectedDrugs?.map((d: any) => d.name || "") || [];
            
            return {
              id: item.id,
              title: item.title || "Drug Interaction Report",
              notes: item.notes || "",
              dateStr: formatDate(item.createdAt),
              drugs: drugNames,
              severity: (highestSev.toLowerCase() === "safe" ? "none" : highestSev.toLowerCase()) as any,
              isMock: false,
            };
          });
          
          // Sort reports by ID descending (newest first)
          list.sort((a: any, b: any) => Number(b.id) - Number(a.id));
          setReportsList(list);
          setIsUsingMockList(false);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error loading reports registry list:", error);
      }

      // Fallback for registry list if empty or fails
      const mockList: NormalizedReport[] = MOCK_HISTORY.map((item, idx) => {
        const highestSev = item.severity.toUpperCase();
        return {
          id: `mock-${idx}`,
          title: `Clinical Report: ${item.drugs.join(" + ")}`,
          notes: idx === 0 ? "Patient asked for pharmacist review of gastrointestinal and anticoagulation bleeding risks." : "Prepared for general checkup.",
          dateStr: "June 19, 2026",
          drugs: item.drugs,
          severity: item.severity.toLowerCase() as any,
          summary: item.summary,
          explanation: item.explanation,
          isMock: true,
          safetySummary: {
            totalSelectedDrugs: item.drugs.length,
            totalPairsChecked: (item.drugs.length * (item.drugs.length - 1)) / 2 || 1,
            verifiedInteractions: item.severity === "none" ? 0 : 1,
            duplicateTherapies: 0,
            severitySummary: {
              LOW: item.severity === "low" ? 1 : 0,
              MODERATE: item.severity === "moderate" ? 1 : 0,
              HIGH: item.severity === "high" ? 1 : 0,
            },
            highestSeverity: highestSev,
            actionMessage: item.recommendation,
          }
        };
      });
      setReportsList(mockList);
      setIsUsingMockList(true);
      setIsLoading(false);
    }

    function useMockSingleFallback(index: number) {
      const idx = Math.min(Math.max(0, index), MOCK_HISTORY.length - 1);
      const mockItem = MOCK_HISTORY[idx] || MOCK_HISTORY[0];
      const highestSev = mockItem.severity.toUpperCase();
      
      setReport({
        id: `mock-${idx}`,
        title: `Clinical Report: ${mockItem.drugs.join(" + ")}`,
        notes: idx === 0 ? "Patient asked for pharmacist review of gastrointestinal and anticoagulation bleeding risks." : "Prepared for general checkup.",
        dateStr: "June 19, 2026",
        drugs: mockItem.drugs,
        severity: mockItem.severity.toLowerCase() as any,
        summary: mockItem.summary,
        explanation: mockItem.explanation,
        safetySummary: {
          totalSelectedDrugs: mockItem.drugs.length,
          totalPairsChecked: (mockItem.drugs.length * (mockItem.drugs.length - 1)) / 2 || 1,
          verifiedInteractions: mockItem.severity === "none" ? 0 : 1,
          duplicateTherapies: 0,
          severitySummary: {
            LOW: mockItem.severity === "low" ? 1 : 0,
            MODERATE: mockItem.severity === "moderate" ? 1 : 0,
            HIGH: mockItem.severity === "high" ? 1 : 0,
          },
          highestSeverity: highestSev,
          actionMessage: mockItem.recommendation,
        },
        interactions: mockItem.severity === "none" ? [] : [
          {
            drugA: { rxcui: "5640", name: mockItem.drugs[0] || "" },
            drugB: { rxcui: "1191", name: mockItem.drugs[1] || "" },
            severity: mockItem.severity.toUpperCase(),
            effect: mockItem.explanation,
            recommendation: mockItem.recommendation,
            source: "Mock Database Seed Data",
            aiExplanation: mockItem.explanation,
          }
        ],
        isMock: true,
      });
      setIsLoading(false);
    }

    loadReports();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary-blue dark:text-primary-blue-light" />
        <p className="text-sm font-semibold text-text-secondary">Loading reports data registry...</p>
      </div>
    );
  }

  // ==================== VIEW 1: DETAILED CLINICAL REPORT ====================
  if (id && report) {
    const alertStyles = {
      high: "bg-red-500/5 border-red-500/15 text-severity-high",
      critical: "bg-red-500/5 border-red-500/15 text-severity-high",
      moderate: "bg-severity-moderate/5 border-severity-moderate/15 text-severity-moderate",
      low: "bg-severity-low/5 border-severity-low/15 text-severity-low",
      none: "bg-severity-safe/5 border-severity-safe/15 text-severity-safe",
      default: "bg-slate-100 border-slate-200 text-text-secondary",
    }[report.severity] || "bg-slate-100 border-slate-200 text-text-secondary";

    return (
      <div className="space-y-8 max-w-4xl">
        {/* Detail page toolbar header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden animate-fade-in">
          <div className="space-y-1">
            <Link href="/dashboard/report" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary font-bold transition">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Clinical Reports Registry
            </Link>
            <DashboardHeader
              title={report.title}
              description="Official clinical document containing AI assessment notes."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center shrink-0">
            <Button onClick={handlePrint} variant="secondary" className="px-4 py-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>

            <Button onClick={handleDownload} variant="secondary" className="px-4 py-2">
              <Download className="h-4 w-4" />
              PDF
            </Button>

            <Button onClick={() => handleDelete(report.id, true)} variant="danger" className="px-4 py-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {report.isMock && (
          <div className="rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4 text-xs font-semibold text-primary-blue-light flex items-center gap-2 print:hidden">
            <ShieldAlert className="h-4.5 w-4.5 text-primary-blue shrink-0" />
            <span>Showing local sandbox report. Connect to backend to save and load live cloud reports.</span>
          </div>
        )}

        {/* Clinical sheet content */}
        <Card className="border border-border-app bg-card-app p-8 md:p-12 shadow-xl shadow-slate-100/50 dark:border-slate-800 dark:shadow-none print:border-none print:shadow-none print:p-0 space-y-8 transition-colors">
          
          {/* Report header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border-app dark:border-slate-850 pb-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary-blue p-2.5 text-white">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-text-primary">Clinical Safety Report</h2>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Drug Checker AI System</p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Document Identifier</p>
              <p className="text-sm font-bold text-text-primary">
                {report.isMock ? `REP-SANDBOX-${report.id.toString().toUpperCase()}` : `REP-LIVE-${report.id}`}
              </p>
              <p className="flex sm:justify-end items-center gap-1 text-xs font-medium text-text-muted">
                <Calendar className="h-3.5 w-3.5" />
                Created: {report.dateStr}
              </p>
            </div>
          </div>

          {/* Title and Notes */}
          <div className="grid gap-6 sm:grid-cols-3 border-b border-border-app dark:border-slate-850 pb-6">
            <div className="sm:col-span-1 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Report Title</span>
              <p className="text-sm font-extrabold text-text-primary">{report.title}</p>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Practitioner Notes / Observations</span>
              <p className="text-xs font-semibold leading-relaxed text-text-secondary italic">
                {report.notes ? `"${report.notes}"` : "No specific notes recorded for this document."}
              </p>
            </div>
          </div>

          {/* Combination detail */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-app/50 p-6 border border-border-app dark:border-slate-800 rounded-3xl">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Assessed Medication Combo</p>
              <h3 className="mt-1 text-xl md:text-2xl font-extrabold text-text-primary">
                {report.drugs.join(" + ")}
              </h3>
            </div>
            <Badge variant={report.severity}>{severityLabels[report.severity] || "Clinical Assessed"}</Badge>
          </div>

          {/* Metrics */}
          {report.safetySummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="border border-border-app p-4 rounded-2xl dark:border-slate-850 bg-slate-50/10 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Medications Checked</span>
                <span className="text-lg font-extrabold text-text-primary block mt-1">{report.safetySummary.totalSelectedDrugs}</span>
              </div>
              <div className="border border-border-app p-4 rounded-2xl dark:border-slate-850 bg-slate-50/10 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Pairs Evaluated</span>
                <span className="text-lg font-extrabold text-text-primary block mt-1">{report.safetySummary.totalPairsChecked}</span>
              </div>
              <div className="border border-border-app p-4 rounded-2xl dark:border-slate-850 bg-slate-50/10 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Interactions Found</span>
                <span className={`text-lg font-extrabold block mt-1 ${report.safetySummary.verifiedInteractions > 0 ? "text-severity-high" : "text-medical-green"}`}>{report.safetySummary.verifiedInteractions}</span>
              </div>
              <div className="border border-border-app p-4 rounded-2xl dark:border-slate-850 bg-slate-50/10 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Duplicate Therapies</span>
                <span className={`text-lg font-extrabold block mt-1 ${report.safetySummary.duplicateTherapies > 0 ? "text-severity-moderate" : "text-text-primary"}`}>{report.safetySummary.duplicateTherapies}</span>
              </div>
            </div>
          )}

          {/* Guidance Alert Banner */}
          <div className={`rounded-3xl border p-6 ${alertStyles}`}>
            <div className="flex gap-3">
              <ShieldAlert className="h-5.5 w-5.5 mt-0.5 shrink-0" />
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider mb-1">Clinical Safety Alert Summary</h5>
                <p className="text-sm font-semibold leading-relaxed">
                  {report.summary}
                </p>
              </div>
            </div>
          </div>

          {/* AI Clinical Safety Analysis */}
          <div className="space-y-4 border-t border-border-app dark:border-slate-850 pt-6">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary-blue dark:text-primary-blue-light" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">AI Clinical safety analysis</h4>
            </div>
            <div className="text-sm leading-relaxed text-text-secondary bg-surface-app/30 p-6 border border-border-app dark:border-slate-800 rounded-2xl">
              {renderSummaryMarkdown(report.explanation)}
            </div>
          </div>

          {/* Pairwise detail list */}
          {report.interactions && report.interactions.length > 0 && (
            <div className="space-y-4 border-t border-border-app dark:border-slate-850 pt-6">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary-blue dark:text-primary-blue-light" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Pairwise Interaction Breakdown Details</h4>
              </div>
              
              <div className="space-y-4">
                {report.interactions.map((pair, idx) => {
                  const pairKey = `pair-${idx}`;
                  const isExpanded = !!expandedPairs[pairKey];

                  return (
                    <div 
                      key={pairKey} 
                      className="border border-border-app bg-slate-50/10 dark:border-slate-800/80 rounded-2xl overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleExpand(pairKey)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/30 dark:hover:bg-slate-850/20 text-left transition select-none print:pointer-events-none cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-primary-blue shrink-0" />
                          <span className="text-sm font-extrabold text-text-primary dark:text-white">
                            {pair.drugA.name} + {pair.drugB.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={pair.severity.toLowerCase() === "safe" ? "none" : pair.severity.toLowerCase() as any}>
                            {pair.severity}
                          </Badge>
                          <span className="print:hidden">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-text-muted" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-text-muted" />
                            )}
                          </span>
                        </div>
                      </button>

                      {(isExpanded || typeof window === "undefined" /* expand all during print export */) && (
                        <div className="border-t border-border-app dark:border-slate-850 p-5 space-y-4 bg-slate-50/5">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Clinical Effect</span>
                              <p className="text-xs font-semibold text-text-secondary dark:text-slate-350">{pair.effect}</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Recommendation</span>
                              <p className="text-xs font-bold text-text-primary dark:text-white">{pair.recommendation}</p>
                            </div>
                          </div>

                          {pair.aiExplanation && (
                            <div className="space-y-1 pt-2 border-t border-border-app dark:border-slate-850/60">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Detailed Explanation</span>
                              <p className="text-xs font-semibold text-text-secondary dark:text-slate-400 bg-surface-app/40 border border-border-app dark:border-slate-850 p-3 rounded-xl">
                                {pair.aiExplanation}
                              </p>
                            </div>
                          )}

                          <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider text-right">
                            Source: {pair.source}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sign-off disclaimer */}
          <div className="border-t border-border-app dark:border-slate-850 pt-6 text-center text-[10px] font-semibold text-text-muted leading-relaxed max-w-2xl mx-auto">
            This clinical safety report is generated by Drug Checker AI for reference purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Consult a licensed clinician or pharmacist before starting or modifying any drug combinations.
          </div>
        </Card>
      </div>
    );
  }

  // ==================== VIEW 2: REPORTS REGISTRY LIST ====================
  return (
    <div className="space-y-8 max-w-5xl animate-fade-in">
      <DashboardHeader
        title="Clinical Reports Registry"
        description="Official interaction reports containing clinical notes for practitioner and patient reviews."
      />

      {isUsingMockList && (
        <div className="rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4 text-xs font-semibold text-primary-blue-light flex items-center gap-2">
          <Info className="h-4.5 w-4.5 text-primary-blue shrink-0" />
          <span>Showing local sandbox reports. Run interaction checks or browse Check History to generate official sheets.</span>
        </div>
      )}

      {reportsList.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {reportsList.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col justify-between border border-border-app bg-card-app dark:border-slate-800 hover:shadow-md transition-shadow duration-300"
              padding="md"
            >
              <div className="space-y-4">
                {/* Header title */}
                <div className="flex items-start justify-between gap-3 border-b border-border-app/50 dark:border-slate-850 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary-blue/5 p-2 text-primary-blue dark:bg-primary-blue/15 dark:text-primary-blue-light">
                      <FileText className="h-4 w-4" />
                    </div>
                    <h3 className="font-extrabold text-sm text-text-primary dark:text-white line-clamp-1">
                      {item.title}
                    </h3>
                  </div>
                  <Badge variant={item.severity}>
                    {severityLabels[item.severity] || "Log Details"}
                  </Badge>
                </div>

                {/* Drugs checked tags */}
                <div className="flex flex-wrap gap-1.5">
                  {item.drugs.map((drug, dIdx) => (
                    <span 
                      key={dIdx}
                      className="inline-block rounded-md border border-border-app bg-slate-50/50 px-2 py-0.5 text-[10px] font-bold text-text-secondary dark:border-slate-800 dark:bg-slate-900/30"
                    >
                      {drug}
                    </span>
                  ))}
                </div>

                {/* Notes italic box */}
                {item.notes && (
                  <p className="text-xs leading-relaxed text-text-secondary font-semibold italic bg-surface-app/40 border border-border-app/50 p-3 rounded-xl line-clamp-2">
                    "{item.notes}"
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-6 flex items-center justify-between border-t border-border-app/50 dark:border-slate-850 pt-4 text-xs font-bold text-text-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {item.dateStr.split(",")[0]}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg border border-border-app p-2 text-text-muted hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/25 transition cursor-pointer dark:border-slate-800"
                    title="Delete Clinical Report"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>

                  <Link
                    href={`/dashboard/report?id=${item.id}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-primary-blue/10 hover:bg-primary-blue hover:text-white text-primary-blue dark:bg-primary-blue/20 dark:text-primary-blue-light dark:hover:bg-primary-blue px-3 py-2 text-xs font-extrabold transition cursor-pointer"
                  >
                    View Sheet <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-20 border border-border-app bg-card-app dark:border-slate-800/80">
          <ClipboardList className="mx-auto h-12 w-12 text-text-muted opacity-40 mb-3" />
          <h4 className="text-sm font-extrabold text-text-primary dark:text-white">No Clinical Reports Generated</h4>
          <p className="text-xs text-text-muted max-w-sm mx-auto mt-1 leading-relaxed">
            You haven't generated any official clinical safety reports yet. Navigate to **Check History** or check a drug combination to prepare a report sheet.
          </p>
          <div className="mt-4">
            <Link href="/dashboard/history" className="inline-flex items-center gap-1 text-xs text-primary-blue font-bold hover:underline">
              Browse Check History <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary-blue dark:text-primary-blue-light" />
        <p className="text-sm font-semibold text-text-secondary">Loading reports data registry...</p>
      </div>
    }>
      <ReportContent />
    </Suspense>
  );
}
