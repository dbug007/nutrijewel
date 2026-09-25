/* Platform and convenience fees: the owner's rule, and the only place it lives.
   (CommonJS, so Cloudflare Functions and Jest can both require it, like
   shippingZones.js.)

   Set by the owner on 2026-09-25: a platform fee and a convenience fee on every
   payment. Checkout shows each as a rupee amount and never as a percentage (the
   owner's call), so the rates live here and nowhere a customer can see them.

   The base is what the customer pays before fees: items plus any delivery fee
   charged online. A Porter/Rapido or courier fare settled on WhatsApp is not in
   the base, because it is not in the payment. Each fee is rounded to the nearest
   whole rupee, so the page never shows paise. fees.test.js pins all of this.

   Refunds: refund.js refunds the whole Razorpay payment, so a full refund always
   includes both fees. The refund policy says so. */

const PLATFORM_FEE_BPS = 200;     // basis points: 200 = 2%
const CONVENIENCE_FEE_BPS = 100;  // 100 = 1%

/* The customer-facing words. Never mention the rate. */
const PLATFORM_FEE_LABEL = 'Platform fee';
const CONVENIENCE_FEE_LABEL = 'Convenience fee';

/* What the convenience fee pays for, shown behind the (i) next to it. Every line
   must stay literally true for this shop: a customer who asks "does it?" must get
   a yes. Owner to confirm the wording.
   Deliberately nothing about the payment method: card networks and Razorpay
   restrict surcharges for paying online, and this fee is the same whichever way
   the customer pays. */
const CONVENIENCE_FEE_INFO = [
  'Keeps nutrijewel.com running: hosting, security and upkeep of the site you are ordering on.',
  'Live order tracking and WhatsApp updates, from your order to your door or pickup.',
  'Real people answering your questions about your order, on WhatsApp and phone.',
];

/* Whole rupees, half up, in paise. 1234.5 rupees of fee is impossible here, but
   the rule is explicit so the arithmetic can never drift into fractions. */
const roundToRupee = (paise) => Math.round(paise / 100) * 100;

function feesFor(basePaise) {
  const base = Number.isInteger(basePaise) && basePaise > 0 ? basePaise : 0;
  const platformFeePaise = roundToRupee((base * PLATFORM_FEE_BPS) / 10000);
  const convenienceFeePaise = roundToRupee((base * CONVENIENCE_FEE_BPS) / 10000);
  return { platformFeePaise, convenienceFeePaise, feesPaise: platformFeePaise + convenienceFeePaise };
}

module.exports = {
  PLATFORM_FEE_BPS,
  CONVENIENCE_FEE_BPS,
  PLATFORM_FEE_LABEL,
  CONVENIENCE_FEE_LABEL,
  CONVENIENCE_FEE_INFO,
  feesFor,
};
