"use client";

import {
  Mail,
  MessageCircle,
  Newspaper,
  Paperclip,
  Send,
  Smartphone,
} from "lucide-react";
import type { ChannelPreview as ChannelPreviewType } from "@/lib/channel-adapter";

/**
 * ChannelPreview — renders a channel-native preview card so the demo
 * shows what would actually land where. One discriminated branch per
 * channel.
 *
 * Each card is intentionally compact (\u2264 320px tall) so multiple can be
 * shown inline on /distribution.
 */
export function ChannelPreview({ preview }: { preview: ChannelPreviewType }) {
  switch (preview.channel) {
    case "linkedin":
      return <LinkedInCard p={preview} />;
    case "wechat":
      return <WeChatCard p={preview} />;
    case "whatsapp":
      return <WhatsAppCard p={preview} />;
    case "email":
      return <EmailCard p={preview} />;
    case "trade-mag":
      return <TradeMagCard p={preview} />;
  }
}

/* -------------------------------------------------------------------------- */

function LinkedInCard({
  p,
}: {
  p: Extract<ChannelPreviewType, { channel: "linkedin" }>;
}) {
  return (
    <div className="rounded-xl border border-[#0A66C2]/20 bg-white shadow-sm">
      <div className="flex items-center justify-between rounded-t-xl bg-[#0A66C2] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white">
        <span>LinkedIn \u00b7 {p.variant}</span>
        <span className="opacity-80">{p.audienceLine}</span>
      </div>
      <div className="space-y-2 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A66C2] text-[10px] font-black text-white">
            in
          </span>
          <div className="leading-tight">
            <p className="text-[11px] font-bold text-stone-900">
              {p.authorHandle}
            </p>
            <p className="text-[9px] text-stone-500">Sponsored \u00b7 just now</p>
          </div>
        </div>
        <p className="text-[12px] leading-snug text-stone-800">{p.caption}</p>
        {p.slides && (
          <div className="grid grid-cols-5 gap-1">
            {p.slides.map((s, i) => (
              <div
                key={i}
                className="flex aspect-[4/5] items-end rounded-md border border-[#0A66C2]/30 bg-gradient-to-br from-[#0A66C2]/8 via-white to-[#0A66C2]/15 p-1"
              >
                <p className="line-clamp-3 text-[8px] font-semibold text-stone-700">
                  {s}
                </p>
              </div>
            ))}
          </div>
        )}
        <p className="text-[10px] font-semibold text-[#0A66C2]">
          {p.hashtags.join(" ")}
        </p>
        <p className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-800">
          {p.anchor}
        </p>
      </div>
    </div>
  );
}

function WeChatCard({
  p,
}: {
  p: Extract<ChannelPreviewType, { channel: "wechat" }>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#07C160]/30 bg-white shadow-sm">
      <div
        className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white"
        style={{ backgroundColor: "#07C160" }}
      >
        <span>\u5fae\u4fe1 WeChat OA \u00b7 push</span>
        <span className="opacity-90">{p.audienceLine}</span>
      </div>
      <div
        className="h-16 w-full"
        style={{
          background: `linear-gradient(135deg, ${p.cover}, ${p.cover}88)`,
        }}
      />
      <div className="space-y-1.5 px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">
          {p.oaName}
        </p>
        <h4 className="text-[13px] font-black leading-tight text-stone-900">
          {p.headline}
        </h4>
        <p className="text-[11px] leading-snug text-stone-600">{p.digest}</p>
        <div className="flex items-center justify-between border-t border-stone-200 pt-1.5 text-[9px] text-stone-500">
          <span>\u00b7\u00b7\u00b7</span>
          <span>\u9605\u8bfb \u00b7 \u8f6c\u53d1 \u00b7 \u70b9\u8d5e</span>
        </div>
      </div>
    </div>
  );
}

function WhatsAppCard({
  p,
}: {
  p: Extract<ChannelPreviewType, { channel: "whatsapp" }>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#25D366]/30 bg-[#ECE5DD] shadow-sm">
      <div className="flex items-center justify-between bg-[#075E54] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white">
        <span className="flex items-center gap-1.5">
          <Smartphone size={10} />
          WhatsApp Business \u00b7 broadcast
        </span>
        <span className="opacity-80">{p.audienceLine}</span>
      </div>
      <div className="space-y-2 px-3 py-3">
        <p className="text-[10px] font-semibold text-stone-700">{p.senderName}</p>
        <div className="max-w-[80%] rounded-lg rounded-tl-none bg-[#DCF8C6] p-2 shadow-sm">
          <p className="text-[12px] leading-snug text-stone-900">{p.bubbleText}</p>
          {p.attachmentLabel && (
            <p className="mt-1 inline-flex items-center gap-1 rounded bg-white/70 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
              <Paperclip size={9} />
              {p.attachmentLabel}
            </p>
          )}
          <p className="mt-1 text-right text-[8px] text-stone-500">
            \u2713\u2713 just now
          </p>
        </div>
      </div>
    </div>
  );
}

function EmailCard({
  p,
}: {
  p: Extract<ChannelPreviewType, { channel: "email" }>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-indigo-200 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-indigo-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white">
        <span className="flex items-center gap-1.5">
          <Mail size={10} /> Email \u00b7 blast
        </span>
        <span className="opacity-90">{p.audienceLine}</span>
      </div>
      <div className="space-y-1 px-3 py-2.5">
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] font-bold text-stone-900">{p.fromName}</p>
          <p className="text-[9px] text-stone-500">just now</p>
        </div>
        <p className="text-[10px] text-stone-500">{p.fromAddress}</p>
        <h4 className="text-[12px] font-black text-stone-900">{p.subject}</h4>
        <p className="text-[10px] italic text-stone-500">{p.preheader}</p>
        <div className="border-t border-stone-200 pt-1.5">
          {p.bodyHtmlLikeLines.map((line, i) => (
            <p
              key={i}
              className="mt-1 text-[11px] leading-snug text-stone-700"
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function TradeMagCard({
  p,
}: {
  p: Extract<ChannelPreviewType, { channel: "trade-mag" }>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-purple-200 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-purple-700 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white">
        <span className="flex items-center gap-1.5">
          <Newspaper size={10} /> Trade-mag submission
        </span>
        <span className="opacity-90">{p.audienceLine}</span>
      </div>
      <div className="space-y-1.5 px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-purple-700">
          {p.publication}
        </p>
        <p className="text-[11px] font-semibold text-stone-700">{p.section}</p>
        <p className="text-[11px] text-stone-700">
          <span className="font-semibold">Desk:</span> {p.desk}
        </p>
        <p className="text-[11px] leading-snug text-stone-700">{p.abstract}</p>
        <p className="inline-flex items-center gap-1 rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-semibold text-purple-800">
          <Send size={9} /> Submitted \u2014 awaiting editorial review
        </p>
      </div>
    </div>
  );
}

/**
 * Compact preview-channel-icon used in lists.
 */
export function ChannelIcon({ channel }: { channel: ChannelPreviewType["channel"] }) {
  switch (channel) {
    case "linkedin":
      return <Send size={12} />;
    case "wechat":
      return <MessageCircle size={12} />;
    case "whatsapp":
      return <Smartphone size={12} />;
    case "email":
      return <Mail size={12} />;
    case "trade-mag":
      return <Newspaper size={12} />;
  }
}
