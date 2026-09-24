import React from 'react';
import { ShoppingCart, ShoppingBag, Minus, Plus, MessageCircle } from 'lucide-react';
import { useStore, cartLineKey } from '../../store/StoreContext';
import useBuyNow from '../../hooks/useBuyNow';
import { isBuyable } from '../../utils/productAvailability';
import './QuickActions.css';

/*
 * Add and Buy now, right on a product card, so nobody has to open the product
 * page just to buy. Phone first: two 44px buttons side by side that wrap to a
 * stack on a narrow card (the two-up "You may also like" grid).
 *
 * Once the item is in the cart, Add becomes a  −  qty  +  stepper, the pattern
 * Indian shoppers know from quick-commerce apps, so the card always shows how
 * many are already in the cart instead of silently adding another.
 *
 * Off season or price on request: one WhatsApp enquiry button instead, since
 * those are readable and enquirable but never buyable. Coming soon: nothing.
 *
 * Every tap stops at the button, so it never also opens the product page the
 * card links to.
 */

const WHATSAPP_NUMBER = '919960637656';

function enquire(product) {
  const name = product.displayName || product.name;
  const msg = product.priceOnRequest
    ? `Hi! Could you tell me the price for ${product.name}? I'd like to order one.`
    : `Hi! Is ${name} available, or when does it come back? I'd like to order some.`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

/* Used only while online payment is switched off (see useBuyNow). */
function whatsappOrder(product, variant) {
  const weight = (variant && variant.weight) || product.weight;
  const price = (variant && variant.price != null) ? variant.price : product.price;
  const msg = `Hi! I'd like to order ${product.displayName || product.name} (${weight}) - ₹${price}.`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

const stop = (e) => e.stopPropagation();

export default function QuickActions({ product, variant, className = '' }) {
  const { cart, addToCart, setQty, removeFromCart } = useStore();
  const buyNow = useBuyNow();

  if (!product || product.comingSoon) return null;
  const name = product.displayName || product.name;
  const wrap = `njqa${className ? ` ${className}` : ''}`;

  if (!isBuyable(product)) {
    return (
      <div className={wrap} onClick={stop} onKeyDown={stop}>
        <button type="button" className="njqa-btn njqa-ask" onClick={(e) => { stop(e); enquire(product); }}>
          <MessageCircle size={16} aria-hidden="true" />
          <span>{product.priceOnRequest ? 'Ask price' : 'Ask on WhatsApp'}</span>
        </button>
      </div>
    );
  }

  const key = cartLineKey(product, variant);
  const line = cart.find((l) => l.key === key);
  const size = (variant && variant.weight) || product.weight;

  return (
    <div className={wrap} onClick={stop} onKeyDown={stop}>
      {line ? (
        <div className="njqa-stepper" role="group" aria-label={`${name}, ${size}, in your cart`}>
          <button type="button" className="njqa-step"
            aria-label={line.qty === 1 ? `Remove ${name} from cart` : `One fewer ${name}`}
            onClick={(e) => { stop(e); if (line.qty <= 1) removeFromCart(key); else setQty(key, line.qty - 1); }}>
            <Minus size={16} aria-hidden="true" />
          </button>
          <span className="njqa-qty" aria-live="polite">{line.qty}</span>
          <button type="button" className="njqa-step" aria-label={`One more ${name}`}
            disabled={line.qty >= 99}
            onClick={(e) => { stop(e); setQty(key, line.qty + 1); }}>
            <Plus size={16} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button type="button" className="njqa-btn njqa-add" aria-label={`Add ${name}, ${size}, to cart`}
          onClick={(e) => { stop(e); addToCart(product, variant); }}>
          <ShoppingCart size={16} aria-hidden="true" />
          <span>Add</span>
        </button>
      )}
      <button type="button" className="njqa-btn njqa-buy" aria-label={`Buy ${name}, ${size}, now`}
        onClick={(e) => { stop(e); buyNow(product, variant, () => whatsappOrder(product, variant)); }}>
        <ShoppingBag size={16} aria-hidden="true" />
        <span>Buy now</span>
      </button>
    </div>
  );
}
