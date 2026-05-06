"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  forceSimulation,
  forceManyBody,
  forceCenter,
  forceLink,
  forceCollide,
} from "d3-force";
import Link from "next/link";
import { toast } from "sonner";
import {
  Check,
  ArrowRight,
  X,
  MapPin,
  Layers as LayersIcon,
  Filter,
  Save,
  FolderOpen,
  AlertTriangle,
} from "lucide-react";
import {
  seededStakeholders,
  seededEdges,
  personaColors,
  influenceRadius,
  trendLabel,
  edgeKindColor,
  edgeKindLabel,
  type Stakeholder,
  type StakeholderRegion,
  type StakeholderSpecies,
  type InfluenceEdgeKind,
} from "@/lib/stakeholders";
import { useAdiPlanStore } from "@/lib/store";
import { Logo } from "@/components/Logo";
import {
  SEED_SAVED_MAPS,
  checkBalance,
  type SavedStakeholderMap,
  type SavedMapScope,
} from "@/lib/saved-stakeholder-map";
import { syncSavedStakeholderMapAfterLocalSave } from "@/lib/stakeholder-map-supabase";

type StakeholderNodeData = {
  stakeholder: Stakeholder;
  selected: boolean;
  onToggle: (id: string) => void;
};

type StakeholderNodeType = Node<StakeholderNodeData, "stakeholder">;

function StakeholderNode({ data }: NodeProps<StakeholderNodeType>) {
  const { stakeholder, selected, onToggle } = data;
  const r = influenceRadius[stakeholder.influence];
  const color = personaColors[stakeholder.persona];
  const size = r * 2;
  const ringDelta =
    stakeholder.trend === "growing" ? 22 : stakeholder.trend === "shrinking" ? -16 : 0;
  const ringSize = size + ringDelta;
  const ringLabel =
    stakeholder.trend === "growing"
      ? "future +"
      : stakeholder.trend === "shrinking"
        ? "future –"
        : null;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      {stakeholder.trend !== "not-changing" && (
        <>
          <div
            className="absolute rounded-full border-2 border-dashed"
            style={{
              width: ringSize,
              height: ringSize,
              borderColor: color,
              opacity: 0.55,
            }}
          />
          {ringLabel && (
            <span
              className="absolute rounded-full bg-white px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest shadow-sm"
              style={{
                color,
                top: stakeholder.trend === "growing" ? -ringSize / 2 - 2 : -2,
                right: -8,
              }}
            >
              {ringLabel}
            </span>
          )}
        </>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(stakeholder.id);
        }}
        className="flex flex-col items-center justify-center rounded-full text-center text-white shadow-md transition hover:scale-105"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          padding: 8,
          fontSize: stakeholder.influence === "large" ? 12 : 10,
          lineHeight: 1.1,
          fontWeight: 600,
          outline: selected ? "3px solid #0F1B2D" : "none",
          outlineOffset: 3,
        }}
        title={`${stakeholder.label} · ${stakeholder.persona} · ${trendLabel[stakeholder.trend]}${stakeholder.regions ? ` · ${stakeholder.regions.join(",")}` : ""}`}
      >
        <span>{stakeholder.label}</span>
        {stakeholder.regions && stakeholder.regions.length > 0 && (
          <span className="mt-0.5 text-[8px] font-bold uppercase tracking-widest opacity-80">
            {stakeholder.regions.length > 4
              ? "APAC"
              : stakeholder.regions.join("·")}
          </span>
        )}
      </button>
      {selected && (
        <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-adisseo-ink text-white shadow ring-2 ring-white">
          <Check size={14} />
        </span>
      )}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

const nodeTypes = { stakeholder: StakeholderNode };

function computeLayout() {
  const sim = seededStakeholders.map((s) => ({
    id: s.id,
    r: influenceRadius[s.influence],
    x: Math.random() * 800 - 400,
    y: Math.random() * 600 - 300,
  }));
  type SimNode = (typeof sim)[number];
  const links = seededEdges.map((e) => ({ source: e.source, target: e.target }));

  forceSimulation<SimNode>(sim)
    .force("charge", forceManyBody<SimNode>().strength(-420))
    .force("center", forceCenter(0, 0))
    .force(
      "link",
      forceLink<SimNode, { source: string; target: string }>(links)
        .id((d) => d.id)
        .distance(180)
        .strength(0.35)
    )
    .force("collide", forceCollide<SimNode>((d) => d.r + 14))
    .stop()
    .tick(300);

  const positions: Record<string, { x: number; y: number }> = {};
  for (const node of sim) {
    positions[node.id] = { x: node.x, y: node.y };
  }
  return positions;
}

const ALL_REGIONS: StakeholderRegion[] = [
  "CN",
  "JP",
  "ID",
  "TH",
  "VN",
  "MY",
  "IN",
  "KR",
  "PH",
  "Global",
];
const ALL_SPECIES: StakeholderSpecies[] = ["aqua", "poultry", "ruminants", "swine"];
const ALL_EDGE_KINDS: InfluenceEdgeKind[] = [
  "advises",
  "specs",
  "approves",
  "regulates",
  "funds",
  "sells-to",
];

export default function StakeholderMap() {
  const [filterPersona, setFilterPersona] = useState<string>("all");
  const [filterRegion, setFilterRegion] = useState<StakeholderRegion | "all">("all");
  const [filterSpecies, setFilterSpecies] = useState<StakeholderSpecies | "all">("all");
  const [edgeKindFilter, setEdgeKindFilter] = useState<Record<InfluenceEdgeKind, boolean>>(
    () =>
      ALL_EDGE_KINDS.reduce(
        (acc, k) => ({ ...acc, [k]: true }),
        {} as Record<InfluenceEdgeKind, boolean>
      )
  );

  const selectedIds = useAdiPlanStore((s) => s.selectedStakeholderIds);
  const toggleStakeholder = useAdiPlanStore((s) => s.toggleStakeholder);
  const clearStakeholders = useAdiPlanStore((s) => s.clearStakeholders);

  // APAC plan Phase 3 — saved maps
  const savedMaps = useAdiPlanStore((s) => s.savedMaps);
  const saveMap = useAdiPlanStore((s) => s.saveMap);
  const setActiveMapId = useAdiPlanStore((s) => s.setActiveMapId);

  // hydrate seed maps once on mount if empty
  useEffect(() => {
    if (savedMaps.length === 0) {
      SEED_SAVED_MAPS.forEach((m) => {
        saveMap({
          id: m.id,
          name: m.name,
          scope: m.scope,
          scopeLabel: m.scopeLabel,
          regions: m.regions,
          species: m.species,
          description: m.description,
          nodes: m.nodes,
          author: m.author,
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveScope, setSaveScope] = useState<SavedMapScope>("country");
  const [saveScopeLabel, setSaveScopeLabel] = useState("Vietnam");
  const [recallOpen, setRecallOpen] = useState(false);

  const stakeholdersById = useMemo(
    () => new Map(seededStakeholders.map((s) => [s.id, s])),
    []
  );

  const handleSave = useCallback(() => {
    if (selectedIds.length === 0 || !saveName.trim()) return;
    const id = saveMap({
      name: saveName.trim(),
      scope: saveScope,
      scopeLabel: saveScopeLabel.trim() || saveScope,
      regions: filterRegion === "all" ? [] : [filterRegion],
      species: filterSpecies === "all" ? [] : [filterSpecies],
      description: undefined,
      nodes: selectedIds.map((sid) => ({ stakeholderId: sid })),
      author: "You",
    });
    void syncSavedStakeholderMapAfterLocalSave(id).then((r) => {
      if (r.ok || r.skipped) return;
      toast.error("Could not sync map to Supabase", {
        description: r.error ?? "Unknown error",
      });
    });
    setActiveMapId(id);
    setSaveOpen(false);
    setSaveName("");
  }, [
    selectedIds,
    saveName,
    saveScope,
    saveScopeLabel,
    saveMap,
    setActiveMapId,
    filterRegion,
    filterSpecies,
  ]);

  const handleRecall = useCallback(
    (m: SavedStakeholderMap) => {
      clearStakeholders();
      m.nodes.forEach((n) => toggleStakeholder(n.stakeholderId));
      setActiveMapId(m.id);
      setRecallOpen(false);
    },
    [clearStakeholders, toggleStakeholder, setActiveMapId]
  );

  const liveBalance = useMemo(() => {
    if (selectedIds.length < 2) return null;
    const fauxMap: SavedStakeholderMap = {
      id: "live",
      name: "live",
      scope: "country",
      scopeLabel: "live",
      regions: [],
      species: [],
      nodes: selectedIds.map((id) => ({ stakeholderId: id })),
      savedAt: new Date().toISOString(),
    };
    return checkBalance(fauxMap, stakeholdersById);
  }, [selectedIds, stakeholdersById]);

  const positions = useMemo(() => computeLayout(), []);

  const initialNodes: StakeholderNodeType[] = useMemo(
    () =>
      seededStakeholders.map((s) => ({
        id: s.id,
        type: "stakeholder",
        position: positions[s.id] ?? { x: 0, y: 0 },
        data: { stakeholder: s, selected: false, onToggle: toggleStakeholder },
      })),
    [positions, toggleStakeholder]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      seededEdges.map((e, i) => {
        const color = e.kind ? edgeKindColor[e.kind] : "#94a3b8";
        return {
          id: `e-${i}`,
          source: e.source,
          target: e.target,
          animated: false,
          label: e.kind ? edgeKindLabel[e.kind] : undefined,
          labelStyle: {
            fontSize: 9,
            fontWeight: 700,
            fill: color,
            letterSpacing: 0.4,
            textTransform: "uppercase" as const,
          },
          labelBgStyle: { fill: "#FFFFFF", opacity: 0.85 },
          labelBgPadding: [2, 4] as [number, number],
          labelBgBorderRadius: 3,
          style: { stroke: color, strokeWidth: 1 + (e.weight ?? 1) * 0.7 },
          markerEnd: { type: MarkerType.ArrowClosed, color },
          data: { kind: e.kind },
        };
      }),
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<StakeholderNodeType>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

  // Sync selection state into nodes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, selected: selectedIds.includes(n.id) },
      }))
    );
  }, [selectedIds, setNodes]);

  // Persona / region / species filters → hide nodes + edges
  useEffect(() => {
    const visibleIds = new Set(
      seededStakeholders
        .filter((s) => filterPersona === "all" || s.persona === filterPersona)
        .filter((s) => {
          if (filterRegion === "all") return true;
          if (!s.regions || s.regions.length === 0) return true; // no region tag = pan-APAC
          return s.regions.includes(filterRegion);
        })
        .filter((s) => {
          if (filterSpecies === "all") return true;
          if (!s.species || s.species.length === 0) return true;
          return s.species.includes(filterSpecies);
        })
        .map((s) => s.id)
    );
    setNodes((nds) => nds.map((n) => ({ ...n, hidden: !visibleIds.has(n.id) })));
    setEdges((eds) =>
      eds.map((e) => {
        const kind = (e.data as { kind?: InfluenceEdgeKind } | undefined)?.kind;
        const kindOk = !kind || edgeKindFilter[kind];
        return {
          ...e,
          hidden:
            !(visibleIds.has(e.source) && visibleIds.has(e.target)) || !kindOk,
        };
      })
    );
  }, [filterPersona, filterRegion, filterSpecies, edgeKindFilter, setNodes, setEdges]);

  const personas = useMemo(
    () => Array.from(new Set(seededStakeholders.map((s) => s.persona))),
    []
  );

  const resetLayout = useCallback(() => {
    const fresh = computeLayout();
    setNodes((nds) => nds.map((n) => ({ ...n, position: fresh[n.id] ?? n.position })));
  }, [setNodes]);

  const selectedStakeholders = seededStakeholders.filter((s) => selectedIds.includes(s.id));

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-adisseo-line bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Logo size="md" />
          <div className="h-6 w-px bg-adisseo-line" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
              Module 01 &middot; Assessing
            </p>
            <h1 className="text-lg font-semibold text-adisseo-ink-strong">
              Stakeholder Influence Map
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            icon={<Filter size={12} />}
            label="Persona"
            value={filterPersona}
            onChange={setFilterPersona}
            options={[{ value: "all", label: "All personas" }, ...personas.map((p) => ({ value: p, label: p }))]}
          />
          <FilterSelect
            icon={<MapPin size={12} />}
            label="Region"
            value={filterRegion}
            onChange={(v) => setFilterRegion(v as StakeholderRegion | "all")}
            options={[
              { value: "all", label: "All APAC" },
              ...ALL_REGIONS.map((r) => ({ value: r, label: r })),
            ]}
          />
          <FilterSelect
            icon={<LayersIcon size={12} />}
            label="Species"
            value={filterSpecies}
            onChange={(v) => setFilterSpecies(v as StakeholderSpecies | "all")}
            options={[
              { value: "all", label: "All species" },
              ...ALL_SPECIES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
            ]}
          />
          <button
            onClick={resetLayout}
            className="rounded-md border border-adisseo-line px-3 py-2 text-xs font-medium text-adisseo-ink hover:bg-adisseo-line/40"
          >
            Re-run layout
          </button>
          {/* APAC Phase 3 — Save / Recall */}
          <div className="relative">
            <button
              onClick={() => {
                setRecallOpen((v) => !v);
                setSaveOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-md border border-adisseo-line px-3 py-2 text-xs font-medium text-adisseo-ink hover:bg-adisseo-line/40"
              title="Recall a saved stakeholder map"
            >
              <FolderOpen size={13} />
              Recall map
              {savedMaps.length > 0 && (
                <span className="rounded-full bg-adisseo-line/60 px-1.5 py-0.5 text-[10px] font-bold">
                  {savedMaps.length}
                </span>
              )}
            </button>
            {recallOpen && savedMaps.length > 0 && (
              <div className="absolute right-0 top-full z-30 mt-1 w-72 rounded-xl border border-adisseo-line bg-white p-2 text-xs shadow-lg">
                <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                  Saved maps
                </p>
                <ul className="max-h-64 space-y-1 overflow-y-auto">
                  {savedMaps.map((m) => {
                    const bal = checkBalance(m, stakeholdersById);
                    return (
                      <li key={m.id}>
                        <button
                          onClick={() => handleRecall(m)}
                          className="block w-full rounded-md border border-adisseo-line/60 bg-white px-2 py-2 text-left hover:border-adisseo-crimson hover:bg-adisseo-crimson/5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate font-semibold text-adisseo-ink">
                              {m.name}
                            </span>
                            <span className="ml-2 shrink-0 rounded-full bg-adisseo-line/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-adisseo-muted">
                              {m.scope}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-[10px] text-adisseo-muted">
                            <span>{m.scopeLabel}</span>
                            <span>·</span>
                            <span>{m.nodes.length} nodes</span>
                            {!bal.ok && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-0.5 text-amber-700">
                                  <AlertTriangle size={9} />
                                  unbalanced
                                </span>
                              </>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={() => {
                setSaveOpen((v) => !v);
                setRecallOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-md border border-adisseo-crimson/40 bg-adisseo-crimson/5 px-3 py-2 text-xs font-medium text-adisseo-crimson hover:bg-adisseo-crimson/10"
              title="Save current selection as a named map"
            >
              <Save size={13} />
              Save map
            </button>
          )}
          {saveOpen && (
            <div className="absolute right-6 top-20 z-30 w-72 rounded-xl border border-adisseo-line bg-white p-3 text-xs shadow-lg">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                Save current map
              </p>
              <input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g. Vietnam — Aqua Q3"
                className="mt-2 w-full rounded-md border border-adisseo-line px-2 py-1.5 text-xs outline-none focus:border-adisseo-crimson"
              />
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <select
                  value={saveScope}
                  onChange={(e) => setSaveScope(e.target.value as SavedMapScope)}
                  className="rounded-md border border-adisseo-line px-2 py-1.5 text-[11px] outline-none focus:border-adisseo-crimson"
                >
                  <option value="country">Country</option>
                  <option value="group">Group</option>
                  <option value="company">Company</option>
                </select>
                <input
                  value={saveScopeLabel}
                  onChange={(e) => setSaveScopeLabel(e.target.value)}
                  placeholder="Scope label"
                  className="rounded-md border border-adisseo-line px-2 py-1.5 text-[11px] outline-none focus:border-adisseo-crimson"
                />
              </div>
              {liveBalance && !liveBalance.ok && (
                <p className="mt-2 flex items-start gap-1 rounded-md bg-amber-50 px-2 py-1.5 text-[10px] text-amber-800">
                  <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                  <span>{liveBalance.summary}</span>
                </p>
              )}
              <div className="mt-2 flex gap-1.5">
                <button
                  onClick={handleSave}
                  disabled={!saveName.trim()}
                  className="flex-1 rounded-md bg-adisseo-crimson px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40"
                >
                  Save
                </button>
                <button
                  onClick={() => setSaveOpen(false)}
                  className="rounded-md border border-adisseo-line px-3 py-1.5 text-xs text-adisseo-muted hover:bg-adisseo-line/40"
                >
                  Cancel
                </button>
              </div>
              <p className="mt-2 text-[9px] text-adisseo-muted">
                {selectedIds.length} selected · saves to local store
              </p>
            </div>
          )}

          {selectedIds.length > 0 && (
            <button
              onClick={clearStakeholders}
              className="rounded-md px-3 py-2 text-xs font-medium text-adisseo-muted hover:text-adisseo-ink"
            >
              Clear ({selectedIds.length})
            </button>
          )}
          <Link
            href="/stakeholder-fanout"
            className="flex items-center gap-2 rounded-md border border-adisseo-ink/15 bg-adisseo-ink-strong px-3 py-2 text-xs font-medium text-white hover:opacity-90"
            title="Fan one article into N persona-customized variants"
          >
            <LayersIcon size={13} />
            Fan-out demo
          </Link>
          <Link
            href="/cbi-ladder"
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
              selectedIds.length > 0
                ? "bg-adisseo-crimson text-white hover:opacity-90"
                : "bg-adisseo-line/60 text-adisseo-muted pointer-events-none"
            }`}
          >
            Build CBI Ladder
            {selectedIds.length > 0 && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{selectedIds.length}</span>
            )}
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <div className="relative flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={1.6}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={24} color="#e2e8f0" />
          <Controls position="bottom-right" />
          <MiniMap
            position="bottom-left"
            pannable
            zoomable
            nodeColor={(n) => {
              const sh = (n.data as StakeholderNodeData | undefined)?.stakeholder;
              return sh ? personaColors[sh.persona] : "#94a3b8";
            }}
          />
        </ReactFlow>

        {/* Legend (left) */}
        <aside className="pointer-events-auto absolute left-4 top-4 max-w-xs space-y-3 rounded-xl border border-adisseo-line bg-white/95 p-4 text-xs shadow-sm backdrop-blur">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              Click bubble to select
            </p>
            <p className="text-adisseo-ink">Selections feed the CBI Ladder</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              Bubble size
            </p>
            <p className="text-adisseo-ink">Current influence (small / medium / large)</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              Dotted ring
            </p>
            <p className="text-adisseo-ink">
              Outer = future +&nbsp;&nbsp;·&nbsp;&nbsp;Inner = future –
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              Persona colour
            </p>
            <ul className="space-y-1">
              {Object.entries(personaColors).map(([persona, color]) => (
                <li key={persona} className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-adisseo-ink">{persona}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              Edge kind (toggle)
            </p>
            <ul className="space-y-1">
              {ALL_EDGE_KINDS.map((k) => (
                <li key={k}>
                  <button
                    onClick={() =>
                      setEdgeKindFilter((prev) => ({ ...prev, [k]: !prev[k] }))
                    }
                    className={`flex w-full items-center gap-2 rounded px-1 py-0.5 text-left transition ${
                      edgeKindFilter[k] ? "" : "opacity-30"
                    }`}
                  >
                    <span
                      className="inline-block h-1 w-6 rounded-full"
                      style={{ backgroundColor: edgeKindColor[k] }}
                    />
                    <span className="text-adisseo-ink">{edgeKindLabel[k]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Selection panel (right) */}
        {selectedStakeholders.length > 0 && (
          <aside className="pointer-events-auto absolute right-4 top-4 max-h-[80vh] w-72 space-y-2 overflow-y-auto rounded-xl border border-adisseo-line bg-white/95 p-4 text-xs shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                Selected ({selectedStakeholders.length})
              </p>
              <button
                onClick={clearStakeholders}
                className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted hover:text-adisseo-crimson"
              >
                Clear all
              </button>
            </div>
            <ul className="space-y-2">
              {selectedStakeholders.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-adisseo-line bg-white p-2"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: personaColors[s.persona] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-adisseo-ink-strong">
                        {s.label}
                      </p>
                      <p className="mt-0.5 text-[10px] text-adisseo-muted">
                        {s.persona} · {s.influence} · {trendLabel[s.trend]}
                      </p>
                      {(s.regions?.length || s.species?.length) && (
                        <p className="mt-0.5 truncate text-[10px] text-adisseo-muted">
                          {s.regions?.join(",")}
                          {s.regions && s.species && s.regions.length && s.species.length ? " · " : ""}
                          {s.species?.join("/")}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleStakeholder(s.id)}
                      className="text-adisseo-muted hover:text-adisseo-crimson"
                      title="Deselect"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href="/cbi-ladder"
                className="rounded-md bg-adisseo-crimson px-2 py-1 text-center text-[10px] font-bold uppercase tracking-widest text-white hover:opacity-90"
              >
                CBI Ladder
              </Link>
              <Link
                href="/wwwk"
                className="rounded-md bg-adisseo-orange px-2 py-1 text-center text-[10px] font-bold uppercase tracking-widest text-white hover:opacity-90"
              >
                WWWK board
              </Link>
              <Link
                href="/personas-matrix"
                className="rounded-md border border-adisseo-line px-2 py-1 text-center text-[10px] font-bold uppercase tracking-widest text-adisseo-ink-strong hover:border-adisseo-crimson hover:text-adisseo-crimson"
              >
                Personas matrix
              </Link>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-1 rounded-md border border-adisseo-line bg-white px-2 py-1 text-xs">
      <span className="flex items-center gap-1 text-adisseo-muted">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-widest">
          {label}
        </span>
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs text-adisseo-ink-strong focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
