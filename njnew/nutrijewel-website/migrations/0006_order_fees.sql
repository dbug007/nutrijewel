-- Platform and convenience fees on every order (Cloudflare D1).
-- Apply with:
--   npx wrangler d1 execute nutrijewel-orders --remote --file migrations/0006_order_fees.sql
-- BACK UP FIRST (it rebuilds the orders table):
--   npx wrangler d1 export nutrijewel-orders --remote --output deepak-instructions/backups/<date>.sql
--
-- Why a rebuild and not ALTER TABLE ADD COLUMN: the table's CHECK constraint
-- says total_paise = items_paise + shipping_paise, and total_paise is what
-- Razorpay charges. With fees in the payment that CHECK would refuse every new
-- order, and SQLite cannot change a CHECK in place. So this is SQLite's standard
-- table rebuild: new table, copy every row, drop the old, rename the new.
--
-- Safe for the code already live: the fee columns default to 0, so an insert
-- that knows nothing about fees still satisfies the new CHECK.
--
-- DANGER HANDLED HERE: order_items and order_events reference orders(id) with
-- ON DELETE CASCADE. Dropping orders runs an implicit DELETE FROM orders first,
-- and that fires the cascade even with foreign key checks deferred: every
-- order's items and history would be silently deleted. So both child tables are
-- copied aside first and put back after the rebuild, ids and all. D1 runs this
-- file as one transaction, if any statement fails, nothing changes.

PRAGMA defer_foreign_keys = true;

CREATE TABLE keep_order_items AS SELECT * FROM order_items;
CREATE TABLE keep_order_events AS SELECT * FROM order_events;

CREATE TABLE orders_new (
  id                    TEXT PRIMARY KEY,
  order_number          TEXT NOT NULL UNIQUE,
  status                TEXT NOT NULL,
  items_paise           INTEGER NOT NULL,
  shipping_paise        INTEGER NOT NULL DEFAULT 0,
  platform_fee_paise    INTEGER NOT NULL DEFAULT 0,
  convenience_fee_paise INTEGER NOT NULL DEFAULT 0,
  total_paise           INTEGER NOT NULL,
  currency              TEXT NOT NULL DEFAULT 'INR',
  customer_name         TEXT NOT NULL,
  customer_phone        TEXT NOT NULL,
  customer_email        TEXT,
  address_line          TEXT NOT NULL,
  city                  TEXT NOT NULL,
  pincode               TEXT NOT NULL,
  shipping_zone         TEXT,
  notes                 TEXT,
  customer_id           TEXT,
  razorpay_order_id     TEXT UNIQUE,
  razorpay_payment_id   TEXT,
  paid_at               TEXT,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now')),
  fulfilment            TEXT NOT NULL DEFAULT 'delivery',
  CHECK (status IN ('created','paid','confirmed','packed','shipped','delivered','failed','cancelled','refunded')),
  CHECK (items_paise >= 0 AND shipping_paise >= 0 AND platform_fee_paise >= 0
         AND convenience_fee_paise >= 0 AND total_paise >= 0),
  -- still enforced by the database, not just the code: every rupee accounted for
  CHECK (total_paise = items_paise + shipping_paise + platform_fee_paise + convenience_fee_paise),
  CHECK (fulfilment IN ('delivery', 'pickup'))
);

INSERT INTO orders_new (
  id, order_number, status, items_paise, shipping_paise, total_paise, currency,
  customer_name, customer_phone, customer_email, address_line, city, pincode,
  shipping_zone, notes, customer_id, razorpay_order_id, razorpay_payment_id,
  paid_at, created_at, updated_at, fulfilment
)
SELECT
  id, order_number, status, items_paise, shipping_paise, total_paise, currency,
  customer_name, customer_phone, customer_email, address_line, city, pincode,
  shipping_zone, notes, customer_id, razorpay_order_id, razorpay_payment_id,
  paid_at, created_at, updated_at, fulfilment
FROM orders;

DROP TABLE orders;
ALTER TABLE orders_new RENAME TO orders;

CREATE INDEX IF NOT EXISTS idx_orders_phone   ON orders (customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at);

-- Put the children back exactly as they were (the cascade may have emptied
-- them). Clearing first makes this correct whether or not it did.
DELETE FROM order_items;
DELETE FROM order_events;
INSERT INTO order_items SELECT * FROM keep_order_items;
INSERT INTO order_events SELECT * FROM keep_order_events;
DROP TABLE keep_order_items;
DROP TABLE keep_order_events;
