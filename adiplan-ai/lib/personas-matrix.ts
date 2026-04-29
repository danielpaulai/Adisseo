/**
 * Enterprise Personas × Customer Success Factors (CSF) diagonal matrix.
 *
 * The matrix is the upstream prioritisation view. Before a strategic frame
 * is composed, the Adisseo strategist asks: for THIS persona, which CSF
 * matters most — and is that the CSF where Adisseo's portfolio is
 * strongest? The diagonal of the matrix marks the cells where persona-
 * priority and Adisseo-strength match. Off-diagonal cells are either
 * "we'd-have-to-stretch" or "this isn't our fight".
 *
 * Cells are scored 1-5 on two axes:
 *   - personaPriority: how much THIS persona cares about THIS CSF
 *   - adisseoStrength: how strong is Adisseo's portfolio answer for it
 * The composite (priority × strength) drives the colour intensity in the UI.
 *
 * Adisseo's "answer" is the 1-2 sentence value claim Adisseo would lead
 * with in a sales conversation if this exact persona-CSF combo came up.
 * The wording is intentionally aligned with Total Value Solution language
 * so /strategic-frame can pre-fill from a click on a matrix cell.
 */

export type PersonaId =
  | "persona-efficiency"
  | "persona-system-simplifier"
  | "persona-risk-reducer"
  | "persona-sustainability-advocate"
  | "persona-knowledge-builder";

export type CSFId =
  | "csf-margin"
  | "csf-fcr"
  | "csf-disease"
  | "csf-regulatory"
  | "csf-carbon"
  | "csf-knowledge";

export interface MatrixPersona {
  id: PersonaId;
  label: string;
  blurb: string;
  /** colour token for the persona row indicator */
  accent: string;
}

export interface MatrixCSF {
  id: CSFId;
  label: string;
  shortLabel: string;
  blurb: string;
}

export interface MatrixCell {
  personaId: PersonaId;
  csfId: CSFId;
  /** 1 = barely cares, 5 = top job-to-be-done */
  personaPriority: 1 | 2 | 3 | 4 | 5;
  /** 1 = no real answer, 5 = clear flagship answer */
  adisseoStrength: 1 | 2 | 3 | 4 | 5;
  /** Adisseo's lead answer in 1-2 sentences */
  adisseoAnswer: string;
  /** The product / flagship line this answer leans on */
  flagship: string;
  /** Suggested first deliverable to ship for this combo */
  suggestedDeliverable: string;
}

export const matrixPersonas: MatrixPersona[] = [
  {
    id: "persona-efficiency",
    label: "Efficiency Optimizer",
    blurb: "Defends margin via FCR / kg-of-gain per dollar of feed.",
    accent: "#A70A2D",
  },
  {
    id: "persona-system-simplifier",
    label: "System Simplifier",
    blurb: "Wants fewer SKUs, simpler protocols, drop-in compatibility.",
    accent: "#00A3C4",
  },
  {
    id: "persona-risk-reducer",
    label: "Risk Reducer",
    blurb: "Avoids disease, regulatory and quality-failure events.",
    accent: "#D97641",
  },
  {
    id: "persona-sustainability-advocate",
    label: "Sustainability Advocate",
    blurb: "Owns scope-3 reductions and CSR-grade reporting.",
    accent: "#047857",
  },
  {
    id: "persona-knowledge-builder",
    label: "Knowledge Builder",
    blurb: "Educates next-gen farmers, distributors, internal sales.",
    accent: "#7c3aed",
  },
];

export const matrixCSFs: MatrixCSF[] = [
  {
    id: "csf-margin",
    label: "Margin Protection",
    shortLabel: "Margin",
    blurb: "Hold gross margin against feed-cost volatility.",
  },
  {
    id: "csf-fcr",
    label: "FCR Predictability",
    shortLabel: "FCR",
    blurb: "Tighter FCR / weight-uniformity / yield in farms and barns.",
  },
  {
    id: "csf-disease",
    label: "Disease & Health",
    shortLabel: "Disease",
    blurb: "ASF / PRRS / AI / WSSV resilience and recovery.",
  },
  {
    id: "csf-regulatory",
    label: "Regulatory Readiness",
    shortLabel: "Regulatory",
    blurb: "AGP-free, low-CP, antibiotic-stewardship, audit ready.",
  },
  {
    id: "csf-carbon",
    label: "Carbon & CSR",
    shortLabel: "Carbon",
    blurb: "Scope-3, methane, CSR-grade reporting, retailer audits.",
  },
  {
    id: "csf-knowledge",
    label: "Sales & Farm Enablement",
    shortLabel: "Enablement",
    blurb: "Sales / distributor / farmer technical literacy.",
  },
];

/**
 * Helper to keep cell defs short.
 */
function cell(
  personaId: PersonaId,
  csfId: CSFId,
  priority: MatrixCell["personaPriority"],
  strength: MatrixCell["adisseoStrength"],
  answer: string,
  flagship: string,
  deliverable: string
): MatrixCell {
  return {
    personaId,
    csfId,
    personaPriority: priority,
    adisseoStrength: strength,
    adisseoAnswer: answer,
    flagship,
    suggestedDeliverable: deliverable,
  };
}

/* eslint-disable prettier/prettier */
export const matrixCells: MatrixCell[] = [
  // === Efficiency Optimizer ===
  cell("persona-efficiency", "csf-margin", 5, 5,
    "Precision methionine + RUMITECH cuts $/kg-gain at any raw-material price; Adisseo's least-cost reformulation pack quantifies the saved bps.",
    "Rhodimet AT88 / RUMITECH",
    "1-page leaflet · trial data + $/animal saved"),
  cell("persona-efficiency", "csf-fcr", 5, 5,
    "Methionine precision is the single biggest external lever on FCR — 0.05–0.12 pt depending on species and diet.",
    "Rhodimet / Selisseo / Smartamine",
    "1-page leaflet · FCR trial data"),
  cell("persona-efficiency", "csf-disease", 2, 3,
    "Selisseo selenium reduces oxidative damage in challenge windows, giving an indirect FCR moat.",
    "Selisseo",
    "Trial summary"),
  cell("persona-efficiency", "csf-regulatory", 3, 4,
    "Low-CP-with-methionine reformulation lets you stay AGP-free and low-CP without leaving FCR points on the table.",
    "Rhodimet AT88",
    "Carousel · low-CP value math"),
  cell("persona-efficiency", "csf-carbon", 2, 3,
    "Lower CP + amino-acid precision drops nitrogen excretion and per-kg carbon — an efficiency bonus that's also carbon proof.",
    "Rhodimet AT88",
    "1-pager · efficiency × carbon"),
  cell("persona-efficiency", "csf-knowledge", 3, 4,
    "Sales-support MCQs and 1-pagers translate efficiency claims into language distributors and farmers re-use verbatim.",
    "Sales enablement pack",
    "MCQ knowledge base entry"),

  // === System Simplifier ===
  cell("persona-system-simplifier", "csf-margin", 4, 4,
    "One product (RUMITECH or Smartamine) replaces three SKUs and cuts mill complexity while protecting margin.",
    "RUMITECH / Smartamine",
    "Distributor 1-pager"),
  cell("persona-system-simplifier", "csf-fcr", 4, 4,
    "Drop-in additive at the mill: no protocol change, predictable +FCR points across tonnages.",
    "Rhodimet / Smartamine",
    "Mill manager 1-pager"),
  cell("persona-system-simplifier", "csf-disease", 2, 2,
    "Disease answers usually need protocol change — not the simplifier's first lever.",
    "—",
    "—"),
  cell("persona-system-simplifier", "csf-regulatory", 5, 5,
    "Reformulating low-CP / AGP-free is the textbook simplifier moment: replace 2–3 inputs with one Adisseo line and stay compliant.",
    "Rhodimet AT88",
    "Email blast · 'one swap, three problems solved'"),
  cell("persona-system-simplifier", "csf-carbon", 3, 3,
    "Same low-CP swap also cuts N excretion — same SKU, two stories.",
    "Rhodimet AT88",
    "Carousel · simplification × carbon"),
  cell("persona-system-simplifier", "csf-knowledge", 4, 4,
    "A single 1-pager per simplification swap is what distributors actually re-use — Aileen-style density wins here.",
    "Distributor pack",
    "1-page leaflet"),

  // === Risk Reducer ===
  cell("persona-risk-reducer", "csf-margin", 3, 3,
    "Resilience is hard to pre-bill, but documented FCR-protection during disease windows protects expected margin.",
    "Selisseo",
    "Vet-KOL webinar"),
  cell("persona-risk-reducer", "csf-fcr", 3, 3,
    "FCR moat under stress (heat / disease) is Adisseo's selenium + methionine story.",
    "Selisseo / Rhodimet",
    "Trial paper"),
  cell("persona-risk-reducer", "csf-disease", 5, 5,
    "Selisseo organic selenium + methionine precision = oxidative-stress moat in disease windows; vet-KOL data supports the claim.",
    "Selisseo",
    "Vet-KOL webinar + peer-reviewed brief"),
  cell("persona-risk-reducer", "csf-regulatory", 5, 5,
    "AGP-free + low-CP transition is the #1 audit risk this year — Adisseo's reformulation playbook ships with the regulatory checklist.",
    "Rhodimet AT88 + Adisseo regulatory pack",
    "Email blast · regulatory transition pack"),
  cell("persona-risk-reducer", "csf-carbon", 3, 3,
    "Scope-3 audits aren't existential yet for risk-reducers, but documented carbon math reduces future audit shocks.",
    "Rhodimet AT88",
    "Carousel · carbon-as-risk"),
  cell("persona-risk-reducer", "csf-knowledge", 4, 4,
    "Risk-reducers consume vet-KOL endorsement and peer-reviewed PDFs, not LinkedIn — ship the brief with the data table.",
    "Vet-KOL webinar + peer-reviewed",
    "Webinar registration kit"),

  // === Sustainability Advocate ===
  cell("persona-sustainability-advocate", "csf-margin", 2, 2,
    "Margin isn't this persona's primary lens — answer with carbon × cost as a secondary claim.",
    "—",
    "—"),
  cell("persona-sustainability-advocate", "csf-fcr", 3, 3,
    "Better FCR = less feed = less carbon — frame the efficiency story in carbon units.",
    "Rhodimet AT88",
    "Carousel · FCR × carbon"),
  cell("persona-sustainability-advocate", "csf-disease", 2, 2,
    "Disease isn't usually the carbon advocate's owned KPI.",
    "—",
    "—"),
  cell("persona-sustainability-advocate", "csf-regulatory", 4, 4,
    "Sustainability reporting is itself a regulatory tightening — same low-CP / AGP-free reformulation also reduces N and carbon.",
    "Rhodimet AT88",
    "Co-published CSR report excerpt"),
  cell("persona-sustainability-advocate", "csf-carbon", 5, 5,
    "Methionine-led low-CP reformulation = -10–15% N excretion, measurable scope-3 cut. We give you a co-publishable carbon LCA per region.",
    "Rhodimet AT88 + Adisseo LCA pack",
    "Co-published CSR case study"),
  cell("persona-sustainability-advocate", "csf-knowledge", 3, 3,
    "CSR audiences read LinkedIn, not local magazines — ship the case-study carousel for repost.",
    "Sustainability case-study pack",
    "LinkedIn carousel"),

  // === Knowledge Builder ===
  cell("persona-knowledge-builder", "csf-margin", 2, 3,
    "Frame margin as the lesson, not the hook: 'how this works' beats 'what it costs'.",
    "Educational pack",
    "Manga / explainer video"),
  cell("persona-knowledge-builder", "csf-fcr", 3, 4,
    "FCR mechanism stories (methionine pathway, selenium oxidation) translate well to manga and explainer videos.",
    "Educational pack",
    "Manga or 90s explainer"),
  cell("persona-knowledge-builder", "csf-disease", 4, 4,
    "Vet-KOL × manga is the shared vocabulary — Antoine's MyCommand model proves the format.",
    "MyCommand manga",
    "Manga 2-page brochure"),
  cell("persona-knowledge-builder", "csf-regulatory", 3, 3,
    "Regulatory transitions are teachable moments — short explainers > dense PDFs for next-gen farmers.",
    "Educational pack",
    "<60s short or 90s explainer"),
  cell("persona-knowledge-builder", "csf-carbon", 4, 4,
    "Carbon math is abstract — explainer videos and manga humanise it for the next generation of farmers.",
    "Educational pack",
    "90s explainer video"),
  cell("persona-knowledge-builder", "csf-knowledge", 5, 5,
    "This is the diagonal sweet-spot for the Knowledge Builder — Adisseo ships manga, MCQ knowledge bases, magazine inserts and TikTok shorts in 4-language form.",
    "Local-magazine + MyCommand + Claire's TikToks",
    "Manga · MCQ · TikTok bundle"),
];
/* eslint-enable prettier/prettier */

export function getCell(p: PersonaId, c: CSFId): MatrixCell | undefined {
  return matrixCells.find((m) => m.personaId === p && m.csfId === c);
}

/**
 * Cell intensity for the heat-map shading (0..1). The product
 * priority × strength gives a 1..25 range; we normalise.
 */
export function cellIntensity(cell: MatrixCell): number {
  return (cell.personaPriority * cell.adisseoStrength) / 25;
}

/**
 * "Diagonal" cells — i.e. priority 5 AND strength 5. These are
 * the textbook win cells where Adisseo should *always* lead.
 */
export function isDiagonalWin(cell: MatrixCell): boolean {
  return cell.personaPriority === 5 && cell.adisseoStrength === 5;
}
