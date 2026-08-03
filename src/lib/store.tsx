import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ADMINS, PRODUCTS } from "./data";
import type { CartLine, Order, OrderItem } from "./data";
import * as api from "./api";
import { devUsers, initTelegram, isInTelegram, parseTelegramProfile } from "./telegram";
import type { TgUser } from "./telegram";

export type Toast = { id: number; text: string; kind: "ok" | "bad" | "info" };

type Store = {
  user: TgUser;
  isAdmin: boolean;
  inTelegram: boolean;
  apiMode: api.ApiMode;
  cart: CartLine[];
  cartCount: number;
  cartTotal: number;
  orders: Order[];
  ordersLoading: boolean;
  toasts: Toast[];
  devUser: TgUser | null;
  setDevUser: (u: TgUser) => void;
  addToCart: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  checkout: () => Promise<Order | null>;
  refreshOrders: () => Promise<void>;
  adminSetStatus: (id: string, status: "completed" | "declined") => Promise<void>;
  toast: (text: string, kind?: Toast["kind"]) => void;
};

const Ctx = createContext<Store | null>(null);

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("StoreProvider missing");
  return v;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [inTelegram] = useState(isInTelegram);
  const [devUser, setDevUser] = useState<TgUser | null>(null);
  const [apiMode, setApiMode] = useState<api.ApiMode>("checking");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    initTelegram();
    api.probeApi().then(setApiMode);
  }, []);

  const tgUser = useMemo(() => parseTelegramProfile(), []);
  const user: TgUser = useMemo(() => {
    if (inTelegram && tgUser) return tgUser;
    return devUser ?? devUsers()[0];
  }, [inTelegram, tgUser, devUser]);

  const isAdmin = useMemo(
    () => ADMINS.includes((user.username || "").toLowerCase()),
    [user.username]
  );

  const toast = useCallback((text: string, kind: Toast["kind"] = "info") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  const addToCart = useCallback((productId: string) => {
    const p = PRODUCTS.find((x) => x.id === productId);
    if (!p) return;
    setCart((c) => {
      const line = c.find((l) => l.productId === productId);
      if (line) {
        if (line.qty >= p.stock) return c;
        return c.map((l) => (l.productId === productId ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...c, { productId, qty: 1 }];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    const p = PRODUCTS.find((x) => x.id === productId);
    const max = p?.stock ?? 99;
    setCart((c) =>
      qty <= 0
        ? c.filter((l) => l.productId !== productId)
        : c.map((l) => (l.productId === productId ? { ...l, qty: Math.min(qty, max) } : l))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const { cartCount, cartTotal } = useMemo(() => {
    let n = 0;
    let sum = 0;
    for (const l of cart) {
      const p = PRODUCTS.find((x) => x.id === l.productId);
      if (!p) continue;
      n += l.qty;
      sum += p.price * l.qty;
    }
    return { cartCount: n, cartTotal: sum };
  }, [cart]);

  const refreshOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const list = await api.fetchOrders(user.id, user.username, isAdmin);
      setOrders(list);
    } catch {
      toast("Не удалось загрузить заказы", "bad");
    } finally {
      setOrdersLoading(false);
    }
  }, [user.id, user.username, isAdmin, toast]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const checkout = useCallback(async (): Promise<Order | null> => {
    if (cart.length === 0) return null;
    const items: OrderItem[] = cart
      .map((l) => {
        const p = PRODUCTS.find((x) => x.id === l.productId)!;
        return { id: p.id, name: p.name, price: p.price, qty: l.qty };
      })
      .filter(Boolean);
    try {
      const order = await api.createOrder({ id: user.id, username: user.username }, items, cartTotal);
      setCart([]);
      await refreshOrders();
      return order;
    } catch {
      toast("Ошибка при оформлении заказа", "bad");
      return null;
    }
  }, [cart, cartTotal, user, refreshOrders, toast]);

  const adminSetStatus = useCallback(
    async (id: string, status: "completed" | "declined") => {
      try {
        const all = await api.setOrderStatus(id, status, user.username);
        setOrders(isAdmin ? all.sort((a, b) => b.createdAt - a.createdAt) : all);
        await refreshOrders();
      } catch {
        toast("Не удалось обновить заказ", "bad");
      }
    },
    [isAdmin, refreshOrders, toast]
  );

  const value: Store = {
    user,
    isAdmin,
    inTelegram,
    apiMode,
    cart,
    cartCount,
    cartTotal,
    orders,
    ordersLoading,
    toasts,
    devUser,
    setDevUser,
    addToCart,
    setQty,
    clearCart,
    checkout,
    refreshOrders,
    adminSetStatus,
    toast,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
