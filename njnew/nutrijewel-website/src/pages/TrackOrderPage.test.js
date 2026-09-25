import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TrackOrderPage from './TrackOrderPage';

/* The progress rail must match how the order leaves. A pickup never goes out on
   the road, so it has no "On its way" step; a delivery keeps all five. The
   server is stubbed with the shape functions/api/orders/track.js returns. */

const reply = (over) => ({
  ok: true,
  orderNumber: 'NJ-2609-4F2A',
  status: 'packed',
  fulfilment: 'delivery',
  statusLabel: 'Packed',
  statusDetail: 'Packed and ready to send.',
  totalPaise: 59900,
  placedAt: '2026-09-25 10:00:00',
  paidAt: '2026-09-25 10:01:00',
  items: [{ name: 'Golden Bites', weight: '250g', qty: 1 }],
  ...over,
});

const realFetch = global.fetch;
afterEach(() => { global.fetch = realFetch; });

/* Look an order up the way a customer does, and hand back the rail's steps. */
const track = async (body) => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(body) }));
  render(
    <MemoryRouter initialEntries={['/track?n=NJ-2609-4F2A']}>
      <TrackOrderPage />
    </MemoryRouter>
  );
  fireEvent.change(screen.getByLabelText(/mobile number/i), { target: { value: '9876543210' } });
  fireEvent.click(screen.getByRole('button', { name: /track order/i }));
  const rail = await screen.findByRole('list', { name: /order progress/i });
  return within(rail).getAllByRole('listitem');
};

const labels = (steps) => steps.map((li) => li.textContent.trim());
const done = (steps) => steps.map((li) => li.classList.contains('is-done'));

describe('TrackOrderPage progress rail', () => {
  it('a pickup reads Paid, Confirmed, Ready for pickup, Collected, with no road step', async () => {
    const steps = await track(reply({
      fulfilment: 'pickup',
      statusLabel: 'Ready for pickup',
      statusDetail: 'Ready to collect at Lodha Belmondo. We will WhatsApp you the details.',
    }));

    expect(labels(steps)).toEqual(['Paid', 'Confirmed', 'Ready for pickup', 'Collected']);
    expect(done(steps)).toEqual([true, true, true, false]);
    expect(steps[2]).toHaveAttribute('aria-current', 'step');
    expect(screen.queryByText(/on its way/i)).toBeNull();
    expect(screen.getByText('Pickup at Lodha Belmondo, Pune')).toBeInTheDocument();
  });

  it('a collected pickup fills every step', async () => {
    const steps = await track(reply({ fulfilment: 'pickup', status: 'delivered', statusLabel: 'Collected' }));
    expect(labels(steps)).toEqual(['Paid', 'Confirmed', 'Ready for pickup', 'Collected']);
    expect(done(steps)).toEqual([true, true, true, true]);
  });

  it('a delivery keeps all five steps, On its way included', async () => {
    const steps = await track(reply({ fulfilment: 'delivery' }));
    expect(labels(steps)).toEqual(['Paid', 'Confirmed', 'Packed', 'On its way', 'Delivered']);
    expect(done(steps)).toEqual([true, true, true, false, false]);
    expect(screen.queryByText(/lodha belmondo/i)).toBeNull();
  });

  it('treats a reply without fulfilment (an older server) as a delivery', async () => {
    const body = reply({ status: 'shipped', statusLabel: 'On its way' });
    delete body.fulfilment;
    const steps = await track(body);
    expect(labels(steps)).toEqual(['Paid', 'Confirmed', 'Packed', 'On its way', 'Delivered']);
    expect(done(steps)).toEqual([true, true, true, true, false]);
  });
});
