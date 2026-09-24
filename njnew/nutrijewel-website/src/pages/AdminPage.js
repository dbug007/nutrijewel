import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Package, Truck, CheckCircle2, XCircle, LogOut, Phone, MapPin, AlertCircle, Trash2, RotateCcw } from 'lucide-react';
import Dashboard from '../components/admin/Dashboard';
import GoogleSignIn, { googleSignOut } from '../components/admin/GoogleSignIn';
import './AdminPage.css';

/*
 * Order desk. Phone first: this gets opened standing in a kitchen far more often
 * than sitting at a Mac, so the primary layout is a single column of cards with
 * large tap targets, and the desktop layout is the adaptation.
 *
 * The token here is a convenience, not the security boundary. Cloudflare Access
 * sits in front of /admin and /api/admin/*; the token is the second layer that
 * keeps the endpoints shut if Access is ever misconfigured. It is kept in
 * localStorage so the page survives a refresh, and never leaves this origin.
 */

const TOKEN_KEY = 'nj_admin_token';
const TAB_KEY = 'nj_admin_tab';

const STATUS_LABEL = {
  created: 'Awaiting payment',
  paid: 'Paid, new',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  failed: 'Payment failed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const ACTION_ICON = {
  confirmed: CheckCircle2,
  packed: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

/* Orders that have taken money, and so have money that can be given back. */
const REFUNDABLE = ['paid', 'confirmed', 'packed', 'shipped', 'delivered'];

const FILTERS = [
  { id: 'paid', label: 'New' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'packed', label: 'Packed' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: '', label: 'All' },
];

const rupees = (paise) => `₹${((paise || 0) / 100).toLocaleString('en-IN')}`;

const when = (iso) => {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};

export default function AdminPage() {
  const [token, setToken] = useState(() => {
    try { return window.localStorage.getItem(TOKEN_KEY) || ''; } catch (_) { return ''; }
  });
  const [draftToken, setDraftToken] = useState('');
  /* 'checking' until the server says which sign in is on. In 'google' mode the
     session lives in an HttpOnly cookie the page cannot read, so the page only
     knows what the server tells it: signed in or not, and as whom. */
  const [auth, setAuth] = useState({ mode: 'checking', clientId: null, signedIn: false, email: null });
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('paid');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  // Dashboard for the overview, Orders for the day's work. Remembered per device.
  const [tab, setTab] = useState(() => {
    try { return window.localStorage.getItem(TAB_KEY) || 'dashboard'; } catch (_) { return 'dashboard'; }
  });
  const chooseTab = (t) => {
    setTab(t);
    try { window.localStorage.setItem(TAB_KEY, t); } catch (_) { /* ignore */ }
  };

  const authed = (auth.mode === 'google' && auth.signedIn) || (auth.mode === 'token' && !!token);

  useEffect(() => {
    fetch('/api/admin/session', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((d) => setAuth(d.googleSignIn
        ? { mode: 'google', clientId: d.googleClientId, signedIn: !!d.signedIn, email: d.email || null }
        : { mode: 'token', clientId: null, signedIn: false, email: null }))
      .catch(() => setAuth({ mode: 'token', clientId: null, signedIn: false, email: null }));
  }, []);

  const api = useCallback(async (path, options = {}) => {
    const res = await fetch(path, {
      ...options,
      credentials: 'same-origin', // carries the session cookie in Google mode
      headers: {
        // The token is only sent in token mode. In Google mode the server ignores
        // it anyway, and it should not travel where it is not needed.
        ...(auth.mode === 'token' ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error((data.errors && data.errors[0]) || `Request failed (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return data;
  }, [token, auth.mode]);

  const load = useCallback(async () => {
    if (!authed) return;
    setLoading(true); setError('');
    try {
      const qs = filter ? `?status=${encodeURIComponent(filter)}` : '';
      const [o, s] = await Promise.all([api(`/api/admin/orders${qs}`), api('/api/admin/stats')]);
      setOrders(o.orders || []);
      setStats(s.stats || null);
    } catch (e) {
      setError(e.message);
      // A bad token is worth clearing, so the next load shows the sign-in again
      // rather than failing silently forever.
      if (e.status === 401) {
        if (auth.mode === 'google') {
          setAuth((a) => ({ ...a, signedIn: false, email: null })); // session expired, sign in again
        } else {
          try { window.localStorage.removeItem(TOKEN_KEY); } catch (_) { /* ignore */ }
          setToken('');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [api, filter, authed, auth.mode]);

  useEffect(() => { load(); }, [load]);

  const signIn = (e) => {
    e.preventDefault();
    const t = draftToken.trim();
    if (!t) return;
    try { window.localStorage.setItem(TOKEN_KEY, t); } catch (_) { /* ignore */ }
    setToken(t); setDraftToken('');
  };

  /* Exchange Google's signed ID token for a session cookie. The server decides
     whether this Google account is the owner; the page does not. */
  const onGoogleCredential = useCallback(async (credential) => {
    setError('');
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError((d.errors && d.errors[0]) || 'Sign in failed.'); return; }
      setAuth((a) => ({ ...a, signedIn: true, email: d.email }));
    } catch (_) {
      setError('Could not reach the server.');
    }
  }, []);

  const signOut = async () => {
    if (auth.mode === 'google') {
      await fetch('/api/admin/session', { method: 'DELETE', credentials: 'same-origin' }).catch(() => {});
      googleSignOut();
      setAuth((a) => ({ ...a, signedIn: false, email: null }));
    } else {
      try { window.localStorage.removeItem(TOKEN_KEY); } catch (_) { /* ignore */ }
      setToken('');
    }
    setOrders([]); setStats(null);
  };

  /* Abandoned orders are people who opened the payment window and left. They
     are not work, but they look like work until they are cleared. */
  const sweep = async () => {
    if (!window.confirm('Mark unpaid orders older than 6 hours as failed?')) return;
    setError('');
    try {
      const out = await api('/api/admin/sweep', { method: 'POST', body: JSON.stringify({ hours: 6 }) });
      await load();
      if (out.swept === 0) setError('Nothing to clear.');
    } catch (e) { setError(e.message); }
  };

  /* Refunds go through Razorpay and only then change the status here. The
     confirm names the exact amount and the customer, because this one moves
     real money and cannot be undone from this screen. */
  const refund = async (order) => {
    const ok = window.confirm(
      `Refund ${rupees(order.total_paise)} to ${order.customer_name} for ${order.order_number}?

` +
      'This returns the money through Razorpay and cannot be undone here.'
    );
    if (!ok) return;
    setBusyId(order.id); setError('');
    try {
      const out = await api('/api/admin/refund', { method: 'POST', body: JSON.stringify({ orderId: order.id }) });
      await load();
      setError(`Refunded ${rupees(out.amountPaise)} for ${out.orderNumber}. Razorpay reference ${out.refundId}.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const move = async (order, toStatus) => {
    setBusyId(order.id); setError('');
    try {
      await api('/api/admin/orders', { method: 'POST', body: JSON.stringify({ orderId: order.id, toStatus }) });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  if (auth.mode === 'checking') {
    return <main className="njad"><p className="njad-muted njad-signin">Checking sign in…</p></main>;
  }

  if (auth.mode === 'google' && !auth.signedIn) {
    return (
      <main className="njad">
        <section className="njad-signin">
          <h1>NutriJewel orders</h1>
          <p className="njad-muted">Sign in with the Google account that owns this shop.</p>
          <GoogleSignIn clientId={auth.clientId} onCredential={onGoogleCredential} onError={setError} />
          {error && <p className="njad-error"><AlertCircle size={16} /> {error}</p>}
        </section>
      </main>
    );
  }

  if (auth.mode === 'token' && !token) {
    return (
      <main className="njad">
        <form className="njad-signin" onSubmit={signIn}>
          <h1>NutriJewel orders</h1>
          <p className="njad-muted">Enter the admin token to continue.</p>
          <input
            type="password"
            className="njad-input"
            value={draftToken}
            onChange={(e) => setDraftToken(e.target.value)}
            placeholder="Admin token"
            autoComplete="current-password"
            aria-label="Admin token"
          />
          <button type="submit" className="njad-btn njad-btn-primary">Open orders</button>
          {error && <p className="njad-error"><AlertCircle size={16} /> {error}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="njad">
      <header className="njad-head">
        <div>
          <h1>NutriJewel</h1>
          {auth.mode === 'google' && auth.email && <p className="njad-muted njad-small">Signed in as {auth.email}</p>}
          {stats && (
            <p className="njad-muted">
              {stats.today_orders || 0} today, {rupees(stats.today_paise)}
            </p>
          )}
        </div>
        <div className="njad-head-actions">
          <button className="njad-icon-btn" onClick={load} disabled={loading} aria-label="Refresh">
            <RefreshCw size={18} className={loading ? 'njad-spin' : ''} />
          </button>
          <button className="njad-icon-btn" onClick={sweep} disabled={loading} aria-label="Clear abandoned orders" title="Clear abandoned orders">
            <Trash2 size={18} />
          </button>
          <button className="njad-icon-btn" onClick={signOut} aria-label="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <nav className="njad-tabs" role="tablist" aria-label="Admin sections">
        <button type="button" role="tab" aria-selected={tab === 'dashboard'}
          className={`njad-tab${tab === 'dashboard' ? ' is-on' : ''}`} onClick={() => chooseTab('dashboard')}>Dashboard</button>
        <button type="button" role="tab" aria-selected={tab === 'orders'}
          className={`njad-tab${tab === 'orders' ? ' is-on' : ''}`} onClick={() => chooseTab('orders')}>
          Orders
          {stats && stats.needs_action > 0 && <span className="njad-badge" aria-label={`${stats.needs_action} waiting`}>{stats.needs_action}</span>}
        </button>
      </nav>

      {tab === 'dashboard' ? <Dashboard api={api} /> : (<>
      {stats && (
        <section className="njad-stats" aria-label="Summary">
          <div className="njad-stat"><span className="njad-stat-n">{stats.needs_action || 0}</span><span className="njad-stat-l">To action</span></div>
          <div className="njad-stat"><span className="njad-stat-n">{stats.to_ship || 0}</span><span className="njad-stat-l">To ship</span></div>
          <div className="njad-stat"><span className="njad-stat-n">{stats.paid_orders || 0}</span><span className="njad-stat-l">Orders</span></div>
          <div className="njad-stat"><span className="njad-stat-n">{rupees(stats.revenue_paise)}</span><span className="njad-stat-l">Revenue</span></div>
        </section>
      )}

      {stats && (stats.amount_mismatches > 0 || stats.signature_failures > 0 || stats.refund_failures > 0) && (
        <section className="njad-alert" role="alert">
          <AlertCircle size={18} />
          <div>
            <strong>Needs your attention</strong>
            {stats.amount_mismatches > 0 && (
              <p>{stats.amount_mismatches} payment{stats.amount_mismatches === 1 ? '' : 's'} arrived for a different amount than was charged. Those orders were not marked paid. Check them in the Razorpay dashboard.</p>
            )}
            {stats.signature_failures > 0 && (
              <p>{stats.signature_failures} payment confirmation{stats.signature_failures === 1 ? '' : 's'} failed the signature check. That is either a bug or someone forging a success.</p>
            )}
            {stats.refund_failures > 0 && (
              <p>{stats.refund_failures} refund{stats.refund_failures === 1 ? '' : 's'} failed at Razorpay. The customer has not been refunded.</p>
            )}
          </div>
        </section>
      )}

      <nav className="njad-filters" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f.id || 'all'}
            className={`njad-chip${filter === f.id ? ' is-on' : ''}`}
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
          >
            {f.label}
            {f.id === 'paid' && stats && stats.needs_action > 0 && (
              <span className="njad-badge" aria-label={`${stats.needs_action} waiting`}>{stats.needs_action}</span>
            )}
          </button>
        ))}
      </nav>

      {error && <p className="njad-error"><AlertCircle size={16} /> {error}</p>}

      {!loading && orders.length === 0 && (
        <p className="njad-empty">Nothing here yet.</p>
      )}

      <ul className="njad-list">
        {orders.map((o) => (
          <li key={o.id} className="njad-card">
            <div className="njad-card-top">
              <div>
                <p className="njad-num">{o.order_number}</p>
                <p className="njad-muted njad-small">{when(o.created_at)}</p>
              </div>
              <div className="njad-card-right">
                <span className={`njad-pill njad-pill--${o.status}`}>{STATUS_LABEL[o.status] || o.status}</span>
                <p className="njad-total">{rupees(o.total_paise)}</p>
              </div>
            </div>

            <div className="njad-who">
              <p className="njad-name">{o.customer_name}</p>
              <a className="njad-link" href={`tel:${o.customer_phone}`}><Phone size={14} /> {o.customer_phone}</a>
              <p className="njad-addr"><MapPin size={14} /> {o.address_line}, {o.city} {o.pincode}</p>
              <p className="njad-muted njad-small">
                {o.item_count} item{o.item_count === 1 ? '' : 's'}
                {o.shipping_paise > 0 ? `, ${rupees(o.shipping_paise)} delivery` : ', free delivery'}
              </p>
            </div>

            {o.items && o.items.length > 0 && (
              <ul className="njad-items">
                {o.items.map((it, i) => (
                  <li key={i}>
                    <span>{it.product_name} <em>{it.weight}</em></span>
                    <span className="njad-qty">x{it.qty}</span>
                  </li>
                ))}
              </ul>
            )}

            {(o.nextStatuses && o.nextStatuses.length > 0) || (REFUNDABLE.includes(o.status) && o.razorpay_payment_id) ? (
              <div className="njad-actions">
                {(o.nextStatuses || []).map((next) => {
                  const Icon = ACTION_ICON[next] || CheckCircle2;
                  const danger = next === 'cancelled';
                  return (
                    <button
                      key={next}
                      className={`njad-btn${danger ? ' njad-btn-danger' : ' njad-btn-primary'}`}
                      onClick={() => move(o, next)}
                      disabled={busyId === o.id}
                    >
                      <Icon size={16} /> {danger ? 'Cancel' : `Mark ${next}`}
                    </button>
                  );
                })}
                {REFUNDABLE.includes(o.status) && o.razorpay_payment_id && (
                  <button
                    className="njad-btn njad-btn-danger"
                    onClick={() => refund(o)}
                    disabled={busyId === o.id}
                  >
                    <RotateCcw size={16} /> Refund
                  </button>
                )}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      </>)}
    </main>
  );
}
