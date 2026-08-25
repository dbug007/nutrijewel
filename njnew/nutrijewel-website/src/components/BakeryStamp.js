import React from 'react';
import './BakeryStamp.css';

/*
 * A letterpress stamp, the kind inked onto a bakery box lid.
 *
 * Replaces the gradient pill with a sparkle icon that this section used to have.
 * No gradient, no icon font, no glow: a double rule, condensed uppercase type
 * and a couple of degrees of rotation, which is what makes it read as printed
 * rather than generated.
 *
 * Uses Open Sans Condensed, which index.css already loads and nothing was using.
 *
 * Site-wide utility. `tone` picks the ink colour.
 */

export default function BakeryStamp({ children, tone = 'plum', frame = 'letterpress', className = '' }) {
  const isPostage = frame === 'postage';

  return (
    <span className={`nj-stamp nj-stamp--${tone} nj-stamp--${frame} ${className}`.trim()}>
      {!isPostage && <span className="nj-stamp-rule" aria-hidden="true" />}
      <span className="nj-stamp-text">{children}</span>
      {!isPostage && <span className="nj-stamp-rule" aria-hidden="true" />}
    </span>
  );
}
