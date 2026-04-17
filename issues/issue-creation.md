# Universal Issue Creation Guide for AI Agents

> Standard for creating GitHub issues that agents can implement in a single session without context rot.

---

## Why This Matters

Claude Opus 4.6 has a 1M token context window (200K default, 1M in beta), but raw context size is misleading. Factory's Droid sets its compression threshold (Tmax) at ~140K tokens — when context reaches this point, it triggers "anchored iterative summarization" to compress older turns. Running near max context empirically degrades response quality, so Droid stays well below the model's actual limit.

What this means in practice:

- **~140K is the real working window**: Droid triggers compression at this threshold (the "fill line"). After compression, it retains even fewer tokens (the "drain line", Tretained < Tmax). An issue that fits comfortably in one session never triggers compression.
- **Compression loses file tracking first**: Factory's evaluation scores artifact tracking at only 2.45/5 — the weakest dimension across all methods. After compression, the agent often forgets which files it created or modified. This is why issues must explicitly list files.
- **Optimize for tokens per task, not tokens per request**: Aggressive compression saves per-request tokens but loses details that force expensive re-fetching and rework. Factory's research calls this "the false economy of over-compression."
- **Structured summaries beat raw compression**: Factory's anchored iterative approach merges new summaries into a persistent state with explicit sections (session intent, artifact trail, decisions, next steps). This prevents "silent drift" where details vanish across repeated compressions.

Recommended workflow for large features: spec mode to create a master plan, then one fresh agent session per implementation phase. Each session references the plan doc and implements one coherent piece. Fresh sessions avoid compression entirely.

**Target: 3-8 files touched per issue, one coherent concept, testable independently.**

---

## Issue Template

```markdown
## Context
Plan: `docs/plans/<plan-file>.md` {section/phase reference}
Existing code: {what already exists that this builds on or modifies, with file paths}

## What to Build
`<path>/<file>` -- {ClassName/module} class:

{2-4 paragraphs describing WHAT to build, not HOW to code it.
Include key method signatures, data structures, and algorithms.
Reference specific existing classes/methods by name and file path.
Include code snippets ONLY for non-obvious interfaces or data schemas.}

### Integration:
- {How this connects to existing code}
- {What calls it / what it calls}
- {Where the output goes}

## Read Before Implementing
1. `<path>/<file>` -- {what to look for and why}
2. `<path>/<other-file>` -- {what to look for and why}
3. `docs/plans/<plan>.md` -- {specific section reference}
4. `docs/specs/<spec>.md` -- {if applicable}

## Files
- CREATE `<path>/<new-file>`
- MODIFY `<path>/<existing-file>` ({what change})
- Tests in `tests/<test-file>` ({what scenarios})

## Depends On
- #{number} ({short reason -- what it provides that this needs})
- `<path>/<file>` (already built)

## Acceptance Criteria
- [ ] {Specific, testable criterion}
- [ ] {Another specific criterion}
- [ ] {Integration criterion -- works with X}
- [ ] All tests pass (`<test-command>`)
```

---

## Section-by-Section Rules

### Context
- Always reference the source plan file with backtick path
- Include phase/section number so the agent can jump straight there
- Name the existing code this builds on (file paths, class names)
- If this replaces a closed issue, mention it: "Replaces closed #53 (too broad)"

### What to Build
- Lead with the file path and class name: `` `<path>/<file>` -- ClassName ``
- Describe the public interface (method names, params, return types)
- Include data structures (dataclasses, schemas) with field names and types
- For algorithms, describe the approach (not pseudocode line-by-line)
- For integrations, name the exact methods being called on existing classes
- **Include schemas** (SQL, JSON, dataclass) when creating data models
- **Include API routes** (method + path + request/response) when creating endpoints

### Read Before Implementing
- List 3-6 files the agent MUST read before writing code
- Explain WHAT to look for in each file (not just "read this")
- Order by importance (most critical first)
- Include plan docs and spec refs where relevant
- This section directly compensates for compression's artifact tracking weakness — after compression, the agent may not remember what files exist, so the issue must tell it

### Files
- Use CREATE / MODIFY / DELETE verbs
- For MODIFY, say what's changing (e.g., "add payment_status field to Reservation")
- Always include the test file
- List specific line numbers or class names for MODIFY when possible
- **This is the most important section for agent reliability** — compression loses file tracking first (2.45/5 in Factory's evaluation). Explicit file lists prevent re-discovery overhead.

### Depends On
- List issue numbers with a short reason (what the dependency provides)
- Distinguish between "needs this built first" vs "already built, just reference it"
- If independent (no deps), say "Nothing — this is foundational" or "Independent module"

### Acceptance Criteria
- 5-8 checkboxes
- Each must be independently verifiable
- Include at least one integration criterion ("works with X")
- Always end with test command: `<test-command>`
- Never include vague criteria like "code is clean" or "well-documented"

---

## Sizing Rules

| Signal | Too broad | Right-sized | Too narrow |
|--------|-----------|-------------|------------|
| Files touched | 10+ | 3-8 | 1-2 trivial |
| Concepts | Multiple unrelated subsystems | One coherent concept | Sub-part of a concept |
| Session cost | Multiple compressions | One session (~140K window) | 15 min of work |
| Dependencies | Creates AND consumes new interfaces | Creates OR consumes | None meaningful |
| Test scenarios | 20+ | 5-12 | 1-2 |

**Why these numbers**: Factory's Droid maintains an optimal ~140K token working window. A right-sized issue (3-8 files, 5-12 tests) stays within this window including file reads, tool calls, and test output. Issues touching 10+ files risk triggering compression mid-implementation, which degrades artifact tracking.

**Right-sized examples:**
- "ReservationSync: bidirectional sheet-to-DB sync + conflict resolution" (1 class, 1 test file, 3 source files)
- "Stripe webhook handler" (1 handler, 4 event types, 1 test file)
- "Wire auth middleware into API routes" (3-4 existing files modified, 1 test file)

**Too-broad examples:**
- "Full booking pipeline: forms + sheets + notifications + payments" (4 subsystems, 6+ files)
- "Admin dashboard" (9 pages, 20 endpoints — split into 3-4 issues)

**Too-narrow examples:**
- "Add column to spreadsheet" (30-min manual task, no code)
- "Add status enum value" (1 line change, not worth an issue)

---

## Title Convention

```
type: imperative short description
```

| Prefix | Use |
|--------|-----|
| `feat:` | New functionality |
| `fix:` | Broken behavior |
| `refactor:` | Restructure, no behavior change |
| `test:` | Test coverage |
| `docs:` | Documentation only |
| `chore:` | Tooling, deps, infra |

**Rules:**
- Imperative mood ("add auth", not "adding auth" or "added auth")
- Max 60 chars total
- No periods

---

## Scope Section

```markdown
## Scope

**In scope:**
- <specific deliverable 1>
- <specific deliverable 2>

**Out of scope:**
- <explicitly excluded item 1>
- <explicitly excluded item 2>
```

- In-scope items are concrete and verifiable
- Out-of-scope prevents scope creep — name things the agent might assume are included
- If an out-of-scope item needs doing, create a separate issue and link it

---

## Labels

Apply exactly one type label and optionally one priority label.

| Label | Use |
|-------|-----|
| `bug` | Broken behavior |
| `enhancement` | New feature |
| `task` | Chore, refactor, infra |
| `documentation` | Docs only |

| Priority | Meaning |
|----------|---------|
| `p0-critical` | Blocks all other work |
| `p1-high` | Do next |
| `p2-medium` | Do soon |
| `p3-low` | Backlog |

---

## Workflow: Large Features

1. **Spec mode**: Create a master plan breaking the feature into phases
2. **Save the plan** as `docs/plans/<YYYY-MM-DD-type-name>.md`
3. **Create one issue per phase** using this template
4. **One fresh agent session per issue**: start clean, reference the plan doc, implement, commit
5. **Commit at the end of each session**: don't carry uncommitted work across sessions
6. **Update the plan** after each phase to mark completion

This avoids the compression trap: each session starts with full context, never hits degradation.

---

## Dependency Notation

In the "Depends On" section:
```
- #61 (API must exist to issue JWTs)               -- needs this built first
- `<path>/<file>` (already built)                   -- just references existing code
- Nothing -- this is foundational infra             -- independent, can start immediately
- -- (independent; used by #65)                     -- others depend on THIS
```

In issue tables (plan docs):
```
| #65 | ReservationSync | #61, #69 |                -- both must be done first
| #69 | SheetConnector  | -- (independent; used by #65) | -- clarify direction
```

---

## Linking

| Relation | Syntax |
|----------|--------|
| Plan → Issue | `Plan: docs/plans/<file>.md` |
| Spec → Issue | `Spec: docs/specs/<file>.md` |
| Context docs | `Context: docs/context/<file>.ext` |
| Blocking | `Blocked by: #N` / `Blocks: #N` |
| Related | `Related: #N` |
| Parent | `Parent: #N` |

---

## Agent-Specific Rules

### Before Creating an Issue

1. **Search first** — check existing issues for duplicates
2. **Check `docs/plans/`** — a plan may already exist for this work
3. **Check `docs/specs/`** — the feature may already be specified
4. **Check `docs/context/`** — uploaded docs may contain requirements

### When Working an Issue

1. Read the full issue before writing any code
2. Read all files in "Read Before Implementing" section
3. Read all linked specs, plans, and context docs
4. Create a branch: `type/short-name` (e.g., `feat/sheet-sync`)
5. Commit with `type: description` format
6. PR links the issue with `Closes #N`
7. Check every AC box before requesting review

### When Closing an Issue

1. All AC boxes checked
2. PR merged
3. No open threads or unresolved comments
4. CHANGELOG updated if user-facing

---

## After Creating Issues

1. Update the relevant plan document's implementation status
2. Create or update sprint tracking if applicable
3. Commit all trace doc updates
4. Push to main

---

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Vague titles ("fix stuff") | Specific imperative ("fix: null check in auth") |
| No AC | Always include verifiable criteria |
| Mega-issues (8+ AC) | Split into focused sub-issues |
| Assumed context | Link specs, docs, related issues |
| Implementation as AC | AC describes outcomes, not steps |
| Skipping out-of-scope | Name what's excluded to prevent creep |
| Starting draft issues | Only work on Ready issues |
| Missing "Read Before" section | Always list 3-6 files with reasons |
| Missing "Files" section | Always list CREATE/MODIFY/DELETE explicitly |
| Vague AC ("code is clean") | Testable criteria only |

---

## Checklist: Is This Issue Ready?

Before marking an issue as Ready, verify:

- [ ] Title follows `type: description` format (max 60 chars)
- [ ] Context section explains WHY and links plan/phase
- [ ] "What to Build" describes WHAT, not HOW
- [ ] "Read Before Implementing" lists 3-6 files with reasons
- [ ] "Files" section uses CREATE/MODIFY/DELETE verbs
- [ ] Scope section has both in/out of scope
- [ ] AC are verifiable checkboxes (5-8 max)
- [ ] At least one integration criterion in AC
- [ ] Test command included in AC
- [ ] Dependencies listed with reasons
- [ ] Size is right (3-8 files, one concept, one session)
- [ ] Exactly one type label applied
