# GridForge

> **Train for the work that cannot go dark.**

GridForge is a free, keyless training simulator for the mission-critical electrical, power, and cooling jobs behind AI data centers. Learners practice realistic branching decisions with a seasoned critical-facilities mentor—without an account, an API key, a backend, or a runtime data/API call.

## Why this exists

AI infrastructure depends on physical systems and the skilled people who build and operate them. OpenAI projected that its July 2025 4.5 GW Stargate expansion with Oracle would create more than 100,000 U.S. construction and operations jobs, including highly specialized electricians. In a 2025 Senate hearing, Microsoft President Brad Smith described a national shortage of skilled electricians and pipefitters as a major barrier to data-center expansion, and estimated a need to recruit and train 500,000 new electricians over the coming decade. Oracle likewise describes AI data centers as advanced campuses relying on sophisticated electrical, cooling, security, and round-the-clock operations work.

- [OpenAI: 4.5 GW Stargate partnership and workforce impact](https://openai.com/index/stargate-advances-with-partnership-with-oracle/)
- [U.S. Senate hearing transcript: AI infrastructure workforce](https://www.congress.gov/119/chrg/CHRG-119shrg61426/CHRG-119shrg61426.pdf)
- [Oracle: skilled jobs behind AI data centers](https://www.oracle.com/news/announcement/blog/ai-data-centers-create-local-jobs-2026-03-09/)

GridForge addresses a training gap: new facilities workers need repeated practice making safe, uptime-aware decisions before they ever work inside a live critical environment.

## The experience

- **15 baked-in lessons** across three tracks: Data Center Electrical, Power & UPS Systems, and Cooling & Liquid Cooling.
- **Three learner levels**: Beginner, Intermediate, and Advanced.
- **Branching decision trees** with realistic consequences, recovery paths, mentor teaching, and debriefs.
- **Animated native SVG diagrams** for power paths, UPS chains, busways, cooling loops, containment, generators, and CDUs.
- **Beginner-first primers** that explain key terms, safety boundaries, and the lesson goal before a learner sees a decision.
- **Clear learning loop**: learners lock in one choice, see an explicit correct/incorrect explanation, and must choose the recommended response before progressing.
- **Demo-ready launch path**: one click opens the flagship GPU-rack cooling alert lesson.
- **Offline-ready app shell**: a local service worker caches the static application after the first visit.

## Keyless architecture

GridForge is deliberately not a live chatbot.

1. **Build time:** GPT-5.6 authored the scenario library, mentor dialogue, outcomes, debriefs, and diagram requirements.
2. **Bundle time:** Codex built the React experience and packages all authored content in static TypeScript modules.
3. **Run time:** the app reads local content only. It requests no LLM output, API data, database, analytics provider, font CDN, or external asset host; its local service worker caches the app shell for offline reuse.

This makes the product free to host, fast, reliable, privacy-friendly, and honest about where AI is used: AI authors the training material ahead of time; it is not presented as live AI guidance.

## Judge quick start

1. Open the live app: [do-roan.vercel.app](https://do-roan.vercel.app).
2. Select **Learn the basics for Lesson 1**.
3. Read the two-minute primer, then select **I’m ready — start Lesson 1**.
4. Choose a response, lock it in, and review the mentor’s explicit feedback.
5. If the response is incorrect, select another response; recommended responses unlock the next step and the lesson debrief.

The full source is public at [github.com/TexanAlph/gridforge](https://github.com/TexanAlph/gridforge).

## Safety note

GridForge is a simulated judgment exercise, **not operating instruction**. It never substitutes for qualification, certification, local codes, authorized work planning, lockout/tagout, energized-work requirements, or actual site procedures. Scenarios intentionally reinforce escalation, change management, and respect for work boundaries.

## Local development

```bash
npm install
npm run dev
```

Create a production bundle and verify its no-runtime API/external-resource contract:

```bash
npm run build
npm run verify:keyless
```

## Project map

| Path | Purpose |
| --- | --- |
| `src/data/sampleScenario.ts` | Deep flagship GPU-rack cooling alert lesson |
| `src/data/scenarioLibrary.ts` | Static 15-lesson library and track metadata |
| `src/components/TechnicalDiagram.tsx` | Native animated SVG technical diagrams |
| `scripts/verify-keyless.mjs` | Guardrail against runtime API/external-resource use |
| `BUILD_LOG.md` | Transparent record of AI-authored content and Codex implementation |

## Credits

- **GPT-5.6:** scenario authorship, mentor voice, branching consequences, teaching patterns, and safety framing at build time.
- **Codex:** product architecture, content model, React implementation, SVG diagrams, interactions, responsive styling, quality checks, and deployment.

## License

MIT. See `LICENSE`.
