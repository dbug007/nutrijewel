import { onRequestPost as __api_checkout_quote_js_onRequestPost } from "D:\\Downloads\\VS-W\\nutrijewel\\njnew\\nutrijewel-website\\functions\\api\\checkout\\quote.js"
import { onRequest as __api_checkout_quote_js_onRequest } from "D:\\Downloads\\VS-W\\nutrijewel\\njnew\\nutrijewel-website\\functions\\api\\checkout\\quote.js"
import { onRequestGet as __api_serviceability_js_onRequestGet } from "D:\\Downloads\\VS-W\\nutrijewel\\njnew\\nutrijewel-website\\functions\\api\\serviceability.js"
import { onRequest as __api_serviceability_js_onRequest } from "D:\\Downloads\\VS-W\\nutrijewel\\njnew\\nutrijewel-website\\functions\\api\\serviceability.js"

export const routes = [
    {
      routePath: "/api/checkout/quote",
      mountPath: "/api/checkout",
      method: "POST",
      middlewares: [],
      modules: [__api_checkout_quote_js_onRequestPost],
    },
  {
      routePath: "/api/checkout/quote",
      mountPath: "/api/checkout",
      method: "",
      middlewares: [],
      modules: [__api_checkout_quote_js_onRequest],
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