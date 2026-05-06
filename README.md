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
- Agent-optimized directory structure with clear development stages
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

**Critical Instruction:** Always start by reading `CONTEXT.md` first. This file defines the exact context loading order and development stages.

This repository follows **standard agentic repo practices** with a clear staged workflow:

1. **Read `CONTEXT.md`** (primary bootstrap)
2. **Read `AGENTS.md`** for core directives
3. Use `workshop/` for ideation and context logging
4. Move to `prototypes/` for experimental builds
5. Promote to `builds/` when validated
6. Final code goes to `src/`

**Recommended first step for any agent:**
> Load `CONTEXT.md` → `AGENTS.md` → Check latest workshop logs → Identify current stage → Proceed

## Project Structure

```
khorbuild/
├── CONTEXT.md           # Primary agent bootstrap (read this first!)
├── README.md
├── AGENTS.md
├── workshop/            # Ideation + daily context logs
│   ├── AGENTS.md
│   └── INDEX.md
├── prototypes/          # Experimental rough builds
│   └── README.md
├── builds/              # Mature validated targets
│   └── README.md
├── src/                 # Production code
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