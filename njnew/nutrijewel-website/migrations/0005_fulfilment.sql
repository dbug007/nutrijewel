-- Pickup or delivery, per order (Cloudflare D1).
-- Apply with:
--   npx wrangler d1 execute nutrijewel-orders --remote --file migrations/0005_fulfilment.sql
-- Apply BEFORE deploying the code that writes it: create-order inserts this column.
--
-- Free pickup at Lodha Belmondo arrived on 2026-09-25. A pickup order has no
-- address, so address_line, city and pincode hold '' for it (they are NOT NULL
-- from 0001, and SQLite cannot relax that without rebuilding the table).
-- shipping_zone holds the delivery id from src/data/shippingZones.js, e.g.
-- 'pickup-lodha-belmondo', 'delivery-412101', 'pune-app-fare'.
--
-- Every existing order was a delivery, hence the default.

ALTER TABLE orders ADD COLUMN fulfilment TEXT NOT NULL DEFAULT 'delivery'
  CHECK (fulfilment IN ('delivery', 'pickup'));
