import { useState } from "react";
import { Store, ShoppingCart, ReceiptText, ShieldAlert, Cpu, Wifi, WifiOff } from "lucide-react";
import { cn } from "./utils/cn";
import { StoreProvider, useStore } from "./lib/store";
import { getApiNote } from "./lib/api";
import { devUsers } from "./lib/telegram";
import Shop from "./components/Shop";
import Cart from "./components/Cart";
import Orders from "./components/Orders";
import Admin from "./components/Admin";
import { Sheet, CloseBtn, Toasts } from "./components/ui";

type Tab = "shop" | "cart" | "orders" | "admin";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden>
        <defs>
          <linearGradient id="lg" x1="4" y1="4" x2="28" y2="28">
            <stop stopColor="#7fb0ff" />
            <stop offset="1" stopColor="#1e54e6" />
          </linearGradient>
        </defs>
        <path
          d="M16 2c1.2 6.9 2.4 9.6 5 11.5 2 1.5 4.6 2.2 9 2.5-4.4.3-7 1-9 2.5-2.6 1.9-3.8 4.6-5 11.5-1.2-6.9-2.4-9.6-5-11.5-2-1.5-4.6-2.2-9-2.5 4.4-.3 7-1 9-2.5 2.6-1.9 3.8-4.6 5-11.5Z"
          fill="url(#lg)"
        />
      </svg>
      <span className="font-display text-lg tracking-tight">
        <span className="font-bold text-white">Smoly</span>
        <span className="font-light text-brand-300">Shop</span>
      </span>
    </div>
  );
}

function ProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, inTelegram, isAdmin, apiMode, devUser, setDevUser, toast } = useStore();
  const initials = (user.firstName[0] ?? "U").toUpperCase();
  const apiNote = getApiNote();

  return (
    <Sheet open={open} onClose={onClose}>
      <CloseBtn onClose={onClose} />
      <div className="flex items-center gap-3.5">
        <div className="relative">
          {user.photoUrl ? (
            <img src={user.photoUrl} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-brand-500/50" />
          ) : (
            <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-display text-lg font-bold text-white ring-2 ring-brand-500/50">
              {initials}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-ink-850 bg-ok-400" />
        </div>
        <div className="min-w-0">
          <div className="font-display text-base font-semibold text-white">
            {user.firstName} {user.lastName ?? ""}
          </div>
          <div className="text-sm text-brand-300">@{user.username || "без username"}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
        <div className="rounded-xl bg-ink-800 px-3.5 py-3 ring-1 ring-white/6">
          <div className="text-slate-500">Telegram ID</div>
          <div className="mt-0.5 font-semibold tabular-nums text-white">{user.id}</div>
        </div>
        <div className="rounded-xl bg-ink-800 px-3.5 py-3 ring-1 ring-white/6">
          <div className="text-slate-500">Язык</div>
          <div className="mt-0.5 font-semibold text-white">{(user.lang ?? "ru").toUpperCase()}</div>
        </div>
        <div className="rounded-xl bg-ink-800 px-3.5 py-3 ring-1 ring-white/6">
          <div className="text-slate-500">Роль</div>
          <div className={cn("mt-0.5 font-semibold", isAdmin ? "text-gold-400" : "text-white")}>
            {isAdmin ? "Администратор" : "Покупатель"}
          </div>
        </div>
        <div className="rounded-xl bg-ink-800 px-3.5 py-3 ring-1 ring-white/6">
          <div className="text-slate-500">База</div>
          <div className="mt-0.5 flex items-center gap-1.5 font-semibold text-white">
            {apiMode === "worker" ? <Wifi className="h-3.5 w-3.5 text-ok-400" /> : <WifiOff className="h-3.5 w-3.5 text-warn-400" />}
            {apiMode === "worker" ? "KV Worker" : "локально"}
          </div>
        </div>
      </div>

      {apiNote && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-warn-400/10 px-3.5 py-3 text-xs leading-relaxed text-warn-400 ring-1 ring-warn-400/25">
          <WifiOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {apiNote}
        </div>
      )}

      {!inTelegram && (
        <div className="mt-4 rounded-xl bg-ink-800 p-3.5 ring-1 ring-white/6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Cpu className="h-3.5 w-3.5 text-brand-400" />
            Dev-режим: смена пользователя
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {devUsers().map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setDevUser(u);
                  toast(`Вы вошли как @${u.username}`, "info");
                  onClose();
                }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition active:scale-95",
                  (devUser?.id ?? devUsers()[0].id) === u.id
                    ? "bg-brand-500 text-white ring-brand-500"
                    : "bg-ink-700 text-slate-300 ring-white/8 hover:ring-white/20"
                )}
              >
                @{u.username}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            Внутри Telegram профиль парсится автоматически из initData WebApp.
          </p>
        </div>
      )}

      <button
        onClick={onClose}
        className="mt-4 w-full rounded-xl bg-ink-700 py-3 text-sm font-semibold text-white transition hover:bg-ink-600 active:scale-[0.98]"
      >
        Закрыть
      </button>
    </Sheet>
  );
}

function Shell() {
  const [tab, setTab] = useState<Tab>("shop");
  const [profile, setProfile] = useState(false);
  const { cartCount, isAdmin, user } = useStore();

  const nav: { id: Tab; label: string; icon: typeof Store; show: boolean }[] = [
    { id: "shop", label: "Магазин", icon: Store, show: true },
    { id: "cart", label: "Корзина", icon: ShoppingCart, show: true },
    { id: "orders", label: "Заказы", icon: ReceiptText, show: true },
    { id: "admin", label: "Админ", icon: ShieldAlert, show: isAdmin },
  ];

  const initials = (user.firstName[0] ?? "U").toUpperCase();

  return (
    <div className="relative mx-auto flex h-full max-w-md flex-col">
      {/* фоновые слои */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-ink-950" />
        <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-600/25 blur-[110px] animate-drift" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-brand-500/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(79,141,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79,141,255,0.05) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse at top, black 10%, transparent 70%)",
          }}
        />
      </div>

      {/* шапка */}
      <header className="sticky top-0 z-30 border-b border-white/6 bg-ink-950/80 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <Logo />
          <button
            onClick={() => setProfile(true)}
            aria-label="Профиль"
            className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-ink-800 ring-1 ring-white/10 transition hover:ring-brand-500/50 active:scale-95"
          >
            {user.photoUrl ? (
              <img src={user.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-sm font-bold text-brand-300">{initials}</span>
            )}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-ink-950 bg-ok-400" />
          </button>
        </div>
      </header>

      {/* контент */}
      <main className="flex-1 overflow-y-auto pt-5 pb-28">
        <div className={tab === "shop" ? "" : "hidden"}><Shop /></div>
        <div className={tab === "cart" ? "" : "hidden"}><Cart /></div>
        <div className={tab === "orders" ? "" : "hidden"}><Orders /></div>
        <div className={tab === "admin" ? "" : "hidden"}><Admin /></div>
      </main>

      {/* нижняя навигация */}
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-white/6 bg-ink-900/90 backdrop-blur-xl safe-b">
        <div className={cn("grid", nav.filter((n) => n.show).length === 4 ? "grid-cols-4" : "grid-cols-3")}>
          {nav.filter((n) => n.show).map((n) => {
            const active = tab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-3 text-[11px] font-semibold transition",
                  active ? "text-brand-400" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <span className={cn("absolute top-0 h-0.5 w-8 rounded-full bg-brand-500 transition-all", active ? "opacity-100" : "opacity-0")} />
                <span className="relative">
                  <n.icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                  {n.id === "cart" && cartCount > 0 && (
                    <span
                      key={cartCount}
                      className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 animate-pop place-items-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white"
                    >
                      {cartCount}
                    </span>
                  )}
                </span>
                {n.label}
              </button>
            );
          })}
        </div>
      </nav>

      <ProfileSheet open={profile} onClose={() => setProfile(false)} />
      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
