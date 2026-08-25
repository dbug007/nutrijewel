import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { X, Gift } from 'lucide-react';
import './BirthdayOfferPopup.css';

/* Birthday notification for the test home page:
   - a festive modal that appears ~1.5s after load (once per session)
   - a persistent floating "Spin & Win" badge (always visible → FOMO)
   Both route to the dedicated /spin wheel page. */

export default function BirthdayOfferPopup() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('nj_bday_popup_seen')) return undefined;
    // Don't nag someone who has already spun and claimed a prize.
    let alreadySpun = false;
    try { alreadySpun = !!localStorage.getItem('nj_birthday_prize'); } catch (_) { /* storage blocked */ }
    if (alreadySpun) return undefined;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem('nj_bday_popup_seen', '1');
    }, 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const goSpin = () => { setOpen(false); navigate('/spin'); };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="nj-bday-pop-backdrop"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="nj-bday-pop"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.92, opacity: 0, y: 14 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Birthday offer"
            >
              <button className="nj-bday-pop-close" onClick={() => setOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
              <div className="nj-bday-pop-emoji">🎂🎉</div>
              <h2 className="nj-bday-pop-title">It's our Birthday!</h2>
              <p className="nj-bday-pop-text">
                Celebrate with us: spin the wheel for an exclusive NutriJewel deal. <strong>Today only.</strong>
              </p>
              <button className="nj-bday-pop-cta" onClick={goSpin}>
                <Gift size={20} /> SPIN TO WIN 🎡
              </button>
              <button className="nj-bday-pop-dismiss" onClick={() => setOpen(false)}>Maybe later</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button className="nj-bday-fab" onClick={() => navigate('/spin')} aria-label="Spin and win a birthday deal">
        <span className="nj-bday-fab-emoji" aria-hidden="true">🎁</span>
        <span className="nj-bday-fab-text">Spin &amp; Win</span>
      </button>
    </>
  );
}
