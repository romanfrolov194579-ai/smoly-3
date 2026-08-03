import { useMemo, useState } from "react";
import { Globe2, ShieldCheck, Gem, Sparkles } from "lucide-react";
import { cn } from "../utils/cn";
import { GROUPS, PRODUCTS, fmtRub } from "../lib/data";
import type { GroupId, Product } from "../lib/data";
import { useStore } from "../lib/store";
import { ProductIcon, QtyStepper } from "./ui";

const GROUP_ACCENT: Record<GroupId, { pill: string; icon: string; glow: string }> = {
  services: { pill: "from-brand-500 to-brand-600", icon: "text-brand-300 bg-brand-500/15 ring-brand-500/25", glow: "bg-brand-500/20" },
  sims: { pill: "from-sky-500 to-cyan-600", icon: "text-cyan-300 bg-cyan-500/15 ring-cyan-500/25", glow: "bg-cyan-500/20" },
  banks: { pill: "from-gold-500 to-amber-600", icon: "text-gold-400 bg-gold-500/15 ring-gold-500/25", glow: "bg-gold-500/15" },
};

function HeroPills() {
  const stats = useMemo(() => {
    const min = (g: GroupId) => Math.min(...PRODUCTS.filter((p) => p.group === g).map((p) => p.price));
    return { services: min("services"), sims: min("sims"), banks: min("banks") };
  }, []);
  const pills = [
    { g: "services" as GroupId, label: "Сервисы", icon: Globe2, from: stats.services },
    { g: "banks" as GroupId, label: "Банки", icon: ShieldCheck, from: stats.banks },
    { g: "sims" as GroupId, label: "Симки", icon: Gem, from: stats.sims },
  ];
  return (
    <div className="flex flex-wrap gap-2.5">
      {pills.map((p, i) => (
        <div key={p.g} className="relative animate-rise" style={{ animationDelay: `${i * 70}ms` }}>
          <div className={cn("flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2.5 shadow-lg shadow-black/40", GROUP_ACCENT[p.g].pill)}>
            <p.icon className="h-4 w-4 text-white" />
            <span className="font-display text-sm font-semibold text-white">{p.label}</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white/95 backdrop-blur">
              от {p.from} ₽
            </span>
          </div>
          {i === 1 && (
            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gold-500/90 px-2.5 py-0.5 text-[10px] font-bold text-ink-950 shadow">
              Best seller
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function ProductCard({ p, index }: { p: Product; index: number }) {
  const { cart, addToCart, setQty } = useStore();
  const line = cart.find((l) => l.productId === p.id);
  const accent = GROUP_ACCENT[p.group];

  return (
    <article
      className="group relative animate-rise overflow-hidden rounded-2xl bg-ink-850 p-4 ring-1 ring-white/6 transition duration-300 hover:ring-brand-500/40 card-glow"
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
    >
      <div className={cn("pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl transition-opacity duration-300 opacity-40 group-hover:opacity-80", accent.glow)} />
      <div className="relative flex items-start gap-3.5">
        <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl ring-1", accent.icon)}>
          <ProductIcon icon={p.icon} className="h-5.5 w-5.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[15px] font-semibold text-white">{p.name}</h3>
            {p.tag && (
              <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-bold text-gold-400 ring-1 ring-gold-500/30">
                {p.tag}
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">{p.desc}</p>
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between">
        <div>
          <div className="font-display text-lg font-bold text-white">{fmtRub(p.price)}</div>
          <div className="text-[11px] text-slate-500">в наличии: {p.stock} шт.</div>
        </div>
        {line ? (
          <div className="animate-pop rounded-full bg-ink-800 px-3 py-1.5 ring-1 ring-brand-500/40">
            <QtyStepper small qty={line.qty} max={p.stock} onChange={(q) => setQty(p.id, q)} />
          </div>
        ) : (
          <button
            onClick={() => addToCart(p.id)}
            className="rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:brightness-110 active:scale-95"
          >
            В корзину
          </button>
        )}
      </div>
    </article>
  );
}

export default function Shop() {
  const [filter, setFilter] = useState<GroupId | "all">("all");
  const list = useMemo(
    () => (filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.group === filter)),
    [filter]
  );

  return (
    <div className="px-4 pb-6">
      <div className="mb-5 animate-rise">
        <div className="flex items-center gap-2 text-brand-400">
          <Sparkles className="h-4 w-4 animate-shine" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">Каталог аккаунтов</span>
        </div>
        <h1 className="mt-1 font-display text-2xl font-bold text-white">Купить акк</h1>
      </div>

      <div className="mb-6">
        <HeroPills />
      </div>

      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition active:scale-95",
            filter === "all" ? "bg-white text-ink-950 ring-white" : "bg-ink-800 text-slate-300 ring-white/8 hover:ring-white/20"
          )}
        >
          Все
        </button>
        {GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => setFilter(g.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition active:scale-95",
              filter === g.id ? "bg-gradient-to-r text-white ring-transparent " + GROUP_ACCENT[g.id].pill : "bg-ink-800 text-slate-300 ring-white/8 hover:ring-white/20"
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div key={filter} className="grid grid-cols-1 gap-3">
        {list.map((p, i) => (
          <ProductCard key={p.id} p={p} index={i} />
        ))}
      </div>
    </div>
  );
}
