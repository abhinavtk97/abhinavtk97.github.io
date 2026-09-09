# DESIGN.md — "Claude Code" portfolio for abhinavtk97.github.io

Build ONE file: `index.html` (replace the existing one). Everything inline —
CSS + JS in the same file. No frameworks, no build step, no external
requests (no CDN fonts/JS). Do not touch anything else in the repo.
Facts come from PROFILE.md — bake them into the JS/HTML, never invent.

## Concept
The whole site is a fake Claude Code terminal session. It "boots" with a
short animated sequence (welcome box → reading PROFILE.md → tool calls),
then shows an interactive prompt. Visitors run commands (`help`,
`experience`, `skills`, …) to read the résumé. For people who won't type,
render clickable command "chips" after boot and a TL;DR card.

## Palette (exact)
- --bg: #1F1E1D (terminal background)
- --bg-raised: #262624 (cards/boxes)
- --titlebar: #141313
- --border: #3E3E38
- --text: #F0EEE6 (primary cream)
- --muted: #87867F
- --accent: #D97757 (Claude terracotta — prompt caret, box borders, headings)
- --accent-hover: #E08B6D
- --ok: #8FBE83 (tool-result dim lines)
- --link: #7FA8C9
- --err: #C97A6D
- macOS dots: #FF5F56 #FFBD2E #27C93F

Font (system mono stack only): ui-monospace, "SF Mono", "Cascadia Code",
"JetBrains Mono", Menlo, Consolas, monospace. Base size 14px, line-height 1.6.

## Layout
- Full-viewport dark page (#1F1E1D) with one centered terminal window,
  max-width 920px, ~24px margin, rounded 8px, 1px #3E3E38 border,
  soft shadow.
- Title bar: #141313, three macOS dots, centered title text in --muted:
  `abhinav@portfolio: ~ — claude v2.0`
- Terminal body: padded 20-24px, scrollable, full height minus title bar
  (flex column, body fills viewport height; min-height 100svh).
- Mobile: window fills viewport edge-to-edge (margin 0, radius 0), font 13px.

## Claude Code visual vocabulary (match these motifs)
- Welcome box: 1px --accent rounded 6px, padded:
  `✻ Welcome to Abhinav Code!` + dim second line `v2.0 · abhinavtk97.github.io`
- Tip box: bordered --border rounded box: `╭─────────╮` style is optional;
  simplest: 1px border box with `Tip: type help to see available commands`
- Tool call line: `⏺ Reading PROFILE.md…` where ⏺ is --accent, text --text;
  result lines prefixed `  ⎿` in --muted/--ok.
- Thinking line: `✻ Thinking…` with the ✻ pulsing (CSS animation).
- Prompt line at the bottom: `❯` in --accent (use ❯ or ›), blinking block
  caret (CSS animation on a span), input is a real <input> (transparent bg,
  no outline) so mobile keyboards work.
- Status line under prompt, --muted, 12px:
  `⏵⏵ accept edits · shift+tab to cycle  ·  tab to autocomplete`

## Boot sequence (runs once on load; each click/keypress skips to the end)
Use timed steps (~350–650ms apart, typed lines at ~18ms/char):
1. Type the command: `claude` after a `$` prompt.
2. Welcome box (above) fades in.
3. Tip box: `Tip: type "help" to see available commands — or click one:`
   followed by the command chips row (see Commands).
4. Tool call: `⏺ Read(PROFILE.md)` with ⎿ lines: `  ⎿ Senior Software
   Engineer — AI/ML Platform @ PayPal · ex-Zoho (ManageEngine)` and
   `  ⎿ 9 sections · 2 companies · 1 award (CTO Innovation, 2026)`
5. `✻ Thinking…` (pulse ~1.2s) then the bio paragraph from PROFILE.md
   ("One-liner") renders as normal text.
6. `⏺ Bash(present --quick-facts)` ⎿ location / current role / education.
7. Final line (accent): `Ready. Type "help" or press the chips below.`
8. Prompt becomes active+focused; auto-scroll to prompt.
- `prefers-reduced-motion: reduce` → no typing/pulsing; render everything
  instantly.
- Any click/keypress during boot jumps to final state immediately.

## Commands (interactive prompt)
Case-insensitive, trimmed. Tab autocompletes from this list; ↑/↓ history.
Unknown → `zsh: command not found: X — try "help"`.
- `help` — table of commands with dim descriptions
- `whoami` — name, headline, location
- `exp` / `experience` — PayPal (all roles + bullets from PROFILE.md,
  incl. both award lines) then Zoho (all bullets), Claude-Code-styled:
  company headers in accent, bullets as `  ⎿ …`
- `skills` — grouped from PROFILE.md (languages / domain / forensics /
  transport / currently)
- `edu` / `education` — degree entry
- `contact` — email, LinkedIn, GitHub, Stack Overflow (all real links)
- `hire` — playful: `✻ Good choice.` + contact block + `⏺
  schedule_interview(status: "open to chat")  ⎿ Done in 0.3s`
- `linkedin` / `github` / `stack-overflow` — open the URL in a new tab
- `cat about.md` (and bare `about`) — the bio one-liner
- `ls` — fake listing: `PROFILE.md  experience/  skills/  contact.md`
- `clear` — clears output (keeps prompt)
- `sudo hire-me` — `sudo: permission granted. obviously.` + contact block
- Easter eggs (keep short): `rm -rf /` → `nice try.`; `exit` → `there is
  no exit. only deploy.`; `vim` → `you are now stuck in vim. (jk — type
  help)`; `42` → `correct.`
Chips (rendered once after boot): help · experience · skills · contact · hire

## Output rendering
Each command appends a block: the echoed prompt line `❯ experience` then
its output, styled like tool output (⎿ lines, accent headers). Auto-scroll
to bottom on every append. Keep DOM nodes bounded (cap history at ~200
blocks; drop oldest).

## Quality bar (must all pass)
- Valid HTML5; <title>/meta description/OG tags exactly as PROFILE.md
  "Page meta" says; add JSON-LD Person schema (name, jobTitle, sameAs:
  LinkedIn/GitHub/StackOverflow, email).
- Hidden but crawlable fallback: a visually-hidden <div> with the résumé
  as plain text/links (SEO + no-JS + screen readers), plus <noscript>
  note "This portfolio is an interactive terminal — enable JS, or read the
  summary here:" followed by that same content.
- Favicon: inline SVG data-URI — the ✻ glyph in #D97757 on #1F1E1D.
- Zero console errors; no external requests; works from file:// too.
- Keyboard: prompt always re-focusable by clicking anywhere in the
  terminal body; Tab completion; ↑/↓ history; Esc blurs.
- Mobile: chips wrap, terminal fills viewport, typing opens keyboard.
- Lighthouse-friendly: single file, no render-blocking externals.

## QA checklist before hand-back
1. `python3 -m http.server` in the repo → open in browser → boot plays,
   skip works, every command above works, no console errors.
2. Narrow viewport (~390px) renders correctly.
3. HTML validates (no unclosed tags); JS has no syntax errors
   (node --check on the extracted script is fine).
