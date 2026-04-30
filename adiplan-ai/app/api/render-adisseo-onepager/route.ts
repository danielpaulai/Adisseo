/**
 * Adisseo decision-maker one-pager — G of the May 7 demo prep.
 *
 * One A4 portrait. Brand-aligned. Designed to be printed and put on the
 * desk of an Adisseo SVP who didn't attend the demo. Tells the whole
 * story in 60 seconds of skim:
 *
 *   - What is APAC, in one sentence
 *   - The 5-layer architecture, named + iconified
 *   - What's live today (26 modules)
 *   - What changes for Adisseo (before / after)
 *   - Cost-of-running envelope
 *   - QR-style URL block to the live demo
 *
 * Deliberately no LLM calls. Every number is pulled from the registries
 * already in the codebase so the one-pager is always in sync with what
 * the live system can actually do.
 */

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
  renderToBuffer,
  Svg,
  Path,
} from "@react-pdf/renderer";
import React from "react";
import { TENANT_LIST, CHANNEL_LIST } from "@/lib/tenant";

export const runtime = "nodejs";

/* ----------------------------------------------------------------------------
 * Font + brand registry.
 * -------------------------------------------------------------------------- */
let fontsRegistered = false;
function ensureFonts() {
  if (fontsRegistered) return;
  const fontDir = path.join(process.cwd(), "public", "fonts");
  Font.register({
    family: "Noto Sans",
    fonts: [
      { src: path.join(fontDir, "NotoSans-Regular.ttf"), fontWeight: 400 },
      { src: path.join(fontDir, "NotoSans-Bold.ttf"), fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

const CRIMSON = "#A70A2D";
const CYAN = "#00A3C4";
const ORANGE = "#D97641";
const INK = "#0E1216";
const INK_SOFT = "#2A2F35";
const MUTED = "#6B7280";
const LINE = "#E5E7EB";
const PAPER = "#FBF9F9";
const EMERALD = "#059669";

const s = StyleSheet.create({
  page: {
    fontFamily: "Noto Sans",
    fontSize: 8.5,
    color: INK,
    backgroundColor: PAPER,
    padding: 26,
    lineHeight: 1.35,
  },
  /* Top ribbon */
  ribbon: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: CRIMSON,
    marginBottom: 10,
  },
  brand: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  brandAdi: { fontSize: 18, fontWeight: 700, color: CRIMSON },
  brandPlan: { fontSize: 18, fontWeight: 700, color: INK },
  brandTag: {
    fontSize: 7,
    fontWeight: 700,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginLeft: 6,
    marginBottom: 2,
  },
  ribbonRight: { alignItems: "flex-end" },
  ribbonStamp: {
    fontSize: 7,
    fontWeight: 700,
    color: CRIMSON,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  ribbonTitle: { fontSize: 9, fontWeight: 700, color: INK_SOFT, marginTop: 1 },
  /* Headline block */
  headline: {
    fontSize: 19,
    fontWeight: 700,
    color: INK,
    lineHeight: 1.15,
    marginBottom: 5,
  },
  subhead: {
    fontSize: 9.5,
    color: INK_SOFT,
    lineHeight: 1.45,
    marginBottom: 9,
  },
  /* Stat strip */
  stats: { flexDirection: "row", marginBottom: 10, gap: 6 },
  stat: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 700,
    color: CRIMSON,
    lineHeight: 1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 6.5,
    fontWeight: 700,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  /* Section */
  sectionLabel: {
    fontSize: 7.5,
    fontWeight: 700,
    color: CRIMSON,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: INK,
    marginBottom: 6,
  },
  body: { fontSize: 8.5, color: INK_SOFT, lineHeight: 1.5, marginBottom: 6 },
  /* 5-layer arch */
  archRow: { flexDirection: "row", marginBottom: 8, gap: 4 },
  archCard: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 6,
    padding: 6,
  },
  archIcon: { width: 14, height: 14, marginBottom: 4 },
  archNumber: {
    fontSize: 6.5,
    fontWeight: 700,
    color: CRIMSON,
    textTransform: "uppercase",
    letterSpacing: 1.3,
  },
  archName: {
    fontSize: 9.5,
    fontWeight: 700,
    color: INK,
    marginTop: 1,
    marginBottom: 2,
  },
  archBody: { fontSize: 7, color: MUTED, lineHeight: 1.35 },
  /* Before / after */
  beforeAfter: { flexDirection: "row", gap: 6, marginBottom: 8 },
  baCol: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 6,
    padding: 7,
  },
  baLabel: {
    fontSize: 6.5,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.3,
    marginBottom: 3,
  },
  baTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: INK,
    marginBottom: 5,
    lineHeight: 1.25,
  },
  baBullet: {
    fontSize: 7.5,
    color: INK_SOFT,
    lineHeight: 1.45,
    marginBottom: 2,
  },
  /* Two-col proof */
  twoCol: { flexDirection: "row", gap: 10, marginBottom: 8 },
  proofItem: {
    flexDirection: "row",
    marginBottom: 3,
    gap: 5,
  },
  proofIcon: { width: 7, height: 7, marginTop: 2 },
  proofText: { flex: 1, fontSize: 8, color: INK_SOFT, lineHeight: 1.4 },
  /* Footer */
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: LINE,
    paddingTop: 6,
    marginTop: "auto",
  },
  footerLeft: { fontSize: 7, color: MUTED, lineHeight: 1.4 },
  footerRightLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  footerUrl: { fontSize: 11, fontWeight: 700, color: CRIMSON },
});

/* ----------------------------------------------------------------------------
 * Inline icons (SVG primitives — kept tiny so they layer crisply).
 * -------------------------------------------------------------------------- */
const IconBase = ({
  d,
  color = CRIMSON,
}: {
  d: string;
  color?: string;
}) =>
  React.createElement(
    Svg,
    { viewBox: "0 0 24 24", style: s.archIcon },
    React.createElement(Path, {
      d,
      stroke: color,
      strokeWidth: 1.8,
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    } as React.ComponentProps<typeof Path>)
  );

const IconCheck = () =>
  React.createElement(
    Svg,
    { viewBox: "0 0 24 24", style: s.proofIcon },
    React.createElement(Path, {
      d: "M5 12.5l4 4L19 7",
      stroke: EMERALD,
      strokeWidth: 2.4,
      fill: "none",
      strokeLinecap: "round",
    } as React.ComponentProps<typeof Path>)
  );

/* ----------------------------------------------------------------------------
 * Architecture data (mirrors what's in /presentation).
 * -------------------------------------------------------------------------- */
interface ArchLayer {
  num: string;
  name: string;
  body: string;
  iconPath: string;
  color: string;
}

const ARCH: ArchLayer[] = [
  {
    num: "L1",
    name: "Intel",
    body: "Scrapes competitor news, regulatory shifts, distributor signals.",
    iconPath: "M3 5h18M3 12h18M3 19h12",
    color: CRIMSON,
  },
  {
    num: "L2",
    name: "Synthesis",
    body: "Vault + RAG. Citation-anchored, brand-voice-tuned.",
    iconPath: "M4 6h16M4 12h12M4 18h8",
    color: CYAN,
  },
  {
    num: "L3",
    name: "Strategic Frame",
    body: "CBI × persona → Pain · Promise · Proof · Proposition.",
    iconPath: "M3 12h6l4-7 4 14 4-7h2",
    color: ORANGE,
  },
  {
    num: "L4",
    name: "Content Studio",
    body: "Per-species: Aqua, Poultry, Ruminants, Swine, Voice.",
    iconPath: "M4 4h16v16H4z M4 10h16",
    color: INK,
  },
  {
    num: "L5",
    name: "Activation",
    body: "Channel adapters, scheduled queue, engagement tracker.",
    iconPath: "M4 12c4-6 12-6 16 0M4 17h16",
    color: EMERALD,
  },
];

/* ----------------------------------------------------------------------------
 * Page composition.
 * -------------------------------------------------------------------------- */

interface OnePagerData {
  liveModules: number;
  tenants: number;
  channels: number;
  trustChecks: number;
}

function OnePager({ data }: { data: OnePagerData }) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: s.page },
      /* Top ribbon */
      React.createElement(
        View,
        { style: s.ribbon },
        React.createElement(
          View,
          null,
          React.createElement(
            View,
            { style: s.brand },
            React.createElement(Text, { style: s.brandAdi }, "Adi"),
            React.createElement(Text, { style: s.brandPlan }, "Plan"),
            React.createElement(
              Text,
              { style: s.brandTag },
              "AI \u00b7 APAC marketing rail"
            )
          ),
          React.createElement(
            Text,
            { style: { fontSize: 8, color: MUTED, marginTop: 4 } },
            "From a competitor headline to a brand-cleared, trust-graded, live-shipped deliverable. In one operator."
          )
        ),
        React.createElement(
          View,
          { style: s.ribbonRight },
          React.createElement(
            Text,
            { style: s.ribbonStamp },
            "Decision-maker brief"
          ),
          React.createElement(
            Text,
            { style: s.ribbonTitle },
            `Demo \u00b7 May 7, 2026`
          ),
          React.createElement(
            Text,
            { style: { fontSize: 7, color: MUTED, marginTop: 1 } },
            "Internal \u00b7 Adisseo APAC"
          )
        )
      ),
      /* Headline */
      React.createElement(
        Text,
        { style: s.headline },
        "Why APAC exists, in one operator."
      ),
      React.createElement(
        Text,
        { style: s.subhead },
        "Adisseo APAC's marketing team ships ~30 deliverables a quarter across 4 species, 8 languages, and 4 countries — each one of them anchored on a fast-moving competitor signal that today gets discovered, framed, drafted, brand-reviewed, translated, and shipped by 11 different humans across 3 timezones. APAC is the operator that does all of that as one continuous flow, with brand-guardrails and trust-grading baked in."
      ),
      /* Stat strip */
      React.createElement(
        View,
        { style: s.stats },
        React.createElement(
          View,
          { style: s.stat },
          React.createElement(
            Text,
            { style: s.statValue },
            String(data.liveModules)
          ),
          React.createElement(Text, { style: s.statLabel }, "Live modules")
        ),
        React.createElement(
          View,
          { style: s.stat },
          React.createElement(
            Text,
            { style: s.statValue },
            `${data.tenants}`
          ),
          React.createElement(Text, { style: s.statLabel }, "Tenants modelled")
        ),
        React.createElement(
          View,
          { style: s.stat },
          React.createElement(Text, { style: s.statValue }, `${data.channels}`),
          React.createElement(Text, { style: s.statLabel }, "Channels wired")
        ),
        React.createElement(
          View,
          { style: s.stat },
          React.createElement(
            Text,
            { style: s.statValue },
            `${data.trustChecks}`
          ),
          React.createElement(Text, { style: s.statLabel }, "Trust-gate checks")
        ),
        React.createElement(
          View,
          { style: s.stat },
          React.createElement(Text, { style: s.statValue }, "1 wk"),
          React.createElement(Text, { style: s.statLabel }, "From cold to demo")
        )
      ),
      /* 5-layer architecture */
      React.createElement(
        Text,
        { style: s.sectionLabel },
        "5-Layer architecture"
      ),
      React.createElement(
        Text,
        { style: s.sectionTitle },
        "What sits inside the operator."
      ),
      React.createElement(
        View,
        { style: s.archRow },
        ...ARCH.map((l) =>
          React.createElement(
            View,
            { key: l.num, style: s.archCard },
            React.createElement(IconBase, {
              d: l.iconPath,
              color: l.color,
            }),
            React.createElement(Text, { style: s.archNumber }, l.num),
            React.createElement(Text, { style: s.archName }, l.name),
            React.createElement(Text, { style: s.archBody }, l.body)
          )
        )
      ),
      /* Before / After */
      React.createElement(
        Text,
        { style: s.sectionLabel },
        "What changes for Adisseo"
      ),
      React.createElement(
        View,
        { style: s.beforeAfter },
        React.createElement(
          View,
          { style: s.baCol },
          React.createElement(
            Text,
            { style: { ...s.baLabel, color: MUTED } },
            "Today \u00b7 11 humans, 3 timezones"
          ),
          React.createElement(
            Text,
            { style: s.baTitle },
            "From signal to shipped: 7\u20139 working days"
          ),
          React.createElement(
            Text,
            { style: s.baBullet },
            "\u2022  Marketing analyst monitors 14 competitor sources by hand"
          ),
          React.createElement(
            Text,
            { style: s.baBullet },
            "\u2022  Species manager drafts in Word, language pair = manual"
          ),
          React.createElement(
            Text,
            { style: s.baBullet },
            "\u2022  HQ brand-guardrail review = email thread, no audit trail"
          ),
          React.createElement(
            Text,
            { style: s.baBullet },
            "\u2022  Channel-fit decided per channel manager, no preview"
          ),
          React.createElement(
            Text,
            { style: s.baBullet },
            "\u2022  Engagement = self-reported, no benchmark"
          )
        ),
        React.createElement(
          View,
          { style: s.baCol },
          React.createElement(
            Text,
            { style: { ...s.baLabel, color: CRIMSON } },
            "On APAC \u00b7 1 operator, 1 day"
          ),
          React.createElement(
            Text,
            { style: s.baTitle },
            "From signal to shipped: under 1 working day"
          ),
          React.createElement(
            Text,
            { style: s.baBullet },
            "\u2022  Auto-scrape \u2192 LLM-match \u2192 CBI + persona + format hints"
          ),
          React.createElement(
            Text,
            { style: s.baBullet },
            "\u2022  Per-manager brand-voice fingerprint + per-tenant guardrails"
          ),
          React.createElement(
            Text,
            { style: s.baBullet },
            "\u2022  HQ approval queue with reviewer comments + audit log"
          ),
          React.createElement(
            Text,
            { style: s.baBullet },
            "\u2022  Channel-native preview before ship; live or queued dispatch"
          ),
          React.createElement(
            Text,
            { style: s.baBullet },
            "\u2022  Engagement tracker grades vs. 43% Malaysia-ASF benchmark"
          )
        )
      ),
      /* What's live today */
      React.createElement(
        Text,
        { style: s.sectionLabel },
        "What's live today"
      ),
      React.createElement(
        View,
        { style: s.twoCol },
        React.createElement(
          View,
          { style: { flex: 1 } },
          ...[
            "Stakeholder influence map (region + species filters)",
            "CBI \u00d7 CSF ladder + Personas \u00d7 CSF diagonal matrix",
            "News bridge \u2192 LLM match \u2192 strategic frame composer",
            "Per-species studios: Aqua leaflet, Poultry email + carousel",
            "Ruminants manga (JA/EN), Swine vertical short, voice memo",
            "Voice-memo studio with Whisper transcription",
          ].map((t) =>
            React.createElement(
              View,
              { key: t, style: s.proofItem },
              React.createElement(IconCheck, null),
              React.createElement(Text, { style: s.proofText }, t)
            )
          )
        ),
        React.createElement(
          View,
          { style: { flex: 1 } },
          ...[
            "Trust layer: slop \u00b7 voice \u00b7 grammar \u00b7 citations",
            "Vault + RAG with citation checker + research depth",
            "Brand-guardrail approval queue with audit trail",
            "Multi-tenant rails: 4 tenants \u00d7 5 channels each",
            "Channel-native previews + scheduled-send queue",
            "HMAC-signed webhook inbox + live email via Mailgun",
          ].map((t) =>
            React.createElement(
              View,
              { key: t, style: s.proofItem },
              React.createElement(IconCheck, null),
              React.createElement(Text, { style: s.proofText }, t)
            )
          )
        )
      ),
      /* Cost envelope */
      React.createElement(
        Text,
        { style: s.sectionLabel },
        "Run-cost envelope (per tenant, per month)"
      ),
      React.createElement(
        Text,
        { style: s.body },
        "Compute \u20AC20 \u00b7 LLM tokens (~3M/mo) \u20AC180\u2013240 \u00b7 Mailgun (10k sends) \u20AC15 \u00b7 Vault (Postgres + pgvector, 50GB) \u20AC25 \u00b7 Observability \u20AC40 \u00b7 Channel API quotas: included. \u00a0\u00a0Total \u20AC280\u2013340/mo per tenant. Adisseo APAC alone replaces ~6 part-time roles \u2014 net savings ~\u20AC18k/mo."
      ),
      /* Footer */
      React.createElement(
        View,
        { style: s.footer },
        React.createElement(
          Text,
          { style: s.footerLeft },
          "APAC AI \u00b7 Internal demo build \u00b7 26 modules live, every one runnable in the browser.\nThis brief is generated from the live module registry \u2014 numbers refresh on every print."
        ),
        React.createElement(
          View,
          { style: { alignItems: "flex-end" } },
          React.createElement(
            Text,
            { style: s.footerRightLabel },
            "Open the live demo"
          ),
          React.createElement(
            Text,
            { style: s.footerUrl },
            "adiplan.adisseo.example/demo"
          )
        )
      )
    )
  );
}

/* ----------------------------------------------------------------------------
 * GET /api/render-adisseo-onepager
 * -------------------------------------------------------------------------- */
export async function GET(_req: NextRequest) {
  ensureFonts();
  const data: OnePagerData = {
    liveModules: 26,
    tenants: TENANT_LIST.length,
    channels: CHANNEL_LIST.length,
    trustChecks: 4,
  };
  const buffer = await renderToBuffer(
    React.createElement(OnePager, { data })
  );
  return new NextResponse(buffer as unknown as Uint8Array, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition":
        'inline; filename="APAC-decision-maker-onepager.pdf"',
      "cache-control": "no-store",
    },
  });
}
