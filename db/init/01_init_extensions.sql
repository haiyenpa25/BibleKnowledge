-- ==============================================================================
-- 01_init_extensions.sql: Enable Required PostgreSQL Extensions
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Verify extensions
DO $$
BEGIN
    RAISE NOTICE 'Extensions uuid-ossp and vector successfully initialized.';
END $$;
