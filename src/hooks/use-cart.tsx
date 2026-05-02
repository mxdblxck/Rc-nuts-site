import { createContext, useContext, useState, useCallback } from "react";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

type CartItem = {
  cartItemId: string;
  productId: Id<"products"> | Id<"packs">; // supports both products and packs
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
  weight?: string;
  taste?: string;
  isPack?: boolean; // true when item is a bundle pack
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  hasPackInCart: boolean;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.cartItemId === item.cartItemId);
      if (existing) {
        return prev.map((i) =>
          i.cartItemId === item.cartItemId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const hasPackInCart = items.some((i) => i.isPack === true);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, hasPackInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
