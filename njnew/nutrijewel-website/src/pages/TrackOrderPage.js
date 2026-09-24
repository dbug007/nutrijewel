import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Package, AlertCircle, Loader2 } from 'lucide-react';
import './TrackOrderPage.css';

/*
 * Guest order tracking. No accounts, so the order number plus the phone that
 * placed the order is the credential.
 *
 * The server returns a status and item names, never the address. That is
 * deliberate: an order number is short, so a lucky guess must not hand over
 * somebody's home address.
 */

const STEPS = ['paid', 'confirmed', 'packed', 'shipped', 'delivered'];
const STEP_LABEL = { paid: 'Paid', confirmed: 'Confirmed', packed: 'Packed', shipped: 'On its way', delivered: 'Delivered' };

const rupees = (paise) => `₹${((paise || 0) / 100).toLocaleString('en-IN')}`;

export default function TrackOrderPage() {
  // Arriving from the confirmation screen carries the order number, so the
  // customer only has to type their phone. Uppercased and trimmed the same way
  // the input does, so a pasted lowercase number still matches.
  const [params] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(() => (params.get('n') || '').trim().toUpperCase().slice(0, 20));
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, phone }),
      });
      const data = await res.json();
      if (data.ok) setResult(data);
      else setError((data.errors && data.errors[0]) || 'We could not find that order.');
    } catch (_) {
      setError('Could not reach the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = result ? STEPS.indexOf(result.status) : -1;
  const isTerminalBad = result && ['failed', 'cancelled', 'refunded', 'created'].includes(result.status);

  return (
    <main className="njtr">
      <h1>Track your order</h1>
      <p className="njtr-muted">Enter your order number and the mobile number you used.</p>

      <form className="njtr-form" onSubmit={submit}>
        <label className="njtr-field">
          <span>Order number</span>
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            placeholder="NJ-2609-4F2A"
            autoComplete="off"
            spellCheck="false"
          />
        </label>
        <label className="njtr-field">
          <span>Mobile number</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98765 43210"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={15}
          />
        </label>
        <button type="submit" className="njtr-btn" disabled={loading || !orderNumber.trim() || !phone.trim()}>
          {loading ? <><Loader2 size={17} className="njtr-spin" /> Looking</> : <><Search size={17} /> Track order</>}
        </button>
      </form>

      {error && <p className="njtr-error"><AlertCircle size={16} /> {error}</p>}

      {result && (
        <section className="njtr-result" aria-live="polite">
          <header>
            <p className="njtr-num">{result.orderNumber}</p>
            <p className="njtr-total">{rupees(result.totalPaise)}</p>
          </header>

          <p className={`njtr-status${isTerminalBad ? ' is-bad' : ''}`}>{result.statusLabel}</p>
          <p className="njtr-muted">{result.statusDetail}</p>

          {!isTerminalBad && stepIndex >= 0 && (
            <ol className="njtr-steps">
              {STEPS.map((s, i) => (
                <li key={s} className={i <= stepIndex ? 'is-done' : ''}>
                  <span className="njtr-dot" aria-hidden="true" />
                  <span>{STEP_LABEL[s]}</span>
                </li>
              ))}
            </ol>
          )}

          {result.items.length > 0 && (
            <ul className="njtr-items">
              {result.items.map((it, i) => (
                <li key={i}><Package size={14} /> {it.name} <em>{it.weight}</em>{it.qty > 1 ? ` x${it.qty}` : ''}</li>
              ))}
            </ul>
          )}

          <p className="njtr-muted njtr-small">
            Something not right? <a href="https://wa.me/919960637656">Message us on WhatsApp</a> with this order number.
          </p>
        </section>
      )}

      <p className="njtr-muted njtr-small njtr-back">
        <Link to="/products">Back to the shop</Link>
      </p>
    </main>
  );
}
