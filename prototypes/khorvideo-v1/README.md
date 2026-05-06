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
**Status:** Planning / Ready for Implementation

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
- Folder navigation with tree view
- File explorer with cached thumbnails (medium-large size + mouseover video playback)
- Drag & drop to build sequence
- Real-time FFmpeg execution with console output
- Progress bar based on FFmpeg output
- Basic audio track detection + warning system
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
| Styling        | Tailwind CSS + shadcn/ui            | Clean, consistent, fast iteration |
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
├── src-tauri/                     # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands.rs
│   │   ├── ffmpeg.rs
│   │   └── thumbnail.rs
├── src/                           # React frontend
│   ├── components/
│   │   ├── TreePane.tsx
│   │   ├── ExplorerPane.tsx
│   │   ├── SequencePane.tsx
│   │   ├── ConsolePane.tsx
│   │   └── StatusBar.tsx
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tauri.conf.json
└── README.md (this file)
```

---

## 10. Next Steps

1. Update this spec (done)
2. Set up Tauri + React project scaffolding
3. Implement basic layout with new pane structure
4. Build folder navigation + file listing
5. Implement thumbnail system (medium-large + hover preview)
6. Add drag & drop sequence builder
7. Integrate FFmpeg execution + real-time console
8. Add audio detection + warnings
9. Add status bar and progress parsing
10. Polish UI and error handling

---

## 11. Setup Instructions (Tauri + React)

### Prerequisites
- Install **Node.js** (LTS version recommended)
- Install **Rust** (via rustup: https://rustup.rs/)
- Install **Visual Studio Build Tools** (for Windows)

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

**Status:** Spec updated and ready for implementation.
**Owner:** Victor (via Grok)