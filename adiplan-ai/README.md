# AdiPlan AI

News &rarr; Strategy &rarr; Deliverable bridge for Adisseo APAC.

Pilot for Ricardo Communod. Demoing to Adisseo global team **Thu May 7, 2026**.

## Status

- [x] Module 01 — Stakeholder Influence Map (xyflow + d3-force, 14 seeded stakeholders)
- [ ] Module 02 — CBI / CSF Ladder
- [ ] Module 03 — Enterprise Personas
- [ ] Module 04 — Total Value Solution
- [ ] Module 05 — Billboard Campaign
- [ ] News &rarr; Strategy bridge (RAG)
- [ ] Content Studio (Aqua / Poultry / Ruminants / Swine)

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 &rarr; click into the Stakeholder Map module.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- @xyflow/react (interactive node-edge canvas)
- d3-force (influence-bubble physics)
- Tailwind CSS

See `../repos.md` for the full repo / dependency reference.
See `../mvp-scope.md` for the May 7 pilot scope.
See `../context.md` for the full project context.

## Architecture seam (AI governance)

Internal Adisseo proprietary docs &rarr; **Microsoft Copilot only**.
Public + scraped + already-published content &rarr; external LLMs OK.
The split is enforced between Layer 1 (Intel) and Layer 2 (Synthesis/RAG).

## Stakeholder Map controls

- Drag any bubble &mdash; positions persist for the session
- Filter by persona (top right dropdown)
- Re-run layout (force simulation reseeds)
- Bubble size = current influence (small / medium / large)
- Dotted outer ring = growing future influence
- Dotted inner ring = shrinking future influence
- Arrow = who-influences-whom (power flow, not org chart)
- Color = persona cluster (5 personas seeded)
