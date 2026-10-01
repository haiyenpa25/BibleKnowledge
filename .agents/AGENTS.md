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

```text
RESEARCH → SPEC → PLAN → IMPLEMENT → TEST → REVIEW → DOCUMENT → FINAL DIFF REVIEW
```

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
