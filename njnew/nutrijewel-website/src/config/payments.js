/*
 * The single switch between "order on WhatsApp" and "pay on the site".
 *
 * Everything customer-facing that talks about payment reads this: the cart
 * button, the note under it, and the product page FAQ. Flip it in one place and
 * the whole storefront changes together, so there is never a moment where the
 * site says "no payment is taken" while taking payment, or the other way round.
 *
 * Leave it FALSE while Razorpay is on test keys. Test card numbers are published
 * in Razorpay's own docs, so with this on and test keys in place any visitor can
 * place an order that shows as paid while no money moves.
 *
 * To go live:
 *   1. Set the live keys (rzp_live_...) as Cloudflare secrets.
 *   2. Register the webhook in the Razorpay dashboard.
 *   3. Set this to true and deploy.
 *   4. Make one small real payment yourself and see it land in your bank.
 *
 * /checkout works regardless of this flag, reachable by typing the URL, so the
 * payment path can be tested before customers are pointed at it.
 */
export const ONLINE_PAYMENTS_ENABLED = false;
