"use client";

export const dynamic = "force-dynamic";

/**
 * TFIP plan — Phase G.
 *
 * Read-only reference page mirroring the 8 Apr-30 workshop posters in HTML
 * so the global team has the workshop available during the May-7 demo.
 *
 *   Poster 1 → /engagement-tracker (workshop framework tab)
 *   Poster 2 → priority matrix heat-grid (here)
 *   Poster 3 → We-Wish-We-Knew (here)
 *   Poster 4 → six persona character cards (here)
 *   Poster 5 → 7 ranked insights (here)
 *   Poster 6 → CBI/CSF ladder per stakeholder (here)
 *   Poster 7 → CSF value-prop circles (here)
 *   Poster 8 → Plan on a Page (link to /api/render-plan-on-a-page)
 */

import Link from "next/link";
import {
  ArrowLeft,
  Bird,
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  Layers as LayersIcon,
  Lightbulb,
  Target,
  Users,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import {
  poultryEnterprisePersonas,
  poultryPriorityMatrix,
  poultryWorkshopCSFs,
  poultryStakeholderLadders,
  poultryCsfValueProps,
  poultryWWWK,
  poultryInsights,
  priorityFor,
  type PoultryPersonaId,
  type PoultryWorkshopCsfId,
  type WwwkBucket,
} from "@/lib/poultry-workshop";

const WWWK_LABEL: Record<WwwkBucket, string> = {
  market: "Market",
  customer: "Customer",
  competitor: "Competitor",
  ourCompany: "Our company",
};

const STAKEHOLDER_PALETTE: Record<string, { accent: string; tint: string }> = {
  nutritionist: { accent: "#A70A2D", tint: "#FCEAEE" },
  vet: { accent: "#047857", tint: "#E5F5EC" },
  purchaser: { accent: "#1E3A8A", tint: "#E5ECFB" },
};

export default function PoultryWorkshopPage() {
  return (
    <main className="min-h-screen bg-adisseo-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-adisseo-line bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Logo size="md" />
          <div className="h-6 w-px bg-adisseo-line" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
              Apr-30 workshop · Poultry A team
            </p>
            <h1 className="font-display text-lg font-semibold text-adisseo-ink-strong sm:text-xl">
              Reference deck — 8 posters in HTML
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
            href="/campaign-fanout"
            className="flex items-center gap-1 rounded-md border border-adisseo-line px-3 py-2 text-xs font-medium text-adisseo-ink hover:border-adisseo-crimson hover:text-adisseo-crimson"
          >
            <LayersIcon size={12} /> Campaign fan-out
          </Link>
          <Link
            href="/engagement-tracker"
            className="flex items-center gap-1 rounded-md border border-adisseo-line px-3 py-2 text-xs font-medium text-adisseo-ink hover:border-adisseo-crimson hover:text-adisseo-crimson"
          >
            <Target size={12} /> Engagement
          </Link>
          <Link
            href="/personas-matrix?view=poultry"
            className="flex items-center gap-1 rounded-md bg-adisseo-crimson px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
          >
            <Bird size={12} /> Persona matrix
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* TOC */}
        <nav className="mb-8 flex flex-wrap gap-2 text-[10px] uppercase tracking-widest">
          {[
            { id: "personas", label: "Poster 4 · Personas" },
            { id: "priority", label: "Poster 2 · Priority matrix" },
            { id: "ladders", label: "Poster 6 · CBI ladders" },
            { id: "circles", label: "Poster 7 · Value-prop circles" },
            { id: "wwwk", label: "Poster 3 · WWWK" },
            { id: "insights", label: "Poster 5 · Insights" },
            { id: "metrics", label: "Poster 1 · Metrics" },
            { id: "plan", label: "Poster 8 · Plan on a Page" },
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-md border border-adisseo-line/90 bg-white px-2.5 py-1.5 font-semibold text-adisseo-muted shadow-adi-card hover:border-adisseo-crimson hover:text-adisseo-crimson"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Poster 4 — Personas */}
        <PosterSection
          id="personas"
          n={4}
          title="Enterprise persona cards"
          subtitle="Six poultry-buyer personas. Ethical Guy is the workshop template."
          icon={Users}
        >
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {poultryEnterprisePersonas.map((p) => (
              <article
                key={p.id}
                className="adi-surface p-4"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-crimson">
                  {p.nickname}
                </p>
                <h3 className="mt-1 text-base font-semibold leading-snug text-adisseo-ink-strong">
                  {p.fullName}
                </h3>
                <blockquote className="mt-2 border-l-2 border-adisseo-crimson pl-2 text-[12px] italic text-adisseo-ink">
                  &ldquo;{p.typicalQuote}&rdquo;
                </blockquote>
                <Bullets label="Characteristics" items={p.characteristics} />
                <Bullets label="Roadblocks" items={p.roadblocks} />
                <Bullets label="Possible products" items={p.possibleProducts} />
                <Bullets label="Example customers" items={p.exampleCustomers} />
              </article>
            ))}
          </div>
        </PosterSection>

        {/* Poster 2 — Priority matrix */}
        <PosterSection
          id="priority"
          n={2}
          title="Persona × CSF priority matrix"
          subtitle="Lower workshop rank = darker shading. 1 is the persona's top job-to-be-done."
          icon={Target}
        >
          <PriorityHeatGrid />
        </PosterSection>

        {/* Poster 6 — CBI ladders */}
        <PosterSection
          id="ladders"
          n={6}
          title="CBI / CSF ladders per stakeholder"
          subtitle="Verbatim ladder rungs Ricardo dictated in the voice memo."
          icon={LayersIcon}
        >
          <div className="grid gap-3 md:grid-cols-3">
            {poultryStakeholderLadders.map((l) => {
              const palette = STAKEHOLDER_PALETTE[l.id];
              return (
                <article
                  key={l.id}
                  className="rounded-2xl border bg-white p-4 shadow-adi-card"
                  style={{ borderColor: palette.accent + "40" }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: palette.accent }}
                  >
                    {l.fullName}
                  </p>
                  <p className="mt-1 text-xs italic leading-snug text-adisseo-ink-strong">
                    {l.personalValue}
                  </p>
                  <div className="mt-3 rounded-lg p-2" style={{ background: palette.tint }}>
                    <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: palette.accent }}>
                      Customer success factors
                    </p>
                    <ul className="mt-1 space-y-0.5 text-[11px] text-adisseo-ink">
                      {l.csfIds.map((cId) => {
                        const csf = poultryWorkshopCSFs.find((c) => c.id === cId);
                        return <li key={cId}>· {csf?.label ?? cId}</li>;
                      })}
                    </ul>
                  </div>
                  <Bullets label="Critical business issues (CBIs)" items={l.cbis} />
                  <div className="mt-3 rounded-lg border border-dashed border-adisseo-line p-2 text-[10px] text-adisseo-muted">
                    <strong className="text-adisseo-ink-strong">Voice cue:</strong>{" "}
                    {l.voiceCue}
                  </div>
                </article>
              );
            })}
          </div>
        </PosterSection>

        {/* Poster 7 — Value-prop circles */}
        <PosterSection
          id="circles"
          n={7}
          title="CSF value-prop circles"
          subtitle="Per CSF: Product → Add-ons → Services → Advisory. Inner ring = closest to the bird, outer ring = closest to the boardroom."
          icon={Lightbulb}
        >
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {poultryCsfValueProps.map((vp) => {
              const csf = poultryWorkshopCSFs.find((c) => c.id === vp.csfId);
              return (
                <article
                  key={vp.csfId}
                  className="adi-surface p-4"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-crimson">
                    {csf?.shortLabel ?? vp.csfId}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold leading-snug text-adisseo-ink-strong">
                    {csf?.label ?? vp.csfId}
                  </h3>
                  <p className="mt-1 text-[11px] italic text-adisseo-muted">
                    &ldquo;{vp.oneLiner}&rdquo;
                  </p>
                  <CirclesViz vp={vp} />
                </article>
              );
            })}
          </div>
        </PosterSection>

        {/* Poster 3 — WWWK */}
        <PosterSection
          id="wwwk"
          n={3}
          title="We Wish We Knew"
          subtitle="Open research questions assigned by bucket and owner."
          icon={BookOpen}
        >
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {(["market", "customer", "competitor", "ourCompany"] as WwwkBucket[]).map(
              (bucket) => {
                const rows = poultryWWWK.filter((r) => r.bucket === bucket);
                return (
                  <div
                    key={bucket}
                    className="adi-surface p-3"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-crimson">
                      {WWWK_LABEL[bucket]}
                    </p>
                    <ul className="mt-2 space-y-2 text-[11px]">
                      {rows.map((r, idx) => (
                        <li key={idx} className="border-b border-adisseo-line/50 pb-2 last:border-0 last:pb-0">
                          <p className="leading-snug text-adisseo-ink-strong">
                            {r.question}
                          </p>
                          <p className="mt-0.5 text-[9px] uppercase tracking-wide text-adisseo-muted">
                            Owner: {r.owner} · Importance: {r.importance}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              },
            )}
          </div>
        </PosterSection>

        {/* Poster 5 — Insights */}
        <PosterSection
          id="insights"
          n={5}
          title="7 ranked insights"
          subtitle="What the workshop landed on. Each insight ends with a 'so-what' for our positioning."
          icon={Lightbulb}
        >
          <div className="grid gap-3 md:grid-cols-2">
            {poultryInsights.map((ins) => (
              <article
                key={ins.rank}
                className="adi-surface p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-adisseo-crimson text-[11px] font-bold text-white">
                    {ins.rank}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold leading-snug text-adisseo-ink-strong">
                      {ins.title}
                    </h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-adisseo-muted">
                      {ins.summary}
                    </p>
                    <p className="mt-2 rounded-md bg-adisseo-warmth/40 px-2 py-1 text-[11px] leading-snug text-adisseo-ink-strong">
                      <strong className="text-adisseo-crimson">So what:</strong>{" "}
                      {ins.soWhat}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </PosterSection>

        {/* Poster 1 — Metrics (link out) */}
        <PosterSection
          id="metrics"
          n={1}
          title="Leading + lagging metrics framework"
          subtitle="Encoded into /engagement-tracker as the 'Workshop framework' tab."
          icon={Target}
        >
          <Link
            href="/engagement-tracker"
            className="inline-flex items-center gap-2 rounded-xl bg-adisseo-crimson px-4 py-3 text-sm font-semibold text-white shadow-adi-card transition hover:opacity-90"
          >
            Open the workshop framework
            <CheckCircle2 size={14} />
          </Link>
        </PosterSection>

        {/* Poster 8 — Plan on a Page (link out) */}
        <PosterSection
          id="plan"
          n={8}
          title="Plan on a Page"
          subtitle="Single-page brand-guardrail-aligned summary."
          icon={FileText}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/api/render-plan-on-a-page"
              className="inline-flex items-center gap-2 rounded-xl bg-adisseo-ink-strong px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              <Download size={14} /> Plan-on-a-Page PDF
            </Link>
            <a
              href="/api/render-adisseo-onepager"
              className="inline-flex items-center gap-2 rounded-xl border border-adisseo-line/90 bg-white px-4 py-3 text-sm font-semibold text-adisseo-ink shadow-adi-card hover:border-adisseo-crimson"
            >
              <Download size={14} /> Decision-maker one-pager
            </a>
            <a
              href="/api/render-demo-script"
              className="inline-flex items-center gap-2 rounded-xl border border-adisseo-line/90 bg-white px-4 py-3 text-sm font-semibold text-adisseo-ink shadow-adi-card hover:border-adisseo-crimson"
            >
              <Download size={14} /> 90-second demo script
            </a>
          </div>
        </PosterSection>

        {/* Direct links to corpus assets */}
        <section className="adi-surface mt-10 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
            TFIP corpus — direct links
          </p>
          <ul className="mt-2 space-y-1 text-[12px]">
            <li>
              · <code className="text-adisseo-crimson">vendor/tfip-corpus/Final_Leaflet_poultry_FEED EFFICIENCY.pdf</code>
            </li>
            <li>
              · <code className="text-adisseo-crimson">vendor/tfip-corpus/Measure, adjust and optimize HR.pdf</code>
            </li>
            <li>
              · <code className="text-adisseo-crimson">vendor/tfip-corpus/Commercial Presentation- Turning Feed Into Profit_APAC Reg edit.pptx</code>
            </li>
            <li>
              · <code className="text-adisseo-crimson">vendor/tfip-corpus/Technical presentation_Turning Feed Into Profit.pptx</code>
            </li>
            <li>
              · <code className="text-adisseo-crimson">vendor/tfip-corpus/SustainWay_Sustainability Rovabio+Lecimax.pptx</code>
            </li>
          </ul>
          <p className="mt-2 text-[10px] text-adisseo-muted">
            Vendor folder is gitignored. Run the WeTransfer extract script if it&apos;s missing locally.
          </p>
        </section>
      </section>
    </main>
  );
}

function PosterSection({
  id,
  n,
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  id: string;
  n: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <header className="mb-3 flex items-baseline gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-adisseo-crimson text-[11px] font-bold text-white">
          <Icon size={13} />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
            Poster {n}
          </p>
          <h2 className="font-display text-xl font-semibold text-adisseo-ink-strong">{title}</h2>
          <p className="mt-0.5 text-xs text-adisseo-muted">{subtitle}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function Bullets({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="mt-2">
      <p className="text-[9px] font-bold uppercase tracking-widest text-adisseo-muted">
        {label}
      </p>
      <ul className="mt-1 space-y-0.5 text-[11px] leading-snug text-adisseo-ink">
        {items.map((item, idx) => (
          <li key={idx}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}

function PriorityHeatGrid() {
  // Lower priority number → darker shading. priority 1 = 0.95 alpha, 6 = 0.15.
  const opacityFor = (p: number) => 1 - (p - 1) * 0.16;
  return (
    <div className="adi-surface overflow-x-auto p-4">
      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns: `200px repeat(${poultryWorkshopCSFs.length}, minmax(110px, 1fr))`,
        }}
      >
        <div className="px-2 py-2 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
          Persona ↓ · CSF →
        </div>
        {poultryWorkshopCSFs.map((csf) => (
          <div
            key={csf.id}
            className="rounded-lg bg-adisseo-bg px-2 py-2 text-[11px] font-semibold text-adisseo-ink-strong"
            title={csf.blurb}
          >
            <span className="block">{csf.shortLabel}</span>
            <span className="mt-0.5 block text-[9px] font-normal leading-tight text-adisseo-muted">
              {csf.label}
            </span>
          </div>
        ))}
        {poultryEnterprisePersonas.map((p) => (
          <PriorityRow key={p.id} personaId={p.id} opacityFor={opacityFor} />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 border-t border-adisseo-line pt-3 text-[10px] text-adisseo-muted">
        <span className="font-semibold uppercase tracking-widest text-adisseo-ink-strong">
          Legend
        </span>
        {[1, 2, 3, 4, 5, 6].map((p) => (
          <span key={p} className="flex items-center gap-1">
            <span
              className="h-3 w-3 rounded"
              style={{ background: `rgba(167, 10, 45, ${1 - (p - 1) * 0.16})` }}
            />
            Priority {p}
          </span>
        ))}
      </div>
    </div>
  );
}

function PriorityRow({
  personaId,
  opacityFor,
}: {
  personaId: PoultryPersonaId;
  opacityFor: (p: number) => number;
}) {
  const persona = poultryEnterprisePersonas.find((p) => p.id === personaId)!;
  return (
    <>
      <div className="flex items-center gap-2 rounded-lg bg-adisseo-bg px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-adisseo-ink-strong">
            {persona.nickname}
          </p>
          <p className="truncate text-[9px] text-adisseo-muted">
            {persona.fullName}
          </p>
        </div>
      </div>
      {poultryWorkshopCSFs.map((csf) => {
        const priority = priorityFor(personaId, csf.id as PoultryWorkshopCsfId);
        if (priority === null) return <div key={csf.id} />;
        const op = opacityFor(priority);
        return (
          <div
            key={csf.id}
            className="flex h-14 items-center justify-center rounded-lg text-[14px] font-bold"
            style={{
              background: `rgba(167, 10, 45, ${op})`,
              color: op > 0.55 ? "#fff" : "#0E1216",
            }}
            title={`${persona.nickname} × ${csf.shortLabel}: priority ${priority}`}
          >
            {priority}
          </div>
        );
      })}
    </>
  );
}

function CirclesViz({
  vp,
}: {
  vp: (typeof poultryCsfValueProps)[number];
}) {
  // Concentric ring layout — 4 rings, inner = product, outer = advisory.
  const rings = [
    { label: "Advisory", items: vp.advisory, size: 200, color: "rgba(167,10,45,0.06)" },
    { label: "Services", items: vp.services, size: 160, color: "rgba(167,10,45,0.12)" },
    { label: "Add-ons", items: vp.addOns, size: 120, color: "rgba(167,10,45,0.22)" },
    { label: "Product", items: vp.product, size: 84, color: "rgba(167,10,45,0.36)" },
  ];

  return (
    <div className="mt-3">
      {/* SVG mini-viz */}
      <div className="relative mx-auto flex h-[210px] w-[210px] items-center justify-center">
        {rings.map((r) => (
          <span
            key={r.label}
            className="absolute rounded-full border border-adisseo-crimson/30"
            style={{
              width: r.size,
              height: r.size,
              background: r.color,
            }}
          />
        ))}
        <span className="relative z-10 text-center text-[10px] font-bold uppercase tracking-widest text-adisseo-crimson">
          Product
        </span>
      </div>
      {/* Lists */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
        {rings.reverse().map((r) => (
          <div
            key={r.label}
            className="rounded-md border border-adisseo-line bg-adisseo-bg px-2 py-1.5"
          >
            <p className="font-bold uppercase tracking-widest text-adisseo-muted">
              {r.label}
            </p>
            <ul className="mt-0.5 space-y-0.5 text-adisseo-ink">
              {r.items.map((it) => (
                <li key={it}>· {it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
