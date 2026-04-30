"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StrategicFrame } from "@/lib/strategic-frame";
import type { VoiceProfile } from "@/lib/voice-profile";
import type { TenantId, DistributionChannel } from "@/lib/tenant";
import type { ChannelPreview } from "@/lib/channel-adapter";
import type { DeliverableInstance } from "@/lib/engagement";
import type { SavedStakeholderMap } from "@/lib/saved-stakeholder-map";

/* ============================================================================
 * Phase 4 — multi-tenant + distribution rails
 * Phase 5 — extended with live preview, public URL, audience count, engagement
 * ========================================================================== */
export interface DistributionLog {
  id: string;
  tenantId: TenantId;
  channel: DistributionChannel;
  /** Human-readable deliverable label. */
  deliverable: string;
  /** Approval id this dispatch references (must be approved). */
  approvalId?: string;
  trustScore?: number;
  status: "queued" | "shipped" | "blocked";
  /** Reason if blocked. */
  blockReason?: string;
  audience?: string;
  /** ISO. */
  shippedAt: string;
  /* Phase 5 */
  /** Resolvable URL the recipient would land on (mock or real). */
  publicUrl?: string;
  /** Mock confirmation id from the channel. */
  externalId?: string;
  /** Reach for the dispatch. */
  audienceCount?: number;
  /** Channel-native preview payload (for the row drill-down). */
  preview?: ChannelPreview;
  /** Inbound engagement (filled by /api/distribution-callback). */
  engagement?: {
    impressions: number;
    qualifiedViews: number;
    conversations: number;
    conversions: number;
    updatedAt: string;
  };
  /** Owning deliverable id (links to DeliverableInstance for engagement-tracker). */
  deliverableInstanceId?: string;
  /* Phase 6 — production-readiness signals. */
  /** "live" if dispatched via the live HTTP shell, "mock" otherwise. */
  dispatchMode?: "live" | "mock";
  /** True if the rate-limit gate held the call back. */
  rateLimited?: boolean;
  /** Wait ms applied by the rate-limiter (0 = none). */
  waitMs?: number;
}

/* ============================================================================
 * Phase 5 — scheduled-send queue. Operators can defer a dispatch to a
 * specific ISO timestamp; the /distribution UI displays the queue and an
 * operator (or in production, a cron) flips it into the live distribution
 * log when the time arrives.
 * ========================================================================== */
export interface ScheduledSend {
  id: string;
  tenantId: TenantId;
  channel: DistributionChannel;
  deliverable: string;
  trustScore?: number;
  approvalStatus?: "approved" | "pending" | "rejected";
  species?: "aqua" | "poultry" | "ruminants" | "swine" | "cross";
  /** ISO timestamp when the queue should fire. */
  scheduledFor: string;
  /** ISO timestamp when the entry was queued. */
  queuedAt: string;
  /** "queued" | "fired" | "cancelled". */
  status: "queued" | "fired" | "cancelled";
}

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

/* ============================================================================
 * Brand-guardrail approval workflow.
 *
 * Vish's #1 blocker on the Apr 28 call: HQ brand-guardrail compliance gates
 * every poultry carousel and emailer. Every deliverable can be sent to the
 * approval queue, reviewed by HQ (Ricardo), approved or rejected with a
 * comment, and audited.
 * ========================================================================== */

export type ApprovalKind =
  | "aqua-leaflet"
  | "poultry-pack"
  | "ruminants-brochure"
  | "swine-short"
  | "voice-memo"
  | "strategic-frame";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ApprovalRequest = {
  id: string;
  kind: ApprovalKind;
  title: string;
  /** Short description for the queue. */
  summary: string;
  /** Who originated the request. */
  sender: string;
  /** Where to deep-link back to in the studio. */
  href?: string;
  /** Free-form payload snapshot for the queue (language, audience, etc.). */
  payload?: Record<string, string | number | boolean | undefined>;
  status: ApprovalStatus;
  sentAt: string;
  /** When HQ responded. */
  reviewedAt?: string;
  /** Reviewer comment (free text). */
  reviewerComment?: string;
  /** Reviewer name. */
  reviewer?: string;
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

  /** Most recent strategic frame composed in this session (war-room reuse). */
  composedFrame: StrategicFrame | null;
  setComposedFrame: (f: StrategicFrame | null) => void;

  /** War-room activity log (most-recent-first, capped at 30). */
  activity: ActivityEntry[];
  pushActivity: (entry: Omit<ActivityEntry, "id" | "at"> & { id?: string; at?: string }) => void;
  clearActivity: () => void;

  /** Brand-guardrail approval queue. */
  approvals: ApprovalRequest[];
  requestApproval: (
    req: Omit<ApprovalRequest, "id" | "sentAt" | "status">
  ) => string;
  decideApproval: (
    id: string,
    decision: "approved" | "rejected",
    reviewerComment: string,
    reviewer?: string
  ) => void;
  clearApprovals: () => void;

  /** Per-manager voice profiles (Phase 3). */
  voiceProfiles: Record<string, VoiceProfile>;
  setVoiceProfile: (managerId: string, profile: VoiceProfile) => void;
  removeVoiceProfile: (managerId: string) => void;
  /** Currently active manager id, used by ProseQualityCard for voice scoring. */
  activeManagerId: string | null;
  setActiveManager: (id: string | null) => void;

  /** Phase 4 — active tenant scope (Adisseo / DSM / Cargill / Kemin). */
  activeTenantId: TenantId;
  setActiveTenant: (id: TenantId) => void;

  /** Phase 4 — distribution log (audit of every channel push). */
  distribution: DistributionLog[];
  pushDistribution: (entry: Omit<DistributionLog, "id" | "shippedAt"> & {
    id?: string;
    shippedAt?: string;
  }) => string;
  clearDistribution: () => void;
  /** Phase 5 — patch an existing dispatch (e.g. with engagement metrics). */
  patchDistribution: (id: string, patch: Partial<DistributionLog>) => void;

  /** Phase 5 — scheduled-send queue. */
  scheduledSends: ScheduledSend[];
  schedule: (entry: Omit<ScheduledSend, "id" | "queuedAt" | "status"> & {
    id?: string;
  }) => string;
  fireScheduled: (id: string) => void;
  cancelScheduled: (id: string) => void;
  clearScheduled: () => void;

  /** Phase 5 — live deliverables (auto-created on ship, feed engagement-tracker). */
  liveDeliverables: DeliverableInstance[];
  pushLiveDeliverable: (d: DeliverableInstance) => void;
  patchLiveDeliverable: (id: string, patch: Partial<DeliverableInstance>) => void;
  clearLiveDeliverables: () => void;

  /** Phase 3 (APAC plan) — saved stakeholder maps + recall. */
  savedMaps: SavedStakeholderMap[];
  saveMap: (m: Omit<SavedStakeholderMap, "id" | "savedAt"> & { id?: string }) => string;
  updateMap: (id: string, patch: Partial<SavedStakeholderMap>) => void;
  deleteMap: (id: string) => void;
  clearSavedMaps: () => void;
  /** Active map id loaded into the editor. null = transient unsaved selection. */
  activeMapId: string | null;
  setActiveMapId: (id: string | null) => void;
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

      approvals: [],
      requestApproval: (req) => {
        const id = `apr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const sentAt = new Date().toISOString();
        const next: ApprovalRequest = {
          id,
          sentAt,
          status: "pending",
          ...req,
        };
        set((s) => ({ approvals: [next, ...s.approvals].slice(0, 60) }));
        return id;
      },
      decideApproval: (id, decision, reviewerComment, reviewer) =>
        set((s) => ({
          approvals: s.approvals.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: decision,
                  reviewerComment,
                  reviewer: reviewer ?? a.reviewer ?? "Ricardo Communod",
                  reviewedAt: new Date().toISOString(),
                }
              : a
          ),
        })),
      clearApprovals: () => set({ approvals: [] }),

      voiceProfiles: {},
      setVoiceProfile: (managerId, profile) =>
        set((s) => ({
          voiceProfiles: { ...s.voiceProfiles, [managerId]: profile },
        })),
      removeVoiceProfile: (managerId) =>
        set((s) => {
          const next = { ...s.voiceProfiles };
          delete next[managerId];
          return { voiceProfiles: next };
        }),
      activeManagerId: null,
      setActiveManager: (id) => set({ activeManagerId: id }),

      activeTenantId: "adisseo",
      setActiveTenant: (id) => set({ activeTenantId: id }),

      distribution: [],
      pushDistribution: (entry) => {
        const id = entry.id ?? `dist-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const shippedAt = entry.shippedAt ?? new Date().toISOString();
        const next: DistributionLog = {
          id,
          shippedAt,
          tenantId: entry.tenantId,
          channel: entry.channel,
          deliverable: entry.deliverable,
          approvalId: entry.approvalId,
          trustScore: entry.trustScore,
          status: entry.status,
          blockReason: entry.blockReason,
          audience: entry.audience,
          publicUrl: entry.publicUrl,
          externalId: entry.externalId,
          audienceCount: entry.audienceCount,
          preview: entry.preview,
          engagement: entry.engagement,
          deliverableInstanceId: entry.deliverableInstanceId,
          dispatchMode: entry.dispatchMode,
          rateLimited: entry.rateLimited,
          waitMs: entry.waitMs,
        };
        set((s) => ({ distribution: [next, ...s.distribution].slice(0, 80) }));
        return id;
      },
      clearDistribution: () => set({ distribution: [] }),
      patchDistribution: (id, patch) =>
        set((s) => ({
          distribution: s.distribution.map((d) =>
            d.id === id ? { ...d, ...patch } : d
          ),
        })),

      scheduledSends: [],
      schedule: (entry) => {
        const id =
          entry.id ?? `sch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const queuedAt = new Date().toISOString();
        const next: ScheduledSend = {
          id,
          queuedAt,
          status: "queued",
          tenantId: entry.tenantId,
          channel: entry.channel,
          deliverable: entry.deliverable,
          trustScore: entry.trustScore,
          approvalStatus: entry.approvalStatus,
          species: entry.species,
          scheduledFor: entry.scheduledFor,
        };
        set((s) => ({
          scheduledSends: [next, ...s.scheduledSends].slice(0, 40),
        }));
        return id;
      },
      fireScheduled: (id) =>
        set((s) => ({
          scheduledSends: s.scheduledSends.map((q) =>
            q.id === id ? { ...q, status: "fired" } : q
          ),
        })),
      cancelScheduled: (id) =>
        set((s) => ({
          scheduledSends: s.scheduledSends.map((q) =>
            q.id === id ? { ...q, status: "cancelled" } : q
          ),
        })),
      clearScheduled: () => set({ scheduledSends: [] }),

      liveDeliverables: [],
      pushLiveDeliverable: (d) =>
        set((s) => ({
          liveDeliverables: [d, ...s.liveDeliverables].slice(0, 60),
        })),
      patchLiveDeliverable: (id, patch) =>
        set((s) => ({
          liveDeliverables: s.liveDeliverables.map((d) =>
            d.id === id ? { ...d, ...patch } : d
          ),
        })),
      clearLiveDeliverables: () => set({ liveDeliverables: [] }),

      savedMaps: [],
      activeMapId: null,
      saveMap: (m) => {
        const id =
          m.id ?? `map-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
        const next: SavedStakeholderMap = {
          ...m,
          id,
          savedAt: new Date().toISOString(),
        };
        set((s) => ({
          savedMaps: [next, ...s.savedMaps.filter((x) => x.id !== id)].slice(0, 40),
          activeMapId: id,
        }));
        return id;
      },
      updateMap: (id, patch) =>
        set((s) => ({
          savedMaps: s.savedMaps.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      deleteMap: (id) =>
        set((s) => ({
          savedMaps: s.savedMaps.filter((m) => m.id !== id),
          activeMapId: s.activeMapId === id ? null : s.activeMapId,
        })),
      clearSavedMaps: () => set({ savedMaps: [], activeMapId: null }),
      setActiveMapId: (id) => set({ activeMapId: id }),
    }),
    { name: "adiplan-ai-state-v1" }
  )
);
