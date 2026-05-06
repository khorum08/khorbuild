---
title: Builds Folder
 date: 2026-05-06
 tags: [builds, mature-targets, development-workflow]
 status: active
---

# Builds Folder

This folder contains **more mature and validated build targets** that have graduated from the `prototypes/` stage.

## Purpose
- House stable, tested versions of features or applications
- Serve as the final staging area before moving code into `src/` (production)
- Allow parallel development of multiple targets

## Workflow
1. When a prototype in `prototypes/` is stable and meets acceptance criteria, promote it here.
2. Perform final polishing, testing, and documentation.
3. Once ready for production use, move the core logic into `src/`.
4. Keep historical builds here for reference or rollback.

## Naming Convention
`builds/<target-name>-<version>/`

Example: `builds/video-utility-v1.0/` or `builds/khorvideo-2026-05/`

## Notes
- Code here should be reasonably clean and documented.
- Include a README in each subfolder explaining the target and current status.
- This folder helps maintain a clean `src/` while allowing multiple active targets.