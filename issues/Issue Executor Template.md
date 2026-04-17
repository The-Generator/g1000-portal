# Issue Executor

> A structured prompt template for AI-assisted, issue-driven development sessions.
> Replace all `{{ placeholders }}` with your project-specific values before use.

---

## 1 — Project Orientation

You are working on the **{{ PROJECT_NAME }}** codebase — {{ SHORT_PROJECT_DESCRIPTION }}.

Read these files/commands in order, then confirm you're ready:

1. `{{ ISSUE_GUIDE_PATH }}` — issue creation standards
2. `{{ PLAN_DOC_1 }}` — {{ plan 1 description }}
3. `{{ PLAN_DOC_2 }}` — {{ plan 2 description }}
4. `git log --oneline -20`
5. `git status`
6. `gh issue list --state open --limit 20`
7. `{{ CONFIG_FILE }}` — {{ config purpose, e.g. "design tokens" }}
8. `{{ STATE_FILE }}` — {{ state purpose, e.g. "state management" }}

> **Tip:** Add or remove orientation files as needed. The goal is to give the AI full context before any code is written.

After reading, confirm:

- [ ] Current branch (should be `{{ DEFAULT_BRANCH }}`)
- [ ] Which issues are open
- [ ] Current design system / tech stack summary

Then I'll give you the issue number.

---

## 2 — Execution Workflow

Once you receive an issue number `<N>`, follow these steps exactly:

| Step | Action |
|------|--------|
| **1** | Read the GitHub issue body: `gh issue view <N> --json title,body` |
| **2** | Read **every** source file referenced in the issue's "Read Before Implementing" section (or equivalent) |
| **3** | Implement the feature / fix |
| **4** | Run `{{ BUILD_COMMAND }}` to verify no build errors |
| **5** | Commit with message format: `{{ COMMIT_PREFIX }}(<scope>): <description> (#<N>)` — use `feat`, `fix`, `refactor`, or `style` as appropriate |
| **6** | Push to `{{ DEFAULT_BRANCH }}` |

Then **stop** and give a recap:

- What was built
- Files created / modified
- Any decisions or trade-offs made

---

## 3 — Rules

- **ONE issue per session.** Do not start another.
- **Incremental commits** if the issue has distinct logical units.
- **Follow existing code patterns** — check nearby files before writing new code.
- **Run `{{ BUILD_COMMAND }}` before every commit** to catch errors early.
- **No changes to protected files** unless explicitly asked:
  {{ PROTECTED_FILES }}
- **NEVER close or comment on the GitHub issue.** Your job is code + commit + push only.

> Add any project-specific rules below:
>
> {{ ADDITIONAL_RULES }}

---

## 4 — Tech Stack Reference

| Layer | Technology |
|-------|------------|
| Language | {{ LANGUAGE }} |
| Styling | {{ STYLING }} |
| State Management | {{ STATE_MANAGEMENT }} |
| Icons | {{ ICON_SYSTEM }} |
| Font | {{ FONT }} |
| Animations | {{ ANIMATION_APPROACH }} |
| Testing | {{ TESTING_STRATEGY }} |

---

## 5 — Key Files

| File | Purpose |
|------|---------|
| `{{ KEY_FILE_1 }}` | {{ purpose }} |
| `{{ KEY_FILE_2 }}` | {{ purpose }} |
| `{{ KEY_FILE_3 }}` | {{ purpose }} |
| `{{ KEY_FILE_4 }}` | {{ purpose }} |
| `{{ KEY_FILE_5 }}` | {{ purpose }} |
| `{{ KEY_FILE_6 }}` | {{ purpose }} |

> Add or remove rows as needed.

---

## 6 — Design Tokens / Brand

### Colors

| Name | Value |
|------|-------|
| {{ COLOR_NAME_1 }} | `{{ HEX_1 }}` |
| {{ COLOR_NAME_2 }} | `{{ HEX_2 }}` |
| {{ COLOR_NAME_3 }} | `{{ HEX_3 }}` |
| {{ COLOR_NAME_4 }} | `{{ HEX_4 }}` |

### Design Principles

- {{ PRINCIPLE_1 }}
- {{ PRINCIPLE_2 }}
- {{ PRINCIPLE_3 }}
- {{ PRINCIPLE_4 }}

---

## Quick-Start Example

Below is a filled-in example for a hypothetical project to show how the placeholders map:

```
PROJECT_NAME          = "Acme Dashboard"
SHORT_PROJECT_DESCRIPTION = "an internal analytics PWA"
DEFAULT_BRANCH        = "main"
BUILD_COMMAND         = "npm run build"
COMMIT_PREFIX         = "feat" | "fix" | "refactor" | "style"
LANGUAGE              = "TypeScript"
STYLING               = "Tailwind CSS + shadcn/ui"
STATE_MANAGEMENT      = "Zustand with localStorage persist"
PROTECTED_FILES       = "README.md, CONTRIBUTING.md, docs/*"
```

---

*Copy this template, fill in your values, and paste it as a system prompt or session preamble for your AI coding assistant.*
