/**
 * AdiPlan strategic primitives.
 * Sourced from: AdiPlan March Workshop template + the four species-manager
 * training transcripts (Aileen/Aqua, Vish/Poultry, Antoine/Ruminants, Claire/Swine).
 *
 * The News -> Strategy bridge LLM prompt grounds itself in this list so it
 * can never invent CBIs that aren't in the AdiPlan vocabulary.
 */

export type SpeciesKey = "aqua" | "poultry" | "ruminants" | "swine";

export interface CBI {
  id: string;
  label: string;
  description: string;
  applicableSpecies: SpeciesKey[];
}

export const adiplanCBIs: CBI[] = [
  {
    id: "cbi-feed-cost",
    label: "Feed Cost Volatility",
    description:
      "Raw-material price swings (methionine, fishmeal, soy) erode margin and disrupt least-cost formulation.",
    applicableSpecies: ["aqua", "poultry", "swine", "ruminants"],
  },
  {
    id: "cbi-disease-pressure",
    label: "Disease & Health-Risk Pressure",
    description:
      "ASF, PRRS, AI, and emerging pathogens threaten flock/herd performance and biosecurity ROI.",
    applicableSpecies: ["poultry", "swine"],
  },
  {
    id: "cbi-regulatory-shift",
    label: "Regulatory Tightening (AGP, antibiotics, sustainability reporting)",
    description:
      "Shifting national rules on antibiotic use, low-CP feed, carbon reporting, and traceability.",
    applicableSpecies: ["aqua", "poultry", "swine", "ruminants"],
  },
  {
    id: "cbi-sustainability",
    label: "Sustainability & Carbon Pressure",
    description:
      "Buyers, retailers, and integrators demanding scope-3 reductions and CSR-grade reporting.",
    applicableSpecies: ["aqua", "poultry", "swine", "ruminants"],
  },
  {
    id: "cbi-mycotoxin",
    label: "Mycotoxin & Raw-Material Quality Risk",
    description:
      "Variable raw-material quality drives unpredictable performance and demands testing infrastructure.",
    applicableSpecies: ["aqua", "poultry", "swine", "ruminants"],
  },
  {
    id: "cbi-talent-knowledge",
    label: "Knowledge Gap on Farm / In Sales",
    description:
      "Sales teams under-equipped to defend value vs. price; farmers in emerging markets (e.g. NZ aqua, Thai aqua) lack technical literacy.",
    applicableSpecies: ["aqua", "poultry", "swine", "ruminants"],
  },
  {
    id: "cbi-channel-fragmentation",
    label: "Channel & Distributor Fragmentation",
    description:
      "Top-10 customers per country require account-specific story; distributor portfolios overlap inconsistently.",
    applicableSpecies: ["poultry", "swine", "ruminants"],
  },
  {
    id: "cbi-aqua-localization",
    label: "Aqua Local-Magazine + Local-Language Dependency",
    description:
      "Aqua audiences in ID/VN/TH consume technical content via local-language magazines, not LinkedIn or English channels.",
    applicableSpecies: ["aqua"],
  },
];

export interface Persona {
  id: string;
  label: string;
  topPriority: string;
  pains: string[];
  wins: string[];
  preferredChannels: string[];
}

export const adiplanPersonas: Persona[] = [
  {
    id: "persona-efficiency",
    label: "Efficiency Optimizer",
    topPriority: "Squeeze every gram of FCR / kg of gain per dollar of feed",
    pains: ["Volatile raw-material prices", "Pressure to defend margin"],
    wins: ["Validated FCR improvements", "Quantified $/animal savings"],
    preferredChannels: ["Technical leaflets", "Trial data", "Sales-led demos"],
  },
  {
    id: "persona-system-simplifier",
    label: "System Simplifier",
    topPriority: "Reduce SKU/process complexity on-farm and in the mill",
    pains: ["Too many supplements", "Complex protocols"],
    wins: ["Single-product solutions", "Drop-in compatibility"],
    preferredChannels: ["1-page leaflet", "Distributor-led training"],
  },
  {
    id: "persona-risk-reducer",
    label: "Risk Reducer",
    topPriority: "Avoid disease, regulatory, and quality-failure events",
    pains: ["ASF/PRRS/AI outbreaks", "Mycotoxin spikes", "Audit risk"],
    wins: ["Resilience data", "Regulatory-aligned positioning"],
    preferredChannels: ["Vet-KOL endorsement", "Peer-reviewed papers", "Webinars"],
  },
  {
    id: "persona-sustainability-advocate",
    label: "Sustainability Advocate",
    topPriority: "Deliver scope-3 reductions and CSR-grade reporting",
    pains: ["Pressure from retailer/buyer audits", "Carbon-reporting gaps"],
    wins: ["Verified carbon claims", "Co-marketable CSR stories"],
    preferredChannels: ["Case studies", "Co-published reports", "LinkedIn"],
  },
  {
    id: "persona-knowledge-builder",
    label: "Knowledge Builder",
    topPriority: "Educate the next generation of farmers and customers",
    pains: ["Low technical literacy in emerging regions", "Generational handover"],
    wins: ["Tutorials, manga, explainer videos", "Authored thought leadership"],
    preferredChannels: ["Manga brochure", "Explainer video", "Local magazine"],
  },
];

export interface DeliverableFormat {
  id: string;
  label: string;
  description: string;
  bestFor: SpeciesKey[];
  channel: string;
  estTimeMinutes: number;
}

export const adiplanFormats: DeliverableFormat[] = [
  {
    id: "fmt-leaflet",
    label: "1-2 page Technical Leaflet",
    description: "Aileen-style: dense technical claims, schematic, citation-grade.",
    bestFor: ["aqua", "ruminants"],
    channel: "Sales hand-off / local magazine insert",
    estTimeMinutes: 25,
  },
  {
    id: "fmt-emailer",
    label: "Campaign Emailer (AGP-Free style)",
    description: "Vish-style: HQ-guardrail compliant, sales-enablement attachment.",
    bestFor: ["poultry", "swine"],
    channel: "Sales-led email sequence",
    estTimeMinutes: 20,
  },
  {
    id: "fmt-manga",
    label: "Manga-style 2-page Brochure",
    description: "Antoine-style: Japanese narrative, MyCommand-personality voice.",
    bestFor: ["ruminants"],
    channel: "Japan field sales hand-off",
    estTimeMinutes: 60,
  },
  {
    id: "fmt-tiktok-short",
    label: "<60s TikTok / WeChat / Instagram Short",
    description: "Claire-style: vertical, hook-in-3s, no jargon, 4-language ready.",
    bestFor: ["swine"],
    channel: "Social (NOT LinkedIn for Claire)",
    estTimeMinutes: 30,
  },
  {
    id: "fmt-linkedin-carousel",
    label: "LinkedIn Carousel (HQ-guardrail)",
    description: "Vish-style: 6-8 slides, repostable from HQ.",
    bestFor: ["poultry", "ruminants"],
    channel: "LinkedIn",
    estTimeMinutes: 25,
  },
  {
    id: "fmt-explainer-video",
    label: "Drawing-style Explainer Video (Manim)",
    description: "Aileen/Antoine: 90-second concept video — life cycles, mechanisms.",
    bestFor: ["aqua", "ruminants"],
    channel: "Website + WhatsApp + WeChat",
    estTimeMinutes: 90,
  },
  {
    id: "fmt-wechat-livestream",
    label: "WeChat Live-Broadcast Episode",
    description: "Claire-style: vet KOL + nutrition manager, 30-45 min, repackage as shorts.",
    bestFor: ["swine"],
    channel: "WeChat live-broadcast",
    estTimeMinutes: 240,
  },
  {
    id: "fmt-mcq-knowledge",
    label: "MCQ Knowledge Base entry (sales-support)",
    description: "Claire-style: 5-10 multiple-choice questions for sales onboarding.",
    bestFor: ["swine", "poultry"],
    channel: "Internal sales LMS",
    estTimeMinutes: 15,
  },
  {
    id: "fmt-newsletter",
    label: "Bilingual Monthly Newsletter Section",
    description: "Antoine-style: JP+EN, 3-5 short sections.",
    bestFor: ["ruminants"],
    channel: "MyCommand newsletter",
    estTimeMinutes: 20,
  },
];

export const speciesManagers = {
  aqua: { manager: "Aileen", focusRegions: ["ID", "VN", "TH"] },
  poultry: { manager: "Vish", focusRegions: ["APAC"] },
  ruminants: { manager: "Antoine", focusRegions: ["JP", "NZ", "AU"] },
  swine: { manager: "Claire", focusRegions: ["CN", "VN", "TH", "PH"] },
} as const;
