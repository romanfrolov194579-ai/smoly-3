import { useState } from "react";
import { ReceiptText, ChevronDown, Copy, RefreshCw } from "lucide-react";
import { cn } from "../utils/cn";
import { STATUS_META, fmtDate, fmtRub } from "../lib/data";
import type { Order } from "../lib/data";
import { useStore } from "../lib/store";
import { EmptyPulse, StatusChip } from "./ui";

function OrderCard({ o, index }: { o: Order; index: number }) {
  const [open, setOpen] = useState(false);
  const { toast } = useStore();
  const qty = o.items.reduce((s, i) => s + i.qty, 0);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(o.id);
      toast(`ID ${o.id} скопирован`, "ok");
    } catch {
      toast(o.id, "info");
    }
  };

  return (
    <div
      className={cn(
        "animate-rise overflow-hidden rounded-2xl bg-ink-850 ring-1 transition",
        o.status === "declined" ? "ring-bad-400/25" : "ring-white/6"
      )}
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <button onClick={() => setOpen((v) => !v)} className="w-full p-4 text-left">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-bold text-white">{o.id}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyId();
              }}
              aria-label="Скопировать ID"
              className="text-slate-500 transition hover:text-brand-400 active:scale-90"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
          <StatusChip status={o.status} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>{fmtDate(o.createdAt)}</span>
          <span>{qty} поз. · {fmtRub(o.total)}</span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {o.items.slice(0, 3).map((i) => (
            <span key={i.id} className="rounded-full bg-ink-800 px-2.5 py-1 text-[11px] text-slate-300 ring-1 ring-white/6">
              {i.name} ×{i.qty}
            </span>
          ))}
          {o.items.length > 3 && (
            <span className="rounded-full bg-ink-800 px-2.5 py-1 text-[11px] text-slate-500">
              +{o.items.length - 3}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-brand-400">
          <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300" style={{ transform: open ? "rotate(180deg)" : undefined }} />
          Подробнее
        </div>
      </button>
      <div className={cn("grid transition-all duration-300", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div
            className={cn(
              "mx-4 mb-4 rounded-xl px-3.5 py-3 text-xs leading-relaxed ring-1",
              o.status === "declined"
                ? "bg-bad-400/8 text-bad-400 ring-bad-400/25"
                : o.status === "completed"
                  ? "bg-ok-400/8 text-ok-400 ring-ok-400/25"
                  : "bg-warn-400/8 text-warn-400 ring-warn-400/25"
            )}
          >
            {STATUS_META[o.status].note}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const { orders, ordersLoading, refreshOrders } = useStore();

  return (
    <div className="px-4 pb-6">
      <div className="mb-5 flex items-center justify-between animate-rise">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Заказы</h1>
          <p className="mt-1 text-sm text-slate-400">История и статусы ваших покупок</p>
        </div>
        <button
          onClick={refreshOrders}
          aria-label="Обновить"
          className="grid h-10 w-10 place-items-center rounded-full bg-ink-800 text-slate-300 ring-1 ring-white/8 transition hover:text-white active:scale-90"
        >
          <RefreshCw className={cn("h-4 w-4", ordersLoading && "animate-spin")} />
        </button>
      </div>

      {ordersLoading && orders.length === 0 ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-ink-850 ring-1 ring-white/5" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyPulse
          icon={<ReceiptText className="h-9 w-9" />}
          title="Заказов пока нет"
          sub="Как только вы оформите первую покупку, она появится здесь со статусом"
        />
      ) : (
        <div className="space-y-3">
          {orders.map((o, i) => (
            <OrderCard key={o.id} o={o} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
