import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';

/*
 * Cart + Wishlist store. No backend, everything lives in the browser:
 *  - cart/wishlist persisted to localStorage (per device/browser), key-versioned
 *  - a stable nj_device_id cookie is set for identity (future backend/analytics)
 *  - checkout = a single prefilled WhatsApp order (no payment gateway on a static site)
 *
 * Buy Now is unchanged and lives outside this store.
 */

const STORAGE_KEY = 'nj_store_v1';
const DEVICE_COOKIE = 'nj_device_id';
const WHATSAPP_NUMBER = '919960637656';
const MAX_QTY = 99;

const StoreContext = createContext(null);

/* ---------- small browser helpers (all guarded; never throw) ---------- */
const hasWindow = typeof window !== 'undefined';

const safeUUID = () => {
  try {
    if (hasWindow && window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  } catch (_) { /* ignore */ }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const ensureDeviceId = () => {
  if (!hasWindow) return null;
  try {
    const match = document.cookie.match(/(?:^|;\s*)nj_device_id=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
    const id = safeUUID();
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `${DEVICE_COOKIE}=${encodeURIComponent(id)}; max-age=${oneYear}; path=/; samesite=lax`;
    return id;
  } catch (_) {
    return null;
  }
};

const loadPersisted = () => {
  if (!hasWindow) return { cart: [], wishlist: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { cart: [], wishlist: [] };
    const data = JSON.parse(raw);
    return {
      cart: Array.isArray(data.cart) ? data.cart.filter(validCartLine) : [],
      wishlist: Array.isArray(data.wishlist) ? data.wishlist.filter((id) => typeof id === 'string') : [],
    };
  } catch (_) {
    return { cart: [], wishlist: [] }; // corrupt/old data → reset safely
  }
};

const validCartLine = (l) =>
  l && typeof l.key === 'string' && typeof l.productId === 'string' &&
  typeof l.unitPrice === 'number' && typeof l.qty === 'number' &&
  // a hamper line is only usable if its contents survived serialisation
  (l.kind !== 'hamper' || Array.isArray(l.hamperItems));

/* ---------- reducer ---------- */
const initialState = {
  cart: [],
  wishlist: [],
  cartOpen: false,
  wishlistOpen: false,
  toast: null,
};

const clampQty = (q) => Math.max(1, Math.min(MAX_QTY, Math.round(q || 1)));

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, cart: action.cart, wishlist: action.wishlist };

    case 'ADD_TO_CART': {
      const line = action.line;
      const idx = state.cart.findIndex((l) => l.key === line.key);
      let cart;
      if (idx >= 0) {
        cart = state.cart.map((l, i) => (i === idx ? { ...l, qty: clampQty(l.qty + line.qty) } : l));
      } else {
        cart = [...state.cart, { ...line, qty: clampQty(line.qty) }];
      }
      return { ...state, cart, toast: { id: Date.now(), message: `Added to cart, ${line.name}` } };
    }

    /* A curated hamper is one composite line. Never merged with an existing line -
       two hampers built the same way are still two separate gifts. */
    case 'ADD_HAMPER': {
      return {
        ...state,
        cart: [...state.cart, action.line],
        toast: { id: Date.now(), message: `Added to cart, ${action.line.name}` },
      };
    }

    case 'SET_QTY': {
      const cart = state.cart
        .map((l) => (l.key === action.key ? { ...l, qty: clampQty(action.qty) } : l))
        .filter((l) => l.qty > 0);
      return { ...state, cart };
    }

    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((l) => l.key !== action.key) };

    case 'CLEAR_CART':
      return { ...state, cart: [] };

    case 'TOGGLE_WISHLIST': {
      const exists = state.wishlist.includes(action.productId);
      return {
        ...state,
        wishlist: exists
          ? state.wishlist.filter((id) => id !== action.productId)
          : [...state.wishlist, action.productId],
        toast: { id: Date.now(), message: exists ? 'Removed from wishlist' : 'Saved to wishlist' },
      };
    }

    case 'OPEN_CART':       return { ...state, cartOpen: true, wishlistOpen: false };
    case 'CLOSE_CART':      return { ...state, cartOpen: false };
    case 'OPEN_WISHLIST':   return { ...state, wishlistOpen: true, cartOpen: false };
    case 'CLOSE_WISHLIST':  return { ...state, wishlistOpen: false };
    case 'CLEAR_TOAST':     return { ...state, toast: null };
    default:                return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hydrated = useRef(false);

  // hydrate once on mount + set device id
  useEffect(() => {
    ensureDeviceId();
    const { cart, wishlist } = loadPersisted();
    dispatch({ type: 'HYDRATE', cart, wishlist });
    hydrated.current = true;
  }, []);

  // persist cart + wishlist on change (after hydration)
  useEffect(() => {
    if (!hydrated.current || !hasWindow) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart: state.cart, wishlist: state.wishlist }));
    } catch (_) { /* storage full/disabled → stay in-memory */ }
  }, [state.cart, state.wishlist]);

  // keep tabs in sync
  useEffect(() => {
    if (!hasWindow) return undefined;
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        const { cart, wishlist } = loadPersisted();
        dispatch({ type: 'HYDRATE', cart, wishlist });
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /* ---------- public actions ---------- */
  const addToCart = (product, variant, qty = 1) => {
    if (!product || product.comingSoon) return;
    const weight = (variant && variant.weight) || product.weight || 'one size';
    const unitPrice = (variant && variant.price) != null ? variant.price : product.price;
    const originalPrice = (variant && variant.originalPrice) != null ? variant.originalPrice : product.originalPrice;
    const image = (product.images && product.images[0]) || product.image;
    dispatch({
      type: 'ADD_TO_CART',
      line: {
        key: `${product.id}__${weight}`,
        productId: product.id,
        name: product.displayName || product.name,
        image,
        category: product.category,
        weight,
        unitPrice,
        originalPrice,
        qty,
      },
    });
  };

  /* Drop a finished hamper into the cart as a single expandable line, so it can be
     ordered alongside normal products through the existing WhatsApp checkout.
     `lines` and `pricing` come straight from useHamperBuilder. */
  const addHamperToCart = ({ lines, pricing, boxTier, containerStyle, noteOption, noteMessage, occasion }) => {
    if (!Array.isArray(lines) || lines.length === 0 || !pricing) return null;

    const id = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
    const name = occasion ? `${occasion.name} Hamper` : 'Custom NutriJewel Hamper';
    const itemCount = lines.reduce((n, l) => n + l.qty, 0);
    const styleName = containerStyle?.name || 'Gift box';

    const line = {
      kind: 'hamper',
      key: `hamper__${id}`,
      productId: 'custom-hamper',
      name,
      image: lines.find((l) => l.image)?.image || null,
      category: 'Hampers',
      weight: `${boxTier?.name || 'Gift'} ${styleName.toLowerCase()} · ${itemCount} item${itemCount === 1 ? '' : 's'}`,
      unitPrice: pricing.total,
      // pre-discount value, so the drawer can strike through and show the saving
      originalPrice: pricing.itemsTotal + pricing.presentationTotal,
      qty: 1,
      hamperItems: lines.map(({ productId, name: itemName, weight, unitPrice, qty, isImported, packingName, ribbon }) => ({
        productId, name: itemName, weight, unitPrice, qty,
        isImported: !!isImported,
        packingName: packingName || null,
        ribbon: !!ribbon,
      })),
      boxTierName: boxTier?.name || null,
      containerStyleName: styleName,
      noteOptionName: noteOption && noteOption.id !== 'none' ? noteOption.name : null,
      noteMessage: (noteOption && noteOption.id !== 'none' && noteMessage) || null,
      occasionName: occasion?.name || null,
      itemsTotal: pricing.itemsTotal,
      packingTotal: pricing.packingTotal,
      containerTotal: pricing.containerTotal,
      notePrice: pricing.notePrice,
      discount: pricing.discount,
      savings: pricing.savings,
    };

    dispatch({ type: 'ADD_HAMPER', line });
    return line;
  };

  const setQty = (key, qty) => dispatch({ type: 'SET_QTY', key, qty });
  const removeFromCart = (key) => dispatch({ type: 'REMOVE_FROM_CART', key });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const toggleWishlist = (productId) => productId && dispatch({ type: 'TOGGLE_WISHLIST', productId });
  const isInWishlist = (productId) => state.wishlist.includes(productId);

  const openCart = () => dispatch({ type: 'OPEN_CART' });
  const closeCart = () => dispatch({ type: 'CLOSE_CART' });
  const openWishlist = () => dispatch({ type: 'OPEN_WISHLIST' });
  const closeWishlist = () => dispatch({ type: 'CLOSE_WISHLIST' });
  const clearToast = () => dispatch({ type: 'CLEAR_TOAST' });

  const cartCount = state.cart.reduce((n, l) => n + l.qty, 0);
  const subtotal = state.cart.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);

  const checkoutWhatsApp = () => {
    if (state.cart.length === 0) return;
    const lines = state.cart.map((l, i) => {
      const head = `${i + 1}. ${l.name} (${l.weight}) x${l.qty}, ₹${l.unitPrice * l.qty}`;
      // Hampers list their contents, packing and note so the order is unambiguous.
      if (l.kind === 'hamper' && Array.isArray(l.hamperItems) && l.hamperItems.length > 0) {
        const parts = [head];
        parts.push(
          l.hamperItems
            .map((it) => {
              const packing = [it.packingName, it.ribbon ? 'with ribbon' : null]
                .filter(Boolean)
                .join(', ');
              return `    • ${it.name} (${it.weight})${it.qty > 1 ? ` x${it.qty}` : ''}${packing ? `, ${packing}` : ''}`;
            })
            .join('\n')
        );
        if (l.containerStyleName) parts.push(`    Presented in: ${l.boxTierName} ${l.containerStyleName.toLowerCase()}`);
        if (l.noteOptionName) {
          parts.push(`    ${l.noteOptionName}${l.noteMessage ? `: "${l.noteMessage}"` : ' (wording to confirm)'}`);
        }
        return parts.join('\n');
      }
      return head;
    });
    const message =
      `Hi NutriJewel! I'd like to order:\n\n${lines.join('\n')}\n\nTotal: ₹${subtotal}`;
    if (hasWindow) {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const value = {
    cart: state.cart,
    wishlist: state.wishlist,
    cartOpen: state.cartOpen,
    wishlistOpen: state.wishlistOpen,
    toast: state.toast,
    cartCount,
    wishlistCount: state.wishlist.length,
    subtotal,
    addToCart,
    addHamperToCart,
    setQty,
    removeFromCart,
    clearCart,
    toggleWishlist,
    isInWishlist,
    openCart,
    closeCart,
    openWishlist,
    closeWishlist,
    clearToast,
    checkoutWhatsApp,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}
