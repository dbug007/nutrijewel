-- Rate limiting (Cloudflare D1).
-- Apply with:
--   npx wrangler d1 execute nutrijewel-orders --remote --file migrations/0002_rate_limits.sql
--
-- One row per (bucket, fixed time window). A bucket is an action plus a caller,
-- for example 'create-order:203.0.113.7'. Counting is an upsert, so there is no
-- read-then-write race between two requests landing together.
--
-- Rows are short-lived: the helper deletes windows older than a day, now and
-- then, so this table never grows without bound.

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket        TEXT    NOT NULL,
  window_start  INTEGER NOT NULL,   -- unix seconds, floored to the window size
  count         INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits (window_start);
