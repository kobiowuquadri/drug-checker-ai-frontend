"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Brain,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { getMockInteraction, searchDrugs, MOCK_DRUGS, InteractionResult } from "@/lib/mock-data";

const PRESETS = [
  { label: "Warfarin + Ibuprofen", drugs: ["Warfarin", "Ibuprofen"] },
  { label: "Aspirin + Omeprazole", drugs: ["Aspirin", "Omeprazole"] },
  { label: "Lisinopril + Metformin", drugs: ["Lisinopril", "Metformin"] },
];

const Hero = () => {
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [result, setResult] = useState<InteractionResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Search logic
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) {
      const filtered = MOCK_DRUGS.filter(
        (d) =>
          d.toLowerCase().includes(val.toLowerCase()) &&
          !selectedDrugs.includes(d)
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddDrug = (drug: string) => {
    if (selectedDrugs.length >= 4) return;
    if (!selectedDrugs.includes(drug)) {
      setSelectedDrugs([...selectedDrugs, drug]);
      setResult(null);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveDrug = (drug: string) => {
    setSelectedDrugs(selectedDrugs.filter((d) => d !== drug));
    setResult(null);
  };

  const handleCheck = async () => {
    if (selectedDrugs.length < 2) return;
    setIsChecking(true);
    setResult(null);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const interaction = getMockInteraction(selectedDrugs);
    setResult(interaction);
    setIsChecking(false);
  };

  const handleApplyPreset = (drugs: string[]) => {
    setSelectedDrugs(drugs);
    setResult(null);
  };

  const handleReset = () => {
    setSelectedDrugs([]);
    setResult(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Helper for severity style
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "high":
        return {
          bg: "bg-red-500/10 border-red-500/20 text-red-500",
          badge: "bg-red-500 text-white",
          accent: "border-red-500/30",
          icon: AlertTriangle,
        };
      case "moderate":
        return {
          bg: "bg-amber-500/10 border-amber-500/20 text-amber-600",
          badge: "bg-amber-500 text-white",
          accent: "border-amber-500/30",
          icon: ShieldAlert,
        };
      case "low":
        return {
          bg: "bg-blue-500/10 border-blue-500/20 text-blue-600",
          badge: "bg-blue-500 text-white",
          accent: "border-blue-500/30",
          icon: ShieldCheck,
        };
      default:
        return {
          bg: "bg-slate-500/10 border-slate-500/20 text-slate-600",
          badge: "bg-slate-500 text-white",
          accent: "border-slate-500/30",
          icon: ShieldCheck,
        };
    }
  };

  const severityInfo = result ? getSeverityStyles(result.severity) : null;
  const ResultIcon = severityInfo ? severityInfo.icon : ShieldCheck;

  return (
    <section className="relative overflow-hidden bg-mesh-pattern py-20 lg:py-32">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] -z-10 h-[50vw] w-[50vw] animate-pulse-slow rounded-full bg-emerald-400/10 blur-[100px]" />
      <div className="absolute right-[-10%] top-[20%] -z-10 h-[40vw] w-[40vw] animate-pulse-slow rounded-full bg-teal-400/10 blur-[120px]" />

      <div className="relative mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-12 lg:items-center">
        {/* Left Content */}
        <div className="lg:col-span-7">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/5 px-4 py-2 text-emerald-700 shadow-sm">
            <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              AI-Powered Medication Safety
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Make Every Medication
            <span className="block mt-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
              Decision Safer.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Identify dangerous drug-to-drug interactions instantly. Get plain-language analysis and clear guidance powered by advanced clinical AI data.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="group flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-emerald-600/30"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              href="#features"
              className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-8 py-4 font-semibold text-slate-700 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
            >
              Learn More
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-slate-100 pt-8 max-w-lg">
            <div>
              <p className="text-2xl font-bold text-slate-900">10K+</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Checks Daily</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">99.8%</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">AI Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">100%</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Secure & Private</p>
            </div>
          </div>
        </div>

        {/* Right Interactive Demo Widget */}
        <div className="lg:col-span-5">
          <div className="relative animate-float rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-md">
            {/* Widget top header */}
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Interactive Demo</h3>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Try it now</p>
                </div>
              </div>
              
              {(selectedDrugs.length > 0 || result) && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600 transition"
                >
                  <RefreshCw className="h-3 w-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Quick Presets */}
            {selectedDrugs.length === 0 && !result && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-slate-500 mb-2">Select a combination:</p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleApplyPreset(preset.drugs)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-emerald-500 hover:bg-emerald-500/5 transition duration-200 cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search/Input area */}
            {!result && (
              <div className="relative mb-4">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={
                    selectedDrugs.length >= 4
                      ? "Limit reached (4 drugs max)"
                      : "Search mock drugs (e.g. Warfarin, Aspirin)..."
                  }
                  disabled={selectedDrugs.length >= 4 || isChecking}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-9 pr-4 text-sm outline-none transition duration-200 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
                />

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                    {searchResults.map((drug) => (
                      <button
                        key={drug}
                        onClick={() => handleAddDrug(drug)}
                        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <span>{drug}</span>
                        <Plus className="h-4 w-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Selected Drug Tags */}
            {!result && selectedDrugs.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-slate-500 mb-2">Medication List ({selectedDrugs.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDrugs.map((drug) => (
                    <span
                      key={drug}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200/50 animate-fade-in"
                    >
                      {drug}
                      <button
                        onClick={() => handleRemoveDrug(drug)}
                        className="rounded-full p-0.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA to Check Interactions */}
            {!result && (
              <button
                onClick={handleCheck}
                disabled={selectedDrugs.length < 2 || isChecking}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 px-4 font-semibold text-white shadow-lg transition duration-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing safety data...
                  </>
                ) : (
                  <>
                    Run Interaction Check
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}

            {/* Result display */}
            {result && severityInfo && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Interaction Analysis</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${severityInfo.badge}`}>
                    {result.severity} risk
                  </span>
                </div>

                <div className={`rounded-2xl border p-4 ${severityInfo.bg}`}>
                  <div className="flex items-start gap-2.5">
                    <ResultIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{result.summary}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">{result.explanation}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Clinical Guidance</h5>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-3">
                    {result.recommendation}
                  </p>
                </div>

                <button
                  onClick={handleReset}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Check another combination
                </button>
              </div>
            )}

            {/* Small disclaimer footer */}
            <p className="mt-4 text-center text-[9px] leading-relaxed text-slate-400">
              Demo includes standard combinations. Always check full clinical details inside. Not professional advice.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;