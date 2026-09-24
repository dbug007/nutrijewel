-- First-party visitor analytics (Cloudflare D1).
-- Apply with:
--   npx wrangler d1 execute nutrijewel-orders --remote --file migrations/0003_analytics.sql
--
-- Privacy by design, and written to stay that way:
--   * No IP address, no user-agent string, no name, phone or email. Ever.
--   * session_id is random, made in the visitor's browser, linked to no person,
--     and expires after 30 minutes of inactivity. It counts visits; it does not
--     identify anyone.
--   * path has its query string and fragment removed before it is stored, because
--     those can carry an email or an order number.
--   * referrer is the referring host only ("instagram.com"), never the full URL.
-- Nothing is written unless the visitor accepted analytics in the consent banner.

CREATE TABLE IF NOT EXISTS page_views (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  day         TEXT NOT NULL,            -- India date, YYYY-MM-DD
  path        TEXT NOT NULL,
  session_id  TEXT NOT NULL,
  referrer    TEXT,                     -- host only; NULL means direct
  device      TEXT,                     -- mobile | tablet | desktop
  country     TEXT,                     -- two letters, from Cloudflare
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_pv_day ON page_views (day);
CREATE INDEX IF NOT EXISTS idx_pv_day_session ON page_views (day, session_id);

-- Funnel steps that are not page views.
CREATE TABLE IF NOT EXISTS analytics_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  day         TEXT NOT NULL,
  session_id  TEXT NOT NULL,
  event       TEXT NOT NULL,            -- add_to_cart | begin_checkout | purchase
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ev_day_event ON analytics_events (day, event);
