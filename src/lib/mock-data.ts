export type RiskLevel = "high" | "moderate" | "low" | "none";

export interface InteractionResult {
  drugs: string[];
  severity: RiskLevel;
  summary: string;
  explanation: string;
  recommendation: string;
}

export const MOCK_DRUGS = [
  "Warfarin",
  "Ibuprofen",
  "Aspirin",
  "Metformin",
  "Lisinopril",
  "Atorvastatin",
  "Amoxicillin",
  "Omeprazole",
  "Sertraline",
  "Albuterol",
];

export const MOCK_HISTORY: InteractionResult[] = [
  {
    drugs: ["Warfarin", "Ibuprofen"],
    severity: "high",
    summary: "Increased bleeding risk",
    explanation:
      "Taking these medicines together may increase the chance of stomach bleeding and affect blood clotting.",
    recommendation:
      "Speak with your healthcare provider before combining these medications.",
  },
  {
    drugs: ["Metformin", "Lisinopril"],
    severity: "low",
    summary: "Generally safe combination",
    explanation:
      "These medications are commonly prescribed together for patients with diabetes and hypertension.",
    recommendation:
      "Continue as prescribed and report any unusual symptoms to your doctor.",
  },
  {
    drugs: ["Aspirin", "Omeprazole"],
    severity: "moderate",
    summary: "Stomach protection recommended",
    explanation:
      "Omeprazole may help reduce stomach irritation caused by aspirin, but monitoring is still advised.",
    recommendation:
      "Discuss long-term aspirin use and stomach protection with your healthcare provider.",
  },
];

function normalizeDrugKey(drugs: string[]) {
  return drugs
    .map((drug) => drug.toLowerCase())
    .sort()
    .join("+");
}

const KNOWN_INTERACTIONS: Record<string, InteractionResult> = {
  "ibuprofen+warfarin": {
    drugs: ["Warfarin", "Ibuprofen"],
    severity: "high",
    summary: "Increased bleeding risk",
    explanation:
      "Taking these medicines together may increase the chance of stomach bleeding and affect blood clotting.",
    recommendation:
      "Speak with your healthcare provider before combining these medications.",
  },
  "aspirin+warfarin": {
    drugs: ["Warfarin", "Aspirin"],
    severity: "high",
    summary: "Significant bleeding risk",
    explanation:
      "Combining warfarin with aspirin substantially increases the risk of serious bleeding events.",
    recommendation:
      "Do not combine without direct medical supervision.",
  },
  "lisinopril+metformin": {
    drugs: ["Metformin", "Lisinopril"],
    severity: "low",
    summary: "Generally safe combination",
    explanation:
      "These medications are commonly prescribed together for patients with diabetes and hypertension.",
    recommendation:
      "Continue as prescribed and report any unusual symptoms to your doctor.",
  },
  "omeprazole+aspirin": {
    drugs: ["Aspirin", "Omeprazole"],
    severity: "moderate",
    summary: "Stomach protection recommended",
    explanation:
      "Omeprazole may help reduce stomach irritation caused by aspirin, but monitoring is still advised.",
    recommendation:
      "Discuss long-term aspirin use and stomach protection with your healthcare provider.",
  },
};

export function getMockInteraction(drugs: string[]): InteractionResult {
  if (drugs.length < 2) {
    return {
      drugs,
      severity: "none",
      summary: "Add more medications",
      explanation: "Select at least two medications to check for interactions.",
      recommendation: "Add another drug to run an interaction check.",
    };
  }

  const lowerDrugs = drugs.map((d) => d.toLowerCase());
  
  // Find which of our known base drugs are present
  const baseIngredients = [
    "warfarin",
    "ibuprofen",
    "aspirin",
    "metformin",
    "lisinopril",
    "atorvastatin",
    "amoxicillin",
    "omeprazole",
    "sertraline",
    "albuterol"
  ];
  
  const matchedIngredients = baseIngredients.filter((ingredient) => 
    lowerDrugs.some((drug) => drug.includes(ingredient))
  );

  // Check if any pair of matched ingredients has a known interaction
  let foundInteraction: InteractionResult | null = null;
  for (let i = 0; i < matchedIngredients.length; i++) {
    for (let j = i + 1; j < matchedIngredients.length; j++) {
      const pairKey = [matchedIngredients[i], matchedIngredients[j]].sort().join("+");
      if (KNOWN_INTERACTIONS[pairKey]) {
        foundInteraction = KNOWN_INTERACTIONS[pairKey];
        break;
      }
    }
    if (foundInteraction) break;
  }

  if (foundInteraction) {
    return {
      ...foundInteraction,
      drugs: drugs, // Keep original names for portal display
    };
  }

  return {
    drugs,
    severity: "none",
    summary: "No known interactions found",
    explanation:
      "Our demo database did not find significant interactions between these medications. This is not medical advice.",
    recommendation:
      "Always consult your healthcare provider before starting or changing medications.",
  };
}

export function searchDrugs(query: string): string[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return MOCK_DRUGS.filter((drug) =>
    drug.toLowerCase().includes(normalized),
  ).slice(0, 6);
}
