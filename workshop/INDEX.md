---
title: Workshop Context Log Index
date: 2026-05-06
tags: [workshop, index, context-management]
status: active
last_updated: 2026-05-07
---

# Workshop Context Log Index

This file serves as the **single source of truth** for all daily context logs stored in the `workshop/` folder. It helps agents quickly find relevant sessions and maintain a clean, high-signal archive.

## How to Maintain This Index

### 1. Adding New Logs
- After creating a new log file (following `MM-DD-YYYY-content_slug_text.md` format), add an entry here immediately.
- Include: Date, Log filename, Short description, and Key tags.

### 2. Identifying Duplicates
- Scan for logs covering **very similar subjects** (e.g., multiple logs about "video concatenation" or "FFmpeg setup").
- If duplicates exist:
  - Merge the most important insights into the **earliest or most comprehensive** log.
  - Delete or archive the redundant ones.
  - Update this index accordingly.

### 3. Flagging Stale Contexts
- Mark logs as **stale** if they are:
  - Older than 30 days and no longer relevant to current project state
  - Superseded by newer architectural decisions
  - Related to abandoned features or experiments
- Stale logs should be moved to an `archive/` subfolder (create if needed) rather than deleted.

### 4. Other Maintenance Best Practices
- Keep entries sorted by date (newest first).
- Use consistent formatting in this index.
- Cross-reference important decisions between logs when relevant.
- Periodically (every 10–15 logs) review the entire folder for consolidation opportunities.
- Update the `last_updated` date in the frontmatter after any changes.

## Current Context Logs

| Date       | Log File                              | Description                              | Tags                          | Status    |
|------------|---------------------------------------|------------------------------------------|-------------------------------|-----------|
| 2026-05-07 | 05-07-2026-khorvideo-v1-runnable-workflow.md | Wired runnable folder loading, sequence reordering, ffprobe audio checks, and FFmpeg concat execution | prototype, khorvideo, ffmpeg, tauri | Active |
| 2026-05-07 | 05-07-2026-khorvideo-v1-scaffold-hardening.md | Hardened KhorVideo v1 scaffold with build config, modular UI panes, Zustand mock state, and initial Tauri command | prototype, khorvideo, tauri, react | Active |
| 2026-05-06 | 05-06-2026-khorbuild-repo-setup.md   | Initial repo creation + agentic structure setup; file referenced by index but absent in current checkout | repo-setup, agentic, workshop | Missing in checkout |

## Notes
- This index should be updated **every time** a new log is created or modified.
- Future agents should consult this file before diving into individual logs.

Last maintained: 2026-05-07