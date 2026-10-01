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
