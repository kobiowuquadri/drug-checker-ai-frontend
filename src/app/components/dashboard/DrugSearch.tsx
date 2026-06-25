"use client";

import { Search, Plus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Input from "@/app/components/ui/Input";
import { SelectedDrug } from "./DrugChecker";

interface DrugSearchProps {
  onSelect: (drug: SelectedDrug) => void;
  selectedDrugs: SelectedDrug[];
}

export default function DrugSearch({ onSelect, selectedDrugs }: DrugSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/drugs/search?q=${encodeURIComponent(query)}`);
        const json = await response.json();
        if (json.success && json.data?.drugs) {
          const selectedRxcuis = selectedDrugs.map((d) => d.rxcui);
          const filtered = json.data.drugs.filter(
            (drug: any) => !selectedRxcuis.includes(drug.rxcui)
          );
          setSuggestions(filtered);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error searching drugs:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, selectedDrugs]);

  return (
    <div className="relative">
      <div className="relative">
        {isLoading ? (
          <Loader2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-primary-blue dark:text-primary-blue-light" />
        ) : (
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        )}
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
            <li key={drug.rxcui}>
              <button
                type="button"
                onClick={() => {
                  onSelect({ rxcui: drug.rxcui, name: drug.name, synonym: drug.synonym });
                  setQuery("");
                }}
                className="flex w-full items-center justify-between px-5 py-3 text-left text-sm font-semibold text-text-secondary transition hover:bg-primary-blue/10 hover:text-primary-blue dark:hover:bg-primary-blue/20 dark:hover:text-primary-blue-light cursor-pointer"
              >
                <div className="pr-4">
                  <span className="block text-text-primary font-bold truncate max-w-md">{drug.name}</span>
                  {drug.synonym && (
                    <span className="block text-xs text-text-muted mt-0.5 truncate max-w-md">{drug.synonym}</span>
                  )}
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-primary-blue/10 px-2.5 py-1 text-[10px] font-bold text-primary-blue dark:bg-primary-blue/20 dark:text-primary-blue-light shrink-0">
                  <Plus className="h-3 w-3" /> Add
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {query && !isLoading && suggestions.length === 0 && (
        <div className="absolute z-10 mt-2 w-full rounded-xl border border-border-app bg-card-app p-4 text-center text-sm text-text-secondary shadow-xl dark:border-slate-800">
          No matching medications found for "<span className="font-semibold text-text-primary">{query}</span>".
        </div>
      )}
    </div>
  );
}
