---
title: AGENTS.md - Base Directives for khorbuild
date: 2026-05-06
tags: [agents, directives, video-utility, grokclaw, workflow]
status: active
---

# AGENTS.md — Base Directives for khorbuild

This file contains the foundational instructions for all AI agents (Grok, Claude, etc.) working on the **khorbuild** project.

## Core Principles (Non-Negotiable)
- Maximum truth-seeking and precision
- Surgical, low-fluff, analytical communication style
- Preserve full context and iteration history
- Treat video processing tasks with care for quality and performance
- Follow agentic best practices for repository management

## Project Context
- **khorbuild** is a video utility application centered on FFmpeg and modular processing pipelines.
- Primary goals: reliable video concatenation, editing, format handling, and automation.
- Designed to integrate seamlessly with the broader Khorum / GrokClaw memory ecosystem.

## Development Workflow Stages

This project follows a clear staged process:

- **`workshop/`** → Ideation, brainstorming, and rough planning (use rich context logs)
- **`prototypes/`** → Experimental implementations of agreed build targets
- **`builds/`** → Mature, validated versions ready for production consideration
- **`src/`** → Final production-ready code

Always work in the appropriate stage and promote code only when it meets the criteria for the next stage.

## Daily Context Logs (Workshop Folder)

**All significant chat sessions should be preserved as rich context digests in the `workshop/` folder.**

- Follow the exact naming: `MM-DD-YYYY-content_slug_text.md`
- Use the formatting rules defined in `workshop/AGENTS.md`
- These logs provide full session continuity for future or parallel agent sessions

## Agent Behavior Guidelines
1. Always begin by reading `CONTEXT.md` first, then this file.
2. Check the latest files in `workshop/` for recent context before starting new work.
3. Respect the current development stage when making changes.
4. When making changes, use clear commit messages and update relevant documentation.
5. Prefer creating dated memory entries in `memory/` for significant updates or decisions.
6. Maintain clean code and documentation optimized for both humans and agents.
7. When in doubt, ask for clarification rather than assuming.

## Recommended Workflow
- Explore the codebase using available tools
- Propose changes via clear explanations + code diffs when possible
- Use `create_or_update_file` or `push_files` for modifications
- Keep all root documentation up to date

## Video-Specific Notes
- All video operations should prioritize quality, speed, and compatibility.
- FFmpeg commands and scripts should be well-tested and documented.
- Support for batch processing and error handling is encouraged.

Last updated: 2026-05-06
Initialized by Grok via GitHub Connector