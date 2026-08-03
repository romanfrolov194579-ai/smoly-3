import { useEffect, useState } from "react";
import {
  TrendingUp, Hourglass, PackageCheck, Check, X, Loader2, ShieldAlert, Lock, Banknote, Inbox,
} from "lucide-react";
import { cn } from "../utils/cn";
import { fmtDate, fmtRub } from "../lib/data";
import type { Order } from "../lib/data";
import { fetchStats } from "../lib/api";
import { useStore } from "../lib/store";
import { StatusChip } from "./ui";

type Stats = { revenue: number; pendingSum: number; pendingCount: number; total: number };

function AdminOrder({ o, index }: { o: Order; index: number }) {
  const { adminSetStatus, toast } = useStore();
  const [busy, setBusy] = useState<"completed" | "declined" | null>(null);

  const act = async (status: "completed" | "declined") => {
    setBusy(status);
    await adminSetStatus(o.id, status);
    setBusy(null);
    toast(
      status === "completed" ? `${o.id} принят` : `${o.id} отклонён`,
      status === "completed" ? "ok" : "bad"
    );
  };

  return (
    <div
      className="animate-rise rounded-2xl bg-ink-850 p-4 ring-1 ring-white/6"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-sm font-bold text-white">{o.id}</div>
          <div className="mt-0.5 text-xs text-slate-500">
            @{o.username} · {fmtDate(o.createdAt)}
          </div>
        </div>
        <StatusChip status={o.status} />
      </div>

      <div className="mt-3 space-y-1.5 rounded-xl bg-ink-800 px-3.5 py-3">
        {o.items.map((i) => (
          <div key={i.id} className="flex justify-between text-xs">
            <span className="text-slate-300">{i.name} ×{i.qty}</span>
            <span className="tabular-nums text-slate-400">{fmtRub(i.price * i.qty)}</span>
          </div>
        ))}
        <div className="mt-1 flex justify-between border-t border-white/8 pt-2 text-sm font-semibold">
          <span className="text-slate-200">Итого</span>
          <span className="tabular-nums text-white">{fmtRub(o.total)}</span>
        </div>
      </div>

      {o.status === "pending" && (
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <button
            onClick={() => act("completed")}
            disabled={busy !== null}
            className="flex items-center justify-center gap-2 rounded-xl bg-ok-400/15 py-2.5 text-sm font-semibold text-ok-400 ring-1 ring-ok-400/30 transition hover:bg-ok-400/25 active:scale-[0.97] disabled:opacity-50"
          >
            {busy === "completed" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Принять
          </button>
          <button
            onClick={() => act("declined")}
            disabled={busy !== null}
            className="flex items-center justify-center gap-2 rounded-xl bg-bad-400/15 py-2.5 text-sm font-semibold text-bad-400 ring-1 ring-bad-400/30 transition hover:bg-bad-400/25 active:scale-[0.97] disabled:opacity-50"
          >
            {busy === "declined" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            Отклонить
          </button>
        </div>
      )}
      {o.status !== "pending" && (
        <div className={cn(
          "mt-3 rounded-xl px-3.5 py-2.5 text-xs font-medium ring-1",
          o.status === "completed" ? "bg-ok-400/8 text-ok-400 ring-ok-400/20" : "bg-bad-400/8 text-bad-400 ring-bad-400/20"
        )}>
          {o.status === "completed" ? "Заказ принят, данные выданы клиенту" : "Отклонён — клиенту показана ошибка оплаты"}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const { isAdmin, orders, user } = useStore();
  const [stats, setStats] = useState<Stats>({ revenue: 0, pendingSum: 0, pendingCount: 0, total: 0 });

  useEffect(() => {
    if (!isAdmin) return;
    let live = true;
    const load = () => fetchStats(user.username).then((s) => live && setStats(s));
    load();
    const t = setInterval(load, 5000);
    return () => {
      live = false;
      clearInterval(t);
    };
  }, [isAdmin, orders]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center px-6 py-20 text-center animate-rise">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-bad-400/12 text-bad-400 ring-1 ring-bad-400/25">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className="mt-4 font-display text-lg font-semibold text-white">Доступ закрыт</h2>
        <p className="mt-2 max-w-[260px] text-sm text-slate-400">
          Админ-панель доступна только владельцам магазина.
        </p>
      </div>
    );
  }

  const cards = [
    { icon: Banknote, label: "Общий доход", value: fmtRub(stats.revenue), tone: "text-ok-400 bg-ok-400/12 ring-ok-400/25" },
    { icon: Hourglass, label: "В ожидании", value: fmtRub(stats.pendingSum), sub: `${stats.pendingCount} зак.`, tone: "text-warn-400 bg-warn-400/12 ring-warn-400/25" },
    { icon: PackageCheck, label: "Всего заказов", value: String(stats.total), tone: "text-brand-300 bg-brand-500/12 ring-brand-500/25" },
  ];

  const pending = orders.filter((o) => o.status === "pending");
  const rest = orders.filter((o) => o.status !== "pending");

  return (
    <div className="px-4 pb-6">
      <div className="mb-5 animate-rise">
        <div className="flex items-center gap-2 text-brand-400">
          <ShieldAlert className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">Админ-панель</span>
        </div>
        <h1 className="mt-1 font-display text-2xl font-bold text-white">SmolyShop</h1>
        <p className="mt-1 text-sm text-slate-400">Вы вошли как @{user.username}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 animate-rise rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-4 shadow-lg shadow-brand-700/30 ring-1 ring-white/10">
          <div className="flex items-center gap-2 text-brand-300">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Общий доход</span>
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-white tabular-nums">{fmtRub(stats.revenue)}</div>
          <div className="mt-1 text-xs text-brand-300/80">по оплаченным заказам</div>
        </div>
        {cards.slice(1).map((c, i) => (
          <div key={c.label} className="animate-rise rounded-2xl bg-ink-850 p-4 ring-1 ring-white/6" style={{ animationDelay: `${(i + 1) * 60}ms` }}>
            <div className={cn("grid h-9 w-9 place-items-center rounded-xl ring-1", c.tone)}>
              <c.icon className="h-4 w-4" />
            </div>
            <div className="mt-3 font-display text-lg font-bold text-white tabular-nums">{c.value}</div>
            <div className="text-xs text-slate-500">{c.label}{c.sub ? ` · ${c.sub}` : ""}</div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-white">
          <Hourglass className="h-4 w-4 text-warn-400" />
          Ожидают решения
          <span className="rounded-full bg-warn-400/15 px-2 py-0.5 text-[11px] font-bold text-warn-400">{pending.length}</span>
        </h2>
        {pending.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl bg-ink-850 py-10 text-center ring-1 ring-white/6">
            <div className="relative grid place-items-center">
              <span className="absolute h-14 w-14 rounded-full bg-warn-400/20 animate-pulse-ring" />
              <Inbox className="relative h-7 w-7 text-warn-400" />
            </div>
            <p className="mt-3 text-sm text-slate-400">Новых заказов нет</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((o, i) => (
              <AdminOrder key={o.id} o={o} index={i} />
            ))}
          </div>
        )}
      </div>

      {rest.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 font-display text-sm font-semibold text-white">Обработанные</h2>
          <div className="space-y-3">
            {rest.map((o, i) => (
              <AdminOrder key={o.id} o={o} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
