# Full Git Commit History

`git
commit 02fa0858025c4799e0c3017911d19ac6dcc0e229
Author: Shiwa Kumar <47922830+shiva8009@users.noreply.github.com>
Date:   Sun Aug 30 16:25:58 2026 +0530

    Configure AI Track Matcher with Gemini 3.5 Flash Lite and fix hydration warning

 .env.example   | 4 ++--
 app/layout.tsx | 2 +-
 lib/ai.ts      | 2 +-
 3 files changed, 4 insertions(+), 4 deletions(-)

commit 74e2b736af4633237be488e1881dd805b30e8081
Author: Shiwa Kumar <47922830+shiva8009@users.noreply.github.com>
Date:   Sun Aug 30 16:20:40 2026 +0530

    Update default Gemini model to gemini-2.0-flash

 .env.example |  4 ++--
 README.md    |  2 +-
 lib/ai.ts    | 10 ++++++++--
 3 files changed, 11 insertions(+), 5 deletions(-)

commit de090d6609c122ae024b2c9943a0c3d5636407f2
Author: Shiwa Kumar <47922830+shiva8009@users.noreply.github.com>
Date:   Sun Aug 30 16:05:17 2026 +0530

    Log why the model call failed
    
    A provider failure in production was invisible: the fallback reason was
    logged only in development, and the reason alone ("AI_ERROR") does not
    say whether the model was wrong, the key was rejected or the quota was
    spent. Carry the provider's own status and message on AiFallbackError
    and log it in every environment.
    
    The message is stripped of anything key-shaped before it is logged. The
    first version of that redaction was wrong in two ways — it matched
    AIza[w-]+ rather than AIza[\w-]+, so a real key would have passed
    through unredacted, and /s+/g instead of /\s+/g quietly deleted every
    letter s from the output. Both fixed and tested.
    
    Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>

 app/api/track-match/route.ts |  7 ++++---
 lib/ai.ts                    | 21 ++++++++++++++++++++-
 2 files changed, 24 insertions(+), 4 deletions(-)

commit 4b141dbf3f9a5800d9e1df72db35a9d17114782a
Author: Shiwa Kumar <47922830+shiva8009@users.noreply.github.com>
Date:   Sun Aug 30 13:09:44 2026 +0530

    Move the Track Matcher to Gemini on the free tier
    
    The deployed site had no API key, so every visitor was served the
    deterministic fallback and the "AI currently offline" panel — the AI
    feature was effectively switched off in production. Gemini's free tier
    removes the reason not to set one.
    
    Only lib/ai.ts changes. The route still catches a single AiFallbackError,
    the seven UI states are provider-neutral, and the model still never
    decides anything on its own: output is re-validated with Zod and the
    record rebuilt from data/tracks.ts.
    
    Two things the SDK's type declarations get wrong, found by triggering
    them rather than reading them:
    
    - A rejected key returns 400 INVALID_ARGUMENT with API_KEY_INVALID in the
      body, not 401, and the thrown error is not an instanceof the exported
      ApiError. Classification now reads status and body directly.
    - The runtime throws APIConnectionTimeoutError, while the declarations
      name RequestTimeoutError. Matched on pattern, testing timeout before
      connection because the timeout class name contains both.
    
    Verified: no key and rejected key both give AI_OFFLINE, a 1ms deadline
    gives AI_TIMEOUT, bad option ids and malformed bodies both 400. The
    success path still needs a real key.
    
    Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>

 .env.example      |  10 +-
 README.md         |  43 +++--
 lib/ai.ts         | 111 ++++++++----
 package-lock.json | 532 ++++++++++++++++++++++++++++++++++++++++++++++--------
 package.json      |   2 +-
 5 files changed, 554 insertions(+), 144 deletions(-)

commit 86ffb44d2c647062fad8ab891ab724fd449f70b9
Author: Shiwa Kumar <47922830+shiva8009@users.noreply.github.com>
Date:   Sun Aug 30 12:53:48 2026 +0530

    Give the looping footage a pause control and poster frames
    
    Both background videos autoplayed and looped indefinitely with no way to
    stop them, which fails the requirement that motion lasting more than a
    few seconds be pausable. They also ignored prefers-reduced-motion, while
    the rest of the site honours it in nine places.
    
    Move both behind an AmbientVideo component. Playback now starts from an
    effect instead of the autoplay attribute, because the decision depends
    on prefers-reduced-motion and that is only knowable on the client —
    anyone asking for less motion gets the poster and a play control. The
    control is a real 44px button with a text label that names the footage.
    
    Add poster frames pulled from the source files, and preload="metadata",
    so the hero shows something immediately rather than a hole while 19.5MB
    of video buffers.
    
    Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>

 components/ambient-video.module.css |  64 +++++++++++++++++++++++++++++++++
 components/ambient-video.tsx        |  69 ++++++++++++++++++++++++++++++++++++
 components/closing-night.module.css |   6 ++++
 components/closing-night.tsx        |  11 +++---
 components/hero.tsx                 |   9 +++--
 public/closing-night-poster.jpg     | Bin 0 -> 151575 bytes
 public/hero-poster.jpg              | Bin 0 -> 50589 bytes
 7 files changed, 148 insertions(+), 11 deletions(-)

commit 879333de8df1abe8f6b8403d29cb38fb11d92aac
Author: Shiwa Kumar <47922830+shiva8009@users.noreply.github.com>
Date:   Sun Aug 30 12:50:07 2026 +0530

    Fix contrast failure across the apply section
    
    Ink on the brand gradient's burnt end (#d63a00) measures 4.26:1, and the
    section's secondary text sat at 74% alpha over it for 3.40:1 — both
    below the 4.5:1 needed at body sizes. That affected every step
    description, the allocation note and the deadline captions, on the one
    section the whole page is trying to drive traffic to.
    
    Add an --orange-gradient-plate token that lifts the dark stop to the GGI
    orange (#f56a00) for fields that carry body text, and raise the tone's
    --dim to 88%. Worst point of the plate is now 6.62:1 for primary and
    5.89:1 for secondary. The unmodified gradient stays on buttons, the
    wipe and gradient headline text, which are large or decorative.
    
    Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>

 app/globals.css                   | 7 +++++--
 components/application.module.css | 2 +-
 2 files changed, 6 insertions(+), 3 deletions(-)

commit 55a0f8289d5e349ceb84325a24075ae1492492f6
Author: Shiwa Kumar <47922830+shiva8009@users.noreply.github.com>
Date:   Sun Aug 30 12:46:20 2026 +0530

    Add Open Graph card
    
    twitter:card was set to summary_large_image with no image behind it, so
    every share rendered as a bare text link. Generate the card with
    next/og from the same summit data the page uses, so it stays in sync.
    
    The Barlow Condensed subset is committed rather than fetched from Google
    Fonts at build time: a network failure during the build would otherwise
    break the deploy.
    
    metadataBase now matters, since it resolves the card's URL. Fall back to
    VERCEL_PROJECT_PRODUCTION_URL before localhost so a fresh deploy
    resolves correctly with no environment configuration, and drop the
    placeholder domain. Also emit og:url.
    
    Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>

 .env.example                     |   2 +-
 app/_og/barlow-condensed-800.ttf | Bin 0 -> 87556 bytes
 app/layout.tsx                   |  10 +++-
 app/opengraph-image.tsx          | 107 +++++++++++++++++++++++++++++++++++++++
 4 files changed, 117 insertions(+), 2 deletions(-)

commit 74afa14d476a8e0417a660fd10b33994ab0950db
Author: Shiwa Kumar <47922830+shiva8009@users.noreply.github.com>
Date:   Sun Aug 30 12:46:20 2026 +0530

    README: lead with run, AI feature and failure behaviour
    
    The submission checklist asks for a short README covering how to run the
    site, what the AI feature does and how it behaves when the model fails.
    All three were already documented but spread across a 13-section
    document, so add a lead block answering them in order and point at the
    detailed sections underneath.
    
    Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>

 README.md | 52 ++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 52 insertions(+)

commit ab131cdd55ceb0dbd09f1f9736d14b09b7df8163
Author: Shiwa Kumar <47922830+shiva8009@users.noreply.github.com>
Date:   Fri Aug 28 18:19:08 2026 +0530

    Update components and styling

 .claude/launch.json              | 11 -----------
 .gitignore                       |  9 +++++++++
 AGENTS.md                        |  9 ---------
 CLAUDE.md                        |  1 -
 app/globals.css                  | 14 +++-----------
 components/headline.module.css   |  9 ++-------
 components/headline.tsx          | 10 ++--------
 components/logo.module.css       |  8 ++------
 components/logo.tsx              | 12 +-----------
 components/navigation.module.css | 10 +++-------
 components/partner-mark.tsx      |  9 ++-------
 components/preloader.module.css  |  8 ++------
 components/preloader.tsx         | 28 ++++++++--------------------
 components/reveal.tsx            |  7 ++-----
 components/speakers.module.css   | 11 +++--------
 components/speakers.tsx          | 10 ++--------
 data/partners.ts                 | 13 ++-----------
 lib/schemas.ts                   |  7 +------
 18 files changed, 44 insertions(+), 142 deletions(-)

commit 2cf5490ad2110a569c4dd0d4aa8eace1289bcebf
Author: Shiwa Kumar <47922830+shiva8009@users.noreply.github.com>
Date:   Thu Aug 27 20:59:09 2026 +0530

    Update hero video

 public/hero-video.mp4 | Bin 20464324 -> 4230161 bytes
 1 file changed, 0 insertions(+), 0 deletions(-)

commit 91ebe257cad1bd331e2b19a402007bd234ef544f
Author: Shiwa Kumar <47922830+shiva8009@users.noreply.github.com>
Date:   Thu Aug 27 20:43:39 2026 +0530

    Fix Vercel build error with siteUrl fallback

 app/layout.tsx | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

commit 6b54e0e1f26dceb214af636d18577b432792189a
Author: Shiwa Kumar <47922830+shiva8009@users.noreply.github.com>
Date:   Thu Aug 27 20:33:24 2026 +0530

    Initial commit with landing page content

 .claude/launch.json                    |   11 +
 .env.example                           |   22 +
 .gitignore                             |   15 +
 AGENTS.md                              |    9 +
 CLAUDE.md                              |    1 +
 README.md                              |  385 ++
 app/api/track-match/route.ts           |   50 +
 app/globals.css                        |  538 +++
 app/icon.svg                           |   12 +
 app/layout.tsx                         |   81 +
 app/page.tsx                           |   45 +
 components/application.module.css      |  110 +
 components/application.tsx             |   72 +
 components/closing-night.module.css    |  110 +
 components/closing-night.tsx           |   62 +
 components/cursor-spotlight.module.css |   21 +
 components/cursor-spotlight.tsx        |   33 +
 components/declaration.module.css      |  116 +
 components/declaration.tsx             |   97 +
 components/faq.module.css              |  106 +
 components/faq.tsx                     |   71 +
 components/footer.module.css           |   92 +
 components/footer.tsx                  |   71 +
 components/headline.module.css         |   32 +
 components/headline.tsx                |   45 +
 components/hero.module.css             |  406 +++
 components/hero.tsx                    |  102 +
 components/intro.module.css            |   59 +
 components/intro.tsx                   |   53 +
 components/logo.module.css             |    9 +
 components/logo.tsx                    |   36 +
 components/mobile-cta.module.css       |   50 +
 components/mobile-cta.tsx              |   76 +
 components/navigation.module.css       |  232 ++
 components/navigation.tsx              |  119 +
 components/parallax-layer.tsx          |   59 +
 components/partner-mark.tsx            |   74 +
 components/partners.module.css         |  125 +
 components/partners.tsx                |   31 +
 components/preloader.module.css        |  127 +
 components/preloader.tsx               |  142 +
 components/programme.module.css        |  122 +
 components/programme.tsx               |   51 +
 components/reveal.tsx                  |   82 +
 components/section-head.module.css     |   20 +
 components/section-head.tsx            |   26 +
 components/speakers.module.css         |  217 ++
 components/speakers.tsx                |  105 +
 components/stats.module.css            |   54 +
 components/stats.tsx                   |   27 +
 components/track-card.tsx              |   55 +
 components/track-matcher.module.css    |  303 ++
 components/track-matcher.tsx           |  374 ++
 components/tracks.module.css           |  165 +
 components/tracks.tsx                  |   61 +
 data/faq.ts                            |   34 +
 data/matcher.ts                        |  149 +
 data/partners.ts                       |   28 +
 data/programme.ts                      |   50 +
 data/summit.ts                         |   46 +
 data/tracks.ts                         |   77 +
 eslint.config.mjs                      |   10 +
 lib/ai.ts                              |  132 +
 lib/schemas.ts                         |   54 +
 lib/track-scoring.ts                   |   94 +
 next.config.mjs                        |   10 +
 package-lock.json                      | 6213 ++++++++++++++++++++++++++++++++
 package.json                           |   29 +
 public/closing-night-video.mp4         |  Bin 0 -> 4800056 bytes
 public/ggi-logo.png                    |  Bin 0 -> 173255 bytes
 public/hero-video.mp4                  |  Bin 0 -> 20464324 bytes
 public/speaker-academic.png            |  Bin 0 -> 1125309 bytes
 public/speaker-founder.png             |  Bin 0 -> 1356523 bytes
 public/speaker-journalist.png          |  Bin 0 -> 1493701 bytes
 public/speaker-minister.png            |  Bin 0 -> 1498396 bytes
 tsconfig.json                          |   42 +
 76 files changed, 12537 insertions(+)
`
