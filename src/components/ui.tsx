import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Wallet, Tag, Landmark, MessagesSquare, ShoppingBag, Smartphone, Coins, CreditCard,
  Building2, PiggyBank, Minus, Plus, X, CheckCircle2, Clock, AlertTriangle,
} from "lucide-react";
import { cn } from "../utils/cn";
import { STATUS_META } from "../lib/data";
import type { OrderStatus } from "../lib/data";
import { useStore } from "../lib/store";

/* ---------- иконки товаров ---------- */

const ICONS: Record<string, typeof Wallet> = {
  wallet: Wallet, tag: Tag, landmark: Landmark, message: MessagesSquare,
  bag: ShoppingBag, sim: Smartphone, coins: Coins, card: CreditCard,
  building: Building2, piggy: PiggyBank,
};

export function ProductIcon({ icon, className }: { icon: string; className?: string }) {
  const I = ICONS[icon] ?? Wallet;
  return <I className={className} strokeWidth={1.9} />;
}

/* ---------- пульсирующий empty-state ---------- */

export function EmptyPulse({
  icon, title, sub,
}: { icon: ReactNode; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-rise">
      <div className="relative mb-6 grid place-items-center">
        <span className="absolute h-24 w-24 rounded-full bg-brand-500/25 animate-pulse-ring" />
        <span className="absolute h-24 w-24 rounded-full bg-brand-500/15 animate-pulse-ring [animation-delay:0.7s]" />
        <div className="relative grid h-24 w-24 place-items-center rounded-full bg-ink-800 ring-1 ring-brand-500/30 text-brand-400">
          {icon}
        </div>
      </div>
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-[240px] text-sm leading-relaxed text-slate-400">{sub}</p>
    </div>
  );
}

/* ---------- чип статуса заказа ---------- */

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-warn-400/12 text-warn-400 ring-warn-400/30",
  completed: "bg-ok-400/12 text-ok-400 ring-ok-400/30",
  declined: "bg-bad-400/12 text-bad-400 ring-bad-400/30",
};

const STATUS_ICON: Record<OrderStatus, typeof Clock> = {
  pending: Clock, completed: CheckCircle2, declined: AlertTriangle,
};

export function StatusChip({ status }: { status: OrderStatus }) {
  const I = STATUS_ICON[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1", STATUS_STYLE[status])}>
      <I className="h-3.5 w-3.5" />
      {STATUS_META[status].label}
    </span>
  );
}

/* ---------- степпер количества ---------- */

export function QtyStepper({
  qty, max, onChange, small,
}: { qty: number; max: number; onChange: (q: number) => void; small?: boolean }) {
  const btn = cn(
    "grid place-items-center rounded-full bg-ink-700 text-slate-200 transition active:scale-90 hover:bg-ink-600",
    small ? "h-7 w-7" : "h-9 w-9"
  );
  return (
    <div className="flex items-center gap-2.5">
      <button aria-label="Меньше" className={btn} onClick={() => onChange(qty - 1)}>
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={cn("font-display tabular-nums font-semibold text-white", small ? "w-5 text-sm" : "w-6")}>{qty}</span>
      <button
        aria-label="Больше"
        className={cn(btn, qty >= max && "opacity-35 pointer-events-none")}
        onClick={() => onChange(qty + 1)}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ---------- bottom sheet ---------- */

export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) setMounted(true);
    else {
      const t = setTimeout(() => setMounted(false), 280);
      return () => clearTimeout(t);
    }
  }, [open]);
  if (!mounted) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className={cn("absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full max-w-md rounded-t-3xl bg-ink-850 ring-1 ring-white/8 px-5 pt-3 pb-6 safe-b transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/15" />
        {children}
      </div>
    </div>
  );
}

/* ---------- тосты ---------- */

export function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "animate-toast rounded-full px-4 py-2.5 text-sm font-medium shadow-xl ring-1 backdrop-blur",
            t.kind === "ok" && "bg-ok-400/15 text-ok-400 ring-ok-400/30",
            t.kind === "bad" && "bg-bad-400/15 text-bad-400 ring-bad-400/30",
            t.kind === "info" && "bg-ink-700/90 text-slate-100 ring-white/10"
          )}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}

/* ---------- крестик для sheet ---------- */

export function CloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      aria-label="Закрыть"
      className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/6 text-slate-300 transition hover:bg-white/12 active:scale-90"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
