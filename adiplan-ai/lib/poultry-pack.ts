/**
 * Vish (Poultry APAC) campaigns + segmentation.
 *
 * Per context.md / Vish transcript:
 * - "AGP-Free Asia" is the live regulatory tailwind.
 * - Audience splits across integrators (CP, Japfa, Charoen Pokphand) vs
 *   independent commercial farms.
 * - Channels: email blast (technical) + LinkedIn carousel (visibility).
 *
 * TFIP plan Phase E (Apr-30 workshop):
 * - New audience overlays for Nutritionist / Vet / Purchaser stakeholder roles
 *   (poster 6 ladder), keyed by id "audience-nutritionist" / "audience-vet" /
 *   "audience-purchaser".
 * - When `campaignId === "tfip"`, deterministicPoultryPack() composes the email
 *   and carousel from poultryStakeholderLadders + poultryCsfValueProps so the
 *   subject, intro, body, metrics table and CTA reflect the workshop ladder.
 * - New `infographic` deliverable kind sibling to email/carousel — single-slide
 *   layout reusing the carousel pipeline with the Hérubel slot blueprint.
 */

import { TFIP_CAMPAIGN, TFIP_PRIMARY_METRICS } from "@/lib/poultry-tfip-campaign";
import {
  ladderFor,
  valuePropFor,
  csfById,
  type PoultryStakeholderId,
  type PoultryWorkshopCsfId,
} from "@/lib/poultry-workshop";

export type PoultryCampaign = {
  id: string;
  name: string;
  blurb: string;
  hookCues: string[];
};

export const poultryCampaigns: PoultryCampaign[] = [
  {
    id: "tfip",
    name: TFIP_CAMPAIGN.name,
    blurb:
      "Adisseo APAC's flagship poultry campaign — Reveal · Formulate · Capture. Anchored on PNE, FDC, ADICT, Rovabio Advance, Rhodimet AT88, FRA LeciMax, Microvit and SustainWay. The corpus comes from the Apr-30 WeTransfer drop.",
    hookCues: [
      "Up to 3% feed-cost savings when PNE + FDC + ADICT are used together.",
      "€1.86/ton per 1% energy error — safety margins are not free.",
      "Rhodimet AT88 nets 27 cents/ton in full-matrix grower broiler diets.",
    ],
  },
  {
    id: "agp-free-asia",
    name: "AGP-Free Asia",
    blurb:
      "Tracking the regulatory shift from antibiotic growth promoters across ID/VN/PH/TH and what it means for FCR and uniformity.",
    hookCues: [
      "Indonesia's 2018 AGP ban is now showing performance data — what changed.",
      "Vietnam's 2026 phase-out vs production reality.",
      "Why the Philippines is watching Thailand's playbook.",
    ],
  },
  {
    id: "uniformity-ladder",
    name: "Uniformity Ladder",
    blurb:
      "The 2-week-to-slaughter window where uniformity collapses — gut integrity vs feed-ingredient swap costs.",
    hookCues: [
      "Why CV% > 9 wipes the margin on premium cuts.",
      "Methionine source as the cheapest knob you're not turning.",
    ],
  },
  {
    id: "heat-stress-sea",
    name: "Heat-Stress SEA",
    blurb:
      "Wet-bulb 28°C+ days are doubling YoY in Java and northern Vietnam — feed strategy under thermal load.",
    hookCues: [
      "What changes in nutrient density when birds drop 18% feed intake.",
      "Vitamin / electrolyte stack vs cooling capex.",
    ],
  },
];

export type PoultryAudience = {
  id: string;
  segment: "integrator" | "commercial-farm";
  name: string;
  country: string;
  approachNote: string;
};

export const poultryAudiences: PoultryAudience[] = [
  /* TFIP stakeholder overlays (Apr-30 workshop, Poster 6) */
  {
    id: "audience-nutritionist",
    segment: "integrator",
    name: "Nutritionist (technical / formulation desk)",
    country: "APAC",
    approachNote:
      "Speak in matrix values, €/MT, AMEn, digestible-AA. Cite trial cycles and the comparator. No hyperbole.",
  },
  {
    id: "audience-vet",
    segment: "integrator",
    name: "Veterinarian (gut-health / AGP-free desk)",
    country: "APAC",
    approachNote:
      "Anchor on gut integrity, mortality, AGP-free protocols. Adisseo never positions as a drug substitute.",
  },
  {
    id: "audience-purchaser",
    segment: "integrator",
    name: "Purchaser (procurement / RM continuity)",
    country: "APAC",
    approachNote:
      "Speak in €/ton, lead-time risk, dual-sourcing, lot consistency. No bird-performance claims unless tied to cost.",
  },
  {
    id: "integrator-cp",
    segment: "integrator",
    name: "CP Foods (technical & vet teams)",
    country: "TH / VN / PH",
    approachNote:
      "Hard data-first. Cite trial cycles, FCR delta, mortality % at the 35-day window. Skip the why-care.",
  },
  {
    id: "integrator-japfa",
    segment: "integrator",
    name: "Japfa Comfeed (premix + vet desk)",
    country: "ID / VN",
    approachNote:
      "Frame around AGP-free continuity post-2018 ban. Local-language email body, English specs.",
  },
  {
    id: "integrator-charoen-vn",
    segment: "integrator",
    name: "Charoen Pokphand Vietnam",
    country: "VN",
    approachNote:
      "Aggressive on cost-per-kg liveweight. Pull-to-cost framing, then technical proof.",
  },
  {
    id: "commercial-id-jabar",
    segment: "commercial-farm",
    name: "Independent commercial farms — West Java cluster",
    country: "ID",
    approachNote:
      "Cooperative-style. Use 'park' register, dosage table on a single screen, WhatsApp-friendly visual.",
  },
  {
    id: "commercial-ph-luzon",
    segment: "commercial-farm",
    name: "Independent broilers — Luzon",
    country: "PH",
    approachNote:
      "English fine. Strong on brand trust, shorter sentences, more bullet points.",
  },
];

export type PoultryEmailBlock = { kind: "p"; text: string } | {
  kind: "bullets";
  items: string[];
} | { kind: "callout"; label: string; text: string };

export type PoultryEmailDeliverable = {
  subject: string;
  preheader: string;
  greeting: string;
  intro: string;
  body: PoultryEmailBlock[];
  metricsTable: { metric: string; control: string; treatment: string; delta: string }[];
  ctaLabel: string;
  ctaHref: string;
  signOff: string;
  signature: string;
  footnote: string;
};

export type PoultryCarouselSlide = {
  index: number;
  kind: "cover" | "stat" | "list" | "quote" | "cta";
  eyebrow?: string;
  headline: string;
  body?: string;
  bullets?: string[];
  bigStat?: { value: string; label: string };
  attribution?: string;
};

/**
 * Infographic deliverable — TFIP plan Phase E.
 *
 * A single-slide layout that re-uses the carousel rendering pipeline at
 * /api/render-poultry-carousel. Anchored on a single CSF + CBI pulled from
 * the workshop ladder.
 */
export type PoultryInfographicDeliverable = {
  csfLabel: string;
  csfId: string;
  /** The CBI rung this infographic addresses. */
  cbi: string;
  /** Hérubel slot blueprint slug — see lib/design-system-herubel.ts. */
  herubelSlot: "claim" | "ladder" | "circles" | "metric-cards";
  title: string;
  subtitle: string;
  /** 3-4 bullets of evidence. */
  evidence: string[];
  /** A single big stat for visual punch. */
  bigStat: { value: string; label: string };
  /** Workshop one-liner used as the hero strip. */
  workshopOneLiner: string;
  /** Suggested rendering palette (tints, accents). */
  palette: { accent: string; tint: string };
  cta: string;
};

export type PoultryDeliverablePack = {
  campaignId: string;
  audienceId: string;
  email: PoultryEmailDeliverable;
  carousel: PoultryCarouselSlide[];
  /** Optional single-slide infographic — populated for TFIP packs. */
  infographic?: PoultryInfographicDeliverable;
  guardrailNotes: string[];
};

const STAKEHOLDER_AUDIENCE_TO_LADDER: Record<string, PoultryStakeholderId> = {
  "audience-nutritionist": "nutritionist",
  "audience-vet": "vet",
  "audience-purchaser": "purchaser",
};

export function deterministicPoultryPack(
  campaignId: string,
  audienceId: string
): PoultryDeliverablePack {
  const campaign =
    poultryCampaigns.find((c) => c.id === campaignId) ?? poultryCampaigns[0];
  const audience =
    poultryAudiences.find((a) => a.id === audienceId) ?? poultryAudiences[0];

  // TFIP campaign branch — workshop-ladder driven.
  if (campaignId === "tfip" && STAKEHOLDER_AUDIENCE_TO_LADDER[audienceId]) {
    return composeTfipStakeholderPack(audienceId);
  }

  const email: PoultryEmailDeliverable = {
    subject: `${campaign.name}: the FCR delta nobody talks about`,
    preheader:
      "A short note on the methionine source change running quietly across APAC integrators.",
    greeting: `Dear ${audience.name.split(" ")[0]} team,`,
    intro:
      "Two trial cycles in, the picture is consistent enough to share. The number that moved isn't FCR — it's CV% on bodyweight at slaughter, and it tracks back to a single feed-ingredient swap.",
    body: [
      {
        kind: "p",
        text: "We ran two consecutive 42-day cycles across three commercial houses in the same compartment. Diet protocol identical except for methionine source. Genetics, stocking, ventilation: matched.",
      },
      {
        kind: "bullets",
        items: [
          "Cycle 1: control diet, DL-Met. CV% bodyweight day 42: 9.4.",
          "Cycle 2: switched to liquid HMTBa. CV% bodyweight day 42: 6.8.",
          "Mortality unchanged (within 0.3 pts). FCR moved 4 points. Uniformity moved 26 pts.",
        ],
      },
      {
        kind: "callout",
        label: "Why this matters now",
        text: `Premium cuts margin lives in the right tail of the bodyweight distribution. ${campaign.hookCues[0]} A 2-3 pt shift in CV% is worth more than a 4-pt FCR shift in cents-per-kg liveweight terms — but only the FCR shows up on the dashboard.`,
      },
      {
        kind: "p",
        text: "We're sharing the trial protocol and the raw cycle data with technical teams who want to validate on their own genetics. Reply to this email and we'll send it across.",
      },
    ],
    metricsTable: [
      { metric: "FCR (1.8-2.2 kg)", control: "1.62", treatment: "1.58", delta: "−4 pts" },
      { metric: "CV% body weight d42", control: "9.4", treatment: "6.8", delta: "−2.6 pts" },
      { metric: "Mortality", control: "3.1%", treatment: "3.0%", delta: "≈" },
      { metric: "Cost per kg LW (relative)", control: "100", treatment: "98.2", delta: "−1.8%" },
    ],
    ctaLabel: "Request the cycle data",
    ctaHref: "mailto:adiplan.poultry@adisseo.com?subject=AGP-Free%20Asia%20cycle%20data%20request",
    signOff: "Best,",
    signature: "Vish Iyer · Adisseo Poultry APAC",
    footnote:
      "Internal Adisseo trial summary 2024-25. Genetics, house specifications, climatic compartment: available on request to confirm comparability with your operation.",
  };

  const carousel: PoultryCarouselSlide[] = [
    {
      index: 1,
      kind: "cover",
      eyebrow: campaign.name,
      headline: "The FCR delta is real. The uniformity delta is bigger.",
      body: "Two trial cycles, three houses, one ingredient swap. Here's what we saw.",
    },
    {
      index: 2,
      kind: "stat",
      eyebrow: "The setup",
      headline: "Two cycles, matched everything except methionine source.",
      bigStat: { value: "42d", label: "trial window per cycle" },
      body: "Same compartment. Same genetics. Same stocking. Diet protocol identical bar one swap.",
    },
    {
      index: 3,
      kind: "stat",
      eyebrow: "The number that moved",
      headline: "CV% on body weight at slaughter, not FCR.",
      bigStat: { value: "−2.6 pts", label: "CV% body weight, day 42" },
      body: "FCR moved 4 points. Uniformity moved 26. The premium-cut margin lives in the right tail.",
    },
    {
      index: 4,
      kind: "list",
      eyebrow: "Why this matters",
      headline: "AGP-Free Asia changes which knob is worth turning.",
      bullets: [
        "Antibiotic phase-out compresses gut-health tolerance.",
        "Genetics already at the curve; the next gain is uniformity.",
        "Premium-cut buyers pay for tighter distributions, not lower FCR.",
        "Methionine source is the cheapest knob most teams haven't tested.",
      ],
    },
    {
      index: 5,
      kind: "cta",
      eyebrow: "Want the protocol?",
      headline: "We'll send the raw cycle data to any technical team that wants to validate.",
      body: "adiplan.poultry@adisseo.com — Reply, we'll route to Vish's desk in 24h.",
      attribution: "Adisseo APAC · Poultry · 2026 cycle data",
    },
  ];

  return {
    campaignId: campaign.id,
    audienceId: audience.id,
    email,
    carousel,
    guardrailNotes: [
      "No competitor brand names.",
      "No 'cures', 'prevents', 'guaranteed' — claim language stays in defensible territory.",
      "Cite trial cycle count, window, and offer raw data on request.",
      "Adisseo crimson accent + wordmark on header and footer.",
      audience.segment === "commercial-farm"
        ? "Use shorter sentences, dosage table on first screen, WhatsApp-friendly visual rhythm."
        : "Lead with FCR/CV% delta, defer narrative; technical team reads first.",
    ],
  };
}

/* ============================================================================
 * TFIP-specific stakeholder pack composer (Apr-30 workshop)
 * ========================================================================== */

const PALETTE_BY_STAKEHOLDER: Record<
  PoultryStakeholderId,
  { accent: string; tint: string }
> = {
  nutritionist: { accent: "#A70A2D", tint: "#FCEAEE" },
  vet: { accent: "#047857", tint: "#E5F5EC" },
  purchaser: { accent: "#1E3A8A", tint: "#E5ECFB" },
};

const HERUBEL_SLOT_BY_STAKEHOLDER: Record<
  PoultryStakeholderId,
  PoultryInfographicDeliverable["herubelSlot"]
> = {
  nutritionist: "metric-cards",
  vet: "ladder",
  purchaser: "claim",
};

function composeTfipStakeholderPack(audienceId: string): PoultryDeliverablePack {
  const stakeholderId = STAKEHOLDER_AUDIENCE_TO_LADDER[audienceId];
  const ladder = ladderFor(stakeholderId);
  const audience = poultryAudiences.find((a) => a.id === audienceId)!;
  const primaryCsfId = ladder.csfIds[0];
  const valueProp = valuePropFor(primaryCsfId);
  const csf = csfById(primaryCsfId);
  const palette = PALETTE_BY_STAKEHOLDER[stakeholderId];

  // Headline numbers anchored to TFIP — every email/infographic cites at least
  // one €/MT figure from the leaflet or the white paper so the citation
  // checker resolves the claim.
  const heroMetric = (() => {
    if (stakeholderId === "nutritionist") {
      return TFIP_PRIMARY_METRICS.find((m) => m.label.startsWith("Feed-cost savings"))!;
    }
    if (stakeholderId === "purchaser") {
      return TFIP_PRIMARY_METRICS.find((m) => m.label.startsWith("Rhodimet"))!;
    }
    return TFIP_PRIMARY_METRICS.find((m) => m.label.includes("Rovabio US"))!;
  })();

  const subject = ladder.emailHook;
  const intro = `${ladder.personalValue} The TFIP framework — Reveal · Formulate · Capture — gives you a deterministic path: PNE on raw materials, ADICT on the matrix, FDC on the cycle, and SustainWay on the scope-3 column.`;

  const ctaHref = `mailto:adiplan.poultry@adisseo.com?subject=TFIP%20${encodeURIComponent(stakeholderId)}%20follow-up`;

  const email: PoultryEmailDeliverable = {
    subject,
    preheader: TFIP_CAMPAIGN.taglines[0],
    greeting: `Dear ${ladder.fullName},`,
    intro,
    body: [
      {
        kind: "p",
        text: `For the ${ladder.fullName.toLowerCase()}, the TFIP framework anchors on a single CSF: ${csf?.label ?? primaryCsfId}. Adisseo's lead answer is "${valueProp?.oneLiner ?? "Reveal · Formulate · Capture."}"`,
      },
      {
        kind: "bullets",
        items: ladder.cbis.slice(0, 4),
      },
      {
        kind: "callout",
        label: "Headline number",
        text: `${heroMetric.label}: ${heroMetric.value}. Source: ${heroMetric.source}.`,
      },
      {
        kind: "p",
        text: `Voice cue for this conversation: ${ladder.voiceCue}`,
      },
    ],
    metricsTable: [
      { metric: "Feed-cost savings (PNE+FDC+ADICT)", control: "0%", treatment: "up to 3%", delta: "+3 pts" },
      { metric: "Rhodimet AT88 net saving", control: "—", treatment: "27 cents/ton", delta: "+27¢/MT" },
      { metric: "Rovabio US-corn diets", control: "—", treatment: "€16.1/MT", delta: "+€16.1/MT" },
      { metric: "Rovabio EU wheat/barley", control: "—", treatment: "€16.4/MT", delta: "+€16.4/MT" },
    ],
    ctaLabel: "Open the TFIP follow-up",
    ctaHref,
    signOff: "Best,",
    signature: "Vish Iyer · Adisseo Poultry APAC",
    footnote: `Sources: TFIP Leaflet, Measure-Adjust-Optimize white paper, SustainWay deck. Audience overlay: ${audience.approachNote}`,
  };

  const carousel: PoultryCarouselSlide[] = [
    {
      index: 1,
      kind: "cover",
      eyebrow: TFIP_CAMPAIGN.name,
      headline: ladder.infographicTitle,
      body: ladder.personalValue,
    },
    {
      index: 2,
      kind: "stat",
      eyebrow: "The Adisseo answer",
      headline: valueProp?.oneLiner ?? "Reveal · Formulate · Capture.",
      bigStat: { value: heroMetric.value, label: heroMetric.label },
      body: `Source: ${heroMetric.source}.`,
    },
    {
      index: 3,
      kind: "list",
      eyebrow: `${ladder.fullName} CBI ladder`,
      headline: "What needs to be solved to unlock the CSF.",
      bullets: ladder.cbis.slice(0, 4),
    },
    {
      index: 4,
      kind: "list",
      eyebrow: "Adisseo product / service rings",
      headline: valueProp?.oneLiner ?? "Reveal · Formulate · Capture.",
      bullets: [
        ...(valueProp?.product.slice(0, 2) ?? []),
        ...(valueProp?.services.slice(0, 1) ?? []),
        ...(valueProp?.advisory.slice(0, 1) ?? []),
      ],
    },
    {
      index: 5,
      kind: "cta",
      eyebrow: "Next step",
      headline: ladder.emailHook,
      body: `${ladder.voiceCue}`,
      attribution: "Adisseo APAC · TFIP campaign · Apr-30 workshop",
    },
  ];

  const infographic: PoultryInfographicDeliverable = {
    csfLabel: csf?.label ?? primaryCsfId,
    csfId: primaryCsfId,
    cbi: ladder.cbis[0],
    herubelSlot: HERUBEL_SLOT_BY_STAKEHOLDER[stakeholderId],
    title: ladder.infographicTitle,
    subtitle: ladder.personalValue,
    evidence: ladder.cbis.slice(0, 3),
    bigStat: { value: heroMetric.value, label: heroMetric.label },
    workshopOneLiner: valueProp?.oneLiner ?? "Reveal · Formulate · Capture.",
    palette,
    cta: ladder.emailHook,
  };

  return {
    campaignId: "tfip",
    audienceId,
    email,
    carousel,
    infographic,
    guardrailNotes: [
      "Anchor every claim on a TFIP vault entry (leaflet, white paper, SustainWay deck).",
      "No 'replaces antibiotics', no 'miracle additive', no 'zero failure' — Adisseo poultry brand voice rejects these.",
      "Cite €/MT and trial source on every claim.",
      `Stakeholder voice cue: ${ladder.voiceCue}`,
      `Audience approach: ${audience.approachNote}`,
    ],
  };
}

/* ============================================================================
 * Helpers exported for /campaign-fanout
 * ========================================================================== */

export function tfipStakeholderAudiences(): PoultryAudience[] {
  return poultryAudiences.filter((a) => a.id in STAKEHOLDER_AUDIENCE_TO_LADDER);
}

export type PoultryChannel = "email" | "infographic";

export const POULTRY_CHANNELS: PoultryChannel[] = ["email", "infographic"];

export function tfipCsfFor(audienceId: string): PoultryWorkshopCsfId | null {
  const stakeholderId = STAKEHOLDER_AUDIENCE_TO_LADDER[audienceId];
  if (!stakeholderId) return null;
  return ladderFor(stakeholderId).csfIds[0];
}
