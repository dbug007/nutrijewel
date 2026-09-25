import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from '../store/StoreContext';
import { trackBeginCheckout } from '../lib/analytics';
import CheckoutPage from './CheckoutPage';

jest.mock('../lib/analytics', () => ({
  trackBeginCheckout: jest.fn(),
  trackPurchase: jest.fn(),
  trackAddToCart: jest.fn(),
}));

const products = require('../data/products.data');
// The owner's rules, straight from the file the server prices with, so the
// stand-in server below cannot drift from the real one on what a pincode costs.
const zones = require('../data/shippingZones');
const feeRules = require('../data/fees');

const peanut = products.find((p) => p.id === 'peanut-butter');
const ITEMS_PAISE = 29900;
const rupees = (paise) => `₹${paise / 100}`;

/* /api/checkout/quote, answered the way functions/api/checkout/quote.js does.
   `override` lets one test hand the page a misbehaving delivery. */
let deliveryOverride = null;
function quoteResponse({ fulfilment, pincode }) {
  const routed = zones.deliveryFor({ fulfilment, pincode });
  if (!routed.ok) return { ok: false, errors: [routed.error] };
  let d = routed.delivery;
  if (d && d.method !== 'pickup' && deliveryOverride) d = { ...d, ...deliveryOverride };
  const shippingPaise = d && d.chargedOnline ? d.feePaise : 0;
  // Fees exactly as serverPricing computes them: on items plus online delivery.
  const f = feeRules.feesFor(ITEMS_PAISE + shippingPaise);
  const totalPaise = ITEMS_PAISE + shippingPaise + f.platformFeePaise + f.convenienceFeePaise;
  return {
    fees: [
      { id: 'platform', label: feeRules.PLATFORM_FEE_LABEL, paise: f.platformFeePaise, display: rupees(f.platformFeePaise), info: null },
      { id: 'convenience', label: feeRules.CONVENIENCE_FEE_LABEL, paise: f.convenienceFeePaise, display: rupees(f.convenienceFeePaise), info: feeRules.CONVENIENCE_FEE_INFO },
    ],
    ok: true,
    testMode: false,
    turnstileSiteKey: null,
    lines: [{
      productId: 'peanut-butter', name: '100% Peanut Butter', weight: peanut.weight, qty: 1,
      unitPaise: ITEMS_PAISE, linePaise: ITEMS_PAISE, unitDisplay: rupees(ITEMS_PAISE), lineDisplay: rupees(ITEMS_PAISE),
    }],
    itemsPaise: ITEMS_PAISE,
    shippingPaise,
    totalPaise,
    itemsDisplay: rupees(ITEMS_PAISE),
    shippingDisplay: d ? d.display : '',
    totalDisplay: rupees(totalPaise),
    delivery: d ? {
      id: d.id, method: d.method, label: d.label, display: d.display,
      note: d.note, feePaise: d.feePaise, chargedOnline: d.chargedOnline,
    } : null,
  };
}

/* What India Post knows, for the pincodes these tests type. */
const PLACES = {
  412101: { city: 'Pune', state: 'Maharashtra' },
  411014: { city: 'Pune', state: 'Maharashtra' },
  411038: { city: 'Pune', state: 'Maharashtra' },
  560001: { city: 'Bangalore', state: 'Karnataka' },
};
let pinReply;

const bodiesTo = (path) => global.fetch.mock.calls
  .filter(([url]) => url === path)
  .map(([, opts]) => JSON.parse(opts.body));
const quotes = () => bodiesTo('/api/checkout/quote');
const orders = () => bodiesTo('/api/checkout/create-order');

beforeEach(() => {
  window.localStorage.clear();
  // A real cart line, as the store saves it.
  window.localStorage.setItem('nj_store_v1', JSON.stringify({ cart: [{
    key: `peanut-butter__${peanut.weight}`, productId: 'peanut-butter', name: peanut.name,
    weight: peanut.weight, unitPrice: peanut.price, qty: 1,
  }], wishlist: [] }));
  deliveryOverride = null;
  trackBeginCheckout.mockClear();

  pinReply = (pin) => (PLACES[pin] ? { ok: true, found: true, ...PLACES[pin], country: 'India' } : { ok: true, found: false });
  global.fetch = jest.fn(async (url, opts) => {
    // GET /api/pincode?pin=..., answered like functions/api/pincode.js.
    if (url.startsWith('/api/pincode')) {
      const pin = new URL(url, 'http://x').searchParams.get('pin');
      const reply = pinReply(pin);
      if (reply instanceof Error) throw reply;
      return { ok: true, json: async () => reply };
    }
    const body = JSON.parse(opts.body);
    let data = { ok: false, errors: ['unexpected call'] };
    if (url === '/api/checkout/quote') data = quoteResponse(body);
    if (url === '/api/checkout/create-order') {
      data = {
        ok: true, orderNumber: 'NJ-2609-TEST', razorpayOrderId: 'order_test', amountPaise: 100,
        currency: 'INR', keyId: 'rzp_test_x', prefill: {},
      };
    }
    return { ok: true, json: async () => data };
  });

  // Loaded, so the page goes straight to create-order. Never opens anything real.
  window.Razorpay = jest.fn(function Razorpay() {
    this.on = jest.fn();
    this.open = jest.fn();
  });
});

afterEach(() => {
  delete global.fetch;
  delete window.Razorpay;
});

const renderCheckout = () => render(
  <StoreProvider>
    <MemoryRouter initialEntries={['/checkout']}>
      <Routes>
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </MemoryRouter>
  </StoreProvider>
);

const summary = () => screen.getByRole('region', { name: /order summary/i });
const payButton = () => screen.getByRole('button', { name: /^pay/i });
const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const choose = (name) => fireEvent.click(screen.getByRole('radio', { name }));
// The summary's delivery row, once it reads `label`. Label and charge share it.
const rowOf = async (label) => {
  await within(summary()).findByText(label);
  return within(summary()).getByTestId('delivery-line');
};
// Waits for the first quote, the items-only one, to land.
const ready = () => within(summary()).findByText('Not chosen yet');

describe('checkout: pickup or delivery', () => {
  it('keeps Pay disabled until the customer picks delivery or pickup', async () => {
    renderCheckout();
    await ready();

    // Nothing is chosen for them, and no address is asked for yet.
    screen.getAllByRole('radio').forEach((r) => expect(r).not.toBeChecked());
    expect(screen.queryByLabelText('Pincode')).not.toBeInTheDocument();
    expect(quotes()[0]).not.toHaveProperty('fulfilment');

    type('Full name', 'Asha Rao');
    type('Mobile number', '9876543210');
    expect(payButton()).toBeDisabled();
    expect(screen.getByText('Choose delivery or pickup to continue.')).toBeInTheDocument();

    fireEvent.click(payButton());
    expect(orders()).toHaveLength(0);
  });

  it('Free pickup drops the address, quotes pickup without a pincode, and needs only name and phone', async () => {
    renderCheckout();
    await ready();

    // A delivery attempt first, so there is an old address that could leak.
    choose('Delivery');
    type('Pincode', '412101');
    type('Delivery address', '12 Old Street, Kharadi');
    type('City', 'Pune');
    await rowOf('Delivery to 412101');

    choose('Free pickup');
    expect(screen.queryByLabelText('Pincode')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Delivery address')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('City')).not.toBeInTheDocument();

    const row = await rowOf('Pickup at Lodha Belmondo');
    expect(row).toHaveTextContent('Free');
    const asked = quotes()[quotes().length - 1];
    expect(asked.fulfilment).toBe('pickup');
    expect(asked).not.toHaveProperty('pincode');

    expect(payButton()).toBeDisabled();
    type('Full name', 'Asha Rao');
    expect(payButton()).toBeDisabled();
    type('Mobile number', '9876543210');
    expect(payButton()).toBeEnabled();

    fireEvent.click(payButton());
    await waitFor(() => expect(orders()).toHaveLength(1));
    const sent = orders()[0];
    expect(sent.fulfilment).toBe('pickup');
    expect(sent.customer).toMatchObject({ name: 'Asha Rao', phone: '9876543210' });
    expect(sent.customer).not.toHaveProperty('address');
    expect(sent.customer).not.toHaveProperty('city');
    expect(sent.customer).not.toHaveProperty('pincode');
  });

  it('Delivery to 412101 shows the ₹66 charge and sends the order as a delivery', async () => {
    renderCheckout();
    await ready();

    choose('Delivery');
    expect(screen.getByText('Enter your pincode to see the delivery charge.')).toBeInTheDocument();
    type('Pincode', '412101');

    const row = await rowOf('Delivery to 412101');
    expect(row).toHaveTextContent('₹66');
    // ₹299 + ₹66 delivery + ₹7 platform fee + ₹4 convenience fee.
    expect(within(summary()).getByText('₹376')).toBeInTheDocument();
    expect(quotes()[quotes().length - 1]).toMatchObject({ fulfilment: 'delivery', pincode: '412101' });

    type('Full name', 'Asha Rao');
    type('Mobile number', '9876543210');
    // Delivery also needs somewhere to deliver to.
    expect(payButton()).toBeDisabled();
    type('Delivery address', 'Flat 4, Green Park, Wagholi');
    type('City', 'Pune');
    type('Note for us (optional)', 'Ring the bell twice');
    expect(payButton()).toBeEnabled();
    expect(payButton()).toHaveTextContent('Pay ₹376');

    fireEvent.click(payButton());
    await waitFor(() => expect(orders()).toHaveLength(1));
    const sent = orders()[0];
    expect(sent.fulfilment).toBe('delivery');
    expect(sent.customer).toMatchObject({
      pincode: '412101', address: 'Flat 4, Green Park, Wagholi', city: 'Pune', notes: 'Ring the bell twice',
    });
    expect(window.Razorpay).toHaveBeenCalledTimes(1);
    // Re-quoting for each choice is still one begin_checkout.
    expect(trackBeginCheckout).toHaveBeenCalledTimes(1);
  });

  it('a Porter/Rapido fare shows its note, is kept out of the total, and is never called Free', async () => {
    renderCheckout();
    await ready();

    choose('Delivery');
    type('Pincode', '411001');

    const row = await rowOf('Delivery by Porter/Rapido');
    expect(row).toHaveTextContent('Actual fare');
    expect(row).not.toHaveTextContent(/free/i);

    const { note } = zones.deliveryFor({ fulfilment: 'delivery', pincode: '411001' }).delivery;
    expect(within(summary()).getByText(note)).toBeInTheDocument();
    expect(within(summary()).getByText('Total to pay now')).toBeInTheDocument();
    expect(within(summary()).queryByText('₹66')).not.toBeInTheDocument();

    // Anywhere on the page, Free belongs to the pickup option and nothing else.
    expect(screen.queryAllByText(/free/i).map((el) => el.textContent)).toEqual(['Free pickup']);
  });

  it.each([
    ['a fixed fee', '412101', '₹0'],
    ['a fare settled on WhatsApp', '411001', 'Confirmed on WhatsApp'],
  ])('never shows Free for %s, even if a quote says so', async (_, pincode, shown) => {
    deliveryOverride = { display: 'Free', feePaise: 0 };
    renderCheckout();
    await ready();

    choose('Delivery');
    type('Pincode', pincode);

    const label = zones.deliveryFor({ fulfilment: 'delivery', pincode }).delivery.label;
    const row = await rowOf(label);
    expect(row).toHaveTextContent(shown);
    expect(screen.queryAllByText(/free/i).map((el) => el.textContent)).toEqual(['Free pickup']);
  });

  it('pressing Enter or the Go key in a field never starts a payment', async () => {
    renderCheckout();
    await ready();

    choose('Free pickup');
    await rowOf('Pickup at Lodha Belmondo');
    type('Full name', 'Asha Rao');
    type('Mobile number', '9876543210');
    // Payable, so a submit wired to pay() would really call create-order.
    expect(payButton()).toBeEnabled();

    const phone = screen.getByLabelText('Mobile number');
    const form = screen.getByRole('form', { name: 'Your details' });
    fireEvent.keyDown(phone, { key: 'Enter', code: 'Enter', keyCode: 13 });
    fireEvent.keyUp(phone, { key: 'Enter', code: 'Enter', keyCode: 13 });
    // The Go key submits the form. The page must swallow that.
    expect(fireEvent.submit(form)).toBe(false);
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });

    expect(orders()).toHaveLength(0);
    expect(window.Razorpay).not.toHaveBeenCalled();
    // Implicit submission presses the form's submit button, so there must be
    // none: Pay and every other button in the form is type="button".
    expect(payButton()).toHaveAttribute('type', 'button');
    within(form).getAllByRole('button').forEach((b) => expect(b).toHaveAttribute('type', 'button'));
  });

  /* On a phone a request can drop. That used to clear the quote with nothing
     ever asking again, so Pay stayed disabled until the customer happened to
     change their choice. */
  it('after a dropped quote request, Try again re-asks and Pay becomes possible', async () => {
    renderCheckout();
    await ready();

    const real = global.fetch.getMockImplementation();
    let dropNext = true;
    global.fetch.mockImplementation(async (url, opts) => {
      if (url === '/api/checkout/quote' && dropNext) { dropNext = false; throw new TypeError('Failed to fetch'); }
      return real(url, opts);
    });

    choose('Free pickup');
    await screen.findByText(/could not reach the server/i);
    type('Full name', 'Asha Rao');
    type('Mobile number', '9876543210');
    expect(payButton()).toBeDisabled();
    const before = quotes().length;

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    const row = await rowOf('Pickup at Lodha Belmondo');
    expect(row).toHaveTextContent('Free');
    expect(quotes().length).toBe(before + 1);
    expect(quotes()[quotes().length - 1].fulfilment).toBe('pickup');
    expect(screen.queryByText(/could not reach the server/i)).not.toBeInTheDocument();
    expect(payButton()).toBeEnabled();
  });

  /* A refusal from create-order (a failed security check, a validation error)
     or a dropped request used to leave the button disabled on "Opening payment"
     until a reload, because the Razorpay script was already loaded. */
  it.each([
    ['refuses the order', () => ({ ok: true, json: async () => ({ ok: false, errors: ['Please complete the security check and try again.'] }) }), /security check/i],
    ['request drops', () => { throw new TypeError('Failed to fetch'); }, /went wrong starting the payment/i],
  ])('when create-order %s, the error shows and Pay can be tapped again', async (_label, reply, message) => {
    renderCheckout();
    await ready();
    const real = global.fetch.getMockImplementation();
    global.fetch.mockImplementation(async (url, opts) => (url === '/api/checkout/create-order' ? reply() : real(url, opts)));

    choose('Free pickup');
    await rowOf('Pickup at Lodha Belmondo');
    type('Full name', 'Asha Rao');
    type('Mobile number', '9876543210');
    fireEvent.click(payButton());

    await screen.findByText(message);
    await waitFor(() => expect(payButton()).toBeEnabled());
    expect(payButton()).not.toHaveTextContent(/opening payment/i);
    expect(window.Razorpay).not.toHaveBeenCalled();
  });

  it('breaks the total into items, delivery and both fees, as amounts that add up', async () => {
    renderCheckout();
    await ready();
    choose('Delivery');
    type('Pincode', '412101');
    await rowOf('Delivery to 412101');

    const platform = screen.getByTestId('fee-platform');
    const convenience = screen.getByTestId('fee-convenience');
    expect(platform).toHaveTextContent('Platform fee₹7');
    expect(convenience).toHaveTextContent('Convenience fee₹4');
    const amount = (el) => Number(el.textContent.replace(/[^0-9]/g, ''));
    const total = amount(within(summary()).getByText(/^Total/).parentElement);
    expect(total).toBe(299 + 66 + amount(platform) + amount(convenience));
    // The owner's call: amounts only, never the rate. (The totals block, not
    // the whole page: a product can be called "100% Peanut Butter".)
    const totals = platform.parentElement;
    expect(totals).toHaveClass('njco-totals');
    expect(totals.textContent).not.toMatch(/%|percent/i);
    expect(screen.getByRole('button', { name: /^pay/i }).textContent).not.toMatch(/%/);
  });

  it('explains the convenience fee behind its (i), in the three owner-approved points', async () => {
    renderCheckout();
    await ready();
    choose('Free pickup');
    await rowOf('Pickup at Lodha Belmondo');

    const tip = screen.getByRole('button', { name: /what is the convenience fee/i });
    expect(tip).toHaveAttribute('aria-expanded', 'false');
    feeRules.CONVENIENCE_FEE_INFO.forEach((line) => expect(screen.getByText(line)).not.toBeVisible());
    fireEvent.click(tip);
    expect(tip).toHaveAttribute('aria-expanded', 'true');
    feeRules.CONVENIENCE_FEE_INFO.forEach((line) => expect(screen.getByText(line)).toBeVisible());
    // Opening it must not start a payment or submit anything.
    expect(orders()).toHaveLength(0);
    fireEvent.click(tip);
    feeRules.CONVENIENCE_FEE_INFO.forEach((line) => expect(screen.getByText(line)).not.toBeVisible());
    // Only the convenience fee has one.
    expect(screen.queryByRole('button', { name: /what is the platform fee/i })).not.toBeInTheDocument();
  });

  it('uses neutral placeholders and explains why to give an email', async () => {
    renderCheckout();
    await ready();
    expect(screen.getByLabelText('Full name')).toHaveAttribute('placeholder', 'Full name');
    expect(screen.getByLabelText('Mobile number')).toHaveAttribute('placeholder', 'e.g. 98765 43210');
    expect(document.body.innerHTML).not.toMatch(/Ruchika Bachwani/);
    fireEvent.click(screen.getByRole('button', { name: /why give your email/i }));
    expect(screen.getByText('Write your email to receive your order details.')).toBeVisible();
  });

  it('fills in the city and country from the pincode, without overwriting a city typed by hand', async () => {
    renderCheckout();
    await ready();
    choose('Delivery');
    type('Pincode', '412101');
    expect(await screen.findByTestId('pin-place')).toHaveTextContent('Pune, Maharashtra');
    expect(screen.getByLabelText('City')).toHaveValue('Pune');
    expect(screen.getByLabelText('Country')).toHaveValue('India');
    // Looked up once for the whole pincode, not once per keystroke.
    expect(global.fetch.mock.calls.filter(([u]) => u.startsWith('/api/pincode'))).toHaveLength(1);

    type('City', 'Dehu Road');
    // A pincode with a different city, so we can wait for its answer to land.
    type('Pincode', '560001');
    await waitFor(() => expect(screen.getByTestId('pin-place')).toHaveTextContent('Bangalore, Karnataka'));
    expect(screen.getByLabelText('City')).toHaveValue('Dehu Road');
  });

  it('refuses a pincode India Post has never heard of', async () => {
    renderCheckout();
    await ready();
    choose('Delivery');
    type('Full name', 'Asha Rao');
    type('Mobile number', '9876543210');
    type('Delivery address', 'Flat 4, Green Park');
    type('City', 'Pune');
    type('Pincode', '999999');
    expect(await screen.findByText('We could not find this pincode. Please check it.')).toBeInTheDocument();
    expect(payButton()).toBeDisabled();
    fireEvent.click(payButton());
    expect(orders()).toHaveLength(0);
  });

  it('never blocks an order because the pincode lookup is down', async () => {
    pinReply = () => new TypeError('Failed to fetch');
    renderCheckout();
    await ready();
    choose('Delivery');
    type('Pincode', '412101');
    await rowOf('Delivery to 412101');
    type('Full name', 'Asha Rao');
    type('Mobile number', '9876543210');
    type('Delivery address', 'Flat 4, Green Park');
    expect(screen.getByLabelText('City')).toHaveValue(''); // nothing to fill it from
    type('City', 'Pune');
    await waitFor(() => expect(payButton()).toBeEnabled());
    expect(screen.queryByText(/could not find this pincode/i)).not.toBeInTheDocument();
  });

  it('says so when a pincode is left half typed', async () => {
    renderCheckout();
    await ready();
    choose('Delivery');
    type('Pincode', '4110');
    expect(screen.queryByText('Enter a valid 6 digit pincode.')).not.toBeInTheDocument(); // not while typing
    fireEvent.blur(screen.getByLabelText('Pincode'));
    expect(screen.getByText('Enter a valid 6 digit pincode.')).toBeInTheDocument();
  });

  it('the Delivery option lists exactly what the rules file charges', async () => {
    renderCheckout();
    await ready();
    const sub = screen.getByRole('radio', { name: 'Delivery' }).getAttribute('aria-describedby');
    const text = document.getElementById(sub).textContent;
    zones.FIXED_RATES.forEach((r) => {
      expect(text).toContain(`₹${r.feePaise / 100}`);
      r.pincodes.forEach((pin) => expect(text).toContain(pin));
    });
    expect(text).toMatch(/Porter\/Rapido/);
    expect(text).not.toMatch(/free/i);
  });
});
