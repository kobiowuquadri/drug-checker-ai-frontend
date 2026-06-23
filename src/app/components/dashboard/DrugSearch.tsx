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
          className="pl-12 border-slate-200/80 focus:border-emerald-500 bg-white"
        />
      </div>

      {query && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((drug) => (
            <li key={drug}>
              <button
                type="button"
                onClick={() => {
                  onSelect(drug);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between px-5 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
              >
                <span>{drug}</span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                  <Plus className="h-3 w-3" /> Add
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {query && suggestions.length === 0 && (
        <div className="absolute z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white p-4 text-center text-sm text-slate-500 shadow-xl">
          No matching demo medications found. Try typing <span className="font-semibold text-slate-700">Warfarin</span> or <span className="font-semibold text-slate-700">Ibuprofen</span>.
        </div>
      )}
    </div>
  );
}
