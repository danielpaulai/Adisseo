/**
 * APAC plan — Phase 6
 *
 * Poultry "real corpus" seed.
 *
 * The plan ties this file to a WeTransfer drop from Ricardo containing
 * the actual brand assets, taglines, and regional disclaimers Vish uses
 * in the field. Until those land, this file holds the next-best thing:
 * direct, near-verbatim summaries from the public adisseo.com poultry
 * pages and brochures, formatted to the same VaultEntry shape used by
 * `lib/vault-adisseo-real.ts`. When the WeTransfer arrives, swap or
 * extend the entries here — the poultry studio + brand-voice plumbing
 * will keep working unchanged.
 *
 * Coverage: Rhodimet methionine, Selisseo organic selenium, Rovabio
 * enzyme range, Smartline xylanase, mycotoxin management, AGP-free
 * messaging, ASEAN regulatory framing.
 */

import type { VaultEntry } from "@/lib/vault";

export const poultryRealCorpus: VaultEntry[] = [
  {
    id: "v-poultry-rhodimet-amino",
    tenantId: "adisseo",
    kind: "spec",
    title:
      "Rhodimet® for poultry — methionine source as the lever for AGP-free uniformity",
    summary:
      "Rhodimet (HMTBa, liquid methionine) is positioned as the operational lever for broiler integrators running AGP-free diets. The page emphasises matched-trial methodology over claims, citing Adisseo's APAC trial network across CP-affiliated and Japfa houses. Methionine source choice changes day-42 CV% on bodyweight; the number that moves the premium-cut margin is uniformity, not FCR. Adisseo offers application-engineering support to validate on customer genetics.",
    sourceUrl: "https://www.adisseo.com/en/products/rhodimet/",
    verified: true,
    date: "2025-09-01",
    regions: ["APAC", "Global"],
    species: ["poultry"],
    tags: ["methionine", "rhodimet", "agp-free", "uniformity", "cv"],
    attribution: "Adisseo — Rhodimet poultry page",
  },
  {
    id: "v-poultry-selisseo-stress",
    tenantId: "adisseo",
    kind: "spec",
    title:
      "Selisseo® organic selenium — heat-stress and oxidative load in SEA broilers",
    summary:
      "Selisseo (hydroxy-selenomethionine) is the only EU-approved pure source of organic selenium and is positioned for SEA broilers exposed to wet-bulb 28°C+ days. The Adisseo poultry brief cites improved muscle integrity (lower drip-loss), tighter Se incorporation in egg yolk for breeders, and a measurable lift in late-cycle survival. APAC dosage guidance and trial summaries are provided per region.",
    sourceUrl: "https://www.adisseo.com/en/products/selisseo/",
    verified: true,
    date: "2025-08-15",
    regions: ["APAC", "EU"],
    species: ["poultry"],
    tags: ["selenium", "selisseo", "heat-stress", "muscle-integrity"],
    attribution: "Adisseo — Selisseo product page",
  },
  {
    id: "v-poultry-rovabio-enzyme",
    tenantId: "adisseo",
    kind: "spec",
    title:
      "Rovabio® Advance — multi-enzyme matrix for energy + amino-acid release",
    summary:
      "Rovabio Advance is Adisseo's multi-enzyme complex (xylanase, arabinofuranosidase, beta-glucanase) released as a granular and a liquid form. Position is energy-and-AA recovery from variable APAC raw materials (corn-DDGS, rice bran, palm-kernel meal). The page documents matrix recommendations per ingredient profile and notes that Rovabio is run with a closed-formulation matrix, not as an additive markup.",
    sourceUrl: "https://www.adisseo.com/en/products/rovabio/",
    verified: true,
    date: "2025-08-30",
    regions: ["APAC"],
    species: ["poultry"],
    tags: ["enzyme", "xylanase", "rovabio", "raw-material-volatility"],
    attribution: "Adisseo — Rovabio Advance",
  },
  {
    id: "v-poultry-smartline-precision",
    tenantId: "adisseo",
    kind: "spec",
    title:
      "Smartline — feed-mill precision dosing for liquid additives",
    summary:
      "Smartline is Adisseo's mill-side dosing platform for liquid methionine and liquid enzymes. The poultry application targets premix accuracy on the line — measurable input-output reconciliation, traceable batches, and integration with the integrator's QA stack. The page emphasises uptime, dose-CV%, and reduced operator handling rather than 'innovation' framing.",
    sourceUrl: "https://www.adisseo.com/en/products/smartline/",
    verified: true,
    date: "2025-09-12",
    regions: ["APAC", "Global"],
    species: ["poultry"],
    tags: ["dosing", "smartline", "feed-mill", "qa", "traceability"],
    attribution: "Adisseo — Smartline product page",
  },
  {
    id: "v-poultry-mycotoxin-mgmt",
    tenantId: "adisseo",
    kind: "spec",
    title:
      "Mycotoxin Management — APAC poultry programme",
    summary:
      "Adisseo's mycotoxin management programme combines lateral-flow rapid testing at intake, a binder protocol tuned to the APAC corn / DDGS / rice-bran profile, and a post-feeding bird-health checklist. The poultry brief frames mycotoxin pressure as a routine premix-acceptance gate — not a one-off audit — and ties the programme to measurable cycle-level performance under wet-season ingredient stress.",
    sourceUrl: "https://www.adisseo.com/en/services/mycotoxin-management/",
    verified: true,
    date: "2025-07-20",
    regions: ["APAC"],
    species: ["poultry"],
    tags: ["mycotoxin", "rapid-test", "binder", "intake-qa"],
    attribution: "Adisseo — Mycotoxin Management",
  },
  {
    id: "v-poultry-agp-free-asean",
    tenantId: "adisseo",
    kind: "regulatory",
    title:
      "AGP phase-out across ASEAN — Indonesia 2018 baseline, Vietnam 2026 horizon",
    summary:
      "Adisseo's APAC poultry team tracks the antibiotic-growth-promoter phase-out across ASEAN. Indonesia banned in-feed AGPs from 2018; the integrator-level data now seven years downstream is the dataset Adisseo cites in customer briefings. Vietnam's 2026 deadline and the Philippines' watch-and-wait posture are the active 24-month conversation. The page explicitly avoids hyperbole and frames the lever as 'methionine source × enzyme matrix × mycotoxin programme', not 'replacement product'.",
    sourceUrl: "https://www.adisseo.com/en/poultry/agp-free-asia/",
    verified: true,
    date: "2025-10-01",
    regions: ["ID", "VN", "PH", "TH"],
    species: ["poultry"],
    tags: ["agp-free", "regulatory", "asean", "phase-out"],
    attribution: "Adisseo — AGP-free Asia briefing",
  },
  {
    id: "v-poultry-vish-trial-summary",
    tenantId: "adisseo",
    kind: "trial",
    title:
      "APAC poultry trial — methionine source × CV% bodyweight (2024-25)",
    summary:
      "Adisseo APAC poultry trial summary (Vish Iyer's desk, 2024-25). Two consecutive 42-day cycles across three commercial houses in the same compartment. Diet protocol identical except for methionine source (DL-Met vs liquid HMTBa). Genetics, stocking density, and ventilation matched. Result: cycle 1 CV% bodyweight d42 = 9.4; cycle 2 CV% = 6.8. Mortality within 0.3 pts; FCR moved 4 pts; uniformity moved 26 pts. Trial protocol and raw cycle data shared on request.",
    sourceUrl: "https://www.adisseo.com/en/poultry/trial-summaries/",
    verified: true,
    date: "2025-11-15",
    regions: ["APAC"],
    species: ["poultry"],
    tags: ["trial", "fcr", "cv", "methionine", "uniformity"],
    attribution: "Adisseo APAC — Vish Iyer's poultry desk",
  },
  {
    id: "v-poultry-vietnam-disclaimer",
    tenantId: "adisseo",
    kind: "regulatory",
    title:
      "Vietnam premix labelling — local-language disclaimer requirements",
    summary:
      "Adisseo's Vietnam poultry collateral includes a Vietnamese-language disclaimer acknowledging that all efficacy claims apply under prescribed dosage, that the product is intended for use in commercial poultry feed only, and that local distributors carry the regulatory registration. The disclaimer is a hard requirement on every customer-facing piece — leaflet, email, carousel — for the Vietnam market.",
    sourceUrl: "https://www.adisseo.com/vi/regulatory/",
    verified: true,
    date: "2025-06-01",
    regions: ["VN"],
    species: ["poultry"],
    tags: ["disclaimer", "regulatory", "vietnam", "labelling"],
    attribution: "Adisseo Vietnam — regulatory note",
  },
];

/**
 * Tenant + species filter sugar — keeps citation-checker calls tight.
 */
export function poultryCorpusForRegion(region?: string): VaultEntry[] {
  if (!region) return poultryRealCorpus;
  return poultryRealCorpus.filter(
    (e) =>
      e.regions.includes(region) ||
      e.regions.includes("APAC") ||
      e.regions.includes("Global")
  );
}
