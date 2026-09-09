# SCENE.md — "The Gateway" · rack-by-chapter content map

Source of truth for facts: PROFILE.md. This file only maps them to the 3D
world. Copy shown in panels is written here ONCE and reviewed BEFORE build
work — content changes must never require redoing 3D.

## Narrative (walk order, entry → end)
You materialize at the aisle entrance facing a wall of dark racks. Text
fades in — your name and headline. Scrolling walks you DOWN the aisle,
chronologically: education → Zoho → PayPal — and the walk ends at the
signature set piece: **the Gateway Core**, where every rack's light-packets
converge and route outward. Present-day, front and center, with the
contact panel. The last thing a visitor sees is the thing you build.

| # | Set piece | Career chapter | Panel content (from PROFILE.md) |
|---|-----------|----------------|--------------------------------|
| 0 | Entry rack wall | — | `Abhinav TK` · `Senior Software Engineer — AI/ML Platform @ PayPal · ex-Zoho (ManageEngine)` · `scroll to walk the aisle` |
| 1 | Origin rack (older hardware, dimmer LEDs) | Education | B.Tech CSE — Mar Athanasius College of Engineering (2015–2019). From Kerala → Bengaluru. |
| 2 | Zoho rack (log-tape motif: reels of flowing light = log streams) | Zoho (ManageEngine), 2019–2022 | MTS — EventLog Analyzer. Log-pipeline rewrite: monolith (~20k syslog/3k Windows events/s) → horizontally scalable agents. WebSocket protocol. Config-sync. Auto-deployment. WinDBG/MAT/VisualVM forensics. |
| 3 | **Gateway Core** (signature, phase 3) — packets converge from all racks, route out in accent-colored beams | PayPal AI/ML Platform, 2023–now | Senior SWE. Rebuilt PayPal's AI/LLM gateway: one front door for every LLM workload; cost + interoperability across model providers. CTO Innovation Award (individual, Aug 2026). CTO Awards 1st Runner-Up (team, May 2026). |
| 4 | Contact beacon at the core | — | email · LinkedIn · GitHub · Stack Overflow + `cat hire.md` easter egg → the `hire` panel from the terminal site |

## Visual continuity with the terminal site
- Same palette DNA: background #1F1E1D family, text cream #F0EEE6,
  **accent terracotta #D97757 reserved for the Gateway Core beams and UI** —
  the only saturated-warm element in a cool blue-green machine world.
- Panels are HTML overlays styled like the terminal's output blocks
  (⏺ tool-call line, ⎿ bullets) — glassy dark cards, monospace.
- The old terminal site stays reachable at /terminal (linked from the
  entry panel as `./terminal --legacy`).

## Environment rules (look-dev targets)
- Night-shift data center: cool, dim, quiet. Practicals (LEDs, strip
  lights) carry the frame; HDRI fill only lifts blacks slightly.
- Fog: heavy enough to swallow the aisle's far end (~18–25 m visibility).
- Floor: dark, semi-polished — LED color reads as reflections.
- LED language: green = healthy, amber = warnings, rare red = one story
  detail (the pre-rewrite monolith rack runs hot: more amber/red).
- Density: racks are mostly dark; light is precious. No wall-of-Christmas-
 -lights cliché.

## Copy drafts (panels, terminal voice)
- entry: `$ whoami` → name + headline + `~ scroll to walk the aisle ~`
- ch1: `$ cat origin.txt` → education line
- ch2: `$ journal --zoho` → 3–4 ⎿ bullets (pipeline rewrite, protocol, forensics)
- ch3: `$ tail -f gateway.log` → role line, mission bullet, 2 award ⎿ lines
- ch4: `$ contact --now` → the four links + hint `try: ./terminal --legacy`
(Estimated reading: each panel ≤ 40 words. Final wording re-reviewed at
Phase 2 checkpoint.)
