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
