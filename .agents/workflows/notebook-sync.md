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
