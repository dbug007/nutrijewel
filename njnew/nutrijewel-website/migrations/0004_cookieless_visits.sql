-- Cookie-free visitor counts, for EVERY visitor (Cloudflare D1).
-- Apply with:
--   npx wrangler d1 execute nutrijewel-orders --remote --file migrations/0004_cookieless_visits.sql
--
-- Why this exists: 0003's tables only ever counted people who tapped "Accept",
-- and almost nobody does, so the dashboard's visitor figures were close to
-- empty. These tables count everyone, and can, because nothing in them is
-- personal data:
--   * no cookie, no session id, no identifier of any kind: a row cannot be
--     linked to another row, let alone to a person
--   * no IP address and no user-agent string (the user-agent is read once to
--     classify the device, then discarded)
--   * path without its query string or fragment, referrer as a host only
--
-- A "visit" is counted the way Cloudflare Web Analytics counts one: a page load
-- that arrived from outside the site (another site, or typed in). Moving between
-- pages inside the shop is a page view, not a new visit.
--
-- 0003's page_views and analytics_events are no longer written. They are left in
-- place rather than dropped, so nothing already recorded is destroyed.

CREATE TABLE IF NOT EXISTS hits (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  day         TEXT NOT NULL,                 -- India date, YYYY-MM-DD
  path        TEXT NOT NULL,
  entry       INTEGER NOT NULL DEFAULT 0,    -- 1 = the first page of a visit
  referrer    TEXT,                          -- host only, on entries only, NULL = direct
  device      TEXT,                          -- mobile | tablet | desktop
  country     TEXT,                          -- two letters, from Cloudflare
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (entry IN (0, 1))
);
CREATE INDEX IF NOT EXISTS idx_hits_day ON hits (day);
CREATE INDEX IF NOT EXISTS idx_hits_day_entry ON hits (day, entry);

-- Shopping steps, counted at most once per page load, with no identifier.
CREATE TABLE IF NOT EXISTS hit_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  day         TEXT NOT NULL,
  event       TEXT NOT NULL,                 -- add_to_cart | begin_checkout
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_hit_events_day ON hit_events (day, event);
