---
title: CONTEXT.md - Agent Bootstrap Instructions
date: 2026-05-06
tags: [bootstrap, agent-instructions, context-loading]
status: active
---

# CONTEXT.md — Primary Agent Bootstrap File

**This is the first file any incoming agent (Grok, Claude, or other) should read.**

It defines the exact context loading order and ensures maximum continuity and correctness across sessions.

## Mandatory Context Loading Order

Every agent **must** follow this sequence before beginning any work:

1. **Read this file (`CONTEXT.md`)** — Current file
2. **Read `AGENTS.md`** (root level) — Core directives and project rules
3. **Check `workshop/INDEX.md`** — Overview of recent context logs
4. **Read the most recent log(s) in `workshop/`** — Full session context
5. **(Optional)** Read relevant entries from `memory/` if the task requires long-term project memory

## Why This Order Matters
- Prevents agents from working with outdated or incomplete context
- Ensures all important decisions and discussions are considered
- Maintains consistency across parallel or future sessions

## Quick Start for Agents

> **Step 1:** Load `CONTEXT.md`
> **Step 2:** Load `AGENTS.md`
> **Step 3:** Review latest workshop logs via `workshop/INDEX.md`
> **Step 4:** Begin task with full awareness of prior context

## Project Overview

This repository (`khorbuild`) is a video utility application focused on FFmpeg-based processing, automation, and agent-friendly workflows within the Khorum ecosystem.

## Notes for Future Agents
- Always respect the agentic principles defined in `AGENTS.md`
- Maintain high-signal documentation and context logs
- When in doubt, create or update context logs in `workshop/`

Last updated: 2026-05-06