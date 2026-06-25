export interface BackendDrug {
  rxcui: string;
  name: string;
  synonym?: string;
}

export interface BackendInteractionPair {
  drugA: BackendDrug;
  drugB: BackendDrug;
  severity: string; // "HIGH", "MODERATE", "LOW"
  effect: string;
  recommendation: string;
  source: string;
  aiExplanation: string;
}

export interface SeveritySummary {
  LOW: number;
  MODERATE: number;
  HIGH: number;
}

export interface SafetySummary {
  totalSelectedDrugs: number;
  totalPairsChecked: number;
  verifiedInteractions: number;
  unverifiedPairs: number;
  duplicateTherapies: number;
  severitySummary: SeveritySummary;
  highestSeverity: string; // "HIGH", "MODERATE", "LOW", "SAFE", or "NONE"
  actionMessage: string;
}

export interface BackendInteractionResponse {
  selectedDrugs: BackendDrug[];
  duplicateTherapies: any[];
  safetySummary: SafetySummary;
  aiSummary: string;
  interactions: BackendInteractionPair[];
  historySaved: boolean;
  historyId: number | null;
}
