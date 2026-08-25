import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  OFFER_TIERS,
  RIBBON,
  DEFAULT_BOX_TIER_ID,
  DEFAULT_CONTAINER_STYLE_ID,
  DEFAULT_NOTE_OPTION_ID,
  NOTE_MAX_LENGTH,
  IMPORTED_PRODUCTS,
  getBoxTier,
  getContainerStyle,
  getNoteOption,
  getPreset,
  getDefaultPacking,
  getPackingOption,
} from '../data/hampers';
import { computeHamperPricing, makeHamperLine, resolvePresetLines } from '../utils/hamperPricing';
import { products } from '../data/products';

/*
 * Draft hamper state for the /hampers builder.
 *
 * Deliberately separate from the cart (StoreContext): an unfinished hamper is a
 * work in progress and must never leak into the cart or the WhatsApp order until
 * the customer actually finishes it. Same defensive posture as StoreContext -
 * everything guarded, nothing throws, corrupt storage resets cleanly.
 *
 * A line is keyed by product + weight, so changing packing changes it for the
 * whole line rather than splitting it in two.
 */

const STORAGE_KEY = 'nj_hamper_v1';
const hasWindow = typeof window !== 'undefined';

/* The catalog a persisted line can legitimately point at. */
const allCatalog = () => [...products, ...IMPORTED_PRODUCTS];
const findProduct = (productId) => allCatalog().find((p) => p.id === productId) || null;

const validLine = (l) =>
  l &&
  typeof l.key === 'string' &&
  typeof l.productId === 'string' &&
  typeof l.unitPrice === 'number' &&
  typeof l.qty === 'number' &&
  l.qty > 0;

/* Drafts saved before packing existed have no packingId, give them the default
   rather than showing a line with no packaging. */
const healLine = (line) => {
  if (line.packingId) return line;
  const product = findProduct(line.productId);
  const packing = getDefaultPacking(product);
  return {
    ...line,
    packingId: packing.id,
    packingName: packing.name,
    packingPrice: packing.price,
    ribbon: !!line.ribbon,
    ribbonPrice: line.ribbon ? RIBBON.price : 0,
  };
};

const loadPersisted = () => {
  if (!hasWindow) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      boxTierId: typeof data.boxTierId === 'string' ? data.boxTierId : DEFAULT_BOX_TIER_ID,
      containerStyleId:
        typeof data.containerStyleId === 'string' ? data.containerStyleId : DEFAULT_CONTAINER_STYLE_ID,
      noteOptionId:
        typeof data.noteOptionId === 'string' ? data.noteOptionId : DEFAULT_NOTE_OPTION_ID,
      noteMessage:
        typeof data.noteMessage === 'string' ? data.noteMessage.slice(0, NOTE_MAX_LENGTH) : '',
      occasionId: typeof data.occasionId === 'string' ? data.occasionId : null,
      lines: Array.isArray(data.lines) ? data.lines.filter(validLine).map(healLine) : [],
    };
  } catch (_) {
    return null; // corrupt/old draft → start fresh
  }
};

/* Fit `lines` into `slots`, trimming from the end. Returns the kept lines and
   how many units were dropped so the UI can explain itself. */
const fitToSlots = (lines, slots) => {
  const kept = [];
  let used = 0;
  let dropped = 0;

  lines.forEach((line) => {
    const room = slots - used;
    if (room <= 0) {
      dropped += line.qty;
      return;
    }
    const qty = Math.min(line.qty, room);
    kept.push(qty === line.qty ? line : { ...line, qty });
    dropped += line.qty - qty;
    used += qty;
  });

  return { lines: kept, dropped };
};

const initialState = {
  boxTierId: DEFAULT_BOX_TIER_ID,
  containerStyleId: DEFAULT_CONTAINER_STYLE_ID,
  noteOptionId: DEFAULT_NOTE_OPTION_ID,
  noteMessage: '',
  occasionId: null,
  lines: [],
  notice: null,
  past: [],
};

const mapLine = (lines, key, fn) => lines.map((l) => (l.key === key ? fn(l) : l));

function baseReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.draft, notice: null };

    case 'SET_BOX_TIER': {
      const tier = getBoxTier(action.boxTierId);
      if (tier.id === state.boxTierId) return state;

      // Shrinking the box can orphan items, trim rather than keep an invalid hamper.
      const { lines, dropped } = fitToSlots(state.lines, tier.slots);
      return {
        ...state,
        boxTierId: tier.id,
        lines,
        notice: dropped > 0
          ? { id: Date.now(), message: `${tier.name} holds ${tier.slots} items, removed the last ${dropped} to fit.` }
          : state.notice,
      };
    }

    case 'SET_CONTAINER_STYLE':
      return { ...state, containerStyleId: getContainerStyle(action.containerStyleId).id };

    case 'SET_NOTE_OPTION': {
      const note = getNoteOption(action.noteOptionId);
      return {
        ...state,
        noteOptionId: note.id,
        // Dropping the note discards the message rather than keeping a hidden one.
        noteMessage: note.id === 'none' ? '' : state.noteMessage,
      };
    }

    case 'SET_NOTE_MESSAGE':
      return { ...state, noteMessage: String(action.message || '').slice(0, NOTE_MAX_LENGTH) };

    case 'SET_OCCASION':
      return { ...state, occasionId: action.occasionId || null };

    case 'ADD_LINE': {
      const idx = state.lines.findIndex((l) => l.key === action.line.key);
      if (idx >= 0) {
        return {
          ...state,
          lines: state.lines.map((l, i) =>
            i === idx ? { ...l, qty: l.qty + action.line.qty } : l
          ),
        };
      }
      return { ...state, lines: [...state.lines, action.line] };
    }

    case 'SET_LINE_PACKING':
      return {
        ...state,
        lines: mapLine(state.lines, action.key, (l) => ({
          ...l,
          packingId: action.packing.id,
          packingName: action.packing.name,
          packingPrice: action.packing.price,
        })),
      };

    case 'TOGGLE_LINE_RIBBON':
      return {
        ...state,
        lines: mapLine(state.lines, action.key, (l) => ({
          ...l,
          ribbon: !l.ribbon,
          ribbonPrice: !l.ribbon ? RIBBON.price : 0,
        })),
      };

    case 'SET_QTY':
      return {
        ...state,
        lines: state.lines
          .map((l) => (l.key === action.key ? { ...l, qty: action.qty } : l))
          .filter((l) => l.qty > 0),
      };

    case 'REMOVE_LINE':
      return { ...state, lines: state.lines.filter((l) => l.key !== action.key) };

    case 'LOAD_PRESET':
      return {
        ...state,
        boxTierId: action.boxTierId,
        lines: action.lines,
        occasionId: action.occasionId ?? state.occasionId,
        notice: { id: Date.now(), message: `Loaded "${action.presetName}", edit it however you like.` },
      };

    case 'CLEAR':
      return {
        ...state,
        lines: [],
        noteOptionId: DEFAULT_NOTE_OPTION_ID,
        noteMessage: '',
        notice: null,
      };

    case 'CLEAR_NOTICE':
      return { ...state, notice: null };

    default:
      return state;
  }
}

/* ---------------------------------------------------------------- *
 * Undo.
 *
 * Every change that alters the hamper pushes a snapshot first, so nothing a
 * customer does to their box is a one-way door. That is why "Start over" needs
 * no confirmation dialog: it is recoverable like everything else.
 * ---------------------------------------------------------------- */
const MAX_HISTORY = 25;

/* SET_NOTE_MESSAGE is deliberately absent: it fires on every keystroke, and a
   textarea already has the browser's own undo. */
const UNDOABLE = new Set([
  'SET_BOX_TIER',
  'SET_CONTAINER_STYLE',
  'SET_NOTE_OPTION',
  'ADD_LINE',
  'SET_LINE_PACKING',
  'TOGGLE_LINE_RIBBON',
  'SET_QTY',
  'REMOVE_LINE',
  'LOAD_PRESET',
  'CLEAR',
]);

/* History entries hold the hamper only, never the history itself or a notice. */
const snapshotOf = ({ past, notice, ...hamper }) => hamper;

function reducer(state, action) {
  if (action.type === 'UNDO') {
    if (state.past.length === 0) return state;
    return {
      ...state.past[state.past.length - 1],
      past: state.past.slice(0, -1),
      notice: { id: Date.now(), message: 'Last change undone.' },
    };
  }

  const next = baseReducer(state, action);
  if (next === state || !UNDOABLE.has(action.type)) return next;

  return { ...next, past: [...state.past, snapshotOf(state)].slice(-MAX_HISTORY) };
}

export function useHamperBuilder() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hydrated = useRef(false);

  // Hydrate the saved draft once on mount.
  useEffect(() => {
    const draft = loadPersisted();
    if (draft) {
      // Re-fit in case BOX_TIERS changed since the draft was saved.
      const tier = getBoxTier(draft.boxTierId);
      const { lines } = fitToSlots(draft.lines, tier.slots);
      dispatch({ type: 'HYDRATE', draft: { ...draft, boxTierId: tier.id, lines } });
    }
    hydrated.current = true;
  }, []);

  // Persist after hydration so we never overwrite a good draft with the empty initial state.
  useEffect(() => {
    if (!hydrated.current || !hasWindow) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          boxTierId: state.boxTierId,
          containerStyleId: state.containerStyleId,
          noteOptionId: state.noteOptionId,
          noteMessage: state.noteMessage,
          occasionId: state.occasionId,
          lines: state.lines,
        })
      );
    } catch (_) { /* storage full/disabled → stay in memory */ }
  }, [
    state.boxTierId,
    state.containerStyleId,
    state.noteOptionId,
    state.noteMessage,
    state.occasionId,
    state.lines,
  ]);

  const boxTier = useMemo(() => getBoxTier(state.boxTierId), [state.boxTierId]);
  const containerStyle = useMemo(() => getContainerStyle(state.containerStyleId), [state.containerStyleId]);
  const noteOption = useMemo(() => getNoteOption(state.noteOptionId), [state.noteOptionId]);

  const pricing = useMemo(
    () => computeHamperPricing(state.lines, boxTier, OFFER_TIERS, { containerStyle, noteOption }),
    [state.lines, boxTier, containerStyle, noteOption]
  );

  /* Add a product. Returns a result object rather than throwing, so the basket can
     shake and toast on a full box instead of silently ignoring the tap. */
  const addProduct = useCallback(
    (product, weight, qty = 1) => {
      const line = makeHamperLine(product, weight, qty, { packing: getDefaultPacking(product) });
      if (!line) return { ok: false, reason: 'invalid' };
      if (pricing.slotsLeft < line.qty) return { ok: false, reason: 'full', line };
      dispatch({ type: 'ADD_LINE', line });
      return { ok: true, line };
    },
    [pricing.slotsLeft]
  );

  /* Clamp quantity changes to whatever room the box actually has. */
  const setLineQty = useCallback(
    (key, qty) => {
      const current = state.lines.find((l) => l.key === key);
      if (!current) return { ok: false, reason: 'missing' };

      const next = Math.round(qty);
      if (next <= 0) {
        dispatch({ type: 'REMOVE_LINE', key });
        return { ok: true };
      }

      const usedByOthers = pricing.slotsUsed - current.qty;
      const maxQty = Math.max(1, pricing.slots - usedByOthers);
      const clamped = Math.min(next, maxQty);

      dispatch({ type: 'SET_QTY', key, qty: clamped });
      return { ok: clamped === next, reason: clamped === next ? undefined : 'full' };
    },
    [state.lines, pricing.slotsUsed, pricing.slots]
  );

  const setLinePacking = useCallback(
    (key, packingId) => {
      const line = state.lines.find((l) => l.key === key);
      if (!line) return;
      const packing = getPackingOption(findProduct(line.productId), packingId);
      dispatch({ type: 'SET_LINE_PACKING', key, packing });
    },
    [state.lines]
  );

  const toggleLineRibbon = useCallback((key) => dispatch({ type: 'TOGGLE_LINE_RIBBON', key }), []);
  const removeLine = useCallback((key) => dispatch({ type: 'REMOVE_LINE', key }), []);
  const setBoxTier = useCallback((boxTierId) => dispatch({ type: 'SET_BOX_TIER', boxTierId }), []);
  const setContainerStyle = useCallback(
    (containerStyleId) => dispatch({ type: 'SET_CONTAINER_STYLE', containerStyleId }),
    []
  );
  const setNoteOption = useCallback((noteOptionId) => dispatch({ type: 'SET_NOTE_OPTION', noteOptionId }), []);
  const setNoteMessage = useCallback((message) => dispatch({ type: 'SET_NOTE_MESSAGE', message }), []);
  const setOccasion = useCallback((occasionId) => dispatch({ type: 'SET_OCCASION', occasionId }), []);
  const clearHamper = useCallback(() => dispatch({ type: 'CLEAR' }), []);
  const clearNotice = useCallback(() => dispatch({ type: 'CLEAR_NOTICE' }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);

  /* Load a ready-made hamper into the builder so it can be customised. */
  const loadPreset = useCallback((presetId) => {
    const preset = getPreset(presetId);
    if (!preset) return { ok: false, reason: 'missing' };

    const tier = getBoxTier(preset.boxTierId);
    const resolved = resolvePresetLines(preset, allCatalog(), getDefaultPacking);
    const { lines } = fitToSlots(resolved, tier.slots);

    dispatch({
      type: 'LOAD_PRESET',
      boxTierId: tier.id,
      lines,
      occasionId: preset.occasionIds?.[0],
      presetName: preset.name,
    });
    return { ok: true, preset };
  }, []);

  /* How many of a given product+weight are already in the box, lets product
     cards show a live count badge. */
  const getLineQty = useCallback(
    (productId, weight) => {
      const line = state.lines.find((l) => l.key === `${productId}__${weight}`);
      return line ? line.qty : 0;
    },
    [state.lines]
  );

  return {
    boxTierId: state.boxTierId,
    boxTier,
    containerStyleId: state.containerStyleId,
    containerStyle,
    noteOptionId: state.noteOptionId,
    noteOption,
    noteMessage: state.noteMessage,
    occasionId: state.occasionId,
    lines: state.lines,
    notice: state.notice,
    pricing,
    canUndo: state.past.length > 0,
    undo,
    addProduct,
    setLineQty,
    setLinePacking,
    toggleLineRibbon,
    removeLine,
    setBoxTier,
    setContainerStyle,
    setNoteOption,
    setNoteMessage,
    setOccasion,
    loadPreset,
    clearHamper,
    clearNotice,
    getLineQty,
  };
}

export default useHamperBuilder;
