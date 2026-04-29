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
import { forceSimulation, forceManyBody, forceCenter, forceLink, forceCollide } from "d3-force";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import {
  seededStakeholders,
  seededEdges,
  personaColors,
  influenceRadius,
  trendLabel,
  type Stakeholder,
} from "@/lib/stakeholders";
import { useAdiPlanStore } from "@/lib/store";
import { Logo } from "@/components/Logo";

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

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      {stakeholder.trend !== "not-changing" && (
        <div
          className="absolute rounded-full border-2 border-dashed"
          style={{
            width: size + (stakeholder.trend === "growing" ? 22 : -16),
            height: size + (stakeholder.trend === "growing" ? 22 : -16),
            borderColor: color,
            opacity: 0.55,
          }}
        />
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(stakeholder.id);
        }}
        className="flex items-center justify-center rounded-full text-center text-white shadow-md transition hover:scale-105"
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
        title={`${stakeholder.label} · ${stakeholder.persona} · ${trendLabel[stakeholder.trend]}`}
      >
        <span>{stakeholder.label}</span>
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

export default function StakeholderMap() {
  const [filterPersona, setFilterPersona] = useState<string>("all");
  const selectedIds = useAdiPlanStore((s) => s.selectedStakeholderIds);
  const toggleStakeholder = useAdiPlanStore((s) => s.toggleStakeholder);
  const clearStakeholders = useAdiPlanStore((s) => s.clearStakeholders);

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
      seededEdges.map((e, i) => ({
        id: `e-${i}`,
        source: e.source,
        target: e.target,
        animated: false,
        style: { stroke: "#94a3b8", strokeWidth: 1 + (e.weight ?? 1) * 0.6 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
      })),
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

  useEffect(() => {
    if (filterPersona === "all") {
      setNodes((nds) => nds.map((n) => ({ ...n, hidden: false })));
      setEdges((eds) => eds.map((e) => ({ ...e, hidden: false })));
      return;
    }
    const visibleIds = new Set(
      seededStakeholders.filter((s) => s.persona === filterPersona).map((s) => s.id)
    );
    setNodes((nds) => nds.map((n) => ({ ...n, hidden: !visibleIds.has(n.id) })));
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        hidden: !(visibleIds.has(e.source) && visibleIds.has(e.target)),
      }))
    );
  }, [filterPersona, setNodes, setEdges]);

  const personas = useMemo(
    () => Array.from(new Set(seededStakeholders.map((s) => s.persona))),
    []
  );

  const resetLayout = useCallback(() => {
    const fresh = computeLayout();
    setNodes((nds) =>
      nds.map((n) => ({ ...n, position: fresh[n.id] ?? n.position }))
    );
  }, [setNodes]);

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
        <div className="flex items-center gap-3">
          <select
            value={filterPersona}
            onChange={(e) => setFilterPersona(e.target.value)}
            className="rounded-md border border-adisseo-line px-3 py-2 text-sm"
          >
            <option value="all">All personas</option>
            {personas.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button
            onClick={resetLayout}
            className="rounded-md border border-adisseo-line px-3 py-2 text-sm font-medium text-adisseo-ink hover:bg-adisseo-line/40"
          >
            Re-run layout
          </button>
          {selectedIds.length > 0 && (
            <button
              onClick={clearStakeholders}
              className="rounded-md px-3 py-2 text-sm font-medium text-adisseo-muted hover:text-adisseo-ink"
            >
              Clear ({selectedIds.length})
            </button>
          )}
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
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {selectedIds.length}
              </span>
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

        <aside className="pointer-events-none absolute left-4 top-4 max-w-xs space-y-3 rounded-xl border border-adisseo-line bg-white/90 p-4 text-xs shadow-sm backdrop-blur">
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
            <p className="text-adisseo-ink">Current influence</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              Dotted ring
            </p>
            <p className="text-adisseo-ink">Outer = growing &middot; inner = shrinking</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              Color
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
              Arrows
            </p>
            <p className="text-adisseo-ink">Who-influences-whom (power flow)</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
