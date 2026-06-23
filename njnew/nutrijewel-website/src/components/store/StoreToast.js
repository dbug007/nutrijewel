import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';
import { useStore } from '../../store/StoreContext';

/* Small transient confirmation (e.g. "Added to cart"). Auto-dismisses. */
export default function StoreToast() {
  const { toast, clearToast } = useStore();

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(clearToast, 2200);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className="nj-toast"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <Check size={16} />
          <span>{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
