---
description: Bootstrap Antigravity Pro standards, structures, and workflows for this repository.
---

# Bootstrap Project

1. Detect operating system, repository root, languages, frameworks, and tools.
2. Initialize Git if not already a repository.
3. Establish `.agents/` structure:
   - `AGENTS.md`
   - Core skills (`repo-research`, `feature-planner`, `implementation`, `database`, `api`, `testing`, `security-review`, `code-review`)
   - Core workflows
4. Establish `docs/` template foundation (`PRODUCT.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `SECURITY.md`, `CODING-STANDARDS.md`, `ROADMAP.md`, `KNOWLEDGE-SOURCES.md`, `ADR/`, `tasks/`).
5. Configure safe baseline `.gitignore` to prevent secret and session leakage.
6. Inspect and configure MCP integrations (prefer official Google integrations; configure NotebookLM MCP safely).
7. Validate environment baseline (build, lint, test).
8. Report audit and final status.
