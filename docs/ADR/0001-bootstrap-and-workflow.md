# ADR-0001: Antigravity Pro Project Bootstrap and Multi-Model Workflow

## Status
Accepted

## Context
The project requires a structured AI-assisted development workflow where:
- Git remains the canonical source of truth.
- Google Antigravity acts as the primary implementation agent (editor, terminal, tests).
- Gemini Notebook / NotebookLM acts as the research and grounded knowledge layer.
- External models (ChatGPT, Claude, Codex) act as independent reviewers and architectural planners.

## Decision
1. Establish standard `.agents/` directory containing role instructions (`AGENTS.md`), focused skills (`repo-research`, `feature-planner`, `implementation`, `database`, `api`, `testing`, `security-review`, `code-review`), and standard workflows.
2. Maintain structured documentation under `docs/`.
3. Follow the 1 TASK - 1 SPEC - 1 BRANCH - 1 IMPLEMENTER - 1 REVIEWER rule.
4. Keep all credentials, tokens, and browser session state strictly out of Git version control.

## Consequences
- Clean separation of concerns between specification, implementation, and review.
- Prevents hallucination of business rules, schemas, and credentials.
- Workflows are repeatable, documented, and auditable.
