# AdiPlan AI — MVP Scope (1-pager for Ricardo)

**Author:** Danny | **Date:** Apr 28, 2026 | **For:** Ricardo Communod, Adisseo APAC
**Pilot region:** APAC | **Demo target:** Thursday May 7, 2026 (Adisseo global)

---

## The missing link, in one sentence

> "We have all the news, we have our strategy. The missing link is putting them together with RAG to take the decision for us and tell us what to do." — Ricardo, Apr 28

AdiPlan AI is that bridge. It sits between the competitor news scraper (already shipped) and Adisseo's AdiPlan marketing framework, and produces ready-to-publish deliverables per species, country, persona, and language.

---

## Architecture (5 layers, with the AI governance seam drawn)

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 5  ACTIVATION                                             │
│  Account-Adaptation Engine · Sales Weekly Dashboard ·           │
│  Engagement Tracker (Malaysia-ASF model) · Publishing rails     │
├─────────────────────────────────────────────────────────────────┤
│ Layer 4  CONTENT STUDIO   per persona × country × language      │
│  Aqua leaflets · Poultry emailers · Ruminants Manga ·           │
│  Swine <60s shorts · explainer videos · podcast scripts         │
│  ↑ Brand-Guardrail Pack enforces HQ-approved style              │
├─────────────────────────────────────────────────────────────────┤
│ Layer 3  STRATEGIC FRAME   the AdiPlan engine                   │
│  Stakeholder Map · CBI/CSF Ladder · Personas · TVS · Billboard  │
├─────────────────────────────────────────────────────────────────┤
│ Layer 2  SYNTHESIS / RAG                                        │
│  Match scraped news ↔ strategy ↔ persona ↔ CBI                  │
├─────────── AI GOVERNANCE FIREWALL ──────────────────────────────┤
│ Layer 1  INTEL                                                  │
│  Existing scraper · Raw-material price feeds · Approved         │
│  internal corpus  (Copilot-only — never external LLM)           │
└─────────────────────────────────────────────────────────────────┘
```

**The hard rule:** internal Adisseo proprietary docs stay inside Microsoft Copilot. Public + scraped + already-published content can flow into external LLMs. The split happens at exactly the Layer 1 ↔ Layer 2 seam.

---

## What's IN the May 7 demo

1. **Stakeholder Influence Map** — fully interactive, draggable, seeded with the 14 stakeholders from your screenshot. Bubble size = current influence, dotted ring = future trend, arrows = who-influences-whom. You drag/redraw it live in the meeting.
2. **One end-to-end flow per species manager** (one deliverable each, to prove the platform serves all four out of one stack):
   - Aileen / Aqua → 1-page leaflet (Indonesian + English) from a scraped news topic
   - Vish / Poultry → AGP-Free-style emailer with attachment
   - Antoine / Ruminants → Manga-style 2-page brochure (Japanese)
   - Claire / Swine → 45-second TikTok-format video script + storyboard
3. **News → Strategy bridge** — pick a scraped competitor article, hit one button, system returns: which CBI it maps to, which persona to target, three deliverable formats ready to publish.
4. **Side-quest:** "top-5 competitors by published-news count" card on the existing scraper analytics page.

---

## What's OUT (V2)

- Full account-based adaptation engine (Claire's top-10/country with distributor portfolio filter)
- Voice cloning + KOL podcast pipeline (Vish aspiration)
- Live WeChat broadcast/webinar engine
- Raw-material price dashboard (Aileen request)
- ComfyUI brand-guardrail LoRA training (V1 uses prompt-only guardrails + Langfuse audit)
- HQ approval workflow UI (V1 logs everything to Langfuse, approval is manual)

---

## Constraints & decisions

**Hard constraints:**

- AI governance — internal docs Copilot-only
- HQ brand guardrails — every generation logged via Langfuse for audit trail
- Languages at minimum: English, Japanese, Vietnamese, Indonesian, Thai, Chinese
- Cultural register variations (koon, park, manga voice, etc.)

**Already decided:**

- APAC = pilot region
- xyflow + d3-force + pptxgenjs + react-pdf + Manim = the May 7 stack
- Supabase + pgvector = vector store (already provisioned)
- Langfuse = audit trail / governance evidence

---

## Open items (need from Ricardo by Thu Apr 30)

- Number of competitors / customers / websites for scraper running-cost proposal
- Confirmation of which species manager flow gets built first end-to-end (recommendation: **Claire/Swine — most visually impressive demo, hardest to fake**)
- HQ green-light on the carousel/video guardrail templates I'll propose
- Sophia / global team feedback (post their Apr 28 sales meeting)

---

## Timeline

| Date | Milestone |
|---|---|
| Wed Apr 29 | This scope doc with Ricardo |
| **Thu Apr 30, 9:30 AM Danny / 2:30 PM Ricardo** | **Stakeholder Map MVP demo + alignment call** |
| Tue May 5 | Chosen species-manager flow end-to-end working (news → match → deliverable) |
| **Thu May 7** | **Adisseo global team demo** |
| ~Tue May 12 | Public APAC pilot live ("two weeks" per Ricardo's own line) |
| May 14–17 | Danny in Singapore — possible in-person sync |

---

## Success metric (institutionalized from Malaysia ASF)

> Engagement tracking baseline: a "serious viewer" = >2.5 min watch time. Malaysia ASF case → 7 serious viewers → 3 customer conversions. Every deliverable AdiPlan AI ships gets measured against this funnel.

---

## What I need from you to move

Just two things:

1. **Pick the first species-manager flow** for May 7 (my pick: Claire/Swine)
2. **Send the scraper-load numbers** (competitors / customers / websites) so I can size the running-cost proposal

Everything else I can take from here.
