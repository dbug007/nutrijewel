import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Info, X } from 'lucide-react';
import { useStore } from '../../store/StoreContext';
import { getOccasion } from '../../data/hampers';
import { formatINR } from '../../utils/hamperPricing';
import BoxTierPicker from './BoxTierPicker';
import HamperProductPicker from './HamperProductPicker';
import HamperFinishing from './HamperFinishing';
import HamperStep from './HamperStep';
import HamperBasket, { BASKET_DROP_ID, BASKET_SLOTS_ID } from './HamperBasket';
import HamperMobileBar, { MOBILE_SLOTS_ID } from './HamperMobileBar';

const img = (src) => `${process.env.PUBLIC_URL}${src || ''}`;

const FLIGHT_MS = 620;

/*
 * Builder orchestrator. Owns the drag-and-drop context and the feedback that
 * needs to span the picker and the basket, the fly-to-basket animation, the
 * shake on a full box, and transient notices.
 *
 * Drag activates only after 8px of movement, so a tap on a product card's "Add"
 * button is still read as a click, tap-to-add stays the primary path.
 */

export default function HamperBuilder({ builder }) {
  const reduceMotion = useReducedMotion();
  const { addHamperToCart, openCart } = useStore();
  const [shakeKey, setShakeKey] = useState(0);
  const [dragging, setDragging] = useState(null);
  const [flights, setFlights] = useState([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const flightId = useRef(0);
  const flightTimers = useRef([]);

  /* Step 1 starts open because it is the first decision. Step 3 starts closed
     because most people take the defaults. Both stay one tap away. */
  const [stepOpen, setStepOpen] = useState({ box: true, finish: false });
  const boxAutoCollapsed = useRef(false);

  const toggleStep = (key) => setStepOpen((s) => ({ ...s, [key]: !s[key] }));

  /* Once the first item lands in the box, the box choice is settled, so step 1
     folds itself away. Only ever once: reopening it must stick. */
  useEffect(() => {
    if (!builder.pricing.isEmpty && !boxAutoCollapsed.current) {
      boxAutoCollapsed.current = true;
      setStepOpen((s) => ({ ...s, box: false }));
    }
  }, [builder.pricing.isEmpty]);

  /* MouseSensor, not PointerSensor, on purpose. PointerSensor also fires for touch,
     and an 8px activation threshold on a product card would hijack the vertical
     scroll gesture on a phone. Since nearly all traffic here is mobile, drag is a
     mouse-only enhancement and tap-to-add is the real interaction. */
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } })
  );

  // Auto-dismiss builder notices (box trimmed, preset loaded).
  useEffect(() => {
    if (!builder.notice) return undefined;
    const t = setTimeout(builder.clearNotice, 4200);
    return () => clearTimeout(t);
  }, [builder.notice, builder.clearNotice]);

  // Don't leave flight cleanup timers running after unmount.
  useEffect(() => () => flightTimers.current.forEach(clearTimeout), []);

  /* The docked bar sits across the bottom of the screen, which is exactly where
     the back-to-top button lives. Flag it on <body> so anything else pinned to
     that edge can lift itself clear (see ScrollToTop.css). */
  useEffect(() => {
    document.body.classList.add('nj-has-dock');
    return () => document.body.classList.remove('nj-has-dock');
  }, []);

  // While the phone sheet is up, lock the page behind it and let Escape close it.
  useEffect(() => {
    document.body.classList.toggle('nj-sheet-open', sheetOpen);
    if (!sheetOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setSheetOpen(false); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      document.body.classList.remove('nj-sheet-open');
    };
  }, [sheetOpen]);

  // Adding the hamper to the cart closes the sheet with it.
  const closeSheet = () => setSheetOpen(false);

  /* Send a little copy of the product arcing into the basket. Purely decorative,
     the item is already added by the time this renders.

     It aims at whichever basket the viewer can actually see: the docked bar on a
     phone, the sidebar on a desktop. The bar is display:none above 1024px, so a
     zero height is how we detect the wide layout. */
  const flightTarget = () => {
    const bar = document.getElementById(MOBILE_SLOTS_ID);
    if (bar && bar.getBoundingClientRect().height > 0) return bar;
    return document.getElementById(BASKET_SLOTS_ID);
  };

  const launchFlight = useCallback((product, originRect) => {
    if (reduceMotion || !originRect) return;

    const target = flightTarget();
    if (!target) return;
    const t = target.getBoundingClientRect();
    if (!t.width && !t.height) return;

    const id = (flightId.current += 1);
    setFlights((prev) => [
      ...prev,
      {
        id,
        image: product.image,
        flag: product.flag,
        from: { x: originRect.left + originRect.width / 2 - 26, y: originRect.top + originRect.height / 2 - 26 },
        to: { x: t.left + t.width / 2 - 26, y: t.top + t.height / 2 - 26 },
      },
    ]);

    const timer = setTimeout(() => {
      setFlights((prev) => prev.filter((f) => f.id !== id));
      flightTimers.current = flightTimers.current.filter((x) => x !== timer);
    }, FLIGHT_MS + 80);
    flightTimers.current.push(timer);
  }, [reduceMotion]);

  /* Wrap addProduct so a rejected add gets visible feedback instead of nothing. */
  const addProduct = (product, weight, originRect) => {
    const result = builder.addProduct(product, weight);
    if (!result.ok) {
      if (result.reason === 'full') setShakeKey((k) => k + 1);
      return result;
    }
    launchFlight(product, originRect);
    return result;
  };

  const handleDragEnd = ({ active, over }) => {
    setDragging(null);
    if (!over || over.id !== BASKET_DROP_ID) return;
    const payload = active.data?.current;
    // No flight on drop, the drag itself already carried the item across.
    if (payload?.product) {
      const result = builder.addProduct(payload.product, payload.weight);
      if (!result.ok && result.reason === 'full') setShakeKey((k) => k + 1);
    }
  };

  const handleAddToCart = () => {
    if (builder.pricing.isEmpty) return;
    addHamperToCart({
      lines: builder.lines,
      pricing: builder.pricing,
      boxTier: builder.boxTier,
      containerStyle: builder.containerStyle,
      noteOption: builder.noteOption,
      noteMessage: builder.noteMessage,
      occasion: getOccasion(builder.occasionId),
    });
    builder.clearHamper();
    closeSheet();
    openCart();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setDragging(active.data?.current || null)}
      onDragCancel={() => setDragging(null)}
      onDragEnd={handleDragEnd}
    >
      <div className="nj-hb" id="hamper-builder">
        <AnimatePresence>
          {builder.notice && (
            <motion.div
              className="nj-hb-notice"
              key={builder.notice.id}
              initial={reduceMotion ? undefined : { opacity: 0, y: -10 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              role="status"
            >
              <Info size={14} />
              <span>{builder.notice.message}</span>
              {builder.canUndo && (
                <button className="nj-hb-notice-undo" onClick={builder.undo}>Undo</button>
              )}
              <button onClick={builder.clearNotice} aria-label="Dismiss"><X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="nj-hb-grid">
          <div className="nj-hb-main">
            <HamperStep
              number={1}
              title="Choose your box"
              sub="Bigger boxes hold more, and unlock bigger savings."
              summary={`${builder.boxTier.name} · ${builder.boxTier.slots} slots · ${formatINR(builder.boxTier.boxPrice)}`}
              collapsible
              collapsed={!stepOpen.box}
              onToggle={() => toggleStep('box')}
            >
              <BoxTierPicker
                boxTierId={builder.boxTierId}
                slotsUsed={builder.pricing.slotsUsed}
                onSelect={builder.setBoxTier}
              />
            </HamperStep>

            {/* Never collapses: this is where the time is spent. */}
            <HamperStep
              number={2}
              title="Fill it up"
              sub={`Tap anything to drop it in your box. ${builder.pricing.slotsLeft} slot${builder.pricing.slotsLeft === 1 ? '' : 's'} still free.`}
            >
              <HamperProductPicker builder={{ ...builder, addProduct }} />
            </HamperStep>

            <HamperStep
              number={3}
              title="Finish it"
              sub="How it arrives, and what it says when it does."
              summary={`${builder.containerStyle.name} · ${builder.noteOption.id === 'none' ? 'No note' : builder.noteOption.name}`}
              collapsible
              collapsed={!stepOpen.finish}
              onToggle={() => toggleStep('finish')}
            >
              <HamperFinishing builder={builder} />
            </HamperStep>
          </div>

          {/* Sidebar on desktop, bottom sheet on a phone. Same component either way. */}
          <div
            className={`nj-hb-side${sheetOpen ? ' is-open' : ''}`}
            id="nj-hamper-basket-panel"
          >
            <button
              className="nj-sheet-handle"
              onClick={() => setSheetOpen(false)}
              aria-label="Collapse hamper"
            >
              <span />
            </button>
            <HamperBasket
              builder={builder}
              shakeKey={shakeKey}
              onAddToCart={handleAddToCart}
              onClose={closeSheet}
            />
          </div>
        </div>

        {/* Docked basket for phones. Always visible so the box can be watched
            filling up, and so the fly-to-basket has a target from the first tap. */}
        <HamperMobileBar
          pricing={builder.pricing}
          lines={builder.lines}
          onOpen={() => setSheetOpen(true)}
        />
      </div>

      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            className="nj-sheet-backdrop"
            onClick={() => setSheetOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          />
        )}
      </AnimatePresence>

      {/* ---- fly-to-basket ---- */}
      <AnimatePresence>
        {flights.map((flight) => (
          <motion.div
            key={flight.id}
            className="nj-flight"
            aria-hidden="true"
            initial={{ x: flight.from.x, y: flight.from.y, scale: 1, opacity: 1 }}
            animate={{ x: flight.to.x, y: flight.to.y, scale: 0.34, opacity: 0.9 }}
            exit={{ opacity: 0, scale: 0.2 }}
            transition={{ duration: FLIGHT_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
          >
            {flight.image ? (
              <img src={img(flight.image)} alt="" />
            ) : (
              <span className="nj-flight-flag">{flight.flag || '✦'}</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      <DragOverlay dropAnimation={reduceMotion ? null : undefined}>
        {dragging?.product && (
          <div className="nj-drag-ghost">
            {dragging.product.image ? (
              <img src={img(dragging.product.image)} alt="" />
            ) : (
              <span className="nj-drag-ghost-flag">{dragging.product.flag || '✦'}</span>
            )}
            <span>
              {dragging.product.displayName || dragging.product.name}
              <small>{dragging.weight}</small>
            </span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
