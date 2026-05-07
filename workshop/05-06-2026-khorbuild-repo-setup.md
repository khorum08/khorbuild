---
title: khorbuild Repo Setup & KhorVideo v1 Scaffold
date: 2026-05-06
session_id: khorbuild-repo-setup
tags: [repo-setup, agentic, scaffold, khorvideo, tauri, react, prototype]
summary: Initial khorbuild repo creation by Grok. Established agentic folder structure, base directives, context bootstrap system, and scaffolded the KhorVideo v1 prototype with Tauri + React layout. Session ended at rate limit before this log could be written — reconstructed from git history.
---

## Session Summary

Grok initialized the `khorbuild` repository from scratch, establishing the full agentic project structure and scaffolding the KhorVideo v1 prototype UI. The session covered repo conventions, agent bootstrap system, staged workflow docs, and the initial Tauri + React project files. The session hit a rate limit before this log was written — the INDEX.md entry was created but the file was never committed.

## Key Decisions & Outcomes

- Repo purpose: Windows desktop app for FFmpeg-based video processing, starting with a concat workflow (KhorVideo).
- Staged development model adopted: `workshop/` → `prototypes/` → `builds/` → `src/`.
- `CONTEXT.md` established as the mandatory first-read for all incoming agents, followed by `AGENTS.md` then `workshop/INDEX.md`.
- `workshop/AGENTS.md` defines log format (YAML frontmatter + structured sections, 300–800 words, kebab-case filenames).
- KhorVideo v1 MVP spec finalized: 4-pane layout (Folders | Explorer | Sequence | Console), single Windows `.exe` target, FFmpeg concat as core operation.
- Tauri 2.0 + React 18 + TypeScript + Zustand + Vite chosen as stack. No Tailwind or heavy UI libs to avoid blocked dependency issues.

## Code / File Changes

**Repo structure & docs (all May 6):**
- `README.md` — project overview, agent bootstrap instructions (`bb51b2b`, `e8911bc`, `9986637`, `22d9816`)
- `AGENTS.md` — base directives, core principles, staged workflow (`252ed68`, `cdc92bc`, `0ca527f`)
- `CONTEXT.md` — mandatory agent bootstrap file with context loading order (`60bf951`, `55cf7bc`)
- `prototypes/README.md`, `builds/README.md` — stage workflow guidance (`3deeaa8`, `5844986`)
- `workshop/AGENTS.md` — log format spec (`dda181e`, `52e3b89`)
- `workshop/INDEX.md` — log index with maintenance rules (`c9abb70`)

**KhorVideo v1 scaffold (all May 6):**
- `prototypes/khorvideo-v1/README.md` — MVP spec (`aa10327`, `eb6aeed`)
- `package.json` — Tauri + React + Zustand deps (`9b70928`)
- `src-tauri/tauri.conf.json` — initial Tauri config (`98b82e2`)
- `src/main.tsx`, `src/App.tsx` — entry point + 4-pane layout skeleton (`28e93f9`, `e9ea0d0`, `e27a746`)
- `src-tauri/src/main.rs`, `src-tauri/Cargo.toml` — Rust entry point (`683be26`, `e101f79`)
- `index.html`, `vite.config.ts` — Vite wiring (`5718eec`, `628fd6f`)

## Context Highlights

- KhorVideo MVP target: single `.exe` (~15–25 MB), no installer required for prototype.
- Blocked dependency environment (npm registry/Tauri plugin install issues) drove the decision to use minimal, stable deps only.
- 4-pane layout: Tree (folder nav) | Explorer (video grid) | Sequence (concat order builder) | Console (FFmpeg output).
- Agent bootstrap order is strict: `CONTEXT.md` → `AGENTS.md` → `workshop/INDEX.md` → latest logs.

## Outstanding Items & Next Steps

At end of session (rate limit hit):
- Scaffold committed but not yet runnable — Tauri commands, Zustand state, and frontend-backend wiring still needed.
- No icons, no bundling config, no Tauri command implementations.
- Continued in `05-07-2026-khorvideo-v1-scaffold-hardening.md` and `05-07-2026-khorvideo-v1-runnable-workflow.md`.
