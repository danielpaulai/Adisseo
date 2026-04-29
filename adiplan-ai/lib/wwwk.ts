/**
 * We Wish We Knew (WWWK) — AdiPlan "Assessing" deliverable.
 *
 * From context.md row 50:
 *    "Research questions tied to specific decisions."
 *
 * Per stakeholder + CBI, produce 5–7 sharp research questions.
 * Each question is shaped to:
 *   - support a specific upcoming decision (so the answer changes a behaviour)
 *   - state the current hypothesis (so a "no" actually disproves something)
 *   - name the right respondent and the right method
 *   - carry a priority and status so the team can run it like a backlog
 *
 * The deterministic generator below produces a believable starting set
 * for the demo. The /api/generate-wwwk route can sharpen them with an
 * LLM when an API key is present.
 */

import {
  seededStakeholders,
  type Stakeholder,
  type StakeholderPersona,
} from "@/lib/stakeholders";

export type WWWKMethod =
  | "1:1 interview"
  | "Focus group"
  | "Online survey"
  | "On-farm observation"
  | "Desk research"
  | "Sales call ride-along"
  | "Win/loss review";

export type WWWKPriority = "high" | "medium" | "low";
export type WWWKStatus = "open" | "in-flight" | "answered" | "parked";

export interface WWWKQuestion {
  id: string;
  question: string;
  /** The specific decision this answer unblocks. */
  decision: string;
  /** What we currently think the answer is. The question must be able to disprove this. */
  hypothesis: string;
  whoToAsk: string;
  method: WWWKMethod;
  priority: WWWKPriority;
  status: WWWKStatus;
  /** Captured when answered. */
  insight?: string;
  /** When the insight was captured. */
  answeredAt?: string;
}

export interface WWWKBoard {
  /** Source stakeholder id. */
  stakeholderId: string;
  /** Source CBI string (free-form, often pulled from match or composed frame). */
  cbi: string;
  region: string;
  questions: WWWKQuestion[];
}

/* ============================================================================
 * Seed library — keyed by persona archetype.
 * Each entry is a question template populated with the live CBI and region.
 * ========================================================================== */

const PERSONA_TEMPLATES: Record<
  StakeholderPersona,
  Array<Omit<WWWKQuestion, "id" | "status">>
> = {
  "Efficiency Optimizer": [
    {
      question: "Which single FCR lever would they prioritise next quarter — amino-acid balance, gut integrity, or feed-mill consistency?",
      decision: "Which Adisseo product family to lead with in the next pitch.",
      hypothesis: "They will pick gut integrity because that's where the recent disease pressure has been.",
      whoToAsk: "Plant-level nutritionists at the top 3 integrators",
      method: "1:1 interview",
      priority: "high",
    },
    {
      question: "What FCR delta would force a switch of methionine source mid-cycle?",
      decision: "Whether to anchor the 30-day protocol on FCR or on uniformity.",
      hypothesis: "A 4-point FCR delta is the tipping point; anything smaller is noise.",
      whoToAsk: "Procurement + nutrition jointly",
      method: "Focus group",
      priority: "high",
    },
    {
      question: "Where does the current methionine number actually come from — mill assay, supplier COA, or last year's contract?",
      decision: "Whether to lead the proof-stack with on-mill validation data.",
      hypothesis: "Half the integrators are still relying on supplier COA values; almost nobody re-tests at the mill.",
      whoToAsk: "QC manager + nutrition manager together",
      method: "On-farm observation",
      priority: "medium",
    },
  ],
  "System Simplifier": [
    {
      question: "How many separate decisions does the current cycle force on them, and which one would they pay to remove?",
      decision: "Which Total Value Solution bundle to assemble.",
      hypothesis: "The 'which methionine premix at which week' decision is the most expensive cognitive load.",
      whoToAsk: "GM of nutrition / R&D",
      method: "1:1 interview",
      priority: "high",
    },
    {
      question: "What does their ideal one-page protocol look like — who signs it, who runs it, who audits it?",
      decision: "How to scope the 30-day on-farm protocol.",
      hypothesis: "They want a single PDF the vet, the nutritionist, and procurement all agree on — not three.",
      whoToAsk: "Cross-functional roundtable (vet + nutrition + procurement)",
      method: "Focus group",
      priority: "high",
    },
  ],
  "Risk Reducer": [
    {
      question: "What's the auditor's most-asked question last year — and the answer they couldn't defend?",
      decision: "Which proof points to lead the Strategic Frame with.",
      hypothesis: "The methionine bioavailability claim is the one that keeps getting re-asked.",
      whoToAsk: "Regulatory affairs lead",
      method: "1:1 interview",
      priority: "high",
    },
    {
      question: "Which competitor signal would actually move regulatory posture vs. just be noted?",
      decision: "Which competitor signals to bring forward in the war-room briefing.",
      hypothesis: "Anything from the local regulator is acted on; competitor PR is filed and ignored.",
      whoToAsk: "Regulatory + corporate comms",
      method: "Win/loss review",
      priority: "medium",
    },
    {
      question: "What documentation depth is the minimum the QA team will accept before a switch?",
      decision: "How much of the proof-stack to put in the leaflet vs. the technical appendix.",
      hypothesis: "QA teams want at least 2 trials in-region with raw data, not a glossy summary.",
      whoToAsk: "QA + audit team",
      method: "Desk research",
      priority: "medium",
    },
  ],
  "Sustainability Advocate": [
    {
      question: "Whose sustainability KPI moves first — corporate ESG, retailer scope-3, or local certification?",
      decision: "Which sustainability proof to lead the methane / footprint message with.",
      hypothesis: "Retailer scope-3 pressure from JP/EU brands is the actual forcing function.",
      whoToAsk: "Sustainability lead + key-account commercial",
      method: "1:1 interview",
      priority: "high",
    },
    {
      question: "What's the smallest, most-credible methane-delta number the buyer will publish in a press release?",
      decision: "What proof-point to anchor the manga brochure / billboard cover on.",
      hypothesis: "12% methane reduction with audit-grade data is the floor; below that gets buried.",
      whoToAsk: "Sustainability + comms",
      method: "Online survey",
      priority: "medium",
    },
  ],
  "Knowledge Builder": [
    {
      question: "Who do their R&D teams cite when they've already made up their mind — a journal, a competitor whitepaper, or a peer?",
      decision: "Where to place the technical leaflet so it actually gets read.",
      hypothesis: "They cite peers in WeChat/LinkedIn groups more than they cite journals.",
      whoToAsk: "Junior nutritionists who do the literature search",
      method: "Sales call ride-along",
      priority: "high",
    },
    {
      question: "What technical claim, if proven on-region, would change their slide deck for next quarter's industry talk?",
      decision: "Which proof-point to invest a regional trial in.",
      hypothesis: "Local-region bioavailability with named trial farms beats imported global data.",
      whoToAsk: "R&D lead + technical-marketing manager",
      method: "Focus group",
      priority: "medium",
    },
  ],
};

const DEFAULT_REGION = "APAC";

export function buildWWWKBoard(
  stakeholderId: string,
  cbi: string,
  region: string = DEFAULT_REGION
): WWWKBoard {
  const stakeholder: Stakeholder =
    seededStakeholders.find((s) => s.id === stakeholderId) ??
    seededStakeholders[0];
  const templates = PERSONA_TEMPLATES[stakeholder.persona] ?? [];
  const questions: WWWKQuestion[] = templates.map((t, i) => ({
    id: `wwwk-${stakeholder.id}-${i}`,
    status: "open",
    ...t,
    question: contextualise(t.question, cbi, region, stakeholder),
    hypothesis: contextualise(t.hypothesis, cbi, region, stakeholder),
    whoToAsk: t.whoToAsk,
  }));
  // If we have less than 4 templates, pad with a couple of general ones.
  if (questions.length < 4) {
    questions.push(...generalPad(stakeholder, cbi, region, questions.length));
  }
  return {
    stakeholderId: stakeholder.id,
    cbi,
    region,
    questions,
  };
}

function contextualise(
  text: string,
  cbi: string,
  region: string,
  stakeholder: Stakeholder
): string {
  // Fold the CBI / region into the templates so the same persona library
  // sounds different campaign-to-campaign.
  return text
    .replace(/in-region/g, `in-${region}`)
    .replace(/the recent disease pressure/g, contextDiseaseLine(cbi));
}

function contextDiseaseLine(cbi: string): string {
  const c = cbi.toLowerCase();
  if (c.includes("asf")) return "the latest ASF mortality wave";
  if (c.includes("methane")) return "the methane / scope-3 reset";
  if (c.includes("methionine")) return "the methionine source rotation";
  if (c.includes("regulatory")) return "the new feed-additive registration";
  return "the current disease pressure";
}

function generalPad(
  s: Stakeholder,
  cbi: string,
  region: string,
  startIndex: number
): WWWKQuestion[] {
  const base: Array<Omit<WWWKQuestion, "id" | "status">> = [
    {
      question: `If the ${region} customer rejected the next 30-day protocol, what would the rejection reason actually be?`,
      decision: "Which objection the Strategic Frame should pre-empt.",
      hypothesis: "The reason is operational ('we don't have the people'), not technical.",
      whoToAsk: `${s.label} — farm operations`,
      method: "Win/loss review",
      priority: "medium",
    },
    {
      question: `Who, on their team, would be the internal champion for a switch tied to "${cbi}"?`,
      decision: "Who to deliver the leaflet / brochure to first.",
      hypothesis: "It is the head of nutrition, but the actual buyer is procurement.",
      whoToAsk: "Cross-functional team — 1:1s",
      method: "1:1 interview",
      priority: "low",
    },
  ];
  return base.map((b, i) => ({
    id: `wwwk-${s.id}-pad-${startIndex + i}`,
    status: "open" as WWWKStatus,
    ...b,
  }));
}

export function summariseBoard(board: WWWKBoard) {
  const total = board.questions.length;
  const open = board.questions.filter((q) => q.status === "open").length;
  const inFlight = board.questions.filter((q) => q.status === "in-flight").length;
  const answered = board.questions.filter((q) => q.status === "answered").length;
  return { total, open, inFlight, answered };
}
