# GridForge — Devpost Submission Kit

## Project details

- **Name:** GridForge
- **Tagline:** A free, keyless AI-authored simulator that prepares new workers for the critical data-center careers behind the AI boom.
- **Category:** Education
- **Live app:** https://do-roan.vercel.app
- **Source:** https://github.com/TexanAlph/gridforge
- **Built with:** GPT-5.6, Codex, React, TypeScript, Vite, native SVG, and Vercel

## Paste-ready project description

AI is creating a new kind of workforce bottleneck: the electrical, power, and cooling technicians who keep AI data centers safe, online, and scalable. GridForge gives aspiring critical-facilities workers a free place to practice the judgment those roles demand before they ever enter a live facility.

Instead of a chatbot or a static course, GridForge is a keyless interactive simulator. Learners begin with a plain-English primer, then work through branching job-site scenarios across data-center electrical systems, power and UPS systems, and liquid cooling. Each decision reveals a realistic consequence and a seasoned mentor’s explanation. Incorrect choices are explicit and safe: learners must choose the recommended response before advancing, so the product teaches the operational judgment behind safety and uptime rather than simply scoring a guess.

GPT-5.6 authored the 15-lesson training library at build time: the mentor voice, scenarios, branching outcomes, technical teaching, debriefs, and safety framing. Codex built the React simulator, reusable scenario engine, responsive product experience, and native animated SVG diagrams. The resulting app ships all of that learning content as static TypeScript data. It requires no account, API key, backend, or runtime AI/data call, so it is free, reliable, and usable offline after the first visit.

To try it, open the live app, choose **Learn the basics for Lesson 1**, complete the short primer, and start the GPU-rack cooling alert lesson. The README includes a judge quick-start, a precise keyless architecture explanation, and the project’s build log.

## Judge testing instructions

1. Open https://do-roan.vercel.app.
2. Select **Learn the basics for Lesson 1** and complete the primer.
3. Choose an option, select **Lock in & see feedback**, and read the mentor response.
4. Choose the recommended response to continue through the lesson and reach the debrief.
5. Open **All lessons** to explore the 15 static simulations across three career tracks.

No account, API key, or test credentials are required.

## Video outline (2 minutes 35 seconds)

| Time | Show | Narration beat |
| --- | --- | --- |
| 0:00–0:15 | Hero and data-center diagram | AI infrastructure needs skilled electrical, power, and cooling workers; GridForge makes early judgment practice free and accessible. |
| 0:15–0:35 | Click the Lesson 1 CTA and show primer | A brand-new learner gets terms, safety boundaries, and a goal before being asked to decide anything. |
| 0:35–1:25 | Start the lesson, choose a wrong response, then retry | The simulator makes correct versus incorrect unmissable and requires the learner to recover with the recommended decision. |
| 1:25–1:50 | Advance through a correct response and show animated technical diagram | Each step pairs a realistic consequence with mentor teaching and a visual explanation of the system. |
| 1:50–2:10 | Open All lessons and switch tracks | The shipped library contains 15 scenarios across electrical, UPS/power, and liquid cooling, for beginner through advanced learners. |
| 2:10–2:35 | Return to architecture section and debrief | GPT-5.6 authored the lesson library at build time; Codex built the product. GridForge makes the experience keyless, reliable, and free to run. |

## Remaining Devpost fields

- **Public YouTube video URL:** required; upload the finished under-three-minute demo.
- **Submitter type and country of residence:** enter your legal details exactly.
- **`/feedback` Codex Session ID:** retrieve it from the Codex session where the core build occurred.
