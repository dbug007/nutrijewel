import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { ONLINE_PAYMENTS_ENABLED } from '../config/payments';
import { isBuyable } from '../utils/productAvailability';

/*
 * What "Buy Now" means, in one place.
 *
 * It used to open WhatsApp from three different components, each building its own
 * message. With online payment on, Buy Now does what it does in every other shop:
 * put the item in the cart and go straight to checkout.
 *
 * Reads the same ONLINE_PAYMENTS_ENABLED switch as the cart button, so the two
 * can never disagree about how a customer pays.
 *
 * `fallback` is the old WhatsApp behaviour, still used when online payment is
 * off, or for anything not on sale (off-season, price on request), which stays
 * an enquiry by design.
 */
export default function useBuyNow() {
  const { addToCart, closeCart } = useStore();
  const navigate = useNavigate();

  return useCallback((product, variant, fallback) => {
    if (!ONLINE_PAYMENTS_ENABLED || !isBuyable(product)) {
      if (typeof fallback === 'function') fallback();
      return;
    }
    addToCart(product, variant);
    closeCart();
    navigate('/checkout');
  }, [addToCart, closeCart, navigate]);
}
