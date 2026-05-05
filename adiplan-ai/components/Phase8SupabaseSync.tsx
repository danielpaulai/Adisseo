"use client";

import { useEffect, useRef } from "react";
import { getSupabase, isLive } from "@/lib/supabase-client";
import { pullApprovalRequestsIntoStore } from "@/lib/approval-requests-supabase";
import { pullStakeholderMapsIntoStore } from "@/lib/stakeholder-map-supabase";

/**
 * Pilot persistence — merge cloud state (stakeholder maps + regional approvals) after sign-in.
 */
export function Phase8SupabaseSync() {
  const pulling = useRef(false);

  useEffect(() => {
    if (!isLive()) return;
    const sb = getSupabase();
    if (!sb) return;

    async function pullAll() {
      if (pulling.current) return;
      pulling.current = true;
      try {
        await Promise.all([
          pullStakeholderMapsIntoStore(),
          pullApprovalRequestsIntoStore(),
        ]);
      } finally {
        pulling.current = false;
      }
    }

    void pullAll();
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange(() => {
      void pullAll();
    });
    return () => subscription.unsubscribe();
  }, []);

  return null;
}
