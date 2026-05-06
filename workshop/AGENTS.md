---
title: Workshop Context Logs - Guidelines
date: 2026-05-06
tags: [workshop, context-logs, daily-digests, agentic]
status: active
---

# Workshop Folder — Daily Context Log Guidelines

This folder (`workshop/`) is dedicated to preserving **daily rich context digests** of our chat sessions. These logs enable continuity across parallel sessions, future reference, and long-term memory for the khorbuild project.

## Log Naming Convention

Use the exact format:

**`MM-DD-YYYY-content_slug_text.md`**

### Examples:
- `05-06-2026-khorbuild-repo-setup.md`
- `05-06-2026-video-concatenation-workflow.md`
- `05-07-2026-ffmpeg-pipeline-optimization.md`

The `content_slug_text` should be a short, descriptive kebab-case summary of the session's main topic.

## Required Log Format (Rich Context Digest)

Every log **must** start with YAML frontmatter followed by structured sections:

```yaml
---
title: [Clear, Descriptive Title]
date: YYYY-MM-DD
session_id: [optional unique identifier]
tags: [comma-separated relevant tags]
summary: [1-3 sentence high-level overview of the session]
---

## Session Summary
[Concise narrative of what was discussed and accomplished]

## Key Decisions & Outcomes
- Bullet list of important choices, agreements, or results

## Code / File Changes
- List of files created, modified, or deleted with brief descriptions
- Include commit SHAs or links when available

## Context Highlights
[Key excerpts, prompts, or important details worth preserving]

## Outstanding Items & Next Steps
- Action items for future sessions
- Open questions or follow-ups

## Full Context Notes (Optional)
[Any additional raw context, links, or detailed notes]
```

## Maintaining the Index (`workshop/INDEX.md`)

**Every time you create or modify a context log, you MUST update `workshop/INDEX.md`.**

### Key Responsibilities:
- Add new entries to the table in INDEX.md
- Identify and merge duplicate subjects (e.g., repeated discussions on the same topic)
- Flag stale contexts (logs older than 30 days or superseded by newer decisions) for archival
- Keep the index sorted by date (newest first)
- Update the `last_updated` field in INDEX.md frontmatter

See `workshop/INDEX.md` for full maintenance rules and best practices.

## Best Practices
- Keep logs **high-signal and concise** (aim for 300–800 words)
- Use clear, professional Markdown
- Update the main `AGENTS.md` or `README.md` if major structural changes occur
- These logs will be referenced by future agents for full context continuity

## When to Create a Log
- End of significant work sessions
- After major feature implementation or architectural decisions
- When context is rich enough to warrant preservation

Last updated: 2026-05-06