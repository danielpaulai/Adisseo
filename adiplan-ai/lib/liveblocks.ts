"use client";

import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

/**
 * Liveblocks workshop-mode client.
 *
 * If NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_API_KEY is set, the StakeholderMap renders
 * with live cursors + presence avatars. Otherwise it falls back to single-
 * player mode automatically (existing local behavior).
 *
 * Get a key from https://liveblocks.io/dashboard/apikeys (free tier covers
 * a 100-person workshop). Add to adiplan-ai/.env.local as:
 *   NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_API_KEY=pk_dev_...
 */

const publicApiKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_API_KEY;

export const liveblocksEnabled = Boolean(publicApiKey);

export type LBPresence = {
  cursor: { x: number; y: number } | null;
  name: string;
  color: string;
};

type LBStorage = Record<string, never>;

type LBUserMeta = {
  id: string;
  info: { name: string; color: string };
};

const client = publicApiKey
  ? createClient({ publicApiKey, throttle: 16 })
  : null;

const ctx = client
  ? createRoomContext<LBPresence, LBStorage, LBUserMeta>(client)
  : null;

export const RoomProvider = ctx?.RoomProvider;
export const useOthers = ctx?.useOthers;
export const useMyPresence = ctx?.useMyPresence;
export const useUpdateMyPresence = ctx?.useUpdateMyPresence;
export const useStatus = ctx?.useStatus;

const palette = [
  "#0066B3", "#7AB800", "#E15554", "#3BB273", "#7768AE",
  "#F4A261", "#E76F51", "#2A9D8F", "#264653", "#9B5DE5",
];

const firstNames = [
  "Ricardo", "Aileen", "Vish", "Antoine", "Claire",
  "Sophia", "Jovita", "Mei", "Anh", "Putri",
];

export function generateLocalUser() {
  if (typeof window === "undefined") {
    return { id: "server", name: "Server", color: palette[0] };
  }
  const stored = window.sessionStorage.getItem("adiplan-user");
  if (stored) {
    try {
      return JSON.parse(stored) as { id: string; name: string; color: string };
    } catch {
      // fall through
    }
  }
  const user = {
    id: `user-${Math.random().toString(36).slice(2, 8)}`,
    name: firstNames[Math.floor(Math.random() * firstNames.length)],
    color: palette[Math.floor(Math.random() * palette.length)],
  };
  window.sessionStorage.setItem("adiplan-user", JSON.stringify(user));
  return user;
}

