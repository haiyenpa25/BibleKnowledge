# Antigravity Pro Project Bootstrap

> Purpose: Turn Google Antigravity into the primary implementation agent for this repository, with Git as the canonical source of truth, Gemini Notebook / NotebookLM as the research and grounded-knowledge layer, and ChatGPT/Codex or Claude as planner/reviewer.
>
> This file is intended to be given directly to Antigravity. Antigravity should inspect the repository, create the required project-agent structure, configure supported MCP integrations, and report what was changed.

---

# 0. Operating Principles

Use the following architecture:

```text
ChatGPT / Codex / Claude
        │
        │ architecture / roadmap / independent review
        ▼
Git Repository
        │
        ├── docs/
        ├── .agents/
        └── source code
        │
        ├──────────────────────────┐
        ▼                          ▼
Gemini Notebook / NotebookLM   Google Antigravity
Knowledge / Research          Primary Coding Agent
Grounded Q&A                  Edit / Terminal / Test / Browser
        │                          │
        └────────────┬─────────────┘
                     ▼
                  Git Diff
                     │
                     ▼
              Independent Review
```

## Core rules

1. **Git repository is the canonical source of truth.**
2. Gemini Notebook / NotebookLM is a research and knowledge layer, not the canonical specification.
3. Antigravity is the primary code executor.
4. Only one implementation agent should modify a feature branch at a time.
5. Use another model/agent as an independent reviewer when practical.
6. Never invent undocumented business rules, schema fields, permissions, API contracts, secrets, or environment variables.
7. Prefer small, reviewable changes over large rewrites.
8. Run tests and inspect the final Git diff before declaring work complete.

Use this rule for every feature:

```text
1 TASK
1 SPEC
1 BRANCH
1 IMPLEMENTER
1 REVIEWER
```

---

# 1. First Action: Inspect Before Modifying

Before changing anything:

1. Detect the operating system.
2. Detect the repository root.
3. Detect the main language/framework.
4. Detect package managers.
5. Detect Docker / docker-compose usage.
6. Detect test frameworks.
7. Detect lint/typecheck/build commands.
8. Detect ORM/database migration tooling.
9. Inspect existing AI instruction files:
   - `AGENTS.md`
   - `.agents/`
   - `CLAUDE.md`
   - `.github/copilot-instructions.md`
   - other agent/rule files
10. Inspect existing MCP configuration.
11. Inspect `README.md`, `docs/`, migrations, API definitions and CI configuration.

Do not delete or overwrite existing project instructions without preserving and merging useful content.

Create a short bootstrap report before making destructive or architectural changes.

---

# 2. Required Project Structure

Create or merge the following structure:

```text
.agents/
├── AGENTS.md
├── mcp_config.json                 # only if project-local MCP config is appropriate
│
├── skills/
│   ├── repo-research/
│   │   └── SKILL.md
│   ├── feature-planner/
│   │   └── SKILL.md
│   ├── implementation/
│   │   └── SKILL.md
│   ├── database/
│   │   └── SKILL.md
│   ├── api/
│   │   └── SKILL.md
│   ├── testing/
│   │   └── SKILL.md
│   ├── security-review/
│   │   └── SKILL.md
│   └── code-review/
│       └── SKILL.md
│
└── workflows/
    ├── bootstrap-project.md
    ├── research-feature.md
    ├── plan-feature.md
    ├── implement-feature.md
    ├── review-feature.md
    └── ship-feature.md

docs/
├── PRODUCT.md
├── ARCHITECTURE.md
├── DATABASE.md
├── API.md
├── SECURITY.md
├── CODING-STANDARDS.md
├── ROADMAP.md
├── KNOWLEDGE-SOURCES.md
│
├── ADR/
│   └── README.md
│
└── tasks/
    └── README.md
```

If equivalent files already exist, reuse them instead of duplicating content.

---

# 3. Create `.agents/AGENTS.md`

Create `.agents/AGENTS.md` with the following intent.

```markdown
# Project Agent Instructions

## Role

You are a senior software engineer working on this repository.

Your responsibility is to implement production-quality changes while preserving the existing architecture, documented business rules, security requirements and coding conventions.

## Canonical Source of Truth

The canonical project documentation is stored in the Git repository.

Read relevant files from:

- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md`
- `docs/API.md`
- `docs/SECURITY.md`
- `docs/CODING-STANDARDS.md`
- `docs/ADR/`
- relevant source code
- relevant migrations
- relevant tests

External AI systems, web searches, Gemini Notebook / NotebookLM and MCP tools are supporting research sources.

If an external source conflicts with committed repository documentation, do not silently choose one. Report the conflict.

## Before Coding

Before implementing a feature:

1. Read relevant documentation.
2. Inspect the existing implementation.
3. Identify affected modules.
4. Identify database/API/security impacts.
5. Identify required tests.
6. Produce or update a task plan.
7. Make the smallest reasonable implementation.

## Hallucination Prevention

Never invent:

- database fields
- table names
- API endpoints
- request properties
- response properties
- permission rules
- role names
- business rules
- environment variables
- credentials
- third-party integration behavior

If required information is missing, record it as an unresolved specification issue.

## Database Rules

Before changing database behavior:

1. Read `docs/DATABASE.md`.
2. Inspect current migrations.
3. Inspect existing entities/models.
4. Check backward compatibility.
5. Add a migration when required.
6. Add or update tests.
7. Update documentation.

Never modify production data directly unless explicitly requested and a safe migration/backout plan exists.

## API Rules

Before creating or modifying an API:

1. Read `docs/API.md`.
2. Follow existing request/response conventions.
3. Preserve documented error behavior.
4. Validate input.
5. Enforce authorization.
6. Add automated tests.
7. Update API documentation.

## Security Rules

Never commit:

- `.env`
- passwords
- API keys
- OAuth secrets
- cookies
- browser session data
- refresh tokens
- private keys

Prefer least-privilege access.

Treat third-party/community MCP servers as untrusted until reviewed.

## Implementation Workflow

For every feature:

RESEARCH
→ SPEC
→ PLAN
→ IMPLEMENT
→ TEST
→ REVIEW
→ DOCUMENT
→ FINAL DIFF REVIEW

## Quality Gate

Before declaring a task complete:

- build succeeds
- lint succeeds
- type checking succeeds if applicable
- unit tests succeed
- relevant integration tests succeed
- relevant end-to-end tests succeed if available
- no secrets are committed
- no accidental generated files are committed
- documentation is updated when API/schema/architecture changed
- final Git diff has been reviewed

## Git Rules

Use one feature branch per task when branch management is available.

Prefer small commits.

Do not force-push unless explicitly requested.

Do not rewrite unrelated files.

Do not commit secrets or local authentication state.

## Knowledge Tools

Gemini Notebook / NotebookLM may be used to:

- search business documents
- compare specifications
- extract requirements
- find contradictions
- find edge cases
- summarize historical decisions
- answer grounded questions against project sources

Notebook output is evidence, not automatically canonical truth.

When useful, save verified conclusions into repository documentation so they are version-controlled.
```

---

# 4. Create Agent Skills

Use progressive disclosure: keep `.agents/AGENTS.md` compact and put specialized instructions into skills.

## 4.1 `repo-research/SKILL.md`

```markdown
---
name: repo-research
description: Use before implementing unfamiliar features or touching unfamiliar modules.
---

# Repository Research

Before implementation:

1. Locate the relevant modules.
2. Read related tests.
3. Read related API/schema docs.
4. Trace the current data flow.
5. Identify dependencies.
6. Identify security boundaries.
7. Identify likely regression areas.

Return:

- relevant files
- current behavior
- constraints
- unknowns
- recommended implementation boundary

Do not modify code during the research phase unless explicitly instructed.
```

## 4.2 `feature-planner/SKILL.md`

```markdown
---
name: feature-planner
description: Use to convert a feature request into an implementation plan.
---

# Feature Planning

Create:

`docs/tasks/<task-slug>/PLAN.md`

Include:

- objective
- user/business requirement
- assumptions
- source references
- affected modules
- API changes
- database changes
- authorization/security impact
- migration impact
- implementation steps
- testing strategy
- rollback considerations
- unresolved questions

Do not invent missing requirements.
```

## 4.3 `implementation/SKILL.md`

```markdown
---
name: implementation
description: Use when implementing an approved feature plan.
---

# Implementation

1. Read the task plan.
2. Re-check affected code.
3. Implement the smallest safe change.
4. Preserve repository conventions.
5. Add tests with the implementation.
6. Avoid unrelated refactors.
7. Update documentation when behavior changes.
8. Review the diff before testing completion.
```

## 4.4 `database/SKILL.md`

```markdown
---
name: database
description: Use for schema, migration, ORM, query, index or persistence changes.
---

# Database Engineering

Before database changes:

1. Read `docs/DATABASE.md`.
2. Inspect recent migrations.
3. Inspect current models/entities.
4. Determine upgrade and rollback behavior.
5. Consider indexes, constraints and nullability.
6. Check compatibility with existing data.
7. Add tests.

Never invent columns or constraints.

Do not perform destructive migrations without explicitly documenting impact and rollback.
```

## 4.5 `api/SKILL.md`

```markdown
---
name: api
description: Use for API endpoint, contract, validation or integration changes.
---

# API Engineering

Check:

- endpoint naming
- authentication
- authorization
- input validation
- response schema
- pagination
- idempotency if relevant
- error codes
- observability
- backward compatibility

Update `docs/API.md` when the contract changes.
```

## 4.6 `testing/SKILL.md`

```markdown
---
name: testing
description: Use when adding or validating automated tests.
---

# Testing

For each behavior change:

1. Add happy-path coverage.
2. Add important failure-path coverage.
3. Add permission/security coverage where relevant.
4. Add regression coverage for the bug/feature.
5. Prefer deterministic tests.
6. Avoid tests that depend on real production services unless explicitly configured as integration tests.

Run the narrowest relevant test set first, then the wider suite.
```

## 4.7 `security-review/SKILL.md`

```markdown
---
name: security-review
description: Use for authentication, authorization, secrets, file uploads, external APIs, user input or sensitive data.
---

# Security Review

Review:

- authentication boundary
- authorization boundary
- tenant/data isolation
- injection risks
- path traversal
- file upload validation
- SSRF
- secret leakage
- logging of sensitive values
- insecure defaults
- dependency/security implications

Report security concerns separately from style concerns.
```

## 4.8 `code-review/SKILL.md`

```markdown
---
name: code-review
description: Use after implementation and before merge.
---

# Code Review

Review the final diff for:

- correctness
- regressions
- security
- concurrency problems
- data integrity
- API compatibility
- missing edge cases
- missing tests
- unnecessary complexity
- dead code
- accidental generated files
- secret leakage

Prioritize findings by impact.

Do not approve code merely because tests pass.
```

---

# 5. Create Workflows

## 5.1 `research-feature.md`

```markdown
---
description: Research a feature before planning or implementation.
---

1. Read relevant repository documentation.
2. Inspect related implementation and tests.
3. Query approved knowledge sources when useful.
4. If Gemini Notebook / NotebookLM MCP is available, use it for grounded business-document research.
5. Compare Notebook findings with repository documentation.
6. Record conflicts and unknowns.
7. Save verified findings to `docs/tasks/<task-slug>/RESEARCH.md`.
8. Do not modify production behavior in this workflow.
```

## 5.2 `plan-feature.md`

```markdown
---
description: Produce a complete implementation plan for a feature.
---

1. Run repository research.
2. Read the feature request.
3. Read verified knowledge-source findings.
4. Create/update `docs/tasks/<task-slug>/PLAN.md`.
5. Include API/database/security/testing impact.
6. List unresolved requirements instead of guessing.
7. Do not implement the feature in this workflow unless explicitly instructed.
```

## 5.3 `implement-feature.md`

```markdown
---
description: Implement a planned feature with tests and documentation.
---

## Phase 1 — Verify Plan

Read:

- task plan
- relevant product docs
- architecture docs
- API/database/security docs
- existing implementation
- existing tests

## Phase 2 — Implement

Implement the smallest safe change.

## Phase 3 — Validate

Run:

- formatter if required
- lint
- typecheck if applicable
- unit tests
- relevant integration tests
- build
- relevant end-to-end tests if configured

## Phase 4 — Review

Review the final Git diff.

Look for:

- logic bugs
- security problems
- missing edge cases
- accidental scope expansion
- compatibility regressions
- unnecessary complexity

## Phase 5 — Documentation

Update docs when schema/API/architecture/configuration changed.

## Final Report

Return:

- files changed
- tests executed
- test results
- known limitations
- unresolved issues
- suggested reviewer focus
```

## 5.4 `review-feature.md`

```markdown
---
description: Independently review an implemented feature.
---

Do not assume the implementation is correct.

1. Read the original task/spec.
2. Read relevant canonical docs.
3. Inspect the full diff.
4. Trace important runtime paths.
5. Review tests.
6. Look for missing requirements.
7. Look for regression/security/data-integrity risks.
8. Return findings ordered by severity.
```

## 5.5 `ship-feature.md`

```markdown
---
description: Final quality gate before merge/release.
---

Verify:

- requirement implemented
- plan and code agree
- build passes
- lint passes
- typecheck passes if applicable
- tests pass
- no secrets
- no local/session files
- docs updated
- migrations safe
- final diff reviewed
- known limitations documented

Do not merge automatically unless repository policy explicitly allows it.
```

---

# 6. Knowledge Base Strategy

Create `docs/KNOWLEDGE-SOURCES.md`.

Use this hierarchy:

```text
LEVEL 1 — Canonical
Git repository documentation
Committed schemas
Committed migrations
Committed API specifications
Committed code and tests

LEVEL 2 — Grounded supporting knowledge
Gemini Notebook / NotebookLM
Google Drive project documents
Approved internal documents

LEVEL 3 — External technical references
Official vendor documentation
Official APIs
Official SDK documentation

LEVEL 4 — Community references
GitHub discussions
community MCP servers
blogs
forums
```

If sources conflict, report the conflict.

Do not silently replace canonical repository facts with Notebook or web output.

---

# 7. NotebookLM / Gemini Notebook Automation

There are two supported operating modes.

---

## MODE A — Recommended / Stable

Use Google Drive / Google Workspace integrations as the durable document path.

Architecture:

```text
Project Docs in Google Drive
          │
          │ official Workspace integration / MCP
          ▼
     Antigravity
          │
          ├── read project documents
          ├── update approved documents
          └── convert verified decisions into Git docs

Gemini Notebook / NotebookLM
          │
          └── uses selected Drive/project sources for grounded research
```

Advantages:

- official Google authentication path
- less dependence on undocumented Notebook internals
- easier credential management
- documents remain independently accessible
- Git can retain canonical structured specs

When possible:

1. Keep business/source documents in Google Drive.
2. Let Notebook use those documents as knowledge sources.
3. Let Antigravity read the same Drive documents using official Workspace integrations.
4. Save verified implementation specifications into Git.
5. Treat Notebook as a research interface over those sources.

Do not store Google cookies/session state in the repository.

---

## MODE B — Full Notebook Automation via Community MCP

Use this only when the user explicitly wants Antigravity to directly operate Gemini Notebook / NotebookLM.

Important:

> A NotebookLM/Gemini Notebook community MCP bridge is not equivalent to an official stable Notebook API. Treat it as an optional integration that can break when Google changes internal behavior.

Expected capabilities may include:

- list notebooks
- query notebooks
- create notebooks
- add/remove sources
- run grounded queries
- trigger research
- create notes/reports
- generate other Notebook artifacts

Capabilities depend on the selected community MCP implementation.

### Security rules

1. Review the MCP project before installation.
2. Prefer a widely used open-source implementation with recent maintenance.
3. Never commit:
   - Google cookies
   - browser profiles
   - session tokens
   - OAuth secrets
   - refresh tokens
4. Store authentication state outside the repository.
5. Default to **read/query-only** behavior for software-development workflows.
6. Require explicit instruction before:
   - creating notebooks
   - deleting notebooks
   - deleting sources
   - changing sharing settings
   - writing large amounts of generated content back to Notebook

### Project-local Antigravity MCP configuration

Antigravity may use:

```text
.agents/mcp_config.json
```

or the user's global Antigravity/Gemini MCP configuration, depending on the installed Antigravity version and user preference.

Before editing MCP configuration:

1. Inspect existing MCP config.
2. Preserve existing servers.
3. Back up the current config.
4. Never place credentials directly into the project file.
5. Validate configuration after modification.

### Example community Notebook MCP pattern

A community implementation may expose a command similar to:

```json
{
  "mcpServers": {
    "notebooklm": {
      "command": "npx",
      "args": [
        "-y",
        "notebooklm-mcp-server",
        "start"
      ]
    }
  }
}
```

This is an **example pattern only**.

Before installing:

1. Verify that the package/repository is still maintained.
2. Review its authentication method.
3. Review its requested permissions.
4. Check its issue tracker/security notes.
5. Confirm it supports the currently installed Antigravity MCP format.
6. Do not automatically trust a package solely because its name matches this example.

If the bridge requires browser/cookie authentication, keep all session data outside Git.

---

# 8. Notebook Automation Workflow

If Notebook MCP is available, create:

`.agents/workflows/notebook-research.md`

with:

```markdown
---
description: Use Gemini Notebook / NotebookLM as a grounded research layer for a development task.
---

# Notebook Research

## Inputs

- task name
- task description
- expected Notebook/project knowledge base

## Process

1. Identify the relevant notebook.
2. Query the notebook for:
   - business rules
   - user flows
   - field names
   - validation rules
   - permission rules
   - edge cases
   - historical decisions
3. Ask the notebook to cite or identify its source material.
4. Cross-check important findings against repository documentation.
5. Never silently override Git documentation.
6. Save verified findings to:

`docs/tasks/<task-slug>/NOTEBOOK-RESEARCH.md`

## Required output format

### Verified Requirements

### Relevant Source Documents

### Database Rules

### API Rules

### Permissions

### Validation Rules

### Edge Cases

### Conflicts With Repository Docs

### Missing Information

### Recommendations for the Implementation Plan

Do not implement code during Notebook research unless explicitly requested.
```

---

# 9. Optional Notebook Sync Workflow

If the selected Notebook MCP safely supports creating/updating Notebook content, create:

`.agents/workflows/notebook-sync.md`

```markdown
---
description: Synchronize verified project knowledge with Gemini Notebook / NotebookLM.
---

# Notebook Sync

This workflow must be conservative.

## Git remains canonical.

Allowed by default:

- create a project notebook if none exists
- add approved project source documents
- add links/files explicitly approved for the project
- run grounded research
- add a short generated project index note

Require explicit approval before:

- deleting a notebook
- deleting sources
- changing notebook sharing
- replacing user-authored material
- uploading secrets/private config
- publishing generated content

## Sync source priority

Prefer sources such as:

- product requirements
- architecture docs
- API specs
- database schema docs
- permission matrices
- user-flow docs
- meeting decisions

Avoid uploading:

- `.env`
- source secrets
- build artifacts
- dependency caches
- browser profiles
- raw authentication state
- unnecessary source-code snapshots

After sync:

1. Query the notebook for key architecture facts.
2. Compare answers against Git docs.
3. Report discrepancies.
4. Do not silently rewrite canonical Git docs.
```

---

# 10. Official Google MCP Integrations

Prefer official Google MCP servers when available.

Useful categories include:

- Google Developer Knowledge
- Google Workspace / Drive
- other officially supported Google Cloud/Workspace MCP services

Use official documentation integrations for current:

- Google APIs
- Gemini APIs
- Firebase
- Google Cloud
- Workspace APIs

Do not rely on model memory when official current documentation is available.

---

# 11. Suggested Day-to-Day Workflow

For every meaningful feature:

```text
USER REQUEST
     │
     ▼
RESEARCH
repo + Notebook/Drive if useful
     │
     ▼
docs/tasks/<task>/RESEARCH.md
     │
     ▼
PLAN
docs/tasks/<task>/PLAN.md
     │
     ▼
FEATURE BRANCH
     │
     ▼
ANTIGRAVITY IMPLEMENTATION
     │
     ├── code
     ├── migrations
     ├── tests
     └── docs
     │
     ▼
BUILD + TEST + LINT + TYPECHECK
     │
     ▼
FINAL GIT DIFF REVIEW
     │
     ▼
INDEPENDENT REVIEW
ChatGPT/Codex/Claude
     │
     ▼
FIX FINDINGS
     │
     ▼
MERGE
```

---

# 12. Task Folder Standard

For every non-trivial task:

```text
docs/tasks/<task-slug>/
├── REQUEST.md
├── RESEARCH.md
├── NOTEBOOK-RESEARCH.md      # when Notebook is used
├── PLAN.md
├── TEST-PLAN.md
└── REVIEW.md
```

Not every file is mandatory for tiny changes.

---

# 13. Roadmap Format

Create `docs/ROADMAP.md` using:

```markdown
# Project Roadmap

## Phase 0 — Repository Baseline

- architecture inventory
- environment inventory
- build/test baseline
- documentation baseline
- security baseline

## Phase 1 — Stabilization

- fix broken build/tests
- standardize environment
- establish Docker/dev setup
- establish CI
- establish coding conventions

## Phase 2 — Core Product

For each epic:

- objective
- dependencies
- acceptance criteria
- API impact
- data impact
- security impact
- tests

## Phase 3 — Quality

- integration tests
- E2E
- performance
- observability
- security hardening

## Phase 4 — Release

- deployment
- backup
- migration
- monitoring
- rollback
```

Populate the actual roadmap only after inspecting the repository and product requirements.

---

# 14. ChatGPT / Claude Handoff Format

When requesting an independent architecture/code review, provide:

```text
Task:
<task>

Business requirement:
<requirement>

Plan:
<PLAN.md>

Relevant canonical docs:
<files>

Git diff:
<diff>

Tests:
<commands and results>

Known limitations:
<limitations>
```

Ask the reviewer to focus on:

1. requirement coverage
2. correctness
3. regression risks
4. data integrity
5. security
6. concurrency
7. API compatibility
8. missing tests
9. unnecessary complexity

Do not ask a reviewer to rewrite the entire implementation unless necessary.

---

# 15. Token / Context Optimization

To reduce context and model quota usage:

1. Keep `AGENTS.md` concise.
2. Put specialized details in `SKILL.md`.
3. Use task-specific documents.
4. Avoid pasting entire logs when a small excerpt is enough.
5. Avoid giving the agent the entire repository if file search can locate relevant modules.
6. Research before implementation.
7. Run narrow tests before full test suites.
8. Avoid multiple agents editing the same branch.
9. Summarize verified Notebook findings into Git task docs.
10. Reuse existing documentation instead of repeatedly asking Notebook the same questions.

---

# 16. Bootstrap Execution Instructions for Antigravity

Execute this bootstrap in the following order.

## Phase A — Audit

1. Inspect repository and environment.
2. Identify existing agent instruction files.
3. Identify existing documentation.
4. Identify existing MCP configuration.
5. Identify build/test/lint/typecheck commands.
6. Identify security-sensitive files.
7. Produce a concise audit summary.

## Phase B — Agent Foundation

Create/merge:

- `.agents/AGENTS.md`
- required skills
- required workflows

Do not overwrite useful existing instructions.

## Phase C — Documentation Foundation

Create missing docs as structured templates.

Where repository facts are already known, populate them.

Where facts are unknown, use:

`TODO: verify from repository/project owner`

Do not invent content.

## Phase D — MCP

1. Preserve current MCP servers.
2. Prefer official Google MCP integrations.
3. Configure project-local MCP only when appropriate.
4. If the user wants Notebook automation:
   - evaluate the selected Notebook community MCP
   - review its authentication behavior
   - install/configure it only after verifying current compatibility
   - never commit credentials/session state
5. Validate MCP connections.

## Phase E — Notebook

If Notebook MCP is available:

1. List available notebooks.
2. Do not modify notebooks immediately.
3. Report candidate project notebook(s).
4. If a clearly named project notebook exists, query it for:
   - project purpose
   - architecture
   - database rules
   - API rules
   - permission rules
   - important business rules
5. Save research into `docs/KNOWLEDGE-SOURCES.md` or a task research file.
6. Do not treat Notebook output as canonical without verification.

If no project notebook exists and the user has explicitly requested automatic Notebook setup:

1. Create one project notebook.
2. Use a clear project name.
3. Add only approved project sources.
4. Do not upload source secrets or the full repository by default.
5. Query it after creation and report the result.

## Phase F — Verification

Run the repository's safe baseline commands:

- build
- lint
- typecheck
- unit tests

Do not attempt unrelated code fixes unless explicitly asked.

## Phase G — Final Report

Report:

### Created
### Modified
### Existing files preserved
### MCP servers configured
### Notebook integration status
### Authentication actions still required from the user
### Build/test baseline
### Risks
### Recommended next task

---

# 17. Authentication Policy

If authentication is needed:

1. Ask the user to complete the provider's interactive login/OAuth flow.
2. Never ask the user to paste Google session cookies into chat.
3. Never print tokens into logs.
4. Never put credentials into `.agents/mcp_config.json`.
5. Prefer OS credential storage or the integration's documented auth mechanism.
6. Add sensitive local auth/session files to `.gitignore` if necessary.

---

# 18. Destructive Action Policy

Do not automatically:

- delete notebooks
- delete Notebook sources
- delete databases
- drop tables
- rewrite Git history
- force push
- rotate production secrets
- change production infrastructure
- merge branches
- publish releases

unless explicitly requested and the impact has been reviewed.

---

# 19. Definition of Done for This Bootstrap

Bootstrap is complete when:

- `.agents/AGENTS.md` exists
- core skills exist
- core workflows exist
- documentation foundation exists
- existing instructions have been preserved/merged
- repository build/test commands are documented
- MCP configuration has been inspected
- official Google MCP options are documented/configured where appropriate
- Notebook integration status is known
- no credentials are committed
- Git diff has been reviewed
- a final bootstrap report has been produced

---

# 20. Initial Command to Execute

After reading this file, begin with:

> Audit this repository and implement the Antigravity Pro bootstrap described in this document. Preserve all useful existing project configuration. Do not invent missing project facts. First inspect the repository, then create/merge `.agents`, documentation templates, skills and workflows. Inspect MCP configuration and prefer official Google integrations. If NotebookLM/Gemini Notebook automation is possible in the current environment, configure it conservatively; treat community Notebook MCP as optional and non-canonical, keep auth state outside Git, and report any interactive login I must complete. Finish by running safe baseline validation and reviewing the complete Git diff.

---

# 21. Optional Command After Bootstrap

For a new feature:

> Research this feature using the repository and, if available, the project Gemini Notebook/NotebookLM knowledge base. Save verified findings under `docs/tasks/<task-slug>/`, produce an implementation plan, then implement it on a single feature branch with tests. Git documentation is canonical. Do not invent missing business rules. Review the final diff and give me a handoff package for an independent ChatGPT/Codex/Claude review.

