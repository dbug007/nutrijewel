const { buildOrderMessage } = require('./orderMessage');

const product = (name, weight, unitPrice, qty = 1) => ({
  name, weight, unitPrice, qty,
});

const hamperItem = (name, weight, opts = {}) => ({
  name,
  weight,
  qty: opts.qty || 1,
  packingName: opts.packingName || 'Kraft pouch',
  packingIsDefault: opts.packingIsDefault !== false,
  ribbon: !!opts.ribbon,
});

const hamper = (items, opts = {}) => ({
  kind: 'hamper',
  name: opts.name || 'Diwali Hamper',
  weight: opts.weight || 'Classic gift box, 5 items',
  unitPrice: opts.unitPrice || 3574,
  qty: opts.qty || 1,
  hamperItems: items,
  noteOptionName: opts.noteOptionName || null,
  noteMessage: opts.noteMessage || null,
});

describe('buildOrderMessage, plain products', () => {
  it('lists one line per product with a grouped total', () => {
    const msg = buildOrderMessage(
      [product('NJ Signature Granola', '500g', 999), product('Jewel Gun Powder', '80g', 99)],
      1098
    );
    expect(msg).toBe(
      "Hi NutriJewel! I'd like to order:\n\n" +
      '1. NJ Signature Granola (500g), ₹999\n' +
      '2. Jewel Gun Powder (80g), ₹99\n\n' +
      'Total: ₹1,098'
    );
  });

  it('shows quantity only when more than one', () => {
    const msg = buildOrderMessage([product('Granola', '500g', 999, 3)], 2997);
    expect(msg).toContain('1. Granola (500g) x3, ₹2,997');
  });

  it('groups thousands in the Indian system', () => {
    const msg = buildOrderMessage([product('Cake', '1kg', 123456)], 123456);
    expect(msg).toContain('₹1,23,456');
  });

  it('returns an empty string for an empty cart', () => {
    expect(buildOrderMessage([], 0)).toBe('');
    expect(buildOrderMessage(null, 0)).toBe('');
  });
});

describe('buildOrderMessage, hampers', () => {
  it('stays quiet about packing when nothing was changed', () => {
    const msg = buildOrderMessage(
      [hamper([hamperItem('Granola', '500g'), hamperItem('Bliss Bites', '500g')])],
      3574
    );
    expect(msg).toBe(
      "Hi NutriJewel! I'd like to order:\n\n" +
      '1. Diwali Hamper, ₹3,574\n' +
      '   Classic gift box, 5 items\n' +
      '   - Granola (500g)\n' +
      '   - Bliss Bites (500g)\n\n' +
      'Total: ₹3,574'
    );
    // The whole point: our standard packing is not worth the reader's attention.
    expect(msg).not.toContain('Kraft pouch');
  });

  it('calls out an upgraded packing', () => {
    const msg = buildOrderMessage(
      [hamper([
        hamperItem('Granola', '500g'),
        hamperItem('Cambridge of Chocolate', '1kg', {
          packingName: 'Premium tin (round)', packingIsDefault: false,
        }),
      ])],
      4100
    );
    expect(msg).toContain('   - Cambridge of Chocolate (1kg) [Premium tin (round)]');
    expect(msg).toContain('   - Granola (500g)\n');
  });

  it('calls out a ribbon', () => {
    const msg = buildOrderMessage([hamper([hamperItem('Granola', '500g', { ribbon: true })])], 3599);
    expect(msg).toContain('   - Granola (500g) [ribbon]');
  });

  it('lists an upgrade and a ribbon together', () => {
    const msg = buildOrderMessage(
      [hamper([hamperItem('Bliss Bites', '1kg', {
        packingName: 'Premium tin', packingIsDefault: false, ribbon: true, qty: 2,
      })])],
      4000
    );
    expect(msg).toContain('   - Bliss Bites (1kg) x2 [Premium tin, ribbon]');
  });

  it('includes a greeting note and its wording', () => {
    const msg = buildOrderMessage(
      [hamper([hamperItem('Granola', '500g')], {
        noteOptionName: 'Greeting card', noteMessage: 'Happy Diwali, Sharma family!',
      })],
      3633
    );
    expect(msg).toContain('   Greeting card: "Happy Diwali, Sharma family!"');
  });

  it('flags a note whose wording was left blank', () => {
    const msg = buildOrderMessage(
      [hamper([hamperItem('Granola', '500g')], { noteOptionName: 'Greeting tag' })],
      3603
    );
    expect(msg).toContain('   Greeting tag (wording to confirm)');
  });

  it('does not repeat the box and style per item', () => {
    const msg = buildOrderMessage(
      [hamper([hamperItem('Granola', '500g'), hamperItem('Bliss Bites', '500g')])],
      3574
    );
    expect(msg.match(/Classic gift box/g)).toHaveLength(1);
  });

  it('mixes hampers and plain products in one order', () => {
    const msg = buildOrderMessage(
      [hamper([hamperItem('Granola', '500g')]), product('Peanut Butter', '200g', 299)],
      3873
    );
    expect(msg).toContain('1. Diwali Hamper, ₹3,574');
    expect(msg).toContain('2. Peanut Butter (200g), ₹299');
    expect(msg).toContain('Total: ₹3,873');
  });

  it('falls back to a single line if the contents did not survive storage', () => {
    const broken = { kind: 'hamper', name: 'Old Hamper', weight: 'Classic box', unitPrice: 1000, qty: 1, hamperItems: [] };
    const msg = buildOrderMessage([broken], 1000);
    expect(msg).toContain('1. Old Hamper (Classic box), ₹1,000');
  });
});
