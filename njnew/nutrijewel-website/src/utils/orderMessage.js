const { formatINR } = require('./hamperPricing');

/*
 * Builds the WhatsApp order message.
 *
 * Pure on purpose: this text is what the kitchen actually works from, so a
 * mistake here is a wrong order. Keeping it out of StoreContext means it can be
 * unit tested directly.
 *
 * Kept deliberately short. Anything the reader can already infer is left out:
 * standard packing is not mentioned (only upgrades and ribbons are), and the box
 * and style are stated once rather than repeated per item.
 */

const qtySuffix = (qty) => (qty > 1 ? ` x${qty}` : '');

/* Only worth the reader's attention if it differs from what we'd send anyway. */
function itemExtras(item) {
  return [
    item.packingIsDefault ? null : item.packingName,
    item.ribbon ? 'ribbon' : null,
  ]
    .filter(Boolean)
    .join(', ');
}

function hamperBlock(line, index) {
  const out = [
    `${index + 1}. ${line.name}${qtySuffix(line.qty)}, ${formatINR(line.unitPrice * line.qty)}`,
  ];
  if (line.weight) out.push(`   ${line.weight}`);

  line.hamperItems.forEach((item) => {
    const extras = itemExtras(item);
    out.push(
      `   - ${item.name} (${item.weight})${qtySuffix(item.qty)}${extras ? ` [${extras}]` : ''}`
    );
  });

  if (line.noteOptionName) {
    out.push(
      `   ${line.noteOptionName}${line.noteMessage ? `: "${line.noteMessage}"` : ' (wording to confirm)'}`
    );
  }
  return out.join('\n');
}

function buildOrderMessage(cart, subtotal) {
  const safeCart = Array.isArray(cart) ? cart : [];
  if (safeCart.length === 0) return '';

  const lines = safeCart.map((line, i) => {
    const isHamper =
      line.kind === 'hamper' && Array.isArray(line.hamperItems) && line.hamperItems.length > 0;
    if (isHamper) return hamperBlock(line, i);
    return `${i + 1}. ${line.name} (${line.weight})${qtySuffix(line.qty)}, ${formatINR(line.unitPrice * line.qty)}`;
  });

  return `Hi NutriJewel! I'd like to order:\n\n${lines.join('\n')}\n\nTotal: ${formatINR(subtotal)}`;
}

module.exports = { buildOrderMessage };
