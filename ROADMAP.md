# ROADMAP.md — "The Gateway" · 3D portfolio for abhinavtk97.github.io

Concept: a dim data-center aisle at night. The camera glides down the aisle;
each rack is a chapter of Abhinav's career. A central "gateway core" — where
thousands of light-packets converge and get routed — is the signature scene,
a literal rendering of his day job (LLM gateway @ PayPal).

Ground rules for every phase:
- PROFILE.md stays the single source of facts. No invented biography.
- The live root site (terminal portfolio) is NEVER at risk: all 3D work deploys
  to /gateway/ as a subfolder preview until Phase 5.
- Every phase ends in a CHECKPOINT: rendered screenshots + live /gateway/ URL.
  Work pauses there for review; feedback loops before the next phase starts.
- Facts, scenes, and copy are reviewed as docs (this file + SCENE.md) BEFORE
  heavy build work.

## Stack (decided)
- Vite + Three.js (WebGPURenderer with automatic WebGL2 fallback), vanilla JS,
  no React. Post: ACES tone mapping, bloom, SSAO, fog.
- Assets: procedural-first (racks/LEDs/cables = instanced geometry + shaders),
  HDRI from Poly Haven (CC0). No licensing risk, small payload.
- Deploy: built assets committed under /gateway/ per checkpoint (root untouched).
- SEO/a11y unchanged: full HTML résumé stays crawlable; canvas is enhancement,
  not the content. Claude Code–styled HTML overlay panels for chapter details
  (visual continuity with the terminal experiment).

## Phases

### Phase 0 — Foundations + look-dev  → CHECKPOINT: "Do we like the look?"
- Vite scaffold in-repo (src/ + build to /gateway/), deploy script, QA rig as a
  committed script (headless Chromium + font/lib setup is currently ephemeral /tmp).
- SCENE.md: rack-by-chapter content mapping (entry / PayPal / Zoho / education).
- Look-dev mood scene: one aisle slice — 3 racks, LED strip, HDRI night lighting,
  fog, tone mapping. NOT interactive yet.
- Exit: 3–4 screenshots (day-for-night variants if cheap) + live /gateway/ URL.
  Gate: user approves direction, palette, density. Everything after inherits this.

### Phase 1 — The Aisle (scroll MVP)  → CHECKPOINT: "Can I walk it?"
- Full procedural aisle: reflective floor, ceiling cable trays, 5–7 rack
  clusters, instanced blinking LEDs + bloom, volumetric-ish fog.
- Scroll-driven camera dolly (scrub the aisle; mouse adds parallax only).
- Loading screen with progress; perf tier detection begins here.
- Exit: end-to-end scroll, 60fps-ish on desktop-class GPU, screenshots at each
  chapter position, mobile runs at reduced tier (or clean poster fallback).

### Phase 2 — Chapters light up  → CHECKPOINT: "Is the story readable?"
- Click/tap a rack (or keyboard ←/→): camera dollies in, HTML glass panel lights
  up with that chapter (Claude Code–styled output: ⏺ / ⎿ motifs).
  Entry: name+headline+links · PayPal: AI/ML platform + LLM gateway + awards ·
  Zoho: EventLog Analyzer scalability story · Education/origin.
- Focus mode: scroll locks, ESC/back returns, deep-linkable (#paypal etc.).
- Exit: all four chapters reachable + readable, content matches PROFILE.md,
  keyboard-navigable, mobile tap flow works.

### Phase 3 — The Gateway Core (signature)  → CHECKPOINT: "Does it wow?"
- Central structure between PayPal/Zoho racks: packet particles stream in from
  racks, converge, route outward in golden beams. Bloom-heavy hero moment.
- GPU points/instanced particles (~20–50k, tiered), vertex-shader motion
  (compute path only if WebGPU present — fallback first).
- Ambient counters overlay (fun req/s ticker, clearly decorative).
- Exit: hero scene holds frame budget on mid hardware; reduced tier keeps it
  legible; screenshots from 3 angles for review.

### Phase 4 — Polish + resilience  → CHECKPOINT: "Hardening review"
- Mobile flow finalized (tap-to-advance rail OR auto-tour), DPR clamp,
  particle/shadow budgets per tier, battery-friendly pause when tab hidden.
- prefers-reduced-motion: static still + panels. No-WebGL: poster + full HTML
  content. Keyboard-only complete tour. Screen-reader path = existing fallback.
- Meta/OG image (rendered still of the aisle), favicon, asset budget audit
  (<3.5 MB first render), Lighthouse pass, zero console errors on the QA rig.
- Exit: full QA suite green (extend /tmp/pwtest suite into repo), checklist
  report to user.

### Phase 5 — Launch  → CHECKPOINT: "Ship + retro"
- Flip: /gateway/ becomes root, terminal site preserved at /terminal (link kept
  as an easter egg from the entry rack).
- Live verification (fresh fetch of abhinavtk97.github.io), smoke test on QA rig
  against production URL.
- Retro: what to iterate (copy, densities, timings) from real feedback.

## Risks / honest caveats
- Realism ceiling: procedural racks + HDRI + post gets 85% of the way; a
  purchased/CC0 data-center model could add the last 15% — decide at Phase 0/1
  checkpoint after seeing renders.
- Headless QA can measure perf only approximately; real phones are the truth.
  Phase 4 includes a "test on your phone" checkpoint item.
- WebGPU headless support is spotty — QA rig exercises the WebGL2 fallback path,
  which is what most early visitors will hit anyway.
