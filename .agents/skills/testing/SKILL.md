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
