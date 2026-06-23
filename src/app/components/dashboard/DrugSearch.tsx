"use client";

import { Search, Plus } from "lucide-react";
import { useState } from "react";
import Input from "@/app/components/ui/Input";
import { searchDrugs } from "@/lib/mock-data";

interface DrugSearchProps {
  onSelect: (drug: string) => void;
  selectedDrugs: string[];
}

export default function DrugSearch({ onSelect, selectedDrugs }: DrugSearchProps) {
  const [query, setQuery] = useState("");
  const suggestions = searchDrugs(query).filter(
    (drug) => !selectedDrugs.includes(drug),
  );

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search for a medication (e.g. Warfarin, Ibuprofen, Metformin)..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-12 border-border-app focus:border-primary-blue bg-bg-app text-text-primary dark:bg-slate-900/50 dark:border-slate-800 dark:focus:border-primary-blue-light"
        />
      </div>

      {query && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-border-app bg-card-app shadow-xl max-h-60 overflow-y-auto dark:border-slate-800">
          {suggestions.map((drug) => (
            <li key={drug}>
              <button
                type="button"
                onClick={() => {
                  onSelect(drug);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between px-5 py-3 text-left text-sm font-semibold text-text-secondary transition hover:bg-primary-blue/10 hover:text-primary-blue dark:hover:bg-primary-blue/20 dark:hover:text-primary-blue-light cursor-pointer"
              >
                <span>{drug}</span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-primary-blue/10 px-2 py-1 text-[10px] font-bold text-primary-blue dark:bg-primary-blue/20 dark:text-primary-blue-light">
                  <Plus className="h-3 w-3" /> Add
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {query && suggestions.length === 0 && (
        <div className="absolute z-10 mt-2 w-full rounded-xl border border-border-app bg-card-app p-4 text-center text-sm text-text-secondary shadow-xl dark:border-slate-800">
          No matching demo medications found. Try typing <span className="font-semibold text-text-primary">Warfarin</span> or <span className="font-semibold text-text-primary">Ibuprofen</span>.
        </div>
      )}
    </div>
  );
}
