/*
 * Jest stub for @number-flow/react (wired up via moduleNameMapper in package.json).
 *
 * The real component animates digits using custom elements and the Web Animations
 * API — neither of which jsdom renders meaningfully — and its transitive deps
 * (number-flow, esm-env) are ESM-only, which CRA's Jest 27 cannot parse. Webpack
 * builds the real thing without any of these problems.
 *
 * This renders the same formatted number as plain text so tests can still read it.
 * HamperBasket also exposes the total as plain text in its aria-live region, which
 * is what the assertions actually rely on.
 */

const React = require('react');

function NumberFlow({ value, format, locales, ...rest }) {
  let text;
  try {
    text = new Intl.NumberFormat(locales || 'en-IN', format).format(value || 0);
  } catch (_) {
    text = String(value ?? '');
  }
  return React.createElement('span', { 'data-testid': 'number-flow', ...rest }, text);
}

module.exports = NumberFlow;
