"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  Target,
  Layers,
  Users,
  Newspaper,
  Info,
  X,
  Bird,
  Globe2,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import {
  cellIntensity,
  isDiagonalWin,
  getMatrixView,
  type PersonaId,
  type CSFId,
  type MatrixCell,
  type MatrixViewKind,
} from "@/lib/personas-matrix";
import { useAdiPlanStore } from "@/lib/store";

export const dynamic = "force-dynamic";

type SelectedKey = { p: PersonaId; c: CSFId } | null;

export default function PersonasMatrixPageWrapper() {
  return (
    <Suspense fallback={null}>
      <PersonasMatrixPage />
    </Suspense>
  );
}

function PersonasMatrixPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view") === "poultry" ? "poultry" : "generic";
  const [view, setView] = useState<MatrixViewKind>(viewParam);
  const [selected, setSelected] = useState<SelectedKey>(null);
  const setMatch = useAdiPlanStore((s) => s.setMatch);
  const setStudioPrefill = useAdiPlanStore((s) => s.setStudioPrefill);
  const setSelectedArticle = useAdiPlanStore((s) => s.setSelectedArticle);

  const matrixView = useMemo(() => getMatrixView({ kind: view }), [view]);
  const matrixPersonas = matrixView.personas;
  const matrixCSFs = matrixView.csfs;
  const cellLookup = useMemo(() => {
    const m = new Map<string, MatrixCell>();
    matrixView.cells.forEach((c) => m.set(`${c.personaId}::${c.csfId}`, c));
    return m;
  }, [matrixView.cells]);
  const getCell = (p: PersonaId, c: CSFId): MatrixCell | undefined =>
    cellLookup.get(`${p}::${c}`);

  const selectedCell = useMemo<MatrixCell | undefined>(
    () => (selected ? getCell(selected.p, selected.c) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, cellLookup]
  );

  // Reset selection when the view changes (cell ids no longer line up).
  const switchView = (next: MatrixViewKind) => {
    setView(next);
    setSelected(null);
  };

  const launchStrategicFrame = (cellData: MatrixCell) => {
    // Seed the strategic-frame composer with a synthetic match derived
    // from the matrix cell, so the user lands on a pre-filled frame even
    // though they didn't come from a news article.
    const persona = matrixView.personas.find((p) => p.id === cellData.personaId);
    const csf = matrixView.csfs.find((c) => c.id === cellData.csfId);
    if (!persona || !csf) return;

    const cbiId = csfToCbi(cellData.csfId);
    const cbiLabel = csfToCbiLabel(cellData.csfId);

    const syntheticArticleId = `matrix-${cellData.personaId}-${cellData.csfId}`;
    setSelectedArticle(syntheticArticleId);

    setMatch({
      articleId: syntheticArticleId,
      cbi: cbiLabel,
      cbiId,
      cbiRationale: `Selected from the Enterprise Personas × CSF matrix: ${persona.label} × ${csf.label}.`,
      persona: persona.label,
      personaId: cellData.personaId,
      personaRationale: persona.blurb,
      recommendedFormats: [cellData.suggestedDeliverable],
      speciesFit: ["aqua", "poultry", "ruminants", "swine"],
      matchedAt: new Date().toISOString(),
    });

    // Also clear any stale studio prefill so the next studio click is fresh.
    setStudioPrefill({
      articleTitle: `[Matrix] ${persona.label} × ${csf.label}`,
      competitor: "Internal · Enterprise Personas matrix",
      publishedAt: new Date().toISOString().slice(0, 10),
    });

    router.push("/strategic-frame");
  };

  return (
    <main className="min-h-screen bg-adisseo-bg">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-adisseo-line bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Logo size="md" />
          <div className="h-6 w-px bg-adisseo-line" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
              Enterprise Personas · CSF matrix
            </p>
            <h1 className="text-lg font-semibold text-adisseo-ink-strong">
              Where do persona priority and Adisseo&apos;s strength meet?
            </h1>
          </div>
        </div>
        <nav className="flex items-center gap-2 text-xs text-adisseo-muted">
          <div
            className="flex items-center gap-1 rounded-md border border-adisseo-line bg-white p-1"
            title="Switch between the generic APAC matrix and the Apr-30 poultry workshop overlay"
          >
            <button
              onClick={() => switchView("generic")}
              className={`flex items-center gap-1 rounded px-2.5 py-1.5 text-[11px] font-semibold transition ${
                view === "generic"
                  ? "bg-adisseo-ink-strong text-white"
                  : "text-adisseo-ink hover:text-adisseo-crimson"
              }`}
            >
              <Globe2 size={11} />
              Generic
            </button>
            <button
              onClick={() => switchView("poultry")}
              className={`flex items-center gap-1 rounded px-2.5 py-1.5 text-[11px] font-semibold transition ${
                view === "poultry"
                  ? "bg-adisseo-crimson text-white"
                  : "text-adisseo-ink hover:text-adisseo-crimson"
              }`}
            >
              <Bird size={11} />
              Poultry workshop
            </button>
          </div>
          <Link
            href="/"
            className="rounded-md border border-adisseo-line px-3 py-2 text-xs font-medium text-adisseo-ink hover:border-adisseo-crimson hover:text-adisseo-crimson"
          >
            Home
          </Link>
          <Link
            href="/cbi-ladder"
            className="flex items-center gap-1 rounded-md border border-adisseo-line px-3 py-2 text-xs font-medium text-adisseo-ink hover:border-adisseo-crimson hover:text-adisseo-crimson"
          >
            <Layers size={12} /> CBI Ladder
          </Link>
          <Link
            href="/news-bridge"
            className="flex items-center gap-1 rounded-md border border-adisseo-line px-3 py-2 text-xs font-medium text-adisseo-ink hover:border-adisseo-crimson hover:text-adisseo-crimson"
          >
            <Newspaper size={12} /> News Bridge
          </Link>
          <Link
            href="/strategic-frame"
            className="flex items-center gap-1 rounded-md bg-adisseo-crimson px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
          >
            <Sparkles size={12} /> Strategic Frame
          </Link>
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-adisseo-muted">
          The diagonal of this matrix marks the cells where a persona&apos;s
          top job-to-be-done lines up with Adisseo&apos;s strongest portfolio
          answer. Off-diagonal cells are where the answer needs more work, or
          where another supplier has the natural lead. Click any cell to see
          Adisseo&apos;s lead claim, suggested flagship, and the right first
          deliverable — then jump straight into composing a Strategic Frame.
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* === Matrix grid === */}
          <div className="overflow-x-auto rounded-2xl border border-adisseo-line bg-white p-4 shadow-sm">
            <div
              className="grid gap-1.5"
              style={{
                gridTemplateColumns: `200px repeat(${matrixCSFs.length}, minmax(110px, 1fr))`,
              }}
            >
              {/* === Header row === */}
              <div className="px-2 py-2 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                Persona ↓ · CSF →
              </div>
              {matrixCSFs.map((csf) => (
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

              {/* === Body rows === */}
              {matrixPersonas.map((persona) => (
                <Row
                  key={persona.id}
                  personaId={persona.id}
                  onSelect={setSelected}
                  selected={selected}
                  personas={matrixPersonas}
                  csfs={matrixCSFs}
                  getCell={getCell}
                />
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-adisseo-line pt-4 text-[10px] text-adisseo-muted">
              <span className="font-semibold uppercase tracking-widest text-adisseo-ink-strong">
                Legend
              </span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-adisseo-crimson" />
                Diagonal win — lead with this
              </span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-adisseo-crimson opacity-60" />
                Strong fit
              </span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-adisseo-crimson opacity-30" />
                Moderate fit
              </span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full border border-adisseo-line bg-white" />
                Not our fight
              </span>
            </div>
          </div>

          {/* === Side panel === */}
          <aside className="rounded-2xl border border-adisseo-line bg-white p-5 shadow-sm">
            {!selectedCell ? (
              <div className="flex h-full flex-col items-start gap-3 text-sm text-adisseo-muted">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-adisseo-bg text-adisseo-crimson">
                  <Info size={16} />
                </span>
                <p className="font-semibold text-adisseo-ink-strong">
                  Click any cell to inspect Adisseo&apos;s lead claim.
                </p>
                <p>
                  The brightest cells (especially the bordered diagonal cells)
                  are where Adisseo should always lead. The dim cells are
                  where the answer is either off-strategy or off-portfolio.
                </p>
                <div className="mt-2 grid grid-cols-1 gap-2 text-[11px] text-adisseo-muted">
                  {matrixPersonas.map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: p.accent }}
                      />
                      <span className="font-medium text-adisseo-ink-strong">
                        {p.label}
                      </span>
                      <span>· {p.blurb}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <CellDetail
                cell={selectedCell}
                onClose={() => setSelected(null)}
                onCompose={() => launchStrategicFrame(selectedCell)}
                personas={matrixPersonas}
                csfs={matrixCSFs}
              />
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function Row({
  personaId,
  onSelect,
  selected,
  personas,
  csfs,
  getCell,
}: {
  personaId: PersonaId;
  onSelect: (key: SelectedKey) => void;
  selected: SelectedKey;
  personas: ReturnType<typeof getMatrixView>["personas"];
  csfs: ReturnType<typeof getMatrixView>["csfs"];
  getCell: (p: PersonaId, c: CSFId) => MatrixCell | undefined;
}) {
  const persona = personas.find((p) => p.id === personaId)!;
  return (
    <>
      <div className="flex items-center gap-2 rounded-lg bg-adisseo-bg px-3 py-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: persona.accent }}
        />
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-adisseo-ink-strong">
            {persona.label}
          </p>
          <p className="truncate text-[9px] text-adisseo-muted">
            {persona.blurb}
          </p>
        </div>
      </div>
      {csfs.map((csf) => {
        const cell = getCell(personaId, csf.id);
        if (!cell) return <div key={csf.id} />;
        const isSelected =
          selected?.p === personaId && selected?.c === csf.id;
        const isWin = isDiagonalWin(cell);
        const intensity = cellIntensity(cell);
        const opacity = 0.12 + intensity * 0.78;
        return (
          <button
            key={csf.id}
            onClick={() => onSelect({ p: personaId, c: csf.id })}
            className={`relative flex h-16 flex-col items-center justify-center gap-0.5 rounded-lg border text-[10px] font-semibold transition ${
              isSelected
                ? "border-adisseo-ink-strong shadow-md ring-2 ring-adisseo-crimson"
                : isWin
                  ? "border-adisseo-crimson"
                  : "border-transparent hover:border-adisseo-crimson/40"
            }`}
            style={{
              background: `rgba(167, 10, 45, ${opacity})`,
              color: opacity > 0.55 ? "#fff" : "#0E1216",
            }}
            title={`${persona.label} × ${csf.label}\nPriority ${cell.personaPriority}/5 · Adisseo strength ${cell.adisseoStrength}/5`}
          >
            <span className="text-[14px] leading-none">
              {cell.personaPriority}×{cell.adisseoStrength}
            </span>
            <span
              className={`text-[9px] font-normal ${
                opacity > 0.55 ? "text-white/85" : "text-adisseo-muted"
              }`}
            >
              {isWin ? "diagonal" : ""}
            </span>
          </button>
        );
      })}
    </>
  );
}

function CellDetail({
  cell,
  onClose,
  onCompose,
  personas,
  csfs,
}: {
  cell: MatrixCell;
  onClose: () => void;
  onCompose: () => void;
  personas: ReturnType<typeof getMatrixView>["personas"];
  csfs: ReturnType<typeof getMatrixView>["csfs"];
}) {
  const persona = personas.find((p) => p.id === cell.personaId)!;
  const csf = csfs.find((c) => c.id === cell.csfId)!;
  const isWin = isDiagonalWin(cell);
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: persona.accent }}
          >
            {persona.label}
          </p>
          <h2 className="mt-1 text-base font-semibold leading-snug text-adisseo-ink-strong">
            × {csf.label}
          </h2>
          <p className="mt-1 text-xs text-adisseo-muted">{csf.blurb}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md border border-adisseo-line p-1.5 text-adisseo-muted hover:border-adisseo-crimson hover:text-adisseo-crimson"
        >
          <X size={12} />
        </button>
      </div>

      {isWin && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-adisseo-crimson px-2.5 py-1 text-[10px] font-semibold text-white">
          <Target size={10} /> Diagonal win — always lead with this
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
        <div className="rounded-lg bg-adisseo-bg p-2.5">
          <p className="font-semibold uppercase tracking-widest text-adisseo-muted">
            Persona priority
          </p>
          <p className="mt-1 text-2xl font-bold text-adisseo-ink-strong">
            {cell.personaPriority}
            <span className="text-sm text-adisseo-muted">/5</span>
          </p>
        </div>
        <div className="rounded-lg bg-adisseo-bg p-2.5">
          <p className="font-semibold uppercase tracking-widest text-adisseo-muted">
            Adisseo strength
          </p>
          <p className="mt-1 text-2xl font-bold text-adisseo-ink-strong">
            {cell.adisseoStrength}
            <span className="text-sm text-adisseo-muted">/5</span>
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-adisseo-line bg-white p-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
          Adisseo&apos;s lead answer
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-adisseo-ink-strong">
          {cell.adisseoAnswer}
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-widest text-adisseo-muted">
          Flagship
        </p>
        <p className="mt-0.5 text-xs font-semibold text-adisseo-ink-strong">
          {cell.flagship}
        </p>
        <p className="mt-2 text-[10px] uppercase tracking-widest text-adisseo-muted">
          Suggested first deliverable
        </p>
        <p className="mt-0.5 text-xs font-semibold text-adisseo-ink-strong">
          {cell.suggestedDeliverable}
        </p>
      </div>

      <button
        onClick={onCompose}
        className="mt-4 flex w-full items-center justify-between rounded-xl bg-adisseo-crimson px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        <span className="flex items-center gap-2">
          <Sparkles size={14} /> Compose strategic frame from this cell
        </span>
        <ArrowRight size={14} />
      </button>
      <p className="mt-2 text-[10px] text-adisseo-muted">
        We&apos;ll seed the Strategic Frame composer with this persona × CSF
        and the matched CBI, then auto-compose the Total Value Solution.
      </p>
    </div>
  );
}

/* ============================================================
 * CSF → CBI mapping (so cells can drive /strategic-frame)
 * ============================================================ */

function csfToCbi(csf: CSFId): string {
  switch (csf as string) {
    case "csf-margin":
    case "csf-fcr":
    case "csf-feed-cost":
    case "csf-rm-cost":
      return "cbi-feed-cost";
    case "csf-disease":
    case "csf-medication":
      return "cbi-disease-pressure";
    case "csf-regulatory":
      return "cbi-regulatory-shift";
    case "csf-carbon":
      return "cbi-sustainability";
    case "csf-knowledge":
      return "cbi-talent-knowledge";
    case "csf-uniformity":
    case "csf-diet-performance":
      return "cbi-feed-cost";
    case "csf-rm-supply":
      return "cbi-supply-continuity";
    default:
      return "cbi-feed-cost";
  }
}
function csfToCbiLabel(csf: CSFId): string {
  switch (csf as string) {
    case "csf-margin":
    case "csf-fcr":
    case "csf-feed-cost":
    case "csf-rm-cost":
      return "Feed Cost Volatility";
    case "csf-disease":
    case "csf-medication":
      return "Disease & Health-Risk Pressure";
    case "csf-regulatory":
      return "Regulatory Tightening";
    case "csf-carbon":
      return "Sustainability & Carbon Pressure";
    case "csf-knowledge":
      return "Knowledge Gap on Farm / In Sales";
    case "csf-uniformity":
      return "Flock Uniformity Loss";
    case "csf-diet-performance":
      return "Diet Performance Pressure";
    case "csf-rm-supply":
      return "Raw-material Supply Continuity";
    default:
      return "Customer Success Factor";
  }
}

// keep this for other modules that may want the helpers later
void Users;
