export type InfluenceLevel = "small" | "medium" | "large";
export type Trend = "growing" | "shrinking" | "not-changing";

export type StakeholderPersona =
  | "Efficiency Optimizer"
  | "System Simplifier"
  | "Risk Reducer"
  | "Sustainability Advocate"
  | "Knowledge Builder";

export type StakeholderRegion = "CN" | "JP" | "ID" | "TH" | "VN" | "MY" | "IN" | "KR" | "PH" | "Global";
export type StakeholderSpecies = "aqua" | "poultry" | "ruminants" | "swine";

export interface Stakeholder {
  id: string;
  label: string;
  influence: InfluenceLevel;
  trend: Trend;
  persona: StakeholderPersona;
  /** Where this stakeholder type lives. Empty = pan-APAC. */
  regions?: StakeholderRegion[];
  /** Which species portfolios they touch. Empty = all four. */
  species?: StakeholderSpecies[];
  notes?: string;
}

export const seededStakeholders: Stakeholder[] = [
  {
    id: "corp-nutrition-dir",
    label: "Corporate Nutrition Directors",
    influence: "medium",
    trend: "shrinking",
    persona: "Efficiency Optimizer",
    regions: ["CN", "TH", "VN", "ID"],
    species: ["poultry", "swine"],
  },
  {
    id: "procurement",
    label: "Procurement Leads",
    influence: "medium",
    trend: "not-changing",
    persona: "Risk Reducer",
    regions: ["CN", "TH", "VN", "ID", "MY", "JP", "PH", "KR"],
    species: ["aqua", "poultry", "ruminants", "swine"],
  },
  {
    id: "regulatory",
    label: "Regulatory Affairs Managers",
    influence: "medium",
    trend: "growing",
    persona: "Risk Reducer",
  regions: ["CN", "JP", "KR", "ID", "VN"],
  species: ["aqua", "poultry", "ruminants", "swine"],
  },
  {
    id: "sustainability",
    label: "Sustainability / CSR Officers",
    influence: "small",
    trend: "growing",
    persona: "Sustainability Advocate",
  regions: ["JP", "KR", "Global"],
  species: ["ruminants", "poultry"],
  },
  {
    id: "nutrition-mgr",
    label: "Nutrition Managers",
    influence: "large",
    trend: "growing",
    persona: "Efficiency Optimizer",
  regions: ["CN", "TH", "VN", "ID", "MY"],
  species: ["aqua", "poultry", "swine"],
  },
  {
    id: "vets",
    label: "Vets (Clinic & Field)",
    influence: "medium",
    trend: "shrinking",
    persona: "Risk Reducer",
  regions: ["TH", "VN", "PH", "ID"],
  species: ["poultry", "swine", "ruminants"],
  },
  {
    id: "farm-mgr",
    label: "Farm Managers",
    influence: "small",
    trend: "not-changing",
    persona: "System Simplifier",
  regions: ["TH", "VN", "ID", "PH", "MY"],
  species: ["aqua", "poultry", "ruminants", "swine"],
  },
  {
    id: "feed-mill",
    label: "Feed Mill Operators",
    influence: "small",
    trend: "not-changing",
    persona: "System Simplifier",
  regions: ["CN", "TH", "VN", "ID"],
  species: ["aqua", "poultry", "swine"],
  },
  {
    id: "university",
    label: "University / Research Partners",
    influence: "small",
    trend: "shrinking",
    persona: "Knowledge Builder",
  regions: ["JP", "KR", "CN", "Global"],
  species: ["aqua", "poultry", "ruminants", "swine"],
  },
  {
    id: "integrator-tech",
    label: "Integrator Nutrition / Tech Manager",
    influence: "large",
    trend: "not-changing",
    persona: "Efficiency Optimizer",
  regions: ["CN", "TH", "VN", "ID", "PH"],
  species: ["poultry", "swine"],
  },
  {
    id: "premixer",
    label: "Premixer — Formulator / Category Mgr",
    influence: "medium",
    trend: "growing",
    persona: "Efficiency Optimizer",
  regions: ["CN", "TH", "ID", "VN"],
  species: ["aqua", "poultry", "ruminants", "swine"],
  },
  {
    id: "distributor",
    label: "Distributor — Bus. Dvlpmt Lead",
    influence: "small",
    trend: "shrinking",
    persona: "System Simplifier",
  regions: ["TH", "VN", "ID", "PH", "MY"],
  species: ["aqua", "poultry", "swine"],
  },
  {
    id: "financial",
    label: "Financial Controllers",
    influence: "small",
    trend: "not-changing",
    persona: "Risk Reducer",
  regions: ["Global"],
  species: ["aqua", "poultry", "ruminants", "swine"],
  },
  {
    id: "vet-kol",
    label: "Vet KOLs / Consultants",
    influence: "medium",
    trend: "shrinking",
    persona: "Knowledge Builder",
  regions: ["TH", "VN", "ID", "PH", "JP"],
  species: ["poultry", "swine", "ruminants"],
  },
  {
    id: "ngo",
    label: "NGO / Trade Assoc. Policy Lead",
    influence: "small",
    trend: "not-changing",
    persona: "Sustainability Advocate",
  regions: ["Global", "JP", "KR"],
  species: ["aqua", "poultry", "ruminants", "swine"],
  },
];

export type InfluenceEdgeKind =
  | "advises"
  | "specs"
  | "approves"
  | "regulates"
  | "funds"
  | "sells-to";

export interface InfluenceEdge {
  source: string;
  target: string;
  weight?: number;
  /** Relationship kind \u2014 colors the arrow on the map. */
  kind?: InfluenceEdgeKind;
}

export const edgeKindColor: Record<InfluenceEdgeKind, string> = {
  advises: "#6B5B95",
  specs: "#A70A2D",
  approves: "#D97641",
  regulates: "#2E7D5B",
  funds: "#0E1216",
  "sells-to": "#00A3C4",
};

export const edgeKindLabel: Record<InfluenceEdgeKind, string> = {
  advises: "advises",
  specs: "specs in",
  approves: "approves",
  regulates: "regulates",
  funds: "funds",
  "sells-to": "sells to",
};

export const seededEdges: InfluenceEdge[] = [
  { source: "vet-kol", target: "vets", weight: 2, kind: "advises" },
  { source: "vets", target: "nutrition-mgr", weight: 2, kind: "advises" },
  { source: "nutrition-mgr", target: "premixer", weight: 3, kind: "specs" },
  { source: "nutrition-mgr", target: "corp-nutrition-dir", weight: 2, kind: "advises" },
  { source: "corp-nutrition-dir", target: "procurement", weight: 2, kind: "approves" },
  { source: "regulatory", target: "corp-nutrition-dir", weight: 2, kind: "regulates" },
  { source: "regulatory", target: "premixer", weight: 1, kind: "regulates" },
  { source: "sustainability", target: "regulatory", weight: 1, kind: "advises" },
  { source: "ngo", target: "regulatory", weight: 2, kind: "regulates" },
  { source: "university", target: "vet-kol", weight: 1, kind: "advises" },
  { source: "university", target: "nutrition-mgr", weight: 1, kind: "advises" },
  { source: "premixer", target: "feed-mill", weight: 2, kind: "sells-to" },
  { source: "integrator-tech", target: "nutrition-mgr", weight: 3, kind: "advises" },
  { source: "integrator-tech", target: "procurement", weight: 2, kind: "approves" },
  { source: "distributor", target: "farm-mgr", weight: 1, kind: "sells-to" },
  { source: "feed-mill", target: "farm-mgr", weight: 1, kind: "sells-to" },
  { source: "procurement", target: "financial", weight: 1, kind: "funds" },
];

export const personaColors: Record<StakeholderPersona, string> = {
  "Efficiency Optimizer": "#A70A2D",
  "System Simplifier": "#00A3C4",
  "Risk Reducer": "#D97641",
  "Sustainability Advocate": "#2E7D5B",
  "Knowledge Builder": "#6B5B95",
};

export const influenceRadius: Record<InfluenceLevel, number> = {
  small: 38,
  medium: 56,
  large: 78,
};

export const trendLabel: Record<Trend, string> = {
  growing: "Growing",
  shrinking: "Shrinking",
  "not-changing": "Stable",
};
