/**
 * Billboard Campaign — Layer 3 · Creating · the AdiPlan "billboard test".
 *
 * From the AdiPlan March-workshop template: every campaign must pass the
 * billboard test — Headline + Adisseo Differentiation + Reason to Believe +
 * Visual, judged on Unique / Important / Believable.
 *
 * This module turns a composed StrategicFrame (or a manual brief) into a
 * billboard-ready pack that renders as a printable poster (A2 portrait by
 * default — booth and conference scale). The same content also re-formats
 * to a square LinkedIn key-visual.
 */
import type { StrategicFrame } from "@/lib/strategic-frame";

export type BillboardFormat = "a2-portrait" | "a1-portrait" | "square-linkedin";

export interface BillboardFormatSpec {
  id: BillboardFormat;
  label: string;
  /** PDF page width in points (1pt = 1/72 inch). */
  width: number;
  /** PDF page height in points. */
  height: number;
  /** Short human description. */
  body: string;
  /** Where it's typically used. */
  use: string;
}

export const BILLBOARD_FORMATS: BillboardFormatSpec[] = [
  {
    id: "a2-portrait",
    label: "A2 portrait — trade booth",
    width: 1190.55,
    height: 1683.78,
    body: "420 × 594 mm at 72dpi. Booth backdrops and farm-conference partitions.",
    use: "Booth + conference",
  },
  {
    id: "a1-portrait",
    label: "A1 portrait — convention wall",
    width: 1683.78,
    height: 2383.94,
    body: "594 × 841 mm at 72dpi. Convention banners and APAC roadshow walls.",
    use: "Convention + roadshow",
  },
  {
    id: "square-linkedin",
    label: "Square — LinkedIn key visual",
    width: 1080,
    height: 1080,
    body: "1080 × 1080 px. The same billboard repurposed as a HQ-defensible LinkedIn key visual.",
    use: "LinkedIn + WeChat",
  },
];

export interface BillboardPack {
  /** The big single line — passes the believable test in one breath. */
  headline: string;
  /** What only Adisseo can claim — the differentiation strip. */
  differentiation: string;
  /** The single hardest-to-deny proof point. */
  reasonToBelieve: string;
  /** The 3-bullet evidence stack. */
  evidence: string[];
  /** A short call-to-action for the bottom strip. */
  cta: string;
  /** Visual prompt brief — used for an art board, not a literal asset. */
  visualBrief: string;
  /** Tagging metadata (audited later). */
  cbi: string;
  persona: string;
  competitor: string;
  region: string;
  /** Self-test scoring — Unique / Important / Believable, 1-5. */
  scoring: { unique: number; important: number; believable: number };
}

export interface BillboardInput {
  /** Optional — when present we lean on the frame; otherwise the manual fields below. */
  frame?: StrategicFrame;
  /** Manual override fields (used when frame is absent). */
  cbi?: string;
  persona?: string;
  competitor?: string;
  region?: string;
  topicHint?: string;
  speciesHint?: "aqua" | "poultry" | "ruminants" | "swine";
}

export function deterministicBillboard(input: BillboardInput): BillboardPack {
  const frame = input.frame;
  if (frame) {
    const headline =
      frame.oneLineSummary ||
      frame.promise.headline ||
      "Move the cycle. Adisseo has the answer this quarter.";

    const differentiation =
      frame.promise.body ||
      frame.promise.headline ||
      "A coordinated APAC technical answer, sequenced across the cycle.";

    const evidence =
      frame.proof.evidence && frame.proof.evidence.length > 0
        ? frame.proof.evidence.slice(0, 3)
        : [
            "Multi-cycle APAC trial summary 2024-25",
            "Vet-KOL endorsement on file",
            "Procurement-shareable trial pack",
          ];

    const reasonToBelieve = evidence[0];

    return {
      headline,
      differentiation,
      reasonToBelieve,
      evidence,
      cta: frame.proposition.cta || "Co-design the 30-day protocol",
      visualBrief: visualBriefFor(frame.cbiId, frame.region, frame.competitor),
      cbi: frame.cbi,
      persona: frame.persona,
      competitor: frame.competitor,
      region: frame.region,
      scoring: scoringFromFrame(frame),
    };
  }

  // No frame — generate a generic-but-usable billboard from manual hints.
  const topic = input.topicHint || "next-cycle procurement direction";
  const region = input.region || "APAC";
  const competitor = input.competitor || "Industry signal";

  return {
    headline: `Move the ${region} cycle. Adisseo has the answer this quarter.`,
    differentiation:
      "A coordinated APAC technical answer, sequenced across the cycle, owned by the regional desk — not a single SKU.",
    reasonToBelieve: "Multi-cycle APAC trial summary 2024-25.",
    evidence: [
      "Multi-cycle APAC trial summary 2024-25",
      "Vet-KOL endorsement on file",
      "Procurement-shareable trial pack",
    ],
    cta: "Co-design the 30-day protocol",
    visualBrief: visualBriefFor("default", region, competitor),
    cbi: input.cbi || "Procurement-cycle compression",
    persona: input.persona || "Integrator-tier procurement buyer",
    competitor,
    region,
    scoring: { unique: 4, important: 5, believable: 4 },
  };
}

function visualBriefFor(cbiId: string, region: string, competitor: string) {
  if (/agp|regulatory/i.test(cbiId)) {
    return `Two-line stripe: green "FCR" line steady, magenta "uniformity CV%" line dropping then recovering after a phased intervention marker. Region tag: ${region}. Anchor competitor: ${competitor}.`;
  }
  if (/heat/i.test(cbiId)) {
    return `Bulk-tank yield curve through a 6-week summer band — control flat in red, protocol arm holding +0.7 kg/day in cyan. Region tag: ${region}.`;
  }
  if (/methane|carbon/i.test(cbiId)) {
    return `Two-axis: methane / DMI dropping 12% on the left, milk-yield horizontal on the right. J-credit cap-stamp top-right. Region tag: ${region}.`;
  }
  if (/mycotoxin|aflatoxin/i.test(cbiId)) {
    return `Lateral-flow strip with two control bands and a binder-pairing decision tree underneath. Mill QC desk shot. Region tag: ${region}.`;
  }
  if (/prrs|asf|disease/i.test(cbiId)) {
    return `Nursery-recovery curve: ADG line rising 3.2 days earlier on the protocol arm. Vet-KOL byline strip. Region tag: ${region}.`;
  }
  return `Single hero stat in the centre, three evidence-bullet stripes underneath. Region tag: ${region}. Anchor competitor: ${competitor}.`;
}

function scoringFromFrame(frame: StrategicFrame) {
  // Lightweight self-scoring: heuristic from the frame's content density.
  const evidenceCount = frame.proof.evidence?.length ?? 0;
  const hasCta = !!frame.proposition.cta;
  const hasInsight = !!frame.enterpriseInsight && frame.enterpriseInsight.length > 80;

  return {
    unique: hasInsight ? 5 : 4,
    important: 5,
    believable: evidenceCount >= 3 && hasCta ? 5 : 4,
  };
}
