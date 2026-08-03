// Парсинг профиля Telegram WebApp + dev-режим для предпросмотра вне TG

export type TgUser = {
  id: number;
  username: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  lang?: string;
  inTelegram: boolean;
};

type RawTg = {
  ready?: () => void;
  expand?: () => void;
  setHeaderColor?: (c: string) => void;
  setBackgroundColor?: (c: string) => void;
  initDataUnsafe?: {
    user?: {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
      photo_url?: string;
      language_code?: string;
    };
  };
};

declare global {
  interface Window {
    Telegram?: { WebApp?: RawTg };
  }
}

const DEV_USERS: TgUser[] = [
  { id: 1001, username: "ivan_test", firstName: "Иван", lastName: "Тестов", inTelegram: false, lang: "ru" },
  { id: 777001, username: "samarskiyyyy", firstName: "Samarskiy", inTelegram: false, lang: "ru" },
  { id: 777002, username: "Bocha_Bich", firstName: "Bocha", inTelegram: false, lang: "ru" },
];

export function isInTelegram(): boolean {
  return typeof window !== "undefined" && !!window.Telegram?.WebApp?.initDataUnsafe?.user;
}

/** Парсит профиль из initData Telegram WebApp */
export function parseTelegramProfile(): TgUser | null {
  const u = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (!u) return null;
  return {
    id: u.id,
    username: u.username ?? "",
    firstName: u.first_name ?? "Пользователь",
    lastName: u.last_name,
    photoUrl: u.photo_url,
    lang: u.language_code,
    inTelegram: true,
  };
}

export function initTelegram() {
  const wa = window.Telegram?.WebApp;
  if (!wa) return;
  try {
    wa.ready?.();
    wa.expand?.();
    wa.setHeaderColor?.("#050912");
    wa.setBackgroundColor?.("#050912");
  } catch {
    /* noop */
  }
}

export function devUsers() {
  return DEV_USERS;
}
