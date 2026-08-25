/* Birthday "Spin & Win" — single source of truth for the promo wheel.
   Tweak prizes, odds (weight = slice size = win probability), colors, coupon
   codes, and birthday details here. The wheel, the popup, the win modal and
   the page all read from this file, so nothing else needs editing to rebrand
   the campaign. */

/* MASTER SWITCH for the birthday campaign.
   NOTE: the campaign is currently fully commented out in HomePage.js and App.js,
   so this flag is not read anywhere right now. It is kept (and set false) so that
   re-enabling only means un-commenting those imports/renders/routes.
   false = fully hidden (no popup, no floating badge, /spin & /birthday redirect home).
   true  = campaign live. */
export const CAMPAIGN_LIVE = false;

export const BIRTHDAY = {
  // Set a number (e.g. 3) to render "NutriJewel turns 3!"; leave null for the
  // generic headline below.
  years: null,
  headline: 'Happy Birthday, NutriJewel!',
  tagline: "Bet on the healthy life. Spin the wheel and win a deal on NutriJewel's wholesome treats. Today only.",
  urgencyMinutes: 10, // countdown length shown on the page (per visit)
  whatsapp: '919960637656',
  claimedToday: 300, // social-proof: shown as "300+ treats claimed today"
};

/* weight = slice size = win odds (normalised to 360°). Free Shipping and ₹100
   OFF are the costliest to honour, so they get the smallest slices (rarest).
   wheelLabel = the short text shown on the wheel; label = the full text shown
   in the win modal. */
export const OFFERS = [
  { id: 'off25',    label: '₹25 OFF',       wheelLabel: '₹25 OFF',   sublabel: 'on your order',  weight: 38, color: '#93B559', textColor: '#2F2F2F', code: 'NJ-BDAY-25' },
  { id: 'off50',    label: '₹50 OFF',       wheelLabel: '₹50 OFF',   sublabel: 'sitewide',       weight: 28, color: '#6D8A3C', textColor: '#FAF9F6', code: 'NJ-BDAY-50' },
  { id: 'gift',     label: 'Free Gift',     wheelLabel: 'Free Gift', sublabel: 'GRAND PRIZE ✨',  weight: 18, color: '#2F2F2F', textColor: '#F4D58D', code: 'NJ-GIFT' },
  { id: 'freeship', label: 'Free Shipping', wheelLabel: 'Free Ship', sublabel: 'within 15 km',   weight: 8,  color: '#D1E8A7', textColor: '#2F2F2F', code: 'NJ-FREESHIP' },
  { id: 'off100',   label: '₹100 OFF',      wheelLabel: '₹100 OFF',  sublabel: 'big saving',     weight: 8,  color: '#DCC99C', textColor: '#2F2F2F', code: 'NJ-BDAY-100' },
];
