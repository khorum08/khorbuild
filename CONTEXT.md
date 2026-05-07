---
title: CONTEXT.md - Agent Bootstrap Instructions
date: 2026-05-07
tags: [bootstrap, agent-instructions, context-loading, workflow]
status: active
---

# CONTEXT.md — Primary Agent Bootstrap File

**This is the first file any incoming agent (Grok, Claude, or other) should read.**

It defines the exact context loading order and ensures maximum continuity and correctness across sessions.

## Mandatory Context Loading Order

Every agent **must** follow this sequence before beginning any work:

1. **Read this file (`CONTEXT.md`)** — Current file
2. **Read `AGENTS.md`** (root level) — Core directives and behavior rules
3. **Check `workshop/INDEX.md`** — Overview of recent context logs
4. **Read the most recent log(s) in `workshop/`** — Full session context
5. **(Optional)** Read relevant entries from `memory/` if the task requires long-term project memory

## Development Workflow Stages

This project uses a staged development process:

- **`workshop/`** → Free-form brainstorming, ideation, and rough planning
- **`prototypes/`** → Experimental implementations of agreed build targets
- **`builds/`** → Mature, validated versions ready for production consideration
- **`src/`** → Final production code

Always respect the current stage of work when making changes.

## Quick Start for Agents

> **Step 1:** Load `CONTEXT.md`
> **Step 2:** Load `AGENTS.md`
> **Step 3:** Review latest workshop logs via `workshop/INDEX.md`
> **Step 4:** Identify current development stage and proceed accordingly

## Project Overview

This repository (`khorbuild`) is a video utility application focused on FFmpeg-based processing, automation, and agent-friendly workflows within the Khorum ecosystem.

## Current Project State (as of 2026-05-07)

### Active Prototype: `prototypes/khorvideo-v1`

A Tauri 2.0 + React 18 + TypeScript + Rust + Zustand desktop app for Windows. **Version 0.2.0** — ready for `cargo tauri build` MSI release.

**Tech stack:**
- Tauri 2.0 (WebView2, Rust backend, capabilities system)
- React 18 + Vite + TypeScript frontend
- Zustand for state management
- FFmpeg + ffprobe (must be on user PATH — not bundled)
- tokio async runtime via `tauri::async_runtime`
- sha2 crate for cache key generation

**Implemented features (all merged to main):**
- Home folder auto-load on startup via `get_home_dir` command
- Native Windows folder picker (`tauri-plugin-dialog`)
- Folder tree with `..` navigation
- Video explorer grid (131+ files tested)
- WebM thumbnail generation: VP8, 4s clip, 8fps, 240px wide, hover-to-play
- Async thumbnail cache at `%LOCALAPPDATA%\com.khorum.khorvideo\thumbcache\` (SHA-256 keyed, mtime+size validated)
- Thumbnails in both explorer grid and sequence strip
- FFmpeg errors surface to console as `[THUMB] filename: <stderr>` warn lines
- Duration labels stored in thumbnail cache; delivered via `thumbnail:ready` event (zero extra ffprobe calls on cache hits)
- Audio probe (manual, per-sequence)
- Drag + arrow-key sequence reordering
- Live FFmpeg concat output streaming to console (tokio::process, BufReader line-by-line)
- MSI bundle enabled (`bundle.active: true`, `targets: "msi"`)
- `CREATE_NO_WINDOW` flag on all ffmpeg/ffprobe spawns — no console flash on Windows

**Known runtime requirement:** FFmpeg and ffprobe must be on the user's PATH. Not bundled in installer.

**Build command:**
```powershell
cd prototypes/khorvideo-v1
npm run tauri dev      # development
npm run tauri build    # release MSI → src-tauri/target/release/bundle/msi/
```

**Key Rust files:**
- `src-tauri/src/main.rs` — setup, managed state, invoke_handler
- `src-tauri/src/thumbnailer.rs` — full thumbnail pipeline (worker + cache manager + orphan cleanup)
- `src-tauri/src/commands.rs` — all Tauri commands

**Key frontend files:**
- `src/store/useKhorVideoStore.ts` — all app state and async actions
- `src/lib/tauriApi.ts` — Tauri invoke wrappers and event listeners
- `src/components/` — ExplorerPane, SequencePane, TreePane, ConsolePane, TopBar, StatusBar

### Next Priorities (in rough order)

1. **Promote to `builds/`** — Snapshot `khorvideo-v1` as `builds/khorvideo-v0.2.0/` per repo workflow
2. **FFmpeg sidecar** — Bundle FFmpeg with the installer (v0.3 candidate)
3. **Output path folder picker** — Native dialog for output `.mp4` path
4. **Cancel in-progress concat** — Kill child process on demand
5. **Video preview** — Click thumbnail to play in a `<video>` overlay
6. **Drag-and-drop from OS** — Accept files dragged from Windows Explorer

## Notes for Future Agents

- Always use `tauri::async_runtime::spawn` — never `tokio::spawn` directly (panics in `.setup()`)
- Thumbnail cache format is `.webm` (VP8). Any `.webp` entries are treated as invalid and regenerated
- The branch `claude/amazing-elbakyan-9fa147` is the active worktree branch for Claude Code sessions
- PRs are merged by the user (khorum08); Claude pushes and creates PRs only

Last updated: 2026-05-07 (session 5)
