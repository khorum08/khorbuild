---
title: AGENTS.md - Base Directives for khorbuild
date: 2026-05-06
tags: [agents, directives, video-utility, grokclaw]
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

## Agent Behavior Guidelines
1. Always begin by reading this AGENTS.md file.
2. When making changes, use clear commit messages and update relevant documentation.
3. Prefer creating dated memory entries in `memory/` for significant updates or decisions.
4. Maintain clean code and documentation optimized for both humans and agents.
5. When in doubt, ask for clarification rather than assuming.

## Recommended Workflow
- Explore the codebase using available tools
- Propose changes via clear explanations + code diffs when possible
- Use `create_or_update_file` or `push_files` for modifications
- Keep the README and AGENTS.md up to date

## Video-Specific Notes
- All video operations should prioritize quality, speed, and compatibility.
- FFmpeg commands and scripts should be well-tested and documented.
- Support for batch processing and error handling is encouraged.

Last updated: 2026-05-06
Initialized by Grok via GitHub Connector