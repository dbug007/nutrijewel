import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider, useStore } from '../store/StoreContext';
import useBuyNow from './useBuyNow';

let mockPaymentsOn = true;
jest.mock('../config/payments', () => ({
  get ONLINE_PAYMENTS_ENABLED() { return mockPaymentsOn; },
}));

const products = require('../data/products.data');
const buyable = products.find((p) => p.id === 'peanut-butter');
const offSeason = products.find((p) => p.id === 'plum-cake');

/* A product page stand-in with one Buy Now button, plus a readout of the cart so
   the test can see what the real store actually holds afterwards. */
function ProductStub({ product, onFallback }) {
  const buyNow = useBuyNow();
  const { cart } = useStore();
  return (
    <>
      <button onClick={() => buyNow(product, null, onFallback)}>Buy now</button>
      <p data-testid="cart">{cart.map((l) => `${l.productId}x${l.qty}`).join(',') || 'empty'}</p>
    </>
  );
}

const renderAt = (product, onFallback) => render(
  <StoreProvider>
    <MemoryRouter initialEntries={['/products/x']}>
      <Routes>
        <Route path="/products/x" element={<ProductStub product={product} onFallback={onFallback} />} />
        <Route path="/checkout" element={<p>CHECKOUT PAGE</p>} />
      </Routes>
    </MemoryRouter>
  </StoreProvider>
);

beforeEach(() => { window.localStorage.clear(); mockPaymentsOn = true; });

describe('Buy Now', () => {
  it('puts the item in the cart and goes to checkout when online payment is on', async () => {
    const whatsapp = jest.fn();
    renderAt(buyable, whatsapp);
    fireEvent.click(screen.getByRole('button', { name: /buy now/i }));
    expect(await screen.findByText('CHECKOUT PAGE')).toBeInTheDocument();
    expect(whatsapp).not.toHaveBeenCalled();
  });

  it('adds the product to the real cart, not just navigates', async () => {
    renderAt(buyable, jest.fn());
    // Read the cart before navigating away, by clicking on a page that stays put.
    mockPaymentsOn = true;
    fireEvent.click(screen.getByRole('button', { name: /buy now/i }));
    await screen.findByText('CHECKOUT PAGE');
    const saved = JSON.parse(window.localStorage.getItem('nj_store_v1') || '{"cart":[]}');
    expect(saved.cart.map((l) => l.productId)).toContain('peanut-butter');
  });

  it('falls back to WhatsApp while online payment is off', () => {
    mockPaymentsOn = false;
    const whatsapp = jest.fn();
    renderAt(buyable, whatsapp);
    fireEvent.click(screen.getByRole('button', { name: /buy now/i }));
    expect(whatsapp).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('CHECKOUT PAGE')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart')).toHaveTextContent('empty');
  });

  it('never sends an off-season product to checkout, even with payments on', () => {
    const whatsapp = jest.fn();
    renderAt(offSeason, whatsapp);
    fireEvent.click(screen.getByRole('button', { name: /buy now/i }));
    expect(whatsapp).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('CHECKOUT PAGE')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart')).toHaveTextContent('empty');
  });
});
