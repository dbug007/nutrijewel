import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { HAMPER_FAQS } from '../../data/hampers';

/* Accordion. The matching FAQPage JSON-LD is emitted at build time by
   scripts/create-static-routes.js from the same HAMPER_FAQS array, so the
   structured data and the visible copy can't drift apart. */

export default function HamperFAQ() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(0);

  return (
    <section className="nj-hfaq" aria-labelledby="nj-hfaq-title">
      <div className="container">
        <div className="nj-section-head">
          <h2 className="nj-section-title" id="nj-hfaq-title">
            <HelpCircle size={20} /> Hamper questions
          </h2>
        </div>

        <div className="nj-hfaq-list">
          {HAMPER_FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div className={`nj-hfaq-item${isOpen ? ' is-open' : ''}`} key={faq.q}>
                <h3>
                  <button
                    className="nj-hfaq-q"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    id={`nj-hfaq-q-${i}`}
                    aria-controls={`nj-hfaq-a-${i}`}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={17} aria-hidden="true" />
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="nj-hfaq-a"
                      id={`nj-hfaq-a-${i}`}
                      role="region"
                      aria-labelledby={`nj-hfaq-q-${i}`}
                      initial={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                      animate={reduceMotion ? undefined : { height: 'auto', opacity: 1 }}
                      exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
