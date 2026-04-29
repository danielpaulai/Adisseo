"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Library, Loader2, Search, Tag } from "lucide-react";
import {
  searchVault,
  type VaultEntry,
  type VaultSpecies,
  VAULT_KIND_LABEL,
} from "@/lib/vault";
import { formatCitation } from "@/lib/citation-checker";
import { toast } from "sonner";

interface Props {
  /** Species filter for the Vault search. */
  species: VaultSpecies;
  /** Optional region filter. */
  region?: string;
  /** Initial query, e.g. the studio's current topic. */
  defaultQuery?: string;
  /**
   * Called when the user picks an entry. Receives the canonical citation
   * string and the raw entry. Studios paste the citation into their draft.
   */
  onPick?: (citation: string, entry: VaultEntry) => void;
  /** Compact variant for tight aside columns. */
  compact?: boolean;
}

/**
 * Studio-side widget for pulling a Vault entry into a deliverable.
 * Closes the "studios stop hallucinating numbers" gap from the Apr 28 call.
 */
export function AnchorInVault({
  species,
  region,
  defaultQuery = "",
  onPick,
  compact = false,
}: Props) {
  const [text, setText] = useState(defaultQuery);
  const [picked, setPicked] = useState<VaultEntry | null>(null);
  const [loading, setLoading] = useState(false);

  const hits = useMemo(() => {
    setLoading(true);
    const out = searchVault({
      text,
      species,
      region: region ?? "all",
      limit: compact ? 4 : 6,
    });
    setLoading(false);
    return out;
  }, [text, species, region, compact]);

  function pick(entry: VaultEntry) {
    setPicked(entry);
    const citation = formatCitation(entry);
    if (onPick) onPick(citation, entry);
    navigator.clipboard?.writeText(citation).catch(() => {});
    toast.success("Anchor pulled from Vault", {
      description: citation,
    });
  }

  return (
    <div className={`rounded-2xl border border-adisseo-line bg-white p-4 ${compact ? "text-xs" : "text-sm"}`}>
      <div className="flex items-baseline justify-between">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
          <Library size={11} /> Anchor in Vault
        </p>
        <Link
          href={`/vault?species=${species}`}
          className="text-[10px] text-adisseo-muted hover:text-adisseo-crimson"
        >
          Open Vault →
        </Link>
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-md border border-adisseo-line bg-adisseo-bg/40 px-2 py-1.5">
        <Search size={11} className="text-adisseo-muted" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search Vault: trial, regulation, integrator quote…"
          className="flex-1 bg-transparent text-[11px] text-adisseo-ink-strong placeholder:text-adisseo-muted focus:outline-none"
        />
        {loading && <Loader2 size={10} className="animate-spin text-adisseo-muted" />}
      </div>

      <ul className="mt-3 max-h-72 space-y-1.5 overflow-auto pr-1">
        {hits.length === 0 && (
          <li className="rounded-md border border-dashed border-adisseo-line p-3 text-center text-[11px] italic text-adisseo-muted">
            No matching Vault entries. Open WWWK to commission new research.
          </li>
        )}
        {hits.map(({ entry, score, matched }) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => pick(entry)}
              className={`block w-full rounded-md border p-2 text-left transition ${
                picked?.id === entry.id
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-adisseo-line bg-white hover:border-adisseo-crimson"
              }`}
            >
              <div className="flex items-baseline gap-2">
                <span className="rounded-full bg-adisseo-bg px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-adisseo-ink-strong">
                  {VAULT_KIND_LABEL[entry.kind]}
                </span>
                <span className="text-[10px] text-adisseo-muted">{entry.date}</span>
                <span className="ml-auto text-[10px] text-adisseo-muted">
                  match {Math.round(score * 100)}
                </span>
              </div>
              <p className="mt-1 line-clamp-1 font-semibold text-adisseo-ink-strong">
                {entry.title}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-adisseo-ink">
                {entry.summary}
              </p>
              {matched.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {matched.slice(0, 3).map((m, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-0.5 rounded-full bg-adisseo-cyan/10 px-1.5 py-0.5 text-[9px] font-semibold text-adisseo-cyan"
                    >
                      <Tag size={8} /> {m}
                    </span>
                  ))}
                </div>
              )}
            </button>
          </li>
        ))}
      </ul>

      {picked && (
        <div className="mt-3 rounded-md border border-emerald-300 bg-emerald-50 p-2 text-[11px]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700">
            Pulled (copied to clipboard)
          </p>
          <p className="mt-1 break-words font-mono text-emerald-900">
            {formatCitation(picked)}
          </p>
          <button
            onClick={() => navigator.clipboard.writeText(formatCitation(picked))}
            className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 hover:underline"
          >
            <Copy size={9} /> Copy again
          </button>
        </div>
      )}
    </div>
  );
}
