# Coding Standards

## 1. General Principles
- Maintain documentation integrity and preserve existing docstrings/comments.
- Small, focused, reviewable commits over massive rewrites.
- Single responsibility principle for classes and functions.
- Never invent undocumented business rules, schema fields, or permissions.

## 2. Style Guides
- PHP: Follow PSR-12 coding standard.
- JavaScript: Modern ES6+, clear naming, modular organization.
- CSS: Clean vanilla CSS / BEM methodology where applicable.
- Markdown: GitHub Flavored Markdown with descriptive file links (`file://...`).

## 3. Review Checklist
- [ ] Code passes lint and type checks without warnings.
- [ ] Automated tests cover new logic and regressions.
- [ ] Documentation updated to reflect changes.
- [ ] No secrets, credentials, or session cookies committed.
