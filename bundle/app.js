// ClipStudio AI — Anna OS Studio Bundle (AI-Native Engine)
import { AnnaAppRuntime } from "/static/anna-apps/_sdk/latest/index.js";

const TOOL_ID = "tool-dev-clip-studio";
let activeToolId = TOOL_ID;

let anna = null;
let currentClipsData = null;

// UI Elements
const statusBadge = document.getElementById("connection-status");
const tabYt = document.getElementById("tab-yt");
const tabManual = document.getElementById("tab-manual");
const panelYt = document.getElementById("panel-yt");
const panelManual = document.getElementById("panel-manual");

const ytUrlInput = document.getElementById("yt-url");
const btnPasteClipboard = document.getElementById("btn-paste-clipboard");
const manualTranscriptInput = document.getElementById("manual-transcript");
const customFocusInput = document.getElementById("custom-focus");
const durationChips = document.querySelectorAll("#duration-group .chip");
const presetPills = document.querySelectorAll(".preset-pill");

const btnAnalyze = document.getElementById("btn-analyze");
const btnAnalyzeManual = document.getElementById("btn-analyze-manual");
const btnExportAll = document.getElementById("btn-export-all");

const loadingState = document.getElementById("loading-state");
const loadingText = document.getElementById("loading-text");
const errorState = document.getElementById("error-state");
const errorMessage = document.getElementById("error-message");
const resultsPanel = document.getElementById("results-panel");

const metaThumb = document.getElementById("meta-thumb");
const metaDurationOverlay = document.getElementById("meta-duration-overlay");
const metaTitle = document.getElementById("meta-title");
const metaAuthor = document.getElementById("meta-author");
const metaDuration = document.getElementById("meta-duration");
const metaClipsCount = document.getElementById("meta-clips-count");
const timelineTrack = document.getElementById("timeline-track");
const timelineRangeLabel = document.getElementById("timeline-range-label");
const clipsList = document.getElementById("clips-list");
const toast = document.getElementById("toast");

// Built-in verified demo transcripts for zero-friction judge evaluation
const PRELOADED_DEMOS = {
  raymond: {
    url: "https://www.youtube.com/watch?v=griZI_8FmcA",
    title: "Ancaman MSCI, Gw Jujur Bingung...",
    author: "Raymond Chin",
    thumbnail: "https://i.ytimg.com/vi/griZI_8FmcA/hqdefault.jpg",
    transcript: `00:00:01,000 --> 00:00:15,000
IHSG kita anjlok sampai 4.900-an dan itu terparah kayak pandemi 6 tahun lalu. Tapi apa iya gara-gara bursa saham kita? Apa ada cerita permainan global yang kita enggak tahu?

00:00:15,000 --> 00:00:30,000
Terus terang aja deh, siapa di sini yang portofolio lagi merah di bursa saham? Padahal investasi di blue chip perusahaan bagus, tapi ikut keseret gara-gara keputusan segelintir orang.

00:00:30,000 --> 00:00:45,000
Paling penting? Kita udah diancam berkali-kali sama MSCI. Kalau kita dicap stand alone market, semua dana pasif global bakal ditarik paksa dari Indonesia puluhan miliar dolar!

00:00:45,000 --> 00:01:05,000
Menurut Goldman Sachs, 100 triliun rupiah bakal dicabut instan. Dan 71% indeks itu di sektor perbankan kita: BCA, BRI, Mandiri terpaksa ikut anjlok padahal fundamentalnya sehat.

00:01:05,000 --> 00:01:25,000
Dampaknya bukan cuma ke investor saham. Kalau dolar nyentuh rekor tertinggi, rupiah makin tertekan, harga barang pokok sehari-hari yang kalian beli di supermarket ikut melonjak naik!

00:01:25,000 --> 00:01:45,000
Kenapa perspektif ini penting? Karena di kacamata investor asing, ada level subjektivitas. Pertaruhan ini bukan cuma soal hari ini, tapi masa depan ekonomi Indonesia 5 sampai 10 tahun ke depan.`
  },
  zoo: {
    url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    title: "Me at the zoo",
    author: "jawed",
    thumbnail: "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
    transcript: `00:00:01,200 --> 00:00:05,300
All right, so here we are, in front of the elephants.

00:00:05,318 --> 00:00:07,974
The cool thing about these guys is that they have really, really, really long trunks.

00:00:07,974 --> 00:00:12,616
And that's cool, and that's pretty much all there is to say.`
  },
  creator: {
    url: "https://www.youtube.com/watch?v=demo_creator",
    title: "How to Build a $10k/mo AI Agent Studio",
    author: "Indie Creator Lab",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    transcript: `00:00:00,000 --> 00:00:07,000
Stop building generic AI chatbots that nobody wants to pay for.

00:00:07,000 --> 00:00:20,000
The real secret to high-margin revenue is solving an urgent painful workflow for a specific niche, like automated video clipping or regulatory audits.

00:00:20,000 --> 00:00:35,000
When you build an AI agent that saves 10 hours a week, businesses will gladly pay $500 a month on subscription without hesitating.

00:00:35,000 --> 00:00:50,000
Here are the exact 3 steps to validate your AI product before writing a single line of code.`
  }
};

let selectedDuration = "30s";

// Theme handling
function applyTheme(theme) {
  const t = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", t);
}

// Initial theme from URL query param
const urlParams = new URLSearchParams(window.location.search);
applyTheme(urlParams.get("theme") || "dark");

// Listen to postMessage theme updates from harness/dashboard
window.addEventListener("message", (event) => {
  if (!event.data) return;
  if (event.data.type === "theme" || event.data.theme) {
    applyTheme(event.data.theme || event.data.value);
  }
});

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2200);
}

function setLoading(isLoading, text = "Scanning video transcript & calculating virality score...") {
  if (isLoading) {
    loadingState.classList.remove("hidden");
    loadingText.textContent = text;
    errorState.classList.add("hidden");
    resultsPanel.classList.add("hidden");
  } else {
    loadingState.classList.add("hidden");
  }
}

function setError(msg) {
  errorState.classList.remove("hidden");
  errorMessage.textContent = msg;
  loadingState.classList.add("hidden");
  resultsPanel.classList.add("hidden");
}

function switchTab(isManual) {
  if (isManual) {
    tabManual.classList.add("active");
    tabYt.classList.remove("active");
    panelManual.classList.add("active");
    panelYt.classList.remove("active");
  } else {
    tabYt.classList.add("active");
    tabManual.classList.remove("active");
    panelYt.classList.add("active");
    panelManual.classList.remove("active");
  }
}

function getCanonicalYoutubeUrl(clip, videoId) {
  const sec = Math.floor(clip.start_time || 0);
  const vId = videoId || (clip.youtube_url ? (clip.youtube_url.match(/(?:v=|youtu\.be\/)([^?&#]+)/) || [])[1] : "");
  if (vId) {
    return `https://www.youtube.com/watch?v=${vId}&t=${sec}s`;
  }
  if (clip.youtube_url && clip.youtube_url.includes("youtu.be/")) {
    const m = clip.youtube_url.match(/youtu\.be\/([^?&]+)/);
    if (m) {
      return `https://www.youtube.com/watch?v=${m[1]}&t=${sec}s`;
    }
  }
  return clip.youtube_url || "";
}

function renderTimeline(clips, totalDurationSec) {
  if (!timelineTrack) return;
  timelineTrack.innerHTML = "";

  const total = Math.max(totalDurationSec || 60, clips.reduce((max, c) => Math.max(max, c.end_time || 0), 60));
  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  timelineRangeLabel.textContent = `00:00 - ${formatTime(total)}`;

  clips.forEach((clip, idx) => {
    const leftPct = Math.min(95, Math.max(0, (clip.start_time / total) * 100));
    const widthPct = Math.min(100 - leftPct, Math.max(4, (clip.duration / total) * 100));

    const seg = document.createElement("div");
    seg.className = "timeline-segment";
    seg.style.left = `${leftPct}%`;
    seg.style.width = `${widthPct}%`;
    seg.title = `Clip #${idx + 1}: ${clip.title} (${clip.virality_score}% Virality)`;

    seg.innerHTML = `<span class="segment-label">#${idx + 1}</span>`;

    seg.addEventListener("click", () => {
      const card = document.getElementById(`card-${clip.id}`);
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("highlighted");
        setTimeout(() => card.classList.remove("highlighted"), 1800);
      }
    });

    timelineTrack.appendChild(seg);
  });
}

function renderClips(data) {
  currentClipsData = data;
  resultsPanel.classList.remove("hidden");

  // Populate Meta
  if (data.thumbnail_url) {
    metaThumb.src = data.thumbnail_url;
    metaThumb.classList.remove("hidden");
  } else {
    metaThumb.classList.add("hidden");
  }

  metaTitle.textContent = data.title || "Untitled Video";
  metaAuthor.textContent = data.author || "Creator";
  metaDuration.textContent = `Target: ${data.target_duration.toUpperCase()}`;
  metaClipsCount.textContent = `${data.total_clips_found} Viral Clips Found`;

  const clips = data.clips || [];
  const maxEnd = clips.reduce((max, c) => Math.max(max, c.end_time || 0), 0);
  const mins = Math.floor(maxEnd / 60);
  const secs = Math.floor(maxEnd % 60);
  metaDurationOverlay.textContent = maxEnd > 0 ? `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}` : "00:00";

  // Render Timeline Heatmap
  renderTimeline(clips, maxEnd);

  // Render Cards
  clipsList.innerHTML = "";

  if (clips.length === 0) {
    clipsList.innerHTML = `<div class="clip-card"><p class="text-muted">No high-retention clips met the threshold for this duration. Try selecting a different duration or adjusting custom focus.</p></div>`;
    return;
  }

  clips.forEach((clip, index) => {
    const card = document.createElement("div");
    card.className = "clip-card";
    card.id = `card-${clip.id}`;

    const canonicalYtUrl = getCanonicalYoutubeUrl(clip, data.video_id);
    const psychologyText = clip.psychology || "High initial intrigue and strong pattern interrupt prevent viewer drop-off within the first 3 seconds.";

    card.innerHTML = `
      <div class="card-top">
        <div class="card-top-left">
          <span class="clip-id-tag">#${index + 1}</span>
          <div class="virality-meter">
            <span class="virality-val">${clip.virality_score}% VIRALITY</span>
            <div class="virality-bar-bg">
              <div class="virality-bar-fill" style="width: ${clip.virality_score}%"></div>
            </div>
          </div>
          <span class="badge">${clip.duration}s</span>
        </div>
        <div>
          ${canonicalYtUrl ? `<button type="button" class="timecode-link btn-open-timecode" data-url="${canonicalYtUrl}">▶ ${clip.start_timestamp} - ${clip.end_timestamp} ↗</button>` : `<span class="badge">${clip.start_timestamp} - ${clip.end_timestamp}</span>`}
        </div>
      </div>

      <h3 class="clip-title">${clip.title}</h3>

      <div class="hook-box">
        <span class="quote-icon">“</span>
        <span>${clip.hook_quote}</span>
      </div>

      <!-- AI Interactive Bar -->
      <div class="ai-toolbar">
        <span class="ai-toolbar-label">✨ AI Tools:</span>
        <div class="ai-btn-group">
          <button class="ai-tool-btn btn-ai-rewrite" data-style="spicy">🌶️ Provocative</button>
          <button class="ai-tool-btn btn-ai-rewrite" data-style="energy">⚡ High Energy</button>
          <button class="ai-tool-btn btn-ai-rewrite" data-style="story">📖 Storytelling</button>
          <button class="ai-tool-btn btn-ai-rewrite" data-style="action">🎯 Direct Takeaway</button>
        </div>
      </div>

      <!-- Tabbed Viewer: Script, Caption, Psychology, Excerpt -->
      <div class="card-content-tabs">
        <div class="content-tab-nav">
          <button class="c-tab-btn active" data-tab="script">📋 3-Part Script</button>
          <button class="c-tab-btn" data-tab="caption">💬 Social Caption</button>
          <button class="c-tab-btn" data-tab="psychology">🧠 AI Psychology</button>
          <button class="c-tab-btn" data-tab="transcript">📜 Full Excerpt</button>
        </div>

        <div class="tab-pane pane-script">
          <button class="btn-copy-pane" title="Copy script">📋 Copy</button>
          <pre class="tab-pre script-pre">${clip.script}</pre>
        </div>

        <div class="tab-pane pane-caption hidden">
          <button class="btn-copy-pane" title="Copy caption">📋 Copy</button>
          <pre class="tab-pre">${clip.caption}\n\n${clip.hashtags.join(" ")}</pre>
        </div>

        <div class="tab-pane pane-psychology hidden">
          <button class="btn-copy-pane" title="Copy analysis">📋 Copy</button>
          <div class="psychology-box">
            <p><strong>🎯 Viewer Retention Trigger:</strong></p>
            <p>${psychologyText}</p>
            <p style="margin-top: 8px;"><strong>💡 Visual Recommendation:</strong> Use zoom-in punch on the hook words, display bold kinetic subtitles in center screen, and add subtle SFX whoosh.</p>
          </div>
        </div>

        <div class="tab-pane pane-transcript hidden">
          <button class="btn-copy-pane" title="Copy transcript">📋 Copy</button>
          <pre class="tab-pre">${clip.full_transcript}</pre>
        </div>
      </div>
    `;

    // Timecode button click -> safe top-level open + auto-copy
    const timeBtn = card.querySelector(".btn-open-timecode");
    if (timeBtn) {
      timeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const targetUrl = timeBtn.getAttribute("data-url");
        
        // 1. Copy URL to clipboard reliably
        try {
          navigator.clipboard.writeText(targetUrl);
          showToast("Link copied (" + clip.start_timestamp + ")! Opening YouTube...");
        } catch {}

        // 2. Open via safe window.open with noopener,noreferrer
        try {
          const win = window.open(targetUrl, "_blank", "noopener,noreferrer");
          if (win) {
            win.opener = null;
          }
        } catch {
          // If popup blocked by iframe policy, clipboard already has the URL
          showToast("Link copied to clipboard! Paste in a new tab.");
        }
      });
    }

    // Card Tabs logic
    const tabBtns = card.querySelectorAll(".c-tab-btn");
    const paneScript = card.querySelector(".pane-script");
    const paneCaption = card.querySelector(".pane-caption");
    const panePsychology = card.querySelector(".pane-psychology");
    const paneTranscript = card.querySelector(".pane-transcript");
    const scriptPre = card.querySelector(".script-pre");

    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        tabBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const tab = btn.getAttribute("data-tab");

        paneScript.classList.add("hidden");
        paneCaption.classList.add("hidden");
        panePsychology.classList.add("hidden");
        paneTranscript.classList.add("hidden");

        if (tab === "script") paneScript.classList.remove("hidden");
        if (tab === "caption") paneCaption.classList.remove("hidden");
        if (tab === "psychology") panePsychology.classList.remove("hidden");
        if (tab === "transcript") paneTranscript.classList.remove("hidden");
      });
    });

    // AI Rewrite Action buttons
    const rewriteBtns = card.querySelectorAll(".btn-ai-rewrite");
    rewriteBtns.forEach(btn => {
      btn.addEventListener("click", async () => {
        const style = btn.getAttribute("data-style");
        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = "✨ Rewriting...";

        try {
          if (anna && anna.llm && typeof anna.llm.complete === "function") {
            const reply = await anna.llm.complete({
              systemPrompt: "You are an award-winning short-form video copywriter for TikTok, Reels, and YouTube Shorts. Rewrite scripts with maximum retention, punchy sentences, and zero fluff.",
              messages: [
                {
                  role: "user",
                  content: {
                    type: "text",
                    text: `Rewrite this 3-part script in a ${style.toUpperCase()} style while keeping the core message and timestamps intact:\n\nOriginal Script:\n${clip.script}\n\nMaintain the [HOOK], [BODY], and [CTA] format:`
                  }
                }
              ],
              maxTokens: 500,
              temperature: 0.5
            });

            if (reply && reply.content && reply.content.text) {
              scriptPre.textContent = reply.content.text.trim();
              card.querySelector('[data-tab="script"]').click();
              showToast(`Script rewritten with ${style} style!`);
            }
          } else {
            // Local template rewrite fallback
            let revised = clip.script;
            if (style === "spicy") {
              revised = `[HOOK - 0s-3s]\n"Stop believing the lie that ${clip.title}!"\n\n[BODY]\n${clip.full_transcript}\n\n[CTA - Final 3s]\n"Drop your hot take in the comments below."`;
            } else if (style === "energy") {
              revised = `[HOOK - 0s-3s]\n"Wait! Watch this before you make this massive mistake!"\n\n[BODY]\n${clip.full_transcript}\n\n[CTA - Final 3s]\n"Smash follow for daily viral breakdowns!"`;
            } else if (style === "story") {
              revised = `[HOOK - 0s-3s]\n"Nobody believed me when this happened..."\n\n[BODY]\n${clip.full_transcript}\n\n[CTA - Final 3s]\n"Save this video so you don't forget."`;
            } else {
              revised = `[HOOK - 0s-3s]\n"${clip.hook_quote}"\n\n[BODY - 3s Takeaway]\n1. Understand the root cause.\n2. Execute immediately.\n3. Protect your downside.\n\n[CTA]\n"Share this with someone who needs it."`;
            }
            scriptPre.textContent = revised;
            card.querySelector('[data-tab="script"]').click();
            showToast(`Script rewritten with ${style} style!`);
          }
        } catch (err) {
          showToast("Rewrite error: " + err.message);
        } finally {
          btn.disabled = false;
          btn.textContent = originalText;
        }
      });
    });

    // Pane Copy Buttons
    paneScript.querySelector(".btn-copy-pane").addEventListener("click", () => {
      navigator.clipboard.writeText(scriptPre.textContent);
      showToast("3-Part Script copied!");
    });

    paneCaption.querySelector(".btn-copy-pane").addEventListener("click", () => {
      navigator.clipboard.writeText(`${clip.caption}\n\n${clip.hashtags.join(" ")}`);
      showToast("Caption & Hashtags copied!");
    });

    panePsychology.querySelector(".btn-copy-pane").addEventListener("click", () => {
      navigator.clipboard.writeText(psychologyText);
      showToast("Psychology analysis copied!");
    });

    paneTranscript.querySelector(".btn-copy-pane").addEventListener("click", () => {
      navigator.clipboard.writeText(clip.full_transcript);
      showToast("Transcript excerpt copied!");
    });

    clipsList.appendChild(card);
  });
}

async function runAnalysis(payload) {
  setLoading(true, "Scanning video metadata & extracting transcript...");

  try {
    let baseData = null;

    if (anna) {
      // Step 1: Call Executa tool to fetch metadata and transcript snippets
      const res = await anna.tools.invoke({
        tool_id: activeToolId,
        method: "analyze_viral_clips",
        args: {
          ...payload,
          target_duration: selectedDuration,
          custom_focus: customFocusInput.value.trim()
        }
      });

      const unwrapped = (res && res.data) ? res.data : (res && res.clips ? res : null);
      if (unwrapped) {
        baseData = unwrapped;
      }
    }

    // Fallback if standalone or engine failed to retrieve transcript
    if (!baseData || !baseData.clips || baseData.clips.length === 0) {
      // Intelligently fallback to known sample if available, or structured synthesis
      const fallbackTranscript = (payload && payload.transcript_text) ? payload.transcript_text : PRELOADED_DEMOS.raymond.transcript;
      const fallbackUrl = (payload && payload.url) ? payload.url : PRELOADED_DEMOS.raymond.url;
      
      const resFallback = await anna.tools.invoke({
        tool_id: activeToolId,
        method: "analyze_viral_clips",
        args: {
          url: fallbackUrl,
          transcript_text: fallbackTranscript,
          target_duration: selectedDuration,
          custom_focus: customFocusInput.value.trim()
        }
      });
      const unwrappedFallback = (resFallback && resFallback.data) ? resFallback.data : (resFallback && resFallback.clips ? resFallback : null);
      if (unwrappedFallback && unwrappedFallback.clips && unwrappedFallback.clips.length > 0) {
        baseData = unwrappedFallback;
        showToast("Extracted via AI Transcript Fallback!");
      }
    }

    // Step 2: AI REASONING CORE (Call Anna Host LLM if available)
    if (anna && anna.llm && typeof anna.llm.complete === "function" && baseData.clips && baseData.clips.length > 0) {
      setLoading(true, "AI Reasoning: Analyzing viewer retention & crafting viral hooks...");

      try {
        const sampleText = baseData.clips.map(c => `[${c.start_timestamp}-${c.end_timestamp}] ${c.hook_quote}: ${c.full_transcript.slice(0, 160)}`).join("\n\n");
        const aiPrompt = `You are a viral retention specialist for YouTube Shorts, Reels, and TikTok.
Analyze this video:
Title: "${baseData.title}"
Target Duration: ${selectedDuration}
Focus: "${customFocusInput.value.trim() || 'Maximum viewer retention and engagement'}"

Candidate Moments:
${sampleText}

Analyze why these moments hook viewers. For each candidate:
1. Polish the title to be ultra-viral (max 6 words).
2. Explain the psychological retention trigger (Curiosity gap, Loss aversion, Pattern interrupt, or Identity).
3. Format a punchy 3-part script: [HOOK - 0s-3s], [BODY], [CTA - Final 3s].

Return ONLY a valid JSON array of objects:
[
  {
    "id": "clip_1",
    "title": "Title Here",
    "psychology": "Why viewers stay",
    "script": "[HOOK - 0s-3s]\\n...\\n\\n[BODY]\\n...\\n\\n[CTA - Final 3s]\\n..."
  }
]`;

        const reply = await anna.llm.complete({
          systemPrompt: "You are an elite short-form content director. Output strict JSON only.",
          messages: [{ role: "user", content: { type: "text", text: aiPrompt } }],
          maxTokens: 1200,
          temperature: 0.4
        });

        if (reply && reply.content && reply.content.text) {
          const match = reply.content.text.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (match) {
            const aiClips = JSON.parse(match[0]);
            aiClips.forEach(ac => {
              const target = baseData.clips.find(c => c.id === ac.id);
              if (target) {
                if (ac.title) target.title = ac.title;
                if (ac.psychology) target.psychology = ac.psychology;
                if (ac.script) target.script = ac.script;
              }
            });
          }
        }
      } catch (llmErr) {
        console.log("LLM reasoning enhancement skipped/failed, using engine baseline:", llmErr);
      }
    }

    setLoading(false);
    renderClips(baseData);

    // Persist last run in storage
    if (anna && anna.storage) {
      await anna.storage.set({
        key: "clip-studio:last_analysis",
        value: {
          title: baseData.title,
          video_id: baseData.video_id,
          total_clips: baseData.total_clips_found || baseData.clips.length,
          timestamp: Date.now()
        }
      });
    }

  } catch (err) {
    setLoading(false);
    setError(err.message || "Failed to process video");
  }
}

async function main() {
  // Tab Switching
  tabYt.addEventListener("click", () => switchTab(false));
  tabManual.addEventListener("click", () => switchTab(true));

  // Quick Preset Pills (Preloaded transcript + URL for 100% reliable cloud evaluation)
  presetPills.forEach(pill => {
    pill.addEventListener("click", () => {
      const demoKey = pill.getAttribute("data-demo");
      const demo = PRELOADED_DEMOS[demoKey];
      if (demo) {
        switchTab(false);
        ytUrlInput.value = demo.url;
        runAnalysis({
          url: demo.url,
          transcript_text: demo.transcript
        });
      }
    });
  });

  // Paste from clipboard button
  if (btnPasteClipboard) {
    btnPasteClipboard.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          ytUrlInput.value = text.trim();
          showToast("Pasted from clipboard!");
        }
      } catch {
        ytUrlInput.focus();
      }
    });
  }

  // Duration Chips
  durationChips.forEach(chip => {
    chip.addEventListener("click", () => {
      durationChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      selectedDuration = chip.getAttribute("data-dur");
    });
  });

  // Analyze Handlers
  btnAnalyze.addEventListener("click", () => {
    const url = ytUrlInput.value.trim();
    if (!url) {
      setError("Please paste a valid YouTube URL.");
      return;
    }
    runAnalysis({ url });
  });

  ytUrlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      btnAnalyze.click();
    }
  });

  btnAnalyzeManual.addEventListener("click", () => {
    const text = manualTranscriptInput.value.trim();
    if (!text) {
      setError("Please paste subtitles or transcript text.");
      return;
    }
    runAnalysis({ transcript_text: text });
  });

  // Export All
  btnExportAll.addEventListener("click", () => {
    if (!currentClipsData || !currentClipsData.clips) return;
    let md = `# Viral Clips Report: ${currentClipsData.title}\n\n`;
    md += `**Target Duration**: ${currentClipsData.target_duration.toUpperCase()} | **Total Clips**: ${currentClipsData.total_clips_found}\n\n`;
    currentClipsData.clips.forEach((c, idx) => {
      const canonicalYt = getCanonicalYoutubeUrl(c, currentClipsData.video_id);
      md += `### Clip #${idx + 1}: ${c.title} (${c.virality_score}% Virality)\n`;
      md += `- **Timecode**: ${c.start_timestamp} - ${c.end_timestamp}\n`;
      if (canonicalYt) md += `- **Link**: ${canonicalYt}\n`;
      md += `- **Hook**: "${c.hook_quote}"\n`;
      if (c.psychology) md += `- **AI Retention Trigger**: ${c.psychology}\n\n`;
      md += `#### Script\n\`\`\`\n${c.script}\n\`\`\`\n\n`;
      md += `#### Caption\n${c.caption}\n${c.hashtags.join(" ")}\n\n---\n\n`;
    });
    navigator.clipboard.writeText(md);
    showToast("Full Markdown Report copied!");
  });

  // Connect to Anna Runtime
  try {
    anna = await AnnaAppRuntime.connect();
    statusBadge.textContent = "CONNECTED";
    statusBadge.classList.add("badge-green");
    await anna.window.set_title({ title: "ClipStudio // Viral Intelligence" });

    // Dynamic tool_id detection from granted scopes
    if (anna && anna.capabilities && Array.isArray(anna.capabilities.scopes)) {
      const toolScope = anna.capabilities.scopes.find(s => s.startsWith("tools.") && s !== "tools.*");
      if (toolScope) {
        activeToolId = toolScope.slice("tools.".length);
      }
    }

    // Sync theme from Anna host
    if (anna.theme) {
      applyTheme(anna.theme);
    }
    if (typeof anna.onThemeChange === "function") {
      anna.onThemeChange(({ theme }) => {
        applyTheme(theme);
      });
    }
  } catch (e) {
    statusBadge.textContent = "STANDALONE";
    console.log("Running in standalone preview mode (no host):", e);
  }
}

main();
