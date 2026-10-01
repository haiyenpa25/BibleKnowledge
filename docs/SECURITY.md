# Security Policy & Guidelines

## 1. Secrets Management
- Never commit passwords, API keys, private keys, session tokens, or `.env` files into Git.
- Local configuration must be kept in `.env` (or ignored local configs) and loaded via environment variables.

## 2. Authentication & Session Security
- Browser session data and cookies (including Google session cookies for MCP tools) must never be checked into Git.
- Enforce least privilege on database users and API access.

## 3. Data Validation & Protection
- Prevent SQL injection: Always use parameterized queries (PDO prepared statements).
- Prevent XSS: Escape all user input rendered into HTML.
- Prevent CSRF: Use anti-CSRF tokens for state-changing POST/PUT/DELETE requests.
- Validate and sanitize all input strictly on the server side.
