/**
 * Channel adapters — Phase 5 of APAC.
 *
 * Phase 4 wired the gating logic. Phase 5 wires the actual dispatch,
 * but keeps it mock-shaped so we can swap each channel for the real
 * OAuth/REST integration without touching the gate or the UI.
 *
 * The pattern:
 *   1. Each channel implements ChannelAdapter.
 *   2. The adapter returns a ChannelDispatchResult with:
 *       - publicUrl  — what the recipient sees (or would see)
 *       - audienceCount — actual reach (mocked)
 *       - preview — the rendered payload for the demo UI
 *   3. /api/distribute calls the adapter after gates pass.
 *   4. The adapter is responsible for producing the channel-native
 *      preview the demo can show (LinkedIn carousel, WeChat OA card,
 *      WhatsApp message, email, trade-mag submission).
 *
 * In production:
 *   - linkedin   → LinkedIn UGC API + organisation page id
 *   - wechat     → WeChat OA "publish" API
 *   - whatsapp   → WhatsApp Business API broadcast
 *   - email      → Mailgun / SES
 *   - trade-mag  → editorial submission portal (per publication)
 *
 * For the pitch demo, we just need believable shapes.
 */

import {
  CHANNELS,
  TENANTS,
  type DistributionChannel,
  type TenantId,
} from "@/lib/tenant";

/* ----------------------------------------------------------------------------
 * Result + preview types
 * -------------------------------------------------------------------------- */

export interface ChannelDispatchInput {
  tenantId: TenantId;
  channel: DistributionChannel;
  deliverable: string;
  /** Body / caption / abstract — used to build the preview. */
  body: string;
  /** Subject line for email + trade-mag. */
  subject?: string;
  /** Hashtags for LinkedIn / WeChat. */
  hashtags?: string[];
  /** Region tag for the audience. */
  region?: string;
  species?: "aqua" | "poultry" | "ruminants" | "swine" | "cross";
  /** Author / manager. */
  manager?: string;
  /** Trust composite. */
  trustScore?: number;
  /** Citation count. */
  citationCount?: number;
}

/**
 * Channel-native preview payload. Discriminated union so the UI knows
 * which preview to render for each channel.
 */
export type ChannelPreview =
  | LinkedInPreview
  | WeChatPreview
  | WhatsAppPreview
  | EmailPreview
  | TradeMagPreview;

export interface LinkedInPreview {
  channel: "linkedin";
  authorHandle: string;
  headline: string;
  /** What the body text reads. */
  caption: string;
  hashtags: string[];
  /** "carousel" | "post" | "video". */
  variant: "carousel" | "post" | "video";
  /** Slide titles for carousel. */
  slides?: string[];
  /** Anchor footer (citation chip). */
  anchor: string;
  audienceLine: string;
}

export interface WeChatPreview {
  channel: "wechat";
  oaName: string;
  kicker: string;
  headline: string;
  digest: string;
  /** Cover stripe colour. */
  cover: string;
  audienceLine: string;
}

export interface WhatsAppPreview {
  channel: "whatsapp";
  senderName: string;
  bubbleText: string;
  bulletPoints?: string[];
  /** Optional attachment label. */
  attachmentLabel?: string;
  audienceLine: string;
}

export interface EmailPreview {
  channel: "email";
  fromName: string;
  fromAddress: string;
  subject: string;
  preheader: string;
  proofLine?: string;
  bodyHtmlLikeLines: string[];
  audienceLine: string;
}

export interface TradeMagPreview {
  channel: "trade-mag";
  publication: string;
  headline: string;
  desk: string;
  abstract: string;
  keyPoints: string[];
  /** Section, e.g. "Dairy nutrition · Q2 2026". */
  section: string;
  audienceLine: string;
}

export interface ChannelDispatchResult {
  channel: DistributionChannel;
  /** Resolvable URL the recipient would land on. */
  publicUrl: string;
  /** Mock audience reach. */
  audienceCount: number;
  /** Channel-native preview payload. */
  preview: ChannelPreview;
  /** Mock confirmation id from the channel. */
  externalId: string;
  /** Latency the adapter simulated. */
  latencyMs: number;
}

export interface ChannelAdapter {
  channel: DistributionChannel;
  dispatch(input: ChannelDispatchInput): Promise<ChannelDispatchResult>;
  /** Build the preview without dispatching (so /distribution can preview pre-ship). */
  preview(input: ChannelDispatchInput): ChannelPreview;
}

/* ----------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------- */

function now() {
  return Date.now();
}

function id(prefix: string) {
  return `${prefix}-${now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function clipBody(body: string, max = 320): string {
  const trimmed = body.replace(/\[\^[^\]]+\]/g, "").replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max - 1).trimEnd() + "\u2026";
}

function sentenceParts(body: string, limit = 6): string[] {
  return clipBody(body, 1600)
    .split(/\.(?=\s|$)/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, limit)
    .map((s) => (s.endsWith(".") ? s : `${s}.`));
}

function headlineFrom(deliverable: string, max = 58): string {
  return clipBody(deliverable.replace(/\s*·\s*/g, " · "), max);
}

function compactPoints(body: string, limit = 3, max = 72): string[] {
  return sentenceParts(body, limit).map((s) => clipBody(s, max));
}

function slideTitles(input: ChannelDispatchInput): string[] {
  const points = compactPoints(input.body, 3, 44);
  return [
    headlineFrom(input.deliverable, 38),
    points[0] ?? `Signal from ${input.region ?? "APAC"}.`,
    points[1] ?? `Proof for ${input.species ?? "feed"} buyers.`,
    points[2] ?? "What the sales team should do next.",
    anchorLine(input),
  ];
}

function audienceCountFor(channel: DistributionChannel): number {
  // Synthetic but stable-feeling: pick a believable midpoint per channel.
  const seedNoise = Math.floor(Math.random() * 800);
  switch (channel) {
    case "linkedin":
      return 18_000 + seedNoise * 4;
    case "wechat":
      return 12_400 + seedNoise * 2;
    case "whatsapp":
      return 540 + Math.floor(seedNoise / 2);
    case "email":
      return 6_200 + seedNoise;
    case "trade-mag":
      return 240; // Editorial review queue, not a reach number.
  }
}

function publicUrlFor(channel: DistributionChannel, ext: string): string {
  switch (channel) {
    case "linkedin":
      return `https://www.linkedin.com/feed/update/urn:li:share:${ext}`;
    case "wechat":
      return `https://mp.weixin.qq.com/s/${ext}`;
    case "whatsapp":
      return `whatsapp://broadcast/${ext}`;
    case "email":
      return `https://mail.apac-ai.example/sent/${ext}`;
    case "trade-mag":
      return `https://editorial.apac-ai.example/submission/${ext}`;
  }
}

function tenantHandle(tenantId: TenantId, manager?: string) {
  const t = TENANTS[tenantId];
  if (manager) return `${manager} \u00b7 ${t.name}`;
  return `${t.name} APAC desk`;
}

function defaultHashtags(input: ChannelDispatchInput): string[] {
  if (input.hashtags?.length) return input.hashtags.slice(0, 5);
  const tags: string[] = [];
  if (input.species) tags.push(`#${input.species}`);
  if (input.region) tags.push(`#${input.region.replace(/\s+/g, "")}`);
  tags.push("#animalnutrition", "#feed", "#APAC");
  return tags.slice(0, 5);
}

function anchorLine(input: ChannelDispatchInput): string {
  const trust = input.trustScore;
  const cites = input.citationCount;
  if (trust !== undefined && cites !== undefined) {
    return `Trust ${trust}/100 \u00b7 ${cites} Vault citations`;
  }
  if (trust !== undefined) return `Trust ${trust}/100`;
  return "Anchored on the customer Vault";
}

/* ----------------------------------------------------------------------------
 * Adapters
 * -------------------------------------------------------------------------- */

const linkedin: ChannelAdapter = {
  channel: "linkedin",
  preview(input): LinkedInPreview {
    const variant: LinkedInPreview["variant"] = /carousel/i.test(input.deliverable)
      ? "carousel"
      : /short|video/i.test(input.deliverable)
        ? "video"
        : "post";
    const tag = input.species ?? "feed";
    const slides =
      variant === "carousel"
        ? [
            `Today's signal \u00b7 ${input.region ?? "APAC"}`,
            `Why ${tag} buyers care`,
            `What the trial showed`,
            `What you do tomorrow`,
            `Anchor + sources`,
          ]
        : undefined;
    return {
      channel: "linkedin",
      authorHandle: tenantHandle(input.tenantId, input.manager),
      headline: headlineFrom(input.deliverable),
      caption: clipBody(input.body, 480),
      hashtags: defaultHashtags(input),
      variant,
      slides: variant === "carousel" ? slideTitles(input) : slides,
      anchor: anchorLine(input),
      audienceLine: CHANNELS.linkedin.audience,
    };
  },
  async dispatch(input) {
    const start = now();
    await new Promise((r) => setTimeout(r, CHANNELS.linkedin.mockLatencyMs));
    const externalId = id("urn-li");
    return {
      channel: "linkedin",
      externalId,
      publicUrl: publicUrlFor("linkedin", externalId),
      audienceCount: audienceCountFor("linkedin"),
      preview: this.preview(input),
      latencyMs: now() - start,
    };
  },
};

const wechat: ChannelAdapter = {
  channel: "wechat",
  preview(input): WeChatPreview {
    return {
      channel: "wechat",
      oaName: `${TENANTS[input.tenantId].name} \u00b7 \u4e2d\u56fd\u5b98\u65b9\u53f7`,
      kicker: `${input.species ?? "feed"} · ${input.region ?? "APAC"}`,
      headline: clipBody(input.deliverable, 60),
      digest: clipBody(input.body, 200),
      cover: TENANTS[input.tenantId].accent,
      audienceLine: CHANNELS.wechat.audience,
    };
  },
  async dispatch(input) {
    const start = now();
    await new Promise((r) => setTimeout(r, CHANNELS.wechat.mockLatencyMs));
    const externalId = id("wx");
    return {
      channel: "wechat",
      externalId,
      publicUrl: publicUrlFor("wechat", externalId),
      audienceCount: audienceCountFor("wechat"),
      preview: this.preview(input),
      latencyMs: now() - start,
    };
  },
};

const whatsapp: ChannelAdapter = {
  channel: "whatsapp",
  preview(input): WhatsAppPreview {
    const senderName = input.manager ?? `${TENANTS[input.tenantId].name} desk`;
    const attachmentLabel = /pdf|leaflet|brief|brochure/i.test(input.deliverable)
      ? "1-page PDF \u00b7 attached"
      : /carousel/i.test(input.deliverable)
        ? "Carousel \u00b7 5 slides PDF"
        : undefined;
    return {
      channel: "whatsapp",
      senderName,
      bubbleText: clipBody(input.body, 280),
      bulletPoints: compactPoints(input.body, 2, 56),
      attachmentLabel,
      audienceLine: CHANNELS.whatsapp.audience,
    };
  },
  async dispatch(input) {
    const start = now();
    await new Promise((r) => setTimeout(r, CHANNELS.whatsapp.mockLatencyMs));
    const externalId = id("wa");
    return {
      channel: "whatsapp",
      externalId,
      publicUrl: publicUrlFor("whatsapp", externalId),
      audienceCount: audienceCountFor("whatsapp"),
      preview: this.preview(input),
      latencyMs: now() - start,
    };
  },
};

const email: ChannelAdapter = {
  channel: "email",
  preview(input): EmailPreview {
    const tenant = TENANTS[input.tenantId];
    const fromName = input.manager
      ? `${input.manager} \u00b7 ${tenant.name}`
      : tenant.name;
    const fromAddress = `${(input.manager ?? tenant.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")}@${tenant.id}.apac-ai.example`;
    const subject = input.subject ?? input.deliverable;
    const preheader = clipBody(input.body, 100);
    const lines = clipBody(input.body, 1200)
      .split(/\.(?=\s|$)/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6)
      .map((s) => (s.endsWith(".") ? s : s + "."));
    return {
      channel: "email",
      fromName,
      fromAddress,
      subject,
      preheader,
      proofLine: compactPoints(input.body, 1, 96)[0],
      bodyHtmlLikeLines: lines,
      audienceLine: CHANNELS.email.audience,
    };
  },
  async dispatch(input) {
    const start = now();
    await new Promise((r) => setTimeout(r, CHANNELS.email.mockLatencyMs));
    const externalId = id("em");
    return {
      channel: "email",
      externalId,
      publicUrl: publicUrlFor("email", externalId),
      audienceCount: audienceCountFor("email"),
      preview: this.preview(input),
      latencyMs: now() - start,
    };
  },
};

const tradeMag: ChannelAdapter = {
  channel: "trade-mag",
  preview(input): TradeMagPreview {
    const speciesPub: Record<string, string> = {
      aqua: "Aqua Feed International",
      poultry: "Poultry World Asia",
      ruminants: "Dairy Japan Tategaki",
      swine: "Pig Progress Asia",
      cross: "Feed International APAC",
    };
    const publication = speciesPub[input.species ?? "cross"];
    const desk = TENANTS[input.tenantId].reviewerLabel;
    const section = `${input.species ?? "feed"} nutrition \u00b7 ${
      input.region ?? "APAC"
    } edition`;
    return {
      channel: "trade-mag",
      publication,
      headline: headlineFrom(input.deliverable, 72),
      desk,
      abstract: clipBody(input.body, 600),
      keyPoints: compactPoints(input.body, 3, 82),
      section,
      audienceLine: CHANNELS["trade-mag"].audience,
    };
  },
  async dispatch(input) {
    const start = now();
    await new Promise((r) => setTimeout(r, CHANNELS["trade-mag"].mockLatencyMs));
    const externalId = id("ed");
    return {
      channel: "trade-mag",
      externalId,
      publicUrl: publicUrlFor("trade-mag", externalId),
      audienceCount: audienceCountFor("trade-mag"),
      preview: this.preview(input),
      latencyMs: now() - start,
    };
  },
};

export const ADAPTERS: Record<DistributionChannel, ChannelAdapter> = {
  linkedin,
  wechat,
  whatsapp,
  email,
  "trade-mag": tradeMag,
};

export function getAdapter(channel: DistributionChannel): ChannelAdapter {
  return ADAPTERS[channel];
}

/**
 * Build a preview without dispatching. Used by /distribution to render
 * the channel-native card before the user hits "Ship".
 */
export function buildPreview(input: ChannelDispatchInput): ChannelPreview {
  return getAdapter(input.channel).preview(input);
}
