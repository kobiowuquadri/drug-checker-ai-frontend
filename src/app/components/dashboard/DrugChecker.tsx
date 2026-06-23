"use client";

import { useState } from "react";
import { toast } from "sonner";
import CheckInteractionDrugs from "@/app/components/dashboard/CheckInteractionDrugs";
import DashboardHeader from "@/app/components/dashboard/DashboardHeader";
import Disclaimer from "@/app/components/dashboard/Disclaimer";
import DrugSearch from "@/app/components/dashboard/DrugSearch";
import EmptyState from "@/app/components/dashboard/EmptyState";
import SelectedDrugs from "@/app/components/dashboard/SelectedDrugs";
import { getMockInteraction, InteractionResult } from "@/lib/mock-data";

export default function DrugChecker() {
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [result, setResult] = useState<InteractionResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  function handleSelect(drug: string) {
    setSelectedDrugs((current) => [...current, drug]);
    setResult(null);
  }

  function handleRemove(drug: string) {
    setSelectedDrugs((current) => current.filter((item) => item !== drug));
    setResult(null);
  }

  async function handleCheck() {
    setIsChecking(true);
    setResult(null);

    await new Promise((resolve) => setTimeout(resolve, 900));

    const interaction = getMockInteraction(selectedDrugs);
    setResult(interaction);
    setIsChecking(false);
    toast.success("Interaction check complete");
  }

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Drug Interaction Checker"
        description="Search medications, build your list, and check for potential interactions."
      />

      <Disclaimer />

      <DrugSearch onSelect={handleSelect} selectedDrugs={selectedDrugs} />

      {selectedDrugs.length > 0 ? (
        <SelectedDrugs drugs={selectedDrugs} onRemove={handleRemove} />
      ) : (
        <EmptyState />
      )}

      <CheckInteractionDrugs
        drugs={selectedDrugs}
        result={result}
        isChecking={isChecking}
        onCheck={handleCheck}
      />
    </div>
  );
}
