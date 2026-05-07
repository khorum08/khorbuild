---
title: KhorVideo v1 Scaffold Hardening
date: 2026-05-07
session_id: khorvideo-v1-scaffold-hardening
tags: [prototype, khorvideo, tauri, vite, react, scaffold]
summary: Hardened the Grok-started KhorVideo v1 Tauri/Vite prototype by adding build hygiene, modular frontend panes, plain CSS styling, and an initial Rust directory-listing command.
---

## Session Summary

Continued work in `prototypes/khorvideo-v1`, which is the current prototype stage for KhorVideo. The starting point was a minimal single-file React shell plus a very small Tauri Rust entrypoint. The session focused on converting that rough shell into a buildable, agent-friendly scaffold without attempting production FFmpeg behavior yet.

## Key Decisions & Outcomes

- Added repo-level ignore rules so generated dependencies, builds, Rust targets, logs, and editor noise stay out of Git.
- Added TypeScript project configuration so `npm run build` no longer drops into TypeScript help output.
- Avoided adding Tailwind because npm registry access returned `403 Forbidden`; implemented the prototype dark UI with plain CSS instead.
- Split the one-file UI into modular panes: top bar, folder tree, explorer grid, sequence strip, status bar, and console pane.
- Introduced Zustand state around mock folders, mock video files, sequence management, and console messages.
- Moved Tauri configuration into `src-tauri/tauri.conf.json`, added `build.rs`, and registered an initial `list_directory` backend command for later frontend wiring.
- Kept bundle output inactive for now because icon assets are not present yet.

## Code / File Changes

- Created `.gitignore` for dependency/build/log/editor hygiene.
- Added `tsconfig.json` and `tsconfig.node.json` under `prototypes/khorvideo-v1`.
- Added frontend files under `src/components`, `src/data`, `src/store`, plus `src/styles.css` and `src/types.ts`.
- Updated `src/App.tsx` and `src/main.tsx` to use modular components and CSS.
- Added `src-tauri/build.rs`, `src-tauri/src/commands.rs`, updated `src-tauri/src/main.rs`, and moved Tauri config to `src-tauri/tauri.conf.json`.
- Updated `prototypes/khorvideo-v1/README.md` to reflect actual scaffold state and next steps.

## Context Highlights

- `npm run build` passes for the frontend prototype.
- `cargo check` remains blocked by environment/network policy: crates.io index fetch fails with `CONNECT tunnel failed, response 403`.
- A browser screenshot was attempted as required for a perceptible web UI change, but no browser automation runtime or browser binary is available in the environment.

## Outstanding Items & Next Steps

- Wire the frontend explorer to the Tauri `list_directory` command.
- Add Tauri v2 filesystem/dialog capabilities or plugins if user-driven folder selection is needed.
- Add real drag-and-drop sequence reordering.
- Add FFmpeg/ffprobe command modules and event streaming only after filesystem browsing is stable.
- Add or generate app icons before enabling Tauri bundling.

---

## Follow-up: Runnable Workflow Wiring

A follow-up implementation pass wired the prototype beyond scaffold-only state:

- Replaced static explorer-only behavior with manual folder path loading through the Tauri `list_directory` command.
- Expanded `list_directory` to return child directories and supported video files using camelCase fields for frontend compatibility.
- Added `probe_audio` and `run_concat` Tauri commands around `ffprobe` and `ffmpeg`.
- Added frontend controls for folder path loading, output path entry, audio probing, concat execution, and sequence reordering.
- Added both drag/drop reorder and ↑/↓ reorder controls in the sequence pane.
- Preserved browser/mock behavior for layout development, but real filesystem/FFmpeg execution requires running under Tauri.

### Remaining Known Limitations

- FFmpeg execution currently returns output when the command completes; true real-time event streaming/progress parsing is still a next optimization.
- Thumbnail generation/cache and mouseover playback are still placeholders.
- Tauri bundling remains inactive until real icon assets are added.
- `cargo check` could not be verified in this environment because crates.io access is blocked by `CONNECT tunnel failed, response 403`.
