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
      <Card className="border border-border-app bg-card-app p-8 md:p-12 shadow-xl shadow-slate-100/50 dark:border-slate-800 dark:shadow-none print:border-none print:shadow-none space-y-8 transition-colors">
        {/* Report metadata heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border-app dark:border-slate-850 pb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary-blue p-2.5 text-white">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-text-primary">Drug Checker AI</h2>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Clinical Safety Registry</p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Report Identifier</p>
            <p className="text-sm font-bold text-text-primary">REP-2026-9801</p>
            <p className="flex sm:justify-end items-center gap-1 text-xs font-medium text-text-muted">
              <Calendar className="h-3.5 w-3.5" />
              Generated: June 15, 2026
            </p>
          </div>
        </div>

        {/* Drug Combination block */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-app/50 p-6 border border-border-app dark:border-slate-800 rounded-3xl">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Assessed Medication Pair</p>
            <h3 className="mt-1 text-2xl font-extrabold text-text-primary">
              {report.drugs.join(" + ")}
            </h3>
          </div>
          <Badge variant={report.severity as any}>{report.severity} severity</Badge>
        </div>

        {/* Main Details Grid */}
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Assessment Summary</h4>
            <p className="text-sm font-bold text-text-primary leading-relaxed">{report.summary}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Clinical Data Integrity</h4>
            <p className="text-sm font-semibold text-text-secondary flex items-center gap-1.5 leading-relaxed">
              <Award className="h-4.5 w-4.5 text-primary-blue-light" />
              Validated against standard FDA & WHO databases.
            </p>
          </div>
        </div>

        {/* AI Medical Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">AI Medical Explanation</h4>
          <p className="text-sm leading-relaxed text-text-secondary bg-surface-app/30 p-6 border border-border-app dark:border-slate-800 rounded-2xl">
            {report.explanation}
          </p>
        </div>

        {/* Official clinical suggestion box */}
        <div
          className={`rounded-2xl border p-6 ${
            report.severity === "high"
              ? "bg-severity-high/5 border-severity-high/15 text-severity-high"
              : report.severity === "moderate"
                ? "bg-severity-moderate/5 border-severity-moderate/15 text-severity-moderate"
                : "bg-severity-low/5 border-severity-low/15 text-severity-low"
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
        <div className="border-t border-border-app dark:border-slate-850 pt-6 text-center text-[10px] font-semibold text-text-muted leading-relaxed max-w-2xl mx-auto">
          This document is generated by Drug Checker AI for reference purposes only. It does not replace personal physician consultations. Report generated on behalf of registered user.
        </div>
      </Card>
    </div>
  );
}
