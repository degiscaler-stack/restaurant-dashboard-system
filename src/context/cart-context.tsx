"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { deliveryFeeFromBand, type DeliveryBand } from "@/lib/delivery";

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  deliveryBand: DeliveryBand | null;
  setDeliveryBand: (b: DeliveryBand | null) => void;
  addItem: (p: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  setQty: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  orderTypePreview: "DELIVERY" | "PICKUP";
  setOrderTypePreview: (t: "DELIVERY" | "PICKUP") => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE = "baraka_cart_v1";

type Stored = {
  items: CartItem[];
  deliveryBand: DeliveryBand | null;
  orderTypePreview: "DELIVERY" | "PICKUP";
};

function load(): Stored {
  if (typeof window === "undefined") {
    return { items: [], deliveryBand: "UNDER_3_KM", orderTypePreview: "DELIVERY" };
  }
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) {
      return { items: [], deliveryBand: "UNDER_3_KM", orderTypePreview: "DELIVERY" };
    }
    return JSON.parse(raw) as Stored;
  } catch {
    return { items: [], deliveryBand: "UNDER_3_KM", orderTypePreview: "DELIVERY" };
  }
}

function save(s: Stored) {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryBand, setDeliveryBandState] = useState<DeliveryBand | null>(
    "UNDER_3_KM",
  );
  const [orderTypePreview, setOrderTypePreview] = useState<"DELIVERY" | "PICKUP">(
    "DELIVERY",
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = load();
    setItems(s.items);
    setDeliveryBandState(s.deliveryBand ?? "UNDER_3_KM");
    setOrderTypePreview(s.orderTypePreview ?? "DELIVERY");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    save({ items, deliveryBand, orderTypePreview });
  }, [items, deliveryBand, orderTypePreview, ready]);

  const setDeliveryBand = useCallback((b: DeliveryBand | null) => {
    setDeliveryBandState(b);
  }, []);

  const addItem = useCallback(
    (p: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      const q = p.quantity ?? 1;
      setItems((prev) => {
        const idx = prev.findIndex((x) => x.productId === p.productId);
        if (idx === -1) {
          return [
            ...prev,
            {
              productId: p.productId,
              name: p.name,
              slug: p.slug,
              price: p.price,
              image: p.image,
              quantity: q,
            },
          ];
        }
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + q };
        return next;
      });
    },
    [],
  );

  const setQty = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((x) => x.productId !== productId);
      return prev.map((x) =>
        x.productId === productId ? { ...x, quantity } : x,
      );
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((x) => x.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((s, it) => s + it.price * it.quantity, 0),
    [items],
  );

  const deliveryFee = useMemo(() => {
    if (orderTypePreview !== "DELIVERY") return 0;
    return deliveryFeeFromBand(deliveryBand ?? undefined);
  }, [deliveryBand, orderTypePreview]);

  const total = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee]);

  const value = useMemo(
    () => ({
      items,
      deliveryBand,
      setDeliveryBand,
      addItem,
      setQty,
      removeItem,
      clear,
      subtotal,
      deliveryFee,
      total,
      orderTypePreview,
      setOrderTypePreview,
    }),
    [
      items,
      deliveryBand,
      setDeliveryBand,
      addItem,
      setQty,
      removeItem,
      clear,
      subtotal,
      deliveryFee,
      total,
      orderTypePreview,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
