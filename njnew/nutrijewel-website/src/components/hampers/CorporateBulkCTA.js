import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Building2, MessageCircle } from 'lucide-react';
import { revealVariants, getRevealProps } from '../motionPresets';

const WHATSAPP_NUMBER = '919960637656';

const BULK_MESSAGE = `Hi NutriJewel! I'd like a quote for bulk / corporate hampers.

Occasion:
Number of hampers:
Budget per hamper:
Delivery city & date:

Thank you!`;

/* Bulk gifting is the highest-value order on the site, so it gets its own ask
   with the enquiry already structured, the owner gets usable details first time. */

export default function CorporateBulkCTA() {
  const reduceMotion = useReducedMotion();

  const openWhatsApp = () => {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(BULK_MESSAGE)}`,
      '_blank'
    );
  };

  return (
    <section className="nj-bulk" aria-labelledby="nj-bulk-title">
      <div className="container">
        <motion.div
          className="nj-bulk-panel"
          variants={reduceMotion ? undefined : revealVariants}
          {...getRevealProps(reduceMotion)}
        >
          <span className="nj-bulk-icon"><Building2 size={26} /></span>

          <div className="nj-bulk-copy">
            <h2 className="nj-bulk-title" id="nj-bulk-title">Gifting for a team, or a wedding?</h2>
            <p>
              We handle Diwali client gifting, wedding return gifts and corporate hampers at
              volume, with custom boxes, your branding on the card, and pricing that works
              at scale. Tell us the numbers and we'll put a quote together.
            </p>
            <ul className="nj-bulk-points">
              <li>25+ hampers</li>
              <li>Custom box &amp; branding</li>
              <li>Pan-India delivery</li>
            </ul>
          </div>

          <button className="nj-bulk-btn" onClick={openWhatsApp}>
            <MessageCircle size={17} /> Get a bulk quote
          </button>
        </motion.div>
      </div>
    </section>
  );
}
