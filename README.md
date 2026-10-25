# ClipStudio AI — Anna AI OS App

> **AI-powered viral video intelligence, retention hotspot detection, and short-form clipping studio built natively for Anna AI OS.**

ClipStudio AI transforms long YouTube podcasts, lectures, and interviews into high-retention viral short clips (TikTok, YouTube Shorts, Instagram Reels), complete with scroll-stopping hooks, exact timecodes, and ready-to-post scripts.

Built for the **Anna AI App Builder Program (DoraHacks Hackathon 2349)**.

---

## ⚡ Key Features

- **Automated Retention & Hook Detection**: Scans video transcripts using rolling window semantic scoring to detect questions, emotional triggers, provocative statements, and high-value takeaways.
- **Precision Timecodes**: Aligns clip boundaries into tight, punchy segments (`15s Hook`, `30s Viral`, `60s Deep Dive`) with direct clickable YouTube timestamp links (`?t=...`).
- **3-Part Production Scripts**: Automatically generates ready-to-record scripts formatted for short-form creators:
  - `[HOOK]` (0s–3s scroll-stopper)
  - `[BODY]` (Core value delivery)
  - `[CTA]` (Engagement driver)
- **1-Click Copy & Markdown Export**: Copy scripts, captions with trending hashtags, or export complete multi-clip Markdown dossiers to Anna chat.
- **Zero API Key Barrier**: Works completely out-of-the-box using YouTube public oEmbed and automatic subtitle/transcript extraction.
- **Manual Subtitle Support**: Direct support for uploading or pasting custom SRT, VTT, or raw timestamped transcripts.

---

## 🏗️ Architecture

```
anna-clip-studio/
├── manifest.json                      # Schema 2 Anna App Manifest (UI + Executas + Host ACL)
├── app.json                           # Store listing metadata (Name, Tagline, Category)
├── DESIGN.md                          # Studio-grade visual direction & token specification
├── bundle/                            # Sandboxed SPA rendered inside Anna OS iframe
│   ├── index.html                     # Studio console layout
│   ├── style.css                      # High-contrast dark obsidian theme
│   └── app.js                         # AnnaAppRuntime SDK integration & client logic
└── executas/
    └── clip-studio/                   # Stdio Executa plugin (JSON-RPC 2.0)
        ├── clip_studio_plugin.py      # Core engine: oEmbed + transcript + virality ranking
        └── pyproject.toml             # Python package spec
```

### Protocol & SDK Integration
- **Host Communications**: Communicates over `AnnaAppRuntime` (`/static/anna-apps/_sdk/latest/index.js`).
- **Tool Invocations**:
  - `tool-dev-clip-studio:fetch_video_info`: Fetches video oEmbed, channel author, and transcript length.
  - `tool-dev-clip-studio:analyze_viral_clips`: Extracts high-retention clips, hooks, and scripts.
- **Host Storage**: Uses `anna.storage.set` to persist recent clip runs.
- **Window Management**: Dynamically sets window titles via `anna.window.set_title`.

---

## 🚀 Local Development & Testing

### 1. Prerequisites
- Node.js 22+
- Python 3.10+
- `uv` (Astral)
- `@anna-ai/cli`:
  ```bash
  npm i -g @anna-ai/cli
  ```

### 2. Validate Project
```bash
cd anna-clip-studio
npx @anna-ai/cli validate
```

### 3. Run Development Harness
```bash
npx @anna-ai/cli dev
```
Open `http://localhost:5180/` to test the app mounted inside the mock Anna OS dashboard shell.

---

## 📄 License
MIT
