import React, { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider, useStore } from '../../store/StoreContext';
import CartDrawer from './CartDrawer';

/* The payments switch is a build-time constant. A getter lets each test choose
   its value while the component still reads it the way production does, at
   render time. Jest allows factory variables whose name starts with `mock`. */
let mockPaymentsOn = false;
jest.mock('../../config/payments', () => ({
  get ONLINE_PAYMENTS_ENABLED() { return mockPaymentsOn; },
}));

const products = require('../../data/products.data');
const peanutButter = products.find((p) => p.id === 'peanut-butter');

/* Seed the cart the way a returning customer's browser holds it, then open the
   drawer. Seeding storage matters: React runs a child's effects before its
   parent's, so adding the item from an effect here would be wiped a moment
   later when StoreProvider hydrates from the (empty) persisted cart. */
const plainLine = {
  key: 'peanut-butter__200g', productId: 'peanut-butter', name: peanutButter.displayName,
  image: peanutButter.image, category: peanutButter.category, weight: '200g',
  unitPrice: peanutButter.price, originalPrice: peanutButter.originalPrice, qty: 1,
};
const hamperLine = {
  kind: 'hamper', key: 'hamper__test', productId: 'custom-hamper', name: 'Custom NutriJewel Hamper',
  image: null, category: 'Hampers', weight: 'Classic gift box, 1 item', unitPrice: 548, originalPrice: 548, qty: 1,
  hamperItems: [{ productId: 'peanut-butter', name: 'Peanut Butter', weight: '200g', unitPrice: 299, qty: 1 }],
};

function OpenOnMount() {
  const { openCart } = useStore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { openCart(); }, []);
  return <CartDrawer />;
}

const renderCart = ({ withHamper = false } = {}) => {
  window.localStorage.setItem('nj_store_v1', JSON.stringify({
    cart: withHamper ? [plainLine, hamperLine] : [plainLine],
    wishlist: [],
  }));
  return render(
    <StoreProvider>
      <MemoryRouter>
        <OpenOnMount />
      </MemoryRouter>
    </StoreProvider>
  );
};

beforeEach(() => {
  window.localStorage.clear();
  mockPaymentsOn = false;
});

describe('the cart button follows the payments switch', () => {
  it('sends customers to WhatsApp while online payments are off', async () => {
    renderCart();
    expect(await screen.findByRole('button', { name: /order on whatsapp/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^checkout/i })).not.toBeInTheDocument();
    // The note must not promise online payment that is not happening.
    expect(screen.getByText(/no payment now/i)).toBeInTheDocument();
  });

  it('sends customers to checkout once online payments are on', async () => {
    mockPaymentsOn = true;
    renderCart();
    expect(await screen.findByRole('button', { name: /^checkout/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /order on whatsapp/i })).not.toBeInTheDocument();
    // And it must stop claiming no payment is taken, which would now be false.
    expect(screen.queryByText(/no payment now/i)).not.toBeInTheDocument();
    expect(screen.getByText(/secure payment by razorpay/i)).toBeInTheDocument();
    // Both ways to get the order. It must not promise a price for every pincode:
    // most Pune fares are confirmed on WhatsApp, not priced at checkout.
    expect(screen.getByText(/free pickup at lodha belmondo/i)).toBeInTheDocument();
    expect(screen.getByText(/checkout explains the charge for your pincode/i)).toBeInTheDocument();
    expect(screen.queryByText(/priced by pincode/i)).not.toBeInTheDocument();
  });

  it('keeps a cart with a hamper on WhatsApp, since checkout cannot price hampers yet', async () => {
    mockPaymentsOn = true;
    renderCart({ withHamper: true });
    expect(await screen.findByRole('button', { name: /order on whatsapp/i })).toBeInTheDocument();
  });
});

/* The owner's rule (2026-09-25): no free delivery anywhere, at any cart size.
   The only free option is pickup at Lodha Belmondo, so the word "free" may
   appear in the drawer only as "free pickup". No leading \b on purpose:
   textContent runs adjacent elements together ("DeliveryFree"). */
describe('the drawer never offers free delivery, only free pickup', () => {
  it.each([
    ['online payments off', false, false],
    ['online payments on', true, false],
    ['a hamper in the cart', true, true],
  ])('with %s', async (_label, paymentsOn, withHamper) => {
    mockPaymentsOn = paymentsOn;
    renderCart({ withHamper });
    const drawer = await screen.findByRole('dialog', { name: /shopping cart/i });
    const text = drawer.textContent;
    expect(text).not.toMatch(/free\s*(delivery|shipping)/i);
    expect(text).not.toMatch(/free(?!\s*pickup)/i);
    // An allow-list, not a deny-list: "Free pickup and local delivery" or
    // "Free pickup · delivery" slip past any pattern of banned phrases. Every
    // "free" in the drawer must be the one approved phrase, word for word.
    (text.match(/free[^.:;]*/gi) || []).forEach((phrase) => {
      expect(phrase).toMatch(/^free pickup at lodha belmondo(, or delivery)?$/i);
    });
  });
});
