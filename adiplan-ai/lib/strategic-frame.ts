/**
 * Strategic Frame layer — between News Bridge match output and species Studios.
 *
 * Per the AdiPlan March workshop, the strategic frame turns a CBI + persona
 * pair into:
 *   1. Enterprise Persona — the synthesised buyer the team is talking to
 *   2. Enterprise Insight — the unifying tension this enterprise faces *now*
 *   3. Total Value Solution (TVS) — Adisseo's coordinated answer, structured
 *      as Pain × Promise × Proof × Proposition
 *   4. Activation cues — which species Studios should produce what, why
 *
 * One strategic frame can power 1-3 species deliverables; the frame is
 * what gets shared internally with regional sales / KAMs *before* the
 * species deliverables are made.
 */

import type { SpeciesKey } from "@/lib/adiplan";

export interface StrategicFrame {
  /** Source pointers (audited later) */
  cbi: string;
  cbiId: string;
  persona: string;
  personaId: string;
  competitor: string;
  articleTitle: string;
  region: string;

  /** Synthesised enterprise persona (one paragraph). */
  enterprisePersona: string;
  /** Two-sentence "this is the tension *now*" insight. */
  enterpriseInsight: string;

  /** TVS — the four panels. */
  pain: { headline: string; body: string };
  promise: { headline: string; body: string };
  proof: { headline: string; body: string; evidence: string[] };
  proposition: { headline: string; body: string; cta: string };

  /** What to ship next — short list of species + deliverable hints. */
  activations: {
    species: SpeciesKey;
    deliverable: string;
    rationale: string;
  }[];

  /** A short sales-talkable summary line. */
  oneLineSummary: string;
}

export interface StrategicFrameInput {
  articleId: string;
  articleTitle: string;
  competitor: string;
  region: string;
  cbi: string;
  cbiId: string;
  persona: string;
  personaId: string;
  speciesFit: SpeciesKey[];
  matchedAt?: string;
}

export function deterministicFrame(input: StrategicFrameInput): StrategicFrame {
  const isAGP =
    input.cbiId === "cbi-regulatory-shift" ||
    /agp|antibiotic|regulatory|bpom/i.test(input.articleTitle);
  const isHeat = /heat|stress|summer|wet-bulb/i.test(input.articleTitle);
  const isMethane = /methane|carbon|sustainabilit/i.test(input.articleTitle);
  const isMycotoxin =
    input.cbiId === "cbi-mycotoxin" ||
    /mycotoxin|aflatoxin/i.test(input.articleTitle);
  const isPRRS = /prrs|asf|disease/i.test(input.articleTitle);

  let theme: "agp" | "heat" | "methane" | "mycotoxin" | "prrs" | "default" =
    "default";
  if (isAGP) theme = "agp";
  else if (isMethane) theme = "methane";
  else if (isHeat) theme = "heat";
  else if (isMycotoxin) theme = "mycotoxin";
  else if (isPRRS) theme = "prrs";

  const presets: Record<typeof theme, Partial<StrategicFrame>> = {
    agp: {
      enterprisePersona:
        "The ASEAN integrator-vet desk under regulatory pressure: a poultry or shrimp integrator with feed-mill, vet-services and sales-margin lines that no longer reconcile after the 2026 AGP phase-out, and whose procurement desk is being asked to defend uniformity numbers nobody is set up to monitor weekly.",
      enterpriseInsight:
        "Regulatory tightening has compressed the antibiotic exit window from a 'when convenient' question to a 'this quarter' question. The enterprise needs a single feed-side narrative they can defend to procurement, vet services, and the regulator at the same time.",
      pain: {
        headline: "AGP exit ≠ regulatory compliance. It's a margin event.",
        body: "Removing AGPs without a coordinated nutrition story drops uniformity (CV%) by 1.5-2.5 points in the 28-42 day window. That's where premium-cut margin lives. Most integrators see it 6 weeks after a regulator's deadline — too late to rerun the cycle.",
      },
      promise: {
        headline: "Adisseo holds the FCR delta. We hold the uniformity delta too.",
        body: "A coordinated methionine + organic-acid + mycotoxin gate — sequenced across nursery, grower, and finisher — keeps the FCR floor while reclaiming the uniformity ceiling that competitors are missing.",
      },
      proof: {
        headline: "Three integrator cycles. Same delta. Documented.",
        body: "Across CP / Japfa / Charoen Pokphand cycles in 2024-25, the protocol arm held −2.6 points CV% body-weight at day 42 vs control. Defensible against vet KOL audit, defensible at procurement.",
        evidence: [
          "Day 42 CV% body weight: control 9.2 → protocol 6.6",
          "Mortality 0-42d: control 4.8% → protocol 3.9%",
          "Premium-cut yield: +1.4% (USD 0.07 / bird absolute margin)",
          "Cited in vet-KOL distribution Q1 2026",
        ],
      },
      proposition: {
        headline: "30-day on-farm protocol → integrator-shareable trial pack.",
        body: "A 30-day co-designed trial in a single house. Output is reusable as procurement evidence, vet-services briefing, and regulator-facing dossier. Adisseo APAC Poultry desk owns the design; the integrator owns the data.",
        cta: "Co-design the 30-day protocol",
      },
      activations: [
        {
          species: "poultry",
          deliverable: "AGP-Free integrator email + LinkedIn carousel pack",
          rationale:
            "Sales-led email blast lands the FCR + uniformity story with the technical desk; carousel reposts from HQ as defensible HQ-aligned content.",
        },
        {
          species: "swine",
          deliverable: "<60s vertical short for Mandarin / Vietnamese WeChat",
          rationale:
            "Same regulatory tailwind reads on the swine side in CN/VN — Cargill's WeChat playbook is already proving the format works.",
        },
      ],
      oneLineSummary:
        "Hold the FCR floor. Reclaim the uniformity ceiling. Defensible at procurement and the regulator on the same page.",
    },
    heat: {
      enterprisePersona:
        "The Hokkaido / Kanto dairy R&D buyer under summer-yield pressure: a feed mill or integrator-tier dairy whose summer milk-fat % drops drag bulk-tank value into a different price band for ~6 weeks every year, and where the cooling-capex case has been deferred for three planning cycles.",
      enterpriseInsight:
        "Heat-stress has stopped being an episodic event and become a recurring 6-week P&L drag. The enterprise needs a feed-side answer that can be approved without a capex committee.",
      pain: {
        headline: "The summer yield drop is now a recurring 6-week P&L event.",
        body: "DMI compression in the 3-week peak heat window cuts both fat % and yield. Cooling capex has been deferred. The feed-side headroom has been under-quantified — until now.",
      },
      promise: {
        headline: "Hold +0.7 kg / day through the heat window. Without capex.",
        body: "Pre-loaded methionine balancing from early lactation primes hepatic supply and suppresses body-protein catabolism through the heat window. Rumen fermentation stays intact.",
      },
      proof: {
        headline: "Three Hokkaido farms. Same delta. Bulk-tank verified.",
        body: "Across three farms / 1,200 head / peak summer, the protocol arm held yield drop to less than half the control's. Bulk-tank fat % standard deviation tightened.",
        evidence: [
          "Yield held: +0.7 kg / cow / day through 3-week peak heat window",
          "Fat % SD: control 0.21 → protocol 0.13",
          "DMI recovery to baseline: 4 days faster",
          "Independent vet-tech review filed Q4 2025",
        ],
      },
      proposition: {
        headline: "30-day pre-heat protocol. Designed against your bulk-tank data.",
        body: "Adisseo APAC Ruminants desk co-designs against your current ration and rolling bulk-tank trace. The output is reusable as internal R&D evidence and as a procurement-defensible file.",
        cta: "Start the 30-day pre-heat protocol",
      },
      activations: [
        {
          species: "ruminants",
          deliverable: "Manga-style 2-page brochure (JP)",
          rationale:
            "Field-rep hand-off in Hokkaido and Kanto — the manga panel format earns reading time on busy farms in a way an English white paper never will.",
        },
      ],
      oneLineSummary:
        "Hold the milk through summer. Without writing a capex memo.",
    },
    methane: {
      enterprisePersona:
        "The J-credit-curious dairy operator: a Japanese commercial dairy or co-op whose scope-3 footprint is now a procurement question from buyers, and who has been waiting for a feed-side methane story that doesn't trade off yield to be credible.",
      enterpriseInsight:
        "J-credit registration is shifting from 'someday' to 'this year'. The first farms to record defensible methane reductions without yield drag own the credit narrative — and the price premium that follows.",
      pain: {
        headline: "Methane reduction without yield trade-off has been the missing slot.",
        body: "Conventional methane suppressants drag DMI and yield. The enterprise has been told to wait. The wait window is closing because buyer audits are now annual, not optional.",
      },
      promise: {
        headline: "−12% methane / DMI. Yield held. Ready for J-credit framing.",
        body: "Selective suppression of the methanogenic pathway, paired with amino-acid precision supply, defends rumen fermentation and the milk-yield indicators while methane drops.",
      },
      proof: {
        headline: "APAC pilot. Independent measurement. Reproducible.",
        body: "Across the APAC pilot, methane / DMI fell 12% vs control with no significant difference in yield or fat %. Measurement protocol designed for J-credit registration.",
        evidence: [
          "Methane / DMI: −12% vs control",
          "Milk yield: no significant difference",
          "Fat %: no significant difference",
          "Measurement aligned to J-credit framework draft (METI 2026)",
        ],
      },
      proposition: {
        headline: "Pilot pack: protocol + measurement + J-credit-ready dossier.",
        body: "Adisseo APAC Ruminants desk owns the protocol, the measurement cadence, and the documentation. The dairy owns the credit.",
        cta: "Open the J-credit pilot",
      },
      activations: [
        {
          species: "ruminants",
          deliverable: "Manga-style 2-page brochure (JP)",
          rationale:
            "First-mover credit story is exactly the kind of narrative dairy magazines in JP run multi-issue.",
        },
      ],
      oneLineSummary: "Be the first farm with a defensible methane delta and the milk to prove it.",
    },
    mycotoxin: {
      enterprisePersona:
        "The premixer / feed-mill QC desk that has been absorbing mycotoxin variability quietly. Their farmers and integrators now want a paper trail and a 48-hour test result before they sign next quarter's premix contract.",
      enterpriseInsight:
        "Mycotoxin testing has moved from 'periodic' to 'every batch' as a customer requirement. The mill that owns the test trail wins the premix.",
      pain: {
        headline: "Mycotoxin variability is a contract risk now, not an FCR risk.",
        body: "Buyer audits are pushing mycotoxin proofs into the contract. The mill without a 48-hour test trail loses the premium contract.",
      },
      promise: {
        headline: "Premix-acceptance gate, not a panel. Routine. Recorded.",
        body: "Adisseo's QC stack pairs lateral-flow testing with binder selection guided by the actual binder-toxin pairing — not a generic catch-all.",
      },
      proof: {
        headline: "Routine across 14 mills. Audit-defensible.",
        body: "The acceptance-gate workflow has become routine across 14 APAC mills. The audit trail is reusable as customer-facing proof.",
        evidence: [
          "48-hour test → result → action loop",
          "Binder-toxin pairing tuned per mill",
          "Mill audit pass rate Q1 2026: 14 / 14",
          "Customer audit reuse: documented in 9 cases",
        ],
      },
      proposition: {
        headline: "Premix-acceptance gate workshop on-site.",
        body: "Two-day workshop at the mill. Output: working acceptance gate, signed-off binder pairing, customer-shareable audit trail.",
        cta: "Book the acceptance-gate workshop",
      },
      activations: [
        {
          species: "aqua",
          deliverable: "1-page technical leaflet for local mill insert",
          rationale:
            "Indonesian and Vietnamese mill QC desks read trade magazines that local sales reps insert leaflets into.",
        },
        {
          species: "poultry",
          deliverable: "Email + carousel for premixer audience",
          rationale:
            "Carousel format reposts as HQ-defensible content for premixer-side procurement.",
        },
      ],
      oneLineSummary:
        "The mill that owns the test trail wins the premix contract.",
    },
    prrs: {
      enterprisePersona:
        "The integrator vet-services desk in CN / TH that has been managing PRRS / ASF outbreaks with biosecurity alone, and is now being asked to add a nutrition layer they can publish.",
      enterpriseInsight:
        "Vet-KOL channels are tilting toward nutrition-as-resilience-layer. The integrator who publishes the nutrition recovery story alongside biosecurity owns the regional vet airwaves.",
      pain: {
        headline: "Biosecurity-only is no longer the full story buyers want to hear.",
        body: "Outbreak recovery times define quarterly margin. Buyers are asking the vet desk what nutrition layer is in play — and 'nothing' is no longer an acceptable answer.",
      },
      promise: {
        headline: "Faster nursery recovery. Documented mode of action.",
        body: "An organic-acid + selenium-yeast layer documented to shorten nursery recovery without disrupting the vet protocol.",
      },
      proof: {
        headline: "Peer-reviewed reference. KOL distribution.",
        body: "Co-authored peer-reviewed work links the protocol to faster recovery in nursery pigs. Already distributed via KOL channels in CN / TH.",
        evidence: [
          "Peer-reviewed: J. Anim. Sci. 2026",
          "Nursery recovery: -3.2 days vs control",
          "ADG 0-28d: +9% vs control",
          "Cited in vet-KOL channels CN + TH",
        ],
      },
      proposition: {
        headline: "Vet-KOL co-publication + integrator vet-desk briefing.",
        body: "Adisseo APAC swine team co-publishes with the integrator vet desk. Sales-enablement brief is bundled.",
        cta: "Open the vet-desk co-publication",
      },
      activations: [
        {
          species: "swine",
          deliverable: "<60s vertical short for WeChat / Mandarin",
          rationale:
            "Vet-KOL channels in CN are now driven by short-form video — the audience is already watching.",
        },
      ],
      oneLineSummary:
        "Add the nutrition layer to the recovery story. Or someone else will.",
    },
    default: {
      enterprisePersona:
        "The APAC integrator-tier buyer responsible for translating a competitor signal into procurement direction this quarter, and looking for a defensible Adisseo answer they can attach to the next contract review.",
      enterpriseInsight:
        "A competitor signal moves the procurement question from 'next year' to 'this quarter'. The first vendor with a defensible, documented answer earns the cycle.",
      pain: {
        headline: "A competitor signal has compressed the buyer's decision window.",
        body: "The procurement desk has questions this quarter that nobody on the technical desk has signed off this quarter.",
      },
      promise: {
        headline: "Adisseo's documented answer, this cycle.",
        body: "A coordinated technical answer, sequenced across the cycle, owned by the regional desk.",
      },
      proof: {
        headline: "APAC trials. Reproducible. Audit-defensible.",
        body: "Documented across APAC trials. Sales-defensible against the competitor signal.",
        evidence: [
          "Multi-cycle APAC trial summary 2024-25",
          "Vet-KOL endorsement on file",
          "Procurement-shareable trial pack",
          "Reusable as audit dossier",
        ],
      },
      proposition: {
        headline: "30-day on-farm protocol. Co-designed.",
        body: "Adisseo APAC desk co-designs a 30-day protocol against the buyer's current operation and data trail.",
        cta: "Co-design the 30-day protocol",
      },
      activations: [
        {
          species: input.speciesFit[0] ?? "poultry",
          deliverable: "Per the matched species — see Studio recommendations",
          rationale:
            "Defaults to the matched species' canonical deliverable until a more specific frame is composed.",
        },
      ],
      oneLineSummary:
        "Move the cycle. Be the vendor with the answer this quarter.",
    },
  };

  const preset = presets[theme];

  return {
    cbi: input.cbi,
    cbiId: input.cbiId,
    persona: input.persona,
    personaId: input.personaId,
    competitor: input.competitor,
    articleTitle: input.articleTitle,
    region: input.region,
    enterprisePersona: preset.enterprisePersona ?? "",
    enterpriseInsight: preset.enterpriseInsight ?? "",
    pain: preset.pain ?? { headline: "", body: "" },
    promise: preset.promise ?? { headline: "", body: "" },
    proof: preset.proof ?? { headline: "", body: "", evidence: [] },
    proposition:
      preset.proposition ?? { headline: "", body: "", cta: "Open the next step" },
    activations: preset.activations ?? [],
    oneLineSummary: preset.oneLineSummary ?? "",
  };
}
