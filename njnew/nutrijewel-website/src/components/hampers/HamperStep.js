import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, ChevronDown } from 'lucide-react';

/*
 * One numbered step of the builder, collapsible to a single summary line.
 *
 * Three steps sitting open is a very tall page on a phone, and almost all
 * traffic here is mobile. Steps 1 and 3 fold up once they are settled; step 2
 * (picking products) never collapses, because that is where the time is spent.
 *
 * The summary always shows the current choice, so nothing is actually hidden,
 * and reopening is a single tap on the whole header.
 */

export default function HamperStep({
  number,
  title,
  sub,
  summary,
  collapsible = false,
  collapsed = false,
  onToggle,
  children,
}) {
  const reduceMotion = useReducedMotion();
  const isCollapsed = collapsible && collapsed;

  const header = (
    <>
      <span className={`nj-hb-step-num${isCollapsed ? ' is-done' : ''}`}>
        {isCollapsed ? <Check size={14} /> : number}
      </span>
      <div className="nj-hb-step-copy">
        <h3 className="nj-hb-step-title">{title}</h3>
        {isCollapsed ? (
          <p className="nj-hb-step-summary">{summary}</p>
        ) : (
          sub && <p className="nj-hb-step-sub">{sub}</p>
        )}
      </div>
      {collapsible && (
        <span className={`nj-hb-step-toggle${isCollapsed ? '' : ' is-open'}`}>
          <span className="nj-hb-step-toggle-text">{isCollapsed ? 'Change' : 'Done'}</span>
          <ChevronDown size={15} />
        </span>
      )}
    </>
  );

  return (
    <div className={`nj-hb-step${isCollapsed ? ' is-collapsed' : ''}`}>
      {collapsible ? (
        <button
          type="button"
          className="nj-hb-step-head is-button"
          onClick={onToggle}
          aria-expanded={!isCollapsed}
        >
          {header}
        </button>
      ) : (
        <div className="nj-hb-step-head">{header}</div>
      )}

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            className="nj-hb-step-body"
            initial={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            animate={reduceMotion ? undefined : { height: 'auto', opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
