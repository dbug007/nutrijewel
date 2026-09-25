import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import shippingZones from '../data/shippingZones';
import InfoTip, { useInfoTip } from '../components/InfoTip';
import feeRules from '../data/fees';
import './CheckoutPage.css';
import { trackBeginCheckout, trackPurchase } from '../lib/analytics';

/*
 * Checkout. Phone first: the form is one column, inputs are 16px so iOS does not
 * zoom on focus, and the pay button sits at the end of the form.
 *
 * Every rupee shown here comes from /api/checkout/quote. The page does no money
 * arithmetic of its own, so what the customer reads is what the server will
 * charge. If the two ever disagreed, the server would win silently and the
 * customer would feel cheated; this way they cannot disagree.
 *
 * Pickup or delivery is a required choice with no default (the owner's rules
 * live in src/data/shippingZones.js). Pickup at Lodha Belmondo is the only free
 * option. A Porter/Rapido or courier fare is not in the online total: the quote
 * says so with chargedOnline: false, and the page shows the server's note.
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

const CONTACT_FIELDS = [
  { id: 'name', label: 'Full name', type: 'text', autoComplete: 'name', placeholder: 'Full name' },
  { id: 'phone', label: 'Mobile number', type: 'tel', autoComplete: 'tel', placeholder: 'e.g. 98765 43210', inputMode: 'numeric' },
  {
    id: 'email', label: 'Email (optional)', type: 'email', autoComplete: 'email', placeholder: 'you@example.com',
    // Razorpay emails the order and payment receipt here: it gets this address as prefill.
    info: { label: 'Why give your email?', text: 'Write your email to receive your order details.' },
  },
];

/* Delivery only. Pincode leads so the charge shows up before anything else is typed. */
const PINCODE_FIELD = { id: 'pincode', label: 'Pincode', type: 'text', autoComplete: 'postal-code', placeholder: '411045', inputMode: 'numeric', maxLength: 6 };
const ADDRESS_FIELDS = [
  { id: 'address', label: 'Delivery address', type: 'textarea', autoComplete: 'street-address', placeholder: 'Flat, building, street, landmark' },
  // Filled in from the pincode where India Post knows it; still editable.
  { id: 'city', label: 'City', type: 'text', autoComplete: 'address-level2', placeholder: 'City' },
];

const NOTES_FIELD = {
  id: 'notes', label: 'Note for us (optional)', type: 'textarea', maxLength: 300,
  placeholder: 'Preferred pickup time, or delivery instructions',
};

/* Built from the rules file, so a changed fee or the outside-Pune switch can
   never leave this line saying something checkout no longer charges. */
const { FIXED_RATES, OUTSIDE_PUNE } = shippingZones;
const pins = (list) => (list.length > 1 ? `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}` : list[0]);
const DELIVERY_SUB = [
  ...FIXED_RATES.map((r) => `₹${r.feePaise / 100} to ${pins(r.pincodes)}`),
  'Porter/Rapido fare elsewhere in Pune',
  ...(OUTSIDE_PUNE === 'courier-at-cost' ? ['courier at actual cost outside Pune'] : []),
].join(', ');

const METHODS = [
  { id: 'delivery', title: 'Delivery', sub: DELIVERY_SUB },
  { id: 'pickup', title: 'Free pickup', sub: 'Collect from Lodha Belmondo, Pune' },
];

const PINCODE_RE = /^[1-9][0-9]{5}$/;

/* One fee line in the summary: label and rupee amount, and for a fee that comes
   with reasons, an (i) whose explanation opens on its own line underneath. The
   rate is never shown, only the amount (the owner's call). */
function FeeRow({ fee }) {
  const tip = useInfoTip(`What is the ${fee.label.toLowerCase()}?`, fee.info && (
    <ul>{fee.info.map((line) => <li key={line}>{line}</li>)}</ul>
  ));
  return (
    <div className="njco-fee-line" data-testid={`fee-${fee.id}`}>
      <span>{fee.label}{fee.info && tip.button}</span>
      <span>{fee.display}</span>
      {fee.info && tip.panel}
    </div>
  );
}

const rupees = (paise) => `₹${((paise || 0) / 100).toLocaleString('en-IN')}`;

/* The charge text for the delivery line. The server only ever says Free for
   pickup; this makes sure a delivery charge can never read Free here even if a
   quote ever did, because there is no free delivery on this shop. */
const chargeText = (d) => {
  if (d.method === 'pickup' || !/free/i.test(d.display || '')) return d.display;
  return d.chargedOnline ? rupees(d.feePaise) : 'Confirmed on WhatsApp';
};

export default function CheckoutPage() {
  const { cart, cartCount, clearCart } = useStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', pincode: '', notes: '' });
  // '' until the customer picks. Never defaulted: the server refuses an order without it.
  const [fulfilment, setFulfilment] = useState('');
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(null);
  const quoteSeq = useRef(0);
  /* A dropped request on a phone must not leave Pay disabled for good: the
     network error offers Try again, which bumps this and re-asks. */
  const [quoteNetFail, setQuoteNetFail] = useState(false);
  const [quoteRetry, setQuoteRetry] = useState(0);

  /* Turnstile bot check. Off unless the server hands us a site key, which it only
     does once both Turnstile keys are configured on Cloudflare. Tokens are
     single-use, so the widget is reset after every order attempt. */
  const tsKey = quote && quote.turnstileSiteKey;
  const tsBox = useRef(null);
  const tsWidget = useRef(null);
  const [tsToken, setTsToken] = useState('');

  useEffect(() => {
    if (!tsKey) {
      /* The container unmounts whenever there is no quote (a failed or refused
         one). A widget id pointing into it is dead, and keeping it would stop
         the widget ever being drawn again, leaving Pay disabled for good. */
      if (tsWidget.current !== null) {
        try { if (window.turnstile) window.turnstile.remove(tsWidget.current); } catch (_) { /* ignore */ }
        tsWidget.current = null;
        setTsToken('');
      }
      return undefined;
    }
    if (!tsBox.current || tsWidget.current !== null) return undefined;
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

  const fetchQuote = useCallback(async (method, pincode) => {
    if (lines.length === 0) { setQuote(null); return; }
    const seq = ++quoteSeq.current;
    setQuoting(true);
    try {
      const res = await fetch('/api/checkout/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines, fulfilment: method, pincode }),
      });
      const data = await res.json();
      // A slow earlier request must not overwrite a newer answer.
      if (seq !== quoteSeq.current) return;
      setQuoteNetFail(false);
      if (data.ok) { setQuote(data); setErrors([]); }
      else { setQuote(null); setErrors(data.errors || ['Could not price your cart.']); }
    } catch (_) {
      // No answer means no confirmed price, so an older quote for a different
      // choice must not stay on screen as something that can be paid.
      if (seq === quoteSeq.current) {
        setQuote(null);
        setQuoteNetFail(true);
        setErrors(['Could not reach the server. Check your connection.']);
      }
    } finally {
      if (seq === quoteSeq.current) setQuoting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(lines)]);

  /* What the quote is asked about. Pickup needs no pincode. Delivery waits for a
     full pincode, pricing the items alone until then, so a half typed pincode is
     not answered with an error on every keystroke. */
  const pickup = fulfilment === 'pickup';
  const pincodeValid = PINCODE_RE.test(form.pincode);
  const quoteMethod = pickup ? 'pickup' : (fulfilment === 'delivery' && pincodeValid ? 'delivery' : undefined);
  const quotePincode = quoteMethod === 'delivery' ? form.pincode : undefined;

  useEffect(() => { fetchQuote(quoteMethod, quotePincode); }, [fetchQuote, quoteMethod, quotePincode, quoteRetry]);

  /* City, state and country from the pincode (India Post, through /api/pincode).
     Asked once per complete pincode, never per keystroke. Only a definite "no
     such pincode" stops the order; if the lookup is down, the customer simply
     types the city, because a third-party outage must never block a sale. */
  const [pinInfo, setPinInfo] = useState({ status: 'idle' });
  const [pinBlurred, setPinBlurred] = useState(false);
  const cityByHand = useRef(false);
  const pinSeq = useRef(0);
  const lookupPin = fulfilment === 'delivery' && pincodeValid ? form.pincode : '';

  useEffect(() => {
    if (!lookupPin) { setPinInfo({ status: 'idle' }); return undefined; }
    const seq = ++pinSeq.current;
    setPinInfo({ status: 'loading' });
    (async () => {
      let data = null;
      try {
        const res = await fetch(`/api/pincode?pin=${encodeURIComponent(lookupPin)}`);
        data = res.ok ? await res.json() : null; // 429 or 5xx: treat as unavailable
      } catch (_) { data = null; }
      if (seq !== pinSeq.current) return;
      if (data && data.ok && data.found) {
        setPinInfo({ status: 'found', city: data.city, state: data.state, country: data.country || 'India' });
        // Fill the city unless the customer typed their own.
        if (data.city && !cityByHand.current) setForm((f) => ({ ...f, city: data.city }));
      } else if (data && data.ok && data.found === false) {
        setPinInfo({ status: 'notfound' });
      } else {
        setPinInfo({ status: 'unavailable' });
      }
    })();
    return undefined;
  }, [lookupPin]);

  /* begin_checkout once per visit to this page, as soon as there is a real priced
     cart, not on every pincode keystroke that re-quotes it. */
  const beganCheckout = useRef(false);
  useEffect(() => {
    if (beganCheckout.current || !quote || !quote.ok) return;
    beganCheckout.current = true;
    trackBeginCheckout(quote.lines, quote.totalPaise);
  }, [quote]);

  const set = (id) => (e) => {
    const { value } = e.target;
    // A city typed (or cleared) by the customer is theirs: the lookup stops filling it.
    if (id === 'city') cityByHand.current = value.trim() !== '';
    setForm((f) => ({ ...f, [id]: value }));
  };

  const pay = async () => {
    setErrors([]); setPaying(true);
    /* Once the Razorpay window is open, its handler and ondismiss own `paying`.
       Until then, every way out (a refused order, a dropped request) must give
       the button back. Keying that on window.Razorpay was wrong: the script is
       loaded before create-order is even asked, so a refusal left Pay stuck on
       "Opening payment" until a reload. */
    let opened = false;
    try {
      const ok = await loadRazorpay();
      if (!ok) { setErrors(['Could not load the payment window. Check your connection and try again.']); return; }

      /* A pickup sends no address. The fields stay filled on the page, in case
         the customer switches back, but nothing typed for an earlier delivery
         attempt travels with a pickup order. */
      const { name, phone, email, address, city, pincode, notes } = form;
      const customer = pickup
        ? { name, phone, email, notes }
        : { name, phone, email, address, city, pincode, notes };
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines, fulfilment, customer, turnstileToken: tsToken || undefined }),
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
              // Consent-gated: GA4 plus the site's own funnel. Server amounts only.
              trackPurchase({
                orderNumber: out.orderNumber,
                amountPaise: out.amountPaise,
                shippingPaise: quote ? quote.shippingPaise : 0,
                lines: quote ? quote.lines : [],
              });
              clearCart();
              setDone({ orderNumber: out.orderNumber, amountPaise: out.amountPaise, testMode: quote && quote.testMode, pickup });
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
      opened = true;
      return; // handler and ondismiss own `paying` from here
    } catch (_) {
      setErrors(['Something went wrong starting the payment.']);
    } finally {
      if (!opened) setPaying(false);
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
          Paid {rupees(done.amountPaise)}.{' '}
          {done.pickup
            ? 'We will WhatsApp you when it is ready to collect from Lodha Belmondo.'
            : 'We will message you on WhatsApp to confirm delivery.'}{' '}
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

  const d = quote && quote.delivery;
  const itemCount = quote ? quote.lines.reduce((n, l) => n + l.qty, 0) : 0;
  /* A quote only answers the choice on screen when its method matches it. While
     a re-quote for a new choice is in flight the old one is still showing, and
     it must not be payable. */
  const quoteFits = !!(fulfilment && quote && quote.ok && d
    && (pickup ? d.method === 'pickup' : d.method !== 'pickup'));
  // Porter/Rapido or courier: a real fare, but not part of what is paid now.
  const fareLater = quoteFits && !d.chargedOnline;

  // India Post says this pincode does not exist: nothing can be delivered to it.
  const pinNotFound = !pickup && pinInfo.status === 'notfound';

  const canPay = !paying && !quoting && !!fulfilment && quoteFits
    && form.name.trim() && form.phone.trim()
    && (pickup || (pincodeValid && !pinNotFound && form.address.trim() && form.city.trim()))
    && (!tsKey || !!tsToken);

  let deliveryLine;
  if (quoteFits) deliveryLine = [d.label, chargeText(d)];
  else if (!fulfilment) deliveryLine = ['Delivery or pickup', 'Not chosen yet'];
  else if (!pickup && !pincodeValid) deliveryLine = ['Delivery', 'Enter pincode'];
  else deliveryLine = [pickup ? 'Pickup' : 'Delivery', 'Checking'];

  let payHint = '';
  if (!fulfilment) payHint = 'Choose delivery or pickup to continue.';
  else if (!pickup && !pincodeValid) payHint = 'Enter your pincode to see the delivery charge.';
  else if (pinNotFound) payHint = 'Check your pincode to continue.';

  // Shown once the customer has left the field, not while they are still typing.
  const pinFormatError = !pickup && pinBlurred && form.pincode !== '' && !pincodeValid;

  const field = (f) => (
    <label key={f.id} className="njco-field">
      <span className="njco-field-label">
        {f.label}
        {f.info && <InfoTip label={f.info.label}>{f.info.text}</InfoTip>}
      </span>
      {f.type === 'textarea' ? (
        <textarea rows={3} value={form[f.id]} onChange={set(f.id)} placeholder={f.placeholder} autoComplete={f.autoComplete} maxLength={f.maxLength} />
      ) : (
        <input
          type={f.type}
          value={form[f.id]}
          onChange={set(f.id)}
          onBlur={f.id === 'pincode' ? () => setPinBlurred(true) : undefined}
          placeholder={f.placeholder}
          autoComplete={f.autoComplete}
          inputMode={f.inputMode}
          maxLength={f.maxLength}
          aria-invalid={f.id === 'pincode' && (pinFormatError || pinNotFound) ? true : undefined}
        />
      )}
    </label>
  );

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
            {/* The saving on MRP, from the same struck-through prices the product
                pages show. Display only: the server never charges from it. */}
            {quote.discountPaise > 0 ? (
              <>
                <div data-testid="mrp-line">
                  <span>MRP ({itemCount} item{itemCount === 1 ? '' : 's'})</span>
                  <span>{quote.mrpTotalDisplay}</span>
                </div>
                <div className="njco-discount" data-testid="discount-line">
                  <span>Discount on MRP</span>
                  <span>&minus;{quote.discountDisplay}</span>
                </div>
              </>
            ) : (
              <div><span>Items</span><span>{quote.itemsDisplay}</span></div>
            )}
            <div className={`njco-delivery-line${quoteFits ? '' : ' is-pending'}`} data-testid="delivery-line">
              <span>{deliveryLine[0]}</span>
              <span>{deliveryLine[1]}</span>
            </div>
            {/* Every rupee of the payment on its own line, as an amount. */}
            {/* A fee of zero is not a line: the zero-fees banner below says it. */}
            {(quote.fees || []).filter((fee) => fee.paise > 0).map((fee) => <FeeRow key={fee.id} fee={fee} />)}
            <div className="njco-grand"><span>{fareLater ? 'Total to pay now' : 'Total'}</span><span>{quote.totalDisplay}</span></div>
            {/* The server's own words for a fare settled on WhatsApp. It says
                the fare is not in this total, which is the point of showing it. */}
            {fareLater && d.note && <p className="njco-note">{d.note}</p>}
            {quote.discountPaise > 0 && (
              <p className="njco-saving" data-testid="saving">You save {quote.discountDisplay} on MRP with this order</p>
            )}
            {/* Only when the server's own quote charges no fee at all, so the
                line can never be shown on an order that pays one. */}
            {(quote.fees || []).every((fee) => fee.paise === 0) && (
              <p className="njco-nofees" data-testid="no-fees">
                <CheckCircle2 size={16} aria-hidden="true" /> {feeRules.NO_FEES_MESSAGE}
              </p>
            )}
          </div>
        )}
        {!quote && quoting && <p className="njco-muted">Working out your total.</p>}
      </section>

      {/* Never submit on Enter. On a phone the keyboard's Go key submits the
          form, and wiring that to pay() opened the payment window without the
          customer deciding to pay. Paying must be a deliberate tap on the
          button below and nothing else. */}
      <form className="njco-form" aria-label="Your details" onSubmit={(e) => e.preventDefault()}>
        {/* Native radios: arrow keys move between them and the whole card is
            the tap target. No default, so nothing is chosen for the customer. */}
        <fieldset className="njco-choice">
          <legend>How would you like it?</legend>
          <div className="njco-options">
            {METHODS.map((m) => (
              <label key={m.id} className={`njco-option${fulfilment === m.id ? ' is-on' : ''}`}>
                <input
                  type="radio"
                  name="fulfilment"
                  value={m.id}
                  checked={fulfilment === m.id}
                  onChange={() => setFulfilment(m.id)}
                  required
                  aria-labelledby={`njco-m-${m.id}`}
                  aria-describedby={`njco-m-${m.id}-sub`}
                />
                <span className="njco-option-text">
                  <span id={`njco-m-${m.id}`} className="njco-option-title">{m.title}</span>
                  <span id={`njco-m-${m.id}-sub`} className="njco-option-sub">{m.sub}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {pickup && quoteFits && d.note && <p className="njco-charge">{d.note}</p>}

        {fulfilment === 'delivery' && (
          <>
            <div className="njco-field-group">
              {field(PINCODE_FIELD)}
              {/* What India Post says about the pincode, then the delivery charge.
                  Both right under the field, because on a phone the summary has
                  scrolled out of sight by now. */}
              {pinFormatError && <p className="njco-pin-error" role="alert">Enter a valid 6 digit pincode.</p>}
              {pinNotFound && <p className="njco-pin-error" role="alert">We could not find this pincode. Please check it.</p>}
              {pinInfo.status === 'found' && (
                <p className="njco-pin-place" data-testid="pin-place">
                  {[pinInfo.city, pinInfo.state].filter(Boolean).join(', ')}
                </p>
              )}
              <p className="njco-charge" role="status">
                {quoteFits && !pinNotFound && (
                  <>
                    {d.label}: <strong>{chargeText(d)}</strong>
                    {fareLater ? ', not part of the total you pay now' : ''}
                  </>
                )}
              </p>
            </div>
            {ADDRESS_FIELDS.map(field)}
            {/* Every pincode this shop takes is Indian, so this is never a choice. */}
            <label className="njco-field">
              <span className="njco-field-label">Country</span>
              <input type="text" value="India" readOnly aria-readonly="true" className="njco-readonly" tabIndex={-1} />
            </label>
          </>
        )}

        {CONTACT_FIELDS.map(field)}
        {field(NOTES_FIELD)}

        {errors.length > 0 && (
          <div className="njco-errors" role="alert">
            {errors.map((e, i) => <p key={i}><AlertCircle size={15} /> {e}</p>)}
            {quoteNetFail && (
              <button type="button" className="njco-retry" onClick={() => setQuoteRetry((n) => n + 1)} disabled={quoting}>
                Try again
              </button>
            )}
          </div>
        )}

        {tsKey && <div ref={tsBox} className="njco-turnstile" aria-label="Security check" />}

        <div className="njco-pay">
          {payHint && <p className="njco-hint" id="njco-pay-hint">{payHint}</p>}
          <button
            type="button"
            onClick={pay}
            className="njco-btn njco-btn-primary njco-btn-pay"
            disabled={!canPay}
            aria-describedby={payHint ? 'njco-pay-hint' : undefined}
          >
            {paying ? <><Loader2 size={18} className="njco-spin" /> Opening payment</> : <>Pay {quote ? quote.totalDisplay : ''}</>}
          </button>
          <p className="njco-secure"><ShieldCheck size={14} /> Payment handled by Razorpay. We never see your card details.</p>
        </div>
      </form>
    </main>
  );
}
