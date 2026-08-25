import React, { useEffect, useState } from 'react';
import { RotateCcw, MessageCircle } from 'lucide-react';
import SpinWheel from '../components/birthday/SpinWheel';
import WinModal from '../components/birthday/WinModal';
import Confetti from '../components/birthday/Confetti';
import { BIRTHDAY } from '../data/birthdayOffers';
import './SpinWheelPage.css';

const STORAGE_KEY = 'nj_birthday_prize';

/* Floating background icons: healthy treats + casino bits ("bet on healthy life") */
const FLOATIES = ['🥜', '🍫', '🌰', '🌾', '🫐', '🥥', '🍇', '🌱', '🎲', '🪙', '💎', '🍀', '♠️', '♥️', '🎰'];

export default function SpinWheelPage() {
  const [won, setWon] = useState(null); // offer just won → drives the modal
  const [claimed, setClaimed] = useState(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v ? JSON.parse(v) : null;
    } catch (_) {
      return null;
    }
  });
  const [confettiKey, setConfettiKey] = useState(0);
  const [revealing, setRevealing] = useState(false); // brief beat between wheel stop and modal
  const [secondsLeft, setSecondsLeft] = useState(BIRTHDAY.urgencyMinutes * 60);

  useEffect(() => {
    document.title = 'Birthday Spin & Win | NutriJewel';
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const handleResult = (offer) => {
    // Analytics: count spins (GA4 reports total events + unique users). No-op until
    // a real GA4 Measurement ID is set in public/index.html.
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'wheel_spin', { prize_id: offer.id, prize: offer.label, code: offer.code });
    }
    // Let the wheel settle and the confetti pop first, then ease the modal in.
    setRevealing(true);
    setConfettiKey((k) => k + 1);
    const payload = { id: offer.id, label: offer.label, sublabel: offer.sublabel, code: offer.code };
    setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch (_) { /* storage may be blocked */ }
      setClaimed(payload);
      setWon(offer);
      setRevealing(false);
    }, 700);
  };

  const resetForTesting = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* noop */ }
    setClaimed(null);
    setWon(null);
  };

  const claimWhatsApp = (label, code) => {
    const msg = `Hi! I won "${label}" (code ${code}) on the NutriJewel Birthday wheel, and I'd like to claim it!`;
    window.open(`https://wa.me/${BIRTHDAY.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Owner-only reset: public gets one spin per browser; owner uses /spin?reset=1
  let showReset = false;
  try { showReset = new URLSearchParams(window.location.search).get('reset') === '1'; } catch (_) { /* noop */ }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const expired = secondsLeft <= 0;
  const headline = BIRTHDAY.years ? `NutriJewel turns ${BIRTHDAY.years}!` : BIRTHDAY.headline;
  const showClaimedCard = claimed && !won;

  return (
    <main className="nj-spin-page">
      <Confetti fireKey={confettiKey} />

      <div className="nj-spin-orbs" aria-hidden="true">
        <span className="nj-spin-orb o1" />
        <span className="nj-spin-orb o2" />
        <span className="nj-spin-orb o3" />
        <span className="nj-spin-orb o4" />
      </div>

      <div className="nj-spin-floaties" aria-hidden="true">
        {FLOATIES.map((e, i) => (
          <span key={i} className={`nj-floatie f${i}`}>{e}</span>
        ))}
      </div>

      <div className="nj-spin-inner">
        <section className="nj-spin-billboard">
          <span className="nj-bulbs" aria-hidden="true" />
          <span className="nj-spin-eyebrow">
            <span className="nj-spin-eyebrow-suit suit-gold" aria-hidden="true">♠</span>
            Birthday Jackpot
            <span className="nj-spin-eyebrow-suit suit-pink" aria-hidden="true">♥</span>
          </span>
          <h1 className="nj-spin-title">{headline} 🎂</h1>
          <p className="nj-spin-tagline">{BIRTHDAY.tagline}</p>

          <div className={`nj-spin-clock${expired ? ' is-expired' : ''}`}>
            <span className="nj-spin-clock-label">{expired ? 'Hurry, almost gone' : 'Offer ends in'}</span>
            <span className="nj-spin-clock-time">{expired ? 'Today only' : `${mm}:${ss}`}</span>
          </div>

          <p className="nj-spin-trust">
            One spin per guest <span className="nj-spin-trust-dot" aria-hidden="true">•</span> Today only
            <span className="nj-spin-trust-dot" aria-hidden="true">•</span> {BIRTHDAY.claimedToday}+ claimed today
          </p>
        </section>

        <section className="nj-spin-stage">
          {showClaimedCard ? (
            <div className="nj-spin-claimed">
              <span className="nj-bulbs" aria-hidden="true" />
              <img src={`${process.env.PUBLIC_URL}/logo512.png`} alt="NutriJewel" className="nj-spin-claimed-logo" />
              <h2>You've already spun!</h2>
              <p className="nj-spin-claimed-prize">You won <strong>{claimed.label}</strong></p>
              <div className="nj-spin-claimed-code">Code: <strong>{claimed.code}</strong></div>
              <button className="nj-spin-claim-btn" onClick={() => claimWhatsApp(claimed.label, claimed.code)}>
                <MessageCircle size={18} /> Claim on WhatsApp
              </button>
              {showReset && (
                <button className="nj-spin-reset" onClick={resetForTesting}>
                  <RotateCcw size={13} /> Reset (testing)
                </button>
              )}
            </div>
          ) : (
            <>
              <SpinWheel onResult={handleResult} disabled={revealing || (!!claimed && !won)} />
              {claimed && showReset && (
                <button className="nj-spin-reset" onClick={resetForTesting}>
                  <RotateCcw size={13} /> Reset (testing)
                </button>
              )}
            </>
          )}
        </section>
      </div>

      {won && <WinModal offer={won} onClose={() => setWon(null)} />}
    </main>
  );
}
