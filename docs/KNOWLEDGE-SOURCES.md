# Knowledge Base Strategy & Sources

## Hierarchy of Truth

```text
LEVEL 1 — Canonical (Highest Priority)
- Git repository documentation (docs/)
- Committed schemas & migrations
- Committed API specifications
- Committed source code and automated tests

LEVEL 2 — Grounded Supporting Knowledge
- Gemini Notebook / NotebookLM
- Google Drive project documents
- Approved internal project files

LEVEL 3 — External Technical References
- Official vendor documentation (PHP.net, MySQL, MDN, Google Cloud)
- Official APIs & SDK documentation

LEVEL 4 — Community References
- Community MCP servers
- GitHub discussions & issue trackers
- Technical blogs and forums
```

## Conflict Resolution
- If an external knowledge source or community MCP conflicts with committed Git repository documentation, do NOT silently override Git.
- Report the conflict explicitly and record the verified decision in an Architecture Decision Record (`docs/ADR/`).

## Project Notebooks & Grounded References
- **Notebook Name**: `TODO: record linked notebook name`
- **Notebook URL**: `TODO: record URL`
- **Scope / Topics**: Scripture resources, theological references, project notes.
