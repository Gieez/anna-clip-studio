// ClipStudio AI — Anna App Client Bundle
import { AnnaAppRuntime } from "/static/anna-apps/_sdk/latest/index.js";

const TOOL_ID = "tool-dev-clip-studio";

let anna = null;
let currentClipsData = null;

// UI Elements
const statusBadge = document.getElementById("connection-status");
const tabYt = document.getElementById("tab-yt");
const tabManual = document.getElementById("tab-manual");
const panelYt = document.getElementById("panel-yt");
const panelManual = document.getElementById("panel-manual");

const ytUrlInput = document.getElementById("yt-url");
const manualTranscriptInput = document.getElementById("manual-transcript");
const customFocusInput = document.getElementById("custom-focus");
const durationChips = document.querySelectorAll("#duration-group .chip");

const btnAnalyze = document.getElementById("btn-analyze");
const btnAnalyzeManual = document.getElementById("btn-analyze-manual");
const btnExportAll = document.getElementById("btn-export-all");

const loadingState = document.getElementById("loading-state");
const loadingText = document.getElementById("loading-text");
const errorState = document.getElementById("error-state");
const errorMessage = document.getElementById("error-message");
const resultsPanel = document.getElementById("results-panel");

const metaThumb = document.getElementById("meta-thumb");
const metaTitle = document.getElementById("meta-title");
const metaAuthor = document.getElementById("meta-author");
const metaDuration = document.getElementById("meta-duration");
const metaClipsCount = document.getElementById("meta-clips-count");
const clipsList = document.getElementById("clips-list");
const toast = document.getElementById("toast");

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

function setLoading(isLoading, text = "Analyzing video...") {
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

  // Render Cards
  clipsList.innerHTML = "";

  if (!data.clips || data.clips.length === 0) {
    clipsList.innerHTML = `<div class="clip-card"><p class="text-muted">No high-retention clips met the threshold for this duration. Try selecting a different duration or adjusting custom focus.</p></div>`;
    return;
  }

  data.clips.forEach((clip, index) => {
    const card = document.createElement("div");
    card.className = "clip-card";

    const scoreColorClass = clip.virality_score >= 88 ? "badge-green" : "badge-amber";
    const canonicalYtUrl = getCanonicalYoutubeUrl(clip, data.video_id);

    card.innerHTML = `
      <div class="card-top">
        <div class="card-top-left">
          <span class="clip-id-tag">#${index + 1}</span>
          <span class="virality-pill ${scoreColorClass}">${clip.virality_score}% VIRALITY</span>
          <span class="badge">${clip.duration}s</span>
        </div>
        <div>
          ${canonicalYtUrl ? `<a href="${canonicalYtUrl}" target="_blank" rel="noopener noreferrer" class="timecode-link">▶ ${clip.start_timestamp} - ${clip.end_timestamp}</a>` : `<span class="badge">${clip.start_timestamp} - ${clip.end_timestamp}</span>`}
        </div>
      </div>
      <h4 class="clip-title">${clip.title}</h4>
      <div class="hook-box">
        "${clip.hook_quote}"
      </div>
      <div class="clip-actions">
        <button class="btn-action btn-copy-script" data-id="${clip.id}">📋 Copy Script</button>
        <button class="btn-action btn-copy-caption" data-id="${clip.id}">💬 Copy Caption</button>
        <button class="btn-action btn-copy-timestamps" data-id="${clip.id}">⏱️ Copy Timecode</button>
      </div>
    `;

    // Action listeners
    const timeLink = card.querySelector(".timecode-link");
    if (timeLink) {
      timeLink.addEventListener("click", () => {
        navigator.clipboard.writeText(canonicalYtUrl);
        showToast("YouTube link (" + clip.start_timestamp + ") copied!");
      });
    }

    card.querySelector(".btn-copy-script").addEventListener("click", () => {
      navigator.clipboard.writeText(clip.script);
      showToast("Shorts Script copied!");
    });

    card.querySelector(".btn-copy-caption").addEventListener("click", () => {
      const fullCaption = `${clip.caption}\n\n${clip.hashtags.join(" ")}`;
      navigator.clipboard.writeText(fullCaption);
      showToast("Caption & Hashtags copied!");
    });

    card.querySelector(".btn-copy-timestamps").addEventListener("click", () => {
      const timecodeText = `${clip.title} (${clip.start_timestamp} - ${clip.end_timestamp})\n${canonicalYtUrl}`;
      navigator.clipboard.writeText(timecodeText);
      showToast("Timecode & link copied!");
    });

    clipsList.appendChild(card);
  });
}

async function runAnalysis(payload) {
  setLoading(true, "Extracting video transcript & calculating virality score...");

  if (!anna) {
    // Standalone fallback mock
    setTimeout(() => {
      setLoading(false);
      renderClips({
        video_id: "demo123",
        title: "Demo: How Creators Build 6-Figure Audiences",
        author: "Creator Lab",
        thumbnail_url: "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
        target_duration: selectedDuration,
        total_clips_found: 2,
        clips: [
          {
            id: "clip_1",
            title: "The Biggest Retention Mistake Nobody Tells You",
            start_time: 14.0,
            end_time: 44.0,
            start_timestamp: "00:14",
            end_timestamp: "00:44",
            duration: 30.0,
            virality_score: 95,
            hook_quote: "The biggest mistake creators make is waiting until the middle to drop the value.",
            script: "[HOOK]\n\"The biggest mistake creators make...\"\n\n[BODY]\n\"Drop value in first 5s.\"\n\n[CTA]\n\"Subscribe for more.\"",
            caption: "🔥 The biggest retention mistake creators make.\n\nWatch (00:14 - 00:44).",
            hashtags: ["#shorts", "#creator", "#viral"],
            youtube_url: "https://youtu.be/demo?t=14"
          }
        ]
      });
    }, 800);
    return;
  }

  try {
    const res = await anna.tools.invoke({
      tool_id: TOOL_ID,
      method: "analyze_viral_clips",
      args: {
        ...payload,
        target_duration: selectedDuration,
        custom_focus: customFocusInput.value.trim()
      }
    });

    setLoading(false);
    const clipsPayload = (res && res.data) ? res.data : (res && res.clips ? res : null);
    if (clipsPayload && Array.isArray(clipsPayload.clips)) {
      renderClips(clipsPayload);
      // Persist last run in storage
      if (anna && anna.storage) {
        await anna.storage.set({
          key: "clip-studio:last_analysis",
          value: {
            title: clipsPayload.title,
            video_id: clipsPayload.video_id,
            total_clips: clipsPayload.total_clips_found || clipsPayload.clips.length,
            timestamp: Date.now()
          }
        });
      }
    } else {
      setError(res ? (res.error || "Analysis returned no clips") : "Empty response from engine");
    }
  } catch (err) {
    setLoading(false);
    setError(err.message || "Failed to communicate with Executa plugin");
  }
}

async function main() {
  // Tab Switching
  tabYt.addEventListener("click", () => switchTab(false));
  tabManual.addEventListener("click", () => switchTab(true));

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
      md += `### Clip #${idx + 1}: ${c.title} (${c.virality_score}% Virality)\n`;
      md += `- **Timecode**: ${c.start_timestamp} - ${c.end_timestamp}\n`;
      if (c.youtube_url) md += `- **Link**: ${c.youtube_url}\n`;
      md += `- **Hook**: "${c.hook_quote}"\n\n`;
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
