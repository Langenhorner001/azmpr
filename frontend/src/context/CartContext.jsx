import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { parsePrice } from "../lib/price";

const STORAGE_KEY = "azdist_cart";

const CartContext = createContext(null);

const safeRead = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(safeRead);
  const [isOpen, setIsOpen] = useState(false);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addItem = useCallback((product) => {
    const price = parsePrice(product.price);
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.product_name,
          priceLabel: product.price || "Contact for pricing",
          price, // numeric
          image: product.image_url,
          qty: 1,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((it) => it.id !== id);
      return prev.map((it) => (it.id === id ? { ...it, qty } : it));
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => {
    const count = items.reduce((s, it) => s + it.qty, 0);
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    return {
      items,
      count,
      total,
      isOpen,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      openCart,
      closeCart,
      hasItem: (id) => items.some((it) => it.id === id),
    };
  }, [items, isOpen, addItem, removeItem, updateQty, clearCart, openCart, closeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
