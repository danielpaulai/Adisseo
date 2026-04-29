/**
 * Vish (Poultry APAC) campaigns + segmentation.
 *
 * Per context.md / Vish transcript:
 * - "AGP-Free Asia" is the live regulatory tailwind.
 * - Audience splits across integrators (CP, Japfa, Charoen Pokphand) vs
 *   independent commercial farms.
 * - Channels: email blast (technical) + LinkedIn carousel (visibility).
 */

export type PoultryCampaign = {
  id: string;
  name: string;
  blurb: string;
  hookCues: string[];
};

export const poultryCampaigns: PoultryCampaign[] = [
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

export type PoultryDeliverablePack = {
  campaignId: string;
  audienceId: string;
  email: PoultryEmailDeliverable;
  carousel: PoultryCarouselSlide[];
  guardrailNotes: string[];
};

export function deterministicPoultryPack(
  campaignId: string,
  audienceId: string
): PoultryDeliverablePack {
  const campaign =
    poultryCampaigns.find((c) => c.id === campaignId) ?? poultryCampaigns[0];
  const audience =
    poultryAudiences.find((a) => a.id === audienceId) ?? poultryAudiences[0];

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
