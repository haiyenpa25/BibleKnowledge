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

### 1. Primary Knowledge Base: NGHIÊN CỨU KINH THÁNH © AICoDoc.com
- **Notebook Name**: `NGHIÊN CỨU KINH THÁNH © AICoDoc.com`
- **Notebook ID**: `058481ca-131d-41e5-9d8f-8383604a7ed3`
- **Notebook URL**: `https://notebooklm.google.com/notebook/058481ca-131d-41e5-9d8f-8383604a7ed3`
- **Source Count**: 275 sources
- **Scope / Topics**: Comprehensive Biblical knowledge base including Warren W. Wiersbe's BE Series (50 volumes), Zondervan Encyclopedias, Atlases, Dictionaries, Commentaries, Top 100 Q&A, and study resources.

### 2. Supporting Knowledge Base: Biblical Narratives and Prophecies
- **Notebook Name**: `Biblical Narratives and Prophecies`
- **Notebook ID**: `092abfe1-5161-48d5-be43-8c43640e2fb1`
- **Notebook URL**: `https://notebooklm.google.com/notebook/092abfe1-5161-48d5-be43-8c43640e2fb1`
- **Source Count**: 3 sources
- **Scope / Topics**: Specialized scripture narratives and prophetic texts.

### 3. Architecture & Technical References
- **App_Architecture_Docs**: `25a741ee-20cf-4091-9dca-9981db56ad05`
- **Apollo Technologies Company Profile**: `b564cc55-1028-4506-84b5-f5ada231cd1f`

