export type InfluenceLevel = "small" | "medium" | "large";
export type Trend = "growing" | "shrinking" | "not-changing";

export type StakeholderPersona =
  | "Efficiency Optimizer"
  | "System Simplifier"
  | "Risk Reducer"
  | "Sustainability Advocate"
  | "Knowledge Builder";

export interface Stakeholder {
  id: string;
  label: string;
  influence: InfluenceLevel;
  trend: Trend;
  persona: StakeholderPersona;
  notes?: string;
}

export const seededStakeholders: Stakeholder[] = [
  {
    id: "corp-nutrition-dir",
    label: "Corporate Nutrition Directors",
    influence: "medium",
    trend: "shrinking",
    persona: "Efficiency Optimizer",
  },
  {
    id: "procurement",
    label: "Procurement Leads",
    influence: "medium",
    trend: "not-changing",
    persona: "Risk Reducer",
  },
  {
    id: "regulatory",
    label: "Regulatory Affairs Managers",
    influence: "medium",
    trend: "growing",
    persona: "Risk Reducer",
  },
  {
    id: "sustainability",
    label: "Sustainability / CSR Officers",
    influence: "small",
    trend: "growing",
    persona: "Sustainability Advocate",
  },
  {
    id: "nutrition-mgr",
    label: "Nutrition Managers",
    influence: "large",
    trend: "growing",
    persona: "Efficiency Optimizer",
  },
  {
    id: "vets",
    label: "Vets (Clinic & Field)",
    influence: "medium",
    trend: "shrinking",
    persona: "Risk Reducer",
  },
  {
    id: "farm-mgr",
    label: "Farm Managers",
    influence: "small",
    trend: "not-changing",
    persona: "System Simplifier",
  },
  {
    id: "feed-mill",
    label: "Feed Mill Operators",
    influence: "small",
    trend: "not-changing",
    persona: "System Simplifier",
  },
  {
    id: "university",
    label: "University / Research Partners",
    influence: "small",
    trend: "shrinking",
    persona: "Knowledge Builder",
  },
  {
    id: "integrator-tech",
    label: "Integrator Nutrition / Tech Manager",
    influence: "large",
    trend: "not-changing",
    persona: "Efficiency Optimizer",
  },
  {
    id: "premixer",
    label: "Premixer — Formulator / Category Mgr",
    influence: "medium",
    trend: "growing",
    persona: "Efficiency Optimizer",
  },
  {
    id: "distributor",
    label: "Distributor — Bus. Dvlpmt Lead",
    influence: "small",
    trend: "shrinking",
    persona: "System Simplifier",
  },
  {
    id: "financial",
    label: "Financial Controllers",
    influence: "small",
    trend: "not-changing",
    persona: "Risk Reducer",
  },
  {
    id: "vet-kol",
    label: "Vet KOLs / Consultants",
    influence: "medium",
    trend: "shrinking",
    persona: "Knowledge Builder",
  },
  {
    id: "ngo",
    label: "NGO / Trade Assoc. Policy Lead",
    influence: "small",
    trend: "not-changing",
    persona: "Sustainability Advocate",
  },
];

export interface InfluenceEdge {
  source: string;
  target: string;
  weight?: number;
}

export const seededEdges: InfluenceEdge[] = [
  { source: "vet-kol", target: "vets", weight: 2 },
  { source: "vets", target: "nutrition-mgr", weight: 2 },
  { source: "nutrition-mgr", target: "premixer", weight: 3 },
  { source: "nutrition-mgr", target: "corp-nutrition-dir", weight: 2 },
  { source: "corp-nutrition-dir", target: "procurement", weight: 2 },
  { source: "regulatory", target: "corp-nutrition-dir", weight: 2 },
  { source: "regulatory", target: "premixer", weight: 1 },
  { source: "sustainability", target: "regulatory", weight: 1 },
  { source: "ngo", target: "regulatory", weight: 2 },
  { source: "university", target: "vet-kol", weight: 1 },
  { source: "university", target: "nutrition-mgr", weight: 1 },
  { source: "premixer", target: "feed-mill", weight: 2 },
  { source: "integrator-tech", target: "nutrition-mgr", weight: 3 },
  { source: "integrator-tech", target: "procurement", weight: 2 },
  { source: "distributor", target: "farm-mgr", weight: 1 },
  { source: "feed-mill", target: "farm-mgr", weight: 1 },
  { source: "procurement", target: "financial", weight: 1 },
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
