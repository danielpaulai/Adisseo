/**
 * Turning Feed Into Profit (TFIP) — APAC poultry campaign corpus.
 *
 * Sourced from Ricardo's WeTransfer drop on 2026-04-30. The original assets
 * live under `vendor/tfip-corpus/` (gitignored). Each VaultEntry below is a
 * near-verbatim summary of the corresponding asset so the citation checker
 * can resolve TFIP claims against the real supporting material.
 *
 * Inclusion rule for entries: only material we can quote / cite without
 * interpretation. Numbers come straight from the leaflet, the optimize
 * doc, and the storytelling doc.
 */

import type { VaultEntry } from "@/lib/vault";

/* ============================================================================
 * Campaign metadata — every fan-out variant inherits this
 * ========================================================================== */

export interface TfipCampaign {
  id: "tfip";
  name: string;
  csfAnchor: string;
  qrCodePath: string;
  taglines: string[];
  pillars: string[];
}

export const TFIP_CAMPAIGN: TfipCampaign = {
  id: "tfip",
  name: "Turning Feed Into Profit",
  csfAnchor: "feed-cost+performance",
  qrCodePath: "/tfip/qr-code.png",
  taglines: [
    "Reveal the true value of your feed.",
    "Formulate with precision and confidence.",
    "Capture measurable, profitable results.",
  ],
  pillars: [
    "Reveal — measure raw-material variability with PNE.",
    "Formulate — apply precise matrices via ADICT.",
    "Capture — verify in-field with FDC; secure with Microvit; enable Sustainway.",
  ],
};

/* ============================================================================
 * TFIP_VAULT_ENTRIES — one entry per asset
 * ========================================================================== */

export const TFIP_VAULT_ENTRIES: VaultEntry[] = [
  {
    id: "v-tfip-leaflet",
    tenantId: "adisseo",
    kind: "spec",
    title: "TFIP Leaflet — The value of knowing your feed",
    summary:
      "Adisseo APAC poultry leaflet anchoring the 'Turning Feed Into Profit' campaign. Three pillars: Reveal, Formulate, Capture. Headline claim: up to 3% feed-cost savings when PNE + FDC + ADICT are used together. Reformulation example with Rovabio Advance shows a 27 cents/ton net saving when Rhodimet AT88 replaces NP99 (full-matrix application in grower broiler feed). The page closes on Adisseo's four commitments: identify your needs, optimise feed efficiency, deliver measurable profit, sustainable approach.",
    metrics: [
      { label: "Feed-cost savings", value: "3", unit: "%" },
      { label: "Net Rhodimet AT88 saving", value: "27", unit: "cents/ton" },
    ],
    sourceUrl: "internal://tfip/Final_Leaflet_poultry_FEED_EFFICIENCY.pdf",
    verified: true,
    date: "2025-10-15",
    regions: ["APAC", "Global"],
    species: ["poultry"],
    tags: ["tfip", "rovabio", "rhodimet", "pne", "fdc", "adict", "feed-cost"],
    attribution: "Adisseo APAC — TFIP campaign leaflet",
  },
  {
    id: "v-tfip-optimize-hr",
    tenantId: "adisseo",
    kind: "publication",
    title: "Measure, adjust and optimize — Turn poultry feed into profit",
    summary:
      "Long-form Adisseo white paper on the TFIP framework. Four steps: Reveal (PNE on raw-material variability — over 420,000 NIR samples per year, 460 active users worldwide); Formulate (ADICT online tool, ~100 raw materials, 130 nutrients, +30%/year activity); Capture (FDC predicts true AMEn under real farm conditions; Rovabio Advance unlocks 3.3% extra amino-acid digestibility — saves €16.1/MT in US corn diets and up to €16.4/MT in EU wheat/barley diets); Secure & Sustain (Microvit vitamin range — A Supra 1000, E Promix 50, Microvit Certification System screens 30+ contaminants; ADICT sustainability module on GFLI-database-backed LCA values across ~1,500 ingredient/origin couples).",
    metrics: [
      { label: "Combined PNE+FDC+ADICT saving", value: "3", unit: "%" },
      { label: "Rovabio US-corn saving", value: "16.1", unit: "EUR/MT" },
      { label: "Rovabio EU-wheat saving", value: "16.4", unit: "EUR/MT" },
      { label: "Carbon delta full vs 50% Rovabio matrix", value: "5.2", unit: "% less CO2" },
      { label: "PNE annual samples", value: "420000", unit: "samples/yr" },
      { label: "ADICT raw materials", value: "100" },
      { label: "Microvit screening contaminants", value: "30" },
    ],
    sourceUrl: "internal://tfip/Measure_adjust_and_optimize_HR.pdf",
    verified: true,
    date: "2025-10-20",
    regions: ["APAC", "EU", "Americas"],
    species: ["poultry"],
    tags: [
      "tfip",
      "pne",
      "fdc",
      "adict",
      "rovabio",
      "rhodimet",
      "microvit",
      "lecimax",
      "sustainway",
      "white-paper",
    ],
    attribution: "Adisseo — TFIP white paper",
  },
  {
    id: "v-tfip-storytelling",
    tenantId: "adisseo",
    kind: "publication",
    title: "TFIP — Storytelling brief (smarter safety margins)",
    summary:
      "Internal storytelling brief that converts the TFIP framework into per-channel narratives. Frames safety-margin economics in concrete €/ton terms: €1.86/ton per 1% energy error, €0.74/ton per 1% digestible AA error, €0.20/ton per 1% available P error. Recommends moving from risk-mitigation to optimisation by combining PNE (raw-material truth) + FDC (in-vivo digestion truth) + ADICT (formulation truth) and pairing with targeted enzymes (Rovabio Advance / Rovabio PhyPlus), emulsifier (FRA LeciMax — concentrated lysolecithins improving FCR + ADG), methionine source (Rhodimet AT88), and vitamin guarantees (Microvit Nutrition Guide 2026).",
    metrics: [
      { label: "Energy-error cost", value: "1.86", unit: "EUR/ton/%" },
      { label: "Digestible-AA-error cost", value: "0.74", unit: "EUR/ton/%" },
      { label: "Available-P-error cost", value: "0.20", unit: "EUR/ton/%" },
    ],
    sourceUrl: "internal://tfip/Story_telling.docx",
    verified: true,
    date: "2025-10-22",
    regions: ["APAC", "Global"],
    species: ["poultry"],
    tags: ["tfip", "storytelling", "safety-margin", "adisseo-tools"],
    attribution: "Adisseo — TFIP storytelling brief",
  },
  {
    id: "v-tfip-commercial-deck",
    tenantId: "adisseo",
    kind: "publication",
    title: "TFIP Commercial Presentation — APAC regional edit",
    summary:
      "Sales-team-facing commercial deck for the TFIP campaign in APAC. Frames the buyer pain (raw-material variability, pricing pressure, sustainability targets), positions the Reveal/Formulate/Capture story for nutritionists, vets, and purchasers, and closes with the Adisseo commitment matrix (Identify needs, Optimise feed efficiency, Deliver measurable profit, Sustainable approach). Includes the QR code for in-field handouts so visit reports can be tagged with the campaign id.",
    sourceUrl: "internal://tfip/Commercial_Presentation_TFIP_APAC_Reg_edit.pptx",
    verified: true,
    date: "2025-11-02",
    regions: ["APAC"],
    species: ["poultry"],
    tags: ["tfip", "commercial-deck", "sales-enablement", "qr-code"],
    attribution: "Adisseo APAC — TFIP commercial deck",
  },
  {
    id: "v-tfip-technical-deck",
    tenantId: "adisseo",
    kind: "publication",
    title: "TFIP Technical Presentation — full data pack",
    summary:
      "Technical deep-dive for nutritionists and vet KOLs. Covers the full Adisseo poultry tooling: PNE NIR predictions, FDC AMEn validation, ADICT integration, Feedase concept (Rovabio Advance + Rovabio PhyPlus), FRA LeciMax mode of action, Rhodimet AT88 matrix values (HMTBa 88% min, ABC-4, energy/CP equivalence), Microvit A Supra 1000 and E Promix 50 stability data, and the Sustainway four-step service. Used for technical buyer conversations and KOL endorsements.",
    sourceUrl: "internal://tfip/Technical_presentation_TFIP.pptx",
    verified: true,
    date: "2025-11-02",
    regions: ["APAC", "Global"],
    species: ["poultry"],
    tags: [
      "tfip",
      "technical-deck",
      "rovabio",
      "rhodimet",
      "lecimax",
      "microvit",
      "feedase",
      "sustainway",
    ],
    attribution: "Adisseo — TFIP technical deck",
  },
  {
    id: "v-tfip-feed-efficiency-brochure",
    tenantId: "adisseo",
    kind: "spec",
    title: "Feed Efficiency Brochure — high-resolution edition",
    summary:
      "Print-grade APAC poultry brochure (Feed Efficiency edition) supporting the TFIP campaign. Cover positions the value of feed efficiency as an APAC-wide profitability lever; inside spreads cover the Reveal/Formulate/Capture pillars with regional case studies. Designed for trade-magazine inserts and integrator visits.",
    sourceUrl: "internal://tfip/brochure_poultry_FEED_EFFICIENCY-HD.pdf",
    verified: true,
    date: "2025-10-18",
    regions: ["APAC"],
    species: ["poultry"],
    tags: ["tfip", "brochure", "feed-efficiency", "trade-mag"],
    attribution: "Adisseo APAC — Feed Efficiency brochure",
  },
  {
    id: "v-tfip-sustainway",
    tenantId: "adisseo",
    kind: "publication",
    title: "SustainWay — Sustainability with Rovabio + LeciMax",
    summary:
      "Adisseo SustainWay sustainability journey for poultry, the four-step service (SustainBeginner, SustainGrower, SustainPioneer, SustainMaster). Trial data: 100% Rovabio matrix (vs 50%) cuts feed CO2-eq by 5.2%; for a 100,000 MT/year mill that is roughly 4,600 MT CO2 / year — equivalent to the annual energy emissions of about 1,000 homes (or 1,000 cars). Pairs with FRA LeciMax (lysolecithin emulsifier) to further drop oil inclusion. Surfaces in ADICT's sustainability module via GFLI-database LCA values.",
    metrics: [
      { label: "Rovabio full-matrix CO2 reduction", value: "5.2", unit: "% vs 50% matrix" },
      { label: "Annualised CO2 saving (100k MT/yr mill)", value: "4600", unit: "MT CO2/yr" },
    ],
    sourceUrl: "internal://tfip/SustainWay_Sustainability_Rovabio_Lecimax.pptx",
    verified: true,
    date: "2025-11-04",
    regions: ["APAC", "EU", "Global"],
    species: ["poultry"],
    tags: ["tfip", "sustainability", "rovabio", "lecimax", "scope-3", "gfli"],
    attribution: "Adisseo SustainWay — Rovabio + LeciMax",
  },
  {
    id: "v-tfip-video-deck",
    tenantId: "adisseo",
    kind: "publication",
    title: "TFIP Video-only deck",
    summary:
      "Video-only commercial cut of the TFIP narrative for use as a screen-handout in customer visits and on trade-show displays. No voiceover; the deck is built to play on a loop while a sales rep walks through the QR-coded brochure live.",
    sourceUrl: "internal://tfip/Turning_Feed_into_Profit_Video_only.pptx",
    verified: true,
    date: "2025-11-02",
    regions: ["APAC"],
    species: ["poultry"],
    tags: ["tfip", "video", "trade-show", "loop"],
    attribution: "Adisseo APAC — TFIP video deck",
  },
];

/* ============================================================================
 * Convenience exports
 * ========================================================================== */

export function tfipEntriesByTag(tag: string): VaultEntry[] {
  return TFIP_VAULT_ENTRIES.filter((e) => e.tags.includes(tag));
}

export const TFIP_PRIMARY_METRICS = [
  { label: "Feed-cost savings (PNE+FDC+ADICT)", value: "up to 3%", source: "TFIP leaflet" },
  { label: "Rhodimet AT88 net saving", value: "27 cents/ton", source: "TFIP leaflet" },
  { label: "Rovabio US-corn diets", value: "€16.1/MT", source: "TFIP white paper" },
  { label: "Rovabio EU wheat/barley", value: "€16.4/MT", source: "TFIP white paper" },
  { label: "Energy-error cost", value: "€1.86/ton per 1% error", source: "TFIP storytelling" },
  { label: "Digestible-AA-error cost", value: "€0.74/ton per 1% error", source: "TFIP storytelling" },
  { label: "Available-P-error cost", value: "€0.20/ton per 1% error", source: "TFIP storytelling" },
  { label: "Rovabio CO2 delta (full vs 50% matrix)", value: "-5.2%", source: "SustainWay deck" },
  { label: "PNE annual samples", value: "420,000+ samples/yr", source: "TFIP white paper" },
  { label: "ADICT raw materials", value: "~100", source: "TFIP white paper" },
];
