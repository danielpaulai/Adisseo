/**
 * Adisseo Vault
 * -------------
 *
 * The customer-specific knowledge base every studio must anchor against.
 * Phase 2 of the trust-layer rollout.
 *
 * From the Apr 28 call:
 *   "Studios stop hallucinating numbers. Every claim cites either an
 *    Adisseo APAC trial protocol, a regulatory reference, an integrator
 *    quote, or a peer-reviewed paper. Otherwise the trust gate drops the
 *    citation-depth sub-score."
 *
 * The Vault is per-tenant and per-species. The Adisseo seed below is
 * illustrative of the shape we'd capture from the real APAC R&D archive.
 * In production we'd back this with pgvector + the Mistral OCR ingest.
 */

export type VaultKind =
  | "trial"          // controlled trial protocol + result
  | "field"          // commercial-farm field observation
  | "regulatory"     // government / industry-body reference
  | "publication"    // peer-reviewed paper
  | "quote"          // integrator / KOL quote (with named attribution)
  | "spec";          // product spec / lab-anchored claim

export type VaultSpecies = "aqua" | "poultry" | "ruminants" | "swine" | "cross";

/** Tenant id this vault entry belongs to. Defaults to "adisseo" for back-compat. */
export type VaultTenantId = "adisseo" | "dsm-firmenich" | "cargill" | "kemin";

export interface VaultEntry {
  id: string;
  /** Tenant scope. Phase 4 — defaults to "adisseo" for the seeded set. */
  tenantId?: VaultTenantId;
  kind: VaultKind;
  /** Short human-readable title used in citation cards. */
  title: string;
  /** One-paragraph summary the studios can quote almost verbatim. */
  summary: string;
  /** Key numbers — used by citation-checker to verify claims numerically. */
  metrics?: Array<{ label: string; value: string; unit?: string }>;
  /** Resolvable source URL (or "internal://path/to/pdf" for vault-only). */
  sourceUrl: string;
  /**
   * Verified-by-Adisseo flag. Only verified entries can be cited at the
   * higher trust tier. Externally-fetched evidence stays at lower tier
   * until reviewed.
   */
  verified: boolean;
  /** ISO date of the trial / publication. */
  date: string;
  /** Region tags for filtering. */
  regions: string[];
  /** Species tags. */
  species: VaultSpecies[];
  /** Free-form tags (CBI, mechanism, competitor, etc.). */
  tags: string[];
  /** Author / institution / integrator name (for "quote" kind especially). */
  attribution?: string;
  /** Embargo date if any (ISO). Studios refuse to cite while embargoed. */
  embargoUntil?: string;
}

/* ============================================================================
 * Seeded vault — ~30 entries across species, kinds, and regions.
 * Numbers chosen to match the trial figures already used in the studios.
 * ========================================================================== */

export const seededVault: VaultEntry[] = [
  // --- Aqua ---------------------------------------------------------------
  {
    id: "v-aqua-asfu-2025",
    kind: "trial",
    title: "Aquaculture-feed mycotoxin acceptance-gate trial · ID-Q4 2025",
    summary:
      "Indonesian shrimp-feed mill QC trial (n=12 batches) showed a 38% reduction in DON contamination after switching to Adisseo's mycotoxin binder protocol. Average dry-matter intake recovered to baseline within 7 days.",
    metrics: [
      { label: "DON reduction", value: "38", unit: "%" },
      { label: "DMI recovery", value: "7", unit: "days" },
      { label: "Sample size", value: "12 batches" },
    ],
    sourceUrl: "internal://vault/aqua/ID-mycotoxin-Q4-2025.pdf",
    verified: true,
    date: "2025-12-04",
    regions: ["Indonesia"],
    species: ["aqua"],
    tags: ["mycotoxin", "shrimp", "feed-safety", "QC"],
  },
  {
    id: "v-aqua-pangasius-vi-2026",
    kind: "trial",
    title: "Pangasius lecithin inclusion trial · VN-Q1 2026",
    summary:
      "Pangasius grow-out trial (3 pond replicates, 90 days) recorded a 0.07-point FCR improvement (1.41 vs. 1.48 control) when liquid lecithin was added at standard inclusion rate. Survival improved from 87% to 91%.",
    metrics: [
      { label: "FCR delta", value: "-0.07", unit: "points" },
      { label: "Survival", value: "91", unit: "%" },
      { label: "Trial duration", value: "90", unit: "days" },
    ],
    sourceUrl: "internal://vault/aqua/VN-pangasius-lecithin-Q1-2026.pdf",
    verified: true,
    date: "2026-02-12",
    regions: ["Vietnam"],
    species: ["aqua"],
    tags: ["pangasius", "lecithin", "FCR", "survival"],
  },
  {
    id: "v-aqua-trobos-2025",
    kind: "publication",
    title: "Trobos Aqua Sept-2025: Indonesian shrimp-feed mycotoxin survey",
    summary:
      "Industry survey published in Trobos Aqua reporting that 71% of Indonesian shrimp feed mills detected DON above 200 ppb in the Q3 2025 corn harvest — the highest figure in 4 years.",
    metrics: [
      { label: "Mills affected", value: "71", unit: "%" },
      { label: "DON threshold", value: "200", unit: "ppb" },
    ],
    sourceUrl: "https://trobos.com/aqua/2025-09",
    verified: true,
    date: "2025-09-15",
    regions: ["Indonesia"],
    species: ["aqua"],
    tags: ["mycotoxin", "industry-survey"],
  },
  {
    id: "v-aqua-quote-cprm-2026",
    kind: "quote",
    title: "CP Foods aquafeed QC manager · mycotoxin acceptance gate",
    summary:
      "On-the-record quote on adopting acceptance-gate testing at the receiving dock instead of post-mix QC.",
    sourceUrl: "internal://vault/quotes/cp-aquafeed-QC-2026-02.txt",
    verified: true,
    date: "2026-02-20",
    regions: ["Thailand", "Indonesia"],
    species: ["aqua"],
    tags: ["QC", "acceptance-gate", "integrator-voice"],
    attribution: "Pongthep N., aquafeed QC, CP Foods (anonymised in public collateral)",
  },

  // --- Poultry ------------------------------------------------------------
  {
    id: "v-poultry-agp-id-2026",
    kind: "trial",
    title: "AGP-Free broiler trial · ID-Q1 2026",
    summary:
      "Indonesian integrator commercial trial (4 farms, 220k birds) replacing AGP with Adisseo's eubiotic protocol. FCR 1.62 vs. 1.71 control (−0.09 points). 7-day mortality 1.8% vs. 2.4%. Trial protocol and EU registration on file.",
    metrics: [
      { label: "FCR delta", value: "-0.09", unit: "points" },
      { label: "Mortality delta", value: "-0.6", unit: "pp" },
      { label: "Birds", value: "220,000" },
    ],
    sourceUrl: "internal://vault/poultry/ID-AGP-free-Q1-2026.pdf",
    verified: true,
    date: "2026-01-18",
    regions: ["Indonesia"],
    species: ["poultry"],
    tags: ["AGP-free", "FCR", "mortality", "eubiotic"],
  },
  {
    id: "v-poultry-kemin-webinar-2026",
    kind: "publication",
    title: "Kemin AGP-Free Asia webinar · Jan 2026",
    summary:
      "Public webinar deck from Kemin discussing the post-AGP transition in SE-Asia poultry. Quotes Indonesian regulator timelines and specific eubiotic categories.",
    sourceUrl: "https://kemin.com/asia/agp-free-2026-webinar",
    verified: true,
    date: "2026-01-22",
    regions: ["Indonesia", "Thailand", "Vietnam"],
    species: ["poultry"],
    tags: ["AGP-free", "competitor-content", "Kemin"],
    attribution: "Kemin Industries APAC",
  },
  {
    id: "v-poultry-mintec-q1-2026",
    kind: "publication",
    title: "Mintec methionine price index · Q1 2026 APAC",
    summary:
      "DL-Met spot prices in APAC ports rose 11% Q4 2025 → Q1 2026 vs. liquid-methionine baseline holding flat. Integrator margin pressure cited.",
    metrics: [
      { label: "DL-Met price delta Q-o-Q", value: "+11", unit: "%" },
    ],
    sourceUrl: "https://mintec.com/methionine/2026-q1",
    verified: true,
    date: "2026-03-04",
    regions: ["APAC"],
    species: ["poultry", "swine"],
    tags: ["methionine", "pricing", "integrator-margin"],
  },
  {
    id: "v-poultry-quote-cp-2026",
    kind: "quote",
    title: "CP Indonesia broiler nutrition manager · AGP-free transition",
    summary:
      "On-the-record quote on switching from AGP to Adisseo's eubiotic protocol while keeping FCR within 0.05 points of pre-transition baseline.",
    sourceUrl: "internal://vault/quotes/cp-broiler-AGP-2026-01.txt",
    verified: true,
    date: "2026-01-30",
    regions: ["Indonesia"],
    species: ["poultry"],
    tags: ["AGP-free", "integrator-voice", "FCR"],
    attribution:
      "Andi W., broiler nutrition manager, CP Indonesia (anonymised in public collateral)",
  },

  // --- Ruminants ----------------------------------------------------------
  {
    id: "v-rum-hokkaido-2026",
    kind: "trial",
    title: "Hokkaido summer-yield heat-stress trial · JP-Q1 2026",
    summary:
      "Hokkaido dairy R&D trial (3 herds, 240 cows) showed milk-yield drop in heat-stress weeks reduced from 2.4 kg/cow/day to 0.9 kg/cow/day under Adisseo's heat-stress nutrition pack.",
    metrics: [
      { label: "Milk-yield drop reduction", value: "1.5", unit: "kg/cow/day" },
      { label: "Cows", value: "240" },
    ],
    sourceUrl: "internal://vault/ruminants/JP-hokkaido-heatstress-Q1-2026.pdf",
    verified: true,
    date: "2026-02-18",
    regions: ["Japan"],
    species: ["ruminants"],
    tags: ["heat-stress", "dairy", "Hokkaido", "summer-yield"],
  },
  {
    id: "v-rum-meti-jcredit-2026",
    kind: "regulatory",
    title: "METI J-credit framework draft for dairy methane · 2026",
    summary:
      "Japanese Ministry of Economy, Trade and Industry's draft J-credit framework allowing methane-reduction credits for dairy operations. Eligibility tied to recorded enteric-methane reduction ≥ 8%.",
    metrics: [
      { label: "Methane reduction threshold", value: "8", unit: "%" },
    ],
    sourceUrl: "https://www.meti.go.jp/jcredit/2026-draft",
    verified: true,
    date: "2026-02-01",
    regions: ["Japan"],
    species: ["ruminants"],
    tags: ["methane", "regulation", "J-credit", "ESG"],
  },
  {
    id: "v-rum-hokkaido-times-2025",
    kind: "publication",
    title: "Hokkaido Dairy Times summer-yield issue · Aug 2025",
    summary:
      "Special issue on summer-yield drops across Hokkaido prefecture, noting average 2.1 kg/cow/day reduction during the July-August heat wave and quoting two co-op procurement managers calling for targeted nutrition.",
    sourceUrl: "https://hokkaido-dairy-times.jp/2025-08",
    verified: true,
    date: "2025-08-22",
    regions: ["Japan"],
    species: ["ruminants"],
    tags: ["heat-stress", "Hokkaido", "industry-press"],
  },
  {
    id: "v-rum-quote-coop-2026",
    kind: "quote",
    title: "Hokkaido dairy co-op procurement · J-credit interest",
    summary:
      "Procurement-side voice on the J-credit framework's likely effect on which feed additives co-ops will subsidise.",
    sourceUrl: "internal://vault/quotes/hokkaido-coop-procurement-2026-03.txt",
    verified: true,
    date: "2026-03-04",
    regions: ["Japan"],
    species: ["ruminants"],
    tags: ["J-credit", "procurement-voice"],
    attribution: "Tanaka S., procurement, Hokkaido dairy co-op (anonymised)",
  },

  // --- Swine --------------------------------------------------------------
  {
    id: "v-swine-malaysia-asf-2025",
    kind: "trial",
    title: "Malaysia ASF nursery-recovery trial · Q4 2025",
    summary:
      "Malaysian integrator post-ASF recovery trial (4 nursery farms). 7-day mortality dropped from 4.1% to 3.4% under the Adisseo recovery protocol; FCR 1.62 vs. 1.71 control.",
    metrics: [
      { label: "FCR delta", value: "-0.09", unit: "points" },
      { label: "Mortality", value: "3.4", unit: "%" },
      { label: "Farms", value: "4" },
    ],
    sourceUrl: "internal://vault/swine/MY-ASF-recovery-Q4-2025.pdf",
    verified: true,
    date: "2025-11-06",
    regions: ["Malaysia"],
    species: ["swine"],
    tags: ["ASF", "nursery", "FCR", "mortality"],
  },
  {
    id: "v-swine-cargill-asf-webinar",
    kind: "publication",
    title: "Cargill SE-Asia ASF webinar · Q3 2025",
    summary:
      "Cargill's public webinar on ASF biosecurity protocols across SE-Asia, citing post-ASF nursery-recovery numbers and the role of acceptance-gate feed-safety testing.",
    sourceUrl: "https://cargill.com/animal-nutrition/se-asia-asf-2025",
    verified: true,
    date: "2025-09-28",
    regions: ["Malaysia", "Vietnam", "Thailand"],
    species: ["swine"],
    tags: ["ASF", "biosecurity", "competitor-content", "Cargill"],
  },
  {
    id: "v-swine-prrs-china-2026",
    kind: "trial",
    title: "PRRS recovery vertical trial · CN-Q1 2026",
    summary:
      "Chinese integrator PRRS-recovery commercial trial showing daily-gain recovery curve compressed by 2.8 days under Adisseo's gut-support protocol.",
    metrics: [
      { label: "Recovery time saved", value: "2.8", unit: "days" },
    ],
    sourceUrl: "internal://vault/swine/CN-PRRS-recovery-Q1-2026.pdf",
    verified: true,
    date: "2026-03-02",
    regions: ["China"],
    species: ["swine"],
    tags: ["PRRS", "recovery", "gut-health"],
  },
  {
    id: "v-swine-quote-vet-2025",
    kind: "quote",
    title: "Malaysian integrator vet · ASF nursery-recovery",
    summary:
      "On-the-record quote from a Malaysian integrator vet desk on the recovery curve compression observed in the Q4 2025 trial.",
    sourceUrl: "internal://vault/quotes/MY-vet-asf-2025-11.txt",
    verified: true,
    date: "2025-11-12",
    regions: ["Malaysia"],
    species: ["swine"],
    tags: ["ASF", "vet-voice"],
    attribution:
      "Dr. R. Tan, integrator vet desk, MY (anonymised in public collateral)",
  },

  // --- Cross / regulatory -------------------------------------------------
  {
    id: "v-reg-eu-feed-additives-2026",
    kind: "regulatory",
    title: "EU Feed Additives Register entry · Q1 2026",
    summary:
      "Adisseo's eubiotic and methionine ranges as listed on the EU Feed Additives Register — used for regulatory anchor when shipping into APAC integrators that import-mirror EU specs.",
    sourceUrl: "https://ec.europa.eu/food/safety/animal-feed/feed-additives/eu-register",
    verified: true,
    date: "2026-01-15",
    regions: ["Global"],
    species: ["cross"],
    tags: ["regulatory", "EU-register", "spec-anchor"],
  },
  {
    id: "v-reg-vietnam-mard-2025",
    kind: "regulatory",
    title: "Vietnam MARD circular · antimicrobial-feed timeline",
    summary:
      "Vietnam Ministry of Agriculture & Rural Development circular phasing antimicrobial growth promoters out of poultry feed by end-2026.",
    sourceUrl: "https://mard.gov.vn/circular/2025-AGP",
    verified: true,
    date: "2025-09-01",
    regions: ["Vietnam"],
    species: ["poultry", "swine"],
    tags: ["AGP-free", "regulation", "Vietnam"],
  },
  {
    id: "v-spec-rhodimet-2026",
    kind: "spec",
    title: "Rhodimet AT88 (liquid methionine) · spec sheet",
    summary:
      "Liquid methionine specification — 88% concentration, free-flowing, compatible with standard mill premix systems. Anchor for FCR claims in poultry / swine.",
    metrics: [
      { label: "Concentration", value: "88", unit: "%" },
    ],
    sourceUrl: "internal://vault/spec/rhodimet-at88-2026.pdf",
    verified: true,
    date: "2026-01-01",
    regions: ["Global"],
    species: ["poultry", "swine"],
    tags: ["methionine", "spec"],
  },

  /* =========================================================================
   * Phase 4 — multi-tenant seed entries.
   *
   * These illustrate that other tenants would carry their own Vault entries
   * with their own naming, tone, and regional anchors. Adisseo never sees
   * these in their default scope; they only appear when a user switches the
   * active tenant in the top-bar.
   * ========================================================================= */

  // --- DSM-Firmenich ------------------------------------------------------
  {
    id: "v-dsm-balancius-2026",
    tenantId: "dsm-firmenich",
    kind: "trial",
    title: "Balancius EU broiler trial · NL Q1 2026",
    summary:
      "DSM Balancius enzyme tested across 6 commercial Dutch broiler farms (n=144,000 birds). FCR improvement of 3.1 points and 1.4pp mortality reduction vs. control. Compliant with EU Reg. 2018/848.",
    metrics: [
      { label: "FCR improvement", value: "3.1", unit: "points" },
      { label: "Mortality reduction", value: "1.4", unit: "pp" },
    ],
    sourceUrl: "internal://dsm/vault/balancius-nl-q1-2026.pdf",
    verified: true,
    date: "2026-03-12",
    regions: ["EU", "NL"],
    species: ["poultry"],
    tags: ["enzyme", "broiler", "EU compliance"],
    attribution: "DSM-Firmenich Animal Nutrition R&D, Kaiseraugst",
  },
  {
    id: "v-dsm-bovaer-2026",
    tenantId: "dsm-firmenich",
    kind: "publication",
    title: "Bovaer (3-NOP) methane suppression · peer-reviewed meta-analysis",
    summary:
      "Pooled meta-analysis across 14 dairy trials shows 27% enteric methane suppression with no significant milk-yield trade-off. Used as the primary Vault anchor for all Bovaer claims under the EU Sustainable Dairy framework.",
    metrics: [
      { label: "Methane suppression", value: "27", unit: "%" },
      { label: "Milk yield delta", value: "0.0", unit: "kg/cow/day" },
    ],
    sourceUrl: "https://doi.org/10.3168/jds.2025.bovaer-meta",
    verified: true,
    date: "2025-11-04",
    regions: ["EU", "Global"],
    species: ["ruminants"],
    tags: ["methane", "Bovaer", "sustainability"],
    attribution: "Journal of Dairy Science, Vol. 108, 2025",
  },
  {
    id: "v-dsm-fra-fish-2025",
    tenantId: "dsm-firmenich",
    kind: "field",
    title: "Atlantic salmon Fra fish-meal substitute · Norway field result",
    summary:
      "Norwegian salmon farm field observation (3 sites) — Fra fish-meal substitute held growth performance within 2% of control while reducing fish-meal inclusion by 35%.",
    sourceUrl: "internal://dsm/vault/salmon-fra-no-2025.pdf",
    verified: true,
    date: "2025-09-22",
    regions: ["NO", "EU"],
    species: ["aqua"],
    tags: ["salmon", "alternative protein", "sustainability"],
    attribution: "DSM-Firmenich Aquaculture, Bergen",
  },

  // --- Cargill ------------------------------------------------------------
  {
    id: "v-cargill-promote-2026",
    tenantId: "cargill",
    kind: "trial",
    title: "Provimi Promote feed additive · Mexico swine trial",
    summary:
      "Mexican commercial swine trial across 4 nursery sites (n=14,200 piglets). Promote additive reduced post-weaning mortality by 0.8pp and improved nursery FCR by 2.4 points.",
    metrics: [
      { label: "Mortality reduction", value: "0.8", unit: "pp" },
      { label: "FCR improvement", value: "2.4", unit: "points" },
    ],
    sourceUrl: "internal://cargill/vault/promote-mx-q1-2026.pdf",
    verified: true,
    date: "2026-02-18",
    regions: ["MX", "LATAM"],
    species: ["swine"],
    tags: ["nursery", "promote", "swine"],
    attribution: "Cargill Animal Nutrition, Minneapolis R&D",
  },
  {
    id: "v-cargill-tilapia-br-2025",
    tenantId: "cargill",
    kind: "field",
    title: "EWOS tilapia field observation · Brazil 2025",
    summary:
      "Brazilian commercial tilapia farm result. EWOS feed program held growth rate at +6% vs. control across two grow-out cycles. Bulk-tank fillet yield ratio improved by 1.2pp.",
    sourceUrl: "internal://cargill/vault/tilapia-br-2025.pdf",
    verified: true,
    date: "2025-10-30",
    regions: ["BR", "LATAM"],
    species: ["aqua"],
    tags: ["tilapia", "EWOS", "growth"],
    attribution: "Cargill Aqua Nutrition, São Paulo",
  },
  {
    id: "v-cargill-quote-mx-2026",
    tenantId: "cargill",
    kind: "quote",
    title: "Mexican KOL quote · Promote post-weaning protocol",
    summary:
      '"After running the Promote nursery protocol across 4 sites, we held mortality below 2% during the high-stress window. The CRM team is now selling on this number." — head of nutrition, Granjas Carroll de México.',
    sourceUrl: "internal://cargill/vault/quote-gcm-2026.pdf",
    verified: true,
    date: "2026-04-04",
    regions: ["MX"],
    species: ["swine"],
    tags: ["KOL", "nursery", "Mexico"],
    attribution: "Granjas Carroll de México · head of nutrition",
  },

  // --- Kemin --------------------------------------------------------------
  {
    id: "v-kemin-clostat-2026",
    tenantId: "kemin",
    kind: "publication",
    title: "CLOSTAT (Bacillus subtilis) broiler peer-review",
    summary:
      "Peer-reviewed paper across 8 university trials shows CLOSTAT reduces necrotic enteritis incidence by 41% and improves bird uniformity by 2.8pp.",
    metrics: [
      { label: "NE reduction", value: "41", unit: "%" },
      { label: "Uniformity gain", value: "2.8", unit: "pp" },
    ],
    sourceUrl: "https://doi.org/10.3382/ps.2026.clostat-meta",
    verified: true,
    date: "2026-01-18",
    regions: ["Global"],
    species: ["poultry"],
    tags: ["probiotic", "necrotic enteritis", "broiler"],
    attribution: "Poultry Science, Vol. 105, 2026",
  },
  {
    id: "v-kemin-myco-2025",
    tenantId: "kemin",
    kind: "trial",
    title: "TOXFIN mycotoxin-binder Thailand swine trial",
    summary:
      "Thai integrator trial — 4 sites, 21,000 grow-finish pigs. TOXFIN reduced DON-related growth depression by 22% and stabilised feed-conversion variance.",
    metrics: [
      { label: "DON-related growth depression reduction", value: "22", unit: "%" },
    ],
    sourceUrl: "internal://kemin/vault/toxfin-th-2025.pdf",
    verified: true,
    date: "2025-12-09",
    regions: ["TH", "APAC"],
    species: ["swine"],
    tags: ["mycotoxin", "TOXFIN", "Thailand"],
    attribution: "Kemin AgriFoods APAC, Bangkok",
  },
];

/* ============================================================================
 * Search + lookup
 * ========================================================================== */

export interface VaultQuery {
  text?: string;
  species?: VaultSpecies | "all";
  region?: string | "all";
  kind?: VaultKind | "all";
  /** Tenant scope. Defaults to "all" (no tenant filter). */
  tenantId?: VaultTenantId | "all";
  /** Only verified entries. */
  verifiedOnly?: boolean;
  /** Cap results. */
  limit?: number;
}

export interface VaultHit {
  entry: VaultEntry;
  /** 0–1 relevance score. */
  score: number;
  /** Tokens that matched the query (for highlight). */
  matched: string[];
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "in", "on", "for", "to", "with",
  "is", "are", "was", "were", "by", "at", "from", "as", "be", "this", "that",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s%\-/]/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/**
 * Lightweight TF-style search against the seeded vault. In production this
 * would be a pgvector + BM25 hybrid retriever — but the shape stays the
 * same for the studios.
 */
export function searchVault(query: VaultQuery, vault: VaultEntry[] = seededVault): VaultHit[] {
  const text = (query.text ?? "").trim();
  const tokens = tokenize(text);
  const limit = query.limit ?? 12;
  const verifiedOnly = !!query.verifiedOnly;

  let pool = vault.slice();
  if (query.tenantId && query.tenantId !== "all") {
    // Untagged entries default to "adisseo" for back-compat.
    pool = pool.filter((e) => (e.tenantId ?? "adisseo") === query.tenantId);
  }
  if (query.species && query.species !== "all") {
    pool = pool.filter((e) => e.species.includes(query.species as VaultSpecies));
  }
  if (query.region && query.region !== "all") {
    pool = pool.filter((e) =>
      e.regions.some((r) => r.toLowerCase() === (query.region as string).toLowerCase())
    );
  }
  if (query.kind && query.kind !== "all") {
    pool = pool.filter((e) => e.kind === query.kind);
  }
  if (verifiedOnly) pool = pool.filter((e) => e.verified);

  if (!tokens.length) {
    // Return most-recent N when no query.
    return pool
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit)
      .map((entry) => ({ entry, score: 0.5, matched: [] }));
  }

  const hits: VaultHit[] = [];
  for (const entry of pool) {
    const haystack = [
      entry.title,
      entry.summary,
      entry.tags.join(" "),
      entry.regions.join(" "),
      entry.attribution ?? "",
      ...(entry.metrics ?? []).map((m) => `${m.label} ${m.value} ${m.unit ?? ""}`),
    ]
      .join(" ")
      .toLowerCase();
    const matched: string[] = [];
    let hits_ = 0;
    for (const t of tokens) {
      if (haystack.includes(t)) {
        matched.push(t);
        hits_ += 1;
      }
    }
    if (!hits_) continue;
    const score = Math.min(1, hits_ / Math.max(tokens.length, 1));
    hits.push({ entry, score, matched });
  }
  hits.sort((a, b) => b.score - a.score || b.entry.date.localeCompare(a.entry.date));
  return hits.slice(0, limit);
}

export function getVaultEntry(id: string, vault: VaultEntry[] = seededVault): VaultEntry | null {
  return vault.find((e) => e.id === id) ?? null;
}

export const VAULT_KIND_LABEL: Record<VaultKind, string> = {
  trial: "Controlled trial",
  field: "Field observation",
  regulatory: "Regulatory reference",
  publication: "Industry publication",
  quote: "Integrator / KOL quote",
  spec: "Product specification",
};

export const VAULT_KIND_TONE: Record<
  VaultKind,
  { bg: string; text: string; border: string; emoji: string }
> = {
  trial: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-300", emoji: "T" },
  field: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-300", emoji: "F" },
  regulatory: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-300", emoji: "R" },
  publication: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-300", emoji: "P" },
  quote: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-300", emoji: "Q" },
  spec: { bg: "bg-stone-100", text: "text-stone-800", border: "border-stone-300", emoji: "S" },
};

/** All distinct regions in the seeded vault. */
export function vaultRegions(vault: VaultEntry[] = seededVault): string[] {
  const set = new Set<string>();
  for (const e of vault) for (const r of e.regions) set.add(r);
  return Array.from(set).sort();
}
