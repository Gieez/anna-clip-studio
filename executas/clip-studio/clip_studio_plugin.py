"""ClipStudio AI — Executa plugin for YouTube viral intelligence and clipping.

Provides tools for fetching YouTube video metadata and transcripts,
analyzing retention hotspots, and extracting ready-to-publish short clips.
"""

import json
import re
import sys
import urllib.request
import urllib.parse
from typing import List, Dict, Any, Optional

MANIFEST = {
    "display_name": "ClipStudio Engine",
    "version": "0.3.2",
    "description": "YouTube viral clipping engine, transcript intelligence, and hook extraction.",
    "host_capabilities": ["llm.sample"],
    "tools": [
        {
            "name": "fetch_video_info",
            "description": "Fetch YouTube video metadata (title, author, thumbnail) and timed transcript.",
            "parameters": [
                {
                    "name": "url",
                    "type": "string",
                    "description": "YouTube video URL or 11-character video ID",
                    "required": True,
                }
            ],
            "timeout": 30,
        },
        {
            "name": "analyze_viral_clips",
            "description": "Analyze video transcript to discover high-retention viral clips, hooks, and scripts.",
            "parameters": [
                {
                    "name": "url",
                    "type": "string",
                    "description": "YouTube URL (optional if transcript_text is provided)",
                    "required": False,
                },
                {
                    "name": "target_duration",
                    "type": "string",
                    "description": "Target duration for generated clips (default 30s)",
                    "required": False,
                    "default": "30s",
                    "enum": ["15s", "30s", "60s"],
                },
                {
                    "name": "custom_focus",
                    "type": "string",
                    "description": "Optional thematic focus (e.g. 'actionable advice', 'controversial truth')",
                    "required": False,
                },
                {
                    "name": "transcript_text",
                    "type": "string",
                    "description": "Optional manual transcript text or SRT format",
                    "required": False,
                },
            ],
            "timeout": 60,
        },
        {
            "name": "ping",
            "description": "Smoke-test method.",
            "parameters": [],
            "timeout": 10,
        },
    ],
    "credentials": [],
    "runtime": {"type": "binary"},
}


def extract_video_id(url: str) -> Optional[str]:
    """Extracts 11-character YouTube video ID."""
    url = url.strip()
    if len(url) == 11 and re.match(r"^[a-zA-Z0-9_-]{11}$", url):
        return url
    patterns = [
        r"(?:v=|\/v\/|embed\/|shorts\/|youtu\.be\/|\/watch\?v=|\/watch\?.+&v=)([^#\&\?]{11})",
        r"^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^#\&\?]{11})"
    ]
    for pattern in patterns:
        m = re.search(pattern, url)
        if m:
            return m.group(1)
    return None


def fetch_oembed(video_id: str) -> Dict[str, Any]:
    """Fetches video metadata via YouTube oEmbed."""
    oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    req = urllib.request.Request(oembed_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode("utf-8", errors="ignore"))
            return {
                "title": data.get("title", f"YouTube Video ({video_id})"),
                "author": data.get("author_name", "YouTube Creator"),
                "thumbnail_url": data.get("thumbnail_url", f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"),
            }
    except Exception:
        return {
            "title": f"YouTube Video ({video_id})",
            "author": "Creator",
            "thumbnail_url": f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
        }


def fetch_transcript_snippets(video_id: str) -> List[Dict[str, Any]]:
    """Fetches transcript snippets using youtube_transcript_api with multi-language fallback."""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        api = YouTubeTranscriptApi()
        fetched = None

        # 1. First try listing all available transcripts (supports any language: id, en, es, zh, etc.)
        if hasattr(api, "list"):
            try:
                transcript_list = api.list(video_id)
                # Prioritize Indonesian or English if available, else take the very first available transcript
                target_transcript = None
                for candidate in transcript_list:
                    code = getattr(candidate, "language_code", "").lower()
                    if code.startswith("id") or code.startswith("en"):
                        target_transcript = candidate
                        break
                if not target_transcript:
                    for candidate in transcript_list:
                        target_transcript = candidate
                        break

                if target_transcript:
                    fetched = target_transcript.fetch()
            except Exception as list_err:
                sys.stderr.write(f"[clip-studio] api.list failed: {list_err}\n")

        # 2. Fallback: try direct fetch with common languages
        if not fetched and hasattr(api, "fetch"):
            common_langs = ("id", "en", "es", "zh-Hans", "zh-Hant", "ja", "ko", "de", "fr", "pt", "ru")
            for lang in common_langs:
                try:
                    fetched = api.fetch(video_id, languages=(lang,))
                    if fetched:
                        break
                except Exception:
                    continue

        # 3. Last resort direct fetch without lang filter
        if not fetched and hasattr(api, "fetch"):
            try:
                fetched = api.fetch(video_id)
            except Exception:
                pass

        if fetched:
            snippets = []
            for item in fetched:
                text = getattr(item, "text", "") if hasattr(item, "text") else item.get("text", "")
                start = getattr(item, "start", 0.0) if hasattr(item, "start") else item.get("start", 0.0)
                duration = getattr(item, "duration", 0.0) if hasattr(item, "duration") else item.get("duration", 0.0)
                snippets.append({
                    "start": round(float(start), 2),
                    "duration": round(float(duration), 2),
                    "text": text.replace("\n", " ").strip()
                })
            return snippets
    except Exception as exc:
        sys.stderr.write(f"[clip-studio] Transcript fetch error: {exc}\n")

    return []


def parse_raw_text_transcript(content: str, default_duration: float = 120.0) -> List[Dict[str, Any]]:
    """Parses SRT or raw text into timed snippets."""
    content = content.replace("\r\n", "\n").strip()
    if not content:
        return []

    # 1. Match timestamp arrow pattern (SRT or VTT)
    pattern = r"(\d{1,2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{3})"
    splits = list(re.finditer(pattern, content))
    if splits:
        def to_sec(ts: str) -> float:
            parts = ts.replace(",", ".").split(":")
            if len(parts) == 3:
                return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
            elif len(parts) == 2:
                return int(parts[0]) * 60 + float(parts[1])
            return float(parts[0])

        snippets = []
        for i, m in enumerate(splits):
            st_str, en_str = m.group(1), m.group(2)
            start_pos = m.end()
            end_pos = splits[i + 1].start() if i + 1 < len(splits) else len(content)
            text_block = content[start_pos:end_pos].strip()
            # Clean trailing digit index if next block starts with number
            text_block = re.sub(r"\n\d+$", "", text_block).replace("\n", " ").strip()
            st = to_sec(st_str)
            en = to_sec(en_str)
            snippets.append({
                "start": round(st, 2),
                "duration": round(max(0.5, en - st), 2),
                "text": text_block
            })
        return snippets

    # 2. Match line single timestamps like [01:23] or 01:23 Text
    line_ts_pattern = r"^[\[\(]?(\d{1,2}:\d{2}(?::\d{2})?)[\]\)]?\s*(.*)$"
    lines = content.split("\n")
    ts_lines = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        m = re.match(line_ts_pattern, line)
        if m:
            ts_str, text_val = m.groups()
            def line_to_sec(ts):
                p = ts.split(":")
                return int(p[0]) * 3600 + int(p[1]) * 60 + float(p[2]) if len(p) == 3 else int(p[0]) * 60 + float(p[1])
            ts_lines.append({"start": line_to_sec(ts_str), "text": text_val.strip()})

    if ts_lines:
        snippets = []
        for i in range(len(ts_lines)):
            st = ts_lines[i]["start"]
            nxt_st = ts_lines[i + 1]["start"] if i + 1 < len(ts_lines) else st + 5.0
            snippets.append({
                "start": round(st, 2),
                "duration": round(max(1.0, nxt_st - st), 2),
                "text": ts_lines[i]["text"]
            })
        return snippets

    # 3. Fallback: sentence splitting distributed evenly
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+|\n+", content) if s.strip()]
    if not sentences:
        return []
    step = default_duration / len(sentences)
    snippets = []
    for i, s in enumerate(sentences):
        snippets.append({
            "start": round(i * step, 2),
            "duration": round(step, 2),
            "text": s
        })
    return snippets


def format_timestamp(seconds: float) -> str:
    """Formats seconds into MM:SS or HH:MM:SS."""
    seconds = int(seconds)
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"


HOOK_TRIGGER_WORDS = [
    "secret", "mistake", "never", "always", "truth", "why", "stop", "biggest",
    "how to", "guaranteed", "shocking", "nobody talks about", "warning", "real reason",
    "game changer", "hacks", "proven", "money", "insane", "million", "success", "fail",
    "terbukti", "jangan", "rahasia", "kesalahan", "trik", "penting", "alasan", "viral"
]


def score_snippet(text: str) -> float:
    """Scores a text snippet for hook potential and emotional density."""
    score = 10.0
    text_lower = text.lower()

    # Hook words presence
    for w in HOOK_TRIGGER_WORDS:
        if w in text_lower:
            score += 8.0

    # Question mark indicates intrigue
    if "?" in text:
        score += 12.0

    # Numbers and statistics
    if re.search(r"\b\d+(?:%|\$|k|m|x)?\b", text_lower):
        score += 7.0

    # Exclamation or high energy
    if "!" in text:
        score += 5.0

    # Ideal length for delivery
    word_count = len(text.split())
    if 6 <= word_count <= 25:
        score += 5.0

    return min(score, 60.0)


def extract_clips_from_snippets(
    snippets: List[Dict[str, Any]],
    target_duration_sec: float = 30.0,
    video_id: str = "",
    custom_focus: str = ""
) -> List[Dict[str, Any]]:
    """Extracts high-virality short clip candidates using rolling window analysis."""
    if not snippets:
        return []

    windows = []
    n = len(snippets)

    # Rolling window clustering
    for i in range(n):
        cur_text_parts = []
        start_time = snippets[i]["start"]
        cur_time = start_time
        j = i

        while j < n and (snippets[j]["start"] + snippets[j]["duration"] - start_time) <= target_duration_sec + 8.0:
            cur_text_parts.append(snippets[j]["text"])
            cur_time = snippets[j]["start"] + snippets[j]["duration"]
            j += 1
            if (cur_time - start_time) >= target_duration_sec - 5.0:
                break

        duration = cur_time - start_time
        if duration >= 10.0:
            full_text = " ".join(cur_text_parts).strip()
            hook_part = snippets[i]["text"]
            raw_score = score_snippet(hook_part) + (score_snippet(full_text) * 0.4)

            # Bonus for custom focus alignment
            if custom_focus and custom_focus.lower() in full_text.lower():
                raw_score += 15.0

            # Scale to 68 - 98 range
            virality = int(min(98, max(68, 65 + (raw_score * 0.5))))

            windows.append({
                "start": start_time,
                "end": cur_time,
                "duration": round(duration, 1),
                "text": full_text,
                "hook": hook_part,
                "virality": virality,
            })

    # Sort by virality score descending
    windows.sort(key=lambda w: w["virality"], reverse=True)

    # Deduplicate overlapping clips (keep minimum 15s separation)
    selected_clips = []
    for w in windows:
        is_overlapping = False
        for s in selected_clips:
            # Check overlap
            if not (w["end"] <= s["start"] + 10 or w["start"] >= s["end"] - 10):
                is_overlapping = True
                break
        if not is_overlapping:
            selected_clips.append(w)
        if len(selected_clips) >= 5:
            break

    # Format into professional clip candidate objects
    output_clips = []
    for idx, c in enumerate(selected_clips):
        clip_num = idx + 1
        st_fmt = format_timestamp(c["start"])
        en_fmt = format_timestamp(c["end"])

        # Generate catchy title
        words = [w for w in re.sub(r"[^\w\s]", "", c["hook"]).split() if len(w) > 3][:6]
        short_title = " ".join(words).title() if words else f"Viral Moment #{clip_num}"

        # Script structure
        script_text = (
            f"[HOOK - 0s-3s]\n\"{c['hook']}\"\n\n"
            f"[BODY - 3s-{int(c['duration'])-3}s]\n\"{c['text']}\"\n\n"
            f"[CTA - Final 3s]\n\"Save this clip and share your thoughts below!\""
        )

        caption_text = (
            f"🔥 {short_title}\n\n"
            f"\"{c['hook']}\"\n\n"
            f"Watch the full breakdown ({st_fmt} - {en_fmt}). What do you think?"
        )

        yt_link = f"https://www.youtube.com/watch?v={video_id}&t={int(c['start'])}s" if video_id else ""

        output_clips.append({
            "id": f"clip_{clip_num}",
            "title": short_title,
            "start_time": c["start"],
            "end_time": c["end"],
            "start_timestamp": st_fmt,
            "end_timestamp": en_fmt,
            "duration": c["duration"],
            "virality_score": c["virality"],
            "hook_quote": c["hook"],
            "full_transcript": c["text"],
            "script": script_text,
            "caption": caption_text,
            "hashtags": ["#shorts", "#reels", "#viral", "#clipstudio", "#creator"],
            "youtube_url": yt_link
        })

    return output_clips


def handle_fetch_video_info(args: dict) -> dict:
    url = args.get("url", "").strip()
    video_id = extract_video_id(url)
    if not video_id:
        return {"success": False, "error": f"Invalid YouTube URL or ID: {url}"}

    meta = fetch_oembed(video_id)
    snippets = fetch_transcript_snippets(video_id)

    total_duration = 0.0
    if snippets:
        total_duration = round(snippets[-1]["start"] + snippets[-1]["duration"], 1)

    return {
        "success": True,
        "data": {
            "video_id": video_id,
            "title": meta["title"],
            "author": meta["author"],
            "thumbnail_url": meta["thumbnail_url"],
            "has_transcript": len(snippets) > 0,
            "total_snippets": len(snippets),
            "estimated_duration_sec": total_duration,
            "formatted_duration": format_timestamp(total_duration),
            "snippets": snippets,
            "preview_snippets": snippets[:10]
        }
    }


def handle_analyze_viral_clips(args: dict) -> dict:
    url = args.get("url", "").strip()
    target_dur = args.get("target_duration", "30s").strip().lower()
    custom_focus = args.get("custom_focus", "").strip()
    transcript_text = args.get("transcript_text", "").strip()

    dur_seconds = 30.0
    if target_dur == "15s":
        dur_seconds = 15.0
    elif target_dur == "60s":
        dur_seconds = 60.0

    video_id = ""
    meta = {"title": "Uploaded Transcript Analysis", "author": "Manual Input", "thumbnail_url": ""}

    if url:
        video_id = extract_video_id(url) or ""
        if video_id:
            meta = fetch_oembed(video_id)

    snippets = []
    if transcript_text:
        snippets = parse_raw_text_transcript(transcript_text)
    elif video_id:
        snippets = fetch_transcript_snippets(video_id)

    if not snippets:
        return {
            "success": False,
            "error": "No transcript available. Video might not have closed captions, or provide manual transcript text."
        }

    clips = extract_clips_from_snippets(
        snippets=snippets,
        target_duration_sec=dur_seconds,
        video_id=video_id,
        custom_focus=custom_focus
    )

    return {
        "success": True,
        "data": {
            "video_id": video_id,
            "title": meta["title"],
            "author": meta["author"],
            "thumbnail_url": meta["thumbnail_url"],
            "target_duration": target_dur,
            "total_clips_found": len(clips),
            "clips": clips
        }
    }


def invoke(method: str, args: dict) -> dict:
    if method == "ping":
        return {"success": True, "data": {"pong": True, "service": "clip-studio-engine"}}
    if method == "fetch_video_info":
        return handle_fetch_video_info(args)
    if method == "analyze_viral_clips":
        return handle_analyze_viral_clips(args)
    return {"success": False, "error": f"unknown method: {method}"}


def main() -> None:
    try:
        if hasattr(sys.stdin, "reconfigure"):
            sys.stdin.reconfigure(encoding="utf-8")
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

    while True:
        line = sys.stdin.readline()
        if not line:
            break
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
        except Exception:
            continue

        req_id = req.get("id")
        try:
            method = req.get("method")
            if method == "initialize":
                result = {
                    "protocolVersion": "2.0",
                    "server_info": {"name": MANIFEST.get("display_name", "ClipStudio Engine"), "version": MANIFEST["version"]},
                    "capabilities": {"sampling": {}},
                }
            elif method == "describe":
                result = MANIFEST
            elif method == "health":
                result = {"status": "ready"}
            elif method == "invoke":
                params = req.get("params") or {}
                tool_name = params.get("tool") or params.get("method") or ""
                arguments = params.get("arguments") or params.get("args") or {}
                result = invoke(tool_name, arguments)
            else:
                raise ValueError(f"unknown rpc method: {method}")

            sys.stdout.write(json.dumps({"jsonrpc": "2.0", "id": req_id, "result": result}, ensure_ascii=False) + "\n")
        except Exception as e:
            sys.stdout.write(
                json.dumps(
                    {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "error": {"code": -32601, "message": str(e)},
                    },
                    ensure_ascii=False
                )
                + "\n"
            )
        sys.stdout.flush()


if __name__ == "__main__":
    main()
