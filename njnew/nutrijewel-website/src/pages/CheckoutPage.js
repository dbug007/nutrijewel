import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import './CheckoutPage.css';

/*
 * Checkout. Phone first: the form is one column, inputs are 16px so iOS does not
 * zoom on focus, and the pay button is docked at the bottom on small screens.
 *
 * Every rupee shown here comes from /api/checkout/quote. The page does no money
 * arithmetic of its own, so what the customer reads is what the server will
 * charge. If the two ever disagreed, the server would win silently and the
 * customer would feel cheated; this way they cannot disagree.
 */

const RZP_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${RZP_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const s = document.createElement('script');
    s.src = RZP_SCRIPT;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const FIELDS = [
  { id: 'name', label: 'Full name', type: 'text', autoComplete: 'name', placeholder: 'Ruchika Bachwani' },
  { id: 'phone', label: 'Mobile number', type: 'tel', autoComplete: 'tel', placeholder: '98765 43210', inputMode: 'numeric' },
  { id: 'email', label: 'Email (optional)', type: 'email', autoComplete: 'email', placeholder: 'you@example.com' },
  { id: 'address', label: 'Delivery address', type: 'textarea', autoComplete: 'street-address', placeholder: 'Flat, building, street, landmark' },
  { id: 'city', label: 'City', type: 'text', autoComplete: 'address-level2', placeholder: 'Pune' },
  { id: 'pincode', label: 'Pincode', type: 'text', autoComplete: 'postal-code', placeholder: '411045', inputMode: 'numeric' },
];

const rupees = (paise) => `₹${((paise || 0) / 100).toLocaleString('en-IN')}`;

export default function CheckoutPage() {
  const { cart, cartCount, clearCart } = useStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', pincode: '' });
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(null);
  const quoteSeq = useRef(0);

  /* Turnstile bot check. Off unless the server hands us a site key, which it only
     does once both Turnstile keys are configured on Cloudflare. Tokens are
     single-use, so the widget is reset after every order attempt. */
  const tsKey = quote && quote.turnstileSiteKey;
  const tsBox = useRef(null);
  const tsWidget = useRef(null);
  const [tsToken, setTsToken] = useState('');

  useEffect(() => {
    if (!tsKey || !tsBox.current || tsWidget.current !== null) return undefined;
    let cancelled = false;
    const draw = () => {
      if (cancelled || !window.turnstile || !tsBox.current || tsWidget.current !== null) return;
      tsWidget.current = window.turnstile.render(tsBox.current, {
        sitekey: tsKey,
        callback: (t) => setTsToken(t),
        'expired-callback': () => setTsToken(''),
        'error-callback': () => setTsToken(''),
      });
    };
    if (window.turnstile) draw();
    else {
      const src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      let tag = document.querySelector(`script[src="${src}"]`);
      if (!tag) { tag = document.createElement('script'); tag.src = src; tag.async = true; document.body.appendChild(tag); }
      tag.addEventListener('load', draw);
    }
    return () => { cancelled = true; };
  }, [tsKey]);

  const resetTurnstile = () => {
    setTsToken('');
    if (window.turnstile && tsWidget.current !== null) {
      try { window.turnstile.reset(tsWidget.current); } catch (_) { /* ignore */ }
    }
  };

  // Only the parts of the cart the server is willing to hear about.
  const lines = cart
    .filter((l) => l.kind !== 'hamper')
    .map((l) => ({ productId: l.productId, weight: l.weight, qty: l.qty }));

  const fetchQuote = useCallback(async (pincode) => {
    if (lines.length === 0) { setQuote(null); return; }
    const seq = ++quoteSeq.current;
    setQuoting(true);
    try {
      const res = await fetch('/api/checkout/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines, pincode: /^[1-9][0-9]{5}$/.test(pincode) ? pincode : undefined }),
      });
      const data = await res.json();
      // A slow earlier request must not overwrite a newer answer.
      if (seq !== quoteSeq.current) return;
      if (data.ok) { setQuote(data); setErrors([]); }
      else { setQuote(null); setErrors(data.errors || ['Could not price your cart.']); }
    } catch (_) {
      if (seq === quoteSeq.current) setErrors(['Could not reach the server. Check your connection.']);
    } finally {
      if (seq === quoteSeq.current) setQuoting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(lines)]);

  useEffect(() => { fetchQuote(form.pincode); }, [fetchQuote, form.pincode]);

  const set = (id) => (e) => setForm((f) => ({ ...f, [id]: e.target.value }));

  const pay = async () => {
    setErrors([]); setPaying(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) { setErrors(['Could not load the payment window. Check your connection and try again.']); return; }

      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines, customer: form, turnstileToken: tsToken || undefined }),
      });
      const order = await res.json();
      // Spent either way: a Turnstile token cannot be used twice.
      if (tsKey) resetTurnstile();
      if (!order.ok) { setErrors(order.errors || ['Could not start the payment.']); return; }

      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.razorpayOrderId,
        amount: order.amountPaise,
        currency: order.currency,
        name: 'NutriJewel',
        description: `Order ${order.orderNumber}`,
        prefill: order.prefill,
        theme: { color: '#93B559' },
        handler: async (r) => {
          try {
            const v = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(r),
            });
            const out = await v.json();
            if (out.ok) {
              /* GA4 purchase. The first time revenue has ever been measurable:
                 WhatsApp checkout left the site, so orders never reached analytics.
                 Skipped in test mode so fake orders do not pollute real figures.
                 Amounts come from the server's quote, never recomputed here. */
              if (window.gtag && !(quote && quote.testMode)) {
                window.gtag('event', 'purchase', {
                  transaction_id: out.orderNumber,
                  value: out.amountPaise / 100,
                  currency: 'INR',
                  shipping: quote ? quote.shippingPaise / 100 : 0,
                  items: (quote ? quote.lines : []).map((l) => ({
                    item_id: l.productId,
                    item_name: l.name,
                    item_variant: l.weight,
                    price: l.unitPaise / 100,
                    quantity: l.qty,
                  })),
                });
              }
              clearCart();
              setDone({ orderNumber: out.orderNumber, amountPaise: out.amountPaise, testMode: quote && quote.testMode });
            } else {
              // Money may well have left their account. Never imply it has not.
              setErrors([`We could not confirm payment for ${order.orderNumber}. If money has left your account, message us on WhatsApp with this order number and we will sort it out.`]);
            }
          } catch (_) {
            setErrors([`Payment went through but we could not confirm it. Quote order ${order.orderNumber} on WhatsApp.`]);
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => { setPaying(false); },
        },
      });

      rzp.on('payment.failed', (e) => {
        setPaying(false);
        setErrors([(e && e.error && e.error.description) || 'The payment did not go through. Nothing has been charged.']);
      });

      rzp.open();
      return; // handler and ondismiss own `paying` from here
    } catch (_) {
      setErrors(['Something went wrong starting the payment.']);
    } finally {
      // Only clear here if the modal never opened.
      if (!window.Razorpay) setPaying(false);
    }
  };

  if (done) {
    return (
      <main className="njco njco-done">
        <CheckCircle2 size={56} className="njco-tick" />
        <h1>Order confirmed</h1>
        <p className="njco-num">{done.orderNumber}</p>
        {done.testMode && <p className="njco-testmode">Test mode: no money was charged.</p>}
        <p className="njco-muted">
          Paid {rupees(done.amountPaise)}. We will message you on WhatsApp to confirm delivery.
          Keep this order number.
        </p>
        <Link className="njco-btn njco-btn-primary" to={`/orders/track?n=${encodeURIComponent(done.orderNumber)}`}>Track this order</Link>
        <Link className="njco-link" to="/products">Continue shopping</Link>
      </main>
    );
  }

  if (cartCount === 0) {
    return (
      <main className="njco njco-done">
        <h1>Your cart is empty</h1>
        <p className="njco-muted">Add something you love, then come back.</p>
        <Link className="njco-btn njco-btn-primary" to="/products">Browse products</Link>
      </main>
    );
  }

  const pincodeValid = /^[1-9][0-9]{5}$/.test(form.pincode);
  const canPay = !paying && quote && quote.ok && pincodeValid && form.name.trim() && form.phone.trim() && form.address.trim() && form.city.trim()
    && (!tsKey || !!tsToken);

  return (
    <main className="njco">
      <button className="njco-back" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Back</button>
      <h1>Checkout</h1>

      {quote && quote.testMode && (
        <p className="njco-testmode" role="status">
          <AlertCircle size={16} /> Test mode. No real money will be charged, and this is not a real order.
        </p>
      )}

      <section className="njco-summary" aria-label="Order summary">
        <ul>
          {(quote ? quote.lines : lines).map((l, i) => (
            <li key={`${l.productId}-${l.weight}-${i}`}>
              <span>{l.name || l.productId} <em>{l.weight}</em>{l.qty > 1 ? ` x${l.qty}` : ''}</span>
              <span>{l.lineDisplay || ''}</span>
            </li>
          ))}
        </ul>
        {quote && (
          <div className="njco-totals">
            <div><span>Items</span><span>{quote.itemsDisplay}</span></div>
            <div>
              <span>Delivery{quote.zone ? ` (${quote.zone.name})` : ''}</span>
              <span>{quote.shippingDisplay}</span>
            </div>
            <div className="njco-grand"><span>Total</span><span>{quote.totalDisplay}</span></div>
            {/* "after dispatch", not "delivered in": the Shipping Policy allows up
                to 7 days to prepare an order, so promising 1 to 2 days flat would
                contradict it. */}
            {quote.zone && <p className="njco-muted njco-eta">Delivered {quote.zone.minDays} to {quote.zone.maxDays} days after dispatch</p>}
          </div>
        )}
        {!quote && !quoting && <p className="njco-muted">Enter your pincode to see delivery and the total.</p>}
      </section>

      {/* Never submit on Enter. On a phone the keyboard's Go key submits the
          form, and wiring that to pay() opened the payment window without the
          customer deciding to pay. Paying must be a deliberate tap on the
          button below and nothing else. */}
      <form className="njco-form" onSubmit={(e) => e.preventDefault()}>
        {FIELDS.map((f) => (
          <label key={f.id} className="njco-field">
            <span>{f.label}</span>
            {f.type === 'textarea' ? (
              <textarea rows={3} value={form[f.id]} onChange={set(f.id)} placeholder={f.placeholder} autoComplete={f.autoComplete} />
            ) : (
              <input
                type={f.type}
                value={form[f.id]}
                onChange={set(f.id)}
                placeholder={f.placeholder}
                autoComplete={f.autoComplete}
                inputMode={f.inputMode}
                maxLength={f.id === 'pincode' ? 6 : undefined}
              />
            )}
          </label>
        ))}

        {errors.length > 0 && (
          <div className="njco-errors" role="alert">
            {errors.map((e, i) => <p key={i}><AlertCircle size={15} /> {e}</p>)}
          </div>
        )}

        {tsKey && <div ref={tsBox} className="njco-turnstile" aria-label="Security check" />}

        <div className="njco-pay">
          <button type="button" onClick={pay} className="njco-btn njco-btn-primary njco-btn-pay" disabled={!canPay}>
            {paying ? <><Loader2 size={18} className="njco-spin" /> Opening payment</> : <>Pay {quote ? quote.totalDisplay : ''}</>}
          </button>
          <p className="njco-secure"><ShieldCheck size={14} /> Payment handled by Razorpay. We never see your card details.</p>
        </div>
      </form>
    </main>
  );
}
