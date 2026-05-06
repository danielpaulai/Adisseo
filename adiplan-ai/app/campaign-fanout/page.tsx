"use client";

export const dynamic = "force-dynamic";

/**
 * TFIP plan — Phase D.
 *
 * Campaign-anchored fan-out. Locks the campaign to "Turning Feed Into Profit"
 * and fans the campaign across:
 *   - 3 stakeholders (Nutritionist, Veterinarian, Purchaser)
 *   - 2 channels (email, infographic)
 * = a 3 × 2 = 6-variant grid.
 *
 * Each card opens in /studio/poultry with the matching campaign + audience
 * pre-filled via setStudioPrefill — the studio then composes the deliverable
 * from poultryStakeholderLadders + poultryCsfValueProps.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bird,
  CheckCircle2,
  FileText,
  Layers as LayersIcon,
  Mail,
  Newspaper,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAdiPlanStore } from "@/lib/store";
import {
  TFIP_CAMPAIGN,
  TFIP_PRIMARY_METRICS,
  TFIP_VAULT_ENTRIES,
} from "@/lib/poultry-tfip-campaign";
import {
  poultryStakeholderLadders,
  poultryWorkshopCSFs,
  type PoultryStakeholderId,
} from "@/lib/poultry-workshop";
import {
  POULTRY_CHANNELS,
  type PoultryChannel,
} from "@/lib/poultry-pack";

const STAKEHOLDER_AUDIENCE_ID: Record<PoultryStakeholderId, string> = {
  nutritionist: "audience-nutritionist",
  vet: "audience-vet",
  purchaser: "audience-purchaser",
};

const CHANNEL_LABEL: Record<PoultryChannel, string> = {
  email: "Email",
  infographic: "Infographic (1-slide)",
};

const CHANNEL_DESC: Record<PoultryChannel, string> = {
  email:
    "Stakeholder-tuned email — subject, intro, body, metrics table all anchored on the workshop ladder.",
  infographic:
    "Single-slide infographic — Hérubel slot blueprint, big-stat hero, one CSF, one CBI, one CTA.",
};

const STAKEHOLDER_PALETTE: Record<PoultryStakeholderId, { accent: string; tint: string }> = {
  nutritionist: { accent: "#A70A2D", tint: "#FCEAEE" },
  vet: { accent: "#047857", tint: "#E5F5EC" },
  purchaser: { accent: "#1E3A8A", tint: "#E5ECFB" },
};

interface FanoutCard {
  id: string;
  stakeholderId: PoultryStakeholderId;
  channel: PoultryChannel;
  primaryCsfLabel: string;
  primaryCsfId: string;
  primaryCbi: string;
  valueProp: string;
  hook: string;
  audienceId: string;
}

export default function CampaignFanoutPage() {
  const setStudioPrefill = useAdiPlanStore((s) => s.setStudioPrefill);

  const [selectedStakeholders, setSelectedStakeholders] = useState<PoultryStakeholderId[]>(
    () => poultryStakeholderLadders.map((l) => l.id),
  );
  const [selectedChannels, setSelectedChannels] = useState<PoultryChannel[]>(
    () => [...POULTRY_CHANNELS],
  );
  const [generated, setGenerated] = useState<FanoutCard[] | null>(null);

  const toggleStakeholder = (id: PoultryStakeholderId) => {
    setSelectedStakeholders((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };
  const toggleChannel = (c: PoultryChannel) => {
    setSelectedChannels((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };

  const generate = () => {
    const cards: FanoutCard[] = [];
    for (const sId of selectedStakeholders) {
      const ladder = poultryStakeholderLadders.find((l) => l.id === sId);
      if (!ladder) continue;
      const primaryCsfId = ladder.csfIds[0];
      const csf = poultryWorkshopCSFs.find((c) => c.id === primaryCsfId);
      for (const ch of selectedChannels) {
        cards.push({
          id: `${sId}-${ch}`,
          stakeholderId: sId,
          channel: ch,
          primaryCsfId,
          primaryCsfLabel: csf?.label ?? primaryCsfId,
          primaryCbi: ladder.cbis[0],
          valueProp: ch === "email" ? ladder.emailHook : ladder.infographicTitle,
          hook: ladder.personalValue,
          audienceId: STAKEHOLDER_AUDIENCE_ID[sId],
        });
      }
    }
    setGenerated(cards);
  };

  const handPrefillToStudio = (card: FanoutCard) => {
    setStudioPrefill({
      articleTitle: `${TFIP_CAMPAIGN.name} · ${card.stakeholderId}`,
      competitor: "Internal · Adisseo APAC TFIP campaign",
      publishedAt: new Date().toISOString().slice(0, 10),
      poultryCampaignId: TFIP_CAMPAIGN.id,
      poultryAudienceId: card.audienceId,
    });
  };

  const variantCount = useMemo(
    () => selectedStakeholders.length * selectedChannels.length,
    [selectedStakeholders, selectedChannels],
  );

  return (
    <main className="min-h-screen bg-adisseo-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-adisseo-line bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Logo size="md" />
          <div className="h-6 w-px bg-adisseo-line" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
              TFIP campaign · fan-out
            </p>
            <h1 className="font-display text-lg font-semibold text-adisseo-ink-strong sm:text-xl">
              One campaign × {variantCount} stakeholder-tuned variants
            </h1>
          </div>
        </div>
        <nav className="flex items-center gap-2 text-xs text-adisseo-muted">
          <Link
            href="/"
            className="flex items-center gap-1 rounded-md border border-adisseo-line px-3 py-2 text-xs font-medium text-adisseo-ink hover:border-adisseo-crimson hover:text-adisseo-crimson"
          >
            <ArrowLeft size={12} /> Home
          </Link>
          <Link
            href="/personas-matrix?view=poultry"
            className="flex items-center gap-1 rounded-md border border-adisseo-line px-3 py-2 text-xs font-medium text-adisseo-ink hover:border-adisseo-crimson hover:text-adisseo-crimson"
          >
            <Users size={12} /> Poultry persona matrix
          </Link>
          <Link
            href="/poultry-workshop"
            className="flex items-center gap-1 rounded-md border border-adisseo-line px-3 py-2 text-xs font-medium text-adisseo-ink hover:border-adisseo-crimson hover:text-adisseo-crimson"
          >
            <Bird size={12} /> Workshop reference
          </Link>
          <Link
            href="/studio/poultry"
            className="flex items-center gap-1 rounded-md bg-adisseo-crimson px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
          >
            <Sparkles size={12} /> Open poultry studio
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        {/* Campaign banner */}
        <div className="mb-6 rounded-2xl border border-adisseo-line/90 bg-gradient-to-br from-adisseo-warmth/40 to-white p-5 shadow-adi-card">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
            <Target size={11} /> Anchored on TFIP corpus · {TFIP_VAULT_ENTRIES.length} vault entries
          </div>
          <h2 className="font-display mt-2 text-2xl font-semibold leading-tight text-adisseo-ink-strong">
            {TFIP_CAMPAIGN.name}
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-adisseo-muted">
            Adisseo APAC&apos;s flagship poultry campaign. Three pillars — <strong>Reveal · Formulate · Capture</strong>.
            The same backbone fans into stakeholder-tuned emails and infographics that respect the
            workshop ladder for each persona.
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {TFIP_PRIMARY_METRICS.slice(0, 3).map((m) => (
              <div
                key={m.label}
                className="rounded-lg border border-adisseo-line/90 bg-white px-3 py-2 text-[11px] shadow-adi-card"
              >
                <p className="font-semibold uppercase tracking-widest text-adisseo-muted">
                  {m.label}
                </p>
                <p className="mt-0.5 text-base font-semibold text-adisseo-ink-strong">
                  {m.value}
                </p>
                <p className="text-[10px] text-adisseo-muted">{m.source}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1 — campaign locked */}
        <Step
          n={1}
          title="Campaign"
          subtitle="Locked to the TFIP corpus for the May-7 demo."
        >
          <div className="rounded-lg border border-adisseo-crimson/30 bg-adisseo-warmth/40 p-3">
            <p className="text-sm font-semibold text-adisseo-ink-strong">
              {TFIP_CAMPAIGN.name}
            </p>
            <p className="mt-1 text-xs text-adisseo-muted">
              {TFIP_CAMPAIGN.taglines.join(" · ")}
            </p>
          </div>
        </Step>

        {/* Step 2 — pick stakeholders */}
        <Step
          n={2}
          title="Stakeholders"
          subtitle="Pick the ladder rungs from poster 6. All three by default."
        >
          <div className="grid gap-2 md:grid-cols-3">
            {poultryStakeholderLadders.map((s) => {
              const active = selectedStakeholders.includes(s.id);
              const palette = STAKEHOLDER_PALETTE[s.id];
              return (
                <button
                  key={s.id}
                  onClick={() => toggleStakeholder(s.id)}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-2 shadow-adi-card"
                      : "border border-adisseo-line/90 bg-white shadow-adi-card"
                  }`}
                  style={{
                    borderColor: active ? palette.accent : undefined,
                    background: active ? palette.tint : undefined,
                  }}
                >
                  <div className="flex w-full items-center justify-between">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: palette.accent }}
                    >
                      {s.fullName}
                    </span>
                    {active && (
                      <CheckCircle2 size={14} style={{ color: palette.accent }} />
                    )}
                  </div>
                  <p className="text-xs leading-snug text-adisseo-ink-strong">
                    {s.personalValue}
                  </p>
                  <p className="text-[10px] text-adisseo-muted">
                    Top CBI: {s.cbis[0]}
                  </p>
                </button>
              );
            })}
          </div>
        </Step>

        {/* Step 3 — pick channels */}
        <Step
          n={3}
          title="Channels"
          subtitle="Each stakeholder gets one variant per channel selected."
        >
          <div className="grid gap-2 md:grid-cols-2">
            {POULTRY_CHANNELS.map((c) => {
              const active = selectedChannels.includes(c);
              const Icon = c === "email" ? Mail : FileText;
              return (
                <button
                  key={c}
                  onClick={() => toggleChannel(c)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-2 border-adisseo-crimson bg-adisseo-warmth/40 shadow-adi-card"
                      : "border border-adisseo-line/90 bg-white shadow-adi-card"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      active
                        ? "bg-adisseo-crimson text-white"
                        : "bg-adisseo-bg text-adisseo-muted"
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-adisseo-ink-strong">
                      {CHANNEL_LABEL[c]}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-adisseo-muted">
                      {CHANNEL_DESC[c]}
                    </p>
                  </div>
                  {active && (
                    <CheckCircle2
                      size={14}
                      className="ml-auto text-adisseo-crimson"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </Step>

        {/* Step 4 — generate */}
        <Step
          n={4}
          title="Generate"
          subtitle={`Produces ${variantCount} variant${variantCount === 1 ? "" : "s"} (${selectedStakeholders.length} × ${selectedChannels.length}).`}
        >
          <button
            onClick={generate}
            disabled={variantCount === 0}
            className="flex items-center gap-2 rounded-xl bg-adisseo-crimson px-5 py-3 text-sm font-semibold text-white shadow-adi-card transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles size={14} />
            Fan TFIP into {variantCount} variant{variantCount === 1 ? "" : "s"}
            <ArrowRight size={14} />
          </button>
        </Step>

        {/* Output grid */}
        {generated && generated.length > 0 && (
          <section className="mt-10">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              <LayersIcon size={11} /> Output grid · {generated.length} variants
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {generated.map((card) => {
                const palette = STAKEHOLDER_PALETTE[card.stakeholderId];
                const Icon = card.channel === "email" ? Mail : FileText;
                const ladder = poultryStakeholderLadders.find(
                  (l) => l.id === card.stakeholderId,
                )!;
                return (
                  <article
                    key={card.id}
                    className="flex flex-col rounded-2xl border bg-white p-4 shadow-adi-card transition hover:shadow-adi-card-hover"
                    style={{ borderColor: palette.accent + "40" }}
                  >
                    <header className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest"
                          style={{ background: palette.tint, color: palette.accent }}
                        >
                          {ladder.fullName}
                        </span>
                        <h3 className="mt-1.5 text-sm font-semibold leading-snug text-adisseo-ink-strong">
                          {card.valueProp}
                        </h3>
                      </div>
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: palette.accent, color: "#fff" }}
                      >
                        <Icon size={13} />
                      </span>
                    </header>

                    <dl className="mt-3 space-y-1.5 text-[11px] leading-snug">
                      <DefRow label="CSF">{card.primaryCsfLabel}</DefRow>
                      <DefRow label="CBI">{card.primaryCbi}</DefRow>
                      <DefRow label="Voice">
                        <span className="line-clamp-2 text-adisseo-ink">
                          {ladder.voiceCue}
                        </span>
                      </DefRow>
                    </dl>

                    <Link
                      href="/studio/poultry"
                      onClick={() => handPrefillToStudio(card)}
                      className="mt-4 flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition"
                      style={{ background: palette.accent, color: "#fff" }}
                    >
                      <span>
                        Open in poultry studio (
                        {card.channel === "email" ? "email" : "infographic"})
                      </span>
                      <ArrowRight size={12} />
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="adi-surface mt-10 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
            How this works
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-adisseo-ink">
            <li>
              <strong>1.</strong> Stakeholder is pulled from{" "}
              <code className="text-adisseo-crimson">poultryStakeholderLadders</code>{" "}
              (poster 6).
            </li>
            <li>
              <strong>2.</strong> Top CSF and Top CBI come from each ladder rung
              verbatim — no LLM rewrite.
            </li>
            <li>
              <strong>3.</strong> Adisseo&apos;s value-prop one-liner per CSF
              comes from{" "}
              <code className="text-adisseo-crimson">poultryCsfValueProps</code>{" "}
              (poster 7 circles).
            </li>
            <li>
              <strong>4.</strong> Studio prefill carries{" "}
              <code className="text-adisseo-crimson">poultryCampaignId=tfip</code>{" "}
              and{" "}
              <code className="text-adisseo-crimson">poultryAudienceId=audience-*</code>{" "}
              so the poultry studio composes the deliverable from the same
              workshop data.
            </li>
            <li>
              <strong>5.</strong> Every claim cites a TFIP vault entry — the
              citation checker resolves leaflet, white-paper or SustainWay
              numbers (€16.1/MT, 27¢/ton, 5.2% CO2 cut, etc.).
            </li>
          </ul>
        </section>

        <div className="adi-surface mt-8 flex items-center justify-between p-4 text-[11px] text-adisseo-muted">
          <span className="flex items-center gap-2">
            <Newspaper size={12} /> Want a non-TFIP campaign? Use{" "}
            <Link href="/stakeholder-fanout" className="text-adisseo-crimson underline">
              /stakeholder-fanout
            </Link>{" "}
            to fan one news article across saved stakeholder maps instead.
          </span>
        </div>
      </section>
    </main>
  );
}

function Step({
  n,
  title,
  subtitle,
  children,
}: {
  n: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="adi-surface mb-5 p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-adisseo-crimson text-[11px] font-semibold text-white">
          {n}
        </span>
        <div>
          <h3 className="font-display text-sm font-semibold text-adisseo-ink-strong">{title}</h3>
          {subtitle && <p className="text-[10px] text-adisseo-muted">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function DefRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <dt className="w-10 shrink-0 text-[9px] font-semibold uppercase tracking-widest text-adisseo-muted">
        {label}
      </dt>
      <dd className="text-adisseo-ink">{children}</dd>
    </div>
  );
}
