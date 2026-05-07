---
title: KhorVideo v1 Runnable Workflow Wiring
date: 2026-05-07
session_id: khorvideo-v1-runnable-workflow
tags: [prototype, khorvideo, tauri, ffmpeg, ffprobe, filesystem]
summary: Wired the KhorVideo v1 prototype into a runnable local workflow with folder path loading, video discovery, sequence reordering, audio probing, and FFmpeg concat execution.
---

## Session Summary

Continued from the scaffold-hardening commit and implemented the outstanding prototype workflow pieces that did not require new blocked npm/Tauri dependencies. The app can now be pulled and run locally under Tauri to load a real folder path, stage video files, reorder the sequence, probe audio with ffprobe, and run an FFmpeg concat command.

## Key Decisions & Outcomes

- Used a manual folder path input instead of adding a dialog plugin because registry/dependency access has been unreliable in this environment.
- Kept browser/Vite usage viable for layout development with mock data, while real filesystem and FFmpeg commands run through Tauri.
- Implemented sequence reordering with both drag/drop and ↑/↓ controls for reliability.
- Implemented FFmpeg concat as a blocking command that returns stdout/stderr after completion; real-time event streaming remains a future enhancement.
- Used ffprobe for audio detection and surfaced missing-audio warnings in the UI state/status bar.

## Code / File Changes

- Updated Rust commands in `prototypes/khorvideo-v1/src-tauri/src/commands.rs` for directory listing, audio probing, and concat execution.
- Updated Tauri command registration in `src-tauri/src/main.rs`.
- Added frontend Tauri API wrappers in `src/lib/tauriApi.ts`.
- Expanded Zustand state/actions in `src/store/useKhorVideoStore.ts`.
- Updated `ExplorerPane`, `TreePane`, `SequencePane`, `StatusBar`, `App`, styles, and shared types.
- Updated the prototype README with current run workflow and limitations.

## Context Highlights

- Local run target: `cd prototypes/khorvideo-v1 && npm install && npm run tauri dev`.
- Runtime requirement: `ffmpeg` and `ffprobe` must be on `PATH`.
- The app is still a prototype, not a production build; cached thumbnails, mouseover playback, event-streamed progress, and packaged icons remain future work.

## Outstanding Items & Next Steps

- Add cached thumbnail generation and hover preview playback.
- Replace blocking FFmpeg command execution with real-time event streaming and progress parsing.
- Add packaged app icons and re-enable bundling.
- Add automated tests once the dependency/network environment can resolve Rust crates and browser tooling.


---

## Follow-up: Windows Tauri Watch Fix

A Windows local run reported this Tauri dev error from `prototypes/khorvideo-v1`:

```text
failed to watch C:\Users\mvorm\khorbuild\prototypes\khorvideo-v1\Cargo.toml: Input watch path is neither a file nor a directory.
```

The fix was to add a root-level workspace `Cargo.toml` in `prototypes/khorvideo-v1` with `src-tauri` as the default member. This gives the Tauri CLI a valid Cargo manifest to watch from the npm project root while preserving the actual Tauri Rust crate under `src-tauri/`.


---

## Follow-up: Force `npm run tauri dev` to Disable Watch

The root workspace manifest alone did not resolve the reported Windows watcher failure in the user's local checkout. The npm `tauri` script now routes through `scripts/tauri-cli.mjs`. When the first argument is `dev`, the wrapper invokes the local Tauri CLI as `tauri dev --no-watch`, which bypasses the watcher that was failing before Rust compilation began. Other Tauri subcommands are passed through unchanged.

Expected local command remains:

```powershell
npm run tauri dev
```

Tradeoff: Rust hot-reload watching is disabled for this prototype dev command. Frontend Vite dev serving still runs through Tauri's `beforeDevCommand`; rerun `npm run tauri dev` after Rust backend changes.
