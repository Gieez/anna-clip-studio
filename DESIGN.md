# Design Direction: ClipStudio AI

## Project
ClipStudio AI is an AI-powered viral video intelligence and short-form clipping studio built natively for Anna AI OS.

## Purpose
Enable creators, marketers, and researchers to turn long YouTube videos into viral short-form clips (TikTok, Reels, Shorts), extraction of high-retention hooks, timecoded segments, and ready-to-publish social captions in seconds.

## Audience
Solo creators, YouTube podcasters, short-form video editors, social media managers, and digital marketers seeking high virality without manual scrubbing.

## Brand Character
Tactical, broadcast-grade, precise, high-velocity, reliable.

## Visual Concept
A professional editing suite control console: dark obsidian backdrop, timecode displays in crisp monospace, energetic signal amber accents, live retention timeline scrubbers, and compact actionable clip cards.

## Art Direction
Studio Console aesthetic. High-contrast dark surfaces, subtle 1px border grids, zero blurry neon glows, zero generic glassmorphism, zero em-dash typography crutches.

## Typography
- Display / Headings: `Plus Jakarta Sans`, -0.02em letter spacing, semibold.
- Body / UI: `Inter`, system fallback sans-serif, 13px - 14px compact density.
- Timecodes & Metrics: `JetBrains Mono` / `Fira Code`, monospace tabular numerals.

## Color System
- Canvas Background: `#08090d` (Deep space obsidian)
- Panel / Surface: `#11131a` (Broadcast console chassis)
- Surface Hover / Active: `#181b24`
- Border: `#232736` (Subtle mechanical division)
- Accent Primary: `#f59e0b` (Warm signal amber for action triggers and high virality)
- Accent Secondary: `#ef4444` (YouTube/Recording red for timestamps and badges)
- Metric High: `#10b981` (Emerald green for virality scores > 85)
- Text Primary: `#f1f5f9` (Crisp off-white)
- Text Muted: `#8492a6` (Slate muted)

## Composition & Layout
- Top Header: Compact app title, status dot, quick presets (15s, 30s, 60s).
- Input Ribbon: Fast YouTube URL input + Fetch/Analyze button with duration chips.
- Split View:
  - Left / Top: Video overview header, duration, channel name, and transcript segment count.
  - Right / Main: Clip candidate deck sorted by Virality Score (1-100), with 1-click jump to YouTube timestamp and 1-click script/caption copy.
- Zero generic 3-card equal grids. The layout is optimized as a functional workspace utility window inside Anna OS.

## Shape Language
- Corner Radius: Compact 6px on badges/buttons, 8px on panels/cards.
- Borders: Solid 1px `#232736`.
- Shadows: None to ultra-subtle (`0 2px 8px rgba(0,0,0,0.4)`).

## Motion & Interaction
- Instant snappy hover transitions (150ms ease).
- Animated progress bar during transcript parsing and retention scoring.
- Feedback toast when copying script or timestamp to clipboard.
- Respects `prefers-reduced-motion`.

## Forbidden Patterns
- No generic AI gradients (no purple/pink SaaS slop).
- No floating 3D blobs or decorative illustrations.
- No em-dashes in UI copy or bullet lists.
- No fake non-functional mockups; every button and timestamp triggers real behavior.
