/**
 * Poultry A team workshop — structured-data layer.
 *
 * Source of truth = the 8 workshop posters Ricardo shared on 2026-04-30 along
 * with his voice memo. Encoded here so the rest of the app (campaign-fanout,
 * news-bridge, personas-matrix, engagement-tracker) can read the workshop
 * output without re-deriving it from PNG OCR each time.
 *
 * The poster mapping:
 *   Poster 1 → Leading + Lagging metrics (lib/workshop-metrics.ts)
 *   Poster 2 → Enterprise Personas × CSF priority matrix (poultryPriorityMatrix)
 *   Poster 3 → We Wish We Knew (poultryWWWK)
 *   Poster 4 → Persona character cards — Ethical Guy is the template (poultryEnterprisePersonas)
 *   Poster 5 → 7 ranked insights (poultryInsights)
 *   Poster 6 → CBI / CSF ladders for nutritionist / vet / purchaser (poultryStakeholderLadders)
 *   Poster 7 → CSF value-prop circles: Product / Add-ons / Services / Advisory (poultryCsfValueProps)
 *   Poster 8 → Plan on a Page (handled separately by /api/render-plan-on-a-page)
 */

/* ============================================================================
 * Personas (Poster 4) — six enterprise persona cards
 * ========================================================================== */

export type PoultryPersonaId =
  | "p-efficiency-feed"
  | "p-performance-animal"
  | "p-ethical"
  | "p-consistency"
  | "p-cost-saver"
  | "p-low-risk";

export interface PoultryPersonaCard {
  id: PoultryPersonaId;
  /** Short workshop nickname Ricardo used in the voice memo. */
  nickname: string;
  /** Long-form persona name. */
  fullName: string;
  /** What kind of customer they typically run. */
  characteristics: string[];
  /** Verbatim quote shape from the workshop poster. */
  typicalQuote: string;
  /** Roadblocks that get in the way of an Adisseo sale. */
  roadblocks: string[];
  /** Adisseo products/services that resonate. */
  possibleProducts: string[];
  /** APAC example accounts (sanitised). */
  exampleCustomers: string[];
}

export const poultryEnterprisePersonas: PoultryPersonaCard[] = [
  {
    id: "p-efficiency-feed",
    nickname: "Efficiency Guy (Feed)",
    fullName: "Feed-efficiency optimiser",
    characteristics: [
      "Runs feed-cost reviews monthly",
      "Tracks FCR + €/kg gain religiously",
      "Open to additives if matrix value is documented",
    ],
    typicalQuote: "Show me the matrix value and the trial. I will reformulate next week.",
    roadblocks: [
      "Will not move without numerical matrix evidence",
      "Distrusts marketing-only claims",
    ],
    possibleProducts: ["Rovabio Advance", "Rhodimet AT88", "ADICT", "PNE"],
    exampleCustomers: ["Large APAC integrators with central feed mills"],
  },
  {
    id: "p-performance-animal",
    nickname: "Performance Result Guy (Animal)",
    fullName: "Performance-result driver (animal-side)",
    characteristics: [
      "Anchors on bird performance (ADG, mortality, uniformity)",
      "Will trade feed cost for proven performance lift",
      "Prefers vet- and KOL-validated solutions",
    ],
    typicalQuote: "If the bird performs, the spreadsheet works itself out.",
    roadblocks: [
      "Resistant to change in standard operating procedures",
      "Needs side-by-side trial replicate before scaling",
    ],
    possibleProducts: ["Rovabio Advance", "FRA LeciMax", "Microvit A Supra 1000", "FDC"],
    exampleCustomers: ["Premium broiler integrators in TH / VN"],
  },
  {
    id: "p-ethical",
    nickname: "Ethical Guy",
    fullName: "Ethical / sustainability visionary",
    characteristics: [
      "Brand-safety driven, B-Corp / ESG reporting focus",
      "AGP-free production is non-negotiable",
      "Wants traceable, scope-3-aligned suppliers",
    ],
    typicalQuote: "We don't replace antibiotics. We design out the need for them.",
    roadblocks: [
      "Procurement still scored on lowest cost",
      "Marketing claims must survive third-party audit",
    ],
    possibleProducts: ["SustainWay", "Rovabio Advance", "Microvit Certification System", "ADICT sustainability module"],
    exampleCustomers: ["JP / KR / SG retail-aligned integrators"],
  },
  {
    id: "p-consistency",
    nickname: "Consistency Guy",
    fullName: "Consistency / reliability buyer",
    characteristics: [
      "Optimises for low coefficient of variation across cycles",
      "Hates surprises in raw-material lots",
      "Will pay a premium for predictability",
    ],
    typicalQuote: "If I can plan it, I can finance it.",
    roadblocks: ["Long approval cycles", "Requires multi-cycle data before switching"],
    possibleProducts: ["PNE", "FDC", "ADICT", "Microvit"],
    exampleCustomers: ["Mid-large integrators in MY / ID with vertically-integrated feed mills"],
  },
  {
    id: "p-cost-saver",
    nickname: "Cost Saver Guy",
    fullName: "Raw-material cost optimiser",
    characteristics: [
      "Driven by purchasing-cost KPIs",
      "Will swap raw materials weekly",
      "Procurement-led, not nutrition-led",
    ],
    typicalQuote: "What's it going to do to my €/ton this quarter?",
    roadblocks: ["Limited interest in long-cycle ROI", "Hard cap on additive spend"],
    possibleProducts: ["Rhodimet AT88", "Rovabio Advance (full matrix)", "ADICT (formulation savings)"],
    exampleCustomers: ["Independent feed mills in PH / ID / VN"],
  },
  {
    id: "p-low-risk",
    nickname: "Low Risk Guy",
    fullName: "Risk-minimising operator",
    characteristics: [
      "Scared of supply disruption",
      "Insists on dual sourcing and full traceability",
      "Will accept higher unit cost for guaranteed continuity",
    ],
    typicalQuote: "I sleep better knowing the next 12 months are de-risked.",
    roadblocks: ["Compliance-heavy procurement", "Long supplier-onboarding cycles"],
    possibleProducts: ["Microvit Certification System", "PNE (raw-material safety net)", "SustainWay"],
    exampleCustomers: ["State-aligned integrators in CN / VN"],
  },
];

/* ============================================================================
 * Workshop CSFs (Poster 2 column headers)
 * ========================================================================== */

export type PoultryWorkshopCsfId =
  | "csf-feed-cost"
  | "csf-diet-performance"
  | "csf-medication"
  | "csf-uniformity"
  | "csf-rm-cost"
  | "csf-rm-supply";

export interface PoultryWorkshopCsf {
  id: PoultryWorkshopCsfId;
  label: string;
  shortLabel: string;
  blurb: string;
}

export const poultryWorkshopCSFs: PoultryWorkshopCsf[] = [
  {
    id: "csf-feed-cost",
    label: "Reduce feed cost",
    shortLabel: "Feed cost",
    blurb: "Lower €/kg of gain without compromising performance.",
  },
  {
    id: "csf-diet-performance",
    label: "Maximize diet performance (animal)",
    shortLabel: "Diet performance",
    blurb: "Bird-level outcomes — FCR, ADG, uniformity, mortality.",
  },
  {
    id: "csf-medication",
    label: "Reduce medication",
    shortLabel: "Medication",
    blurb: "Operate AGP-free; cut antibiotic use without losing performance.",
  },
  {
    id: "csf-uniformity",
    label: "Improve flock uniformity",
    shortLabel: "Flock uniformity",
    blurb: "Drop CV% on bodyweight; tighten harvest windows.",
  },
  {
    id: "csf-rm-cost",
    label: "Reduce raw-material cost",
    shortLabel: "RM cost",
    blurb: "Buy better; switch ingredients; manage volatility.",
  },
  {
    id: "csf-rm-supply",
    label: "Continuation of raw-material supply",
    shortLabel: "RM supply",
    blurb: "Guarantee continuity, traceability, and lot consistency.",
  },
];

/* ============================================================================
 * Priority matrix (Poster 2)
 * Each cell = persona's ranking of that CSF (1 = top priority for that persona).
 * Lower number → darker shading in the heat-grid view.
 * ========================================================================== */

export type CsfPriority = 1 | 2 | 3 | 4 | 5 | 6;

export interface PoultryPriorityCell {
  personaId: PoultryPersonaId;
  csfId: PoultryWorkshopCsfId;
  priority: CsfPriority;
}

export const poultryPriorityMatrix: PoultryPriorityCell[] = [
  // Efficiency Guy (Feed) — lives for feed cost.
  { personaId: "p-efficiency-feed", csfId: "csf-feed-cost", priority: 1 },
  { personaId: "p-efficiency-feed", csfId: "csf-rm-cost", priority: 2 },
  { personaId: "p-efficiency-feed", csfId: "csf-diet-performance", priority: 3 },
  { personaId: "p-efficiency-feed", csfId: "csf-uniformity", priority: 4 },
  { personaId: "p-efficiency-feed", csfId: "csf-medication", priority: 5 },
  { personaId: "p-efficiency-feed", csfId: "csf-rm-supply", priority: 6 },
  // Performance Result Guy — bird performance first, cost is the consequence.
  { personaId: "p-performance-animal", csfId: "csf-diet-performance", priority: 1 },
  { personaId: "p-performance-animal", csfId: "csf-uniformity", priority: 2 },
  { personaId: "p-performance-animal", csfId: "csf-medication", priority: 3 },
  { personaId: "p-performance-animal", csfId: "csf-feed-cost", priority: 4 },
  { personaId: "p-performance-animal", csfId: "csf-rm-cost", priority: 5 },
  { personaId: "p-performance-animal", csfId: "csf-rm-supply", priority: 6 },
  // Ethical Guy — medication out, sustainability in.
  { personaId: "p-ethical", csfId: "csf-medication", priority: 1 },
  { personaId: "p-ethical", csfId: "csf-uniformity", priority: 2 },
  { personaId: "p-ethical", csfId: "csf-diet-performance", priority: 3 },
  { personaId: "p-ethical", csfId: "csf-rm-supply", priority: 4 },
  { personaId: "p-ethical", csfId: "csf-feed-cost", priority: 5 },
  { personaId: "p-ethical", csfId: "csf-rm-cost", priority: 6 },
  // Consistency Guy — uniformity and supply reliability.
  { personaId: "p-consistency", csfId: "csf-uniformity", priority: 1 },
  { personaId: "p-consistency", csfId: "csf-rm-supply", priority: 2 },
  { personaId: "p-consistency", csfId: "csf-diet-performance", priority: 3 },
  { personaId: "p-consistency", csfId: "csf-feed-cost", priority: 4 },
  { personaId: "p-consistency", csfId: "csf-medication", priority: 5 },
  { personaId: "p-consistency", csfId: "csf-rm-cost", priority: 6 },
  // Cost Saver Guy — RM cost, then feed cost.
  { personaId: "p-cost-saver", csfId: "csf-rm-cost", priority: 1 },
  { personaId: "p-cost-saver", csfId: "csf-feed-cost", priority: 2 },
  { personaId: "p-cost-saver", csfId: "csf-rm-supply", priority: 3 },
  { personaId: "p-cost-saver", csfId: "csf-diet-performance", priority: 4 },
  { personaId: "p-cost-saver", csfId: "csf-uniformity", priority: 5 },
  { personaId: "p-cost-saver", csfId: "csf-medication", priority: 6 },
  // Low Risk Guy — supply continuity above all.
  { personaId: "p-low-risk", csfId: "csf-rm-supply", priority: 1 },
  { personaId: "p-low-risk", csfId: "csf-uniformity", priority: 2 },
  { personaId: "p-low-risk", csfId: "csf-medication", priority: 3 },
  { personaId: "p-low-risk", csfId: "csf-diet-performance", priority: 4 },
  { personaId: "p-low-risk", csfId: "csf-rm-cost", priority: 5 },
  { personaId: "p-low-risk", csfId: "csf-feed-cost", priority: 6 },
];

export function priorityFor(
  personaId: PoultryPersonaId,
  csfId: PoultryWorkshopCsfId,
): CsfPriority | null {
  const cell = poultryPriorityMatrix.find(
    (c) => c.personaId === personaId && c.csfId === csfId,
  );
  return cell?.priority ?? null;
}

/* ============================================================================
 * Stakeholder ladders (Poster 6) — Nutritionist / Vet / Purchaser
 * ========================================================================== */

export type PoultryStakeholderId = "nutritionist" | "vet" | "purchaser";

export interface PoultryStakeholderLadder {
  id: PoultryStakeholderId;
  fullName: string;
  /** Their personal value (the verbatim "value to them" line from the poster). */
  personalValue: string;
  /** CSFs they own (in priority order). */
  csfIds: PoultryWorkshopCsfId[];
  /** Critical Business Issues they must solve to deliver those CSFs. */
  cbis: string[];
  /** Adisseo's voice when speaking to this stakeholder. */
  voiceCue: string;
  /** Suggested email subject anchoring on TFIP. */
  emailHook: string;
  /** Suggested infographic title. */
  infographicTitle: string;
}

export const poultryStakeholderLadders: PoultryStakeholderLadder[] = [
  {
    id: "nutritionist",
    fullName: "Nutritionist",
    personalValue:
      "Provide the internal image of feed profitability with best performance — satisfy the farmer.",
    csfIds: ["csf-feed-cost", "csf-diet-performance", "csf-rm-cost"],
    cbis: [
      "Solve / improve low-protein diets",
      "Optimise the feed formula under volatile inputs",
      "Reduce raw-material variability impact",
      "Implement alternative raw-material utilisation",
      "Reduce matrix risk on enzyme / methionine claims",
    ],
    voiceCue:
      "Speak in matrix values, €/MT, AMEn, and digestible-AA. No hyperbole. Cite trial cycles and the comparator.",
    emailHook:
      "From €1.86/ton energy errors to 3% feed-cost savings — the nutritionist's TFIP cheat-sheet",
    infographicTitle:
      "Reveal · Formulate · Capture — Adisseo's TFIP framework for nutritionists",
  },
  {
    id: "vet",
    fullName: "Veterinarian",
    personalValue:
      "Be recognised as a premium brand — internal image as good recognition for the company.",
    csfIds: ["csf-medication", "csf-uniformity", "csf-diet-performance"],
    cbis: [
      "Reduce Clostridium / E. coli pressure",
      "Mitigate heat stress",
      "Mitigate viral disease load",
      "Adapt to AGP (antibiotic-growth-promoter) bans with feed additives",
      "Improve gut health and integrity",
    ],
    voiceCue:
      "Anchor on gut-integrity, mortality, AGP-free protocols. Adisseo never positions as a drug substitute.",
    emailHook:
      "Designing out the need for AGPs — TFIP for veterinarians (gut-integrity first)",
    infographicTitle:
      "Feed the gut · Cut the medication · Build resilience — TFIP for vets",
  },
  {
    id: "purchaser",
    fullName: "Purchaser",
    personalValue:
      "Be recognised as the best-in-class negotiator — protect margin without breaking the chain.",
    csfIds: ["csf-rm-cost", "csf-rm-supply", "csf-feed-cost"],
    cbis: [
      "Buy at the best price under volatility",
      "Ensure supply-chain reliability",
      "Ensure raw-material safety / traceability",
      "Ensure continuity of supply across cycles",
    ],
    voiceCue:
      "Speak in €/ton, lead-time risk, dual-sourcing, lot consistency. No bird-performance claims unless tied to cost.",
    emailHook:
      "Locking €27/ton on Rhodimet AT88 — TFIP for purchasers (cost + continuity)",
    infographicTitle:
      "Cost · Continuity · Compliance — TFIP for purchasers",
  },
];

export function ladderFor(stakeholderId: PoultryStakeholderId): PoultryStakeholderLadder {
  const found = poultryStakeholderLadders.find((l) => l.id === stakeholderId);
  if (!found) throw new Error(`Unknown poultry stakeholder ${stakeholderId}`);
  return found;
}

/* ============================================================================
 * CSF value-prop circles (Poster 7) — Product / Add-ons / Services / Advisory
 * ========================================================================== */

export interface PoultryCsfValueProp {
  csfId: PoultryWorkshopCsfId;
  /** Inner ring — actual products. */
  product: string[];
  /** Mid-inner ring — product add-ons / line extensions. */
  addOns: string[];
  /** Mid-outer ring — recurring services. */
  services: string[];
  /** Outer ring — advisory / KOL access. */
  advisory: string[];
  /** Workshop one-liner that anchors all four rings. */
  oneLiner: string;
}

export const poultryCsfValueProps: PoultryCsfValueProp[] = [
  {
    csfId: "csf-medication",
    product: ["Rovabio Advance", "Rovabio PhyPlus", "Microvit A Supra 1000"],
    addOns: ["Microvit Certification System", "Health-tracking dashboards"],
    services: ["Avi Feed Optimizer", "Diagnostic kit access"],
    advisory: ["Know-Health to know-medication", "Access to Adisseo KOL network"],
    oneLiner: "Know health to know medication — design out the need for AGPs.",
  },
  {
    csfId: "csf-feed-cost",
    product: ["Rhodimet AT88", "Rovabio Advance", "FRA LeciMax"],
    addOns: ["ADICT (full matrix)", "PNE NIR scans on raw materials"],
    services: ["Feed Digestibility Check (FDC)", "Reformulation workshops"],
    advisory: ["TFIP commercial deck", "On-site nutritionist coaching"],
    oneLiner: "Reveal · Formulate · Capture — squeeze 3% out of feed cost without losing performance.",
  },
  {
    csfId: "csf-diet-performance",
    product: ["Rovabio Advance", "FRA LeciMax", "Microvit E Promix 50"],
    addOns: ["Feedase predictor", "Custom matrix builds"],
    services: ["FDC", "ADG / FCR cycle reviews"],
    advisory: ["KOL field-trial endorsements", "Integrator-level performance reviews"],
    oneLiner: "Performance comes from precision — Adisseo's Feedase concept across the diet.",
  },
  {
    csfId: "csf-uniformity",
    product: ["Rovabio Advance", "Microvit A Supra 1000"],
    addOns: ["PNE on critical RM lots"],
    services: ["FDC monitoring per cycle"],
    advisory: ["Uniformity coaching with Adisseo poultry desk"],
    oneLiner: "If the lot varies, the flock varies — anchor uniformity in PNE-truth.",
  },
  {
    csfId: "csf-rm-cost",
    product: ["Rhodimet AT88 (full matrix)", "Rovabio Advance"],
    addOns: ["ADICT — alternative raw-material module"],
    services: ["Reformulation workshops on volatility"],
    advisory: ["TFIP commercial deck — purchaser cut"],
    oneLiner: "Volatility is permanent. The matrix is the lever.",
  },
  {
    csfId: "csf-rm-supply",
    product: ["Microvit Certification System", "Rovabio Advance"],
    addOns: ["Dual-sourcing whitelisting", "Lot-level traceability"],
    services: ["SustainWay onboarding"],
    advisory: ["Continuity-of-supply audits"],
    oneLiner: "Continuity is the unsexy KPI that keeps the buyer up at night.",
  },
];

export function valuePropFor(csfId: PoultryWorkshopCsfId): PoultryCsfValueProp | null {
  return poultryCsfValueProps.find((v) => v.csfId === csfId) ?? null;
}

/* ============================================================================
 * We Wish We Knew (Poster 3)
 * ========================================================================== */

export type WwwkBucket = "market" | "customer" | "competitor" | "ourCompany";

export interface PoultryWwwkRow {
  bucket: WwwkBucket;
  question: string;
  /** Owner the workshop assigned. */
  owner: string;
  /** Importance — workshop tag. */
  importance: "high" | "medium";
}

export const poultryWWWK: PoultryWwwkRow[] = [
  {
    bucket: "market",
    question: "True size of the AGP-free segment in VN / TH / ID 2026 vs 2027",
    owner: "APAC marketing",
    importance: "high",
  },
  {
    bucket: "market",
    question: "Region-by-region soybean-meal price sensitivity vs corn",
    owner: "APAC marketing",
    importance: "high",
  },
  {
    bucket: "customer",
    question: "Top 20 integrators' formulation cycle (weekly vs fortnightly)",
    owner: "Vish (poultry desk)",
    importance: "high",
  },
  {
    bucket: "customer",
    question: "Procurement vs nutrition decision-rights split per integrator",
    owner: "Vish (poultry desk)",
    importance: "medium",
  },
  {
    bucket: "competitor",
    question: "Cargill transparency note — full claim ladder, not just headline",
    owner: "Competitive intelligence",
    importance: "high",
  },
  {
    bucket: "competitor",
    question: "DSM-Firmenich enzyme matrix vs Rovabio Advance, post-merger",
    owner: "Competitive intelligence",
    importance: "high",
  },
  {
    bucket: "ourCompany",
    question: "Vet KOL coverage map across APAC — gaps for AGP-free narrative",
    owner: "Adisseo poultry team",
    importance: "high",
  },
  {
    bucket: "ourCompany",
    question: "Internal alignment between commercial deck claims and trial archive",
    owner: "Adisseo poultry team",
    importance: "medium",
  },
];

/* ============================================================================
 * Workshop insights (Poster 5) — 7 ranked observations
 * ========================================================================== */

export interface PoultryInsight {
  rank: number;
  title: string;
  summary: string;
  /** "so-what" — what changes in our positioning. */
  soWhat: string;
}

export const poultryInsights: PoultryInsight[] = [
  {
    rank: 1,
    title: "Cargill transparency note shifted purchaser conversations",
    summary:
      "Cargill's public ingredient-transparency push raised the bar on what purchasers expect from suppliers' lot-level disclosure.",
    soWhat:
      "Lead with PNE + Microvit Certification when meeting purchasers — match the transparency standard, do not chase it.",
  },
  {
    rank: 2,
    title: "Vet importance is rising vs nutritionist as decision-maker",
    summary:
      "AGP-ban adaptation moved gut-health and disease-mitigation conversations into the buying committee. The vet now opens doors the nutritionist used to own.",
    soWhat:
      "Build a vet-grade content track inside TFIP. Anchor on gut integrity, AGP-free, heat-stress mitigation.",
  },
  {
    rank: 3,
    title: "Feed-cost is permanent table-stakes, not a campaign theme",
    summary:
      "Buyers expect 1-3% cost discipline as a given. Feed-cost copy alone no longer differentiates — it has to be paired with a performance or sustainability claim.",
    soWhat:
      "Pair every Rhodimet/Rovabio cost claim with a performance or CO2 metric. Never run cost-only campaigns.",
  },
  {
    rank: 4,
    title: "AGP-ban adaptation differs by country",
    summary:
      "VN / TH / ID / PH / CN have different ban timelines and enforcement reality. One-size-fits-region is wrong.",
    soWhat:
      "Country-tagged content ladder — same TFIP backbone, different proof points and timings per country.",
  },
  {
    rank: 5,
    title: "Sustainability is finally tied to feed-mill P&L",
    summary:
      "ADICT's sustainability module made scope-3 reporting a feed-mill conversation, not just a brand-team conversation.",
    soWhat:
      "Move SustainWay assets out of marketing-only space into the feed-mill commercial deck.",
  },
  {
    rank: 6,
    title: "Purchaser cycle decoupled from nutritionist cycle",
    summary:
      "Purchasers buy on quarterly horizons, nutritionists on weekly — same campaign, different pacing.",
    soWhat:
      "Two cadences for the same campaign — quarterly purchaser drumbeat, weekly nutritionist-tactical drumbeat.",
  },
  {
    rank: 7,
    title: "QR-code + visit report = the cleanest lagging-metric signal",
    summary:
      "Tagging visit reports with the campaign QR is the single most reliable lagging signal we have.",
    soWhat:
      "Mandate QR-tagging on every TFIP physical asset. Tie /campaign-fanout output to campaignId for downstream attribution.",
  },
];

/* ============================================================================
 * Convenience helpers
 * ========================================================================== */

export function personaById(id: PoultryPersonaId): PoultryPersonaCard | null {
  return poultryEnterprisePersonas.find((p) => p.id === id) ?? null;
}

export function csfById(id: PoultryWorkshopCsfId): PoultryWorkshopCsf | null {
  return poultryWorkshopCSFs.find((c) => c.id === id) ?? null;
}
