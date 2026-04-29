"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  cbiRationale: string;
  persona: string;
  personaRationale: string;
  recommendedFormats: string[];
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
    }),
    { name: "adiplan-ai-state-v1" }
  )
);
