import { useState } from "react";
import { ShoppingCart, Trash2, ArrowRight, Loader2, ShieldCheck, BadgeCheck } from "lucide-react";
import { PRODUCTS, fmtRub } from "../lib/data";
import { useStore } from "../lib/store";
import { EmptyPulse, QtyStepper, Sheet, CloseBtn, ProductIcon } from "./ui";

export default function Cart() {
  const { cart, setQty, cartTotal, cartCount, checkout, toast } = useStore();
  const [sheet, setSheet] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const lines = cart
    .map((l) => ({ l, p: PRODUCTS.find((x) => x.id === l.productId)! }))
    .filter((x) => x.p);

  const submit = async () => {
    setBusy(true);
    const order = await checkout();
    setBusy(false);
    if (order) {
      setDone(true);
      toast(`Заказ ${order.id} создан`, "ok");
      setTimeout(() => {
        setSheet(false);
        setDone(false);
      }, 1400);
    }
  };

  if (lines.length === 0) {
    return (
      <div className="px-4">
        <h1 className="mb-2 font-display text-2xl font-bold text-white">Корзина</h1>
        <EmptyPulse
          icon={<ShoppingCart className="h-9 w-9" />}
          title="Корзина пуста"
          sub="Загляните в каталог — там свежие аккаунты по всем направлениям"
        />
      </div>
    );
  }

  return (
    <div className="px-4 pb-6">
      <div className="mb-5 flex items-end justify-between animate-rise">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Корзина</h1>
          <p className="mt-1 text-sm text-slate-400">{cartCount} поз. на {fmtRub(cartTotal)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {lines.map(({ l, p }, i) => (
          <div
            key={p.id}
            className="animate-rise flex items-center gap-3 rounded-2xl bg-ink-850 p-3.5 ring-1 ring-white/6"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500/12 text-brand-300 ring-1 ring-brand-500/25">
              <ProductIcon icon={p.icon} className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-sm font-semibold text-white">{p.name}</div>
              <div className="text-xs text-slate-500">{fmtRub(p.price)} / шт.</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                aria-label="Удалить"
                onClick={() => setQty(p.id, 0)}
                className="text-slate-500 transition hover:text-bad-400 active:scale-90"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <QtyStepper small qty={l.qty} max={p.stock} onChange={(q) => setQty(p.id, q)} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-ink-850 p-4 ring-1 ring-white/6 animate-rise">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Товары ({cartCount})</span>
          <span className="tabular-nums">{fmtRub(cartTotal)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
          <span>Комиссия</span>
          <span className="text-ok-400">0 ₽</span>
        </div>
        <div className="my-3 h-px bg-white/8" />
        <div className="flex items-center justify-between">
          <span className="font-display font-semibold text-white">Итого</span>
          <span className="font-display text-xl font-bold text-white tabular-nums">{fmtRub(cartTotal)}</span>
        </div>
        <button
          onClick={() => setSheet(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3.5 font-display text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:brightness-110 active:scale-[0.98]"
        >
          Оформить заказ
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <Sheet open={sheet} onClose={() => !busy && setSheet(false)}>
        <CloseBtn onClose={() => !busy && setSheet(false)} />
        {done ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-ok-400/15 text-ok-400 ring-1 ring-ok-400/30 animate-pop">
              <BadgeCheck className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-white">Заказ создан</h3>
            <p className="mt-1 text-sm text-slate-400">Ожидает подтверждения оплаты</p>
          </div>
        ) : (
          <>
            <h3 className="font-display text-lg font-semibold text-white">Подтверждение</h3>
            <p className="mt-1 text-sm text-slate-400">Проверьте состав заказа перед оплатой.</p>
            <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
              {lines.map(({ l, p }) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl bg-ink-800 px-3 py-2.5 text-sm">
                  <span className="text-slate-200">{p.name} <span className="text-slate-500">× {l.qty}</span></span>
                  <span className="font-semibold tabular-nums text-white">{fmtRub(p.price * l.qty)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-500/10 px-4 py-3 ring-1 ring-brand-500/25">
              <span className="text-sm font-medium text-brand-300">К оплате</span>
              <span className="font-display text-lg font-bold text-white tabular-nums">{fmtRub(cartTotal)}</span>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-ink-800 px-3.5 py-3 text-xs leading-relaxed text-slate-400">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
              Оплата подключается отдельно. Сейчас заказ уходит оператору на ручное подтверждение — статус появится в «Заказах».
            </div>
            <button
              onClick={submit}
              disabled={busy}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3.5 font-display text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Подтвердить заказ"}
            </button>
          </>
        )}
      </Sheet>
    </div>
  );
}
