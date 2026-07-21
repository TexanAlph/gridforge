# GridForge

> **Train for the work that cannot go dark.**

GridForge is a free, keyless training simulator for the mission-critical electrical, power, and cooling jobs behind AI data centers. Learners practice realistic branching decisions with a seasoned critical-facilities mentor—without an account, an API key, a backend, or a runtime network call.

## Why this exists

AI infrastructure depends on physical systems and the skilled people who build and operate them. OpenAI projected that its July 2025 4.5 GW Stargate expansion with Oracle would create more than 100,000 U.S. construction and operations jobs, including highly specialized electricians. In a 2025 Senate hearing, Microsoft President Brad Smith described a national shortage of skilled electricians and pipefitters as a major barrier to data-center expansion, and estimated a need to recruit and train 500,000 new electricians over the coming decade. Oracle likewise describes AI data centers as advanced campuses relying on sophisticated electrical, cooling, security, and round-the-clock operations work.

- [OpenAI: 4.5 GW Stargate partnership and workforce impact](https://openai.com/index/stargate-advances-with-partnership-with-oracle/)
- [U.S. Senate hearing transcript: AI infrastructure workforce](https://www.congress.gov/119/chrg/CHRG-119shrg61426/CHRG-119shrg61426.pdf)
- [Oracle: skilled jobs behind AI data centers](https://www.oracle.com/news/announcement/blog/ai-data-centers-create-local-jobs-2026-03-09/)

GridForge addresses a training gap: new facilities workers need repeated practice making safe, uptime-aware decisions before they ever work inside a live critical environment.

## The experience

- **15 baked-in missions** across three tracks: Data Center Electrical, Power & UPS Systems, and Cooling & Liquid Cooling.
- **Three levels**: Foundation, Intermediate, and Advanced.
- **Branching decision trees** with realistic consequences, recovery paths, mentor teaching, and debriefs.
- **Animated native SVG diagrams** for power paths, UPS chains, busways, cooling loops, containment, generators, and CDUs.
- **Competency matrix** that animates diagnosis, systems knowledge, safety/LOTO, uptime judgment, procedure discipline, and communication as decisions land.
- **Demo-ready launch path**: one click opens the flagship CRAC airflow / thermal-risk mission.
- **Offline-ready learner state**: a local service worker caches the static application after the first visit; competency progress is saved only in the browser’s local storage.

## Keyless architecture

GridForge is deliberately not a live chatbot.

1. **Build time:** GPT-5.6 authored the scenario library, mentor dialogue, outcomes, debriefs, and diagram requirements.
2. **Bundle time:** Codex built the React experience and packages all authored content in static TypeScript modules.
3. **Run time:** the app reads local content only. It calls no LLM, API, database, analytics provider, font CDN, or external asset host; its local service worker caches the app shell for offline reuse.

This makes the product free to host, fast, reliable, privacy-friendly, and honest about where AI is used: AI authors the training material ahead of time; it is not presented as live AI guidance.

## Safety note

GridForge is a simulated judgment exercise, **not operating instruction**. It never substitutes for qualification, certification, local codes, authorized work planning, lockout/tagout, energized-work requirements, or actual site procedures. Scenarios intentionally reinforce escalation, change management, and respect for work boundaries.

## Local development

```bash
npm install
npm run dev
```

Create a production bundle and verify its no-runtime-call contract:

```bash
npm run build
npm run verify:keyless
```

## Project map

| Path | Purpose |
| --- | --- |
| `src/data/sampleScenario.ts` | Deep flagship CRAC thermal-risk demo mission |
| `src/data/scenarioLibrary.ts` | Static 15-mission library, tracks, and competency labels |
| `src/components/TechnicalDiagram.tsx` | Native animated SVG technical diagrams |
| `src/components/SkillRadar.tsx` | Live competency radar and skill labels |
| `scripts/verify-keyless.mjs` | Guardrail against runtime API/external-resource use |
| `BUILD_LOG.md` | Transparent record of AI-authored content and Codex implementation |

## Credits

- **GPT-5.6:** scenario authorship, mentor voice, branching consequences, teaching patterns, and safety framing at build time.
- **Codex:** product architecture, content model, React implementation, SVG diagrams, interactions, responsive styling, quality checks, and deployment.

## License

MIT. See `LICENSE`.
