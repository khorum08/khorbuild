---
title: KhorVideo v1 — Runtime Fixes, Hover Thumbnails, and v0.2.0 Release Prep
date: 2026-05-07
session: 4
agent: Claude Sonnet 4.6 (Claude Code)
tags: [khorvideo, tauri, rust, thumbnails, webm, release, bugfix]
summary: Fixed Tauri async runtime panic, switched thumbnails to hover-play WebM, surfaced FFmpeg errors to the console, resolved webp cache migration issue, and bumped to v0.2.0 for MSI release build.
prs: [14, 15, 16, 17, 18, 19]
---

## Session Summary

Continuation of session 3. The app now launches correctly, thumbnails generate as hoverable WebM clips, all FFmpeg errors surface to the UI console, and the project is version-bumped to 0.2.0 ready for `cargo tauri build`.

---

## Key Decisions & Outcomes

### PR #14 — Tauri async_runtime fix
**Problem**: `tokio::spawn` inside Tauri's `.setup()` closure panicked with "there is no reactor running" on first launch.  
**Root cause**: `.setup()` runs synchronously before the Tokio reactor is active.  
**Fix**: Replaced all `tokio::spawn` and `tokio::task::spawn_blocking` calls in `main.rs`, `thumbnailer.rs`, and `commands.rs` with `tauri::async_runtime::spawn` / `tauri::async_runtime::spawn_blocking`. Tokio type imports (`mpsc`, `Mutex`, `Semaphore`, etc.) unchanged.

### PR #15 — Hover-to-play WebM thumbnails
**Problem**: Animated WebP in `<img>` cannot be paused via CSS or JS — always plays.  
**Decision**: Switch to VP8 WebM clips served via `<video>` element, which allows JS playback control.  
**FFmpeg command**: `ffmpeg -y -ss 0 -t 4 -i input -vf fps=8,scale=240:-2:flags=lanczos -c:v libvpx -b:v 300k -an output.webm`  
**Frontend**: `<video muted loop playsInline preload="auto">` with `onMouseEnter → play()` and `onMouseLeave → pause(); currentTime = 0`. Uses `e.currentTarget` directly — no refs needed.  
**Cache migration**: Orphan cleanup extended to also purge entries where the thumb file doesn't exist on disk (handles `.webp` → `.webm` transition).

### PR #16 — libvpx even-height fix
VP8/libvpx silently rejects frames with odd height. `scale=240:-1` computes exact proportional height which can be odd. Changed to `scale=240:-2` which rounds to nearest even number.

### PR #17 — FFmpeg error surfacing
`generate_thumb` previously piped both stdout and stderr to `Stdio::null()`. Failures returned `None` silently.  
**Fix**: Captures stderr via `Stdio::piped()`, returns `Result<(), String>`. `do_generate` propagates as `Result<Option<...>, String>`. Worker emits `thumbnail:error` event on failure. Frontend logs `[THUMB] filename: <ffmpeg stderr>` as a warn line in the console via `onThumbnailError` listener wired in `init()`.

### PR #18 — .webp cache invalidation
**Problem**: Old `.webp` thumb files still existed on disk, so orphan cleanup's missing-file check passed. Cache hit check served `.webp` paths to `<video>` elements which cannot play image files.  
**Fix**: Added `entry.thumb.ends_with(".webm")` guard in both:
- Cache hit check in `thumbnail_worker` (treats `.webp` entries as misses → triggers regeneration)
- Orphan cleanup filter (purges stale `.webp` entries from `index.json` and disk on next startup)

### PR #19 — Version bump to 0.2.0
Bumped `version` in `package.json`, `Cargo.toml`, and `tauri.conf.json` from `0.1.0` → `0.2.0`.

---

## Code / File Changes

```
src-tauri/src/main.rs          tokio::spawn → tauri::async_runtime::spawn
src-tauri/src/thumbnailer.rs   WebM generation, error surfacing, cache validation
src-tauri/src/commands.rs      tauri::async_runtime::spawn for concat reader tasks
src/lib/tauriApi.ts            onThumbnailError listener
src/store/useKhorVideoStore.ts onThumbnailError wired in init()
src/components/ExplorerPane.tsx  <img> → <video> with hover handlers
src/components/SequencePane.tsx  <img> → <video> with hover handlers
package.json                   0.1.0 → 0.2.0
src-tauri/Cargo.toml           0.1.0 → 0.2.0
src-tauri/tauri.conf.json      0.1.0 → 0.2.0
```

---

## Current App State (post-session-4 / v0.2.0)

| Feature | Status |
|---------|--------|
| App launches without panic | ✅ |
| Home folder auto-load on startup | ✅ |
| Native folder picker + tree nav with `..` | ✅ |
| WebM thumbnail generation (VP8, 4s, 8fps, 240px) | ✅ |
| Thumbnail hover-to-play, pauses on mouseout | ✅ |
| Thumbnail async cache (`%LOCALAPPDATA%\com.khorum.khorvideo\thumbcache\`) | ✅ |
| Thumbnails in explorer grid + sequence strip | ✅ |
| FFmpeg errors surface to console as `[THUMB]` warn lines | ✅ |
| Duration labels (auto-probed, fire-and-forget) | ✅ |
| Audio probe (manual, per-sequence) | ✅ |
| Drag + arrow-key sequence reordering | ✅ |
| Live FFmpeg concat output streaming to console | ✅ |
| MSI bundle (`bundle.active: true`, targets: msi) | ✅ |
| Version 0.2.0 | ✅ |

## Build Instructions (v0.2.0)

Prerequisites: Rust stable, Node 18+, FFmpeg on PATH, WebView2 (pre-installed Windows 10/11).

```powershell
cd prototypes/khorvideo-v1
git pull origin main
npm install
npm run tauri build
# MSI output: src-tauri\target\release\bundle\msi\KhorVideo_0.2.0_x64_en-US.msi
```

Note: FFmpeg is NOT bundled. End users must have FFmpeg + ffprobe on PATH.

---

## Outstanding Items & Next Steps

- **FFmpeg sidecar**: Bundle FFmpeg with the installer so end users don't need it pre-installed (v0.3 candidate)
- **Output path folder picker**: Native dialog for the output `.mp4` path (same dialog plugin already wired)
- **Cancel in-progress concat**: Kill the child process on demand
- **Video preview**: Click a thumbnail to play in a native `<video>` overlay
- **Drag-and-drop from OS**: Accept files dragged from Windows Explorer into the sequence
- **Promote to `builds/`**: Copy `khorvideo-v1` to `builds/khorvideo-v0.2.0/` snapshot per repo workflow

---

## Session 5 — Duration-in-Cache Refactor (PR #22)

**Date:** 2026-05-07  
**Agent:** Claude Sonnet 4.6 (Claude Code)

### Problem
Loading a folder with cached thumbnails still triggered one `ffprobe` call per video for duration — even on cache hits where the thumb file already existed. On a 131-file folder this meant 131 redundant ffprobe calls and 131 console window flashes despite zero thumbnail work needed.

### Solution
Consolidated duration probing into the thumbnail pipeline:

- `probe_duration_secs()` (already in `thumbnailer.rs`) is called once during `do_generate`, immediately after ffmpeg finishes
- `duration_secs: Option<f64>` added to `CacheWrite`, `ThumbnailReadyPayload`, and `IndexEntry` (with `#[serde(default)]` for backward compat)
- Cache hits now read `duration_secs` from `index.json` and emit it with the `thumbnail:ready` event
- `onThumbnailReady` frontend handler updated to carry `durationSecs: number | null` and set both `thumbnailSrc` and `durationLabel` in one state update

### Removed
| Item | Location |
|------|----------|
| `probe_durations` Tauri command | `commands.rs`, `main.rs` invoke_handler |
| `DurationResult` type | `src/types.ts` |
| `probeDurations` API wrapper | `src/lib/tauriApi.ts` |
| `setThumbnailSrc` store action | `useKhorVideoStore.ts` |
| `probeDurations` fire-and-forget in `loadDirectory` | `useKhorVideoStore.ts` |

### Result
Second load of any cached folder: zero ffprobe calls, zero console window flashes, duration labels appear immediately alongside thumbnails.
