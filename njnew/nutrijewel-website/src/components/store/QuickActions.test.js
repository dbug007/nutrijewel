import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { StoreProvider, useStore } from '../../store/StoreContext';
import QuickActions from './QuickActions';

jest.mock('../../config/payments', () => ({ ONLINE_PAYMENTS_ENABLED: true }));

const products = require('../../data/products.data');
const byId = (id) => products.find((p) => p.id === id);
const peanut = byId('peanut-butter');
const offSeason = byId('plum-cake');
// No live product is priced on request today, so the flag is tested on a copy.
const onRequest = { ...peanut, id: 'quoted-per-order', priceOnRequest: true };

/* A card as the shop draws it: tapping anywhere on it opens the product page,
   and the quick buttons sit inside. Plus a readout of the real cart. */
function Card({ product }) {
  const navigate = useNavigate();
  const { cart } = useStore();
  return (
    <>
      <div role="link" tabIndex={0} aria-label="card" onClick={() => navigate('/products/x')}>
        <QuickActions product={product} />
      </div>
      <p data-testid="cart">{cart.map((l) => `${l.productId}x${l.qty}`).join(',') || 'empty'}</p>
    </>
  );
}

const renderCard = (product) => render(
  <StoreProvider>
    <MemoryRouter initialEntries={['/shop']}>
      <Routes>
        <Route path="/shop" element={<Card product={product} />} />
        <Route path="/products/x" element={<p>PRODUCT PAGE</p>} />
        <Route path="/checkout" element={<p>CHECKOUT PAGE</p>} />
      </Routes>
    </MemoryRouter>
  </StoreProvider>
);

beforeEach(() => window.localStorage.clear());

describe('quick actions on a product card', () => {
  it('adds to the real cart without leaving the page', () => {
    renderCard(peanut);
    fireEvent.click(screen.getByRole('button', { name: /add .* to cart/i }));
    expect(screen.getByTestId('cart')).toHaveTextContent('peanut-butterx1');
    expect(screen.queryByText('PRODUCT PAGE')).not.toBeInTheDocument();
  });

  it('turns Add into a stepper that counts up and back down to removal', () => {
    renderCard(peanut);
    fireEvent.click(screen.getByRole('button', { name: /add .* to cart/i }));
    const stepper = screen.getByRole('group', { name: /in your cart/i });
    fireEvent.click(within(stepper).getByRole('button', { name: /one more/i }));
    expect(screen.getByTestId('cart')).toHaveTextContent('peanut-butterx2');
    expect(within(stepper).getByText('2')).toBeInTheDocument();

    fireEvent.click(within(stepper).getByRole('button', { name: /one fewer/i }));
    expect(screen.getByTestId('cart')).toHaveTextContent('peanut-butterx1');
    // At one, minus removes it, rather than getting stuck at one.
    fireEvent.click(within(stepper).getByRole('button', { name: /remove .* from cart/i }));
    expect(screen.getByTestId('cart')).toHaveTextContent('empty');
    expect(screen.getByRole('button', { name: /add .* to cart/i })).toBeInTheDocument();
    expect(screen.queryByText('PRODUCT PAGE')).not.toBeInTheDocument();
  });

  it('Buy now goes straight to checkout, not to the product page', async () => {
    renderCard(peanut);
    fireEvent.click(screen.getByRole('button', { name: /buy .* now/i }));
    expect(await screen.findByText('CHECKOUT PAGE')).toBeInTheDocument();
    const saved = JSON.parse(window.localStorage.getItem('nj_store_v1'));
    expect(saved.cart.map((l) => `${l.productId}x${l.qty}`)).toEqual(['peanut-butterx1']);
  });

  it.each([['off season', offSeason], ['price on request', onRequest]])(
    'offers only a WhatsApp enquiry for %s, never a way to buy',
    (_, product) => {
      const open = jest.spyOn(window, 'open').mockImplementation(() => null);
      renderCard(product);
      expect(screen.queryByRole('button', { name: /add .* to cart/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /buy .* now/i })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /ask/i }));
      expect(open).toHaveBeenCalledWith(expect.stringContaining('https://wa.me/'), '_blank');
      expect(screen.getByTestId('cart')).toHaveTextContent('empty');
      expect(screen.queryByText('PRODUCT PAGE')).not.toBeInTheDocument();
      open.mockRestore();
    }
  );
});
