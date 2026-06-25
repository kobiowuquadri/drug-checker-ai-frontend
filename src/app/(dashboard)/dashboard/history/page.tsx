"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/app/components/dashboard/DashboardHeader";
import Badge from "@/app/components/ui/Badge";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import { MOCK_HISTORY } from "@/lib/mock-data";
import { getAuthHeaders } from "@/app/components/auth/AuthContext";
import { Clock, Calendar, ChevronRight, Loader2, Info, Trash2, ClipboardList, FileText, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface NormalizedHistoryItem {
  id: string | number;
  drugs: string[];
  severity: "critical" | "high" | "moderate" | "low" | "none" | "default";
  summary: string;
  explanation: string;
  dateStr: string;
  isMock: boolean;
}

const severityLabels = {
  critical: "Critical Risk",
  high: "High Risk",
  moderate: "Moderate Risk",
  low: "Low Risk",
  none: "Clinical Safe",
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

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<NormalizedHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMock, setIsUsingMock] = useState(false);

  // Modal States
  const [activeHistoryItem, setActiveHistoryItem] = useState<NormalizedHistoryItem | null>(null);
  const [reportTitle, setReportTitle] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    if (activeHistoryItem) {
      setReportTitle(`Interaction Report: ${activeHistoryItem.drugs.join(" + ")}`);
    }
  }, [activeHistoryItem]);

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      try {
        const response = await fetch("/history", {
          headers: getAuthHeaders(),
        });
        const json = await response.json();
        
        if (json.success && json.data && json.data.length > 0) {
          const normalized = json.data.map((item: any) => {
            const drugNames = item.selectedDrugs?.map((d: any) => typeof d === 'string' ? d : (d.name || "")) || [];
            const rawSeverity = item.safetySummary?.highestSeverity || item.severity || "NONE";
            const severityLower = rawSeverity.toLowerCase();
            
            return {
              id: item.id,
              drugs: drugNames,
              severity: (severityLower === "safe" ? "none" : severityLower) as any,
              summary: item.safetySummary?.actionMessage || item.summary || "Interaction assessment completed.",
              explanation: item.aiSummary || item.explanation || "",
              dateStr: formatDate(item.createdAt),
              isMock: false,
            };
          });
          
          // Sort by ID descending (latest first)
          normalized.sort((a: any, b: any) => Number(b.id) - Number(a.id));
          setItems(normalized);
          setIsUsingMock(false);
        } else {
          useFallback();
        }
      } catch (error) {
        console.error("Error fetching interaction history:", error);
        useFallback();
      } finally {
        setIsLoading(false);
      }
    }

    function useFallback() {
      const normalizedMock: NormalizedHistoryItem[] = MOCK_HISTORY.map((item, index) => ({
        id: `mock-${index}`,
        drugs: item.drugs,
        severity: item.severity.toLowerCase() as any,
        summary: item.summary,
        explanation: item.explanation,
        dateStr: "June 15, 2026",
        isMock: true,
      }));
      setItems(normalizedMock);
      setIsUsingMock(true);
    }

    fetchHistory();
  }, []);

  async function handleDelete(id: string | number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    // If it's a mock item, just remove it from local state
    if (String(id).startsWith("mock-")) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Sandbox interaction log removed.");
      return;
    }

    if (!confirm("Are you sure you want to delete this interaction log? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/history/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      
      const json = await response.json();
      if (json.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        toast.success("Interaction log deleted successfully.");
      } else {
        toast.error(json.message || "Failed to delete log");
      }
    } catch (error) {
      console.error("Error deleting log:", error);
      toast.error("An error occurred while deleting the log.");
    }
  }

  async function handleGenerateReport(e: React.FormEvent) {
    e.preventDefault();
    if (!activeHistoryItem) return;

    if (activeHistoryItem.isMock) {
      toast.success("Clinical Report generated successfully (Sandbox Mode)!");
      setShowGenerateModal(false);
      setReportNotes("");
      router.push(`/dashboard/report?id=${activeHistoryItem.id}`);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/reports/generate", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          historyId: activeHistoryItem.id,
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

  return (
    <div className="space-y-8 max-w-5xl">
      <DashboardHeader
        title="Interaction History Logs"
        description="Review previous safety assessments generated by our clinical AI model."
      />

      {isUsingMock && (
        <div className="rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4 text-xs font-semibold text-primary-blue-light flex items-center gap-2">
          <Info className="h-4.5 w-4.5 text-primary-blue shrink-0" />
          <span>Showing local sandbox history logs. Run a new interaction check while signed in to save logs to the cloud.</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary-blue dark:text-primary-blue-light" />
          <p className="text-sm font-semibold text-text-secondary">Loading history logs...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card
              key={item.id}
              className="group border-border-app bg-card-app dark:border-slate-800"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      <Clock className="h-3.5 w-3.5" />
                      Log #{item.isMock ? items.length - index : item.id}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      <Calendar className="h-3.5 w-3.5" />
                      {item.dateStr}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-extrabold text-text-primary group-hover:text-primary-blue-light transition duration-200">
                      {item.drugs.join(" + ")}
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary font-semibold">{item.summary}</p>
                    {item.explanation && (
                      <p className="mt-1.5 text-xs text-text-muted leading-relaxed max-w-2xl truncate">
                        {item.explanation.replace(/[*#]/g, "")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 self-start sm:self-center shrink-0">
                  <Badge variant={item.severity}>
                    {severityLabels[item.severity] || "Log Details"}
                  </Badge>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setActiveHistoryItem(item);
                      setShowGenerateModal(true);
                    }}
                    className="rounded-lg p-2 text-text-muted hover:bg-primary-blue/10 hover:text-primary-blue transition dark:hover:bg-primary-blue/20 cursor-pointer"
                    title="Generate Clinical Report"
                  >
                    <ClipboardList className="h-4.5 w-4.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="rounded-lg p-2 text-text-muted hover:bg-red-500/10 hover:text-red-500 transition dark:hover:bg-red-950/30 cursor-pointer"
                    title="Delete interaction log"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16 border-border-app bg-card-app dark:border-slate-800/80">
          <p className="text-sm font-semibold text-text-secondary">No history logs found.</p>
          <Link href="/dashboard" className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary-blue font-bold hover:underline">
            Go run a safety check
          </Link>
        </Card>
      )}

      {/* Report Generation Modal */}
      {showGenerateModal && activeHistoryItem && (
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
