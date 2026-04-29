"use client";

import { useEffect } from "react";
import { MousePointer2, Users, Wifi, WifiOff } from "lucide-react";
import {
  liveblocksEnabled,
  useOthers,
  useUpdateMyPresence,
  useStatus,
  generateLocalUser,
} from "@/lib/liveblocks";

export function WorkshopOverlay() {
  if (!liveblocksEnabled) {
    return <SinglePlayerBadge />;
  }
  return <MultiplayerOverlay />;
}

function SinglePlayerBadge() {
  return (
    <div className="pointer-events-none absolute right-4 top-4 z-30 flex items-center gap-1.5 rounded-full border border-adisseo-line bg-white/90 px-3 py-1.5 text-[11px] font-medium text-adisseo-muted shadow-sm backdrop-blur">
      <WifiOff size={11} /> Single-player &middot; add{" "}
      <code className="font-mono text-[10px]">LIVEBLOCKS</code> key for workshop mode
    </div>
  );
}

function MultiplayerOverlay() {
  const others = useOthers!();
  const updateMyPresence = useUpdateMyPresence!();
  const status = useStatus!();

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      updateMyPresence({ cursor: { x: e.clientX, y: e.clientY } });
    };
    const leave = () => updateMyPresence({ cursor: null });
    window.addEventListener("pointermove", handle);
    window.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", handle);
      window.removeEventListener("pointerleave", leave);
    };
  }, [updateMyPresence]);

  const me = generateLocalUser();
  const connected = status === "connected";

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-40">
        {others.map(({ connectionId, presence }) => {
          if (!presence?.cursor) return null;
          const color = presence.color ?? "#0066B3";
          return (
            <div
              key={connectionId}
              className="absolute transition-transform duration-75 ease-linear"
              style={{
                transform: `translate(${presence.cursor.x}px, ${presence.cursor.y}px)`,
              }}
            >
              <MousePointer2
                size={20}
                style={{ color, fill: color }}
                className="drop-shadow"
              />
              <span
                className="ml-1 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white shadow"
                style={{ backgroundColor: color }}
              >
                {presence.name ?? "Guest"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pointer-events-auto absolute right-4 top-4 z-30 flex items-center gap-2 rounded-full border border-adisseo-line bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur">
        <span
          className={`flex items-center gap-1.5 text-[11px] font-medium ${
            connected ? "text-adisseo-crimson" : "text-adisseo-muted"
          }`}
        >
          {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
          {connected ? "Workshop live" : "Connecting…"}
        </span>
        <span className="h-3 w-px bg-adisseo-line" />
        <Users size={11} className="text-adisseo-muted" />
        <div className="flex -space-x-2">
          <Avatar name={me.name} color={me.color} title={`You · ${me.name}`} self />
          {others.slice(0, 5).map(({ connectionId, presence }) => (
            <Avatar
              key={connectionId}
              name={presence?.name ?? "Guest"}
              color={presence?.color ?? "#0066B3"}
              title={presence?.name ?? "Guest"}
            />
          ))}
          {others.length > 5 && (
            <span className="z-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[9px] font-semibold text-adisseo-ink">
              +{others.length - 5}
            </span>
          )}
        </div>
        <span className="text-[10px] text-adisseo-muted">
          {others.length + 1} online
        </span>
      </div>
    </>
  );
}

function Avatar({
  name,
  color,
  title,
  self,
}: {
  name: string;
  color: string;
  title: string;
  self?: boolean;
}) {
  return (
    <span
      title={title}
      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[9px] font-bold text-white shadow ${
        self ? "border-adisseo-ink" : "border-white"
      }`}
      style={{ backgroundColor: color }}
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}
