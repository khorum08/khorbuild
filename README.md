---
title: khorbuild - Khorum Video Utility App
 date: 2026-05-06
 tags: [video-processing, ffmpeg, agentic, khorum]
 status: active
---

# khorbuild

**Khorum Video Utility App Project**

A modern, agent-friendly video processing and utility application designed for the Khorum ecosystem. Built with FFmpeg at its core for high-performance video manipulation, concatenation, editing, and workflow automation.

## Overview

khorbuild provides robust tools for video handling tasks, optimized for both human developers and AI agents. It emphasizes clean architecture, persistent state management, and seamless integration with agentic systems like GrokClaw.

## Key Features
- FFmpeg-powered video concatenation, trimming, and format conversion
- Modular utility scripts and pipelines
- Agent-optimized directory structure
- Support for batch processing and automated workflows
- Designed for integration with memory systems (khormemory-style)

## Getting Started

```bash
git clone https://github.com/khorum08/khorbuild.git
cd khorbuild
# Install dependencies (example)
pip install -r requirements.txt
```

## For AI Agents & Grok

**Critical Instruction:** Always start by reading `CONTEXT.md` first. This file defines the exact context loading order.

This repository follows **standard agentic repo practices**:

1. **Read `CONTEXT.md`** (primary bootstrap file)
2. **Read `AGENTS.md`** for core directives and behavior guidelines
3. Use the `workshop/` folder for daily rich context logs (see `workshop/AGENTS.md` and `workshop/INDEX.md`)
4. Use the `memory/` directory for dated high-signal entries when relevant
5. Maintain clean, high-signal Markdown files
6. Prefer surgical, low-fluff responses when editing or documenting

**Recommended first step for any agent:**
> Load `CONTEXT.md` → `AGENTS.md` → Check latest workshop logs → Proceed with full context

## Project Structure

```
khorbuild/
├── CONTEXT.md           # Primary agent bootstrap (read this first!)
├── README.md
├── AGENTS.md
├── workshop/            # Daily context logs + INDEX.md
│   ├── AGENTS.md
│   └── INDEX.md
├── src/                 # Core video processing code
├── scripts/             # Utility and automation scripts
├── tests/
├── memory/              # Agent memory entries
└── directives/          # Project-specific agent instructions
```

## Contributing

- Follow the principles in AGENTS.md
- Keep changes minimal and well-documented
- Use conventional commits

## License

MIT (or specify your preference)

---
*Initialized with Grok GitHub Connector on 2026-05-06*