import { onRequestGet as __api_admin_orders_js_onRequestGet } from "D:\\Downloads\\VS-W\\nutrijewel\\njnew\\nutrijewel-website\\functions\\api\\admin\\orders.js"
import { onRequestPost as __api_admin_orders_js_onRequestPost } from "D:\\Downloads\\VS-W\\nutrijewel\\njnew\\nutrijewel-website\\functions\\api\\admin\\orders.js"
import { onRequestGet as __api_admin_stats_js_onRequestGet } from "D:\\Downloads\\VS-W\\nutrijewel\\njnew\\nutrijewel-website\\functions\\api\\admin\\stats.js"
import { onRequestPost as __api_checkout_create_order_js_onRequestPost } from "D:\\Downloads\\VS-W\\nutrijewel\\njnew\\nutrijewel-website\\functions\\api\\checkout\\create-order.js"
import { onRequestPost as __api_checkout_quote_js_onRequestPost } from "D:\\Downloads\\VS-W\\nutrijewel\\njnew\\nutrijewel-website\\functions\\api\\checkout\\quote.js"
import { onRequestPost as __api_checkout_verify_js_onRequestPost } from "D:\\Downloads\\VS-W\\nutrijewel\\njnew\\nutrijewel-website\\functions\\api\\checkout\\verify.js"
import { onRequestPost as __api_webhooks_razorpay_js_onRequestPost } from "D:\\Downloads\\VS-W\\nutrijewel\\njnew\\nutrijewel-website\\functions\\api\\webhooks\\razorpay.js"
import { onRequest as __api_checkout_create_order_js_onRequest } from "D:\\Downloads\\VS-W\\nutrijewel\\njnew\\nutrijewel-website\\functions\\api\\checkout\\create-order.js"
import { onRequest as __api_checkout_quote_js_onRequest } from "D:\\Downloads\\VS-W\\nutrijewel\\njnew\\nutrijewel-website\\functions\\api\\checkout\\quote.js"
import { onRequest as __api_checkout_verify_js_onRequest } from "D:\\Downloads\\VS-W\\nutrijewel\\njnew\\nutrijewel-website\\functions\\api\\checkout\\verify.js"
import { onRequest as __api_webhooks_razorpay_js_onRequest } from "D:\\Downloads\\VS-W\\nutrijewel\\njnew\\nutrijewel-website\\functions\\api\\webhooks\\razorpay.js"
import { onRequestGet as __api_serviceability_js_onRequestGet } from "D:\\Downloads\\VS-W\\nutrijewel\\njnew\\nutrijewel-website\\functions\\api\\serviceability.js"
import { onRequest as __api_serviceability_js_onRequest } from "D:\\Downloads\\VS-W\\nutrijewel\\njnew\\nutrijewel-website\\functions\\api\\serviceability.js"

export const routes = [
    {
      routePath: "/api/admin/orders",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_orders_js_onRequestGet],
    },
  {
      routePath: "/api/admin/orders",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_orders_js_onRequestPost],
    },
  {
      routePath: "/api/admin/stats",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_stats_js_onRequestGet],
    },
  {
      routePath: "/api/checkout/create-order",
      mountPath: "/api/checkout",
      method: "POST",
      middlewares: [],
      modules: [__api_checkout_create_order_js_onRequestPost],
    },
  {
      routePath: "/api/checkout/quote",
      mountPath: "/api/checkout",
      method: "POST",
      middlewares: [],
      modules: [__api_checkout_quote_js_onRequestPost],
    },
  {
      routePath: "/api/checkout/verify",
      mountPath: "/api/checkout",
      method: "POST",
      middlewares: [],
      modules: [__api_checkout_verify_js_onRequestPost],
    },
  {
      routePath: "/api/webhooks/razorpay",
      mountPath: "/api/webhooks",
      method: "POST",
      middlewares: [],
      modules: [__api_webhooks_razorpay_js_onRequestPost],
    },
  {
      routePath: "/api/checkout/create-order",
      mountPath: "/api/checkout",
      method: "",
      middlewares: [],
      modules: [__api_checkout_create_order_js_onRequest],
    },
  {
      routePath: "/api/checkout/quote",
      mountPath: "/api/checkout",
      method: "",
      middlewares: [],
      modules: [__api_checkout_quote_js_onRequest],
    },
  {
      routePath: "/api/checkout/verify",
      mountPath: "/api/checkout",
      method: "",
      middlewares: [],
      modules: [__api_checkout_verify_js_onRequest],
    },
  {
      routePath: "/api/webhooks/razorpay",
      mountPath: "/api/webhooks",
      method: "",
      middlewares: [],
      modules: [__api_webhooks_razorpay_js_onRequest],
    },
  {
      routePath: "/api/serviceability",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_serviceability_js_onRequestGet],
    },
  {
      routePath: "/api/serviceability",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_serviceability_js_onRequest],
    },
  ]