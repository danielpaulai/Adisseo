"use client";

import type { ReactNode } from "react";
import { RoomProvider, generateLocalUser } from "@/lib/liveblocks";

export function MaybeRoomProvider({
  roomId,
  children,
}: {
  roomId: string;
  children: ReactNode;
}) {
  if (!RoomProvider) return <>{children}</>;
  const user = generateLocalUser();
  return (
    <RoomProvider
      id={roomId}
      initialPresence={{ cursor: null, name: user.name, color: user.color }}
    >
      {children}
    </RoomProvider>
  );
}
