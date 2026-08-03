import type { Order, OrderItem, OrderStatus } from "./data";
import { genOrderId } from "./data";

/**
 * Клиент API SmolyShop.
 * В проде ходит в Cloudflare Worker (KV-база, см. worker/index.ts + wrangler.json).
 * В превью без воркера автоматически включается in-memory заглушка,
 * повторяющая контракт API — чтобы всё работало до деплоя.
 */

// Адрес воркера по умолчанию. Можно переопределить через VITE_API_URL при сборке.
const API_BASE =
  ((import.meta as any).env?.VITE_API_URL as string | undefined) ||
  "https://smoly-3.romanfrolov194579.workers.dev";

export type ApiMode = "worker" | "mock" | "checking";

let mode: ApiMode = "checking";
let note = "";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function probeApi(): Promise<ApiMode> {
  if (mode !== "checking") return mode;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(`${API_BASE}/api/health`, { signal: ctrl.signal });
    clearTimeout(t);
    const ct = res.headers.get("content-type") ?? "";
    if (res.ok && ct.includes("application/json")) {
      const body = (await res.json()) as { db?: boolean; dbError?: string };
      mode = "worker";
      if (body.db === false) {
        note = "Worker онлайн, но KV не подключён — проверь wrangler.json";
      }
    } else {
      mode = "mock";
    }
  } catch {
    mode = "mock";
    note = "Worker недоступен — включён локальный режим";
  }
  return mode;
}

export const getApiMode = () => mode;
export const getApiNote = () => note;

/* ---------------- in-memory заглушка (имитация KV) ---------------- */

let kv: Order[] = [];
const persist = () => kv; // в worker это env.DB

/* ---------------- единый контракт ---------------- */

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchOrders(userId: number, username: string, isAdmin: boolean): Promise<Order[]> {
  if (mode === "worker") {
    const q = isAdmin ? `?admin=${encodeURIComponent(username)}` : `?userId=${userId}`;
    return http<Order[]>(`/api/orders${q}`);
  }
  await delay(180);
  const list = isAdmin ? [...kv] : kv.filter((o) => o.userId === userId);
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export async function createOrder(
  user: { id: number; username: string },
  items: OrderItem[],
  total: number
): Promise<Order> {
  if (mode === "worker") {
    return http<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify({ userId: user.id, username: user.username, items, total }),
    });
  }
  await delay(320);
  const order: Order = {
    id: genOrderId(),
    userId: user.id,
    username: user.username || `id${user.id}`,
    items,
    total,
    status: "pending",
    createdAt: Date.now(),
  };
  kv = [order, ...kv];
  persist();
  return order;
}

export async function setOrderStatus(id: string, status: OrderStatus, adminUsername: string): Promise<Order[]> {
  if (mode === "worker") {
    return http<Order[]>(`/api/admin/orders/${id}/status?admin=${encodeURIComponent(adminUsername)}`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
  }
  await delay(220);
  kv = kv.map((o) => (o.id === id ? { ...o, status } : o));
  return [...kv];
}

export async function fetchStats(adminUsername: string): Promise<{ revenue: number; pendingSum: number; pendingCount: number; total: number }> {
  if (mode === "worker") return http(`/api/admin/stats?admin=${encodeURIComponent(adminUsername)}`);
  await delay(150);
  const done = kv.filter((o) => o.status === "completed");
  const pend = kv.filter((o) => o.status === "pending");
  return {
    revenue: done.reduce((s, o) => s + o.total, 0),
    pendingSum: pend.reduce((s, o) => s + o.total, 0),
    pendingCount: pend.length,
    total: kv.length,
  };
}
