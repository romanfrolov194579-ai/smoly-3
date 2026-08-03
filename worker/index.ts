/**
 * SmolyShop — Cloudflare Worker.
 * Вся база хранится в Cloudflare KV (биндинг DB, см. wrangler.json):
 * один ключ "orders" со списком заказов. Никаких сложных СУБД.
 *
 * Деплой:  npx wrangler deploy
 * KV создать:  npx wrangler kv namespace create DB  →  id вставить в wrangler.json
 */

type Env = {
  DB: {
    get(key: string): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
  };
};

type OrderItem = { id: string; name: string; price: number; qty: number };
type OrderStatus = "pending" | "completed" | "declined";
type Order = {
  id: string;
  userId: number;
  username: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
};

const ADMINS = ["samarskiyyyy", "bocha_bich"];
const KEY = "orders";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });

const genId = () => {
  const abc = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return `SM-${s}`;
};

async function load(env: Env): Promise<Order[]> {
  const raw = await env.DB.get(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

async function save(env: Env, orders: Order[]) {
  await env.DB.put(KEY, JSON.stringify(orders));
}

const isAdmin = (name: string | null) =>
  !!name && ADMINS.includes(name.replace(/^@/, "").toLowerCase());

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const p = url.pathname;

    if (req.method === "OPTIONS") return json({ ok: true });

    // health
    if (p === "/api/health") return json({ ok: true, service: "smolyshop", ts: Date.now() });

    // заказы пользователя (админ получает все)
    if (p === "/api/orders" && req.method === "GET") {
      const userId = Number(url.searchParams.get("userId") ?? 0);
      const admin = url.searchParams.get("admin");
      const all = await load(env);
      const list = isAdmin(admin) ? all : all.filter((o) => o.userId === userId);
      return json(list.sort((a, b) => b.createdAt - a.createdAt));
    }

    // создание заказа
    if (p === "/api/orders" && req.method === "POST") {
      const body = (await req.json()) as {
        userId: number;
        username: string;
        items: OrderItem[];
        total: number;
      };
      if (!body.userId || !Array.isArray(body.items) || body.items.length === 0) {
        return json({ error: "bad payload" }, 400);
      }
      const order: Order = {
        id: genId(),
        userId: body.userId,
        username: body.username || `id${body.userId}`,
        items: body.items,
        total: body.total,
        status: "pending",
        createdAt: Date.now(),
      };
      const all = await load(env);
      await save(env, [order, ...all]);
      return json(order);
    }

    // админ: смена статуса
    const m = p.match(/^\/api\/admin\/orders\/([^/]+)\/status$/);
    if (m && req.method === "POST") {
      const admin = url.searchParams.get("admin");
      if (!isAdmin(admin)) return json({ error: "forbidden" }, 403);
      const { status } = (await req.json()) as { status: OrderStatus };
      if (!["completed", "declined"].includes(status)) return json({ error: "bad status" }, 400);
      const all = await load(env);
      const next = all.map((o) => (o.id === m[1] ? { ...o, status } : o));
      await save(env, next);
      return json(next);
    }

    // админ: статистика
    if (p === "/api/admin/stats" && req.method === "GET") {
      const admin = url.searchParams.get("admin");
      if (!isAdmin(admin)) return json({ error: "forbidden" }, 403);
      const all = await load(env);
      const done = all.filter((o) => o.status === "completed");
      const pend = all.filter((o) => o.status === "pending");
      return json({
        revenue: done.reduce((s, o) => s + o.total, 0),
        pendingSum: pend.reduce((s, o) => s + o.total, 0),
        pendingCount: pend.length,
        total: all.length,
      });
    }

    return json({ error: "not found" }, 404);
  },
};
