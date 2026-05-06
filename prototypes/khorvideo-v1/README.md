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
- 4-pane layout (Tree | Explorer | Sequence | Console)
- Folder navigation with tree view
- File explorer with cached thumbnails
- Drag & drop to build sequence
- Real-time FFmpeg execution with console output
- Progress bar based on FFmpeg output
- Basic audio track detection + warning system
- Windows-only application

### Out of Scope (Post-MVP)
- Image support
- Audio-only files
- Advanced FFmpeg filters / transitions
- Cross-platform support
- Network / cloud storage
- Batch processing of multiple concat jobs

---

## 3. Recommended Tech Stack

| Layer          | Technology                  | Reason |
|----------------|-----------------------------|--------|
| Frontend       | React + TypeScript + Tailwind + shadcn/ui | Fast UI development, modern components |
| Backend        | Tauri (Rust)                | Native performance, small binary, easy FFmpeg integration |
| State          | Zustand or Jotai            | Lightweight and simple |
| Styling        | Tailwind CSS + shadcn/ui    | Clean, consistent, fast iteration |
| File System    | Tauri FS + Rust             | High performance |
| Thumbnails     | Windows Thumbnail Cache + custom cache | Leverage system cache where possible |
| FFmpeg         | Rust `std::process::Command` | Direct execution with real-time output |

**Final Binary:** Single `.exe` (~15-25MB expected)

---

## 4. User Interface Layout

### 4-Pane Design (Resizable)

```
+-----------------------------------------------+
| Menu Bar                                      |
+---------------+----------------+--------------+
|               |                |              |
|   Tree Pane   |  Explorer Pane | Sequence     |
|   (Folders)   |  (Thumbnails)  | Pane         |
|               |                | (Drop Zone)  |
|               |                |              |
+---------------+----------------+--------------+
| Console Output Pane (FFmpeg stdout/stderr)    |
+-----------------------------------------------+
| Status Bar (Progress + General Info)          |
+-----------------------------------------------+
```

**Pane Details:**

- **Left (Tree):** Folder tree navigation
- **Middle (Explorer):** Grid/list view of current folder with thumbnails
- **Right (Sequence):** Drag-and-drop area showing ordered media with thumbnails + remove buttons
- **Bottom (Console):** Real-time FFmpeg output (scrollable)
- **Status Bar:** Progress bar + current operation status

---

## 5. Core Features

### 5.1 File Explorer & Thumbnails
- Navigate local folders via tree + breadcrumb
- Display files with cached thumbnails
- Attempt to use Windows Thumbnail Cache first
- Fallback to generating thumbnails via FFmpeg (`-ss 00:00:01 -frames:v 1`)
- Thumbnail caching system (local app cache)

### 5.2 Sequence Builder
- Drag files from Explorer to Sequence pane
- Reorder via drag & drop
- Remove items from sequence
- Show thumbnail + filename + duration (if available)
- Prevent adding non-video files

### 5.3 FFmpeg Integration
- Generate concat command based on sequence order
- Run FFmpeg directly from the app
- Capture and display real-time stdout + stderr
- Parse progress from FFmpeg output for status bar
- Detect audio tracks in source files
- Show warning if any file is missing audio
- Allow user to continue or cancel if audio is missing

### 5.4 Console & Feedback
- Full terminal-like output pane
- Color-coded logs (info, warning, error)
- Auto-scroll to bottom
- Copy output button

---

## 6. Technical Architecture

### Backend (Rust / Tauri)
- File system commands (list, read, thumbnail generation)
- FFmpeg process management with real-time output streaming
- Thumbnail cache management
- Windows thumbnail cache integration (via `windows` crate or COM)

### Frontend (React)
- Component-based UI
- Drag & drop using `@hello-pangea/dnd` or HTML5 Drag API
- Real-time state updates from Rust backend via Tauri events
- Responsive pane resizing

### Data Flow
1. User selects folder → Backend lists files + generates thumbnails
2. User drags file to Sequence → Frontend state updates
3. User clicks "Run Concat" → Backend starts FFmpeg process
4. FFmpeg output streamed back to frontend in real time
5. Progress bar updated based on parsed output

---

## 7. Key Challenges & Solutions

| Challenge                        | Proposed Solution |
|----------------------------------|-------------------|
| Windows Thumbnail Cache access   | Use `windows-rs` crate + `IShellItem` / `IThumbnailCache` |
| Real-time FFmpeg output          | Use `tokio::process` + channel streaming |
| Thumbnail performance            | Hybrid approach: Windows cache → App cache → Generate on demand |
| Audio detection                  | Use `ffprobe` (part of FFmpeg) before running concat |
| Large folder performance         | Virtualized lists + lazy loading |

---

## 8. Project Structure (Proposed)

```
prototypes/khorvideo-v1/
├── src-tauri/                 # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands.rs      # Tauri commands
│   │   └── ffmpeg.rs        # FFmpeg logic
├── src/                       # React frontend
│   ├── components/
│   │   ├── TreePane.tsx
│   │   ├── ExplorerPane.tsx
│   │   ├── SequencePane.tsx
│   │   └── ConsolePane.tsx
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── tauri.conf.json
└── README.md
```

---

## 9. Next Steps

1. Set up Tauri + React project scaffolding
2. Implement basic 4-pane layout
3. Build folder navigation + file listing
4. Implement thumbnail system (simple version first)
5. Add drag & drop sequence builder
6. Integrate FFmpeg execution + console output
7. Add audio detection + warnings
8. Polish UI and progress bar

---

## 10. Open Questions

- Should we support subfolder recursion in the explorer?
- Do we want a "Preview Sequence" button before running?
- Should output files go to a default folder or let user choose every time?
- Any preference on UI theme (dark mode only?)

---

**Status:** Ready to begin implementation.
**Owner:** Victor (via Grok)