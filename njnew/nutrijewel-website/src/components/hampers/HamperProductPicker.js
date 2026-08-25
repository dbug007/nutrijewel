import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Search, X, Sparkles, Leaf } from 'lucide-react';
import {
  IMPORTED_PRODUCTS,
  getGroupedHamperProducts,
  getGroupedImportedProducts,
} from '../../data/hampers';
import { resolveVariant } from '../../utils/hamperPricing';
import HamperProductCard from './HamperProductCard';
import Shelf from '../Shelf';

/* Step 2 of the builder: pick what goes in.
   NutriJewel products are grouped by category; imported add-ons live behind
   their own tab so they never dilute the core range. */

const lowestWeight = (product) => resolveVariant(product, undefined)?.weight;

export default function HamperProductPicker({ builder }) {
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState('nj');
  const [query, setQuery] = useState('');
  const [weights, setWeights] = useState({});

  const hasImported = IMPORTED_PRODUCTS.length > 0;
  const groups = useMemo(() => getGroupedHamperProducts(), []);
  const importedGroups = useMemo(() => getGroupedImportedProducts(), []);

  const setWeight = (productId, weight) =>
    setWeights((prev) => ({ ...prev, [productId]: weight }));

  const weightFor = (product) => weights[product.id] || lowestWeight(product);

  const matches = (product) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (product.displayName || product.name || '').toLowerCase().includes(q) ||
      (product.category || '').toLowerCase().includes(q) ||
      (product.features || []).some((f) => f.toLowerCase().includes(q))
    );
  };

  const visibleGroups = useMemo(
    () =>
      groups
        .map((g) => ({ ...g, items: g.items.filter(matches) }))
        .filter((g) => g.items.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groups, query]
  );

  const visibleImportedGroups = useMemo(
    () =>
      importedGroups
        .map((g) => ({ ...g, items: g.items.filter(matches) }))
        .filter((g) => g.items.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [importedGroups, query]
  );

  const isFull = builder.pricing.isFull;
  const activeGroups = tab === 'nj' ? visibleGroups : visibleImportedGroups;
  const resultCount = activeGroups.reduce((n, g) => n + g.items.length, 0);

  const renderCard = (product) => (
    <HamperProductCard
      key={product.id}
      product={product}
      selectedWeight={weightFor(product)}
      onWeightChange={setWeight}
      onAdd={builder.addProduct}
      inBoxQty={builder.getLineQty(product.id, weightFor(product))}
      disabled={isFull}
    />
  );

  return (
    <div className="nj-pick">
      <div className="nj-pick-controls">
        {hasImported && (
          <div className="nj-pick-tabs" role="tablist" aria-label="Product source">
            <button
              role="tab"
              aria-selected={tab === 'nj'}
              className={`nj-pick-tab${tab === 'nj' ? ' is-active' : ''}`}
              onClick={() => setTab('nj')}
            >
              <Leaf size={14} /> NutriJewel
              {tab === 'nj' && !reduceMotion && (
                <motion.span className="nj-pick-tab-underline" layoutId="nj-pick-tab-underline" />
              )}
            </button>
            <button
              role="tab"
              aria-selected={tab === 'imported'}
              className={`nj-pick-tab${tab === 'imported' ? ' is-active' : ''}`}
              onClick={() => setTab('imported')}
            >
              <Sparkles size={14} /> Imported
              {tab === 'imported' && !reduceMotion && (
                <motion.span className="nj-pick-tab-underline" layoutId="nj-pick-tab-underline" />
              )}
            </button>
          </div>
        )}

        <div className="nj-pick-search">
          <Search size={15} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search granola, ladoo, cake…"
            aria-label="Search products to add to your hamper"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></button>
          )}
        </div>
      </div>

      {isFull && (
        <p className="nj-pick-full-note">
          Your box is full. Remove something, or choose a bigger box to keep adding.
        </p>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {resultCount === 0 ? (
            <p className="nj-pick-empty">
              Nothing matches “{query}”. <button onClick={() => setQuery('')}>Clear search</button>
            </p>
          ) : (
            <>
              {tab === 'imported' && (
                <p className="nj-pick-imported-note">
                  Imported soft drinks, canned coffee, chocolates and packed snacks, all
                  shelf-stable, so nothing spoils on the way.
                </p>
              )}
              {/* One swipeable row per category rather than a wrapped grid, so the
                  picker stays a fixed height however many products a category has. */}
              {activeGroups.map((group) => (
                <section className="nj-pick-group" key={group.category}>
                  <h4 className="nj-pick-group-title">
                    {group.category}
                    <span>{group.items.length}</span>
                  </h4>
                  <Shelf label={group.category} arrows>
                    {group.items.map(renderCard)}
                  </Shelf>
                </section>
              ))}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
