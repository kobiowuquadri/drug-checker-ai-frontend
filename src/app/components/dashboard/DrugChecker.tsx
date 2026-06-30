"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Pill, Loader2, Info } from "lucide-react";
import CheckInteractionDrugs from "@/app/components/dashboard/CheckInteractionDrugs";
import DashboardHeader from "@/app/components/dashboard/DashboardHeader";
import Disclaimer from "@/app/components/dashboard/Disclaimer";
import DrugSearch from "@/app/components/dashboard/DrugSearch";
import EmptyState from "@/app/components/dashboard/EmptyState";
import SelectedDrugs from "@/app/components/dashboard/SelectedDrugs";
import { getAuthHeaders } from "@/app/components/auth/AuthContext";
import { BackendInteractionResponse } from "@/lib/api-types";
import DrugScanner from "@/app/components/dashboard/DrugScanner";

export interface SelectedDrug {
  rxcui: string;
  name: string;
  synonym?: string;
}

interface TtyFormat {
  label: string;
  badgeClass: string;
  description: string;
}

function formatTermType(tty: string): TtyFormat {
  switch ((tty || "").toUpperCase()) {
    case "SBD":
      return {
        label: "Semantic Branded Drug",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50",
        description: "A branded drug product name that includes the brand name, active ingredients, strength, and dose form (e.g. Duexis)."
      };
    case "SCD":
      return {
        label: "Semantic Clinical Drug",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50",
        description: "A generic clinical drug product name that includes the active ingredients, strength, and dose form."
      };
    case "DF":
      return {
        label: "Dose Form",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50",
        description: "The physical form in which the drug is administered (e.g. Oral Tablet, Injection, Topical Gel)."
      };
    case "IN":
      return {
        label: "Active Ingredient",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50",
        description: "The primary active chemical compound responsible for the drug's therapeutic and pharmacological effect."
      };
    case "PIN":
      return {
        label: "Precise Ingredient",
        badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200/60 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900/50",
        description: "The specific salt, ester, or precise chemical variant of the active ingredient."
      };
    case "BPCK":
      return {
        label: "Branded Package",
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/50",
        description: "A branded drug product configured in a specific manufacturer packaging or retail kit."
      };
    case "GPCK":
      return {
        label: "Generic Package",
        badgeClass: "bg-teal-50 text-teal-700 border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900/50",
        description: "A generic drug product configured in a specific packaging or retail kit."
      };
    default:
      return {
        label: tty || "Unknown Type",
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        description: "The classification of this entry in the standard RxNorm drug database."
      };
  }
}

export default function DrugChecker() {
  const [selectedDrugs, setSelectedDrugs] = useState<SelectedDrug[]>([]);
  const [result, setResult] = useState<BackendInteractionResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // States for medication details modal
  const [activeDetailsDrug, setActiveDetailsDrug] = useState<SelectedDrug | null>(null);
  const [detailsData, setDetailsData] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Fetch drug details when activeDetailsDrug changes
  useEffect(() => {
    if (!activeDetailsDrug) {
      setDetailsData(null);
      return;
    }

    const drug = activeDetailsDrug;

    async function fetchDetails() {
      setIsLoadingDetails(true);
      try {
        const response = await fetch(`/drugs/${drug.rxcui}`);
        const json = await response.json();
        if (json.success && json.data) {
          setDetailsData(json.data);
        } else {
          toast.error("Failed to load drug details");
        }
      } catch (error) {
        console.error("Error fetching drug details:", error);
        toast.error("Error loading drug details");
      } finally {
        setIsLoadingDetails(false);
      }
    }

    fetchDetails();
  }, [activeDetailsDrug]);

  function handleSelect(drug: SelectedDrug) {
    setSelectedDrugs((current) => [...current, drug]);
    setResult(null);
  }

  function handleRemove(rxcui: string) {
    setSelectedDrugs((current) => current.filter((item) => item.rxcui !== rxcui));
    setResult(null);
  }

  function handleAddScannedDrugs(drugs: SelectedDrug[]) {
    setSelectedDrugs((current) => {
      const currentRxcuis = current.map((d) => d.rxcui);
      const filteredNew = drugs.filter((d) => !currentRxcuis.includes(d.rxcui));
      return [...current, ...filteredNew];
    });
    setResult(null);
  }

  async function handleCheck() {
    setIsChecking(true);
    setResult(null);

    try {
      const response = await fetch("/interactions/check", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          drugs: selectedDrugs.map((d) => ({
            rxcui: d.rxcui,
            name: d.name,
          })),
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setResult(json.data);
        toast.success("Interaction check complete");
      } else {
        toast.error(json.message || "Failed to check interactions");
      }
    } catch (error) {
      console.error("Error checking interactions:", error);
      toast.error("An error occurred while running the interaction check");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Drug Interaction Checker"
        description="Search medications, build your list, and check for potential interactions."
      />

      <Disclaimer />

      <DrugSearch
        onSelect={handleSelect}
        selectedDrugs={selectedDrugs}
        onScanClick={() => setIsScannerOpen(true)}
      />

      {selectedDrugs.length > 0 ? (
        <SelectedDrugs
          drugs={selectedDrugs}
          onRemove={handleRemove}
          onShowDetails={setActiveDetailsDrug}
        />
      ) : (
        <EmptyState />
      )}

      <CheckInteractionDrugs
        drugs={selectedDrugs.map((d) => d.name)}
        result={result}
        isChecking={isChecking}
        onCheck={handleCheck}
      />

      {/* Medication Details Modal */}
      {activeDetailsDrug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border-app bg-card-app p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900/95 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-app pb-4 dark:border-slate-850">
              <div className="flex items-center gap-2 text-primary-blue dark:text-primary-blue-light">
                <Pill className="h-5 w-5 animate-pulse" />
                <h3 className="text-base font-extrabold text-text-primary dark:text-white">
                  Medication Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveDetailsDrug(null)}
                className="rounded-xl border border-border-app p-2 text-text-muted hover:bg-surface-app hover:text-text-primary transition cursor-pointer dark:border-slate-800 dark:hover:bg-slate-800"
                aria-label="Close details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 space-y-4">
              {isLoadingDetails ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-blue dark:text-primary-blue-light" />
                  <p className="text-sm font-semibold text-text-secondary">Loading drug details...</p>
                </div>
              ) : detailsData ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Official RXNorm Name
                    </span>
                    <h4 className="mt-1 text-sm font-extrabold text-text-primary dark:text-white leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-border-app dark:border-slate-800">
                      {detailsData.name}
                    </h4>
                  </div>

                  {detailsData.synonym && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        Synonym / Brand Name
                      </span>
                      <p className="mt-1 text-sm font-semibold text-text-secondary dark:text-slate-350">
                        {detailsData.synonym}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 border-t border-border-app pt-4 dark:border-slate-850">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        RxCUI Identifier
                      </span>
                      <p className="mt-1 text-sm font-extrabold text-primary-blue dark:text-primary-blue-light">
                        {detailsData.rxcui}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        Language
                      </span>
                      <p className="mt-1 text-sm font-semibold text-text-secondary dark:text-slate-300">
                        {detailsData.language || "ENG"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border-app pt-4 dark:border-slate-850">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Term Type (TTY) Classification
                    </span>
                    {(() => {
                      const ttyInfo = formatTermType(detailsData.tty);
                      return (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-extrabold border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350">
                              {detailsData.tty}
                            </span>
                            <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-extrabold ${ttyInfo.badgeClass}`}>
                              {ttyInfo.label}
                            </span>
                          </div>
                          <p className="text-xs font-semibold leading-relaxed text-text-secondary dark:text-slate-400">
                            {ttyInfo.description}
                          </p>
                        </div>
                      );
                    })()}
                  </div>

                  {detailsData.umlscui && (
                    <div className="border-t border-border-app pt-4 dark:border-slate-850">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        UMLS CUI
                      </span>
                      <p className="mt-1 text-sm font-semibold text-text-secondary">
                        {detailsData.umlscui}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-text-muted">
                  No detail information found.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end border-t border-border-app pt-4 dark:border-slate-850">
              <button
                type="button"
                onClick={() => setActiveDetailsDrug(null)}
                className="rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 px-6 py-2.5 text-sm font-bold transition duration-200 cursor-pointer"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Medication Scanner Modal */}
      <DrugScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAddDrugs={handleAddScannedDrugs}
      />

    </div>
  );
}
