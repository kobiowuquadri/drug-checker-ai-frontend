"use client";

import { Download, FileText, Calendar, Printer, ShieldAlert, Award } from "lucide-react";
import { toast } from "sonner";
import DashboardHeader from "@/app/components/dashboard/DashboardHeader";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import { MOCK_HISTORY } from "@/lib/mock-data";

export default function ReportPage() {
  const report = MOCK_HISTORY[0];

  function handleDownload() {
    toast.info("PDF export will be available when backend integration is connected. You can print this page in the meantime.");
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <DashboardHeader
          title="Clinical Safety Report"
          description="Official interaction summary sheet to present to your doctor."
        />

        <div className="flex items-center gap-2.5">
          <Button onClick={handlePrint} variant="secondary" className="px-4 py-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>

          <Button onClick={handleDownload} className="px-4 py-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Clinical style sheet container */}
      <Card className="border border-slate-200 bg-white p-8 md:p-12 shadow-xl shadow-slate-100/50 print:border-none print:shadow-none space-y-8">
        {/* Report metadata heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-600 p-2.5 text-white">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Drug Checker AI</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinical Safety Registry</p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Report Identifier</p>
            <p className="text-sm font-bold text-slate-800">REP-2026-9801</p>
            <p className="flex sm:justify-end items-center gap-1 text-xs font-medium text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              Generated: June 15, 2026
            </p>
          </div>
        </div>

        {/* Drug Combination block */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 p-6 border border-slate-100 rounded-3xl">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assessed Medication Pair</p>
            <h3 className="mt-1 text-2xl font-extrabold text-slate-800">
              {report.drugs.join(" + ")}
            </h3>
          </div>
          <Badge variant={report.severity}>{report.severity} severity</Badge>
        </div>

        {/* Main Details Grid */}
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Assessment Summary</h4>
            <p className="text-sm font-bold text-slate-800 leading-relaxed">{report.summary}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Clinical Data Integrity</h4>
            <p className="text-sm font-semibold text-slate-600 flex items-center gap-1.5 leading-relaxed">
              <Award className="h-4.5 w-4.5 text-emerald-600" />
              Validated against standard FDA & WHO databases.
            </p>
          </div>
        </div>

        {/* AI Medical Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Medical Explanation</h4>
          <p className="text-sm leading-relaxed text-slate-600 bg-slate-50/30 p-6 border border-slate-100 rounded-2xl">
            {report.explanation}
          </p>
        </div>

        {/* Official clinical suggestion box */}
        <div
          className={`rounded-2xl border p-6 ${
            report.severity === "high"
              ? "bg-red-500/5 border-red-500/15 text-red-700"
              : report.severity === "moderate"
                ? "bg-amber-500/5 border-amber-500/15 text-amber-700"
                : "bg-blue-500/5 border-blue-500/15 text-blue-700"
          }`}
        >
          <div className="flex gap-3">
            <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider mb-1">Clinical Guidance & Instruction</h5>
              <p className="text-sm font-semibold leading-relaxed">
                {report.recommendation}
              </p>
            </div>
          </div>
        </div>

        {/* Sign-off disclaimer */}
        <div className="border-t border-slate-100 pt-6 text-center text-[10px] font-semibold text-slate-400 leading-relaxed max-w-2xl mx-auto">
          This document is generated by Drug Checker AI for reference purposes only. It does not replace personal physician consultations. Report generated on behalf of registered user.
        </div>
      </Card>
    </div>
  );
}
