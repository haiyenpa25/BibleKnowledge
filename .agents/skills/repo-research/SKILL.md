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
