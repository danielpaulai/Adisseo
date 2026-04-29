# AdiPlan AI — Visual Plan

> Open this in Cursor with **Cmd+Shift+V** (or any Markdown previewer) to render the diagrams.

---

## 1. The full system at a glance — five layers

```mermaid
flowchart TB
    subgraph L1["Layer 1 — INTEL"]
        A1[Existing scraper<br/>83 competitors, 125+ sites]
        A2[Raw-material price feeds<br/>pangasius, shrimp, fishmeal, methionine]
        A3[Approved internal corpus<br/>Copilot-only, never external LLM]
    end

    subgraph L2["Layer 2 — SYNTHESIS / RAG"]
        B1[News ↔ Strategy matcher<br/>article → CBI → persona → CSF]
    end

    subgraph L3["Layer 3 — STRATEGIC FRAME (AdiPlan engine)"]
        C1[Stakeholder Map]
        C2[CBI &amp; CSF Ladder]
        C3[Personas]
        C4[Total Value Solution]
        C5[Billboard Campaign]
    end

    subgraph L4["Layer 4 — CONTENT STUDIO"]
        D1[Aqua leaflets &amp; explainer videos]
        D2[Poultry emailers &amp; carousels]
        D3[Ruminants Manga &amp; bilingual newsletter]
        D4[Swine TikTok / WeChat shorts]
        DG[[Brand-Guardrail Pack<br/>HQ-approved style]]
    end

    subgraph L5["Layer 5 — ACTIVATION"]
        E1[Account-Adaptation Engine<br/>top-10 customers / country]
        E2[Sales Weekly Dashboard]
        E3[Engagement Tracker<br/>Malaysia-ASF model]
        E4[Publishing rails<br/>LinkedIn · WeChat · TikTok · magazines]
    end

    L1 --> L2 --> L3 --> L4 --> L5
    DG -.enforces.-> D1 & D2 & D3 & D4

    style L1 fill:#e3f2fd,stroke:#1565c0
    style L2 fill:#fff3e0,stroke:#e65100
    style L3 fill:#f3e5f5,stroke:#6a1b9a
    style L4 fill:#e8f5e9,stroke:#2e7d32
    style L5 fill:#fce4ec,stroke:#ad1457
```

---

## 2. AI governance — where the seam runs

```mermaid
flowchart LR
    subgraph internal["INTERNAL DATA (proprietary)"]
        direction TB
        I1[Adisseo brochures]
        I2[Sales decks]
        I3[Trial data]
        I4[Customer accounts]
    end

    subgraph external["PUBLIC / ALREADY-PUBLISHED"]
        direction TB
        X1[Scraped competitor news]
        X2[Public papers &amp; magazines]
        X3[Adisseo public website content]
        X4[Raw-material price reports]
    end

    CP[Microsoft Copilot<br/>tenant-bound]
    LLM[External LLMs<br/>OpenAI · Anthropic · etc.]

    internal -- ALLOWED --> CP
    internal -. BLOCKED .-x LLM
    external -- ALLOWED --> LLM
    external -- ALLOWED --> CP

    CP --> Out[AdiPlan AI<br/>Synthesis Layer]
    LLM --> Out

    style internal fill:#ffebee,stroke:#c62828
    style external fill:#e8f5e9,stroke:#2e7d32
    style Out fill:#e3f2fd,stroke:#1565c0
```

---

## 3. AdiPlan framework — the strategic spine

```mermaid
flowchart LR
    subgraph A["ASSESSING"]
        A1[Stakeholder Map]
        A2[CBI &amp; CSF Ladder]
        A3[We Wish We Knew]
    end

    subgraph C["CREATING"]
        C1[Enterprise Personas]
        C2[Total Value Solution]
        C3[Billboard Campaign]
    end

    subgraph E["EXECUTING"]
        E1[Plan on a Page]
        E2[KPIs<br/>Leading · Progress · Lagging]
    end

    A1 --> A2 --> C1 --> C2 --> C3 --> E1 --> E2
    A3 -.feeds.-> C1
    A3 -.feeds.-> C2

    style A fill:#e3f2fd,stroke:#1565c0
    style C fill:#f3e5f5,stroke:#6a1b9a
    style E fill:#fff3e0,stroke:#e65100
```

---

## 4. Per-species personalization — one platform, four flavors

```mermaid
flowchart TB
    Hub((AdiPlan AI<br/>Content Studio))

    subgraph Aileen["AILEEN — Aqua"]
        AQ1[1–2 page leaflets<br/>ID · VN · TH]
        AQ2[Drawing-style explainer videos<br/>parasite cycles, lateral-flow]
        AQ3[Monthly Aqua-EPAC newsletter]
        AQ4[Raw-material price dashboard]
    end

    subgraph Vish["VISH — Poultry"]
        PO1[Campaign emailers<br/>AGP-Free template]
        PO2[LinkedIn carousels<br/>HQ-guardrail-locked]
        PO3[Sales engagement dashboard]
        PO4[KOL podcast]
    end

    subgraph Antoine["ANTOINE — Ruminants"]
        RU1[Bilingual newsletter<br/>JP + EN]
        RU2[Manga-style brochures]
        RU3[90-sec pasture-system videos<br/>NZ + AU]
        RU4[MyCommand-personality 2-pager]
    end

    subgraph Claire["CLAIRE — Swine"]
        SW1[<60s shorts<br/>TikTok · WeChat · Instagram]
        SW2[WeChat live-broadcast / webinar]
        SW3[ASF / PRRS / Tasvax video kit<br/>4 languages]
        SW4[Account-adapted decks<br/>top-10 / country]
    end

    Hub --> Aileen
    Hub --> Vish
    Hub --> Antoine
    Hub --> Claire

    style Hub fill:#1565c0,color:#fff,stroke:#0d47a1
    style Aileen fill:#e0f7fa,stroke:#006064
    style Vish fill:#fff8e1,stroke:#f57f17
    style Antoine fill:#fce4ec,stroke:#880e4f
    style Claire fill:#f1f8e9,stroke:#33691e
```

---

## 5. The end-to-end flow — scraped article to published deliverable

```mermaid
sequenceDiagram
    autonumber
    participant Scraper as Scraper<br/>(Layer 1)
    participant RAG as Synthesis<br/>(Layer 2)
    participant Frame as AdiPlan Frame<br/>(Layer 3)
    participant Studio as Content Studio<br/>(Layer 4)
    participant Sales as Sales / Customer<br/>(Layer 5)

    Scraper->>RAG: New competitor article detected
    RAG->>Frame: Match to CBI + persona + country
    Frame-->>RAG: "This maps to Persona X / CBI Y"
    RAG->>Studio: Generate 3 deliverable formats
    Note over Studio: Brand guardrail<br/>+ language register<br/>+ species manager voice
    Studio->>Studio: Draft leaflet · emailer · video script
    Studio-->>Frame: HQ guardrail audit log
    Studio->>Sales: Publish to channel<br/>(WeChat · LinkedIn · email · magazine)
    Sales-->>RAG: Engagement metrics<br/>(Malaysia-ASF model)
```

---

## 6. Stakeholder Influence Map — the May 7 hero demo

```mermaid
flowchart TB
    subgraph Large["LARGE current influence"]
        S1((Nutrition<br/>Managers<br/>↑ growing))
        S2((Integrator<br/>Tech Mgr<br/>= stable))
    end

    subgraph Medium["MEDIUM current influence"]
        S3((Corp Nutrition<br/>Directors<br/>↓ shrinking))
        S4((Procurement<br/>Leads<br/>= stable))
        S5((Regulatory<br/>Affairs<br/>↑ growing))
        S6((Vets Clinic<br/>&amp; Field<br/>↓ shrinking))
        S7((Premixer<br/>Formulator<br/>↑ growing))
        S8((Vet KOLs /<br/>Consultants<br/>↓ shrinking))
    end

    subgraph Small["SMALL current influence"]
        S9((Sustainability<br/>CSR Officer<br/>↑ growing))
        S10((Farm<br/>Managers<br/>= stable))
        S11((Feed Mill<br/>Operators<br/>= stable))
        S12((University /<br/>Research<br/>↓ shrinking))
        S13((Distributor<br/>BD Lead<br/>↓ shrinking))
        S14((Financial<br/>Controllers<br/>= stable))
        S15((NGO / Trade<br/>Policy Lead<br/>= stable))
    end

    S8 --> S1
    S5 --> S3
    S5 --> S2
    S7 --> S2
    S2 --> S11
    S1 --> S10
    S6 --> S10
    S12 --> S8

    style S1 fill:#4caf50,color:#fff
    style S2 fill:#4caf50,color:#fff
    style S5 fill:#8bc34a
    style S7 fill:#8bc34a
    style S9 fill:#8bc34a
    style S3 fill:#ffb74d
    style S6 fill:#ffb74d
    style S8 fill:#ffb74d
    style S12 fill:#ffb74d
    style S13 fill:#ffb74d
```

> Live version in the platform: nodes are draggable, sized to current influence, ringed with dotted future-influence circles, color-coded by persona cluster. This is the killer Thursday-demo asset.

---

## 7. May 7 pilot — what actually ships

```mermaid
gantt
    title APAC Pilot — May 7 demo timeline
    dateFormat YYYY-MM-DD
    axisFormat %b %d

    section Scope alignment
    Send Ricardo MVP scope doc       :done,    s1, 2026-04-29, 1d
    Thursday call — align on flow    :active,  s2, 2026-04-30, 1d

    section Stakeholder Map (hero)
    xyflow + d3-force scaffold       :         m1, 2026-04-30, 2d
    14-stakeholder seed dataset      :         m2, 2026-05-01, 1d
    Drag/drop + future-ring UX       :         m3, 2026-05-02, 2d

    section Per-species flows
    Pick lead species manager        :crit,    p0, 2026-05-01, 1d
    News → CBI → deliverable bridge  :         p1, 2026-05-02, 3d
    First end-to-end deliverable     :         p2, 2026-05-05, 2d

    section Scraper analytics tweak
    Top-5 competitors by post count  :         a1, 2026-05-04, 2d

    section Demo
    Internal dry-run with Ricardo    :         d1, 2026-05-06, 1d
    Global team presentation         :milestone, d2, 2026-05-07, 0d
```

---

## 8. GitHub stack — install priority for May 7

```mermaid
flowchart LR
    subgraph P1["Priority 1 — needed for May 7 demo"]
        R1[xyflow / xyflow]
        R2[d3 / d3-force]
        R3[gka / pptxgenjs]
        R4[vercel / ai]
    end

    subgraph P2["Priority 2 — first species flow"]
        R5[microsoft / markitdown]
        R6[run-llama / llama_index]
        R7[pgvector / pgvector]
        R8[diegomura / react-pdf]
    end

    subgraph P3["Priority 3 — Content Studio breadth"]
        R9[3b1b / manim]
        R10[remotion-dev / remotion]
        R11[comfyanonymous / ComfyUI]
        R12[coqui-ai / TTS]
    end

    subgraph P4["Priority 4 — observability + scale"]
        R13[langfuse / langfuse]
        R14[mendableai / firecrawl]
        R15[tremorlabs / tremor]
    end

    P1 --> P2 --> P3 --> P4

    style P1 fill:#c8e6c9,stroke:#2e7d32
    style P2 fill:#fff9c4,stroke:#f57f17
    style P3 fill:#ffe0b2,stroke:#e65100
    style P4 fill:#e1bee7,stroke:#6a1b9a
```

---

## Cross-references

- Full plan + transcripts of the 4 species-manager calls: [context.md](context.md)
- Source documents: this folder
- Extracted transcript text: `/tmp/adisseo_extract/`
