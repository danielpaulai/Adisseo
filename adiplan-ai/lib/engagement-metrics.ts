/**
 * APAC plan — Phase 7 (DEMO PRIORITY 3)
 *
 * Engagement-metrics glossary.
 *
 * Ricardo's note on the Apr 30 call: "Drop 'views'. Tell me what the
 * buyer actually did." That means per-channel signals:
 *
 *   • LinkedIn — likes, comments, shares, saves
 *   • Email    — opens, clicks (Mailgun webhooks)
 *   • PDF      — downloads, full-read flags
 *
 * This module is the single source of truth for what each channel
 * counts as a meaningful engagement signal. The /engagement-tracker
 * page consumes it for column headers, tooltips, and grading.
 */

import type {
  DeliverableInstance,
  DeliverableKind,
} from "@/lib/engagement";

export type EngagementChannel =
  | "linkedin"
  | "email"
  | "wechat"
  | "whatsapp"
  | "trade-mag"
  | "pdf-download";

export interface ChannelMetricSpec {
  channel: EngagementChannel;
  label: string;
  /** What the headline number on the dashboard means, in plain English. */
  primaryMetric: string;
  /** What "qualified" looks like for this channel. */
  qualifiedMetric: string;
  /** Sub-signals worth surfacing in tooltips. */
  signals: string[];
  /** Source system for the data. */
  source: string;
}

export const CHANNEL_METRICS: Record<EngagementChannel, ChannelMetricSpec> = {
  linkedin: {
    channel: "linkedin",
    label: "LinkedIn",
    primaryMetric: "Reach (impressions)",
    qualifiedMetric: "Engaged accounts (like / comment / share / save)",
    signals: [
      "Likes — passive endorsement",
      "Comments — conversation initiator",
      "Shares — second-degree distribution",
      "Saves — buying-signal proxy",
      "Profile clicks from the post",
    ],
    source: "LinkedIn organic insights",
  },
  email: {
    channel: "email",
    label: "Email (Mailgun)",
    primaryMetric: "Delivered",
    qualifiedMetric: "Click-through (CTR)",
    signals: [
      "Opens — read receipts where pixel allowed",
      "Clicks — links to vault PDFs / cycle data",
      "Replies — direct technical follow-up",
      "Unsubscribes — content-fit signal",
      "Bounces — list-hygiene signal",
    ],
    source: "Mailgun events API",
  },
  wechat: {
    channel: "wechat",
    label: "WeChat",
    primaryMetric: "Plays",
    qualifiedMetric: "Watch >50%",
    signals: [
      "Plays — initiated views",
      "Watch >50% — qualified attention",
      "Saves to favourites",
      "Forwards to chat / Moments",
      "Profile follows from the play",
    ],
    source: "WeChat Official Account analytics",
  },
  whatsapp: {
    channel: "whatsapp",
    label: "WhatsApp Business",
    primaryMetric: "Sent",
    qualifiedMetric: "Replies + media downloads",
    signals: [
      "Delivered (double tick)",
      "Read (blue tick) where allowed",
      "Replies — direct dialogue",
      "Media downloaded (PDF / image)",
      "Forwarded to contact",
    ],
    source: "WhatsApp Business API",
  },
  "trade-mag": {
    channel: "trade-mag",
    label: "Trade magazine",
    primaryMetric: "Print circulation",
    qualifiedMetric: "Reader response (callbacks / QR scans)",
    signals: [
      "Print circulation",
      "QR scans on the leaflet",
      "Reader-card requests",
      "Magazine-driven inbound calls",
      "Backlinks / mentions on the magazine site",
    ],
    source: "Magazine publisher report + QR-code analytics",
  },
  "pdf-download": {
    channel: "pdf-download",
    label: "PDF download",
    primaryMetric: "Downloads",
    qualifiedMetric: "Reads >80%",
    signals: [
      "Downloads — gated form completions",
      "Read >80% (page-progress tracking)",
      "Print events",
      "Forwards (referrer changes)",
    ],
    source: "Document analytics (DocSend-style)",
  },
};

/**
 * Reverse map — given a deliverable kind, surface the most natural
 * channel metric set so the row label uses the right vocabulary.
 */
export function primaryChannelForKind(
  kind: DeliverableKind,
  region?: string
): EngagementChannel {
  switch (kind) {
    case "carousel":
      return "linkedin";
    case "email":
      return "email";
    case "leaflet":
      return "trade-mag";
    case "short":
      return region?.toLowerCase().includes("china") ? "wechat" : "linkedin";
    case "manga":
      return "pdf-download";
    case "voice-memo":
      return "whatsapp";
    case "frame":
      return "pdf-download";
    default:
      return "pdf-download";
  }
}

/* ============================================================================
 * Phase 7 — extended engagement metrics on DeliverableInstance
 *
 * The legacy `views / qualifiedViews / conversations / conversions` funnel
 * stays as the *aggregate* shape the funnel maths run on. The new
 * `EngagementBreakdown` lives alongside it so the UI can show "real"
 * per-channel signals rather than the generic "views" label.
 * ========================================================================== */

export interface LinkedInMetrics {
  impressions: number;
  reactions: number;
  comments: number;
  shares: number;
  saves: number;
  profileClicks: number;
}

export interface EmailMetrics {
  delivered: number;
  opens: number;
  uniqueOpens: number;
  clicks: number;
  replies: number;
  unsubscribes: number;
}

export interface WeChatMetrics {
  plays: number;
  watch50pct: number;
  saves: number;
  forwards: number;
}

export interface PdfMetrics {
  downloads: number;
  reads80pct: number;
  prints: number;
}

export interface EngagementBreakdown {
  linkedin?: LinkedInMetrics;
  email?: EmailMetrics;
  wechat?: WeChatMetrics;
  pdf?: PdfMetrics;
  /** Free-form per-channel notes, surfaced in the tracker tooltip. */
  notes?: string[];
}

/* ============================================================================
 * Helpers — derive the right "headline reach" + "headline qualified" for a
 * deliverable, picking the channel-native pair when present.
 * ========================================================================== */

export interface HeadlineSignal {
  reachLabel: string;
  reachValue: number;
  qualifiedLabel: string;
  qualifiedValue: number;
  source: string;
}

export function headlineFor(
  d: DeliverableInstance,
  breakdown?: EngagementBreakdown
): HeadlineSignal {
  const channel = primaryChannelForKind(d.kind, d.region);
  const meta = CHANNEL_METRICS[channel];

  if (breakdown?.linkedin && channel === "linkedin") {
    const li = breakdown.linkedin;
    const engaged = li.reactions + li.comments + li.shares + li.saves;
    return {
      reachLabel: "Impressions",
      reachValue: li.impressions,
      qualifiedLabel: "Engaged accounts",
      qualifiedValue: engaged,
      source: meta.source,
    };
  }
  if (breakdown?.email && channel === "email") {
    return {
      reachLabel: "Delivered",
      reachValue: breakdown.email.delivered,
      qualifiedLabel: "Click-throughs",
      qualifiedValue: breakdown.email.clicks,
      source: meta.source,
    };
  }
  if (breakdown?.wechat && channel === "wechat") {
    return {
      reachLabel: "Plays",
      reachValue: breakdown.wechat.plays,
      qualifiedLabel: "Watch >50%",
      qualifiedValue: breakdown.wechat.watch50pct,
      source: meta.source,
    };
  }
  if (breakdown?.pdf) {
    return {
      reachLabel: "Downloads",
      reachValue: breakdown.pdf.downloads,
      qualifiedLabel: "Read >80%",
      qualifiedValue: breakdown.pdf.reads80pct,
      source: meta.source,
    };
  }

  // Fallback — keep the legacy funnel labels but rename "views" → "reach"
  return {
    reachLabel: meta.primaryMetric,
    reachValue: d.views,
    qualifiedLabel: meta.qualifiedMetric,
    qualifiedValue: d.qualifiedViews,
    source: `${meta.source} (estimated)`,
  };
}

/* ============================================================================
 * Demo seed — channel-native breakdowns for the Phase 6 / Phase 5 deliverables
 * the engagement tracker already shows. Lives here (not in engagement.ts) so
 * the tracker page can opt-in render the richer columns without changing the
 * existing funnel maths.
 * ========================================================================== */

export const SEED_BREAKDOWNS: Record<string, EngagementBreakdown> = {
  "del-malaysia-asf-2025q4": {
    pdf: { downloads: 38, reads80pct: 7, prints: 4 },
    notes: [
      "Hosted on the integrator vet portal — gated download form.",
      "Reads >80% tracked via embedded page-progress beacon.",
    ],
  },
  "del-poultry-agp-q1": {
    email: {
      delivered: 142,
      opens: 96,
      uniqueOpens: 78,
      clicks: 31,
      replies: 7,
      unsubscribes: 1,
    },
    notes: [
      "Mailgun events — opens net of pixel-blockers.",
      "Top click target: vault link to Vish's trial protocol.",
    ],
  },
  "del-poultry-carousel-q1": {
    linkedin: {
      impressions: 1840,
      reactions: 64,
      comments: 9,
      shares: 12,
      saves: 11,
      profileClicks: 43,
    },
    notes: [
      "LinkedIn organic. Saves / share ratio above poultry-channel average.",
    ],
  },
  "del-aqua-leaflet-id-q4": {
    pdf: { downloads: 86, reads80pct: 24, prints: 6 },
    notes: [
      "Trobos Aqua co-publish — counted via QR code on the printed page.",
    ],
  },
  "del-aqua-leaflet-vi-q1": {
    pdf: { downloads: 64, reads80pct: 19, prints: 3 },
  },
  "del-ruminants-manga-jp-q1": {
    pdf: { downloads: 91, reads80pct: 28, prints: 12 },
    notes: [
      "Hokkaido Dairy Times — printed insert, downloads tracked through co-op portal.",
    ],
  },
  "del-ruminants-manga-jp-q1b": {
    pdf: { downloads: 47, reads80pct: 14, prints: 5 },
  },
  "del-swine-wechat-zh-q1": {
    wechat: { plays: 612, watch50pct: 41, saves: 14, forwards: 22 },
    notes: [
      "WeChat Official Account analytics — saves into favourites is the conversion proxy.",
    ],
  },
};
