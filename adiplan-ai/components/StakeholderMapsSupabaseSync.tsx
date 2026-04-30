"use client";

import { useEffect, useRef } from "react";
import { getSupabase, isLive } from "@/lib/supabase-client";
import { pullStakeholderMapsIntoStore } from "@/lib/stakeholder-map-supabase";

/**
 * Phase 8 — keeps saved stakeholder maps merged with Postgres when the pilot
 * stack is configured and the user has an auth session.
 */
export function StakeholderMapsSupabaseSync() {
  const pulling = useRef(false);

  useEffect(() => {
    if (!isLive()) return;
    const sb = getSupabase();
    if (!sb) return;

    async function pullOnce() {
      if (pulling.current) return;
      pulling.current = true;
      try {
        await pullStakeholderMapsIntoStore();
      } finally {
        pulling.current = false;
      }
    }

    void pullOnce();
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange(() => {
      void pullOnce();
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
