var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// _shared/http.js
function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders }
  });
}
function fail(errors, status = 400) {
  const list = Array.isArray(errors) ? errors : [String(errors)];
  return json({ ok: false, errors: list }, status);
}
function methodNotAllowed(allowed) {
  return json({ ok: false, errors: ["Method not allowed."] }, 405, { Allow: allowed });
}
async function readJson(request, { maxBytes = 32 * 1024 } = {}) {
  const type = request.headers.get("content-type") || "";
  if (!type.includes("application/json")) {
    return { ok: false, response: fail("Expected a JSON body.", 415) };
  }
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared && declared > maxBytes) {
    return { ok: false, response: fail("Request too large.", 413) };
  }
  let text;
  try {
    text = await request.text();
  } catch (_) {
    return { ok: false, response: fail("Could not read the request.", 400) };
  }
  if (text.length > maxBytes) {
    return { ok: false, response: fail("Request too large.", 413) };
  }
  try {
    return { ok: true, body: JSON.parse(text) };
  } catch (_) {
    return { ok: false, response: fail("Malformed JSON.", 400) };
  }
}
function formatPaise(paise) {
  const n = Number.isFinite(paise) ? paise : 0;
  return `\u20B9${(n / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
var JSON_HEADERS;
var init_http = __esm({
  "_shared/http.js"() {
    init_functionsRoutes_0_17747373319536575();
    JSON_HEADERS = {
      "Content-Type": "application/json; charset=utf-8",
      // These endpoints are same-origin only. No CORS headers on purpose: the site
      // and the API share a domain, so nothing legitimate needs cross-origin access.
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    };
    __name(json, "json");
    __name(fail, "fail");
    __name(methodNotAllowed, "methodNotAllowed");
    __name(readJson, "readJson");
    __name(formatPaise, "formatPaise");
  }
});

// _shared/admin.js
function timingSafeEqual(a, b) {
  const x = String(a || "");
  const y = String(b || "");
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i += 1) {
    diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  }
  return diff === 0;
}
function requireAdmin({ request, env }) {
  const expected = env && env.ADMIN_TOKEN;
  if (!expected) {
    return json({ ok: false, errors: ["Admin is not configured."] }, 503);
  }
  const header = request.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const supplied = bearer || request.headers.get("x-admin-token") || "";
  if (!supplied || !timingSafeEqual(supplied, expected)) {
    return json({ ok: false, errors: ["Not authorised."] }, 401);
  }
  return null;
}
function accessIdentity(request) {
  return request.headers.get("cf-access-authenticated-user-email") || null;
}
function requireDb(env) {
  if (!env || !env.DB) {
    return json({ ok: false, errors: ["Database is not bound to this deployment."] }, 503);
  }
  return null;
}
var init_admin = __esm({
  "_shared/admin.js"() {
    init_functionsRoutes_0_17747373319536575();
    init_http();
    __name(timingSafeEqual, "timingSafeEqual");
    __name(requireAdmin, "requireAdmin");
    __name(accessIdentity, "accessIdentity");
    __name(requireDb, "requireDb");
  }
});

// api/admin/orders.js
async function onRequestGet(ctx) {
  const denied = requireAdmin(ctx) || requireDb(ctx.env);
  if (denied) return denied;
  const url = new URL(ctx.request.url);
  const status = url.searchParams.get("status");
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 1), 200);
  if (status && !STATUSES.includes(status)) return fail("Unknown status filter.", 400);
  const where = status ? "WHERE o.status = ?" : "";
  const binds = status ? [status, limit] : [limit];
  const { results } = await ctx.env.DB.prepare(
    `SELECT o.id, o.order_number, o.status, o.items_paise, o.shipping_paise, o.total_paise,
            o.customer_name, o.customer_phone, o.customer_email,
            o.address_line, o.city, o.pincode, o.shipping_zone,
            o.razorpay_payment_id, o.paid_at, o.created_at,
            (SELECT COUNT(*) FROM order_items i WHERE i.order_id = o.id) AS item_count
       FROM orders o ${where}
      ORDER BY o.created_at DESC
      LIMIT ?`
  ).bind(...binds).all();
  return json({
    ok: true,
    orders: (results || []).map((o) => ({
      ...o,
      nextStatuses: MANUAL_TRANSITIONS[o.status] || []
    }))
  });
}
async function onRequestPost(ctx) {
  const denied = requireAdmin(ctx) || requireDb(ctx.env);
  if (denied) return denied;
  const read = await readJson(ctx.request);
  if (!read.ok) return read.response;
  const { orderId, toStatus } = read.body || {};
  if (!orderId || typeof orderId !== "string") return fail("Missing order.", 400);
  if (!STATUSES.includes(toStatus)) return fail("Unknown status.", 400);
  const order = await ctx.env.DB.prepare("SELECT id, status FROM orders WHERE id = ?").bind(orderId).first();
  if (!order) return fail("Order not found.", 404);
  const allowed = MANUAL_TRANSITIONS[order.status] || [];
  if (!allowed.includes(toStatus)) {
    return fail(`Cannot move an order from ${order.status} to ${toStatus}.`, 409);
  }
  const who = accessIdentity(ctx.request) || "admin";
  await ctx.env.DB.batch([
    ctx.env.DB.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").bind(toStatus, orderId),
    ctx.env.DB.prepare("INSERT INTO order_events (order_id, from_status, to_status, source, detail) VALUES (?, ?, ?, ?, ?)").bind(orderId, order.status, toStatus, "admin", who)
  ]);
  return json({ ok: true, orderId, fromStatus: order.status, toStatus });
}
var STATUSES, MANUAL_TRANSITIONS;
var init_orders = __esm({
  "api/admin/orders.js"() {
    init_functionsRoutes_0_17747373319536575();
    init_http();
    init_admin();
    STATUSES = ["created", "paid", "confirmed", "packed", "shipped", "delivered", "failed", "cancelled", "refunded"];
    MANUAL_TRANSITIONS = {
      paid: ["confirmed", "cancelled"],
      confirmed: ["packed", "cancelled"],
      packed: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      created: ["cancelled"],
      failed: [],
      cancelled: [],
      refunded: []
    };
    __name(onRequestGet, "onRequestGet");
    __name(onRequestPost, "onRequestPost");
  }
});

// api/admin/stats.js
async function onRequestGet2(ctx) {
  const denied = requireAdmin(ctx) || requireDb(ctx.env);
  if (denied) return denied;
  const paidStates = "('paid','confirmed','packed','shipped','delivered')";
  const row = await ctx.env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM orders WHERE status IN ${paidStates})                                  AS paid_orders,
       (SELECT COALESCE(SUM(total_paise),0) FROM orders WHERE status IN ${paidStates})              AS revenue_paise,
       (SELECT COUNT(*) FROM orders WHERE status IN ('paid','confirmed'))                           AS needs_action,
       (SELECT COUNT(*) FROM orders WHERE status = 'packed')                                        AS to_ship,
       (SELECT COUNT(*) FROM orders WHERE status IN ${paidStates}
          AND date(created_at) = date('now'))                                                       AS today_orders,
       (SELECT COALESCE(SUM(total_paise),0) FROM orders WHERE status IN ${paidStates}
          AND date(created_at) = date('now'))                                                       AS today_paise`
  ).first();
  return json({ ok: true, stats: row || {} });
}
var init_stats = __esm({
  "api/admin/stats.js"() {
    init_functionsRoutes_0_17747373319536575();
    init_http();
    init_admin();
    __name(onRequestGet2, "onRequestGet");
  }
});

// _shared/razorpay.js
async function hmacSha256Hex(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function timingSafeEqualHex(a, b) {
  const x = String(a || "").toLowerCase();
  const y = String(b || "").toLowerCase();
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i += 1) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}
function authHeader(env) {
  return `Basic ${btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}`;
}
function razorpayConfigured(env) {
  return !!(env && env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
}
async function createRazorpayOrder(env, { amountPaise, receipt, notes }) {
  if (!Number.isInteger(amountPaise) || amountPaise < 100) {
    throw new Error("Amount must be a whole number of paise, at least 100.");
  }
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { Authorization: authHeader(env), "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt: String(receipt).slice(0, 40),
      // Razorpay caps receipt length
      notes: notes || {}
    })
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error && body.error.description || "Razorpay rejected the order.");
    err.status = res.status === 401 ? 401 : 502;
    err.razorpayCode = body.error && body.error.code;
    throw err;
  }
  return body;
}
async function verifyPaymentSignature(env, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return false;
  const expected = await hmacSha256Hex(env.RAZORPAY_KEY_SECRET, `${razorpay_order_id}|${razorpay_payment_id}`);
  return timingSafeEqualHex(expected, razorpay_signature);
}
async function verifyWebhookSignature(env, rawBody, signature) {
  if (!env.RAZORPAY_WEBHOOK_SECRET || !signature) return false;
  const expected = await hmacSha256Hex(env.RAZORPAY_WEBHOOK_SECRET, rawBody);
  return timingSafeEqualHex(expected, signature);
}
var API, enc;
var init_razorpay = __esm({
  "_shared/razorpay.js"() {
    init_functionsRoutes_0_17747373319536575();
    API = "https://api.razorpay.com/v1";
    enc = new TextEncoder();
    __name(hmacSha256Hex, "hmacSha256Hex");
    __name(timingSafeEqualHex, "timingSafeEqualHex");
    __name(authHeader, "authHeader");
    __name(razorpayConfigured, "razorpayConfigured");
    __name(createRazorpayOrder, "createRazorpayOrder");
    __name(verifyPaymentSignature, "verifyPaymentSignature");
    __name(verifyWebhookSignature, "verifyWebhookSignature");
  }
});

// ../src/data/products.data.js
var require_products_data = __commonJS({
  "../src/data/products.data.js"(exports, module) {
    init_functionsRoutes_0_17747373319536575();
    module.exports = [
      {
        id: "amrit-bites",
        name: "NJ Amrit Bites (Wheat Dink/Gond Ladoo)",
        displayName: "NJ Amrit Bites",
        category: "Ladoos",
        image: "/images/amritbites.jpg",
        images: ["/images/amritbites.jpg"],
        description: "Traditional Dink/Gond ladoos, refined sugar free, ideal for postpartum recovery and bone health support.",
        price: 1799,
        originalPrice: 2199,
        weight: "1kg",
        variants: [
          { weight: "1kg", price: 1799, originalPrice: 2199 },
          { weight: "500g", price: 899, originalPrice: 1099 }
        ],
        features: ["Refined Sugar Free", "Bone Health Support", "Postpartum Recovery", "Traditional Recipe"],
        isTopSeller: false,
        isBestSeller: true,
        isChefsSpecial: true
      },
      {
        id: "granola",
        name: "NJ Signature Granola",
        displayName: "NJ Signature Granola",
        category: "Healthy Snacks",
        image: "/images/granola.jpg",
        images: ["/images/granola.jpg"],
        description: "Gourmet blend with cinnamon, dark chocolate, and mocha hints. High in fiber, great for breakfast or snacking.",
        price: 999,
        originalPrice: 1219,
        weight: "500g",
        variants: [
          { weight: "250g", price: 550, originalPrice: 669 },
          { weight: "500g", price: 999, originalPrice: 1219 },
          { weight: "1kg", price: 1998, originalPrice: 2439 }
        ],
        features: ["High Fiber", "Cinnamon & Dark Chocolate", "Breakfast Perfect", "Gourmet Blend"],
        isTopSeller: true,
        isBestSeller: true,
        isChefsSpecial: true
      },
      {
        id: "granola-cookies",
        name: "NJ Signature Granola Cookies",
        displayName: "NJ Granola Cookies",
        category: "Healthy Snacks",
        image: "/images/granolacookies.jpg",
        images: ["/images/granolacookies.jpg"],
        description: "Wholesome cookies made from granola, free from refined sugar, preservatives, and artificial additives.",
        price: 499,
        originalPrice: 609,
        weight: "5 big cookies",
        features: ["No Preservatives", "Refined Sugar Free", "Wholesome Granola", "Artificial Free"],
        isTopSeller: false,
        isBestSeller: false,
        isChefsSpecial: false
      },
      {
        id: "bliss-bites",
        name: "NJ Special Bliss Bites (Dates & Nuts Ladoo)",
        displayName: "NJ Special Bliss Bites",
        category: "Ladoos",
        image: "/images/blissbites.jpg",
        images: ["/images/blissbites.jpg"],
        description: "Rich in fiber and protein, this refined sugar free laddoo is perfect for pre/post workout nourishment.",
        price: 1799,
        originalPrice: 2199,
        weight: "1kg",
        variants: [
          { weight: "1kg", price: 1799, originalPrice: 2199 },
          { weight: "500g", price: 899, originalPrice: 1099 }
        ],
        features: ["High Protein", "Pre/Post Workout", "Dates & Nuts", "Energy Boost"],
        isTopSeller: true,
        isBestSeller: true,
        isChefsSpecial: true
      },
      {
        id: "millet-crunch",
        name: "Foxnut & Millet Crunch (Roasted)",
        displayName: "Foxnut & Millet Crunch",
        category: "Healthy Snacks",
        image: "/images/foxnutmilletcrunch.jpg",
        images: ["/images/foxnutmilletcrunch.jpg"],
        description: "Roasted foxnuts and millet blend for a crunchy, guilt-free snack full of minerals and light on calories.",
        price: 299,
        originalPrice: 369,
        weight: "250g",
        features: ["Low Calorie", "Mineral Rich", "Crunchy Texture", "Guilt-Free"],
        isTopSeller: false,
        isBestSeller: false,
        isChefsSpecial: false
      },
      {
        id: "ragi-sattva",
        name: "NJ Ragi Sattva (Nachani Dink/Gond Ladoo)",
        displayName: "NJ Ragi Sattva",
        category: "Ladoos",
        image: "/images/ragisattva.jpg",
        images: ["/images/ragisattva.jpg"],
        description: "Gluten free and refined sugar free Ragi ladoos that promote immunity, bone strength, and energy.",
        price: 1799,
        originalPrice: 2199,
        weight: "1kg",
        variants: [
          { weight: "1kg", price: 1799, originalPrice: 2199 },
          { weight: "500g", price: 899, originalPrice: 1099 }
        ],
        features: ["Gluten Free", "Refined Sugar Free", "Immunity Boost", "Bone Strength"],
        isTopSeller: true,
        isBestSeller: true,
        isChefsSpecial: false
      },
      {
        id: "golden-bites",
        name: "NJ Golden Bites (Sattu Ghee Ladoo)",
        displayName: "NJ Golden Bites",
        category: "Ladoos",
        image: "/images/ragisattva.jpg",
        imagePlaceholder: true,
        description: "Sattu and ghee ladoos, refined sugar free. Slow energy and everyday strength.",
        price: 1199,
        originalPrice: 1459,
        weight: "1kg",
        variants: [
          { weight: "1kg", price: 1199, originalPrice: 1459 },
          { weight: "500g", price: 599, originalPrice: 729 }
        ],
        features: ["Refined Sugar Free", "Sattu & Ghee", "Slow Energy", "Traditional Recipe"],
        isTopSeller: false,
        isBestSeller: false,
        isChefsSpecial: false
      },
      {
        id: "nutri-bars",
        name: "NJ Signature Nutri Bars / Bites",
        displayName: "NJ Nutri Bars / Bites",
        category: "Energy Bars",
        image: "/images/nutribars.jpg",
        images: ["/images/nutribars.jpg"],
        description: "Dark chocolate-flavored bars packed with nutrients. Ideal for healthy snacking and sustained energy.",
        price: 599,
        originalPrice: 729,
        weight: "250g",
        variants: [
          { weight: "250g", price: 599, originalPrice: 729 },
          { weight: "500g", price: 1099, originalPrice: 1339 }
        ],
        features: ["Dark Chocolate", "Nutrient Packed", "Sustained Energy", "Healthy Snack"],
        isTopSeller: true,
        isBestSeller: true,
        isChefsSpecial: true
      },
      /*
      {
        id: 'omega-crunch',
        name: 'Jewel\'s Omega Crunch (Roasted Trail Mix)',
        displayName: 'Jewel\'s Omega Crunch',
        category: 'Healthy Snacks',
        image: '/images/omegacrunch.jpg',
        images: ['/images/omegacrunch.jpg'],
        description: 'A heart-healthy roasted trail mix, rich in omega-3 and clean plant-based ingredients.',
        price: 599,
        originalPrice: 699,
        weight: '200g',
        features: ['Heart Healthy', 'Omega-3 Rich', 'Plant Based', 'Premium Trail Mix'],
        isTopSeller: false,
        isBestSeller: false,
        isChefsSpecial: false
      },
      {
        id: 'gun-powder',
        name: 'Jewel\'s Gun Powder (Podi Masala)',
        displayName: 'Jewel\'s Gun Powder',
        category: 'Dips & Spreads',
        image: '/images/gunpowder.jpg',
        images: ['/images/gunpowder.jpg'],
        description: 'South Indian-style spice blend (podi) perfect as a dry chutney or seasoning, handcrafted in small batches.',
        price: 99,
        originalPrice: 150,
        weight: '80g',
        features: ['South Indian Style', 'Handcrafted', 'Small Batches', 'Versatile Seasoning'],
        isTopSeller: false,
        isBestSeller: false,
        isChefsSpecial: false
      },
      */
      {
        id: "peanut-butter",
        name: "NJ Special 100% Peanut Butter",
        displayName: "100% Peanut Butter",
        category: "Dips & Spreads",
        image: "/images/peanutbutter.jpg",
        images: ["/images/peanutbutter.jpg"],
        description: "Pure, refined sugar free peanut butter made with 100% peanuts. No additives, rich in protein and healthy fats.",
        price: 299,
        originalPrice: 369,
        weight: "200g",
        features: ["100% Peanuts", "No Additives", "High Protein", "Healthy Fats"],
        isTopSeller: false,
        isBestSeller: false,
        isChefsSpecial: false
      },
      {
        id: "liquid-gold",
        name: "NJ Liquid Gold (Healthy Nutella)",
        displayName: "NJ Liquid Gold",
        category: "Dips & Spreads",
        image: "/images/peanutbutter.jpg",
        imagePlaceholder: true,
        description: "Our take on chocolate hazelnut spread, refined sugar free and made in small batches.",
        price: 699,
        originalPrice: 849,
        weight: "1 jar",
        features: ["Refined Sugar Free", "Small Batch", "No Palm Oil", "Chocolate Hazelnut"],
        isTopSeller: false,
        isBestSeller: false,
        isChefsSpecial: false
      },
      {
        id: "nj-almond-butter",
        name: "NJ Special 100% Almond Butter",
        displayName: "100% Almond Butter",
        category: "Dips & Spreads",
        image: "/images/peanutbutter.jpg",
        imagePlaceholder: true,
        description: "Pure, refined sugar free almond butter made with 100% almonds. No additives, rich in vitamin E, protein and healthy fats.",
        price: 449,
        originalPrice: 549,
        weight: "200g",
        features: ["100% Almonds", "No Additives", "Vitamin E", "Healthy Fats"],
        isTopSeller: false,
        isBestSeller: false,
        isChefsSpecial: false
      },
      {
        id: "focaccia-bread",
        name: "Focaccia Bread (Made in EVOO)",
        displayName: "Focaccia Bread",
        category: "Seasonal",
        image: "/images/Focaccia-bread.jpg",
        images: ["/images/Focaccia-bread.jpg"],
        description: "Soft focaccia made in extra virgin olive oil, topped with green chilli, red onion and herbs. Baked to order, so the price depends on size and toppings.",
        price: 0,
        originalPrice: 0,
        weight: "Made to order",
        features: ["Extra Virgin Olive Oil", "Baked to Order", "No Preservatives", "Small Batch"],
        outOfSeason: true,
        isTopSeller: false,
        isBestSeller: false,
        isChefsSpecial: false
      },
      {
        id: "hummus",
        name: "NJ Special Low Fat Hummus",
        displayName: "Low Fat Hummus",
        category: "Seasonal",
        image: "/images/hummus.jpg",
        images: ["/images/hummus.jpg", "/images/hummuspitabread.jpg"],
        description: "High-protein, fiber-rich hummus with no added oil and homemade tahini. Smooth, savoury and gut-friendly.",
        price: 250,
        originalPrice: 309,
        weight: "1 pack",
        features: ["Low Fat", "High Protein", "No Added Oil", "Homemade Tahini"],
        // A fresh dip, so it sells in the cool months. Back for winter: set false.
        outOfSeason: true,
        isTopSeller: false,
        isBestSeller: false,
        isChefsSpecial: false
      },
      {
        id: "maharaja-cake",
        name: "Thandai Maharaja Cake",
        displayName: "Thandai Maharaja Cake",
        category: "Seasonal",
        image: "/images/thandaicake.jpg",
        images: ["/images/thandaicake.jpg"],
        description: "A celebratory cake infused with thandai spice blend, free from refined flour and sugars.",
        price: 499,
        originalPrice: 650,
        weight: "500g",
        variants: [
          { weight: "500g", price: 499, originalPrice: 650 },
          { weight: "1kg", price: 999, originalPrice: 1300 }
        ],
        features: ["Thandai Spice", "No Refined Flour", "Refined Sugar Free", "Celebratory"],
        outOfSeason: true,
        isTopSeller: false,
        isBestSeller: false,
        isChefsSpecial: false
      },
      {
        id: "cambridge-cake",
        name: "Cambridge of Chocolate (Walnut Dark Chocolate Cake)",
        displayName: "Cambridge of Chocolate",
        category: "Cakes",
        image: "/images/fresh cambridge of chocolate cake.jpg",
        images: ["/images/fresh cambridge of chocolate cake.jpg", "/images/packed cambridge of love cake.jpg"],
        description: "Luxurious dark chocolate cake with walnut crunch. Clean, eggless, preservative-free indulgence.",
        price: 1799,
        originalPrice: 2199,
        weight: "1kg",
        variants: [
          { weight: "1kg", price: 1799, originalPrice: 2199 },
          { weight: "750g", price: 1299, originalPrice: 1589 },
          { weight: "500g", price: 899, originalPrice: 1099 }
        ],
        features: ["Dark Chocolate", "Walnut Crunch", "Eggless", "Preservative Free"],
        isTopSeller: true,
        isBestSeller: true,
        isChefsSpecial: true
      },
      {
        id: "plum-cake",
        name: "Golden Plum Kiss (Plum Cake)",
        displayName: "Golden Plum Kiss",
        category: "Seasonal",
        image: "/images/plumcake.jpg",
        images: ["/images/plumcake.jpg"],
        description: "Rich plum cake with warm spices and dried fruits. Clean, eggless, and preservative-free, perfect for festive occasions.",
        price: 850,
        originalPrice: 966,
        weight: "500g",
        variants: [
          { weight: "500g", price: 850, originalPrice: 966 }
        ],
        features: ["Eggless", "Preservative Free", "Festive Special", "Dried Fruits & Spices"],
        outOfSeason: true,
        isTopSeller: false,
        isBestSeller: false,
        isChefsSpecial: false
      },
      /*
      {
        id: 'khajoor-khazana',
        name: 'Khajoor Ka Khazana (Stuffed Dates)',
        displayName: 'Khajoor Ka Khazana',
        category: 'Ladoos',
        image: '/images/stuffeddates.jpg',
        images: ['/images/stuffeddates.jpg'],
        description: 'Decadent dates stuffed with clean ingredients. No sugar or additives, only nature\'s goodness.',
        price: 999,
        originalPrice: 1200,
        weight: '12 pieces',
        features: ['Stuffed Dates', 'No Sugar', 'No Additives', 'Natural Goodness'],
        isTopSeller: false,
        isBestSeller: true,
        isChefsSpecial: true
      }
      /*
      {
        id: 'oxford-cake',
        name: 'Oxford of Love (Strawberry Dark Chocolate Cake)',
        displayName: 'Oxford of Love',
        category: 'Cakes',
        image: '/images/oxford of love cake.jpg',
        images: ['/images/oxford of love cake.jpg', '/images/piece oxford of love.jpeg'],
        description: 'Elegant strawberry and dark chocolate cake, made clean without any preservatives or artificial flavors.',
        price: 999,
        originalPrice: 1200,
        weight: '1kg',
        features: ['Strawberry & Chocolate', 'No Preservatives', 'Artificial Free', 'Elegant Design'],
        isTopSeller: false,
        isBestSeller: true,
        isChefsSpecial: true
      }
      */
      /* ---- New, Sept 2026. Every photo below is a stand-in from another product
         (imagePlaceholder: true). Swap them and drop the flag once shots arrive. ---- */
      {
        id: "millet-midnight-muffin",
        name: "Millet Midnight Muffin (Ragi Dark Chocolate Muffin)",
        displayName: "Millet Midnight Muffin",
        category: "Muffins",
        image: "/images/Millet-midnight-muffin.jpg",
        images: ["/images/Millet-midnight-muffin.jpg"],
        description: "Ragi and dark chocolate muffins, refined sugar free. Deep, not sweet.",
        price: 599,
        originalPrice: 729,
        weight: "Box of 6",
        features: ["Ragi Base", "Dark Chocolate", "Refined Sugar Free", "Box of 6"],
        isTopSeller: false,
        isBestSeller: false,
        isChefsSpecial: false
      },
      {
        id: "walnana-muffin",
        name: "Chocolate Wal-Nana Muffin (Chocolate Walnut Banana Muffin)",
        displayName: "Chocolate Wal-Nana Muffin",
        category: "Muffins",
        image: "/images/Chocolate-wal-nana-muffin.jpg",
        images: ["/images/Chocolate-wal-nana-muffin.jpg"],
        description: "Chocolate, walnut and banana muffins. Naturally sweetened with ripe banana.",
        price: 599,
        originalPrice: 729,
        weight: "Box of 6",
        features: ["Walnut & Banana", "Dark Chocolate", "Refined Sugar Free", "Box of 6"],
        isTopSeller: false,
        isBestSeller: false,
        isChefsSpecial: false
      },
      {
        id: "panchamrit-muffin",
        name: "Panchamrit Muffin (Panchamrit Rawa Muffin)",
        displayName: "Panchamrit Muffin",
        category: "Muffins",
        image: "/images/Panchamrit-muffin.jpg",
        images: ["/images/Panchamrit-muffin.jpg"],
        description: "Rawa muffins built on the five panchamrit ingredients. Gentle, traditional, not too sweet.",
        price: 499,
        originalPrice: 609,
        weight: "Box of 6",
        features: ["Panchamrit Five", "Rawa Base", "Refined Sugar Free", "Box of 6"],
        isTopSeller: false,
        isBestSeller: false,
        isChefsSpecial: false
      },
      {
        id: "panchamrit-cake",
        name: "Panchamrit Cake (Rawa Cake)",
        displayName: "Panchamrit Cake",
        category: "Cakes",
        image: "/images/Punchamrit-cake.jpg",
        images: ["/images/Punchamrit-cake.jpg"],
        description: "A rawa celebration cake on the five panchamrit ingredients. Eggless and refined sugar free.",
        price: 999,
        originalPrice: 1219,
        weight: "1kg",
        variants: [
          { weight: "1kg", price: 999, originalPrice: 1219 },
          { weight: "500g", price: 499, originalPrice: 609 }
        ],
        features: ["Panchamrit Five", "Rawa Base", "Eggless", "Refined Sugar Free"],
        isTopSeller: false,
        isBestSeller: false,
        isChefsSpecial: false
      },
      {
        id: "rustic-ragi-bread",
        name: "Rustic Ragi Super Seeds Bread",
        displayName: "Rustic Ragi Super Seeds Bread",
        category: "Breads",
        image: "/images/rustic-ragi-bread.jpg",
        images: ["/images/rustic-ragi-bread.jpg"],
        description: "Gluten free ragi loaf packed with super seeds, made in extra virgin olive oil.",
        price: 299,
        originalPrice: 369,
        weight: "Single loaf",
        variants: [
          { weight: "Single loaf", price: 299, originalPrice: 369 },
          { weight: "Double loaf", price: 599, originalPrice: 729 }
        ],
        features: ["Gluten Free", "Super Seeds", "Extra Virgin Olive Oil", "Ragi Base"],
        isTopSeller: false,
        isBestSeller: false,
        isChefsSpecial: false
      }
    ];
  }
});

// ../src/data/shippingZones.js
var require_shippingZones = __commonJS({
  "../src/data/shippingZones.js"(exports, module) {
    init_functionsRoutes_0_17747373319536575();
    var ZONES = [
      {
        id: "pune-local",
        name: "Pune local",
        prefixes: ["4110", "4112", "4113"],
        ratePaise: 4e3,
        // ₹40
        freeAbovePaise: 8e4,
        // free over ₹800
        minDays: 1,
        maxDays: 2
      },
      {
        id: "maharashtra",
        name: "Maharashtra",
        prefixes: ["4"],
        ratePaise: 8e3,
        // ₹80
        freeAbovePaise: 15e4,
        // free over ₹1500
        minDays: 2,
        maxDays: 4
      },
      {
        id: "rest-of-india",
        name: "Rest of India",
        prefixes: [""],
        // the catch-all
        ratePaise: 15e3,
        // ₹150
        freeAbovePaise: 25e4,
        // free over ₹2500
        minDays: 4,
        maxDays: 8
      }
    ];
    var NON_SERVICEABLE_PREFIXES = [];
    var isValidPincode2 = /* @__PURE__ */ __name((pincode) => /^[1-9][0-9]{5}$/.test(String(pincode || "").trim()), "isValidPincode");
    function findZone2(pincode) {
      const pin = String(pincode || "").trim();
      if (!isValidPincode2(pin)) return null;
      if (NON_SERVICEABLE_PREFIXES.some((p) => pin.startsWith(p))) {
        return { id: "non-serviceable", name: "Not serviceable", serviceable: false };
      }
      let best = null;
      let bestLen = -1;
      ZONES.forEach((zone) => {
        zone.prefixes.forEach((prefix) => {
          if (pin.startsWith(prefix) && prefix.length > bestLen) {
            best = zone;
            bestLen = prefix.length;
          }
        });
      });
      return best ? { ...best, serviceable: true } : null;
    }
    __name(findZone2, "findZone");
    function shippingPaiseFor(zone, itemsTotalPaise) {
      if (!zone || !zone.serviceable) return 0;
      const items = Number.isFinite(itemsTotalPaise) ? itemsTotalPaise : 0;
      if (zone.freeAbovePaise != null && items >= zone.freeAbovePaise) return 0;
      return zone.ratePaise;
    }
    __name(shippingPaiseFor, "shippingPaiseFor");
    module.exports = {
      ZONES,
      NON_SERVICEABLE_PREFIXES,
      isValidPincode: isValidPincode2,
      findZone: findZone2,
      shippingPaiseFor
    };
  }
});

// ../src/utils/serverPricing.js
var require_serverPricing = __commonJS({
  "../src/utils/serverPricing.js"(exports, module) {
    init_functionsRoutes_0_17747373319536575();
    var products = require_products_data();
    var { findZone: findZone2, shippingPaiseFor, isValidPincode: isValidPincode2 } = require_shippingZones();
    var MAX_LINES = 40;
    var MAX_QTY_PER_LINE = 99;
    var MAX_ORDER_PAISE = 5e7;
    function isBuyable(product) {
      return !!product && !product.comingSoon && !product.outOfSeason && !product.priceOnRequest;
    }
    __name(isBuyable, "isBuyable");
    var toPaise = /* @__PURE__ */ __name((rupees) => Math.round(Number(rupees) * 100), "toPaise");
    var findProduct = /* @__PURE__ */ __name((id) => products.find((p) => p.id === id) || null, "findProduct");
    function resolveVariant(product, weight) {
      const variants = Array.isArray(product.variants) ? product.variants : [];
      if (!variants.length) {
        const wanted2 = String(weight || "").trim();
        if (wanted2 && product.weight && wanted2 !== product.weight) return null;
        return { weight: product.weight || "one size", price: product.price, originalPrice: product.originalPrice };
      }
      const wanted = String(weight || "").trim();
      if (!wanted) return null;
      return variants.find((v) => v.weight === wanted) || null;
    }
    __name(resolveVariant, "resolveVariant");
    function repriceCart3(rawLines, { pincode } = {}) {
      const errors = [];
      const lines = [];
      if (!Array.isArray(rawLines) || rawLines.length === 0) {
        return { ok: false, errors: ["Your cart is empty."], lines: [], itemsPaise: 0, shippingPaise: 0, totalPaise: 0, zone: null };
      }
      if (rawLines.length > MAX_LINES) {
        return { ok: false, errors: [`A single order cannot have more than ${MAX_LINES} different items.`], lines: [], itemsPaise: 0, shippingPaise: 0, totalPaise: 0, zone: null };
      }
      let itemsPaise = 0;
      rawLines.forEach((raw, i) => {
        const at = `Item ${i + 1}`;
        const productId = raw && typeof raw.productId === "string" ? raw.productId : null;
        if (!productId) {
          errors.push(`${at}: missing product.`);
          return;
        }
        const product = findProduct(productId);
        if (!product) {
          errors.push(`${at}: we no longer sell that product.`);
          return;
        }
        if (!isBuyable(product)) {
          errors.push(`${product.displayName || product.name} is not available to order right now.`);
          return;
        }
        const variant = resolveVariant(product, raw && raw.weight);
        if (!variant) {
          errors.push(`${product.displayName || product.name}: that size is no longer available.`);
          return;
        }
        const unitPaise = toPaise(variant.price);
        if (!Number.isFinite(unitPaise) || unitPaise <= 0) {
          errors.push(`${product.displayName || product.name}: price unavailable, please contact us.`);
          return;
        }
        const qty = Number(raw && raw.qty);
        if (!Number.isInteger(qty) || qty < 1) {
          errors.push(`${at}: invalid quantity.`);
          return;
        }
        if (qty > MAX_QTY_PER_LINE) {
          errors.push(`${product.displayName || product.name}: maximum ${MAX_QTY_PER_LINE} per order.`);
          return;
        }
        const linePaise = unitPaise * qty;
        itemsPaise += linePaise;
        lines.push({
          productId: product.id,
          name: product.displayName || product.name,
          weight: variant.weight,
          qty,
          unitPaise,
          linePaise,
          // carried for the order record, never used in arithmetic
          mrpPaise: variant.originalPrice != null ? toPaise(variant.originalPrice) : null
        });
      });
      if (errors.length) {
        return { ok: false, errors, lines, itemsPaise: 0, shippingPaise: 0, totalPaise: 0, zone: null };
      }
      let zone = null;
      let shippingPaise = 0;
      if (pincode != null && String(pincode).trim() !== "") {
        if (!isValidPincode2(pincode)) {
          return { ok: false, errors: ["Enter a valid 6 digit pincode."], lines, itemsPaise, shippingPaise: 0, totalPaise: 0, zone: null };
        }
        zone = findZone2(pincode);
        if (!zone || !zone.serviceable) {
          return { ok: false, errors: ["We do not deliver to that pincode yet. Message us on WhatsApp and we will see what we can do."], lines, itemsPaise, shippingPaise: 0, totalPaise: 0, zone };
        }
        shippingPaise = shippingPaiseFor(zone, itemsPaise);
      }
      const totalPaise = itemsPaise + shippingPaise;
      if (totalPaise > MAX_ORDER_PAISE) {
        return { ok: false, errors: ["That order is too large to place online. Please contact us directly."], lines, itemsPaise, shippingPaise, totalPaise: 0, zone };
      }
      return { ok: true, errors: [], lines, itemsPaise, shippingPaise, totalPaise, zone };
    }
    __name(repriceCart3, "repriceCart");
    module.exports = {
      MAX_LINES,
      MAX_QTY_PER_LINE,
      MAX_ORDER_PAISE,
      toPaise,
      isBuyable,
      resolveVariant,
      repriceCart: repriceCart3
    };
  }
});

// api/checkout/create-order.js
function orderNumber() {
  const now = /* @__PURE__ */ new Date();
  const yy = String(now.getUTCFullYear()).slice(2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const tail = [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join("");
  return `NJ-${yy}${mm}-${tail}`;
}
function validateCustomer(c) {
  const errors = [];
  const out = {
    name: clean(c && c.name, 80),
    phone: clean(c && c.phone, 20).replace(/[\s-]/g, ""),
    email: clean(c && c.email, 120),
    address: clean(c && c.address, 300),
    city: clean(c && c.city, 80),
    pincode: clean(c && c.pincode, 10),
    notes: clean(c && c.notes, 300)
  };
  if (out.name.length < 2) errors.push("Enter your name.");
  const phone = out.phone.replace(/^(\+?91)/, "");
  if (!/^[6-9][0-9]{9}$/.test(phone)) errors.push("Enter a valid 10 digit mobile number.");
  else out.phone = phone;
  if (out.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(out.email)) errors.push("That email address does not look right.");
  if (out.address.length < 8) errors.push("Enter your full delivery address.");
  if (out.city.length < 2) errors.push("Enter your city.");
  return { errors, customer: out };
}
async function onRequestPost2({ request, env }) {
  if (!razorpayConfigured(env)) return fail("Payments are not configured yet.", 503);
  if (!env.DB) return fail("Order storage is unavailable.", 503);
  const read = await readJson(request);
  if (!read.ok) return read.response;
  const { lines, customer } = read.body || {};
  const who = validateCustomer(customer);
  if (who.errors.length) return json({ ok: false, errors: who.errors });
  const priced = repriceCart(lines, { pincode: who.customer.pincode });
  if (!priced.ok) return json({ ok: false, errors: priced.errors });
  if (priced.totalPaise < 100) return json({ ok: false, errors: ["That order is below the minimum we can charge."] });
  const id = crypto.randomUUID();
  const number = orderNumber();
  let rzp;
  try {
    rzp = await createRazorpayOrder(env, {
      amountPaise: priced.totalPaise,
      receipt: number,
      notes: { order_number: number, pincode: who.customer.pincode }
    });
  } catch (e) {
    return fail(e.status === 401 ? "Payments are misconfigured." : "Could not start the payment. Please try again.", e.status || 502);
  }
  const o = who.customer;
  const statements = [
    env.DB.prepare(
      `INSERT INTO orders (id, order_number, status, items_paise, shipping_paise, total_paise,
         customer_name, customer_phone, customer_email, address_line, city, pincode, shipping_zone,
         notes, razorpay_order_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      id,
      number,
      "created",
      priced.itemsPaise,
      priced.shippingPaise,
      priced.totalPaise,
      o.name,
      o.phone,
      o.email || null,
      o.address,
      o.city,
      o.pincode,
      priced.zone ? priced.zone.id : null,
      o.notes || null,
      rzp.id
    ),
    env.DB.prepare(
      "INSERT INTO order_events (order_id, from_status, to_status, source, detail) VALUES (?, NULL, 'created', 'system', ?)"
    ).bind(id, rzp.id)
  ];
  priced.lines.forEach((l) => {
    statements.push(env.DB.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, weight, qty, unit_paise, line_paise, mrp_paise)
       VALUES (?,?,?,?,?,?,?,?)`
    ).bind(id, l.productId, l.name, l.weight, l.qty, l.unitPaise, l.linePaise, l.mrpPaise));
  });
  await env.DB.batch(statements);
  return json({
    ok: true,
    orderNumber: number,
    razorpayOrderId: rzp.id,
    amountPaise: priced.totalPaise,
    currency: "INR",
    // Public by design. Served from here rather than baked into the bundle, so
    // swapping test keys for live ones needs no rebuild.
    keyId: env.RAZORPAY_KEY_ID,
    prefill: { name: o.name, contact: o.phone, email: o.email || "" }
  });
}
var import_serverPricing, repriceCart, ALPHABET, clean, onRequest;
var init_create_order = __esm({
  "api/checkout/create-order.js"() {
    init_functionsRoutes_0_17747373319536575();
    init_http();
    init_razorpay();
    import_serverPricing = __toESM(require_serverPricing());
    ({ repriceCart } = import_serverPricing.default);
    ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    __name(orderNumber, "orderNumber");
    clean = /* @__PURE__ */ __name((v, max) => String(v == null ? "" : v).trim().slice(0, max), "clean");
    __name(validateCustomer, "validateCustomer");
    __name(onRequestPost2, "onRequestPost");
    onRequest = /* @__PURE__ */ __name(() => methodNotAllowed("POST"), "onRequest");
  }
});

// api/checkout/quote.js
async function onRequestPost3({ request, env }) {
  const read = await readJson(request);
  if (!read.ok) return read.response;
  const { lines, pincode } = read.body || {};
  const result = repriceCart2(lines, { pincode });
  if (!result.ok) {
    return json({ ok: false, errors: result.errors });
  }
  return json({
    ok: true,
    /* So the page can say plainly that no real money will move. A test key is
       exactly the situation where a confirmation screen is most misleading. */
    testMode: !!(env && env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_ID.startsWith("rzp_test_")),
    lines: result.lines.map((l) => ({
      productId: l.productId,
      name: l.name,
      weight: l.weight,
      qty: l.qty,
      unitPaise: l.unitPaise,
      linePaise: l.linePaise,
      unitDisplay: formatPaise(l.unitPaise),
      lineDisplay: formatPaise(l.linePaise)
    })),
    itemsPaise: result.itemsPaise,
    shippingPaise: result.shippingPaise,
    totalPaise: result.totalPaise,
    itemsDisplay: formatPaise(result.itemsPaise),
    shippingDisplay: result.shippingPaise === 0 ? "Free" : formatPaise(result.shippingPaise),
    totalDisplay: formatPaise(result.totalPaise),
    zone: result.zone ? { id: result.zone.id, name: result.zone.name, minDays: result.zone.minDays, maxDays: result.zone.maxDays } : null
  });
}
var import_serverPricing2, repriceCart2, onRequest2;
var init_quote = __esm({
  "api/checkout/quote.js"() {
    init_functionsRoutes_0_17747373319536575();
    init_http();
    import_serverPricing2 = __toESM(require_serverPricing());
    ({ repriceCart: repriceCart2 } = import_serverPricing2.default);
    __name(onRequestPost3, "onRequestPost");
    onRequest2 = /* @__PURE__ */ __name(() => methodNotAllowed("POST"), "onRequest");
  }
});

// api/checkout/verify.js
async function onRequestPost4({ request, env }) {
  if (!razorpayConfigured(env)) return fail("Payments are not configured.", 503);
  if (!env.DB) return fail("Order storage is unavailable.", 503);
  const read = await readJson(request);
  if (!read.ok) return read.response;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = read.body || {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return fail("Missing payment details.", 400);
  }
  const valid = await verifyPaymentSignature(env, { razorpay_order_id, razorpay_payment_id, razorpay_signature });
  if (!valid) {
    await env.DB.prepare(
      `INSERT INTO order_events (order_id, from_status, to_status, source, detail)
       SELECT id, status, status, 'verify', 'signature mismatch' FROM orders WHERE razorpay_order_id = ?`
    ).bind(razorpay_order_id).run().catch(() => {
    });
    return fail("Payment could not be verified.", 400);
  }
  const order = await env.DB.prepare(
    "SELECT id, order_number, status, total_paise FROM orders WHERE razorpay_order_id = ?"
  ).bind(razorpay_order_id).first();
  if (!order) return fail("Order not found.", 404);
  if (order.status === "created") {
    await env.DB.batch([
      env.DB.prepare(
        "UPDATE orders SET status='paid', razorpay_payment_id=?, paid_at=datetime('now'), updated_at=datetime('now') WHERE id=? AND status='created'"
      ).bind(razorpay_payment_id, order.id),
      env.DB.prepare(
        "INSERT INTO order_events (order_id, from_status, to_status, source, detail) VALUES (?, 'created', 'paid', 'verify', ?)"
      ).bind(order.id, razorpay_payment_id)
    ]);
  }
  return json({ ok: true, orderNumber: order.order_number, amountPaise: order.total_paise });
}
var onRequest3;
var init_verify = __esm({
  "api/checkout/verify.js"() {
    init_functionsRoutes_0_17747373319536575();
    init_http();
    init_razorpay();
    __name(onRequestPost4, "onRequestPost");
    onRequest3 = /* @__PURE__ */ __name(() => methodNotAllowed("POST"), "onRequest");
  }
});

// api/webhooks/razorpay.js
async function onRequestPost5({ request, env }) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return fail("Webhook is not configured.", 503);
  if (!env.DB) return fail("Order storage is unavailable.", 503);
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const valid = await verifyWebhookSignature(env, raw, signature);
  if (!valid) return fail("Invalid signature.", 401);
  let event;
  try {
    event = JSON.parse(raw);
  } catch (_) {
    return fail("Malformed payload.", 400);
  }
  const eventId = request.headers.get("x-razorpay-event-id") || event.payload && event.payload.payment && event.payload.payment.entity && event.payload.payment.entity.id;
  const type = event.event || "unknown";
  const entity = event.payload && event.payload.payment && event.payload.payment.entity || {};
  const razorpayOrderId = entity.order_id;
  if (!eventId) return fail("Missing event id.", 400);
  try {
    await env.DB.prepare(
      "INSERT INTO webhook_events (event_id, event_type, order_id, payload) VALUES (?,?,?,?)"
    ).bind(eventId, type, razorpayOrderId || null, raw.slice(0, 8e3)).run();
  } catch (_) {
    return json({ ok: true, duplicate: true });
  }
  if (!razorpayOrderId) return json({ ok: true, ignored: type });
  const order = await env.DB.prepare(
    "SELECT id, status, total_paise FROM orders WHERE razorpay_order_id = ?"
  ).bind(razorpayOrderId).first();
  if (!order) return json({ ok: true, unknownOrder: true });
  if (type === "payment.captured" || type === "order.paid") {
    if (Number(entity.amount) && Number(entity.amount) !== Number(order.total_paise)) {
      await env.DB.prepare(
        "INSERT INTO order_events (order_id, from_status, to_status, source, detail) VALUES (?,?,?,'webhook',?)"
      ).bind(order.id, order.status, order.status, `amount mismatch: charged ${entity.amount}, expected ${order.total_paise}`).run();
      return json({ ok: true, mismatch: true });
    }
    if (order.status === "created") {
      await env.DB.batch([
        env.DB.prepare("UPDATE orders SET status='paid', razorpay_payment_id=?, paid_at=datetime('now'), updated_at=datetime('now') WHERE id=? AND status='created'").bind(entity.id || null, order.id),
        env.DB.prepare("INSERT INTO order_events (order_id, from_status, to_status, source, detail) VALUES (?,'created','paid','webhook',?)").bind(order.id, entity.id || type)
      ]);
    }
  } else if (type === "payment.failed" && order.status === "created") {
    await env.DB.batch([
      env.DB.prepare("UPDATE orders SET status='failed', updated_at=datetime('now') WHERE id=? AND status='created'").bind(order.id),
      env.DB.prepare("INSERT INTO order_events (order_id, from_status, to_status, source, detail) VALUES (?,'created','failed','webhook',?)").bind(order.id, (entity.error_description || "payment failed").slice(0, 200))
    ]);
  }
  return json({ ok: true });
}
var onRequest4;
var init_razorpay2 = __esm({
  "api/webhooks/razorpay.js"() {
    init_functionsRoutes_0_17747373319536575();
    init_http();
    init_razorpay();
    __name(onRequestPost5, "onRequestPost");
    onRequest4 = /* @__PURE__ */ __name(() => methodNotAllowed("POST"), "onRequest");
  }
});

// api/serviceability.js
async function onRequestGet3({ request }) {
  const pincode = new URL(request.url).searchParams.get("pincode") || "";
  if (!isValidPincode(pincode)) {
    return fail("Enter a valid 6 digit pincode.", 400);
  }
  const zone = findZone(pincode);
  if (!zone || !zone.serviceable) {
    return json({
      ok: true,
      serviceable: false,
      message: "We do not deliver there yet. Message us on WhatsApp and we will see what we can do."
    });
  }
  return json({
    ok: true,
    serviceable: true,
    zone: { id: zone.id, name: zone.name },
    ratePaise: zone.ratePaise,
    freeAbovePaise: zone.freeAbovePaise ?? null,
    minDays: zone.minDays,
    maxDays: zone.maxDays
  });
}
var import_shippingZones, findZone, isValidPincode, onRequest5;
var init_serviceability = __esm({
  "api/serviceability.js"() {
    init_functionsRoutes_0_17747373319536575();
    init_http();
    import_shippingZones = __toESM(require_shippingZones());
    ({ findZone, isValidPincode } = import_shippingZones.default);
    __name(onRequestGet3, "onRequestGet");
    onRequest5 = /* @__PURE__ */ __name(() => methodNotAllowed("GET"), "onRequest");
  }
});

// ../.wrangler/tmp/pages-RtFrih/functionsRoutes-0.17747373319536575.mjs
var routes;
var init_functionsRoutes_0_17747373319536575 = __esm({
  "../.wrangler/tmp/pages-RtFrih/functionsRoutes-0.17747373319536575.mjs"() {
    init_orders();
    init_orders();
    init_stats();
    init_create_order();
    init_quote();
    init_verify();
    init_razorpay2();
    init_create_order();
    init_quote();
    init_verify();
    init_razorpay2();
    init_serviceability();
    init_serviceability();
    routes = [
      {
        routePath: "/api/admin/orders",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet]
      },
      {
        routePath: "/api/admin/orders",
        mountPath: "/api/admin",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost]
      },
      {
        routePath: "/api/admin/stats",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet2]
      },
      {
        routePath: "/api/checkout/create-order",
        mountPath: "/api/checkout",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost2]
      },
      {
        routePath: "/api/checkout/quote",
        mountPath: "/api/checkout",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost3]
      },
      {
        routePath: "/api/checkout/verify",
        mountPath: "/api/checkout",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost4]
      },
      {
        routePath: "/api/webhooks/razorpay",
        mountPath: "/api/webhooks",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost5]
      },
      {
        routePath: "/api/checkout/create-order",
        mountPath: "/api/checkout",
        method: "",
        middlewares: [],
        modules: [onRequest]
      },
      {
        routePath: "/api/checkout/quote",
        mountPath: "/api/checkout",
        method: "",
        middlewares: [],
        modules: [onRequest2]
      },
      {
        routePath: "/api/checkout/verify",
        mountPath: "/api/checkout",
        method: "",
        middlewares: [],
        modules: [onRequest3]
      },
      {
        routePath: "/api/webhooks/razorpay",
        mountPath: "/api/webhooks",
        method: "",
        middlewares: [],
        modules: [onRequest4]
      },
      {
        routePath: "/api/serviceability",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet3]
      },
      {
        routePath: "/api/serviceability",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest5]
      }
    ];
  }
});

// ../.wrangler/tmp/bundle-tZqFBW/middleware-loader.entry.ts
init_functionsRoutes_0_17747373319536575();

// ../.wrangler/tmp/bundle-tZqFBW/middleware-insertion-facade.js
init_functionsRoutes_0_17747373319536575();

// C:/Users/deepakk/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
init_functionsRoutes_0_17747373319536575();

// C:/Users/deepakk/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
init_functionsRoutes_0_17747373319536575();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// C:/Users/deepakk/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// C:/Users/deepakk/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_functionsRoutes_0_17747373319536575();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/deepakk/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_functionsRoutes_0_17747373319536575();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-tZqFBW/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// C:/Users/deepakk/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
init_functionsRoutes_0_17747373319536575();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-tZqFBW/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.4591703302883321.mjs.map
