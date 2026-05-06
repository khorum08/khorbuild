---
title: Prototypes Folder
 date: 2026-05-06
 tags: [prototypes, experiments, development-workflow]
 status: active
---

# Prototypes Folder

This folder contains **experimental and rough implementations** of build targets that emerged from the `workshop/` phase.

## Purpose
- House early, unpolished versions of features or applications
- Allow rapid iteration without polluting the main codebase
- Serve as a bridge between brainstorming (`workshop/`) and more mature builds (`builds/`)

## Workflow
1. When a rough build target is agreed upon in `workshop/`, create a new subfolder here (e.g., `prototypes/video-utility-v1/`).
2. Develop and test the idea here.
3. Once stable and validated, promote promising work to `builds/` or `src/`.
4. Archive or delete failed experiments.

## Naming Convention
`prototypes/<target-name>-<version-or-date>/`

Example: `prototypes/video-concat-v1/` or `prototypes/ffmpeg-pipeline-may2026/`

## Notes
- Keep code functional but not necessarily production-ready.
- Document key decisions and trade-offs in the subfolder's README.
- Move to `builds/` once the prototype proves valuable.