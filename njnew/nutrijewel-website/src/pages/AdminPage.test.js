import React from 'react';
import { render, screen, within } from '@testing-library/react';
import AdminPage from './AdminPage';

/* The order cards, as the owner sees them on a phone. What matters: nobody
   books a rider for a pickup, a Porter/Rapido fare still to arrange cannot be
   missed, and nothing ever calls a delivery free. The server is stubbed with
   the shape functions/api/admin/orders.js returns (delivery from describeZone
   in src/data/shippingZones.js). */

const order = (over) => ({
  id: over.order_number,
  status: 'paid',
  items_paise: 50000,
  shipping_paise: 0,
  total_paise: 50000,
  customer_name: 'Asha Patil',
  customer_phone: '9876543210',
  customer_email: null,
  address_line: '12 Lane Five, Baner',
  city: 'Pune',
  pincode: '411045',
  shipping_zone: 'pune-app-fare',
  fulfilment: 'delivery',
  notes: null,
  razorpay_payment_id: 'pay_test',
  paid_at: '2026-09-25 10:01:00',
  created_at: '2026-09-25 10:00:00',
  item_count: 1,
  items: [{ product_name: 'Golden Bites', weight: '250g', qty: 1, line_paise: 50000 }],
  nextStatuses: ['confirmed', 'cancelled'],
  delivery: { method: 'variable', label: 'Porter/Rapido fare to arrange', fareToCollect: true },
  ...over,
});

const ORDERS = [
  order({
    order_number: 'NJ-2609-PICK',
    status: 'packed',
    fulfilment: 'pickup',
    shipping_zone: 'pickup-lodha-belmondo',
    address_line: '', city: '', pincode: '',
    notes: 'Will collect after 6pm',
    nextStatuses: ['delivered', 'cancelled'],
    delivery: { method: 'pickup', label: 'Pickup at Lodha Belmondo', fareToCollect: false },
  }),
  order({
    order_number: 'NJ-2609-FIXD',
    status: 'packed',
    shipping_zone: 'delivery-412101',
    pincode: '412101',
    shipping_paise: 6600,
    total_paise: 56600,
    nextStatuses: ['shipped', 'cancelled'],
    delivery: { method: 'fixed', label: 'Delivery, ₹66 paid', fareToCollect: false },
  }),
  order({ order_number: 'NJ-2609-FARE' }),
  order({
    order_number: 'NJ-2609-OLDD',
    shipping_zone: 'pune-local',
    pincode: '411001',
    delivery: { method: 'legacy', label: 'Delivery (older order)', fareToCollect: false },
  }),
  // Already delivered by Porter/Rapido: nothing left to arrange.
  order({ order_number: 'NJ-2609-DONE', status: 'delivered', nextStatuses: [] }),
  // Never paid: a fixed fee was quoted, but no money was taken.
  order({
    order_number: 'NJ-2609-UNPD',
    status: 'created',
    razorpay_payment_id: null,
    paid_at: null,
    shipping_zone: 'delivery-411014-411005',
    pincode: '411005',
    shipping_paise: 14900,
    total_paise: 64900,
    nextStatuses: ['cancelled'],
    delivery: { method: 'fixed', label: 'Delivery, ₹149 paid', fareToCollect: false },
  }),
];

const respond = (data) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) });

const realFetch = global.fetch;

beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem('nj_admin_token', 'test-token');
  window.localStorage.setItem('nj_admin_tab', 'orders');
  global.fetch = jest.fn((url) => {
    if (url.startsWith('/api/admin/session')) return respond({ googleSignIn: false });
    if (url.startsWith('/api/admin/orders')) return respond({ ok: true, orders: ORDERS });
    if (url.startsWith('/api/admin/stats')) return respond({ ok: true, stats: { needs_action: 1 } });
    return Promise.reject(new Error(`Unexpected request ${url}`));
  });
});

afterEach(() => { global.fetch = realFetch; });

const openOrders = async () => {
  render(<AdminPage />);
  await screen.findByText('NJ-2609-PICK');
};

/* Each card is a list item named by its order number. */
const card = (number) => screen.getByRole('listitem', { name: number });

describe('AdminPage order cards', () => {
  it('shows a pickup as Pickup, Lodha Belmondo with no address to send a rider to', async () => {
    await openOrders();
    const c = within(card('NJ-2609-PICK'));

    expect(c.getByText('Pickup, Lodha Belmondo')).toBeInTheDocument();
    // A pickup's address is stored empty, so an address line would render as a bare comma.
    expect(c.queryByText(',')).toBeNull();
    expect(c.getByText(/1 item, free pickup/)).toBeInTheDocument();
    expect(c.getByText(/will collect after 6pm/i)).toBeInTheDocument();
    expect(c.getByRole('link', { name: /whatsapp/i }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/919876543210\?/);
  });

  it('labels a pickup as Ready for pickup, then Collected, never shipped', async () => {
    await openOrders();
    const c = within(card('NJ-2609-PICK'));

    expect(c.getByText('Ready for pickup')).toBeInTheDocument();
    expect(c.getByRole('button', { name: /mark collected/i })).toBeInTheDocument();
    expect(c.queryByRole('button', { name: /mark delivered/i })).toBeNull();
    expect(c.queryByRole('button', { name: /shipped/i })).toBeNull();
  });

  it('keeps the delivery words on a delivery at the same status', async () => {
    await openOrders();
    const c = within(card('NJ-2609-FIXD'));

    expect(c.getByText('Packed')).toBeInTheDocument();
    expect(c.getByRole('button', { name: /mark shipped/i })).toBeInTheDocument();
    expect(c.queryByText(/ready for pickup/i)).toBeNull();
  });

  it('shows what a fixed rate delivery paid, with the address', async () => {
    await openOrders();
    const c = within(card('NJ-2609-FIXD'));

    expect(c.getByText('Delivery ₹66 paid')).toBeInTheDocument();
    expect(c.getByText(/Pune 412101/)).toBeInTheDocument();
    expect(c.getByText(/1 item, ₹66 delivery/)).toBeInTheDocument();
  });

  it('flags a Porter/Rapido fare that is not in the total', async () => {
    await openOrders();
    const c = within(card('NJ-2609-FARE'));

    expect(c.getByText('Porter/Rapido fare to arrange')).toBeInTheDocument();
    expect(c.getByText(/not in the total paid/i)).toBeInTheDocument();
    expect(c.getByText(/Baner, Pune 411045/)).toBeInTheDocument();
  });

  it('keeps an older order on its address with a neutral label', async () => {
    await openOrders();
    const c = within(card('NJ-2609-OLDD'));

    expect(c.getByText('Delivery (older order)')).toBeInTheDocument();
    expect(c.getByText(/Pune 411001/)).toBeInTheDocument();
    expect(c.getByText(/1 item, no delivery charge/)).toBeInTheDocument();
  });

  it('never calls a delivery free', async () => {
    await openOrders();
    expect(document.body).not.toHaveTextContent(/free delivery/i);
  });

  it('stops asking for a fare once the order has been delivered', async () => {
    await openOrders();
    const c = within(card('NJ-2609-DONE'));

    expect(c.queryByText(/fare to arrange/i)).toBeNull();
    expect(c.queryByText(/confirm it with the customer/i)).toBeNull();
    expect(c.getByText('Delivery by Porter/Rapido')).toBeInTheDocument();
    // Its fare was settled outside the payment, so this must not claim there was none.
    expect(c.queryByText(/no delivery charge/i)).toBeNull();
  });

  it('never says a fee was paid on an order that was never paid', async () => {
    await openOrders();
    const c = within(card('NJ-2609-UNPD'));

    expect(c.getByText('Delivery ₹149')).toBeInTheDocument();
    expect(c.queryByText(/₹149 paid/)).toBeNull();
  });
});
