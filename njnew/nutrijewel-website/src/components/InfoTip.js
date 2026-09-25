import React, { useEffect, useId, useState } from 'react';
import { Info } from 'lucide-react';
import './InfoTip.css';

/*
 * An (i) button that opens a short explanation right below its line.
 *
 * Phone first: a tap opens it and a second tap closes it. Not a hover tooltip,
 * because nearly every visitor is on a phone and a phone cannot hover. The
 * visible circle is small, but the button itself is 44px so a thumb finds it.
 * Escape closes it for keyboard users.
 *
 *   <InfoTip label="What is the convenience fee?">...</InfoTip>
 *
 * useInfoTip gives the button and the panel separately, for a row where the
 * panel has to sit on its own full-width line (a label on the left, an amount
 * on the right, the explanation under both).
 */
export function useInfoTip(label, content) {
  const [open, setOpen] = useState(false);
  const panelId = `njtip-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const button = (
    <button
      type="button"
      className={`njtip-btn${open ? ' is-open' : ''}`}
      aria-label={label}
      aria-expanded={open}
      aria-controls={panelId}
      // Inside a <label> a click would otherwise move focus to the input.
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
    >
      <Info size={15} aria-hidden="true" />
    </button>
  );
  const panel = (
    <span id={panelId} className="njtip-panel" role="note" hidden={!open}>
      {content}
    </span>
  );
  return { open, button, panel };
}

export default function InfoTip({ label, children }) {
  const { button, panel } = useInfoTip(label, children);
  return <>{button}{panel}</>;
}
