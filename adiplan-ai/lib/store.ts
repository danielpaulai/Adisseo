"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StrategicFrame } from "@/lib/strategic-frame";

/* ============================================================================
 * War-room activity log — every meaningful action surfaces on /dashboard so the
 * regional sales meeting can see, at a glance: what news got matched, what
 * frame got composed, what deliverables shipped this morning.
 * ========================================================================== */
export type ActivityKind =
  | "match"
  | "frame"
  | "aqua"
  | "poultry"
  | "ruminants"
  | "swine"
  | "billboard"
  | "voice-memo";

export type ActivityEntry = {
  id: string;
  kind: ActivityKind;
  title: string;
  /** Optional sub-line — language, audience, format. */
  detail?: string;
  /** Where to click back to. */
  href?: string;
  /** ISO timestamp. */
  at: string;
  /** Optional badge color override. */
  tone?: "crimson" | "cyan" | "orange" | "ink";
};

export type LadderRung = {
  id: string;
  outcome: string;
  witi: string;
};

export type StakeholderLadder = {
  stakeholderId: string;
  rungs: LadderRung[];
  topValue: string;
};

export type MatchedArticle = {
  articleId: string;
  cbi: string;
  cbiId: string;
  cbiRationale: string;
  persona: string;
  personaId: string;
  personaRationale: string;
  recommendedFormats: string[];
  recommendedFormatIds?: string[];
  speciesFit: ("aqua" | "poultry" | "ruminants" | "swine")[];
  matchedAt: string;
};

export type StudioPrefill = {
  /** Original article that triggered this prefill — for the "From News Bridge" banner. */
  articleTitle: string;
  competitor: string;
  publishedAt: string;
  /** Hints — empty fields mean "no opinion, use the studio's default". */
  aquaLanguage?: "en" | "id" | "vi" | "th";
  aquaMagazineId?: string;
  poultryCampaignId?: string;
  poultryAudienceId?: string;
  ruminantsLanguage?: "ja" | "en";
  ruminantsCampaignId?: string;
  ruminantsAudienceId?: string;
  swineLanguage?: "en" | "zh" | "vi" | "th" | "id";
  swineAccountId?: string;
};

interface AdiPlanStore {
  selectedStakeholderIds: string[];
  toggleStakeholder: (id: string) => void;
  setSelectedStakeholders: (ids: string[]) => void;
  clearStakeholders: () => void;

  ladders: Record<string, StakeholderLadder>;
  setLadder: (l: StakeholderLadder) => void;
  removeLadder: (stakeholderId: string) => void;

  selectedArticleId: string | null;
  setSelectedArticle: (id: string | null) => void;

  match: MatchedArticle | null;
  setMatch: (m: MatchedArticle | null) => void;

  studioPrefill: StudioPrefill | null;
  setStudioPrefill: (p: StudioPrefill | null) => void;
  consumeStudioPrefill: () => StudioPrefill | null;

  studioTopic: string;
  studioLanguage: "en" | "zh" | "vi" | "th" | "id";
  studioAccount: string;
  setStudioTopic: (t: string) => void;
  setStudioLanguage: (l: AdiPlanStore["studioLanguage"]) => void;
  setStudioAccount: (a: string) => void;

  /** Most recent strategic frame composed in this session (for Billboard reuse + war-room). */
  composedFrame: StrategicFrame | null;
  setComposedFrame: (f: StrategicFrame | null) => void;

  /** War-room activity log (most-recent-first, capped at 30). */
  activity: ActivityEntry[];
  pushActivity: (entry: Omit<ActivityEntry, "id" | "at"> & { id?: string; at?: string }) => void;
  clearActivity: () => void;
}

export const useAdiPlanStore = create<AdiPlanStore>()(
  persist(
    (set, get) => ({
      selectedStakeholderIds: [],
      toggleStakeholder: (id) =>
        set((s) => ({
          selectedStakeholderIds: s.selectedStakeholderIds.includes(id)
            ? s.selectedStakeholderIds.filter((x) => x !== id)
            : [...s.selectedStakeholderIds, id],
        })),
      setSelectedStakeholders: (ids) => set({ selectedStakeholderIds: ids }),
      clearStakeholders: () => set({ selectedStakeholderIds: [] }),

      ladders: {},
      setLadder: (l) =>
        set((s) => ({ ladders: { ...s.ladders, [l.stakeholderId]: l } })),
      removeLadder: (stakeholderId) =>
        set((s) => {
          const next = { ...s.ladders };
          delete next[stakeholderId];
          return { ladders: next };
        }),

      selectedArticleId: null,
      setSelectedArticle: (id) => set({ selectedArticleId: id }),

      match: null,
      setMatch: (m) => set({ match: m }),

      studioPrefill: null,
      setStudioPrefill: (p) => set({ studioPrefill: p }),
      consumeStudioPrefill: () => {
        const current = get().studioPrefill;
        if (current) set({ studioPrefill: null });
        return current;
      },

      studioTopic: "",
      studioLanguage: "en",
      studioAccount: "",
      setStudioTopic: (t) => set({ studioTopic: t }),
      setStudioLanguage: (l) => set({ studioLanguage: l }),
      setStudioAccount: (a) => set({ studioAccount: a }),

      composedFrame: null,
      setComposedFrame: (f) => set({ composedFrame: f }),

      activity: [],
      pushActivity: (entry) =>
        set((s) => {
          const id =
            entry.id ?? `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
          const at = entry.at ?? new Date().toISOString();
          const next: ActivityEntry = {
            id,
            at,
            kind: entry.kind,
            title: entry.title,
            detail: entry.detail,
            href: entry.href,
            tone: entry.tone,
          };
          return { activity: [next, ...s.activity].slice(0, 30) };
        }),
      clearActivity: () => set({ activity: [] }),
    }),
    { name: "adiplan-ai-state-v1" }
  )
);
