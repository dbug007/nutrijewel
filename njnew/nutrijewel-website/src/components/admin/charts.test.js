import { inrCompact, inrFull, niceTicks } from './charts';

/* Indian units: 1,50,000 is 1.5L, not 150K. Amounts in paise. */
describe('inrCompact', () => {
  it.each([
    [0, '₹0'],
    [29900, '₹299'],
    [99900, '₹999'],
    [150000, '₹1.5K'],
    [1500000, '₹15K'],
    [15000000, '₹1.5L'],
    [150000000, '₹15L'],
    [1500000000, '₹1.5Cr'],
  ])('%i paise -> %s', (paise, want) => {
    expect(inrCompact(paise)).toBe(want);
  });

  it('drops a pointless .0', () => {
    expect(inrCompact(200000)).toBe('₹2K');
    expect(inrCompact(20000000)).toBe('₹2L');
  });
});

describe('inrFull', () => {
  it('groups the Indian way', () => {
    expect(inrFull(6964400)).toBe('₹69,644');
    expect(inrFull(15000000)).toBe('₹1,50,000');
  });
});

describe('niceTicks', () => {
  it('uses clean steps, never 0 / 437 / 874', () => {
    const t = niceTicks(1748);
    const step = t[1] - t[0];
    expect([1, 2, 5].some((m) => (step / 10 ** Math.floor(Math.log10(step))) === m)).toBe(true);
    t.forEach((v) => expect(Number.isInteger(v / step)).toBe(true));
  });

  it('always reaches at least the maximum, so no bar pokes over the top', () => {
    [3, 7, 48, 1748, 69644, 600001].forEach((max) => {
      const t = niceTicks(max);
      expect(t[0]).toBe(0);
      expect(t[t.length - 1]).toBeGreaterThanOrEqual(max);
    });
  });

  /* This exact case put "₹0" at the top AND the bottom of the revenue axis: with
     no sales the scale topped out at 1 paisa, which also formats as ₹0. The
     charts now show an empty state instead, and this pins why they must. */
  it('with nothing to plot, the top tick is so small it formats as ₹0 too', () => {
    const t = niceTicks(0);
    expect(inrCompact(t[t.length - 1])).toBe('₹0');
  });
});
