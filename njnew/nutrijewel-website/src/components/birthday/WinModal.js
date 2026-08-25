import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { X, Copy, Check, MessageCircle, ShoppingBag } from 'lucide-react';
import { BIRTHDAY } from '../../data/birthdayOffers';
import './WinModal.css';

export default function WinModal({ offer, onClose }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!offer) return null;

  const copyCode = async () => {
    try { await navigator.clipboard.writeText(offer.code); } catch (_) { /* clipboard may be blocked */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const claimWhatsApp = () => {
    const msg = `Hi! I won "${offer.label}" (code ${offer.code}) on the NutriJewel Birthday wheel. Sharing my screenshot to avail the offer!`;
    window.open(`https://wa.me/${BIRTHDAY.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <AnimatePresence>
      <motion.div
        className="nj-win-backdrop"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <motion.div
          className="nj-win-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.7, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.82, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 250, damping: 20 }}
          role="dialog"
          aria-modal="true"
          aria-label={`You won ${offer.label}`}
        >
          <span className="nj-bulbs" aria-hidden="true" />
          <button className="nj-win-close" onClick={onClose} aria-label="Close"><X size={20} /></button>

          <img src={`${process.env.PUBLIC_URL}/logo512.png`} alt="NutriJewel" className="nj-win-logo" />
          <p className="nj-win-eyebrow">{offer.id === 'gift' ? '🎰 JACKPOT! 🎰' : 'Congratulations!'}</p>
          <h2 className="nj-win-prize">{offer.label}</h2>
          <p className="nj-win-sub">{offer.sublabel}</p>

          <button className="nj-win-code" onClick={copyCode} aria-label={`Copy code ${offer.code}`}>
            <span className="nj-win-code-label">Your code</span>
            <span className="nj-win-code-value">{offer.code}</span>
            <span className="nj-win-code-copy">
              {copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy'}
            </span>
          </button>

          <p className="nj-win-valid">⏳ Valid for today only &nbsp;·&nbsp; WhatsApp a screenshot to avail the offer</p>

          <div className="nj-win-actions">
            <button className="nj-win-wa" onClick={claimWhatsApp}>
              <MessageCircle size={18} /> Claim on WhatsApp
            </button>
            <button className="nj-win-shop" onClick={() => navigate('/products')}>
              <ShoppingBag size={18} /> Shop Now
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
