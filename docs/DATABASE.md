# Database Documentation

## 1. Database Engine
- **Engine**: MySQL / MariaDB (XAMPP standard) `TODO: verify exact engine, database name, and credentials configuration`.

## 2. Naming Conventions & Rules
- Table names: `TODO: verify convention (e.g. snake_case plural)`
- Primary keys: `id` (auto-increment integer or UUID)
- Timestamps: `created_at`, `updated_at` where applicable
- Never modify production data directly without a safe migration/backout plan.
- Never invent undocumented columns or constraints.

## 3. Schema & Tables
- `TODO: verify schema definitions from repository/project owner`

## 4. Migrations
- Tooling: `TODO: verify migration tool (e.g. custom SQL scripts, Phinx, Laravel/Doctrine migrations)`
- Path: `TODO: verify migrations folder`
