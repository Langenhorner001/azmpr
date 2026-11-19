import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, MessageCircle, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../lib/price";
import { waUrl, BRAND } from "./constants";

const buildCheckoutMessage = (items, total) => {
  const lines = items.map((it, i) => {
    const lineTotal = it.price > 0 ? formatPrice(it.price * it.qty) : "Price on WhatsApp";
    return `${i + 1}) ${it.name} x ${it.qty} — ${lineTotal}`;
  });
  return [
    `Assalam-o-Alaikum ${BRAND},`,
    "",
    "Mein ye order place karna chahta/chahti hoon:",
    "",
    ...lines,
    "",
    total > 0 ? `Total: ${formatPrice(total)}` : "Total: Please confirm pricing on WhatsApp",
    "",
    "Please confirm availability + delivery.",
    "Shukria!",
  ].join("\n");
};

const CartDrawer = () => {
  const { items, total, count, isOpen, closeCart, removeItem, updateQty } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    const msg = buildCheckoutMessage(items, total);
    const url = waUrl(msg);
    // For debug visibility in screenshots
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.info("[AZDIST_CHECKOUT_URL]", url);
    }
    window.open(url, "_blank", "noopener");
    closeCart();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[60]"
          data-testid="cart-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
        >
          {/* Overlay */}
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm cursor-default"
            aria-label="Close cart"
            data-testid="cart-drawer-overlay"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="absolute right-0 top-0 h-full w-[92%] max-w-md bg-white dark:bg-stone-950 shadow-2xl border-l border-stone-200 dark:border-stone-800 flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-stone-700 dark:text-stone-200" />
                <h2 className="font-display font-extrabold text-stone-900 dark:text-white">
                  Your Cart
                </h2>
                <span
                  className="ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                  data-testid="cart-drawer-count"
                >
                  {count}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="w-9 h-9 inline-flex items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-white"
                aria-label="Close"
                data-testid="cart-drawer-close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div
                  className="h-full flex flex-col items-center justify-center text-center px-8 py-16"
                  data-testid="cart-empty"
                >
                  <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center mb-4">
                    <ShoppingBag size={26} className="text-stone-400" />
                  </div>
                  <p className="font-display font-bold text-stone-900 dark:text-white">
                    Your cart is empty
                  </p>
                  <p className="mt-1 text-[13px] text-stone-500 dark:text-stone-400">
                    Browse products and add them to your cart to get started.
                  </p>
                  <button
                    onClick={closeCart}
                    className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm font-semibold hover:bg-orange-600 dark:hover:bg-amber-400 dark:hover:text-stone-900 transition-colors"
                    data-testid="cart-empty-browse"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-stone-200 dark:divide-stone-800">
                  {items.map((it) => (
                    <li key={it.id} className="p-4 flex gap-3" data-testid={`cart-item-${it.id}`}>
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
                        <img
                          src={it.image}
                          alt={it.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-semibold text-stone-900 dark:text-white line-clamp-2 leading-snug">
                          {it.name}
                        </div>
                        <div className="mt-1 text-[12px] text-stone-500 dark:text-stone-400">
                          {it.priceLabel}
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          {/* qty stepper */}
                          <div className="inline-flex items-center rounded-full border border-stone-200 dark:border-stone-700">
                            <button
                              onClick={() => updateQty(it.id, it.qty - 1)}
                              className="w-7 h-7 inline-flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
                              aria-label="Decrease quantity"
                              data-testid={`cart-qty-dec-${it.id}`}
                            >
                              <Minus size={13} />
                            </button>
                            <span
                              className="min-w-[20px] text-center text-[13px] font-bold text-stone-900 dark:text-white"
                              data-testid={`cart-qty-${it.id}`}
                            >
                              {it.qty}
                            </span>
                            <button
                              onClick={() => updateQty(it.id, it.qty + 1)}
                              className="w-7 h-7 inline-flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
                              aria-label="Increase quantity"
                              data-testid={`cart-qty-inc-${it.id}`}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-stone-900 dark:text-white">
                              {it.price > 0 ? formatPrice(it.price * it.qty) : "—"}
                            </span>
                            <button
                              onClick={() => removeItem(it.id)}
                              className="text-stone-400 hover:text-rose-600 transition-colors"
                              aria-label="Remove from cart"
                              data-testid={`cart-remove-${it.id}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-stone-200 dark:border-stone-800 p-4 sm:p-5 space-y-3 bg-white dark:bg-stone-950">
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] text-stone-500 dark:text-stone-400">Subtotal</span>
                  <span
                    className="font-display font-extrabold text-xl text-stone-900 dark:text-white"
                    data-testid="cart-subtotal"
                  >
                    {total > 0 ? formatPrice(total) : "Confirm on WhatsApp"}
                  </span>
                </div>
                <p className="text-[11.5px] text-stone-500 dark:text-stone-400 leading-relaxed">
                  Final price + delivery confirmed on WhatsApp.
                </p>
                <button
                  onClick={handleCheckout}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#25D366] text-white font-bold text-[14px] hover:bg-[#1fb359] transition-all shadow-md hover:shadow-lg"
                  data-testid="cart-checkout-btn"
                >
                  <MessageCircle size={16} />
                  Buy Now on WhatsApp
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
