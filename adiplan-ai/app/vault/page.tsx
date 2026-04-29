"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Beaker,
  BookOpen,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileText,
  Library,
  Quote,
  Search,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import {
  searchVault,
  seededVault,
  vaultRegions,
  VAULT_KIND_LABEL,
  VAULT_KIND_TONE,
  type VaultEntry,
  type VaultKind,
  type VaultSpecies,
} from "@/lib/vault";
import { formatCitation } from "@/lib/citation-checker";
import { toast } from "sonner";
import { useAdiPlanStore } from "@/lib/store";
import { TenantSwitcher } from "@/components/TenantSwitcher";
import { getTenant } from "@/lib/tenant";

const KIND_ICON: Record<VaultKind, React.ComponentType<{ size?: number }>> = {
  trial: Beaker,
  field: BookOpen,
  regulatory: ShieldCheck,
  publication: FileText,
  quote: Quote,
  spec: Library,
};

export default function VaultPage() {
  const [text, setText] = useState("");
  const [species, setSpecies] = useState<VaultSpecies | "all">("all");
  const [region, setRegion] = useState<string | "all">("all");
  const [kind, setKind] = useState<VaultKind | "all">("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selected, setSelected] = useState<VaultEntry | null>(null);

  const activeTenantId = useAdiPlanStore((s) => s.activeTenantId);
  const tenant = getTenant(activeTenantId);

  const regions = useMemo(() => vaultRegions(), []);
  const hits = useMemo(
    () =>
      searchVault({
        text,
        species,
        region,
        kind,
        verifiedOnly,
        tenantId: activeTenantId,
        limit: 24,
      }),
    [text, species, region, kind, verifiedOnly, activeTenantId]
  );

  const stats = useMemo(() => {
    const scoped = seededVault.filter(
      (e) => (e.tenantId ?? "adisseo") === activeTenantId
    );
    const byKind: Partial<Record<VaultKind, number>> = {};
    for (const e of scoped) byKind[e.kind] = (byKind[e.kind] ?? 0) + 1;
    const verified = scoped.filter((e) => e.verified).length;
    return { total: scoped.length, verified, byKind };
  }, [activeTenantId]);

  function copyCitation(entry: VaultEntry) {
    const c = formatCitation(entry);
    navigator.clipboard.writeText(c);
    toast.success("Citation copied", { description: c });
  }

  return (
    <main className="min-h-screen bg-adisseo-bg">
      <header className="border-b border-adisseo-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <nav className="flex items-center gap-4 text-xs">
            <Link href="/" className="flex items-center gap-1 text-adisseo-muted hover:text-adisseo-crimson">
              <ArrowLeft size={11} /> Home
            </Link>
            <Link href="/trust-layer" className="text-adisseo-muted hover:text-adisseo-crimson">
              Trust layer
            </Link>
            <Link href="/research-deep" className="text-adisseo-muted hover:text-adisseo-crimson">
              Deep research
            </Link>
            <Link href="/digest" className="text-adisseo-muted hover:text-adisseo-crimson">
              Daily digest
            </Link>
            <Link href="/distribution" className="text-adisseo-muted hover:text-adisseo-crimson">
              Distribution
            </Link>
            <Link href="/tenants" className="text-adisseo-muted hover:text-adisseo-crimson">
              Tenants
            </Link>
            <TenantSwitcher compact />
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-adisseo-crimson text-white">
            <Library size={16} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
              Phase 2 · Research depth
            </p>
            <h1 className="text-2xl font-bold text-adisseo-ink-strong">
              {tenant.name} Vault
            </h1>
            <p className="text-sm text-adisseo-muted">
              The customer knowledge base every studio anchors against.
              Trial protocols, field observations, regulatory references,
              integrator quotes, peer-reviewed papers, product specs.
              <span
                className="ml-2 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
                style={{ backgroundColor: tenant.accent }}
              >
                Tenant scope
              </span>
            </p>
          </div>
        </div>

        {/* STATS */}
        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          <Stat label="Entries" n={stats.total} tone="crimson" />
          <Stat label="Verified" n={stats.verified} tone="emerald" />
          <Stat label="Trials" n={stats.byKind.trial ?? 0} />
          <Stat label="Publications" n={stats.byKind.publication ?? 0} />
          <Stat label="Regulatory" n={stats.byKind.regulatory ?? 0} />
          <Stat label="Quotes" n={stats.byKind.quote ?? 0} />
          <Stat label="Specs" n={stats.byKind.spec ?? 0} />
        </section>

        {/* SEARCH BAR */}
        <section className="mb-6 rounded-2xl border border-adisseo-line bg-white p-4">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-adisseo-muted" />
            <input
              type="text"
              value={text}
              placeholder="Search across titles, summaries, metrics, tags…  e.g. 'AGP-free FCR' or 'mycotoxin Indonesia'"
              onChange={(e) => setText(e.target.value)}
              className="flex-1 bg-transparent text-sm text-adisseo-ink-strong placeholder:text-adisseo-muted focus:outline-none"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-adisseo-muted">
            <Pick
              label="Species"
              value={species}
              options={[
                { id: "all", label: "All" },
                { id: "aqua", label: "Aqua" },
                { id: "poultry", label: "Poultry" },
                { id: "ruminants", label: "Ruminants" },
                { id: "swine", label: "Swine" },
                { id: "cross", label: "Cross" },
              ]}
              onChange={(v) => setSpecies(v as VaultSpecies | "all")}
            />
            <Pick
              label="Region"
              value={region}
              options={[
                { id: "all", label: "All" },
                ...regions.map((r) => ({ id: r, label: r })),
              ]}
              onChange={(v) => setRegion(v)}
            />
            <Pick
              label="Kind"
              value={kind}
              options={[
                { id: "all", label: "All" },
                ...(Object.keys(VAULT_KIND_LABEL) as VaultKind[]).map((k) => ({
                  id: k,
                  label: VAULT_KIND_LABEL[k],
                })),
              ]}
              onChange={(v) => setKind(v as VaultKind | "all")}
            />
            <label className="flex items-center gap-1 normal-case tracking-normal">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
              />
              <span className="text-adisseo-ink-strong">Verified only</span>
            </label>
            <span className="ml-auto text-adisseo-muted">
              {hits.length} of {seededVault.length} entries
            </span>
          </div>
        </section>

        {/* RESULTS + DRILL-DOWN */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {hits.length === 0 && (
              <p className="rounded-2xl border border-adisseo-line bg-white p-6 text-center text-sm text-adisseo-muted">
                No entries match. Loosen the filters or change the search text.
              </p>
            )}
            {hits.map(({ entry, score, matched }) => {
              const Icon = KIND_ICON[entry.kind];
              const tone = VAULT_KIND_TONE[entry.kind];
              const active = selected?.id === entry.id;
              return (
                <button
                  key={entry.id}
                  onClick={() => setSelected(entry)}
                  className={`block w-full rounded-xl border p-4 text-left transition ${
                    active
                      ? "border-adisseo-crimson bg-white shadow"
                      : "border-adisseo-line bg-white hover:border-adisseo-crimson"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone.bg} ${tone.text}`}
                    >
                      <Icon size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest ${tone.text} ${tone.border}`}
                        >
                          {VAULT_KIND_LABEL[entry.kind]}
                        </span>
                        {entry.verified && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-emerald-700">
                            <CheckCircle2 size={9} /> verified
                          </span>
                        )}
                        <span className="ml-auto text-[10px] text-adisseo-muted">
                          {entry.date} · score {Math.round(score * 100)}
                        </span>
                      </div>
                      <p className="mt-1 font-semibold text-adisseo-ink-strong">
                        {entry.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-adisseo-ink">
                        {entry.summary}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {entry.species.map((sp) => (
                          <span
                            key={sp}
                            className="rounded-full bg-adisseo-bg px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-adisseo-ink-strong"
                          >
                            {sp}
                          </span>
                        ))}
                        {entry.regions.map((r) => (
                          <span
                            key={r}
                            className="rounded-full bg-adisseo-bg px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-adisseo-ink-strong"
                          >
                            {r}
                          </span>
                        ))}
                        {matched.slice(0, 3).map((m, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-0.5 rounded-full bg-adisseo-cyan/10 px-2 py-0.5 text-[9px] font-semibold text-adisseo-cyan"
                          >
                            <Tag size={8} /> {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* DRILL-DOWN */}
          <aside className="lg:sticky lg:top-6 lg:h-fit">
            {selected ? (
              <Drilldown entry={selected} onCopy={() => copyCitation(selected)} />
            ) : (
              <div className="rounded-2xl border border-dashed border-adisseo-line bg-white p-6 text-center text-xs text-adisseo-muted">
                Select an entry to see metrics, citation snippet, and the canonical Vault ID.
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}

function Drilldown({ entry, onCopy }: { entry: VaultEntry; onCopy: () => void }) {
  const Icon = KIND_ICON[entry.kind];
  const tone = VAULT_KIND_TONE[entry.kind];
  const isInternal = entry.sourceUrl.startsWith("internal://");
  const citation = formatCitation(entry);
  return (
    <div className="rounded-2xl border border-adisseo-line bg-white p-5">
      <div className="flex items-start gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone.bg} ${tone.text}`}>
          <Icon size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-[10px] font-semibold uppercase tracking-widest ${tone.text}`}>
            {VAULT_KIND_LABEL[entry.kind]}
          </p>
          <p className="font-bold text-adisseo-ink-strong">{entry.title}</p>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-adisseo-ink">{entry.summary}</p>

      {entry.attribution && (
        <p className="mt-3 rounded-md bg-adisseo-bg px-3 py-2 text-[11px] italic text-adisseo-ink">
          — {entry.attribution}
        </p>
      )}

      {entry.metrics && entry.metrics.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
            Anchored metrics
          </p>
          <ul className="mt-2 space-y-1">
            {entry.metrics.map((m, i) => (
              <li
                key={i}
                className="flex items-baseline justify-between rounded-md border border-adisseo-line px-3 py-1.5 text-xs"
              >
                <span className="text-adisseo-muted">{m.label}</span>
                <span className="font-mono font-bold text-adisseo-ink-strong">
                  {m.value}
                  {m.unit ? ` ${m.unit}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 rounded-md border border-adisseo-line bg-adisseo-bg px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
          Canonical citation
        </p>
        <p className="mt-1 font-mono text-[11px] leading-relaxed text-adisseo-ink-strong">
          {citation}
        </p>
        <button
          onClick={onCopy}
          className="mt-2 inline-flex items-center gap-1 rounded-md border border-adisseo-line bg-white px-2 py-1 text-[10px] font-semibold text-adisseo-ink-strong hover:border-adisseo-crimson"
        >
          <Copy size={10} /> Copy citation
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
        <KV k="Vault ID" v={entry.id} mono />
        <KV k="Date" v={entry.date} />
        <KV k="Regions" v={entry.regions.join(", ")} />
        <KV k="Species" v={entry.species.join(", ")} />
        {entry.embargoUntil && <KV k="Embargo" v={entry.embargoUntil} tone="rose" />}
      </div>

      <div className="mt-3 text-[10px]">
        <p className="text-adisseo-muted">Source</p>
        {isInternal ? (
          <p className="mt-0.5 font-mono text-adisseo-ink-strong">{entry.sourceUrl}</p>
        ) : (
          <a
            href={entry.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 font-mono text-adisseo-cyan hover:underline"
          >
            {entry.sourceUrl} <ExternalLink size={9} />
          </a>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {entry.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-adisseo-bg px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-adisseo-muted"
          >
            #{t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  n,
  tone,
}: {
  label: string;
  n: number;
  tone?: "crimson" | "emerald";
}) {
  const wrap =
    tone === "crimson"
      ? "border-adisseo-crimson bg-adisseo-crimson/5"
      : tone === "emerald"
        ? "border-emerald-200 bg-emerald-50"
        : "border-adisseo-line bg-white";
  const numTone =
    tone === "crimson"
      ? "text-adisseo-crimson"
      : tone === "emerald"
        ? "text-emerald-700"
        : "text-adisseo-ink-strong";
  return (
    <div className={`rounded-xl border p-3 text-center ${wrap}`}>
      <p className={`font-serif text-2xl font-bold ${numTone}`}>{n}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-widest text-adisseo-muted">
        {label}
      </p>
    </div>
  );
}

function Pick<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex items-center gap-1 normal-case tracking-normal">
      <span className="text-adisseo-muted">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-md border border-adisseo-line bg-white px-2 py-1 text-[11px] font-semibold text-adisseo-ink-strong"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function KV({
  k,
  v,
  mono,
  tone,
}: {
  k: string;
  v: string;
  mono?: boolean;
  tone?: "rose";
}) {
  const valTone = tone === "rose" ? "text-rose-700" : "text-adisseo-ink-strong";
  return (
    <div className="rounded-md border border-adisseo-line p-2">
      <p className="text-adisseo-muted">{k}</p>
      <p className={`mt-0.5 ${valTone} ${mono ? "font-mono" : "font-semibold"}`}>{v}</p>
    </div>
  );
}
