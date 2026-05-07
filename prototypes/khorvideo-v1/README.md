---
title: KhorVideo v1 - MVP Specification
date: 2026-05-06
tags: [prototype, mvp-spec, video-concat, tauri, windows]
status: draft
---

# KhorVideo v1 - MVP Specification

**Project Name:** KhorVideo (working title)
**Version:** MVP v1.0
**Date:** May 6, 2026
**Status:** Runnable local prototype / filesystem + concat workflow wired

---

## 1. Project Overview

KhorVideo is a Windows desktop application that provides a visual, user-friendly interface for creating FFmpeg concatenation commands.

It combines a high-performance file explorer with a drag-and-drop sequence builder, allowing users to visually order video files and generate + execute FFmpeg concat commands in real time.

**Core Goal:**
Make creating complex video concatenation commands as simple as dragging files into order.

---

## 2. MVP Scope

### In Scope (MVP)
- Video files only (`.mp4`, `.mov`, `.mkv`, `.avi`, etc.)
- 4-pane layout with horizontal sequence
- Folder navigation with tree view/path loading
- File explorer with medium-large placeholder thumbnails (cached thumbnails + hover playback still pending)
- Click-to-add plus drag/arrow reorder sequence builder
- FFmpeg concat execution with console output after process completion
- Status bar based on loading/running state (deep FFmpeg progress parsing still pending)
- Basic audio track detection + warning system via ffprobe
- Windows-only application
- Local files only

### Out of Scope (Post-MVP)
- Image support
- Audio-only files
- Advanced FFmpeg filters / transitions
- Cross-platform support
- Network / cloud storage
- Batch processing of multiple concat jobs

---

## 3. Design Principles

- **Modular & Standards-Based**: The app must be built with clean, reusable components so new panes, features, and UX changes can be added easily later.
- **Performance First**: Fast file browsing and thumbnail loading even in large folders.
- **Developer Experience**: Clear separation between UI and backend logic.

---

## 4. Recommended Tech Stack

| Layer          | Technology                          | Reason |
|----------------|-------------------------------------|--------|
| Frontend       | React + TypeScript + Tailwind + shadcn/ui | Fast UI development, modern components, easy to extend |
| Backend        | Tauri (Rust)                        | Native performance, small binary, excellent FFmpeg integration |
| State          | Zustand                             | Lightweight and simple |
| Styling        | Plain CSS prototype styles; Tailwind/shadcn deferred | Avoids adding blocked dependencies while preserving a clean dark UI shell |
| File System    | Tauri FS + Rust                     | High performance |
| Thumbnails     | Hybrid: Windows Thumbnail Cache + custom cache | Best performance + reliability |
| FFmpeg         | Rust `std::process::Command` + streaming | Direct execution with real-time output |

**Final Binary:** Single `.exe` (~15-25MB expected)

**Note on Setup**: This stack requires installing Rust and Node.js. Setup instructions are included at the bottom of this document.

---

## 5. User Interface Layout (Updated)

### Final Layout

```
+-----------------------------------------------+
|                 Menu Bar                      |
+---------------+-------------------------------+
|   Tree Pane   |     Explorer Pane             |
|   (Folders)   |   (Thumbnails - Med/Large)    |
|               |   + Mouseover Video Preview   |
+---------------+-------------------------------+
|          Sequence Pane (Horizontal)           |
|     [Drag & Drop + Reorder Videos]            |
+-----------------------------------------------+
| Status Bar (Progress + General Info)          |
+-----------------------------------------------+
| Console Output (FFmpeg stdout/stderr)         |
+-----------------------------------------------+
```

**Pane Details:**
- **Left (Tree)**: Folder tree navigation
- **Middle (Explorer)**: Grid view with medium-large thumbnails + hover-to-play preview for videos
- **Below Explorer (Sequence)**: Horizontal drag-and-drop area showing ordered videos with thumbnails
- **Bottom Status Bar**: Progress bar + current status
- **Console Pane**: Real-time FFmpeg output (scrollable, color-coded)

---

## 6. Core Features

### 6.1 File Explorer & Thumbnails
- Navigate local folders via tree + breadcrumb
- Display files with **medium-large cached thumbnails**
- Attempt to use Windows Thumbnail Cache first
- Fallback to generating thumbnails via FFmpeg
- **Mouseover video playback** on video thumbnails (play short preview on hover)
- Thumbnail caching system (local app cache)

### 6.2 Sequence Builder
- Drag files from Explorer to Sequence pane
- Reorder via drag & drop
- Remove items from sequence
- Show thumbnail + filename + duration
- Prevent adding non-video files

### 6.3 FFmpeg Integration
- Generate concat command based on sequence order
- Run FFmpeg directly from the app (Rust backend)
- Capture and display real-time stdout + stderr in console pane
- Parse progress from FFmpeg output for status bar
- Detect audio tracks using ffprobe before running
- Show clear warning if any file is missing audio
- Allow user to continue or cancel

### 6.4 Console & Feedback
- Full terminal-like output pane with color coding
- Auto-scroll to bottom
- Copy output button
- Progress bar in status bar that updates live

---

## 7. Technical Architecture

### Backend (Rust / Tauri)
- File system commands
- Thumbnail generation and caching
- FFmpeg process management with real-time streaming
- Audio detection via ffprobe
- Windows thumbnail cache integration (via `windows` crate)

### Frontend (React)
- Modular component architecture (easy to extend)
- Drag & drop using modern libraries
- Real-time updates from Rust backend via Tauri events
- Responsive pane resizing

### Data Flow
1. User selects folder → Backend lists files + generates thumbnails
2. User drags file to Sequence → Frontend state updates
3. User clicks "Run" → Backend starts FFmpeg process
4. FFmpeg output streamed back to frontend in real time
5. Progress bar + console updated live

---

## 8. Key Challenges & Solutions

| Challenge                              | Proposed Solution                                      |
|----------------------------------------|--------------------------------------------------------|
| Windows Thumbnail Cache access         | Use `windows-rs` crate + modern Windows APIs           |
| Real-time FFmpeg output streaming      | Use `tokio` + async channels (well-documented pattern) |
| Mouseover video preview                | Generate short preview clips or use HTML5 video        |
| Audio detection                        | Run `ffprobe` before concat and parse output           |
| Large folder performance               | Virtualized lists + lazy thumbnail loading             |

---

## 9. Project Structure (Proposed)

```
prototypes/khorvideo-v1/
├── Cargo.toml                     # Workspace manifest for Tauri CLI dev watching
├── scripts/
│   └── run-tauri.mjs              # Adds --no-watch for `npm run tauri dev` on Windows
├── src-tauri/                     # Rust backend
│   ├── build.rs
│   ├── tauri.conf.json
│   └── src/
│       ├── main.rs
│       └── commands.rs            # Initial directory listing command
├── src/                           # React frontend
│   ├── components/
│   │   ├── ConsolePane.tsx
│   │   ├── ExplorerPane.tsx
│   │   ├── SequencePane.tsx
│   │   ├── StatusBar.tsx
│   │   ├── TopBar.tsx
│   │   └── TreePane.tsx
│   ├── data/mockVideos.ts
│   ├── store/useKhorVideoStore.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles.css
│   └── types.ts
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md (this file)
```

---

## 10. Next Steps

1. Update this spec (done)
2. Set up Tauri + React project scaffolding (done)
3. Implement basic layout with modular pane structure (done)
4. Build folder navigation + file listing (done via manual path load + Tauri `list_directory`)
5. Implement thumbnail system (partial: styled placeholders; cached thumbnail generation still pending)
6. Add drag & drop sequence builder (done for sequence reorder; explorer-to-sequence remains click-to-add)
7. Integrate FFmpeg execution + console output (done as blocking command; real-time streaming still pending)
8. Add audio detection + warnings (done via `ffprobe`)
9. Add status bar and progress parsing (partial: loading/running status done; FFmpeg progress parsing pending)
10. Polish UI and error handling

---

## 11. Setup Instructions (Tauri + React)

### Prerequisites
- Install **Node.js** (LTS version recommended)
- Install **Rust** (via rustup: https://rustup.rs/)
- Install **Visual Studio Build Tools** (for Windows)


### Current Local Run Workflow

```bash
cd prototypes/khorvideo-v1
npm install
npm run tauri dev
```

Runtime expectations:
- Run inside Tauri for real filesystem/FFmpeg access; the browser-only Vite view keeps mock data for layout development.
- Enter a local folder path and click **Load Folder** to list child folders and supported video files.
- Click video thumbnails to add clips to the sequence.
- Drag staged clips, or use ↑/↓ controls, to reorder them.
- Set an output path, click **Probe Audio** if desired, then click **Run Concat**.
- `ffmpeg` and `ffprobe` must be available on `PATH`.
- `npm run tauri dev` is routed through `scripts/run-tauri.mjs`, which adds `--no-watch` for dev runs to avoid the Windows Tauri watcher error around `prototypes/khorvideo-v1/Cargo.toml`.
- The root `Cargo.toml` is intentional workspace metadata for Cargo/Tauri commands while keeping the Rust app crate in `src-tauri/`.
- `src-tauri/build.rs` generates `src-tauri/icons/icon.ico` when missing because `tauri-build` needs that default path for Windows dev resources, even while bundling is disabled. The generated binary icon is intentionally ignored by Git.

### Quick Start Commands
```bash
# 1. Create new Tauri project
npm create tauri-app@latest

# 2. Choose React + TypeScript template
# 3. cd into the project folder
cd khorvideo-v1

# 4. Install dependencies
npm install

# 5. Run in development mode
npm run tauri dev
```

---

## 12. Open Questions

- Default output folder behavior (user chooses every time vs fixed folder)?
- Any specific keyboard shortcuts needed in MVP?
- Theme preference (dark mode only or light/dark toggle)?

---

**Status:** Runnable local prototype; next step is cached thumbnails, non-blocking FFmpeg event streaming, and deeper UX polish.
**Owner:** Victor (via Grok)