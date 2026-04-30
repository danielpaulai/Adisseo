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
} from "@react-pdf/renderer";
import React from "react";
import type { PlanOnPageData } from "@/lib/plan-on-page";

export const runtime = "nodejs";

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
const MUTED = "#6B7280";
const LINE = "#E5E7EB";
const PAPER = "#FBF9F9";

const s = StyleSheet.create({
  page: {
    fontFamily: "Noto Sans",
    fontSize: 8.5,
    color: INK,
    backgroundColor: PAPER,
    padding: 26,
    lineHeight: 1.35,
  },
  topRibbon: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  brandStripe: { flexDirection: "row", alignItems: "center", gap: 6 },
  brandDot: { width: 10, height: 10, backgroundColor: CRIMSON, borderRadius: 999 },
  brandText: {
    fontSize: 9,
    fontWeight: 700,
    color: CRIMSON,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  metaText: {
    fontSize: 7.5,
    color: MUTED,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    fontWeight: 700,
  },
  hero: { marginTop: 12, marginBottom: 10 },
  heroLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: CRIMSON,
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: INK,
    marginTop: 4,
    lineHeight: 1.15,
  },
  heroSub: { fontSize: 9, color: MUTED, marginTop: 4 },
  heroCBI: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  tag: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  // 4-quadrant grid
  grid: { flexDirection: "row", gap: 10, marginBottom: 10 },
  quadrant: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 6,
    padding: 10,
  },
  quadrantHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  quadrantNum: {
    fontFamily: "Noto Sans",
    fontSize: 14,
    fontWeight: 700,
    color: CRIMSON,
  },
  quadrantTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: INK,
  },
  // stakeholder rows
  stakeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 5,
    paddingBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  bubble: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginTop: 1,
  },
  stakeMeta: {
    fontSize: 7,
    color: MUTED,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 1,
  },
  // frame TVS panels
  tvsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
  },
  tvsPanel: {
    flex: 1,
    backgroundColor: PAPER,
    borderRadius: 4,
    padding: 6,
  },
  tvsLabel: {
    fontSize: 6.5,
    fontWeight: 700,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  tvsBody: { fontSize: 8, fontWeight: 700, lineHeight: 1.25 },
  // next moves
  moveRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  moveStatus: {
    fontSize: 6.5,
    fontWeight: 700,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  // KPI rows
  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    gap: 6,
  },
  // CTA strip
  ctaStrip: {
    backgroundColor: CRIMSON,
    borderRadius: 6,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  // footer
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: LINE,
    fontSize: 6.5,
    color: MUTED,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: 700,
  },
});

const INFLUENCE_SIZE = { small: 8, medium: 12, large: 18 } as const;
const PERSONA_COLOR: Record<string, string> = {
  "Efficiency Optimizer": CRIMSON,
  "System Simplifier": CYAN,
  "Risk Reducer": ORANGE,
  "Sustainability Advocate": "#047857",
  "Knowledge Builder": "#7C3AED",
};

function PlanPdf({ data }: { data: PlanOnPageData }) {
  const dateStr = new Date(data.generatedAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: "A4", style: s.page },

      // ============= TOP RIBBON =============
      React.createElement(
        View,
        { style: s.topRibbon },
        React.createElement(
          View,
          { style: s.brandStripe },
          React.createElement(View, { style: s.brandDot }),
          React.createElement(
            Text,
            { style: s.brandText },
            "Adisseo · Plan on a Page"
          )
        ),
        React.createElement(
          Text,
          { style: s.metaText },
          `${data.region} · ${dateStr}`
        )
      ),

      // ============= HERO =============
      React.createElement(
        View,
        { style: s.hero },
        React.createElement(Text, { style: s.heroLabel }, "Campaign"),
        React.createElement(Text, { style: s.heroTitle }, data.campaignName),
        React.createElement(
          Text,
          { style: s.heroSub },
          `One-line: ${data.oneLineSummary}`
        ),
        React.createElement(
          View,
          { style: s.heroCBI },
          React.createElement(
            Text,
            {
              style: { ...s.tag, backgroundColor: "#FCE3E9", color: CRIMSON },
            },
            `CBI · ${data.cbi}`
          ),
          React.createElement(
            Text,
            {
              style: { ...s.tag, backgroundColor: "#E0F4F8", color: CYAN },
            },
            `Persona · ${data.persona}`
          ),
          React.createElement(
            Text,
            {
              style: { ...s.tag, backgroundColor: "#FAEAE0", color: ORANGE },
            },
            `Region · ${data.region}`
          )
        )
      ),

      // ============= QUADRANT GRID — ROW 1 =============
      React.createElement(
        View,
        { style: s.grid },
        // Q1 — Stakeholders
        React.createElement(
          View,
          { style: s.quadrant },
          React.createElement(
            View,
            { style: s.quadrantHeader },
            React.createElement(Text, { style: s.quadrantNum }, "01"),
            React.createElement(
              Text,
              { style: s.quadrantTitle },
              "Stakeholders we're moving"
            )
          ),
          ...data.topStakeholders.map((st, i) =>
            React.createElement(
              View,
              { key: `st-${i}`, style: s.stakeRow },
              React.createElement(View, {
                style: {
                  ...s.bubble,
                  width: INFLUENCE_SIZE[st.influence],
                  height: INFLUENCE_SIZE[st.influence],
                  backgroundColor: PERSONA_COLOR[st.persona] ?? MUTED,
                },
              }),
              React.createElement(
                View,
                { style: { flex: 1 } },
                React.createElement(
                  Text,
                  { style: { fontSize: 8.5, fontWeight: 700 } },
                  st.name
                ),
                React.createElement(
                  Text,
                  { style: s.stakeMeta },
                  `${st.influence} · ${st.trend} · ${st.persona}`
                ),
                React.createElement(
                  Text,
                  { style: { fontSize: 7.5, color: INK, marginTop: 2 } },
                  `⤷ ${st.topRung}`
                )
              )
            )
          )
        ),

        // Q2 — Strategic frame condensed
        React.createElement(
          View,
          { style: s.quadrant },
          React.createElement(
            View,
            { style: s.quadrantHeader },
            React.createElement(Text, { style: s.quadrantNum }, "02"),
            React.createElement(
              Text,
              { style: s.quadrantTitle },
              "Strategic frame"
            )
          ),
          React.createElement(
            Text,
            {
              style: {
                fontSize: 8,
                color: INK,
                fontStyle: "italic",
                marginBottom: 6,
              },
            },
            data.enterpriseInsight
          ),
          React.createElement(
            View,
            { style: s.tvsRow },
            React.createElement(
              View,
              { style: s.tvsPanel },
              React.createElement(
                Text,
                { style: { ...s.tvsLabel, color: CRIMSON } },
                "Pain"
              ),
              React.createElement(Text, { style: s.tvsBody }, data.pain)
            ),
            React.createElement(
              View,
              { style: s.tvsPanel },
              React.createElement(
                Text,
                { style: { ...s.tvsLabel, color: CYAN } },
                "Promise"
              ),
              React.createElement(Text, { style: s.tvsBody }, data.promise)
            )
          ),
          React.createElement(
            View,
            { style: s.tvsRow },
            React.createElement(
              View,
              { style: s.tvsPanel },
              React.createElement(
                Text,
                { style: { ...s.tvsLabel, color: ORANGE } },
                "Proof"
              ),
              React.createElement(Text, { style: s.tvsBody }, data.proof)
            ),
            React.createElement(
              View,
              { style: s.tvsPanel },
              React.createElement(
                Text,
                { style: { ...s.tvsLabel, color: "#047857" } },
                "Proposition"
              ),
              React.createElement(Text, { style: s.tvsBody }, data.proposition)
            )
          )
        )
      ),

      // ============= QUADRANT GRID — ROW 2 =============
      React.createElement(
        View,
        { style: s.grid },
        // Q3 — Next moves
        React.createElement(
          View,
          { style: s.quadrant },
          React.createElement(
            View,
            { style: s.quadrantHeader },
            React.createElement(Text, { style: s.quadrantNum }, "03"),
            React.createElement(
              Text,
              { style: s.quadrantTitle },
              "Next moves"
            )
          ),
          ...(data.nextMoves.length
            ? data.nextMoves
            : [
                {
                  species: "Cross",
                  deliverable:
                    "Open News Bridge → Strategic Frame → species Studio to seed the next-moves list.",
                  status: "planned" as const,
                },
              ]
          ).map((m, i) =>
            React.createElement(
              View,
              { key: `mv-${i}`, style: s.moveRow },
              React.createElement(
                Text,
                {
                  style: {
                    ...s.moveStatus,
                    backgroundColor:
                      m.status === "shipped" ? "#DCFCE7" : "#FEF3C7",
                    color: m.status === "shipped" ? "#065F46" : "#92400E",
                    minWidth: 36,
                    textAlign: "center",
                  },
                },
                m.status
              ),
              React.createElement(
                View,
                { style: { flex: 1 } },
                React.createElement(
                  Text,
                  { style: { fontSize: 8.5, fontWeight: 700 } },
                  `${m.species} · ${m.deliverable}`
                ),
                m.detail
                  ? React.createElement(
                      Text,
                      {
                        style: {
                          fontSize: 7.5,
                          color: MUTED,
                          marginTop: 2,
                        },
                      },
                      m.detail
                    )
                  : null
              )
            )
          )
        ),

        // Q4 — KPI targets
        React.createElement(
          View,
          { style: s.quadrant },
          React.createElement(
            View,
            { style: s.quadrantHeader },
            React.createElement(Text, { style: s.quadrantNum }, "04"),
            React.createElement(
              Text,
              { style: s.quadrantTitle },
              "KPI targets"
            )
          ),
          React.createElement(
            Text,
            {
              style: {
                fontSize: 7.5,
                color: MUTED,
                marginBottom: 4,
              },
            },
            "Anchored on the Malaysia-ASF Q4 2025 baseline (the bar Ricardo named on the Apr 28 call)."
          ),
          ...data.kpiTargets.map((k, i) =>
            React.createElement(
              View,
              { key: `kpi-${i}`, style: s.kpiRow },
              React.createElement(
                View,
                { style: { flex: 1 } },
                React.createElement(
                  Text,
                  { style: { fontSize: 8, fontWeight: 700 } },
                  k.name
                ),
                React.createElement(
                  Text,
                  { style: { fontSize: 7, color: MUTED, marginTop: 1 } },
                  k.source
                )
              ),
              React.createElement(
                Text,
                { style: { fontSize: 11, fontWeight: 700, color: CRIMSON } },
                k.target
              )
            )
          )
        )
      ),

      // ============= CTA STRIP =============
      React.createElement(
        View,
        { style: s.ctaStrip },
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(
            Text,
            {
              style: {
                fontSize: 7,
                color: "#ffd5dd",
                fontWeight: 700,
                letterSpacing: 1.6,
                textTransform: "uppercase",
              },
            },
            "Next step"
          ),
          React.createElement(
            Text,
            {
              style: {
                fontSize: 13,
                fontWeight: 700,
                color: "#FFFFFF",
                marginTop: 3,
                lineHeight: 1.2,
              },
            },
            data.cta
          )
        )
      ),

      // ============= FOOTER =============
      React.createElement(
        View,
        { style: s.footer },
        React.createElement(
          Text,
          {},
          `${data.author} · generated ${dateStr}`
        ),
        React.createElement(
          Text,
          {},
          `${data.competitor ? `Anchor: ${data.competitor}` : "APAC AI"} · APAC pilot`
        )
      )
    )
  );
}

export async function POST(req: NextRequest) {
  ensureFonts();
  const body = (await req.json()) as { plan: PlanOnPageData };
  if (!body?.plan?.cbi) {
    return NextResponse.json({ error: "missing plan" }, { status: 400 });
  }
  const element = React.createElement(PlanPdf, { data: body.plan });
  const buf = await renderToBuffer(
    element as Parameters<typeof renderToBuffer>[0]
  );
  return new NextResponse(buf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="adisseo-plan-on-a-page.pdf"`,
    },
  });
}
