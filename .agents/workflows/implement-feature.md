---
description: Implement a planned feature with tests and documentation.
---

# Feature Implementation

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
