-- NutriJewel orders schema (Cloudflare D1, SQLite).
-- Apply with:
--   npx wrangler d1 execute nutrijewel-orders --remote --file migrations/0001_init.sql
-- Always name the database: the Cloudflare account hosts other brands.
--
-- Money is INTEGER PAISE everywhere. No REAL columns for money, ever: a float
-- rupee column is how a total ends up a hundredth off what was charged.

CREATE TABLE IF NOT EXISTS orders (
  id                  TEXT PRIMARY KEY,           -- uuid
  order_number        TEXT NOT NULL UNIQUE,       -- NJ-2609-4F2A, what the customer quotes
  status              TEXT NOT NULL,              -- see the CHECK below
  -- money, all recomputed server side, never taken from the browser
  items_paise         INTEGER NOT NULL,
  shipping_paise      INTEGER NOT NULL DEFAULT 0,
  total_paise         INTEGER NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'INR',
  -- customer. Guest checkout, so this is the only record of who ordered.
  customer_name       TEXT NOT NULL,
  customer_phone      TEXT NOT NULL,
  customer_email      TEXT,
  address_line        TEXT NOT NULL,
  city                TEXT NOT NULL,
  pincode             TEXT NOT NULL,
  shipping_zone       TEXT,
  notes               TEXT,
  -- nullable now, so accounts can be added later without a data migration
  customer_id         TEXT,
  -- razorpay
  razorpay_order_id   TEXT UNIQUE,
  razorpay_payment_id TEXT,
  paid_at             TEXT,
  -- audit
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (status IN ('created','paid','confirmed','packed','shipped','delivered','failed','cancelled','refunded')),
  CHECK (items_paise >= 0 AND shipping_paise >= 0 AND total_paise >= 0),
  -- the arithmetic is enforced by the database, not just by the code
  CHECK (total_paise = items_paise + shipping_paise)
);

CREATE INDEX IF NOT EXISTS idx_orders_phone   ON orders (customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at);

-- A snapshot of what was bought, at the price charged. Deliberately NOT a
-- foreign key to the catalogue: prices and names change, an order must not.
CREATE TABLE IF NOT EXISTS order_items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id      TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    TEXT NOT NULL,
  product_name  TEXT NOT NULL,
  weight        TEXT NOT NULL,
  qty           INTEGER NOT NULL,
  unit_paise    INTEGER NOT NULL,
  line_paise    INTEGER NOT NULL,
  mrp_paise     INTEGER,
  CHECK (qty > 0),
  CHECK (unit_paise > 0),
  CHECK (line_paise = unit_paise * qty)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);

-- Razorpay webhook idempotency. A webhook can arrive twice, out of order, or
-- while the browser callback is still in flight. The PRIMARY KEY on the event id
-- is what makes a replay a no-op instead of a second state change.
CREATE TABLE IF NOT EXISTS webhook_events (
  event_id     TEXT PRIMARY KEY,
  event_type   TEXT NOT NULL,
  order_id     TEXT,
  payload      TEXT,
  received_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Every status change, so "who marked this delivered and when" has an answer.
CREATE TABLE IF NOT EXISTS order_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status   TEXT NOT NULL,
  source      TEXT NOT NULL,   -- 'webhook' | 'verify' | 'admin' | 'system'
  detail      TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events (order_id);
