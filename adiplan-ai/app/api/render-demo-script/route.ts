/**
 * 90-second demo-video shooting script — H of the May 7 demo prep.
 *
 * One A4 portrait. Designed to be printed, taped to the side of the
 * laptop, and read while screen-recording the live demo. Layout:
 *
 *   - Top ribbon: title + date + total runtime
 *   - 8-row shot table: cue / on-screen / voice-over / time
 *   - Bottom strip: take notes + cut-points + safe-room music
 *
 * Same styling primitives as render-adisseo-onepager — Noto Sans font
 * pack from public/fonts, Adisseo crimson + cyan accents, no SVG
 * heavy-lifting. Pure deterministic content.
 */

import { NextResponse } from "next/server";
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
const INK = "#0E1216";
const INK_SOFT = "#2A2F35";
const MUTED = "#6B7280";
const LINE = "#E5E7EB";
const PAPER = "#FBF9F9";
const STONE = "#F5F4F2";

const s = StyleSheet.create({
  page: {
    fontFamily: "Noto Sans",
    fontSize: 9,
    color: INK,
    backgroundColor: PAPER,
    padding: 28,
    lineHeight: 1.35,
  },
  ribbon: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: CRIMSON,
  },
  ribbonLeft: {
    flexDirection: "column",
  },
  tag: {
    color: CRIMSON,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1.4,
  },
  headline: {
    fontSize: 18,
    fontWeight: 700,
    color: INK,
    marginTop: 2,
  },
  ribbonMeta: {
    fontSize: 8.5,
    color: MUTED,
  },
  metaBox: {
    alignItems: "flex-end",
  },
  runtimeChip: {
    backgroundColor: CRIMSON,
    color: "white",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 9,
    fontWeight: 700,
  },
  subhead: {
    fontSize: 9,
    color: INK_SOFT,
    marginTop: 8,
    marginBottom: 6,
  },
  /* Shot table */
  table: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 4,
  },
  th: {
    flexDirection: "row",
    backgroundColor: INK,
  },
  thCell: {
    color: "white",
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 0.6,
    padding: 6,
  },
  tr: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: LINE,
  },
  trAlt: {
    backgroundColor: STONE,
  },
  td: {
    padding: 6,
    fontSize: 8,
    color: INK_SOFT,
  },
  cueCell: {
    width: "9%",
    backgroundColor: CYAN,
    color: "white",
    fontWeight: 700,
    textAlign: "center",
    paddingVertical: 8,
    fontSize: 8,
  },
  timeCell: {
    width: "9%",
    fontSize: 7.5,
    fontWeight: 700,
    color: CRIMSON,
    textAlign: "center",
    paddingVertical: 8,
  },
  screenCell: {
    width: "32%",
    fontSize: 7.5,
    fontWeight: 700,
    color: INK,
  },
  voCell: {
    width: "50%",
    fontSize: 8,
    color: INK_SOFT,
  },
  /* Bottom note panels */
  noteRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
  notePanel: {
    flex: 1,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "white",
    borderRadius: 6,
    padding: 8,
  },
  notePanelTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: CRIMSON,
    letterSpacing: 0.8,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  noteBullet: {
    fontSize: 8,
    color: INK_SOFT,
    marginBottom: 2,
  },
  footer: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: LINE,
    fontSize: 7.5,
    color: MUTED,
    textAlign: "center",
  },
});

/* ---------------------------------------------------------------------------
 * The shoot script.
 * 8 shots, sums to 90s. Each row is independently filmable so retakes
 * don't break the whole video.
 * ------------------------------------------------------------------------- */

interface Shot {
  cue: string;
  time: string;
  onScreen: string;
  vo: string;
}

const SHOTS: Shot[] = [
  {
    cue: "01",
    time: "0:00–0:08",
    onScreen: "Landing page hero, AnimatedBeam pulsing",
    vo: "APAC turns one piece of competitor news into a fully approved Adisseo campaign — in under ninety seconds.",
  },
  {
    cue: "02",
    time: "0:08–0:18",
    onScreen: "/dashboard → click 'Pre-load demo activity' → numbers fill",
    vo: "One click hydrates the full demo state: stakeholders, news, frames, deliverables, distribution log, engagement.",
  },
  {
    cue: "03",
    time: "0:18–0:30",
    onScreen: "/competitor-watch → pick article → composes CBI + persona + suggested formats",
    vo: "A real Mintec article on Asian feed-additive prices. APAC picks the right CBI ladder, the right persona, and proposes three deliverables.",
  },
  {
    cue: "04",
    time: "0:30–0:42",
    onScreen: "/studio/poultry → ProseQualityCard live-scoring → trust score 87",
    vo: "Every claim cites an adisseo.com page from the Vault. The trust layer scores prose on slop, brand voice, language, and citation density. Below 75, you can't ship.",
  },
  {
    cue: "05",
    time: "0:42–0:54",
    onScreen: "/approval-queue → reviewer (Claire) marks Approved → toast",
    vo: "It then goes to brand review. Claire on the Adisseo side approves with a comment — full audit trail, no Slack ping required.",
  },
  {
    cue: "06",
    time: "0:54–1:08",
    onScreen: "/distribution → Email channel → preview modal → click Ship",
    vo: "We ship to a real email channel. Mailgun goes live when the env vars are set. A signed webhook fires back to the inbox; engagement updates in real time.",
  },
  {
    cue: "07",
    time: "1:08–1:22",
    onScreen: "/engagement-tracker → 4-stage funnel → above benchmark",
    vo: "Reach, click, dwell, MQL. Four stages, gated by trust score. We can prove outcome, not just output.",
  },
  {
    cue: "08",
    time: "1:22–1:30",
    onScreen: "/tenants → cost model panel → annualised savings $1.06M",
    vo: "Across four tenants, APAC replaces roughly a million dollars of agency spend a year — and gives Adisseo back ninety-six marketing-ops hours every month.",
  },
];

function ShotTable() {
  return React.createElement(
    View,
    { style: s.table },
    React.createElement(
      View,
      { style: s.th },
      React.createElement(Text, { style: [s.thCell, { width: "9%", textAlign: "center" }] }, "CUE"),
      React.createElement(Text, { style: [s.thCell, { width: "9%", textAlign: "center" }] }, "TIME"),
      React.createElement(Text, { style: [s.thCell, { width: "32%" }] }, "ON-SCREEN"),
      React.createElement(Text, { style: [s.thCell, { width: "50%" }] }, "VOICE-OVER")
    ),
    ...SHOTS.map((shot, i) =>
      React.createElement(
        View,
        {
          key: shot.cue,
          style: i % 2 === 1 ? [s.tr, s.trAlt] : s.tr,
        },
        React.createElement(Text, { style: s.cueCell }, shot.cue),
        React.createElement(Text, { style: s.timeCell }, shot.time),
        React.createElement(Text, { style: [s.td, s.screenCell] }, shot.onScreen),
        React.createElement(Text, { style: [s.td, s.voCell] }, `“${shot.vo}”`)
      )
    )
  );
}

function NotePanel({ title, items }: { title: string; items: string[] }) {
  return React.createElement(
    View,
    { style: s.notePanel },
    React.createElement(Text, { style: s.notePanelTitle }, title),
    ...items.map((it, i) =>
      React.createElement(Text, { key: i, style: s.noteBullet }, `• ${it}`)
    )
  );
}

function DemoScript() {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: s.page },
      React.createElement(
        View,
        { style: s.ribbon },
        React.createElement(
          View,
          { style: s.ribbonLeft },
          React.createElement(Text, { style: s.tag }, "DEMO · 90-SECOND SHOOTING SCRIPT"),
          React.createElement(Text, { style: s.headline }, "APAC AI · May 7 walkthrough"),
          React.createElement(
            Text,
            { style: s.ribbonMeta },
            "8 shots · screen-record at 1440×900 · narrate over recording"
          )
        ),
        React.createElement(
          View,
          { style: s.metaBox },
          React.createElement(Text, { style: s.runtimeChip }, "1:30 total"),
          React.createElement(
            Text,
            { style: [s.ribbonMeta, { marginTop: 4 }] },
            "Print this. Tape it next to the trackpad."
          )
        )
      ),
      React.createElement(
        Text,
        { style: s.subhead },
        "Goal: prove APAC can take competitor news → strategy → approved, citation-anchored deliverable → live channel ship → engagement, in real time, without staging."
      ),
      React.createElement(ShotTable),
      React.createElement(
        View,
        { style: s.noteRow },
        React.createElement(NotePanel, {
          title: "Pre-roll checklist",
          items: [
            "Run /demo · click 'Seed full demo state' until panel turns green",
            "Set tenant to Adisseo (top-right switcher)",
            "Open /distribution and /engagement-tracker in two tabs",
            "Confirm Mailgun env vars present, or accept mock dispatch",
            "Mute Slack + email notifications before screen-record",
          ],
        }),
        React.createElement(NotePanel, {
          title: "Cut-points & b-roll",
          items: [
            "Cut between cue 03 to 04 if studio compose lags > 4s",
            "B-roll: zoom on trust-score card (slop / voice / language / citations)",
            "B-roll: approval queue toast — fades after 4s",
            "Insert 1s breath after cue 06 dispatch (let preview render)",
            "Hold final frame on cost panel for 3s before fade",
          ],
        }),
        React.createElement(NotePanel, {
          title: "Voice & music",
          items: [
            "Talk-track: Daniel · 1.05× pace · neutral, evidence-first tone",
            "Music: 'Glass Beach – Soft Steel' bed at -22 dB",
            "Lead-in 0.5s music swell · drop bed at cue 04 · return at cue 07",
            "Avoid hype words: 'unlock', 'revolutionize', 'game-changer'",
            "Brand-voice rules in /trust-layer apply to the talk-track too",
          ],
        })
      ),
      React.createElement(
        Text,
        { style: s.footer },
        "APAC AI · adisseo.com Vault corpus · live modules · cost model on /tenants · pilot workspace"
      )
    )
  );
}

export async function GET() {
  ensureFonts();
  try {
    const buf = await renderToBuffer(React.createElement(DemoScript));
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'inline; filename="apac-demo-script-90s.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "render failed" },
      { status: 500 }
    );
  }
}
