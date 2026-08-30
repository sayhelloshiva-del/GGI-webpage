# GGS / 27 — The Global Graduate Summit 2027

Launch site for **The Global Graduate Summit**, a GGI event: first edition, London,
6–7 April 2027. 500 Indian students and graduates, 15+ countries, six tracks, two
days, one declaration.

---

## Quick start

Node 20.9+ required.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. **No environment variables are needed** — the site
builds and every feature works without an API key. To enable the AI half of the
Track Matcher, copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY`.

## What the AI feature does

The **Track Matcher** allocates a delegate to one of the summit's six tracks from
three questions.

Answers are scored locally first, by a deterministic weighted model
(`lib/track-scoring.ts`) that always produces the same allocation for the same
answers. That ranking is then handed to Claude, which confirms the top track — or
overrides it with a reason — and writes a sentence or two addressed to the
delegate. Grounding the model in the local ranking is what keeps the AI and
non-AI results consistent with each other.

The model is an enhancement, not a dependency.

## How it behaves when the model fails

Every failure path resolves to a real allocation. There is no blank screen, no
console-only error, and the API always answers `200` with a usable match.

| Failure | What the user sees |
|---|---|
| No API key set | **AI currently offline** — matched by the summit's track rules |
| Provider down or key rejected | as above |
| Over the 9s deadline | **The AI took too long** — matched by local scoring instead |
| Malformed or off-schema output | "The AI sent back something we couldn't use" |
| Model declines | "The AI declined to answer" |
| Request never returns at all | The browser scores locally itself |

Three independent layers have to fail before the user loses the feature: the
server falls back to deterministic scoring, the browser falls back again if the
request never returns, and the UI still has a designed `ERROR` state with a retry.
Model output is never trusted — it is re-validated with Zod and the result is
rebuilt from `data/tracks.ts`, so the model cannot invent a track.

Sections 5–9 below cover the architecture, the response schema and each failure
path in detail, including how to reproduce them by hand.

---

## 1. Project purpose

The site has one job: **turn an Instagram visitor into a delegate applicant.**

Almost all traffic arrives on a phone, so mobile is the primary design target and
desktop is the enhancement — not the other way round. Every section funnels to a
single conversion point (`#apply`), reinforced by a sticky mobile CTA that gets out
of the way when the application section is on screen.

The creative frame is **the floor is yours**: an event you take part in rather than
watch. The visual language borrows from summit credentials, delegate allocations,
track IDs and briefing documents — 1px rules, registration ticks, condensed
uppercase display type, and small tracked-out metadata, on a 70 / 20 / 10 split of
neutral ink and warm paper, media, and GGI orange.

### Section order

| # | Section | Tone | Component |
|---|---------|------|-----------|
| — | Sticky navigation | ink | `components/navigation.tsx` |
| — | Hero + stats strip | ink | `components/hero.tsx` |
| — | Stats story | ink | `components/stats.tsx` |
| 01 | What this is (six actions) | paper | `components/intro.tsx` |
| 02 | The six tracks | ink | `components/tracks.tsx` |
| 03 | AI Track Matcher | ink | `components/track-matcher.tsx` |
| 04 | Programme | ink | `components/programme.tsx` |
| 05 | People (placeholder) | ink | `components/speakers.tsx` |
| — | The Declaration | paper | `components/declaration.tsx` |
| — | Closing night | ink | `components/closing-night.tsx` |
| 06 | How to apply | orange | `components/application.tsx` |
| 07 | FAQ | ink | `components/faq.tsx` |
| 08 | Partners (placeholder) | ink | `components/partners.tsx` |
| — | Final CTA + footer | ink | `components/footer.tsx` |

---

## 2. Technology stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | Server components by default, tiny client bundle |
| Language | TypeScript, `strict` + `noUncheckedIndexedAccess` | |
| Styling | Plain CSS — design tokens in `app/globals.css`, CSS Modules per component | No utility-class framework, no runtime CSS-in-JS, no extra bytes |
| Fonts | `next/font/google` — Barlow Condensed (700/800/900), Inter (400/500/600) | Self-hosted at build time, no layout shift, no third-party request |
| Validation | Zod | Same schemas guard the request, the model output, and the API response |
| AI | `@anthropic-ai/sdk` (Claude) | Optional — see §5 |
| Motion | CSS transitions driven by `IntersectionObserver` | No animation library |

There is no icon library, no UI kit and no animation runtime. Every mark on the
page — plus/minus signs, registration ticks, the timeline spine, the declaration
signatures — is CSS or inline SVG.

### Repository layout

```
app/
  layout.tsx              fonts, metadata, viewport
  page.tsx                section composition
  globals.css             tokens, tone contexts, type + motion primitives
  api/track-match/route.ts
components/               one component + one CSS module each
data/                     tracks, programme, faq, matcher questions, event facts
lib/
  ai.ts                   Claude call, error classification
  schemas.ts              Zod schemas (request, model output, API response)
  track-scoring.ts        deterministic matcher — runs on server and client
```

---

## 3. Local installation

Requires Node 20.9+ (developed on Node 24).

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>.

| Script | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (flat config, `eslint-config-next`) |
| `npm run typecheck` | `tsc --noEmit` |

---

## 4. Environment variables

Copy `.env.example` to `.env.local`. **Every variable is optional** — the site
builds, renders and converts without any of them.

| Variable | Default | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | *(unset)* | Enables the AI half of the Track Matcher. Unset ⇒ deterministic scoring, with the offline state shown to the user. |
| `ANTHROPIC_MODEL` | `claude-opus-5` | Model id. |
| `TRACK_MATCH_TIMEOUT_MS` | `9000` | Server-side deadline for the model call. |
| `NEXT_PUBLIC_SITE_URL` | `https://summit.example.org` | Used for `metadataBase` / Open Graph. |

The key is read only inside `lib/ai.ts`, which is marked `server-only`. It is never
bundled for the browser.

---

## 5. AI Track Matcher architecture

Three questions, six tracks, one allocation. The feature is deliberately built so
that **the model is an enhancement, not a dependency.**

```
browser                      server                          provider
───────                      ──────                          ────────
answers ──POST /api/track-match──▶ validate request (Zod)
                                   │
                                   ├─ no API key ────────────▶ (skipped)
                                   │                            │
                                   ├─ matchTrackWithAi() ─────▶ Claude
                                   │     timeout 9s              │
                                   │     ◀── JSON ────────────────┘
                                   │     re-validate (Zod)
                                   │     rebuild from data/tracks
                                   │
                                   └─ on ANY failure ─▶ matchLocally()
                                   │
      ◀── 200 { …match, source, fallbackReason? } ──┘
      │
      └─ if the request itself never returns: matchLocally() in the browser
```

Three independent layers have to fail before the user sees nothing useful — and
even then the UI has a designed `ERROR` state with a retry.

### Deterministic scoring — `lib/track-scoring.ts`

Each option in `data/matcher.ts` carries its own weights across the six tracks
(Q1 weighted ~3, Q2 ~2, Q3 ~0.9 with secondary signals). Scoring sums the weights,
ranks the tracks, and resolves ties by track number so the same answers always
produce the same allocation. Confidence combines the winner's share of available
points with its margin over second place, clamped to 52–94 so it never reads as
certainty or as a coin toss.

The module imports nothing but data, so it runs identically on the server and in
the browser — the client can fall back locally even if the network never answers.

### What the model is actually asked

The prompt hands Claude the six tracks, the delegate's three answers, and the
deterministic ranking, and asks it to confirm the top track — or override it with
a reason — and write one or two sentences addressed to the delegate. Grounding the
call in the local ranking is what keeps AI and non-AI results consistent.

The request uses structured outputs (`output_config.format` with
`zodOutputFormat`) at `effort: 'low'`, since this is a small classification.

---

## 6. Expected AI response schema

```json
{
  "trackId": "02",
  "trackName": "AI and the Future of Work",
  "confidence": 82,
  "reason": "…"
}
```

Defined once, in `lib/schemas.ts`:

```ts
export const TrackMatchSchema = z.object({
  trackId: z.enum(TRACK_IDS),          // '01'…'06', from data/tracks.ts
  trackName: z.string().min(1).max(120),
  confidence: z.number().min(0).max(100),
  reason: z.string().min(1).max(600),
});
```

The API adds `source: 'ai' | 'local'` and, when local, a `fallbackReason` of
`AI_OFFLINE | AI_TIMEOUT | AI_INVALID | AI_REFUSED | AI_ERROR`.

---

## 7. Malformed response handling

Raw model output is never trusted, on three levels:

1. The request is made with a JSON-schema output format derived from the Zod schema.
2. The parsed result is **re-validated** with the same schema — the SDK's word is
   not taken for it.
3. The returned record is **rebuilt from `data/tracks.ts`** using only the validated
   `trackId`. The model cannot introduce a track name, and `confidence` is clamped
   to 0–100 and rounded.

A `trackId` outside the enum, a missing field, a wrong type, a `stop_reason` of
`refusal`, or unparseable content all raise `AiFallbackError` and hand over to local
scoring. The browser then validates the API's own response a fourth time before
rendering it.

---

## 8. Timeout behaviour

| Layer | Deadline | Result |
|---|---|---|
| Server → provider | `TRACK_MATCH_TIMEOUT_MS`, default 9s | `AI_TIMEOUT` → local scoring, HTTP 200 |
| Browser → API | 14s (`CLIENT_TIMEOUT_MS`) | `AbortController` fires → local scoring in the browser |
| Browser UI | 4s (`SLOW_AFTER_MS`) | State moves `SUBMITTING` → `SLOW` |

At four seconds the panel says **"STILL WORKING. THE MODEL IS TAKING LONGER THAN
USUAL."** On timeout it says **"THE AI TOOK TOO LONG."** followed by *"We've matched
you using our local track scoring instead."* — and the allocation is already on
screen underneath.

---

## 9. Offline / fallback behaviour

The matcher is a small state machine with seven explicit, individually designed
states:

`IDLE → QUESTION → SUBMITTING → SLOW → SUCCESS | FALLBACK | ERROR`

Every failure resolves to a **result**, never a blank screen or a console error:

| Situation | `fallbackReason` | What the user reads |
|---|---|---|
| No API key configured | `AI_OFFLINE` | **AI CURRENTLY OFFLINE** — "No problem — we've matched your answers using the summit's track rules." |
| Provider unreachable / key rejected | `AI_OFFLINE` | as above |
| Model exceeded the deadline | `AI_TIMEOUT` | **THE AI TOOK TOO LONG.** — "We've matched you using our local track scoring instead." |
| Malformed or off-schema output | `AI_INVALID` | "The AI sent back something we couldn't use." |
| Model declined | `AI_REFUSED` | "The AI declined to answer." |
| Anything else | `AI_ERROR` | "The AI is having a moment." |
| Local scoring itself fails | — | `ERROR` state with a retry and a link to the six tracks |

The API always answers `200` with a usable match; a `400` is returned only for a
malformed request body or answers that are not valid option ids.

### Testing the failure states by hand

```bash
# 1. Offline — the default with no key
npm run dev

# 2. Provider failure (401 from the API)
printf 'ANTHROPIC_API_KEY=sk-ant-not-a-real-key\n' > .env.local && npm run dev

# 3. Timeout — deadline of 1ms
printf 'ANTHROPIC_API_KEY=sk-ant-not-a-real-key\nTRACK_MATCH_TIMEOUT_MS=1\n' > .env.local && npm run dev
```

Delete `.env.local` afterwards. All three were exercised during development, along
with a 400 on invalid answers and on unparseable JSON.

---

## 10. Deployment

Deploys as a standard Next.js app; Vercel needs no configuration.

```bash
npm run build && npm start
```

- The page is statically prerendered; `/api/track-match` is server-rendered on
  demand (`dynamic = 'force-dynamic'`, `Cache-Control: no-store`).
- The route runs on the Node runtime because it uses the Anthropic SDK.
- Set `ANTHROPIC_API_KEY` and `NEXT_PUBLIC_SITE_URL` in the host's environment
  settings. Without the key the deployment still works, in local-scoring mode.

---

## 11. Accessibility

- Semantic landmarks (`header` / `main` / `footer` / `nav`), one `h1`, and an
  unbroken heading order — number-led sections carry visually-hidden headings.
- Skip link to the content as the first focusable element.
- Accordions (tracks, FAQ) are real `button`s with `aria-expanded` /
  `aria-controls`, and their panels are `role="region"` labelled by their trigger.
  Collapsed panels are `visibility: hidden`, so they leave both the tab order and
  the accessibility tree.
- **No hover-only functionality.** Desktop hover-to-expand on the track list is
  additive; click, `Enter`/`Space` and focus all do the same thing, and hover is
  only enabled behind `(hover: hover) and (pointer: fine)`.
- The mobile menu is a standard disclosure: focus stays on the toggle (the panel
  follows it in DOM order, so `Tab` walks straight in), `Escape` closes it and
  returns focus to the toggle, and body scroll is locked while it is open.
- The matcher's stage is an `aria-live="polite"` region; focus moves to each new
  question and to the result when it arrives.
- Visible `:focus-visible` outlines in signal orange throughout; all interactive
  targets are at least 44px tall.
- Contrast: ink/paper pairs clear AA comfortably. The orange section deliberately
  uses **ink type on the gradient** — white on `#FF8500` would not pass.
- `prefers-reduced-motion: reduce` disables every reveal, the parallax, and the
  orange wipe, and shows all content in its final state.

---

## 12. Performance considerations

- Server components by default. Only six components ship client JS: navigation,
  tracks, track card, track matcher, FAQ, reveal, parallax, mobile CTA.
- The mobile CTA is `next/dynamic`-imported — nothing above the fold needs it.
- Fonts are self-hosted by `next/font` with `display: swap` and only the weights
  actually used.
- Animation is limited to four patterns — fade+translate, mask reveal, numeral
  scale, orange wipe — and only ever animates `opacity`, `transform` and
  `clip-path`. There are no looping background animations.
- Each `Reveal` disconnects its observer the moment it fires. Scroll listeners are
  `{ passive: true }` and rAF-throttled.
- Parallax is opted into by capability (`min-width: 1024px`, `hover: hover`,
  `pointer: fine`, no reduced-motion) — phones never attach the listener.
- Media slots are `next/image` with `sizes` set, AVIF/WebP enabled in
  `next.config.mjs`.

### Assets still to drop in

| Slot | Where | Note |
|---|---|---|
| GGI logo | `components/logo.tsx` | **The logo is not redesigned here.** The component renders a neutral typographic stand-in and carries swap-in instructions; it is the only place the mark appears. |
| Hero footage | `components/hero.tsx` → `MediaSlot` | Pass `src` to turn the placeholder into a real image; for video, swap the `MediaSlot` for a `<video>` with a poster frame. |
| Closing-night photography | `components/closing-night.tsx` | as above |

`MediaSlot` renders a labelled, hairline-framed placeholder until a `src` is
passed, so an empty slot reads as a production marker rather than a broken image.

### Placeholder copy — still to confirm

Everything below is marked as placeholder in the UI itself:

- Applications close **30 November 2026** (`data/summit.ts`).
- The apply link points at `SUMMIT.applyFormUrl` — replace with the live form.
- Programme clock times (`data/programme.ts`).
- FAQ cost answer: *"Delegate places are [free / cost X]"* (`data/faq.ts`).
- Speaker slots are categories, not people. No names are invented anywhere.
- Partner logos are six empty, labelled slots.

---

## 13. Use of AI tools during development

This site was built with **Claude Code** (Claude Opus 5) driving the
implementation end to end: scaffolding, component and CSS authoring, the API route,
and the browser-based verification pass.

What that meant in practice:

- **Design decisions were made explicitly, not sampled.** The tone system, the
  70/20/10 colour split, the credential motif and the four-pattern motion system
  were fixed up front and then applied consistently.
- **Everything was verified in a real browser, not assumed.** Layouts were checked
  at 375, 390, 430, and 1440px for horizontal overflow and touch-target size;
  accordions and the matcher were driven through their states; the API was
  exercised for success, invalid answers, malformed JSON, provider failure and
  timeout. Several real bugs were found and fixed this way — including a mask
  reveal that never fired because a fully clipped element reports an empty
  intersection rectangle to `IntersectionObserver`.
- **The live AI path could not be verified end to end** — no Anthropic credentials
  were available in the build environment. The request-building, error-mapping and
  fallback branches were exercised against the real API with an invalid key
  (401 → `AI_OFFLINE`) and a 1ms deadline (→ `AI_TIMEOUT`). The success branch is
  written against the documented Messages API structured-output contract, and its
  output is re-validated before use — but the first run with a real key should be
  eyeballed.
- The Claude API integration follows the current Messages API guidance for
  `claude-opus-5` (structured outputs via `output_config.format`, `effort`,
  no `budget_tokens`, no assistant prefill).

No AI-generated placeholder prose survives in the copy: every line on the page is
either from the brief or written deliberately for its slot.
